import type { IGetUnreadMessagesDto } from '../../../../../modules/messages/subModules/getUnread/types.js';
import type { IQuery } from '../../../../../types/requests.js';
import type express from 'express';

export type IGetUnreadMessagesReq = express.Request<unknown, unknown, undefined, IGetUnreadMessagesDto & IQuery>;
