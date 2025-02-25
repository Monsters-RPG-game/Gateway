import Log from 'simpl-loggar';
import { ETokens } from '../../../../enums/tokens.js';
import { InvalidRequest, NoUserWithProvidedName } from '../../../../errors/index.js';
import TokenController from '../../../tokens/index.js';
import UserDetailsDto from '../details/dto.js';
import type ReqController from '../../../../connections/router/reqController.js';
import type { ISocket } from '../../../../connections/websocket/types/index.js';
import type { IAbstractSubController, IIntrospection, IResponse } from '../../../../types/index.js';
import type express from 'express';

export default class ValidateTokenController
  implements IAbstractSubController<{ login: string; tokenTTL: string; realTokenTTL: string }>
{
  async execute(
    req: express.Request,
    res: IResponse,
  ): Promise<{ login: string; tokenTTL: string; realTokenTTL: string; userId: string }> {
    const cookie = (req.cookies as Record<string, string>)[ETokens.Access];
    Log.debug('Verify - express', `User token ${cookie}`);
    if (!cookie) throw new InvalidRequest();

    return this.validate(res.locals.reqController, cookie);
  }

  async executeWebsocket(
    ws: ISocket,
    cookie: string,
  ): Promise<{ login: string; tokenTTL: string; realTokenTTL: string; userId: string }> {
    Log.debug('Verify - socket', `User token ${cookie}`);
    if (!cookie) throw new InvalidRequest();

    return this.validate(ws.reqController, cookie);
  }

  private async validate(
    reqController: ReqController,
    cookie: string,
  ): Promise<{ login: string; tokenTTL: string; realTokenTTL: string; userId: string }> {
    const tokenData = await TokenController.validateToken(cookie);

    const user = (
      await reqController.user.getDetails([new UserDetailsDto({ id: tokenData.sub })], {
        userId: undefined,
      })
    ).payload[0];

    if (!user) {
      Log.error(
        'Token validation',
        `User token is valid, but there is no user related to it. This SHOULD NOT have happen and this is CRITICAL error. User sub ${tokenData.sub}`,
      );
      throw new NoUserWithProvidedName();
    }

    const tokenController = new TokenController(tokenData.sub);

    const userTokens = await tokenController.getTokens();
    let refreshTokenData: IIntrospection | null = null;

    if (userTokens) {
      refreshTokenData = await tokenController.checkRefreshToken(userTokens?.refreshToken);
    }

    return {
      login: user.login,
      tokenTTL: new Date(tokenData.exp * 1000).toString(),
      realTokenTTL: refreshTokenData?.active ? new Date(refreshTokenData.exp * 1000).toString() : 'Dead',
      userId: tokenData.sub,
    };
  }
}
