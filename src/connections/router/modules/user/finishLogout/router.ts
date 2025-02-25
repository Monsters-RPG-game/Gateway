import Log from 'simpl-loggar';
import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import { ETokens, ETokenType } from '../../../../../enums/tokens.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate } from '../../../utils/index.js';
import type * as types from '../../../../../types/index.js';
import type express from 'express';

/**
 * Initialize routes for finishing logout.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.FinishLogout);

  service.router.get('/logout/finish', limitRate, async (req: express.Request, res: types.IResponse) => {
    try {
      const data = await service.execute(req);
      Log.debug('Logout - finish', `Got req to logout user ${data}`);

      res.cookie(ETokenType.Access, '');
      res.cookie(ETokens.Refresh, '');
      res.cookie(ETokens.SessionToken, '');
      res.redirect(data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
