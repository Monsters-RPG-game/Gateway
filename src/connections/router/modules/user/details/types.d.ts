import type { IUserDetailsDto } from '../../../../../modules/users/subModules/details/types.js';
import type { IQuery } from '../../../../../types/requests.js';
import type express from 'express';

export type IUserDetailsReq = express.Request<unknown, unknown, unknown, IUserDetailsDto & IQuery>;
