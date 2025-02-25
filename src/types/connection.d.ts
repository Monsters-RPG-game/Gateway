import type { IUserBrokerInfo } from './user.js';
import type * as types from '../connections/websocket/types/index.js';
import type * as enums from '../enums/index.js';
import type GetMessagesDto from '../modules/messages/subModules/get/dto.js';
import type GetUnreadMessagesDto from '../modules/messages/subModules/getUnread/dto.js';
import type { IGetUnreadMessagesDto } from '../modules/messages/subModules/getUnread/types.js';
import type ReadMessagesDto from '../modules/messages/subModules/read/dto.js';
import type SendMessagesDto from '../modules/messages/subModules/send/dto.js';
import type GetProfileDto from '../modules/profile/subModules/get/dto.js';
import type DebugGetAllUsersDto from '../modules/users/subModules/debug/dto.js';
import type UserDetailsDto from '../modules/users/subModules/details/dto.js';
import type { RegisterRequestDto } from '../modules/users/subModules/finishRegister/dto.js';

export type IRabbitSubTargets =
  | enums.EProfileSubTargets
  | enums.EUserSubTargets
  | enums.EMessagesSubTargets
  | enums.EChatSubTargets;

export interface IProfileConnectionData {
  [enums.EProfileSubTargets.Get]: GetProfileDto;
}

export interface IUserConnectionData {
  [enums.EUserSubTargets.GetName]: UserDetailsDto[];
  [enums.EUserSubTargets.DebugGetAll]: DebugGetAllUsersDto;
  [enums.EUserSubTargets.Register]: RegisterRequestDto;
  [enums.EUserSubTargets.RemoveAccount]: undefined;
}

export interface IMessageConnectionData {
  [enums.EMessagesSubTargets.Get]: GetMessagesDto;
  [enums.EMessagesSubTargets.GetUnread]: GetUnreadMessagesDto;
  [enums.EMessagesSubTargets.Read]: ReadMessagesDto;
  [enums.EMessagesSubTargets.Send]: SendMessagesDto;
}

export interface IChatConnectionData {
  [enums.EChatSubTargets.Get]: types.IGetMessageBody;
  [enums.EChatSubTargets.GetUnread]: IGetUnreadMessagesDto;
  [enums.EChatSubTargets.Read]: types.IReadMessageBody;
  [enums.EChatSubTargets.Send]: types.ISendMessageDto;
}

export interface IRabbitConnectionData
  extends IUserConnectionData,
    IProfileConnectionData,
    IMessageConnectionData,
    IChatConnectionData {}

export type IRabbitTargets = enums.EMessageTypes | enums.EConnectionMainTargets;

export interface IRabbitMessage {
  user: IUserBrokerInfo | undefined;
  target: IRabbitTargets;
  subTarget: IRabbitSubTargets;
  payload: unknown;
}

export type IAvailableServices = Exclude<enums.EServices, enums.EServices.Gateway>;

export type ICommunicationQueue = Record<
  string,
  {
    resolve: (
      value:
        | { type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send; payload: unknown }
        | PromiseLike<{
            type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
            payload: unknown;
          }>,
    ) => void;
    reject: (reason?: unknown) => void;
    target: enums.EServices;
  }
>;
