import { describe, expect, it } from '@jest/globals';
import fakeUsers from '../../../utils/fakeData/users.json'
import ReqController from '../../../../src/connections/router/reqController.js';
import GetProfileDto from '../../../../src/modules/profile/subModules/get/dto';
import { IGetProfileDto } from '../../../../src/modules/profile/subModules/get/types';
import { IProfileEntity } from '../../../../src/modules/profile/entity';

describe('Profile - get', () => {
  const reqController = new ReqController()
  const req: IGetProfileDto = {
    id: fakeUsers.data[0]!._id,
    name: fakeUsers.data[0]!.login
  }

  describe('Should pass', () => {
    it(`Get data by id`, async () => {
      const res = await reqController.profile.get(new GetProfileDto(req), { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["_id", "user", "initialized"];

      Object.keys(res.payload as IProfileEntity).forEach(k => {
        expect(targetKeys.includes(k)).toBeTruthy()
      })
      targetKeys.forEach(k => {
        expect(Object.keys(res.payload as IProfileEntity).includes(k)).toBeTruthy()
      })
    });
  });
});
