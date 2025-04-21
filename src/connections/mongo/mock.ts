import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Log from 'simpl-loggar';
import type { IMongoInstance } from './types.js';

export default class Mock implements IMongoInstance {
  async init(): Promise<void> {
    const server = await MongoMemoryServer.create();
    await mongoose.connect(server.getUri());
  }

  disconnect(): void {
    mongoose.disconnect().catch((err) => {
      Log.error('Mongo', 'Cannot disconnect', (err as Error).message);
    });
  }
}
