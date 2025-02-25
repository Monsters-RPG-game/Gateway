import { describe, expect, it } from '@jest/globals';
import { IFullError } from '../../../src/types/index.js';
import fakeUsers from '../../utils/fakeData/users.json';
import { IGetProfileDto } from '../../../src/modules/profile/subModules/get/types.js';
import { NoDataProvidedError } from '../../../src/errors/index.js';
import GetProfileDto from '../../../src/modules/profile/subModules/get/dto.js';

describe('Get profile', () => {
  const getProfileDto: IGetProfileDto = {
    name: fakeUsers.data[0]!.login,
    id: fakeUsers.data[0]!._id
  }

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`No data`, async () => {
        let error: IFullError | undefined = undefined
        const target = new NoDataProvidedError()
        const clone = structuredClone(getProfileDto);

        clone.id = undefined!;
        clone.name = undefined!

        try {
          new GetProfileDto(clone)
        } catch (err) {
          error = err as IFullError
        }

        expect(error!.message).toEqual(target.message);
        expect(error!.code).toEqual(target.code);
        expect(error!.status).toEqual(target.status)
      });
    });
  });

  describe('Should pass', () => {
      it(`Pass`, async () => {
        let error: IFullError | undefined = undefined

        try {
          new GetProfileDto(getProfileDto)
        } catch (err) {
          error = err as IFullError
        }

        expect(error).toBeUndefined();
      });
  });
});
