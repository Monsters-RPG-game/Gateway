import { NoDataProvidedError } from '../../../../errors/index.js';
import Validation from '../../../../tools/validation.js';
import type { IGetProfileDto } from './types.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     IGetProfileDto:
 *     parameters:
 *       - in: query
 *         name: id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: name
 *         required: false
 *         schema:
 *           type: string
 */
export default class GetProfileDto implements IGetProfileDto {
  id: string | undefined;
  name: string | undefined;

  constructor(data: IGetProfileDto) {
    this.id = data.id;
    this.name = data.name;

    this.validate();
  }

  private validate(): void {
    if (!this.id && !this.name) throw new NoDataProvidedError();

    if (this.id) new Validation(this.id, 'id').isDefined();
    if (this.name) new Validation(this.name, 'name').isDefined();
  }
}
