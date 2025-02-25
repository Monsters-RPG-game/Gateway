import type { IGetMessagesDto } from '../../../../../modules/messages/subModules/get/types.js';
import type { IQuery } from '../../../../../types/requests.js';
import type express from 'express';

export type IGetMessagesReq = express.Request<unknown, unknown, undefined, IGetMessagesDto & IQuery>;
