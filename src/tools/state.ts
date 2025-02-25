import Log from 'simpl-loggar';
import type Bootstrap from './bootstrap.js';
import type Broker from '../connections/broker/index.js';
import type Mongo from '../connections/mongo/index.js';
import type Redis from '../connections/redis/index.js';
import type Router from '../connections/router/index.js';
import type WebsocketServer from '../connections/websocket/index.js';
import type { IState } from '../types/index.js';

class State implements IState {
  private _router: Router | null = null;
  private _alive: boolean = false;
  private _mongo: Mongo | null = null;
  private _controllers: Bootstrap | null = null;
  private _redis: Redis | null = null;
  private _broker: Broker | null = null;
  private _socket: WebsocketServer | null = null;

  get broker(): Broker {
    return this._broker as Broker;
  }

  set broker(value: Broker) {
    this._broker = value;
  }

  get socket(): WebsocketServer {
    return this._socket as WebsocketServer;
  }

  set socket(value: WebsocketServer) {
    this._socket = value;
  }

  get router(): Router {
    return this._router as Router;
  }

  set router(value: Router) {
    this._router = value;
  }

  get alive(): boolean {
    return this._alive;
  }

  set alive(val: boolean) {
    this._alive = val;
  }

  get mongo(): Mongo {
    return this._mongo!;
  }

  set mongo(value: Mongo) {
    this._mongo = value;
  }

  get redis(): Redis {
    return this._redis!;
  }

  set redis(value: Redis) {
    this._redis = value;
  }

  get controllers(): Bootstrap {
    return this._controllers!;
  }

  set controllers(val: Bootstrap) {
    this._controllers = val;
  }

  @Log.decorateSyncLog('Statet', 'Application closed')
  kill(): void {
    this.alive = false;

    this.router.close();
    this.mongo.disconnect();
    this.broker.close();
    this.controllers.close();
    this.socket.close();
    this.redis.close();
  }
}

export default new State();
