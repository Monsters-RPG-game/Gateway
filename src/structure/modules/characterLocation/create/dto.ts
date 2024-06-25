import Validation, { isDefined } from '../../../../tools/validation/index.js';
import type { ICreateCharacterLocationDto } from './types.js';

export default class CreateCharacterLocationDto implements ICreateCharacterLocationDto {
  @isDefined
  accessor character: string;
  x?: number;
  y?: number;
  map?: string;

  constructor(data: ICreateCharacterLocationDto) {
    this.character = data.character;
    this.x = data.x;
    this.y = data.y;
    this.map = data.map;

    this.validate();
  }

  private validate(): void {
    if (this.x) new Validation(this.x, 'x').isDefined();
    if (this.y) new Validation(this.y, 'y').isDefined();
    if (this.map) new Validation(this.map, 'map').isDefined();
  }
}
