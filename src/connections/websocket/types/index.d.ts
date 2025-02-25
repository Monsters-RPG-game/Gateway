import type ReqController from '../../../connections/router/reqController.js';
import type * as enums from '../../../enums/index.js';
import type { IProfileEntity } from '../../../modules/profile/entity.js';
import type { WebSocket } from 'ws';

export interface ISendMessageDto {
  body: string;
  receiver: string;
  sender: string;
}

export interface ISocketSendMessageBody {
  target: string;
  message: string;
}

export interface IReadMessageBody {
  chatId: string;
  user: string;
}

export interface IGetDetailedBody {
  page: number;
  target: string;
}

export interface IGetMessageBody {
  page: number;
}

export interface ISocketPayload {
  [enums.EMessageSubTargets.Send]: ISocketSendMessageBody;
  [enums.EMessageSubTargets.Get]: IGetMessageBody;
  [enums.EMessageSubTargets.Read]: IReadMessageBody;
  [enums.EMessageSubTargets.GetUnread]: IGetMessageBody;
}

export interface ISocket extends WebSocket {
  userId: string;
  reqController: ReqController;
  profile: IProfileEntity | undefined;
}

export interface ISocketSubTargets {
  [enums.ESocketTargets.Chat]: enums.EMessageSubTargets;
}

export interface ISocketInMessage {
  target: enums.ESocketTargets;
  subTarget: ISocketSubTargets[enums.ESocketTargets];
  payload: ISocketPayload[enums.EMessageSubTargets];
}

export interface ISocketUser {
  clients: ISocket[];
  userId: string;
  retry: number;
}

export interface ISocketOutMessage {
  type: enums.ESocketType;
  payload: unknown;
  state?: Partial<IProfileEntity>;
}

export interface IFullChatMessageEntity {
  sender: string;
  receiver: string;
  read: boolean;
  chatId: string;
  message: string;
}
