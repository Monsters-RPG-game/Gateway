import StartLogoutDto from '../../../../../modules/users/subModules/startLogout/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IStartLogoutReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type express from 'express';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.StartLogout> {
  async execute(req: IStartLogoutReq): Promise<string> {
    const dto = new StartLogoutDto(req.query);

    return this.controller.execute(dto, req as express.Request);
  }
}
