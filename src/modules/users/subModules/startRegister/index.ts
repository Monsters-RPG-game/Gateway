import { InvalidRequest } from '../../../../errors/index.js';
import getConfig from '../../../../tools/configLoader.js';
import { generateRandomName } from '../../../../utils/index.js';
import type StartRegisterDto from './dto.js';
import type { IAbstractSubController } from '../../../../types/abstractions.js';
import type { IUserSession } from '../../../../types/user.js';
import type ClientsRepository from '../../../clients/repository/index.js';
import type express from 'express';

export default class StartRegisterController implements IAbstractSubController<string> {
  constructor(repository: ClientsRepository) {
    this.repository = repository;
  }

  private accessor repository: ClientsRepository;

  async execute(data: StartRegisterDto, req: express.Request): Promise<string> {
    const client = await this.repository.getByName(data.client);
    if (!client) throw new InvalidRequest();

    const timestamp = Math.floor(Date.now() / 1000);
    const randomValue = generateRandomName(30);
    const nonce = `${timestamp}|${randomValue}`;

    (req.session as IUserSession).nonce = nonce;
    (req.session as IUserSession).client = client.clientId;

    const params = new URLSearchParams({
      client_id: 'register',
      redirect_url: `${getConfig().myAddress}/user/register/finish`,
      home: client.failUrl,
      nonce,
    });

    return `${getConfig().authorizationAddress}/register?${params.toString()}`;
  }
}
