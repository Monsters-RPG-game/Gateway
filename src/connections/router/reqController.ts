import * as enums from '../../enums/index.js';
import CharacterState from '../../modules/character/controller.js';
import Chat from '../../modules/chat/controller.js';
import Fights from '../../modules/fights/controller.js';
import Inventory from '../../modules/inventory/controller.js';
import Message from '../../modules/message/controller.js';
import Npc from '../../modules/npc/controller.js';
import Party from '../../modules/party/controller.js';
import Profile from '../../modules/profile/controller.js';
import SingleSkill from '../../modules/singleSkill/controller.js';
import Skills from '../../modules/skills/controller.js';
import Stats from '../../modules/stats/controller.js';
import Story from '../../modules/story/controller.js';
import User from '../../modules/user/controller.js';
import State from '../../tools/state.js';
import type * as types from '../../types/index.js';

/**
 * Controller to manage communication between services and user.
 */
export default class ReqController {
  npc: Npc;
  user: User;
  chat: Chat;
  party: Party;
  stats: Stats;
  skills: Skills;
  singleSkill: SingleSkill;
  fights: Fights;
  profile: Profile;
  story: Story;
  message: Message;
  inventory: Inventory;
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

    this.npc = new Npc(enums.EServices.Users, action);
    this.user = new User(enums.EServices.Users, action);
    this.party = new Party(enums.EServices.Users, action);
    this.chat = new Chat(enums.EServices.Messages, action);
    this.stats = new Stats(enums.EServices.Users, action);
    this.skills = new Skills(enums.EServices.Users, action);
    this.singleSkill = new SingleSkill(enums.EServices.Users, action);
    this.fights = new Fights(enums.EServices.Fights, action);
    this.profile = new Profile(enums.EServices.Users, action);
    this.story = new Story(enums.EServices.Story, action);
    this.message = new Message(enums.EServices.Messages, action);
    this.inventory = new Inventory(enums.EServices.Users, action);
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