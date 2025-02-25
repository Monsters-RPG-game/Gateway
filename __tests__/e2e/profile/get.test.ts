import { describe, expect, it, afterEach, beforeAll, beforeEach, afterAll } from '@jest/globals';
import { createCookie } from '../../utils/index.js'
import { IFullError } from '../../../src/types/index.js';
import supertest from 'supertest';
import fakeUsers from '../../utils/fakeData/users.json';
import fakeProfiles from '../../utils/fakeData/profiles.json'
import State from '../../../src/tools/state.js';
import { FakeBroker } from '../../utils/mocks/index.js';
import { NoDataProvidedError, UnauthorizedError } from '../../../src/errors/index.js';
import { ETokens } from '../../../src/enums/tokens.js';
import { IUserEntity } from '../../../src/modules/users/entity.js';
import mongoose from 'mongoose';
import { IGetProfileDto } from '../../../src/modules/profile/subModules/get/types.js';
import { IProfileEntity } from '../../../src/modules/profile/entity.js';
import Tokens from '../../utils/tokens.js'

describe('Get profile', () => {
  const userEntity: IUserEntity = {
    _id: fakeUsers.data[0]!._id as string,
    userId: new mongoose.Types.ObjectId().toString(),
    login: fakeUsers.data[0]!.login,
  }
  const tokens = new Tokens(userEntity)
  const fakeBroker = State.broker as FakeBroker;
  const { app } = State.router;
  let userToken: string | null = null

  const getProfileDto: IGetProfileDto = {
    name: fakeUsers.data[0]!.login,
    id: fakeUsers.data[0]!._id
  }

  beforeAll(async () => {
    await tokens.createKey()
    userToken = await tokens.createAccessToken()
  })

  beforeEach(async () => {
    await tokens.initLoginParams(fakeBroker)
  })

  afterEach(async () => {
    fakeBroker.getStats()
  })

  afterAll(async () => {
    await tokens.cleanUp()
  })

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`User not authorized`, async () => {
        const target = new UnauthorizedError()

        const res = await supertest(app).get(`/profile`).send();
        const {error} = res.body as { error: IFullError };

        expect(error.message).toEqual(target.message);
        expect(error.code).toEqual(target.code);
        expect(error.code).toEqual(target.code)
        expect(res.status).toEqual(target.status)
      });

      it(`No data`, async () => {
        const target = new NoDataProvidedError()

        const res = await supertest(app).get(`/profile`).set('Cookie', createCookie(ETokens.Access, userToken as string)).send();
        const {error} = res.body as { error: IFullError };

        expect(error.message).toEqual(target.message);
        expect(error.code).toEqual(target.code);
        expect(error.code).toEqual(target.code)
        expect(res.status).toEqual(target.status)
      });
    });

    describe('Incorrect data', () => {
     it(`Missing id - no data in database`, async () => {
       const clone = structuredClone(getProfileDto);
       clone.id = undefined!
       clone.name = 'test' // Make name differ between original query and this

       const res = await supertest(app).get(`/profile?${new URLSearchParams(clone as Record<string, string>)}`).set('Cookie', createCookie(ETokens.Access, userToken as string)).send();

       expect(res.status).toEqual(204)
     });

     it(`Missing name - no data in database`, async () => {
       const clone = structuredClone(getProfileDto);
       clone.name = undefined!

       const res = await supertest(app).get(`/profile?${new URLSearchParams(clone as Record<string, string>)}`).set('Cookie', createCookie(ETokens.Access, userToken as string)).send();

       expect(res.status).toEqual(204)
     });
    });
  });

  describe('Should pass', () => {
   it(`Validated register`, async () => {
     const res = await supertest(app)
       .get(`/profile?${new URLSearchParams(getProfileDto as Record<string, string>)}`)
        .set('Cookie', createCookie(ETokens.Access, userToken as string))
        .send();

     const { data } = res.body as { data: IProfileEntity }

     expect(data._id).toEqual(fakeProfiles.data[0]!._id);
     expect(data.user).toEqual(fakeProfiles.data[0]!.user);
   });
  });
});
