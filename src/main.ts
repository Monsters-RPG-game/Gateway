import Log from 'simpl-loggar';
import Broker from './connections/broker/index.js';
import Mongo from './connections/mongo/index.js';
import Redis from './connections/redis/index.js';
import Router from './connections/router/index.js';
import WebsocketServer from './connections/websocket/index.js';
import Bootstrap from './tools/bootstrap.js';
import Liveness from './tools/liveness.js';
import State from './tools/state.js';
import type { IFullError } from './types/index.js';

class App {
  private _liveness: Liveness | undefined;

  private get liveness(): Liveness | undefined {
    return this._liveness;
  }

  private set liveness(val: Liveness | undefined) {
    this._liveness = val;
  }

  init(): void {
    this.configLogger();
    this.handleInit().catch((err) => {
      const { stack, message } = err as IFullError | Error;
      Log.error('Server', 'Err while initializing app', message, stack);

      this.close();
    });
  }

  @Log.decorateLog('Server', 'App closed')
  private close(): void {
    this.liveness?.close();
    State.kill();
  }

  private configLogger(): void {
    Log.setPrefix('monsters');
  }

  @Log.decorateTime('App initialized')
  private async handleInit(): Promise<void> {
    const controllers = new Bootstrap();
    const router = new Router();
    const broker = new Broker();
    const socket = new WebsocketServer();
    const mongo = new Mongo();
    const redis = new Redis();

    State.controllers = controllers;
    State.router = router;
    State.broker = broker;
    State.socket = socket;
    State.redis = redis;
    State.mongo = mongo;

    controllers.init();
    await broker.init();
    await redis.init();
    await mongo.init();
    router.init();
    socket.init();
    Log.log('Server', 'Server started');

    this.liveness = new Liveness();
    this.liveness.init();

    this.listenForSignals();
  }

  private listenForSignals(): void {
    process.on('SIGTERM', () => {
      Log.log('Server', 'Received signal SIGTERM. Gracefully closing');
      this.close();
    });
    process.on('SIGINT', () => {
      Log.log('Server', 'Received signal SIGINT. Gracefully closing');
      this.close();
    });
  }
}

const app = new App();
app.init();
