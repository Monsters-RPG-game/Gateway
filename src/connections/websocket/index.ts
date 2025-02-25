import Log from 'simpl-loggar';
import { WebSocketServer } from 'ws';
import Router from './router.js';
import * as enums from '../../enums/index.js';
import * as errors from '../../errors/index.js';
import GetProfileDto from '../../modules/profile/subModules/get/dto.js';
import UserDetailsDto from '../../modules/users/subModules/details/dto.js';
import getConfig from '../../tools/configLoader.js';
import State from '../../tools/state.js';
import ReqController from '../router/reqController.js';
import type * as types from './types/index.js';
import type { ESocketType } from '../../enums/index.js';
import type ValidateTokenController from '../../modules/users/subModules/validateToken/index.js';
import type { IFullError } from '../../types/index.js';

export default class WebsocketServer {
  private readonly _router: Router;
  protected _server: WebSocketServer | null = null;

  constructor() {
    this._router = new Router();
  }

  get server(): WebSocketServer {
    return this._server!;
  }

  protected set server(value: WebSocketServer) {
    this._server = value;
  }

  protected accessor users: types.ISocketUser[] = [];
  private accessor heartbeat: NodeJS.Timer | undefined;

  get router(): Router {
    return this._router;
  }

  init(): void {
    this.server = new WebSocketServer({
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

  startListeners(): void {
    this.server.on('connection', (ws: types.ISocket, req) => {
      this.errorWrapper(() => this.onUserConnected(ws, req.headers.cookie), ws);
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

  updateState(userId: string): void {
    const user = this.users.find((u) => u.userId === userId);
    if (user) {
      State.redis
        .getCachedUser(userId)
        .then((cache) => {
          user.clients.forEach((c) => {
            if (cache) c.profile = cache.profile;
          });
        })
        .catch((err) => {
          Log.error('User cache', err);
          throw new Error('Cannot find user cache');
        });
    }
  }

  protected userDisconnected(ws: types.ISocket): void {
    if (!ws.userId) return;
    this.users = this.users.filter((u) => {
      return u.userId !== ws.userId;
    });
  }

  protected onUserConnected(ws: types.ISocket, cookies: string | undefined): void {
    this.preValidateUser(ws, { cookies })
      .then(() => {
        ws.on('message', (message: string) => this.errorWrapper(() => this.handleUserMessage(message, ws), ws));
        ws.on('ping', () => this.errorWrapper(() => this.ping(ws), ws));
        ws.on('pong', () => this.errorWrapper(() => this.pong(ws), ws));
        ws.on('error', (error) => this.router.handleError(error as IFullError, ws));
        ws.on('close', () => this.userDisconnected(ws));
      })
      .catch((err) => {
        Log.error('Websocket', "Couldn't validate user token", (err as Error).message, (err as Error).stack);
        ws.close(
          1000,
          JSON.stringify({
            type: enums.ESocketType.Error,
            payload: new errors.UnauthorizedError(),
          }),
        );
      });
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

  private async preValidateUser(
    ws: types.ISocket,
    auth: {
      cookies: string | undefined;
    },
  ): Promise<void> {
    const unauthorizedErrorMessage = JSON.stringify({
      type: enums.ESocketType.Error,
      payload: new errors.UnauthorizedError(),
    });

    if (!auth.cookies) {
      ws.close(1000, unauthorizedErrorMessage);
      return;
    }

    const preparedCookie = auth.cookies
      .split(';')
      .map((e) => e.split('='))
      .find((e) => (e[0]!.trim() as enums.ETokens) === enums.ETokens.Access);

    if (!preparedCookie || preparedCookie.length === 0) {
      ws.close(1000, unauthorizedErrorMessage);
      return;
    }
    const access = preparedCookie[1];

    if (!access) {
      Log.error('Websocket', 'Client connected without providing login token');
      ws.close(1000, unauthorizedErrorMessage);
      return;
    }

    await this.validateUser(ws, access);
  }

  private async validateUser(ws: types.ISocket, access: string): Promise<void> {
    this.initializeUser(ws);

    const controller = State.controllers.resolve(enums.EControllers.Users);
    if (!controller) throw new errors.UnregisteredControllerError(enums.EControllers.Users);

    const subController = controller.resolve(enums.EUserActions.ValidateToken) as ValidateTokenController;
    if (!subController) throw new errors.UnregisteredControllerError(enums.EUserActions.ValidateToken);

    const { login, userId } = await subController.executeWebsocket(ws, access);

    ws.userId = userId;
    const user = await State.redis.getCachedUser(userId);
    if (user) {
      ws.profile = user.profile;
    } else {
      const account = ((
        await ws.reqController.user.getDetails([new UserDetailsDto({ id: userId })], {
          userId,
        })
      ).payload ?? [])?.[0];
      const profile = (
        await ws.reqController.profile.get(new GetProfileDto({ id: userId }), {
          userId,
        })
      ).payload;

      if (!profile || !account) {
        Log.error(
          'Token validation',
          `User token is valid, but there is no user related to it. This SHOULD NOT have happen and this is CRITICAL error. User sub ${login}`,
        );
        ws.close(
          1000,
          JSON.stringify({
            type: enums.ESocketType.Error,
            payload: new errors.UnauthorizedError(),
          }),
        );
        return;
      }

      await State.redis.addCachedUser({ account, profile });
      ws.profile = profile;
    }

    const isAlreadyOnline = this.users.findIndex((u) => {
      return u.userId === userId;
    });

    // #TODO This is broken and incorrectly sends messages back to user, who is logged in on 2 devices
    if (isAlreadyOnline > -1) {
      this.users[isAlreadyOnline] = {
        ...this.users[isAlreadyOnline],
        userId: this.users[isAlreadyOnline]!.userId,
        clients: [...this.users[isAlreadyOnline]!.clients, ws],
        retry: this.users[isAlreadyOnline]!.retry,
      };
      return;
    }

    this.users.push({ clients: [ws], userId, retry: 0 });
  }

  private initializeUser(ws: types.ISocket): void {
    ws.reqController = new ReqController();
  }

  private handleUserMessage(mess: string, ws: types.ISocket): void {
    let message: Partial<types.ISocketInMessage> = { payload: undefined, subTarget: undefined!, target: undefined! };

    if (mess.toString() === 'ping') return this.pong(ws);

    try {
      message = JSON.parse(mess) as types.ISocketInMessage;
    } catch (_err) {
      return this.router.handleError(new errors.IncorrectBodyTypeError(), ws);
    }

    Log.log('Socket', 'Got new message', message);

    switch (message.target) {
      case enums.ESocketTargets.Chat:
        return this.router.handleChatMessage(message as types.ISocketInMessage, ws);
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
