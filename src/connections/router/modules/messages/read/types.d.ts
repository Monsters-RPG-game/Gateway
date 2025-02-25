import type { IReadMessageDto } from '../../../../../modules/messages/subModules/read/types.js';
import type { IQuery } from '../../../../../types/requests.js';
import type express from 'express';

export type IReadMessagesReq = express.Request<unknown, unknown, IReadMessageDto, IQuery>;
