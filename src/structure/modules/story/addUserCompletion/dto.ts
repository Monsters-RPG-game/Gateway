import Validation from '../../../../tools/validation/index.js';
import type { IAddUserCompletionDto } from './types';

export default class AddUserCompletionDto implements IAddUserCompletionDto {
  userId: string;
  episode: number;
  stage: number;
  chapter: number;

  constructor(data: IAddUserCompletionDto) {
    this.userId = data.userId;
    this.episode = data.episode;
    this.stage = data.stage;
    this.chapter = data.chapter;

    this.validate();
  }
  validate(): void {
    new Validation(this.userId, 'userId').isDefined();
    new Validation(this.episode, 'episode').isDefined();
    new Validation(this.stage, 'stage').isDefined();
    new Validation(this.chapter, 'chapter').isDefined();
  }
}
