import { jwtVerify, SignJWT, importJWK } from 'jose';
import Log from 'simpl-loggar';
import TokenModel from './model.js';
import AddToken from './repository/add.js';
import TokenRepository from './repository/index.js';
import { EClientGrants, ETTL, ETokenType } from '../../enums/index.js';
import { InternalError, InvalidRequest } from '../../errors/index.js';
import getConfig from '../../tools/configLoader.js';
import State from '../../tools/state.js';
import KeyModel from '../keys/model.js';
import KeyRepository from '../keys/repository/index.js';
import OidcClientModel from '../oidcClients/model.js';
import OidcClientsRepository from '../oidcClients/repository/index.js';
import type { ITokenEntity } from './entity.js';
import type { IIntrospection, ISessionTokenData, ITokenData, IUserServerTokens } from '../../types/index.js';
import type { IKeyEntity } from '../keys/entity.js';
import type { IOidcClientEntity } from '../oidcClients/entity.js';
import type { IUserEntity } from '../users/entity.js';
import { randomUUID, createHash } from 'crypto';

export default class TokensController {
  private readonly _userId: string;
  private readonly _repo: TokenRepository;

  constructor(userId: string) {
    this._userId = userId;
    this._repo = new TokenRepository(TokenModel);
  }

  private get userId(): string {
    return this._userId;
  }

  private get repo(): TokenRepository {
    return this._repo;
  }

  static async getKey(cookie: string): Promise<IKeyEntity> {
    const repo = new KeyRepository(KeyModel);
    const keys = (await repo.getAll()).map((k) => {
      return {
        ...k,
        kid: createHash('sha256').update(JSON.stringify(k)).digest('base64url'),
      };
    });

    const parts = cookie.split('.');
    const header = JSON.parse(Buffer.from(parts[0]!, 'base64').toString('utf8')) as {
      alg: string;
      typ: string;
      kid: string;
    };

    const key = keys.find((k) => k.kid === header.kid);
    if (!key) {
      Log.error('Verify', 'Key not found in keystore. Possibly token expired, or tokens got rotated');
      throw new InvalidRequest();
    }

    return key;
  }

  private async getSigningKey(): Promise<IKeyEntity> {
    const repo = new KeyRepository(KeyModel);
    const keys = (await repo.getAll()).map((k) => {
      return {
        ...k,
        kid: createHash('sha256').update(JSON.stringify(k)).digest('base64url'),
      };
    });

    if (keys.length === 0) {
      Log.error('Tokens controller', 'Missing keys!');
      throw new InternalError();
    }

    return keys.sort((a, b) => {
      const startA = new Date(a.createdAt);
      const startB = new Date(b.createdAt);

      if (startA > startB) return -1;
      if (startB > startA) return 1;
      return 0;
    })[0]!;
  }

  getTokens(): Promise<ITokenEntity | null> {
    return this.repo.getByUserId(this.userId);
  }

  static async validateToken(token: string): Promise<ITokenData> {
    const privateKey = await this.getKey(token);
    const publicKey = await importJWK(privateKey, 'RS256');

    const result = await jwtVerify(token, publicKey);
    const parsed = result.payload as ITokenData;

    if (new Date(parsed.exp * 1000).getTime() - Date.now() < 0) {
      Log.debug('Verify', 'Token expired');
      throw new InvalidRequest();
    }

    const redisTokens = await State.redis.getUserToken(parsed.sub);
    if (!redisTokens.accessToken && !redisTokens.refreshToken) {
      Log.debug('Verify', 'Missing token in redis');
      throw new InvalidRequest();
    }

    return parsed;
  }

  async addToken(tokens: IUserServerTokens): Promise<void> {
    const newToken = new AddToken({
      ttl: tokens.expires_in.toString(),
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId: this.userId,
    });
    await this.repo.add(newToken);
  }

  async removeUserTokens(): Promise<void> {
    const repo = new TokenRepository(TokenModel);
    await repo.removeByUserId(this.userId);
  }

