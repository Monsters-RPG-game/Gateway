import Log from 'simpl-loggar';
import { InvalidRequest } from '../../../../errors/index.js';
import TokensController from '../../../tokens/index.js';
import type { IAbstractSubController } from '../../../../types/abstractions.js';
import type { IUserSession } from '../../../../types/user.js';
import type ClientsRepository from '../../../clients/repository/index.js';
import type express from 'express';

export default class FinishLogoutController implements IAbstractSubController<string> {
  constructor(repository: ClientsRepository) {
    this.repository = repository;
  }

  private accessor repository: ClientsRepository;

  async execute(req: express.Request): Promise<string> {
    const { client } = req.session as IUserSession;
    if (!(req.session as IUserSession).logout || !(req.session as IUserSession).userId || !client) {
      throw new InvalidRequest();
    }

    const clientData = await this.repository.getByName(client);

    if (!clientData) {
      Log.debug('Login', `No client with provided name '${client}'`);
      throw new InvalidRequest();
    }

    const tokenController = new TokensController((req.session as IUserSession).userId!);
    await tokenController.logout();
    await tokenController.removeUserTokens();

    delete (req.session as IUserSession).logout;
    delete (req.session as IUserSession).client;
    delete (req.session as IUserSession).userId;

    return `${clientData.redirectUrl}/?feedback=success`;
  }
}
