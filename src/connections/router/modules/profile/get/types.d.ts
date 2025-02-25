import type { IGetProfileDto } from '../../../../../modules/profile/subModules/get/types.js';
import type { IQuery } from '../../../../../types/requests.js';
import type express from 'express';

export type IGetProfileReq = express.Request<unknown, unknown, IGetProfileDto, IQuery>;
