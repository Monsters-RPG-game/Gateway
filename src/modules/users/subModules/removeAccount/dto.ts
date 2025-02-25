// eslint-disable-next-line max-classes-per-file
import Validation from '../../../../tools/validation.js';
import type { IRemoveAccountDto, IRemoveUserAccountRequestDto } from './types.js';

export default class RemoveAccountDto implements IRemoveAccountDto {
  readonly client: string;

  constructor(data: { client: string }) {
    this.client = data.client;

    this.validate();
  }

  private validate(): void {
    new Validation(this.client, 'client').isDefined().isString().hasMinLength(1);
  }
}

export class RemoveUserAccountRequestDto implements IRemoveUserAccountRequestDto {
  readonly userId: string;

  constructor(userId: string) {
    this.userId = userId;

    this.validate();
  }

  private validate(): void {
    new Validation(this.userId, 'userId').isDefined().isString().hasMinLength(1);
  }
}
