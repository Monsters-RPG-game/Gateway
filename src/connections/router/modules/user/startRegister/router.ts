import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate } from '../../../utils/index.js';
import type { IStartRegisterReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for starting registration process.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.StartRegister);

  service.router.get('/register/start', limitRate, async (req: IStartRegisterReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req);
      res.redirect(data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
