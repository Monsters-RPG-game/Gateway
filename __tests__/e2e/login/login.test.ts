import { describe, expect, it, afterEach, afterAll, beforeAll, beforeEach } from '@jest/globals';
import { createCookie } from '../../utils/index.js'
import { IFullError } from '../../../src/types/index.js';
import supertest from 'supertest';
import fakeUsers from '../../utils/fakeData/users.json';
import State from '../../../src/tools/state.js';
import { FakeBroker } from '../../utils/mocks/index.js';
import { NoDataProvidedError, UnauthorizedError } from '../../../src/errors/index.js';
import { ETokens } from '../../../src/enums/tokens.js';
import { IUserEntity } from '../../../src/modules/users/entity.js';
import mongoose from 'mongoose';
import Tokens from '../../utils/tokens.js'

describe('Get profile - validate auth', () => {
  const fakeBroker = State.broker as FakeBroker;
  const { app } = State.router;
  const userEntity: IUserEntity = {
    _id: fakeUsers.data[0]!._id as string,
    userId: new mongoose.Types.ObjectId().toString(),
    login: fakeUsers.data[0]!.login,
  }
  const tokens = new Tokens(userEntity)
  let userToken: string | null = null

  beforeAll(async () => {
    await tokens.createKey();
    userToken = await tokens.createAccessToken();
  })

  beforeEach(async () => {
    await tokens.initLoginParams(fakeBroker);
  })

  afterEach(() => {
    fakeBroker.getStats();
  })

  afterAll(async () => {
    await tokens.cleanUp();
  })

  describe('Should pass', () => {
    it(`User not authorized`, async () => {
      const target = new UnauthorizedError();

      const res = await supertest(app).get(`/profile`).send();
      const {error} = res.body as { error: IFullError };

      expect(error.message).toEqual(target.message);
      expect(error.code).toEqual(target.code);
      expect(error.code).toEqual(target.code);
      expect(res.status).toEqual(target.status);
      });

    it(`No data`, async () => {
      const target = new NoDataProvidedError();

      const res = await supertest(app).get(`/profile`).set('Cookie', createCookie(ETokens.Access, userToken as string)).send();
      const {error} = res.body as { error: IFullError };

      expect(error.message).toEqual(target.message);
      expect(error.code).toEqual(target.code);
      expect(error.code).toEqual(target.code);
      expect(res.status).toEqual(target.status);
    });
  });
});
