import GetProfileDto from '../../../../../modules/profile/subModules/get/dto.js';
import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { IGetProfileReq } from './types.js';
import type { EControllers, EProfileActions } from '../../../../../enums/controllers.js';
import type { IProfileEntity } from '../../../../../modules/profile/entity.js';
import type { IResponse } from '../../../../../types/requests.js';

export default class GetProfileRouter extends AbstractRouter<EControllers.Profile, EProfileActions.Get> {
  async execute(req: IGetProfileReq, res: IResponse): Promise<IProfileEntity | null> {
    const dto = new GetProfileDto(req.query);

    res.locals.logger.createContext({ userId: res.locals.user!.userId, profileName: dto.name });

    return this.controller.execute(dto, res);
  }
}
