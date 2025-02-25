import UserDetailsDto from '../../../../../modules/users/subModules/details/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IUserDetailsReq } from './types.js';
import type { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import type { IUserEntity } from '../../../../../modules/users/entity.js';
import type { IResponse } from '../../../../../types/requests.js';

export default class UserRouter extends AbstractRouter<EControllers.Users, EUserActions.Details> {
  async execute(req: IUserDetailsReq, res: IResponse): Promise<IUserEntity[]> {
    const dto = new UserDetailsDto(req.query);

    res.locals.logger.createContext({ id: dto.id, name: dto.name, oidcId: dto.oidcId });

    return this.controller.execute(dto, res);
  }
}
