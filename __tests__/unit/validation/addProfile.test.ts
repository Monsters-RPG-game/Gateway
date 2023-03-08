import { describe, expect, it } from '@jest/globals';
import Validation from '../../../src/validation';
import * as types from '../../../src/types';
import * as errors from '../../../src/errors';
import { EUserRace } from '../../../src/enums';

describe('Profile - add', () => {
  const addProfile: types.INewProfileReq = {
    race: EUserRace.Elf,
  };

  describe('Should throw', () => {
    describe('No data passed', () => {
      it(`Missing race`, () => {
        const clone = structuredClone(addProfile);
        delete clone.race;
        const func = () => Validation.validateAddProfile(clone);

        expect(func).toThrow(new errors.NoDataProvided('race'));
      });
    });
  });

  describe('Should pass', () => {
    it(`Validated login`, () => {
      const func = () => Validation.validateAddProfile(addProfile);
      expect(func).not.toThrow();
    });
  });
});
