import { describe, expect, it } from '@jest/globals';
import fakeUsers from '../../../utils/fakeData/users.json'
import ReqController from '../../../../src/connections/router/reqController.js';
import GetUnreadMessagesDto from '../../../../src/modules/messages/subModules/getUnread/dto';
import { IGetUnreadMessagesDto } from '../../../../src/modules/messages/subModules/getUnread/types';

describe('Get unread messages', () => {
  const reqController = new ReqController()
  const req: IGetUnreadMessagesDto = {
    page: 1,
  }

  describe('Should pass', () => {
    it(`Get data`, async () => {
      const res = await reqController.message.getUnread(new GetUnreadMessagesDto(req), { userId: fakeUsers.data[0]!.userId })
      const targetKeys = ["chatId", "lastMessage", "participants", "unread"];

      res.payload.forEach(k => {
        Object.keys(k).forEach(e => {
          expect(targetKeys.includes(e)).toBeTruthy()
        })
      })
      targetKeys.forEach(k => {
        res.payload.forEach(e => {
          expect(Object.keys(e).includes(k)).toBeTruthy()
        })
      })
    });
  });
});
