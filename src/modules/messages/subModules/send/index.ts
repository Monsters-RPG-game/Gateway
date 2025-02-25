import SendMessagesDto from './dto.js';
import { ESocketType } from '../../../../enums/socket.js';
import { NoUserWithProvidedName } from '../../../../errors/index.js';
import State from '../../../../tools/state.js';
import UserDetailsDto from '../../../users/subModules/details/dto.js';
import type * as types from '../../../../types/index.js';

export default class SendMessagesController implements types.IAbstractSubController<void> {
  async execute(data: SendMessagesDto, res: types.IResponse): Promise<void> {
    const { reqController, user } = res.locals;

    const users = await reqController.user.getDetails(
      [new UserDetailsDto({ name: data.receiver }), new UserDetailsDto({ id: user?.userId })],
      { userId: user?.userId },
    );
    if (!users || users.payload.length === 0) {
      throw new NoUserWithProvidedName();
    }
    const receiver = users.payload.find((u) => u.login === data.receiver);
    const sender = users.payload.find((u) => u._id === data.sender);
    if (!receiver) {
      throw new NoUserWithProvidedName();
    }

    await reqController.message.send(
      new SendMessagesDto(
        {
          body: data.body,
          sender: data.receiver,
          receiver: receiver._id as string,
        },
        user!.userId,
      ),
      { userId: user?.userId },
    );

    State.socket.sendToUser(
      receiver._id as string,
      { body: data.body, sender: sender?.login, receiver: sender?.login },
      ESocketType.Message,
    );
  }
}
