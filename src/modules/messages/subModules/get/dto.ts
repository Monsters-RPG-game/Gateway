import Validation from '@monsters/validator';
import type { IGetMessagesDto } from './types.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     IGetMessagesDto:
 *     parameters:
 *      - in: query
 *        name: page
 *        required: true
 *        schema:
 *          type: number
 */
export default class GetMessagesDto implements IGetMessagesDto {
  page: number;
  target: string | undefined;

  constructor(data: IGetMessagesDto) {
    this.page = data.page ? parseInt((data.page ?? '').toString()) : 1;
    this.target = data.target;

    this.validate();
  }

  validate(): void {
    new Validation(this.page, 'page').isDefined().isNumber();
    if (this.target) new Validation(this.target, 'target').isDefined();
  }
}
