import type GetUnreadMessagesDto from './dto.js';
import type { IUnreadMessage } from './types.js';
import type * as types from '../../../../types/index.js';

export default class GetUnreadMessagesController implements types.IAbstractSubController<IUnreadMessage[]> {
  async execute(data: GetUnreadMessagesDto, res: types.IResponse): Promise<IUnreadMessage[]> {
    const { reqController, user } = res.locals;

    return (
      await reqController.message.getUnread(data, {
        userId: user?.userId,
      })
    ).payload;
  }
}
