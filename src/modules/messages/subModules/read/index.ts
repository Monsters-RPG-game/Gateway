import type ReadMessagesDto from './dto.js';
import type * as types from '../../../../types/index.js';

export default class ReadMessagesController implements types.IAbstractSubController<void> {
  async execute(data: ReadMessagesDto, res: types.IResponse): Promise<void> {
    const { reqController, user } = res.locals;

    await reqController.message.read(data, { userId: user?.userId });
  }
}
