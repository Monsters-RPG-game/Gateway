import Validation from '../../../../tools/validation.js';
import type { ISendMessageDto } from './types.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     ISendMessageDto:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *         receiver:
 *           type: string
 */
export default class SendMessagesDto implements ISendMessageDto {
  body: string;
  receiver: string;
  sender: string;

  constructor(body: ISendMessageDto, sender: string) {
    this.body = body.body;
    this.receiver = body.receiver;
    this.sender = sender;

    this.validate();
  }

  validate(): void {
    new Validation(this.body, 'body').isDefined();
    new Validation(this.receiver, 'receiver').isDefined();
    new Validation(this.sender, 'sender').isDefined();
  }
}
