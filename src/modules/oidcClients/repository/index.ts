import Log from 'simpl-loggar';
import MongoOidcClientRepository from './logic/mongo.js';
import { NoRepositoryControllerSpecified } from '../../../errors/index.js';
import ConfigLoader from '../../../tools/config/index.js';
import OidcClient from '../model.js';
import type AddOidcClient from './add.js';
import type { IOidcClientEntity } from '../entity.js';
import type { IOidcClientRepository } from './types.js';
import type { EClientGrants } from 'enums/grants.js';

class OidcClientsRepository implements IOidcClientRepository {
  constructor(repository: IOidcClientRepository) {
    this.repository = repository;
  }

  private accessor repository: IOidcClientRepository;

  async add(client: AddOidcClient): Promise<string> {
    return this.repository.add(client);
  }

  async get(id: string): Promise<IOidcClientEntity | null> {
    return this.repository.get(id);
  }

  async getByGrant(grant: EClientGrants): Promise<IOidcClientEntity | null> {
    return this.repository.getByGrant(grant);
  }

  async getByName(clientId: string): Promise<IOidcClientEntity | null> {
    return this.repository.getByName(clientId);
  }
}

export default class OidcClientFacade {
  static createInstance(): IOidcClientRepository {
    const repositoryTarget = ConfigLoader.getConfig().repository;

    switch (repositoryTarget) {
      case 'mongo':
        OidcClientFacade.instance = new OidcClientsRepository(new MongoOidcClientRepository(OidcClient));
        return OidcClientFacade.instance;
      default:
        Log.error('No repository controller specified. Please specify type of controller in config files');
        throw new NoRepositoryControllerSpecified();
    }
  }

  private static accessor instance: IOidcClientRepository | undefined = undefined;
}
