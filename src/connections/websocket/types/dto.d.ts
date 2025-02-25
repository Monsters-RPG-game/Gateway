import type * as types from './index.js';
import type * as enums from '../../../enums/index.js';

/**
 * @openapi
 * components:
 *   schemas:
 *     IReadMessageDto:
 *       type: object
 *       properties:
 *         target:
 *           type: string
 *           example: 'chat'
 *         subTarget:
 *           type: string
 *           example: 'read'
 *         payload:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *               description: Receiver's id
 *             chatId:
 *               type: string
 *               description: Conversation id
 */
export interface IReadMessageDto {
  target: enums.ESocketTargets.Chat;
  subTarget: enums.EMessageSubTargets.Read;
  payload: types.IReadMessageBody;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IGetDetailedDto:
 *       type: object
 *       properties:
 *         target:
 *           type: string
 *           example: 'chat'
 *         subTarget:
 *           type: string
 *           example: 'get'
 *         payload:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               description: Message's page
 *             target:
 *               type: string
 *               description: Conversation id
 */

export interface IGetDetailedDto {
  target: enums.ESocketTargets.Chat;
  subTarget: enums.EMessageSubTargets.Get;
  payload: types.IGetDetailedBody;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ISocketSendMessageDto:
 *       type: object
 *       properties:
 *         target:
 *           type: string
 *           example: 'chat'
 *         subTarget:
 *           type: string
 *           example: 'get'
 *         payload:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               description: Message body
 *             target:
 *               type: string
 *               description: Receiver's id
 */

export interface ISocketSendMessageDto {
  target: enums.ESocketTargets.Chat;
  subTarget: enums.EMessageSubTargets.Get;
  payload: types.ISocketSendMessageBody;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     IGetMessageDto:
 *       type: object
 *       properties:
 *         target:
 *           type: string
 *           example: 'chat'
 *         subTarget:
 *           type: string
 *           example: 'get'
 *         payload:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               description: Message's page
 */

export interface IGetMessageDto {
  target: enums.ESocketTargets.Chat;
  subTarget: enums.EMessageSubTargets.Get;
  payload: types.IGetMessageBody;
}
