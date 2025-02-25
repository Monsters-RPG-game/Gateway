import Validation from '../../../../tools/validation.js';
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
    this.page = data.page;
    this.target = data.target;

    this.validate();
  }

  validate(): void {
    new Validation(this.page, 'page').isDefined();
    if (this.target) new Validation(this.target, 'target').isDefined();
  }
}
