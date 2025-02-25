import { describe, expect, it } from '@jest/globals';
import { IFullError } from '../../../src/types/index.js';
import { IUserDetailsDto } from '../../../src/modules/users/subModules/details/types.js';
import fakeUsers from '../../utils/fakeData/users.json'
import UserDetailsDto from '../../../src/modules/users/subModules/details/dto.js';
import { MissingArgError } from '../../../src/errors/index.js';

describe('Get detailed user', () => {
  const getUserDetailsDto: IUserDetailsDto = {
    id: fakeUsers.data[0]!._id,
    name: fakeUsers.data[0]!.login
  }

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`No data passed`, async () => {
        const target = new MissingArgError('name')
        let error: IFullError | undefined = undefined
        const clone = structuredClone(getUserDetailsDto)

        clone.id = undefined!
        clone.name = undefined!

        try {
          new UserDetailsDto(clone)
        } catch (err) {
          error = err as IFullError
        }

        expect(error!.message).toEqual(target.message);
        expect(error!.code).toEqual(target.code);
        expect(error!.code).toEqual(target.code)
      });
    });
  });

  describe('Should pass', () => {
      it(`Pass`, async () => {
        let error: IFullError | undefined = undefined

        try {
          new UserDetailsDto(getUserDetailsDto)
        } catch (err) {
          error = err as IFullError
        }

        expect(error).toBeUndefined();
      });
  });
});
