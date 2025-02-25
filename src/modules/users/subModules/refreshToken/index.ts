import Log from 'simpl-loggar';
import { ETokens } from '../../../../enums/tokens.js';
import { InvalidRequest } from '../../../../errors/index.js';
import State from '../../../../tools/state.js';
import TokenController from '../../../tokens/index.js';
import UserDetailsDto from '../details/dto.js';
import type { IAbstractSubController } from '../../../../types/abstractions.js';
import type { IResponse } from '../../../../types/requests.js';
import type { IUserEntity } from '../../entity.js';
import type express from 'express';

export default class RefreshTokenController
  implements
    IAbstractSubController<{ sessionToken: string | undefined; refreshToken: string; accessToken: string } | string>
{
  private async getUserData(userId: string, res: IResponse): Promise<IUserEntity> {
    const userData = (
      await res.locals.reqController.user.getDetails([new UserDetailsDto({ id: userId })], {
        userId,
      })
    ).payload[0];

    if (!userData) {
      Log.error('Login - getUserData', `User ${userId} logged in, but there is no data related to him. Error ?`);
      throw new InvalidRequest();
    }

    return userData;
  }

  async execute(
    req: express.Request,
    res: IResponse,
  ): Promise<{ sessionToken: string | undefined; refreshToken: string; accessToken: string } | string> {
    const refreshToken = (req.cookies as Record<string, string>)[ETokens.Refresh];
    const sessionToken = (req.cookies as Record<string, string>)[ETokens.SessionToken];

    if (refreshToken) return this.validateRefreshToken(refreshToken, res);
    if (sessionToken) return this.validateSessionToken(sessionToken, req.ip!, res);

    Log.debug('Refresh token', 'No token provided');
    throw new InvalidRequest();
  }

  private async validateRefreshToken(token: string, res: IResponse): Promise<string> {
    Log.debug('Refresh token - validate refresh token', token);
    const tokenData = await TokenController.validateToken(token);
    const tokenController = new TokenController(tokenData.sub);

    const userData = await this.getUserData(tokenData.sub, res);
    const accessToken = await tokenController.createAccessToken(userData);

    return accessToken;
  }

  private async validateSessionToken(
    token: string,
    ip: string,
    res: IResponse,
  ): Promise<{ sessionToken: string | undefined; refreshToken: string; accessToken: string }> {
    Log.debug('Refresh token - validate session', token);

    const session = await State.redis.getSessionToken(token);
    if (!session) {
      Log.debug('Refresh token', 'No session');
      throw new InvalidRequest();
    }

    if (!session.ip.includes(ip)) {
      Log.debug('Refresh token', 'No client on the list');
      throw new InvalidRequest(); // Assuming that token got stolen instead of simply reauthenticating user. This line will be annoying, but safer.
    }

    const userData = (
      await res.locals.reqController.user.getDetails([new UserDetailsDto({ id: session.sub })], {
        userId: session.sub,
      })
    ).payload[0];

    if (!userData) {
      Log.error(
        'Login - validateSessionToken',
        `User ${session.sub} logged in, but there is no data related to him in users. This might be caused, by preexisting account in authorizations service, but not in users service, or users is down`,
      );
      throw new InvalidRequest();
    }

    const tokenController = new TokenController(session.sub);
    const sessionToken = await tokenController.recreateSessionToken(token, ip);
    const refreshToken = await tokenController.createRefreshToken(userData);
    const accessToken = await tokenController.createAccessToken(userData);

    return { sessionToken, refreshToken, accessToken };
  }
}
