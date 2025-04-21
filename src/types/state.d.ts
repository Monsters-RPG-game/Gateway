import type Broker from '../connections/broker/index.js';
import type Redis from '../connections/redis/index.js';
import type Router from '../connections/router/index.js';
import type WebsocketServer from '../connections/websocket/index.js';
import type { IMongoInstance } from 'connections/mongo/types.js';

export interface IState {
  broker: Broker;
  mongo: IMongoInstance;
  socket: WebsocketServer;
  router: Router;
  redis: Redis;
}
