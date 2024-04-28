import { WebSocketServer } from 'ws';
import Router from './router.js';
import * as enums from '../../enums/index.js';
import * as errors from '../../errors/index.js';
import State from '../../state.js';
import ReqHandler from '../../structure/reqHandler.js';
import getConfig from '../../tools/configLoader.js';
import Log from '../../tools/logger/index.js';
import { validateToken } from '../../tools/token.js';
import type * as types from './types/index.js';
import type { ESocketType } from '../../enums/index.js';
import type { IFullError } from '../../types/index.js';
import type { AdapterPayload } from 'oidc-provider';

export default class WebsocketServer {
  protected _server: WebSocketServer | null = null;
  private readonly _router: Router;
  private _users: types.ISocketUser[] = [];
  private _heartbeat: NodeJS.Timer | undefined;

  constructor() {
    this._router = new Router();
  }

  protected get users(): types.ISocketUser[] {
    return this._users;
  }

  protected get server(): WebSocketServer {
    return this._server!;
  }

  protected set server(value: WebSocketServer) {
    this._server = value;
  }

  private get heartbeat(): NodeJS.Timer {
    return this._heartbeat as NodeJS.Timer;
  }

  private set heartbeat(value: NodeJS.Timer) {
    this._heartbeat = value;
  }

  private get router(): Router {
    return this._router;
  }

  init(): void {
    this._server = new WebSocketServer({
      port: getConfig().socketPort,
    });
    Log.log('Socket', `Started socket on port ${getConfig().socketPort}`);
    this.startListeners();
    this.startHeartbeat();
  }

  close(): void {
    if (this.server) {
      this.server.close();
    }
    this.users.forEach((u) => {
      u.clients.forEach((c) => {
        c.close(1000, JSON.stringify(new errors.InternalError()));
        this.userDisconnected(c);
      });
    });
  }

  getServer(): WebSocketServer {
    return this.server;
  }

  startListeners(): void {
    this.server.on('connection', (ws: types.ISocket, req) => {
      this.errorWrapper(() => this.onUserConnected(ws, req.headers.cookie, req.headers.authorization), ws);
    });
    this.server.on('error', (err) => this.handleServerError(err));
    this.server.on('close', () => Log.log('Websocket', 'Server closed'));
  }

  sendToUser(userId: string, payload: unknown, type: ESocketType = enums.ESocketType.ChatMessage): void {
    const formatted: types.ISocketOutMessage = { type, payload };
    const target = this.users.find((e) => {
      return e.userId === userId;
    });

    if (target) target.clients.forEach((c) => c.send(JSON.stringify(formatted)));
  }

  isOnline(user: string): boolean {
    const exist = this.users.find((u) => {
      return u.userId === user;
    });
    return exist !== undefined;
  }

  protected userDisconnected(ws: types.ISocket): void {
    if (!ws.userId) return;
    this._users = this.users.filter((u) => {
      return u.userId !== ws.userId;
    });
  }

  protected onUserConnected(ws: types.ISocket, cookies: string | undefined, header: string | undefined): void {
    this.validateUser(ws, { cookies, header }).catch((err) => {
      Log.error("Couldn't validate user token in websocket", err);
      ws.close(
        1000,
        JSON.stringify({
          type: enums.ESocketType.Error,
          payload: new errors.UnauthorizedError(),
        }),
      );
    });
    this.initializeUser(ws);

    ws.on('message', (message: string) => this.errorWrapper(() => this.handleUserMessage(message, ws), ws));
    ws.on('ping', () => this.errorWrapper(() => this.ping(ws), ws));
    ws.on('pong', () => this.errorWrapper(() => this.pong(ws), ws));
    ws.on('error', (error) => this.router.handleError(error as IFullError, ws));
    ws.on('close', () => this.userDisconnected(ws));
  }

  protected errorWrapper(callback: () => void, ws: types.ISocket): void {
    try {
      callback();
    } catch (err) {
      this.router.handleError(err as IFullError, ws);
    }
  }

