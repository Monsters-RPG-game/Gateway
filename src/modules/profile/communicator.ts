import * as enums from '../../enums/index.js';
import ReqController from '../../tools/abstractions/reqController.js';
import type { IProfileEntity } from './entity.js';
import type { IDataBrokerResponse, IUserBrokerInfo } from '../../types/index.js';
import type GetProfileDto from './subModules/get/dto.js';

export default class Profile extends ReqController {
  async get(data: GetProfileDto, userData: IUserBrokerInfo): Promise<IDataBrokerResponse<IProfileEntity | null>> {
    return (await this.sendReq(
      this.service,
      enums.EConnectionMainTargets.Profile,
      enums.EProfileSubTargets.Get,
      userData,
      data,
    )) as IDataBrokerResponse<IProfileEntity | null>;
  }
}
