import WebsocketServer from '../../../src/connections/websocket/index.js';
import Log from 'simpl-loggar'
import { WebSocketServer } from 'ws';
import * as errors from '../../../src/errors/index.js';
import type * as types from '../../../src/connections/websocket/types/index.js';

export default class SocketServer extends WebsocketServer {
  override get server(): WebSocketServer {
    return this._server!;
  }

  override init(): void {
    this._server = new WebSocketServer({
      noServer: true,
    });
    this.startListeners();
  }

  override close(): void {
    this.server.close();

    this.users.forEach((u) => {
      u.clients.forEach((c) => {
        c.close(1000, JSON.stringify(new errors.InternalError()));
        this.userDisconnected(c);
      });
    });
  }

  override startListeners(): void {
    this.server.on('connection', (ws: types.ISocket, req) => {
      Log.debug("Fake socket", 'New client connected')
      this.errorWrapper(() => this.onUserConnected(ws, req.headers.cookie), ws);
    });
  }
}
