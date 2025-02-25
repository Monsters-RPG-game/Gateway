import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate, sendResponse } from '../../../utils/index.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for validating user token.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.ValidateToken);

  service.router.get('/validate', limitRate, async (req, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
