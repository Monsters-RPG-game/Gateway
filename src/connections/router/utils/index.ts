import rateLimit from 'express-rate-limit';
import RateLimitStore from './stores/rateLimiter.js';
import { ETTL } from '../../../enums/index.js';
import getConfig from '../../../tools/configLoader.js';
import type { IResponse } from '../../../types/requests.js';
import type express from 'express';

/**
 * Rate limiter for routes access.
 * This limiter is disabled in tests.
 * @param _req Express.Request.
 * @param _res Express.Response.
 * @param next Express.Next.
 */
export const limitRate =
  process.env.NODE_ENV === 'test'
    ? (_req: express.Request, _res: express.Response, next: express.NextFunction): void => {
        next();
      }
    : rateLimit({
        store: new RateLimitStore(),
        windowMs: ETTL.ExpressRateLimiter * 1000,
        limit: 30,
        message: { data: 'Too many requests from this IP, please try again in an 1 min' },
        validate: { trustProxy: getConfig().session.trustProxy },
      });

export const sendResponse = (res: IResponse, data: unknown): void => {
  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (typeof data === 'object' && Object.keys(data).length === 0)
  ) {
    res.status(204).send();
  } else {
    res.status(200).send({ data });
  }
};
