import mongoose from 'mongoose';
import Log from 'simpl-loggar';
import getConfig from '../../tools/configLoader.js';
import type { IMongoInstance } from './types.js';
import type { ConnectOptions } from 'mongoose';

class Mongo implements IMongoInstance {
  async init(): Promise<void> {
    Log.debug('Mongo', 'Connecting to mongo');

    await mongoose.connect(getConfig().mongoURL, {
      dbName: 'Gateway',
      serverSelectionTimeoutMS: 5000,
    } as ConnectOptions);
    Log.log('Mongo', 'Connected');
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
    if (!this.instance) process.env.NODE_ENV === 'test' ? await this.createMockServer() : this.createServer();

    return this.instance!;
  }

  @Log.decorateLog('Mongo', 'Started mock server')
  private async createMockServer(): Promise<void> {
    const MockServer = await import('./mock.js');
    this.instance = new MockServer.default();
  }

  @Log.decorateLog('Mongo', 'Started server')
  private createServer(): void {
    this.instance = new Mongo();
  }
}
