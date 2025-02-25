import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate, sendResponse } from '../../../utils/index.js';
import type { IRemoveAccountReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initializie routes for removing accounts.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.RemoveAccount);

  service.router.delete('/', limitRate, async (req: IRemoveAccountReq, res: types.IResponse) => {
    try {
      await service.execute(req, res);
      sendResponse(res, undefined);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
