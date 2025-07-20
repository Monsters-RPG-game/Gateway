import Log from 'simpl-loggar';
import MongoClientsRepository from './logic/mongo.js';
import { NoRepositoryControllerSpecified } from '../../../errors/index.js';
import ConfigLoader from '../../../tools/config/index.js';
import Client from '../model.js';
import type AddClient from './add.js';
import type { IClientRepository } from './types.js';
import type { IClientEntity } from '../entity.js';

class ClientsRepository implements IClientRepository {
  constructor(repository: IClientRepository) {
    this.repository = repository;
  }

  private accessor repository: IClientRepository;

  async add(client: AddClient): Promise<string> {
    return this.repository.add(client);
  }

  async get(id: string): Promise<IClientEntity | null> {
    return this.repository.get(id);
  }

  async getByName(name: string): Promise<IClientEntity | null> {
    return this.repository.getByName(name);
  }
}

export default class KeysFacade {
  static createInstance(): IClientRepository {
    const repositoryTarget = ConfigLoader.getConfig().repository;

    switch (repositoryTarget) {
      case 'mongo':
        KeysFacade.instance = new ClientsRepository(new MongoClientsRepository(Client));
        return KeysFacade.instance;
      default:
        Log.error('No repository controller specified. Please specify type of controller in config files');
        throw new NoRepositoryControllerSpecified();
    }
  }

  private static accessor instance: IClientRepository | undefined = undefined;
}
