import * as enums from '../../enums/index.js';
import GetMessageController from './subModules/get/index.js';
import GetUnreadMessageController from './subModules/getUnread/index.js';
import ReadMessageController from './subModules/read/index.js';
import SendMessageController from './subModules/send/index.js';
import AbstractController from '../../tools/abstractions/controller.js';

export default class MessagesController extends AbstractController<enums.EControllers.Messages> {
  /**
   * Register messages controllers.
   * @returns Void.
   */
  protected init(): void {
    this.register(enums.EMessageActions.Get, new GetMessageController());
    this.register(enums.EMessageActions.GetUnread, new GetUnreadMessageController());
    this.register(enums.EMessageActions.Read, new ReadMessageController());
    this.register(enums.EMessageActions.Send, new SendMessageController());
  }
}
