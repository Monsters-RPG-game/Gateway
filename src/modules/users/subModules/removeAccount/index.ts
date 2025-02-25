import Log from 'simpl-loggar';
import { EClientGrants, ETokens } from '../../../../enums/index.js';
import { InvalidRequest } from '../../../../errors/index.js';
import getConfig from '../../../../tools/configLoader.js';
import TokensController from '../../../tokens/index.js';
import type RemoveAccountDto from './dto.js';
import type ReqController from '../../../../connections/router/reqController.js';
import type { IAbstractSubController } from '../../../../types/abstractions.js';
import type { IResponse } from '../../../../types/requests.js';
import type ClientsRepository from '../../../clients/repository/index.js';
import type OidcClientsRepository from '../../../oidcClients/repository/index.js';
import type express from 'express';

export default class RemoveAccountController implements IAbstractSubController<void> {
  constructor(clientsRepository: ClientsRepository, oidcClientsRepository: OidcClientsRepository) {
    this.oidcClientsRepository = oidcClientsRepository;
    this.clientsRepository = clientsRepository;
  }

  private accessor oidcClientsRepository: OidcClientsRepository;
  private accessor clientsRepository: ClientsRepository;

  async execute(data: RemoveAccountDto, req: express.Request, res: IResponse): Promise<void> {
    const client = await this.clientsRepository.getByName(data.client);
    if (!client) throw new InvalidRequest();

    const cookie = (req.cookies as Record<string, string>)[ETokens.Access];
    Log.debug('Remove account', `User token ${cookie}`);
    if (!cookie) throw new InvalidRequest();

    const user = await TokensController.validateToken(cookie);

    const { reqController } = res.locals;
    await this.remove(new TokensController(user.sub), user.sub, reqController);
  }

  private async remove(tokenController: TokensController, userId: string, reqController: ReqController): Promise<void> {
    const client = await this.oidcClientsRepository.getByGrant(EClientGrants.AuthorizationCode);
    if (!client) throw new InvalidRequest();

    const tokens = await tokenController.getTokens();
    if (!tokens?.refreshToken) return this.removeLocalData(tokenController, userId, reqController);

    const body = JSON.stringify({
      client_id: client.clientId,
      token: tokens.refreshToken,
    });

    const res = await fetch(`${getConfig().authorizationInnerAddress}/interaction/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': getConfig().myAddress,
      },
      body,
    });

    if (!res.ok) {
      Log.error('Logout', 'Error', JSON.stringify(await res.json()));
      throw new InvalidRequest();
    }

    Log.log('Logout', 'Logged out from oidc');
    return this.removeLocalData(tokenController, userId, reqController);
  }

  private async removeLocalData(
    tokenController: TokensController,
    userId: string,
    reqController: ReqController,
  ): Promise<void> {
    await tokenController.removeUserTokens();
    await tokenController.logout();
    await tokenController.removeUserTokens();
    await reqController.user.remove({
      userId,
    });
  }
}
