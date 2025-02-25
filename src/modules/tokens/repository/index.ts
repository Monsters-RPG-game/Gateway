import AbstractRepository from '../../../tools/abstractions/repository.js';
import type { ITokenEntity } from '../entity.js';
import type { ITokenRepository } from './types.js';
import type * as enums from '../../../enums/index.js';
import type Token from '../model.js';
import type { IToken } from '../types.js';
import type { FilterQuery } from 'mongoose';

export default class TokenRepository
  extends AbstractRepository<IToken, typeof Token, enums.EModules.Token>
  implements ITokenRepository
{
  async getByUserId(userId: string): Promise<ITokenEntity | null> {
    return this.model.findOne({ userId } as FilterQuery<Record<string, string>>, null, { sort: { _id: -1 } }).lean();
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.model.findOneAndDelete({ userId });
  }
}
