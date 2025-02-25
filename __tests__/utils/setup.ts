import { afterAll, afterEach, beforeAll } from '@jest/globals';
import Connection from './connection.js';
import State from '../../src/tools/state.js';
import { FakeBroker } from './mocks/index.js';

const connection = new Connection();

beforeAll(async () => await connection.connect());

afterEach(async () => ((State.broker as unknown as FakeBroker).clearActions()))

afterAll(async () => await connection.close());

export default { connection };
