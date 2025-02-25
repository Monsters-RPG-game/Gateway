import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { sendResponse } from '../../../utils/index.js';
import type { IDebugReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for debugging users.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.Debug);

  /**
   * @openapi
   * /users/debug:
   *   get:
   *     tags:
   *       - user-debug
   *     description: Get all users
   *     parameters:
   *       - in: query
   *         name: page
   *         required: true
   *         schema:
   *           type: number
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success. Get users back in request.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/IUserEntity'
   *       400:
   *         description: Bad request.
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - $ref: '#/components/schemas/UnauthorizedError'
   *                 - $ref: '#/components/schemas/MissingArgError'
   *                 - $ref: '#/components/schemas/IncorrectArgError'
   *       401:
   *         description: User not logged in
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnauthorizedError'
   */
  service.router.get('/debug', async (req: IDebugReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
