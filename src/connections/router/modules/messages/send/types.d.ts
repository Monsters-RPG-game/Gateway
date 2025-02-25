import type { ISendMessageDto } from '../../../../../modules/messages/subModules/send/types.js';
import type { IQuery } from '../../../../../types/requests.js';
import type express from 'express';

export type ISendMessagesReq = express.Request<unknown, unknown, ISendMessageDto, IQuery>;
