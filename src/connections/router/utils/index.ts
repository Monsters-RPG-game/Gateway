import rateLimit from 'express-rate-limit';
import RateLimitStore from './stores/rateLimiter.js';
import { ETTL } from '../../../enums/index.js';
import getConfig from '../../../tools/configLoader.js';
import type express from 'express';
import * as process from 'process';

/**
 * Rate limiter for routes access.
 * This limiter is disabled in tests.
 * @param _req Express.Request.
 * @param _res Express.Response.
 * @param next Express.Next.
 */
const limiter =
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

export default limiter;