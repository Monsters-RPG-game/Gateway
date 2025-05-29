import mongoose from 'mongoose';
import Log from 'simpl-loggar';
import getConfig from '../../tools/configLoader.js';
import State from '../../tools/state.js';
import type { IMongoInstance } from './types.js';
import type { ConnectOptions } from 'mongoose';

class Mongo implements IMongoInstance {
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      Log.debug('Mongo', 'Connecting to mongo');

      mongoose
        .connect(getConfig().mongoURL, {
          dbName: 'Gateway',
          serverSelectionTimeoutMS: 5000,
        } as ConnectOptions)
        .then(() => {
          Log.debug('Mongo', 'Instance connected');
        })
        .catch((err) => {
          Log.debug('Mongo', 'Instance connection failed');
          reject(new Error((err as Error).message));
        });

      mongoose.connection.on('connected', () => {
        Log.log('Mongo', 'Connected');
        resolve();
      });
      mongoose.connection.on('disconnected', () => Log.error('Mongo', 'Disconnected'));
      mongoose.connection.on('reconnected', () => Log.warn('Mongo', 'Reconnected'));
      mongoose.connection.on('error', (err) => {
        Log.error('Mongo connection error', err);
        // Kill application on any kind of connection error
        State.kill();
      });
    });
  }

  disconnect(): void {
    mongoose.disconnect().catch((err) => {
      Log.error('Mongo', 'Cannot disconnect', (err as Error).message);
    });
  }
}

export default class MongoFactory {
  private accessor instance: IMongoInstance | undefined = undefined;

  async create(): Promise<IMongoInstance> {
    if (!this.instance) process.env.NODE_ENV === 'test' ? await this.createMockServer() : await this.createServer();

    return this.instance!;
  }

  @Log.decorateLog('Mongo', 'Started mock server')
  private async createMockServer(): Promise<void> {
    const MockServer = await import('./mock.js');
    this.instance = new MockServer.default();
  }

  private async createServer(): Promise<void> {
    this.instance = new Mongo();
    await this.instance.init();
  }
}
