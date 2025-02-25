import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type { IResponse } from '../../../../../types/requests.js';
import type express from 'express';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.RefreshToken> {
  async execute(
    req: express.Request,
    res: IResponse,
  ): Promise<{ sessionToken: string | undefined; refreshToken: string; accessToken: string } | string> {
    return this.controller.execute(req, res);
  }
}
