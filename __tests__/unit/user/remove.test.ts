import { describe, expect, it } from '@jest/globals';
import * as errors from '../../../src/errors';
import { IRemoveAccountDto } from '../../../src/structure/modules/user/remove/types';
import RemoveUserDto from '../../../src/structure/modules/user/remove/dto';

describe('Fights - attack', () => {
  const data: IRemoveAccountDto = {
    password: 'somepassword',
  };
  const name = 'somename';

  describe('Should throw', () => {
    describe('No data passed', () => {
      it('Missing password', () => {
        const clone = structuredClone(data);
        clone.password = undefined!;
        try {
          new RemoveUserDto(clone, name);
        } catch (error) {
          expect(error).toEqual(new errors.MissingArgError('password'));
        }
      });
      it('Missing id', () => {
        const clone = structuredClone(data);
        const name2 = undefined!;
        try {
          new RemoveUserDto(clone, name2);
        } catch (error) {
          expect(error).toEqual(new errors.MissingArgError('id'));
        }
      });
    });
  });

  describe('Should pass', () => {
    it('Attack', () => {
      const clone = structuredClone(data);
      try {
        new RemoveUserDto(clone, name);
      } catch (err) {
        expect(err).toBeUndefined();
      }
    });
  });
});