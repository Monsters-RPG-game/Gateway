import Log from 'simpl-loggar';
import { RegisterRequestDto } from './dto.js';
import { InvalidRequest } from '../../../../errors/index.js';
import getConfig from '../../../../tools/configLoader.js';
import type FinishRegisterDto from './dto.ts';
import type { IAbstractSubController } from '../../../../types/abstractions.js';
import type { IResponse } from '../../../../types/requests.js';
import type { IUserSession } from '../../../../types/user.js';
import type { IClientRepository } from '../../../clients/repository/types.js';
import type express from 'express';

export default class FinishRegisterController implements IAbstractSubController<string> {
  constructor(repository: IClientRepository) {
    this.repository = repository;
  }

  private accessor repository: IClientRepository;

  async execute(data: FinishRegisterDto, req: express.Request, res: IResponse): Promise<string> {
    const { nonce } = req.session as IUserSession;
    const clientId = (req.session as IUserSession).client;
    if (!nonce || !clientId) throw new InvalidRequest();

    await this.validateReq(nonce);

    const client = await this.repository.getByName(clientId);

    const { reqController } = res.locals;
    await reqController.user.register(new RegisterRequestDto(data), {
      userId: data.userId,
    });

    return `${client!.redirectUrl}?feedback=success`;
  }

  private async validateReq(nonce: string): Promise<void> {
    const params = new URLSearchParams({
      nonce,
    });

    const res = await fetch(
      `${getConfig().authorizationInnerAddress}/interaction/register/verify/${nonce}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': getConfig().myAddress,
        },
      },
    );

    if (!res.ok) {
      Log.error('Finish register', 'Server responded with invalid register validation', nonce);
      throw new InvalidRequest();
    }
  }
}
