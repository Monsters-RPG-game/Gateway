import AbstractController from '../../../../tools/abstractions/controller.js';
import UserDetailsDto from '../../../users/subModules/details/dto.js';
import type GetMessagesDto from './dto.js';
import type { IPreparedMessagesBody } from './types.js';
import type * as types from '../../../../types/index.js';
import type { IFullMessageEntity } from '../../entity.js';

export default class GetMessagesController extends AbstractController<
  Record<string, IPreparedMessagesBody> | IFullMessageEntity[]
> {
  override async execute(
    data: GetMessagesDto,
    res: types.IResponse,
  ): Promise<Record<string, IPreparedMessagesBody> | IFullMessageEntity[]> {
    const { reqController, tempId, userId } = res.locals;

    const messages = (await reqController.message.get(data, { userId, tempId })).payload;

    if (Array.isArray(messages)) {
      const userIds = messages.map((m) => (m.receiver === userId ? m.sender : m.receiver));
      const cleaned = [...new Set(userIds), userId].map((id) => new UserDetailsDto({ id }));
      const users = (
        await reqController.user.getDetails(cleaned, {
          userId,
          tempId,
        })
      ).payload;
      return messages.map((m) => {
        return {
          ...m,
          receiver: users.find((e) => e._id === m.receiver)?.login ?? 'Removed account',
          sender: users.find((e) => e._id === m.sender)?.login ?? 'Removed account',
        };
      });
    }
    const userIds = Object.values(messages).map((m) => {
      return m.receiver === userId ? m.sender : m.receiver;
    });
    const cleaned = [...new Set(userIds), userId].map((id) => new UserDetailsDto({ id }));
    const users = (
      await reqController.user.getDetails(cleaned, {
        userId,
        tempId,
      })
    ).payload;
    const prepared: Record<string, IPreparedMessagesBody> = {};
    Object.entries(messages).forEach(([k, v]) => {
      prepared[k] = {
        ...v,
        receiver: users.find((e) => e._id === v.receiver)?.login ?? 'Removed account',
        sender: users.find((e) => e._id === v.sender)?.login ?? 'Removed account',
      };
    });

    return prepared;
  }
}
