import type { IUserLocals } from './user.js';
import type express from 'express';

export type IResponse<T = unknown> = express.Response<T, IUserLocals>;

export interface IQuery {
  [key: string]: undefined | string | string[];
}
