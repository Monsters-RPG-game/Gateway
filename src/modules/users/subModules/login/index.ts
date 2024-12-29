import { jwtVerify } from 'jose';
import Log from 'simpleLogger';
import { EClientGrants } from '../../../../enums/index.js';
import { InvalidRequest } from '../../../../errors/index.js';
import getConfig from '../../../../tools/configLoader.js';
import { generateCodeChallengeFromVerifier, generateCodeVerifier } from '../../../../tools/crypt.js';
import { generateRandomName } from '../../../../utils/index.js';
import TokenController from '../../../tokens/index.js';
import type LoginDto from './dto.js';
import type {
  IUserSession,
  IUserServerTokens,
  IUserAuthorizationsData,
  IAbstractSubController,
} from '../../../../types/index.js';
import type ClientsRepository from '../../../clients/repository/index.js';
import type OidcClientsRepository from '../../../oidcClients/repository/index.js';
import type UsersRepository from '../../repository/index.js';
import type express from 'express';
import type { JWK } from 'jose';
import type mongoose from 'mongoose';

export default class LoginController
  implements
    IAbstractSubController<{ url: string; accessToken: string; refreshToken: string; sessionToken: string } | string>
{
  constructor(
    clientsRepository: ClientsRepository,
    oidcClientsRepository: OidcClientsRepository,
    usersRepository: UsersRepository,
  ) {
    this.clientsRepository = clientsRepository;
    this.oidcClientRepository = oidcClientsRepository;
    this.usersRepository = usersRepository;
  }

  private accessor oidcClientRepository: OidcClientsRepository;
  private accessor clientsRepository: ClientsRepository;
  private accessor usersRepository: UsersRepository;

  async execute(
    data: LoginDto,
    req: express.Request,
  ): Promise<{ url: string; accessToken: string; refreshToken: string; sessionToken: string } | string> {
    if (data.code) {
      const { userId, tokenController, refreshToken } = await this.login(data, req);
      return this.createTokens(userId, tokenController, req, refreshToken);
    }

    return this.sendToLoginPage(data, req);
  }

  private async sendToLoginPage(data: LoginDto, req: express.Request): Promise<string> {
    const client = await this.clientsRepository.getByName(data.client!);
    if (!client) throw new InvalidRequest();

    const timestamp = Math.floor(Date.now() / 1000);
    const randomValue = generateRandomName(30);
    const nonce = `${timestamp}|${randomValue}`;

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallengeFromVerifier(verifier);

    (req.session as IUserSession).nonce = nonce;
    (req.session as IUserSession).client = client.clientId;
    (req.session as IUserSession).verifier = verifier;

    const oidcClient = await this.oidcClientRepository.getByGrant(EClientGrants.AuthorizationCode);

    const params = new URLSearchParams({
      client_id: oidcClient!.clientId,
      redirect_uri: `${getConfig().myAddress}/user/login`,
      nonce,
      response_type: 'code',
      scope: 'openid',
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });

    return `${getConfig().authorizationAddress}/auth?${params.toString()}`;
  }

  private async createTokens(
    userId: string,
    tokenController: TokenController,
    req: express.Request,
    refreshToken: string,
  ): Promise<{ url: string; refreshToken: string; accessToken: string; sessionToken: string }> {
    const userData = await this.usersRepository.getByUserId(userId);

    if (!userData) {
      Log.error('Login', 'User logged in, but there is no data related to him. Error ?');
      throw new InvalidRequest();
    }

    const newRefreshToken = await tokenController.createRefreshToken(userData);
    const accessToken = await tokenController.createAccessToken(userData);
    const sessionToken = await tokenController.createSessionToken(userData, refreshToken, req.ip!);
    const url = await this.createUrl(req);
    return { refreshToken: newRefreshToken, accessToken, sessionToken, url };
  }

  private async login(
    data: LoginDto,
    req: express.Request,
  ): Promise<{ userId: string; tokenController: TokenController; refreshToken: string }> {
    const verifier = (req.session as IUserSession).verifier!;

    delete (req.session as IUserSession).verifier;
    delete (req.session as IUserSession).nonce;

    // Get one client - this should probably include some custom logic
    const oidcClient = await this.oidcClientRepository.getByGrant(EClientGrants.AuthorizationCode);

    Log.debug('Login', 'Oidc client to use', oidcClient);

    if (!oidcClient) throw new InvalidRequest();

    const body = new URLSearchParams({
      client_id: oidcClient.clientId,
      client_secret: oidcClient.clientSecret,
      code: data.code!,
      grant_type: oidcClient.clientGrant,
      redirect_uri: oidcClient.redirectUri,
      code_verifier: verifier,
    });

    Log.debug('Login', 'Sending token req', body.toString());
    const res = await fetch(`${getConfig().authorizationAddress}/token`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': 'http://localhost:5004',
      },
    });

    if (res.ok) {
      return this.saveToken((await res.json()) as IUserServerTokens);
    }

    const err = await res.json();
    Log.error('Login', 'Got error from server', err);
    throw new InvalidRequest();
  }

  private async saveToken(
    tokens: IUserServerTokens,
  ): Promise<{ userId: string; tokenController: TokenController; refreshToken: string }> {
    const userId = await this.decodeIdToken(tokens.id_token);

    const userData = await this.usersRepository.getByUserId(userId);
    if (!userData) {
      Log.error('Login', 'User logged in, but there is no data related to him. Error ?');
      throw new InvalidRequest();
    }

    const tokenController = new TokenController((userData._id as mongoose.Types.ObjectId).toString());

    await tokenController.addToken(tokens);

    return { userId, tokenController, refreshToken: tokens.refresh_token };
  }

  private async fetchCerts(): Promise<JWK[]> {
    const res = await fetch(`${getConfig().authorizationAddress}/certs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:5004',
      },
    });

    if (res.ok) {
      const keys = (await res.json()) as { keys: JWK[] };
      return keys.keys;
    }

    const err = await res.json();
    Log.error('Login', 'Got error while fetching certs', err);
    throw new InvalidRequest();
  }

  private async decodeIdToken(idToken: string): Promise<string> {
    const keystore = await this.fetchCerts();

    const parts = idToken.split('.');
    const header = JSON.parse(Buffer.from(parts[0]!, 'base64').toString('utf8')) as {
      alg: string;
      typ: string;
      kid: string;
    };

    const key = keystore.find((k) => k.kid === header.kid);

    if (!key) {
      Log.error('Login', 'Key not found in keystore. Possibly token expired, or tokens got rotated');
      throw new InvalidRequest();
    }

    const result = await jwtVerify(idToken, key);
    const parsed = result.payload as IUserAuthorizationsData;
    Log.debug('Login', `Decoded id token for ${parsed.login}`);

    return parsed.sub as string;
  }

  private async createUrl(req: express.Request): Promise<string> {
    const client = await this.clientsRepository.getByName((req.session as IUserSession).client!);
    delete (req.session as IUserSession).client;

    return client!.redirectUri;
  }
}