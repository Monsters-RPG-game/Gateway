import * as enums from '../../../enums/index.js';
import ReqHandler from '../../../tools/abstracts/reqHandler.js';
import type AddSingleSkillDto from './add/dto.js';
import type AddToProfileDto from './addToProfile/dto.js';
import type { ISingleSkillEntity } from './entity.js';
import type GetSingleSkillDto from './get/dto.js';
import type { IUserBrokerInfo } from '../../../types/index.js';

export default class SingleSkill extends ReqHandler {
  async get(
    data: GetSingleSkillDto,
    userData: IUserBrokerInfo,
  ): Promise<{
    type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
    payload: ISingleSkillEntity;
  }> {
    return (await this.sendReq(
      this.service,
      enums.EUserMainTargets.SingleSkill,
      enums.ESingleSkillTargets.GetSingleSkill,
      userData,
      data,
    )) as {
      type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
      payload: ISingleSkillEntity;
    };
  }

  async add(
    data: AddSingleSkillDto,
    userData: IUserBrokerInfo,
  ): Promise<{
    type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
    payload: ISingleSkillEntity;
  }> {
    return (await this.sendReq(
      this.service,
      enums.EUserMainTargets.SingleSkill,
      enums.ESingleSkillTargets.AddSingleSkill,
      userData,
      data,
    )) as {
      type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
      payload: ISingleSkillEntity;
    };
  }

  async addToProfile(
    data: AddToProfileDto,
    userData: IUserBrokerInfo,
  ): Promise<{
    type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
    payload: ISingleSkillEntity;
  }> {
    return (await this.sendReq(
      this.service,
      enums.EUserMainTargets.SingleSkill,
      enums.ESingleSkillTargets.AddToProfile,
      userData,
      data,
    )) as {
      type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
      payload: ISingleSkillEntity;
    };
  }
}
