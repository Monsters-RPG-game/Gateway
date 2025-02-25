import RemoveAccountDto from '../../../../../modules/users/subModules/removeAccount/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IRemoveAccountReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type { IResponse } from '../../../../../types/requests.js';
import type express from 'express';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.RemoveAccount> {
  async execute(req: IRemoveAccountReq, res: IResponse): Promise<void> {
    const dto = new RemoveAccountDto(req.query);

    return this.controller.execute(dto, req as express.Request, res);
  }
}
