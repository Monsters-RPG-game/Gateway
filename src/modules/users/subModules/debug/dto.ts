import Validation from '../../../../tools/validation.js';
import type { IDebugGetAllUsersDto } from './types.js';

export default class DebugGetAllUsersDto implements IDebugGetAllUsersDto {
  readonly page?: number;

  constructor(data: IDebugGetAllUsersDto) {
    this.page = data.page !== undefined && !isNaN(parseInt(data.page as string)) ? parseInt(data.page as string) : 1;

    this.validate();
  }

  private validate(): void {
    new Validation(this.page, 'page').isDefined().isNumber().isBetween(999999, 1); // #TODO This is temporary. This should be updated and WILL cause problems in the future
  }
}
