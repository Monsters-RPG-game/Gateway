import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate, sendResponse } from '../../../utils/index.js';
import type { IUserDetailsReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for getting detailed user info.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.Details);

  /**
   * @openapi
   * /users/details:
   *   get:
   *     tags:
   *       - user
   *     description: Get user's details
   *     parameters:
   *       - in: query
   *         name: name
   *         required: false
   *         schema:
   *           type: string
   *       - in: query
   *         name: id
   *         required: false
   *         schema:
   *           type: string
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Success. Get user's details back in request.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/IUserEntity'
   *       400:
   *         description: Bad request.
   *         content:
   *           application/json:
   *             schema:
   *               oneOf:
   *                 - $ref: '#/components/schemas/UnauthorizedError'
   *                 - $ref: '#/components/schemas/MissingArgError'
   *                 - $ref: '#/components/schemas/IncorrectArgError'
   */
  service.router.get('/details', limitRate, async (req: IUserDetailsReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
