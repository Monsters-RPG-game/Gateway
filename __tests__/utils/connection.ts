import State from '../../src/tools/state.js';
import FakeBroker from './mocks/broker.js';
import FakeRedis from './mocks/redis.js';
import Router from '../../src/connections/router/index.js';
import Mongo from '../../src/connections/mongo/index.js';
import Bootstrap from '../../src/tools/bootstrap.js';
import SocketServer from './mocks/websocket.js';

export default class Utils {
  constructor() {
    State.controllers = new Bootstrap()
    State.broker = new FakeBroker();
    State.router = new Router();
    State.mongo = new Mongo()
    State.socket = new SocketServer();
    State.redis = new FakeRedis();
  }

  async connect(): Promise<void> {
    State.controllers.init()
    State.router.init()
    State.socket.init();
    await State.mongo.init()
    await State.redis.init()
  }

  async close(): Promise<void> {
    State.router.close();
    State.socket.close();
  }
}
