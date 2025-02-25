import { describe, expect, it, afterEach } from '@jest/globals';
import supertest from 'supertest';
import fakeUsers from '../../utils/fakeData/users.json'
import State from '../../../src/tools/state.js';
import { FakeBroker } from '../../utils/mocks/index.js';
import { IDebugGetAllUsersDto } from '../../../src/modules/users/subModules/debug/types.js';
import { EUserSubTargets } from '../../../src/enums/target.js';
import { EMessageTypes } from '../../../src/enums/connections.js';
import { IUserEntity } from '../../../src/modules/users/entity';

describe('Debug get all', () => {
  const fakeBroker = State.broker as FakeBroker;
  const getAllUsersDto: IDebugGetAllUsersDto = {
    page: '1'
  }
  const { app } = State.router;

  afterEach(() => {
    fakeBroker.getStats()
  })

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`No data in database`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [], target: EMessageTypes.Send },
      }, EUserSubTargets.DebugGetAll)

        const res = await supertest(app).get(`/user/debug?${new URLSearchParams(getAllUsersDto as Record<string, string>)}`).send();

        expect(res.status).toEqual(204)
      });
    });

    describe('Incorrect data', () => {
      it(`Page is not number or stringified number`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [], target: EMessageTypes.Send },
      }, EUserSubTargets.DebugGetAll)

        const clone = structuredClone(getAllUsersDto);
        clone.page = 'test'

        const res = await supertest(app).get(`/user/debug?${new URLSearchParams(getAllUsersDto as Record<string, string>)}`).send();

        expect(res.status).toEqual(204)
      });
    });
  });

  describe('Should pass', () => {
      it(`Get data`, async () => {
        fakeBroker.addAction({
          shouldFail: false,
          returns: { payload: [fakeUsers.data[0]!], target: EMessageTypes.Send },
        }, EUserSubTargets.DebugGetAll)

        const clone = structuredClone(getAllUsersDto);
        clone.page = 'test'

        const res = await supertest(app).get(`/user/debug?${new URLSearchParams(getAllUsersDto as Record<string, string>)}`).send();
        const body = res.body as { data: IUserEntity[] }

        expect(res.status).toEqual(200)
        expect(body.data.length).toEqual(1)
        expect(body.data[0]!.login).toEqual(fakeUsers.data[0]!.login)
      });
  });
});
