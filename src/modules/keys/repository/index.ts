import Log from 'simpl-loggar';
import MongoKeysRepository from './logic/mongo.js';
import { NoRepositoryControllerSpecified } from '../../../errors/index.js';
import ConfigLoader from '../../../tools/config/index.js';
import Key from '../model.js';
import type AddKey from './add.js';
import type { IKeyRepository } from './types.js';
import type { IKeyEntity } from '../entity.js';

class KeysRepository implements IKeyRepository {
  constructor(repository: IKeyRepository) {
    this.repository = repository;
  }

  private accessor repository: IKeyRepository;

  async add(key: AddKey): Promise<string> {
    return this.repository.add(key);
  }

  async get(id: string): Promise<IKeyEntity | null> {
    return this.repository.get(id);
  }

  async getAll(): Promise<IKeyEntity[]> {
    return this.repository.getAll();
  }

  async remove(id: string): Promise<void> {
    return this.repository.remove(id);
  }
}

export default class KeysFacade {
  static createInstance(): IKeyRepository {
    const repositoryTarget = ConfigLoader.getConfig().repository;

    switch (repositoryTarget) {
      case 'mongo':
        KeysFacade.instance = new KeysRepository(new MongoKeysRepository(Key));
        return KeysFacade.instance;
      default:
        Log.error('No repository controller specified. Please specify type of controller in config files');
        throw new NoRepositoryControllerSpecified();
    }
  }

  private static accessor instance: IKeyRepository | undefined = undefined;
}
