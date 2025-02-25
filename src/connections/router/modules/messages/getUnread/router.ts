import Router from './index.js';
import { EControllers, EMessageActions } from '../../../../../enums/controllers.js';
import handleErr from '../../../../../errors/handler.js';
import { limitRate, sendResponse } from '../../../utils/index.js';
import type { IGetUnreadMessagesReq } from './types.js';
import type * as types from '../../../../../types/index.js';

/**
 * Initialize routes for getting unread messages.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Messages, EMessageActions.GetUnread);

  /**
   * @openapi
   * /messages/unread:
   *   get:
   *     tags:
   *       - messages
   *     description: Get unread user messages
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
   *         description: Success. Got user's unread messages
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/IUnreadMessage'
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
  service.router.get('/unread', limitRate, async (req: IGetUnreadMessagesReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      sendResponse(res, data);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
