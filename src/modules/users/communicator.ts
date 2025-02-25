import * as enums from '../../enums/index.js';
import ReqController from '../../tools/abstractions/reqController.js';
import type { IUserEntity } from './entity.js';
import type DebugGetAllUsersDto from './subModules/debug/dto.js';
import type UserDetailsDto from './subModules/details/dto.js';
import type { RegisterRequestDto } from './subModules/finishRegister/dto.js';
import type * as types from '../../types/index.js';

export default class User extends ReqController {
  async getDetails(
    data: UserDetailsDto[],
    userInfo: types.IUserBrokerInfo,
  ): Promise<types.IDataBrokerResponse<IUserEntity[]>> {
    return (await this.sendReq(
      this.service,
      enums.EConnectionMainTargets.User,
      enums.EUserSubTargets.GetName,
      userInfo,
      data,
    )) as types.IDataBrokerResponse<IUserEntity[]>;
  }

  async debugGetAll(
    data: DebugGetAllUsersDto,
    userInfo: types.IUserBrokerInfo,
  ): Promise<types.IDataBrokerResponse<IUserEntity[]>> {
    return (await this.sendReq(
      this.service,
      enums.EConnectionMainTargets.User,
      enums.EUserSubTargets.DebugGetAll,
      userInfo,
      data,
    )) as types.IDataBrokerResponse<IUserEntity[]>;
  }

  async register(data: RegisterRequestDto, userInfo: types.IUserBrokerInfo): Promise<void> {
    await this.sendReq(this.service, enums.EConnectionMainTargets.User, enums.EUserSubTargets.Register, userInfo, data);
  }

  async remove(userInfo: types.IUserBrokerInfo): Promise<void> {
    await this.sendReq(this.service, enums.EConnectionMainTargets.User, enums.EUserSubTargets.RemoveAccount, userInfo);
  }
}
