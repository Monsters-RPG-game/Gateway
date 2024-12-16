import UserDetailsDto from './dto.js';
import RouterFactory from '../../../tools/abstracts/router.js';
import type * as types from '../../../types/index.js';
import type { IUserEntity } from '../entity.js';
import type express from 'express';

export default class UserRouter extends RouterFactory {
  async get(req: express.Request, res: express.Response): Promise<IUserEntity> {
    const locals = res.locals as types.IUsersTokens;
    const { reqController } = locals;

    const data = new UserDetailsDto({ name: req.query.name as string, id: req.query.id as string });
    return (
      await reqController.user.getDetails([data], {
        userId: locals.userId,
        tempId: locals.tempId,
      })
    ).payload[0]!;
  }
}