import AbstractRepository from '../../../tools/abstractions/repository.js';
import type { IKeyEntity } from '../entity.js';
import type AddKey from './add.js';
import type { IKeyRepository } from './types.js';
import type * as enums from '../../../enums/index.js';
import type Key from '../model.js';
import type { IKey } from '../types.js';

export default class KeyRepository
  extends AbstractRepository<IKey, typeof Key, enums.EModules.Key>
  implements IKeyRepository
{
  async getAll(): Promise<IKeyEntity[]> {
    return this.model.find().select({ __v: false }).lean();
  }

  override async add(data: AddKey): Promise<string> {
    const newElement = new this.model(data);
    const callback = await newElement.save();
    return callback._id.toString();
  }

  async remove(_id: string): Promise<void> {
    await this.model.findOneAndDelete({ _id });
  }
}
