import { afterAll, beforeAll } from '@jest/globals';
import State from '../../src/tools/state.js';
import Broker from '../../src/connections/broker/index.js';
import { sleep } from '../../src/utils/index.js';

beforeAll(async () => {
  const rabbit = new Broker()

  State.broker = rabbit

  await rabbit.init()
  await sleep(500) // Small timeout for rabbit to connect all services
});

afterAll(() => {
  State.broker.close()
});
