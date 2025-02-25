import { describe, expect, it, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import { createCookie } from '../../utils/index.js'
import fakeUsers from '../../utils/fakeData/users.json'
import fakeProfiles from '../../utils/fakeData/profiles.json'
import State from '../../../src/tools/state.js';
import { FakeBroker } from '../../utils/mocks/index.js';
import { IUserDetailsDto } from '../../../src/modules/users/subModules/details/types.js';
import { IFullError } from '../../../src/types/index.js';
import { MissingArgError } from '../../../src/errors/index.js';
import { EMessageTypes, EProfileSubTargets, ETokens, EUserSubTargets } from '../../../src/enums/index.js';
import { IUserEntity } from '../../../src/modules/users/entity';
import mongoose from 'mongoose';
import Tokens from '../../utils/tokens.js'

describe('Get detailed', () => {
  const fakeBroker = State.broker as FakeBroker;
  let userToken: string | null = null
  const getUserDetailsDto: IUserDetailsDto = {
    id: fakeUsers.data[0]!._id,
    name: fakeUsers.data[0]!.login
  }
  const userEntity: IUserEntity = {
    _id: fakeUsers.data[0]!._id as string,
    userId: new mongoose.Types.ObjectId().toString(),
    login: fakeUsers.data[0]!.login,
  }
  const tokens = new Tokens(userEntity)
  const { app } = State.router;

  beforeAll(async () => {
    await tokens.createKey();
    userToken = await tokens.createAccessToken();
  })

  afterEach(() => {
    fakeBroker.getStats()
  })

  afterAll(async () => {
    await tokens.cleanUp();
  })

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`No data provided`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [fakeUsers.data[0] as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName);
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [fakeUsers.data[0] as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName);
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: fakeProfiles.data[0] as Record<string, unknown>, target: EMessageTypes.Send },
      }, EProfileSubTargets.Get);

        const target = new MissingArgError('name');

        const res = await supertest(app)
          .get(`/user/details`)
          .set('Cookie', createCookie(ETokens.Access, userToken!))
          .send();
        const { error } = res.body as { error: IFullError };

        expect(error.message).toEqual(target.message);
        expect(error.code).toEqual(target.code);
        expect(error.code).toEqual(target.code)
        expect(res.status).toEqual(target.status)
      });
    });
  });

  describe('Should pass', () => {
      it(`Get data`, async () => {
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [fakeUsers.data[0] as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: [fakeUsers.data[0] as Record<string, unknown>], target: EMessageTypes.Send },
      }, EUserSubTargets.GetName)
      fakeBroker.addAction({
        shouldFail: false,
        returns: { payload: fakeProfiles.data[0] as Record<string, unknown>, target: EMessageTypes.Send },
      }, EProfileSubTargets.Get)
        fakeBroker.addAction({
          shouldFail: false,
          returns: { payload: [fakeUsers.data[0]!], target: EMessageTypes.Send },
        }, EUserSubTargets.GetName)

        const res = await supertest(app)
        .get(`/user/details?${new URLSearchParams(getUserDetailsDto as Record<string, string>)}`)
        .set('Cookie', createCookie(ETokens.Access, userToken!))
        .send();
        const body = res.body as { data: IUserEntity[] }

        expect(res.status).toEqual(200)
        expect(body.data.length).toEqual(1)
        expect(body.data[0]!.login).toEqual(fakeUsers.data[0]!.login)
      });
  });
});
