import Validation from '../../../../tools/validation.js';
import type { IReadMessageDto } from './types.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     IReadMessageDto:
 *       type: object
 *       properties:
 *         chatId:
 *           type: string
 *         receiver:
 *           type: string
 */
export default class ReadMessagesDto implements IReadMessageDto {
  chatId: string;
  receiver: string;

  constructor(body: IReadMessageDto) {
    this.chatId = body.chatId;
    this.receiver = body.receiver;

    this.validate();
  }

  validate(): void {
    new Validation(this.chatId, 'chatId').isDefined();
    new Validation(this.receiver, 'receiver').isDefined();
  }
}
