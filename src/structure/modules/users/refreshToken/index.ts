import { IncorrectRefreshTokenError } from '../../../../errors';
import RouterFactory from '../../../../tools/abstracts/router';
import { generateToken, verifyRefresh } from '../../../../tools/token';
import type { ILocalUser } from '../../../../types';
import type express from 'express';

export default class UserRouter extends RouterFactory {
  get(req: express.Request, res: ILocalUser): void {
    let refresh: string | null = null;
    if (req.headers['x-refresh-token']) refresh = req.headers['x-refresh-token'] as string;

    try {
      const { type } = verifyRefresh(res, refresh);
      const access = generateToken(res.locals.userId, type);

      res.set('Authorization', `Bearer ${access}`);
      res.status(200).send({ type });
    } catch (err) {
      throw new IncorrectRefreshTokenError();
    }
  }
}
