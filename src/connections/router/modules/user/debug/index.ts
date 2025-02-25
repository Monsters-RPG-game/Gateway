import DebugDto from '../../../../../modules/users/subModules/debug/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IDebugReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type { IUserEntity } from '../../../../../modules/users/entity.js';
import type { IResponse } from '../../../../../types/requests.js';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.Debug> {
  async execute(req: IDebugReq, res: IResponse): Promise<IUserEntity[]> {
    const dto = new DebugDto(req.query);

    return this.controller.execute(dto, res);
  }
}