  private startHeartbeat(): void {
    this.heartbeat = setInterval(() => {
      this.users.forEach((u) =>
        u.clients.forEach((c) => {
          if (u.retry >= 10) {
            Log.warn('Websocket', `Client ${u.userId} not responding. Disconnecting`);
            this.userDisconnected(c);
          } else {
            u.retry++;
            c.ping();
          }
        }),
      );
    }, 5000);
  }

  private async validateUser(
    ws: types.ISocket,
    auth: {
      cookies: string | undefined;
      header: string | undefined;
    },
  ): Promise<void> {
    const unauthorizedErrorMessage = JSON.stringify({
      type: enums.ESocketType.Error,
      payload: new errors.UnauthorizedError(),
    });
    let access: string | undefined = undefined;

    if (auth.header) {
      const { header } = auth;
      if (header.includes('Bearer')) {
        access = header.split('Bearer')[1]!.trim();
      }
    } else if (auth.cookies) {
      const preparedCookie = auth.cookies
        .split(';')
        .map((e) => e.split('='))
        .find((e) => e[0]!.trim() === 'monsters.uid');

      if (!preparedCookie || preparedCookie.length === 0) {
        ws.close(1000, unauthorizedErrorMessage);
        return;
      }
      access = preparedCookie[1];
    }

    if (!access) {
      ws.close(1000, unauthorizedErrorMessage);
      return;
    }

    const payload = await validateToken(access);

    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testDev') {
      const cachedToken = await State.redis.getOidcHash(`oidc:AccessToken:${payload.jti}`, payload.jti);

      if (!cachedToken) {
        Log.error(
          'User tried to log in using token, which does not exists in redis. Might just expired between validation and redis',
        );
        throw new errors.IncorrectTokenError();
      }
      const t = JSON.parse(cachedToken) as AdapterPayload;
      if (Date.now() - new Date((t.exp as number) * 1000).getTime() > 0) {
        Log.error('User tried to log in using expired token, which for some reason is in redis', {
          token: payload.jti,
        });
        throw new errors.IncorrectTokenError();
      }
    }

    ws.userId = payload.accountId;

    const isAlreadyOnline = this.users.findIndex((u) => {
      return u.userId === payload.accountId;
    });

    // #TODO This is broken and incorrectly sends messages back to user, who is logged in on 2 devices
    if (isAlreadyOnline > -1) {
      this._users[isAlreadyOnline] = {
        ...this.users[isAlreadyOnline],
        userId: this.users[isAlreadyOnline]!.userId,
        clients: [...this.users[isAlreadyOnline]!.clients, ws],
        retry: this.users[isAlreadyOnline]!.retry,
      };
      return;
    }

    this._users.push({ clients: [ws], userId: payload.accountId, retry: 0 });
  }

  private initializeUser(ws: types.ISocket): void {
    ws.reqHandler = new ReqHandler();
  }

  private handleUserMessage(mess: string, ws: types.ISocket): void {
    let message: types.ISocketInMessage = { payload: undefined, subTarget: undefined!, target: undefined! };

    if (mess.toString() === 'ping') return this.pong(ws);

    try {
      message = JSON.parse(mess) as types.ISocketInMessage;
    } catch (err) {
      return this.router.handleError(new errors.IncorrectBodyTypeError(), ws);
    }

    switch (message.target) {
      case enums.ESocketTargets.Chat:
        return this.router.handleChatMessage(message, ws);
      default:
        return this.router.handleError(new errors.IncorrectTargetError(), ws);
    }
  }

  private ping(ws: types.ISocket): void {
    ws.pong();
  }

  private pong(ws: types.ISocket): void {
    const index = this.users.findIndex((u) => u.userId === ws.userId);
    if (index < 0) {
      Log.error('Websocket', 'Received ping from connection, which is not registered in users object');
    } else {
      this.users[index]!.retry = 0;
    }
  }

  private handleServerError(err: Error): void {
    const error = err as IFullError;
    Log.error('Socket', error.message, error.stack);
    this.close();
  }
}
