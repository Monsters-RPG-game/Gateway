import StartRegisterDto from '../../../../../modules/users/subModules/startRegister/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IStartRegisterReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type express from 'express';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.StartRegister> {
  async execute(req: IStartRegisterReq): Promise<string> {
    const dto = new StartRegisterDto(req.query);

    return this.controller.execute(dto, req as express.Request);
  }
}
