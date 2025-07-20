import Log from 'simpl-loggar';
import MongoTokenRepository from './logic/mongo.js';
import { NoRepositoryControllerSpecified } from '../../../errors/index.js';
import ConfigLoader from '../../../tools/config/index.js';
import Token from '../model.js';
import type AddToken from './add.js';
import type { ITokenEntity } from '../entity.js';
import type { ITokenRepository } from './types.js';

class TokenRepository implements ITokenRepository {
  constructor(repository: ITokenRepository) {
    this.repository = repository;
  }

  private accessor repository: ITokenRepository;

  async getByUserId(userId: string): Promise<ITokenEntity | null> {
    return this.repository.getByUserId(userId);
  }

  async add(token: AddToken): Promise<string> {
    return this.repository.add(token);
  }

  async get(id: string): Promise<ITokenEntity | null> {
    return this.repository.get(id);
  }

  async removeByUserId(userId: string): Promise<void> {
    return this.repository.removeByUserId(userId);
  }
}

export default class TokenFacade {
  static createInstance(): ITokenRepository {
    const repositoryTarget = ConfigLoader.getConfig().repository;

    switch (repositoryTarget) {
      case 'mongo':
        TokenFacade.instance = new TokenRepository(new MongoTokenRepository(Token));
        return TokenFacade.instance;
      default:
        Log.error('No repository controller specified. Please specify type of controller in config files');
        throw new NoRepositoryControllerSpecified();
    }
  }

  private static accessor instance: ITokenRepository | undefined = undefined;
}