  async checkRefreshToken(refreshToken: string): Promise<IIntrospection | null> {
    const clientRepo = new OidcClientsRepository(OidcClientModel);
    const client = await clientRepo.getByGrant(EClientGrants.AuthorizationCode);
    if (!client) throw new InvalidRequest();

    const body = new URLSearchParams({
      client_id: client.clientId,
      client_secret: client.clientSecret,
      token: refreshToken,
    });

    const res = await fetch(`${getConfig().authorizationInnerAddress}/token/introspection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': getConfig().myAddress,
      },
      body,
    });

    if (!res.ok) {
      Log.debug('Check refreshToken', 'Refresh token expired');
      await this.removeUserTokens();
      return null;
    }

    Log.debug('Check refreshToken', 'Refresh token is still active');
    return (await res.json()) as IIntrospection;
  }

  async createAccessToken(userData: IUserEntity): Promise<string> {
    const payload: ITokenData = {
      sub: userData._id as string,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + ETTL.UserAccessToken * 1000) / 1000),
    };

    const key = await this.getSigningKey();
    const token = await new SignJWT()
      .setProtectedHeader({ alg: 'RS256', kid: key.kid })
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp)
      .setSubject(payload.sub)
      .sign(key);

    await State.redis.removeAccessToken(userData._id as string);
    await State.redis.addAccessToken(userData._id as string, token);

    return token;
  }

  async createRefreshToken(userData: IUserEntity): Promise<string> {
    const payload: ITokenData = {
      sub: userData._id as string,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + ETTL.UserRefreshToken * 1000) / 1000),
    };

    const key = await this.getSigningKey();
    const token = await new SignJWT()
      .setProtectedHeader({ alg: 'RS256', kid: key.kid })
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp)
      .setSubject(payload.sub)
      .sign(key);

    await State.redis.removeRefreshToken(userData._id as string);
    await State.redis.addRefreshToken(userData._id as string, token);

    return token;
  }

  /**
   * Create session stored in redis, which will be used after refresh token dies.
   * @param userData User's information.
   * @param refreshToken User's refresh token.
   * @param ip User's ip.
   * @returns Token's id.
   */
  async createSessionToken(userData: IUserEntity, refreshToken: string, ip: string): Promise<string> {
    const tokenId = randomUUID();

    const refreshTokenData = await this.checkRefreshToken(refreshToken);

    if (!refreshTokenData?.active) {
      Log.debug('Token controller', 'Refresh token is invalid');
      throw new InvalidRequest();
    }

    const payload: ISessionTokenData = {
      sub: userData._id as string,
      iat: Math.floor(Date.now() / 1000),
      exp: refreshTokenData.exp,
      id: tokenId,
      ip: [ip],
    };

    await State.redis.addSessionToken(tokenId, payload, new Date(refreshTokenData.exp * 1000));

    return tokenId;
  }

  async logout(): Promise<void> {
    await State.redis.removeUserTokens(this.userId);
  }

  async logoutOidc(): Promise<string> {
    const userTokens = await this.getTokens();
    const clientRepo = new OidcClientsRepository(OidcClientModel);
    const tokenRepo = new TokenRepository(TokenModel);

    // Get one client - this should probably include some custom logic
    const client = await clientRepo.getByGrant(EClientGrants.AuthorizationCode);
    if (!client) throw new InvalidRequest();

    if (userTokens) {
      await this.revokeToken(userTokens.refreshToken, ETokenType.Refresh, client);
      await this.revokeToken(userTokens.accessToken, ETokenType.Access, client);
    }

    const server = getConfig().authorizationAddress;

    const params = new URLSearchParams({
      post_logout_redirect_uri: client.redirectLogoutUrl,
      client_id: client.clientId,
    }).toString();

    await tokenRepo.removeByUserId(this.userId);

    return `${server}/session/end?${params}`;
  }

  /**
   * Recreate session stored in redis.
   * @param sessionId User's session.
   * @param ip User's ip.
   * @returns Recreated session's id.
   */
  async recreateSessionToken(sessionId: string, ip: string): Promise<string | undefined> {
    const session = await State.redis.getSessionToken(sessionId);
    if (!session) throw new InvalidRequest();

    const userTokens = await this.getTokens();
    if (!userTokens) throw new InvalidRequest();

    const refreshTokenData = await this.checkRefreshToken(userTokens.refreshToken);
    if (!refreshTokenData) throw new InvalidRequest();

    if (refreshTokenData.exp * 1000 - Date.now() <= ETTL.UserRefreshToken * 1000) {
      // Token's live is smaller than local refresh. Do not recreate session for further use. Session should be invalid after this.
      return undefined;
    }

    if (!session.ip.includes(ip)) session.ip.push(ip);

    const tokenId = randomUUID();
    const newSession = { ...session, id: tokenId, iat: Math.floor(Date.now() / 1000) };

    const ttl = await State.redis.getSessionTokenTTL(sessionId);
    await State.redis.removeSessionToken(sessionId);
    await State.redis.removeSessionTokenId(userTokens.userId);
    await State.redis.addSessionToken(tokenId, newSession, new Date(Date.now() + ttl * 1000));

    return tokenId;
  }

  private async revokeToken(token: string, tokenType: ETokenType, client: IOidcClientEntity): Promise<void> {
    const body = new URLSearchParams({
      token,
      type_hint: tokenType,
      client_id: client.clientId,
      client_secret: client.clientSecret,
    });

    const homeUrl = getConfig().myAddress;
    const res = await fetch(`${getConfig().authorizationInnerAddress}/token/revocation`, {
      method: 'POST',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': homeUrl,
      },
    });

    if (res.ok) {
      return;
    }

    Log.debug('Token controller', 'Server did not respond with 200 on token revocation. Token possibly already dead');
  }
}
