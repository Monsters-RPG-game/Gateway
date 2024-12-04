import { beforeAll, afterEach, describe, expect, it } from '@jest/globals';
import supertest from 'supertest';
import * as enums from '../../../src/enums/index.js';
import * as errors from '../../../src/errors/index.js';
import State from '../../../src/state.js';
import { IGetFightLogsDto } from '../../../src/modules/fights/getLogs/types.js';
import { IUserEntity } from '../../../src/modules/user/entity.js';
import type { IFullError } from '../../../src/types/index.js';
import fakeUsers from '../../utils/fakeData/users.json';
import fakeProfiles from '../../utils/fakeData/profiles.json'
import { IFakeOidcKey, IProfileEntity } from '../../types/index.js';
import { fakeAccessToken } from '../../utils/index.js';
import { FakeBroker } from '../../utils/mocks/index.js';

describe('Fights-getLogs', () => {
  const fakeBroker = State.broker as FakeBroker;
  const fakeUser = fakeUsers.data[0] as IUserEntity;
  const fakeProfile = {
    ...fakeProfiles.data[0],
    initialized: true,
    skills: "63e55edbe8a800060941121d",
    state: enums.ECharacterState.Fight,
  } as IProfileEntity;
  let accessToken: IFakeOidcKey;
  const { app } = State.router;

  const data: IGetFightLogsDto = {
    id: '63e55edbe8a800060941127d',
  };

  beforeAll(async () => {
    accessToken = fakeAccessToken(fakeUser._id, 1);
    await State.redis.addCachedUser({ account: fakeUser, profile: fakeProfile });
    await State.redis.addOidc(accessToken.key, accessToken.key, accessToken.body);
  });

  afterEach(() => {
    fakeBroker.getStats()
  })

  describe('should throw', () => {
    describe('No data passed', () => {
      it('missing id', async () => {
        const target = new errors.MissingArgError('id') as unknown as Record<string, unknown>;
        fakeBroker.addAction({
          shouldFail: true,
          returns: { payload: target, target: enums.EMessageTypes.Send },
        }, enums.EFightsTargets.GetLogs)

        const res = await supertest(app)
          .get('/fights/logs')
          .auth(accessToken.key, { type: 'bearer' })
          .query({ id: undefined })
          .send();
        const body = res.body as { error: IFullError };

        expect(body.error.message).toEqual(target.message);
      });
    });
  });

  describe('should pass', () => {
    it('getLogs', async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [], target: enums.EMessageTypes.Send },
      }, enums.EFightsTargets.GetLogs)
      const res = await supertest(app).get('/fights/logs').auth(accessToken.key, { type: 'bearer' }).query(data);

      expect(res.status).toEqual(200);
    });
  });
});
