import { describe, expect, it } from '@jest/globals';
import fakeUsers from '../../../utils/fakeData/users.json'
import { IDebugGetAllUsersDto } from '../../../../src/modules/users/subModules/debug/types.js';
import ReqController from '../../../../src/connections/router/reqController.js';
import DebugGetAllUsersDto from '../../../../src/modules/users/subModules/debug/dto';

describe('User - debug get all', () => {
  const reqController = new ReqController()
  const req: IDebugGetAllUsersDto = {
    page: '1'
  }

  describe('Should pass', () => {
    it(`Get data`, async () => {
      const res = await reqController.user.debugGetAll(new DebugGetAllUsersDto(req), { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["_id", "login"];

      expect(res.payload.length).toEqual(fakeUsers.data.length)
      Object.keys(res.payload[0]!).forEach(k => {
        expect(targetKeys.includes(k)).toBeTruthy()
      })
      targetKeys.forEach(k => {
        expect(Object.keys(res.payload[0]!).includes(k)).toBeTruthy()
      })
    });
  });
});
