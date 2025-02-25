import { describe, expect, it } from '@jest/globals';
import fakeUsers from '../../../utils/fakeData/users.json'
import ReqController from '../../../../src/connections/router/reqController.js';
import { IUserDetailsDto } from '../../../../src/modules/users/subModules/details/types';
import UserDetailsDto from '../../../../src/modules/users/subModules/details/dto';

describe('User - get detailed', () => {
  const reqController = new ReqController()
  const req: IUserDetailsDto = {
    id: fakeUsers.data[0]!._id,
    name: fakeUsers.data[0]!.login
  }

  describe('Should pass', () => {
    it(`Get data by id`, async () => {
      const clone = structuredClone(req)
      delete clone.name

      const res = await reqController.user.getDetails([new UserDetailsDto(clone)], { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["_id", "login"];

      expect(res.payload.length).toEqual(1)
      Object.keys(res.payload[0]!).forEach(k => {
        expect(targetKeys.includes(k)).toBeTruthy()
      })
      targetKeys.forEach(k => {
        expect(Object.keys(res.payload[0]!).includes(k)).toBeTruthy()
      })
    });

    it(`Get data by login`, async () => {
      const clone = structuredClone(req)
      delete clone.id

      const res = await reqController.user.getDetails([new UserDetailsDto(clone)], { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["_id", "login"];

      expect(res.payload.length).toEqual(1)
      Object.keys(res.payload[0]!).forEach(k => {
        expect(targetKeys.includes(k)).toBeTruthy()
      })
      targetKeys.forEach(k => {
        expect(Object.keys(res.payload[0]!).includes(k)).toBeTruthy()
      })
    });
  });
});
