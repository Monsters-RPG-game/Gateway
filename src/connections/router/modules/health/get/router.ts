import Router from './index.js';
import { EControllers, EHealthActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { sendResponse } from '../../../utils/index.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for health.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Health, EHealthActions.Get);

  /**
   * @openapi
   * /health:
   *   get:
   *     tags:
   *       - health
   *     description: Check if services are responding
   *     responses:
   *       200:
   *         description: Success. Got information about services
   */
  service.router.get('/', async (_req, res: types.IResponse) => {
    try {
      const data = await service.execute();
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
