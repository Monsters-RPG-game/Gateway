import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate } from '../../../utils/index.js';
import type { IFinishRegisterReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for finishing registration.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.FinishRegister);

  service.router.get('/register/finish', limitRate, async (req: IFinishRegisterReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      res.redirect(data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
