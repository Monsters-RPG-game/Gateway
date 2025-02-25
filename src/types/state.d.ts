import type Broker from '../connections/broker/index.js';
import type Mongo from '../connections/mongo/index.js';
import type Redis from '../connections/redis/index.js';
import type Router from '../connections/router/index.js';
import type WebsocketServer from '../connections/websocket/index.js';

export interface IState {
  broker: Broker;
  mongo: Mongo;
  socket: WebsocketServer;
  router: Router;
  redis: Redis;
}
