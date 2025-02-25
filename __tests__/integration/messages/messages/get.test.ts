import { describe, expect, it } from '@jest/globals';
import fakeMessages from '../../../utils/fakeData/messages.json'
import fakeUsers from '../../../utils/fakeData/users.json'
import ReqController from '../../../../src/connections/router/reqController.js';
import { IGetMessagesDto } from '../../../../src/modules/messages/subModules/get/types';
import GetMessagesDto from '../../../../src/modules/messages/subModules/get/dto';
import { IPreparedMessagesBody } from '../../../../src/modules/chat/types';

describe('Get messages', () => {
  const reqController = new ReqController()
  const req: IGetMessagesDto = {
    page: 1,
    target: fakeMessages.data[0]!._id
  }

  describe('Should pass', () => {
    it(`Get data without target`, async () => {
      const clone = structuredClone(req)
      clone.target = undefined

      const res = await reqController.message.get(new GetMessagesDto(clone), { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["sender", "receiver", "messages"];

      const payload = res.payload as Record<string, IPreparedMessagesBody>

      Object.values(payload).forEach(v => {
        Object.keys(v).forEach(k => {
          expect(targetKeys.includes(k)).toBeTruthy()
        })
      })
      targetKeys.forEach(k => {
        Object.values(payload).forEach(v => {
          expect(Object.keys(v).includes(k)).toBeTruthy()
        })
      })
    });

    it(`Get data by target`, async () => {
      const res = await reqController.message.get(new GetMessagesDto(req), { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["sender", "receiver", "messages"];

      const payload = res.payload as Record<string, IPreparedMessagesBody>

      Object.values(payload).forEach(v => {
        Object.keys(v).forEach(k => {
          expect(targetKeys.includes(k)).toBeTruthy()
        })
      })
      targetKeys.forEach(k => {
        Object.values(payload).forEach(v => {
          expect(Object.keys(v).includes(k)).toBeTruthy()
        })
      })
    })
  });
});
