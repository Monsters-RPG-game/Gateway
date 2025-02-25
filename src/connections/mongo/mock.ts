import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Log from 'simpl-loggar';

export default class Mock {
  @Log.decorateLog('Mongo', 'Started mock server')
  async init(): Promise<void> {
    const server = await MongoMemoryServer.create();
    await mongoose.connect(server.getUri());
  }
}
