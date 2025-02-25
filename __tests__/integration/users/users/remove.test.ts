import { describe, expect, it } from '@jest/globals';
import fakeUsers from '../../../utils/fakeData/users.json'
import ReqController from '../../../../src/connections/router/reqController.js';
import { IFullError } from '../../../../src/types';

describe('User - remove', () => {
  const reqController = new ReqController()

  describe('Should pass', () => {
    it(`Remove account`, async () => {
      let error: IFullError | undefined = undefined

      try {
        await reqController.user.remove({ userId: fakeUsers.data[0]!.userId })
      } catch (err) {
        error = err as IFullError
      }

      expect(error).toBeUndefined()
    });
  });
});
