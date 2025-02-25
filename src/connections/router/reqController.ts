import * as enums from '../../enums/index.js';
import Chat from '../../modules/chat/communicator.js';
import Message from '../../modules/messages/communicator.js';
import Profile from '../../modules/profile/communicator.js';
import User from '../../modules/users/communicator.js';
import State from '../../tools/state.js';
import type * as types from '../../types/index.js';

/**
 * Controller to manage communication between services and user.
 */
export default class ReqController {
  user: User;
  chat: Chat;
  profile: Profile;
  message: Message;

  constructor() {
    const action = <T extends types.IRabbitSubTargets>(
      service: enums.EServices,
      mainTarget: types.IRabbitTargets,
      subTarget: T,
      userData: types.IUserBrokerInfo,
      data?: types.IRabbitConnectionData[T],
    ): Promise<types.IBaseBrokerResponse> => this.send(service, mainTarget, subTarget, userData, data);

    this.user = new User(enums.EServices.Users, action);
    this.chat = new Chat(enums.EServices.Messages, action);
    this.profile = new Profile(enums.EServices.Users, action);
    this.message = new Message(enums.EServices.Messages, action);
  }

  private async send<T extends types.IRabbitSubTargets>(
    service: enums.EServices,
    mainTarget: types.IRabbitTargets,
    subTarget: T,
    userData: types.IUserBrokerInfo,
    data?: types.IRabbitConnectionData[T],
  ): Promise<types.IBaseBrokerResponse> {
    return new Promise((resolve, reject) => {
      State.broker.sendLocally(mainTarget, subTarget, resolve, reject, userData, service, data);
    });
  }
}
