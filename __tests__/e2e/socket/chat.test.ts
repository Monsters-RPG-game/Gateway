import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import FakeSocketServer from '../../utils/mocks/websocket.js'
import { createCookie } from '../../utils/index.js'
import Tokens from '../../utils/tokens.js'
import State from '../../../src/tools/state.js';
import * as enums from '../../../src/enums/index.js';
import { EMessageSubTargets, EMessageTypes } from '../../../src/enums/index.js';
import { ESocketType } from '../../../src/enums/index.js';
import fakeUsers from '../../utils/fakeData/users.json';
import type { ISocketInMessage, ISocketOutMessage } from '../../../src/connections/websocket/types/index.js';
import { FakeBroker } from '../../utils/mocks/index.js';
import { IFullError } from '../../../src/types/index.js';
import { IFullMessageEntity } from '../../../src/modules/messages/entity.js';
import { IUserEntity } from '../../../src/modules/users/entity.js';
import { sleep } from '../../../src/utils/index.js';
import { UnauthorizedError } from '../../../src/errors/index.js';
import MocSocket from 'moc-socket';
import { IClient } from 'moc-socket'
import type { WsProvider } from 'moc-socket';

describe('Socket - chat', () => {
  const fakeBroker = State.broker as FakeBroker;
  let server: WsProvider;
  let client: IClient;
  const fakeUser = fakeUsers.data[0] as IUserEntity;
  const fakeUser2 = fakeUsers.data[1] as IUserEntity;
  let clientOptions: Record<string, unknown>;
  let client2Options: Record<string, unknown>;
  const message: ISocketInMessage = {
    payload: { message: 'asd', target: fakeUser2._id as string },
    subTarget: enums.EMessageSubTargets.Send,
    target: enums.ESocketTargets.Chat,
  };
  const baseMessage: ISocketInMessage = {
    payload: { page: 1 },
    subTarget: EMessageSubTargets.Get,
    target: enums.ESocketTargets.Chat,
  };
  const getMessage = {
    ...baseMessage,
  };
  const getUnread = {
    ...baseMessage,
    subTarget: EMessageSubTargets.GetUnread,
  };
  const readMessage = {
    ...baseMessage,
    subTarget: EMessageSubTargets.Read,
  };
  const getWithDetails = {
    ...baseMessage,
    subTarget: EMessageSubTargets.Get,
  };
  const tokens = new Tokens(fakeUser)
  const tokens2 = new Tokens(fakeUser2)

  beforeAll(async () => {
    const keyId = await tokens.createKey()
    const loginToken1 = await tokens.createAccessToken()
    tokens2.addKey(keyId)
    const loginToken2 = await tokens2.createAccessToken()

    clientOptions = {
      headers: { Cookie: createCookie(enums.ETokens.Access, loginToken1 as string) },
    };
    client2Options = {
      headers: { Cookie: createCookie(enums.ETokens.Access, loginToken2 as string) },
    };

    // I should finally fix this package...
    server = MocSocket.createWsClient((State.socket as FakeSocketServer).server);
    client = server.createClient()
    await client.connect(clientOptions);
  })

  beforeEach(async () => {
    await tokens.initLoginParamsForWebsocket(fakeBroker)
  })

  afterEach(async () => {
    fakeBroker.getStats()
    fakeBroker.clearActions()
  })

  afterAll(async () => {
    await tokens.cleanUp()
    client?.disconnect();
  })

  describe('Should throw', () => {
    describe('Not logged in', () => {
      let client2: IClient;

      beforeAll(() => {
        client2 = server.createClient();
      });

      it(`User not logged in`, async () => {
        await client2.connect(client2Options);
        const target = new UnauthorizedError();

        await sleep(50);
        const [message] = client2.getLastMessages(10, true) as ISocketOutMessage[];
        const { name } = message?.payload as IFullError;
        client2.disconnect();

        expect(name).toEqual(target.name);
      });
    });
  });

  describe('Should pass', () => {
    let client2: IClient;

    beforeAll(async () => (client2 = server.createClient()));

    afterEach(async () => client2.disconnect());

    it(`No messages`, async () => {
      await client2.connect(client2Options);
      const data = await client2.sendAsyncMessage(message, { timeout: 100 });
      expect(data).toEqual(undefined);
      client2.disconnect();
    });

    it(`Get message from db`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: {
            a: [
              {
                sender: fakeUser._id,
                receiver: fakeUser2._id,
                messages: 1,
              },
            ],
          },
          target: EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.Get)

      await client2.connect(client2Options);
      await sleep(200)
      const userMessage = (await client2.sendAsyncMessage(getMessage)) as ISocketOutMessage;

      expect(Object.keys((userMessage?.payload as Record<string, string>) ?? {}).length).toBeGreaterThan(0);
    });

    it(`Read chat`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: {
            a: [
              {
                sender: fakeUser._id,
                receiver: fakeUser2._id,
                messages: 1,
              },
            ],
          },
          target: EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.Get)

      await client2.connect(client2Options);
      await sleep(200)
      const userMessage = (await client2.sendAsyncMessage(getMessage, { timeout: 100 })) as ISocketOutMessage;

      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: {
            id1: [
              {
                sender: fakeUser._id,
                receiver: fakeUser2._id,
                messages: 1,
              },
            ],
          },
          target: EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.Get)

      const userMessage2 = (await client2.sendAsyncMessage(
        {
          ...readMessage,
          payload: {
            chatId: Object.keys((userMessage?.payload as Record<string, string>) ?? {})[0],
            user: fakeUser2._id,
          },
        },
        { timeout: 100 },
      )) as ISocketOutMessage;
      expect(userMessage2?.type).toEqual(ESocketType.Success);

      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: {},
          target: EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.GetUnread)

      const userMessage3 = (await client2.sendAsyncMessage(getUnread, { timeout: 100 })) as ISocketOutMessage;
      expect(Object.keys(userMessage3?.payload as Record<string, string>).length).toEqual(0);
      client2.disconnect();
    });

    it(`Get with details`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: {
            id1: [
              {
                sender: fakeUser._id,
                receiver: fakeUser2._id,
                messages: 1,
              },
            ],
          },
          target: EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.Get)

      await client2.connect(client2Options);
      await sleep(200)
      const userMessage = (await client2.sendAsyncMessage(getMessage, { timeout: 100 })) as ISocketOutMessage;
      expect(Object.keys((userMessage?.payload as Record<string, string>) ?? {}).length).toBeGreaterThan(0);

      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: [
            {
              _id: fakeUser._id,
              login: fakeUser.login,
            },
          ],
          target: enums.EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.Get)

      fakeBroker.addAction({
        shouldFail: false,
        returns: {
          payload: [
            {
              sender: fakeUser._id,
              receiver: fakeUser2._id,
              read: true,
              chatId: 'id1',
              message: 'banana',
            },
          ],
          target: EMessageTypes.Send,
        },
      }, enums.EChatSubTargets.Get)

      const userMessage2 = (await client2.sendAsyncMessage({
        ...getWithDetails,
        payload: { ...getWithDetails.payload, target: Object.keys(userMessage.payload as Record<string, string>)[0] },
      })) as ISocketOutMessage;
      const payload = userMessage2?.payload as IFullMessageEntity[];

      expect(payload.length).toBeGreaterThan(0);
      client2.disconnect();
    });
  });
});
