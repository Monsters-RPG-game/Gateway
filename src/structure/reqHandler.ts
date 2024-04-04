import BugReport from './modules/bugReport/handler.js';
import CharacterState from './modules/character/handler.js';
import Chat from './modules/chat/handler.js';
import Fights from './modules/fights/handler.js';
import Inventory from './modules/inventory/handler.js';
import Log from './modules/logs/handler.js';
import Message from './modules/message/handler.js';
import Party from './modules/party/handler.js';
import Profile from './modules/profile/handler.js';
import User from './modules/user/handler.js';
import * as enums from '../enums/index.js';
import State from '../state.js';
import type * as types from '../types/index.d.js';

/**
 * Handler to manage communication between services and user
 */
export default class ReqHandler {
  log: Log;
  user: User;
  chat: Chat;
  party: Party;
  fights: Fights;
  profile: Profile;
  message: Message;
  inventory: Inventory;
  bugReport: BugReport;
  characterState: CharacterState;

  constructor() {
    const action = <T extends types.IRabbitSubTargets>(
      service: enums.EServices,
      mainTarget: types.IRabbitTargets,
      subTarget: T,
      userData: types.IUserBrokerInfo,
      data?: types.IRabbitConnectionData[T],
    ): Promise<{
      type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
      payload: unknown;
    }> => this.send(service, mainTarget, subTarget, userData, data);

    this.log = new Log(enums.EServices.Users, action);
    this.user = new User(enums.EServices.Users, action);
    this.party = new Party(enums.EServices.Users, action);
    this.chat = new Chat(enums.EServices.Messages, action);
    this.fights = new Fights(enums.EServices.Fights, action);
    this.profile = new Profile(enums.EServices.Users, action);
    this.message = new Message(enums.EServices.Messages, action);
    this.inventory = new Inventory(enums.EServices.Users, action);
    this.bugReport = new BugReport(enums.EServices.Users, action);
    this.characterState = new CharacterState(enums.EServices.Users, action);
  }

  private async send<T extends types.IRabbitSubTargets>(
    service: enums.EServices,
    mainTarget: types.IRabbitTargets,
    subTarget: T,
    userData: types.IUserBrokerInfo,
    data?: types.IRabbitConnectionData[T],
  ): Promise<{
    type: enums.EMessageTypes.Credentials | enums.EMessageTypes.Send;
    payload: unknown;
  }> {
    return new Promise((resolve, reject) => {
      State.broker.sendLocally(mainTarget, subTarget, resolve, reject, userData, service, data);
    });
  }
}
