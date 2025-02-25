import Router from './index.js';
import { EControllers, EMessageActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate, sendResponse } from '../../../utils/index.js';
import type { IReadMessagesReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for reading messages.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Messages, EMessageActions.Read);

  /**
   * @openapi
   * /messages/read:
   *   post:
   *     tags:
   *       - messages
   *     description: Read user messages
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       description: Request body for reading messages
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/IReadMessageDto'
   *     responses:
   *       200:
   *         description: Success. Read message
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
  service.router.post('/read', limitRate, async (req: IReadMessagesReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
