import type express from 'express';
import type { ILocalUser } from '../../../../types';
import State from '../../../../tools/state';
import * as enums from '../../../../enums';
import { EConnectionType } from '../../../../enums';
import RegisterDto from './dto';
import RouterFactory from '../../../../tools/abstracts/router';

export default class UserRouter extends RouterFactory {
  post(req: express.Request, res: ILocalUser): void {
    const data = new RegisterDto(req.body as RegisterDto);

    State.broker.sendLocally(
      enums.EUserMainTargets.User,
      enums.EUserTargets.Register,
      { target: EConnectionType.Api, res },
      data,
      enums.EServices.Users,
    );
  }
}
