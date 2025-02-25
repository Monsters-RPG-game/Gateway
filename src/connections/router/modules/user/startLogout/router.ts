import Log from 'simpl-loggar';
import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate } from '../../../utils/index.js';
import type { IStartLogoutReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for starting logout.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.StartLogout);

  service.router.get('/logout/start', limitRate, async (req: IStartLogoutReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req);
      Log.debug('Logout - start', `Redirecting user to logout ${data}`);
      res.redirect(data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
