import * as enums from '../../enums/index.js';
import ReqHandler from '../../tools//abstractions/reqController.js';
import type { IPreparedMessagesBody } from './types.js';
import type * as types from '../../connections/websocket/types/index.js';
import type { IDataBrokerResponse } from '../../types/responses.js';
import type { IUserBrokerInfo } from '../../types/user.js';
import type { IGetUnreadMessagesDto, IUnreadMessage } from '../messages/subModules/getUnread/types.js';

export default class Chat extends ReqHandler {
  async getUnread(
    data: IGetUnreadMessagesDto,
    locals: IUserBrokerInfo,
  ): Promise<IDataBrokerResponse<IUnreadMessage[]>> {
    return (await this.sendReq(
      this.service,
      enums.EConnectionMainTargets.Message,
      enums.EChatSubTargets.GetUnread,
      locals,
      data,
    )) as IDataBrokerResponse<IUnreadMessage[]>;
  }

  async send(data: types.ISendMessageDto, locals: IUserBrokerInfo): Promise<void> {
    await this.sendReq(this.service, enums.EConnectionMainTargets.Chat, enums.EChatSubTargets.Send, locals, data);
  }

  async read(data: types.IReadMessageBody, locals: IUserBrokerInfo): Promise<void> {
    await this.sendReq(this.service, enums.EConnectionMainTargets.Chat, enums.EChatSubTargets.Read, locals, data);
  }

  async get(
    data: types.IGetMessageBody,
    locals: IUserBrokerInfo,
  ): Promise<IDataBrokerResponse<Record<string, IPreparedMessagesBody> | types.IFullChatMessageEntity[]>> {
    return (await this.sendReq(
      this.service,
      enums.EConnectionMainTargets.Message,
      enums.EChatSubTargets.Get,
      locals,
      data,
    )) as IDataBrokerResponse<Record<string, IPreparedMessagesBody> | types.IFullChatMessageEntity[]>;
  }
}
