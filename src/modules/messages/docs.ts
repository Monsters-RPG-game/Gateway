/**
 * @openapi
 * components:
 *   schemas:
 *     IFullMessageEntity:
 *       type: object
 *       properties:
 *         sender:
 *           type: string
 *         receiver:
 *           type: string
 *         messages:
 *           type: string
 *         read:
 *           type: boolean
 *         chatId:
 *           type: string
 *       required:
 *         - sender
 *         - receiver
 *         - messages
 *         - read
 *         - chatId
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     IPreparedMessagesBody:
 *       type: object
 *       properties:
 *         sender:
 *           type: string
 *         receiver:
 *           type: string
 *         messages:
 *           type: string
 *       required:
 *         - sender
 *         - receiver
 *         - messages
 */
/**
 * @openapi
 * components:
 *   schemas:
 *     IUnreadMessage:
 *       type: object
 *       properties:
 *         lastMessage:
 *           type: number
 *         unread:
 *           type: number
 *         chatId:
 *           type: string
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *       required:
 *         - lastMessage
 *         - unread
 *         - chatId
 *         - participants
 */
