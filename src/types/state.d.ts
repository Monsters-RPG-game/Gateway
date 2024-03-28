import type Broker from '../broker';
import type Mysql from '../connections/mysql';
import type Redis from '../connections/redis';
import type WebsocketServer from '../connections/websocket';
import type Router from '../structure';
import type { JSONWebKey } from 'jose';

export interface IState {
  broker: Broker;
  socket: WebsocketServer;
  router: Router;
  redis: Redis;
  mysql: Mysql;
  keys: JSONWebKey[];
}

export interface IConfigInterface {
  amqpURI: string;
  corsOrigin: string | string[];
  myAddress: string;
  httpPort: number;
  socketPort: number;
  redisURI: string;
  mysql: {
    user: string;
    password: string;
    host: string;
    db: string;
    port: number;
  };
  session: {
    secret: string;
    secured: boolean;
  };
}
