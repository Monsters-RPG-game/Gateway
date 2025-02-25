import FinishRegisterDto from '../../../../../modules/users/subModules/finishRegister/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IFinishRegisterReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type { IResponse } from '../../../../../types/requests.js';
import type express from 'express';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.FinishRegister> {
  async execute(req: IFinishRegisterReq, res: IResponse): Promise<string> {
    const dto = new FinishRegisterDto(req.query);

    return this.controller.execute(dto, req as express.Request, res);
  }
}
