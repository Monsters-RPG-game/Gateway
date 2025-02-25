import { describe, expect, it } from '@jest/globals';
import { IFullError } from '../../../src/types/index.js';
import { IDebugGetAllUsersDto } from '../../../src/modules/users/subModules/debug/types.js';
import DebugGetAllUsersDto from '../../../src/modules/users/subModules/debug/dto.js';

describe('Debug get all users', () => {
  const getAllUsersDto: IDebugGetAllUsersDto = {
    page: '2'
  }

  describe('Should throw', () => {
    describe('Incorrect data', () => {
      it(`Page has incorrect type - dto should not throw and default to page = 1`, async () => {
        let error: IFullError | undefined = undefined

        try {
          new DebugGetAllUsersDto(getAllUsersDto)
        } catch (err) {
          error = err as IFullError
        }

        expect(error).toBeUndefined();
      });
    });
  });

  describe('Should pass', () => {
      it(`Pass`, async () => {
        let error: IFullError | undefined = undefined

        try {
          new DebugGetAllUsersDto(getAllUsersDto)
        } catch (err) {
          error = err as IFullError
        }

        expect(error).toBeUndefined();
      });
  });
});
