import Router from './index.js';
import { EControllers, EProfileActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { sendResponse, limitRate } from '../../../utils/index.js';
import type { IGetProfileReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for getting profiles.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Profile, EProfileActions.Get);

  /**
   * @openapi
   * /profile:
   *   get:
   *     security:
   *       - bearerAuth: []
   *     tags:
   *       - profile
   *     description: Get user profile
   *     parameters:
   *       - in: query
   *         name: name
   *         required: true
   *         schema:
   *           type: string
   *         description: User name
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/IProfileEntity'
   *       400:
   *         description: Bad request.
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - $ref: '#/components/schemas/NoDataProvidedError'
   *                 - $ref: '#/components/schemas/MissingArgError'
   *                 - $ref: '#/components/schemas/IncorrectArgError'
   *       401:
   *         description: User not logged in
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedError'
   */
  service.router.get('/', limitRate, async (req: IGetProfileReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
