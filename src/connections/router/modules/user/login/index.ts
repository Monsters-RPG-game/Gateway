import LoginDto from '../../../../../modules/users/subModules/login/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { ILoginReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type { IResponse } from '../../../../../types/requests.js';
import type express from 'express';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.Login> {
  async execute(
    req: ILoginReq,
    res: IResponse,
  ): Promise<{ url: string; accessToken: string; refreshToken: string; sessionToken: string } | string> {
    const dto = new LoginDto(req.query);

    return this.controller.execute(dto, req as express.Request, res);
  }
}
