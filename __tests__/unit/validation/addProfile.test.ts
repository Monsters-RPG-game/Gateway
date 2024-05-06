import { describe, expect, it } from '@jest/globals';
import * as errors from '../../../src/errors';
import { EUserRace } from '../../../src/enums';
import * as types from '../../types';
import AddProfileDto from '../../../src/structure/modules/profile/add/dto';

describe('Profile - add', () => {
  const addProfile: types.IAddProfileDto = {
    race: EUserRace.Elf,
  };

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`Missing race`, () => {
        const clone = structuredClone(addProfile);
        delete clone.race;

        const func = () => new AddProfileDto(clone, 'fakeMap');

        expect(func).toThrow(new errors.MissingArgError('race'));
      });
    });
  });

  describe('Should pass', () => {
    it(`Add profile`, () => {
      const func = () => new AddProfileDto(addProfile, 'fakeMap');
      expect(func).not.toThrow();
    });
  });
});
