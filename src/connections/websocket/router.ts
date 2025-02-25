import Log from 'simpl-loggar';
import Validation from './validation.js';
import * as enums from '../../enums/index.js';
import * as errors from '../../errors/index.js';
import State from '../../tools/state.js';
import type * as types from './types/index.js';
import type { IFullError } from '../../types/index.js';

export default class Router {
  private readonly _validator: Validation;

  constructor() {
    this._validator = new Validation();
  }

  private get validator(): Validation {
    return this._validator;
  }

  private getMessage(data: types.IGetMessageBody, ws: types.ISocket): void {
    Log.debug('Websocket', 'Get message', data);
    this.validator.validateGetMessage(data);

    ws.reqController.chat
      .get(data, { userId: ws.userId })
      .then((callback) => {
        ws.send(
          JSON.stringify({
            type: enums.ESocketType.Success,
            payload: callback.payload,
          } as types.ISocketOutMessage),
        );
      })
      .catch((err) => {
        Log.error('Socket get messages error', err);
        ws.send(JSON.stringify({ type: enums.ESocketType.Error, payload: err } as types.ISocketOutMessage));
      });
  }

  private getUnread(data: types.IGetMessageBody, ws: types.ISocket): void {
    Log.debug('Websocket', 'Get unread messages', data);
    this.validator.validateGetMessage(data);

    ws.reqController.chat
      .getUnread(data, { userId: ws.userId })
      .then((callback) => {
        ws.send(
          JSON.stringify({
            type: enums.ESocketType.Success,
            payload: callback.payload,
          } as types.ISocketOutMessage),
        );
      })
      .catch((err) => {
        Log.error('Socket get unread messages error', err);
        ws.send(JSON.stringify({ type: enums.ESocketType.Error, payload: err } as types.ISocketOutMessage));
      });
  }

  handleChatMessage(message: types.ISocketInMessage, ws: types.ISocket): void {
    Log.debug('Websocket', 'New message in handler', message);
    this.validator.preValidate(message);

    switch (message.subTarget) {
      case enums.EMessageSubTargets.Send:
        return this.sendMessage(message.payload as types.ISocketSendMessageBody, ws);
      case enums.EMessageSubTargets.Read:
        return this.readMessage(message.payload as types.IReadMessageBody, ws);
      case enums.EMessageSubTargets.Get:
        return this.getMessage(message.payload as types.IGetMessageBody, ws);
      case enums.EMessageSubTargets.GetUnread:
        return this.getUnread(message.payload as types.IGetMessageBody, ws);
      default:
        return this.handleError(new errors.IncorrectTargetError(), ws);
    }
  }

  handleError(err: IFullError, ws: types.ISocket): void {
    if (process.env.NODE_ENV !== 'production') console.trace(err);
    const { message, code, name } = err;

    const body = JSON.stringify({
      type: enums.ESocketType.Error,
      payload: {
        message,
        code,
        name,
      },
    });
    return ws.send(body);
  }

  private sendMessage(data: types.ISocketSendMessageBody, ws: types.ISocket): void {
    Log.debug('Websocket', 'Send message', data);
    this.validator.validateSendMessage(data);

    const prepared: types.ISendMessageDto = {
      body: data.message,
      receiver: data.target,
      sender: ws.userId,
    };

    ws.reqController.chat
      .send(prepared, { userId: ws.userId })
      .then(() => {
        ws.send(JSON.stringify({ type: enums.ESocketType.Success } as types.ISocketOutMessage));

        const { message, target } = data;
        const isOnline = State.socket.isOnline(target);
        if (isOnline) State.socket.sendToUser(target, message);
      })
      .catch((err) => {
        Log.error('Socket send message error', err);
        ws.send(JSON.stringify({ type: enums.ESocketType.Error, payload: err } as types.ISocketOutMessage));
      });
  }

  private readMessage(data: types.IReadMessageBody, ws: types.ISocket): void {
    Log.debug('Websocket', 'Read message', data);
    this.validator.validateReadMessage(data);

    ws.reqController.chat
      .read(data, { userId: ws.userId })
      .then(() => {
        ws.send(JSON.stringify({ type: enums.ESocketType.Success } as types.ISocketOutMessage));
      })
      .catch((err) => {
        Log.error('Socket read message error', err);
        ws.send(JSON.stringify({ type: enums.ESocketType.Error, payload: err } as types.ISocketOutMessage));
      });
  }
}
