import Validation from '@monsters/validator';
import type { IStartRegisterDto } from './types.js';

export default class StartRegisterDto implements IStartRegisterDto {
  readonly client: string;

  constructor(data: { client: string }) {
    this.client = data.client;

    this.validate();
  }

  private validate(): void {
    new Validation(this.client, 'client').isDefined().isString().hasMinLength(1);
  }
}
