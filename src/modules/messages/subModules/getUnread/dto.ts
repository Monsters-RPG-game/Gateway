import Validation from '../../../../tools/validation.js';
import type { IGetUnreadMessagesDto } from './types.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     IGetUnreadMessagesDto:
 *     parameters:
 *      - in: query
 *        name: page
 *        required: true
 *        schema:
 *          type: number
 */
export default class GetUnreadMessagesDto implements IGetUnreadMessagesDto {
  page: number;

  constructor(data: IGetUnreadMessagesDto) {
    this.page = data.page;

    this.validate();
  }

  validate(): void {
    new Validation(this.page, 'page').isDefined();
  }
}
