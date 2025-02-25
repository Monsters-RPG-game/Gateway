import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import Log, { ClientLog } from 'simpl-loggar';
import ReqController from './reqController.js';
import SessionStore from './utils/stores/session.js';
import * as enums from '../../enums/controllers.js';
import handleErr from '../../errors/handler.js';
import * as errors from '../../errors/index.js';
import GetProfileDto from '../../modules/profile/subModules/get/dto.js';
import UserDetailsDto from '../../modules/users/subModules/details/dto.js';
import getConfig from '../../tools/configLoader.js';
import State from '../../tools/state.js';
import type { IProfileEntity } from '../../modules/profile/entity.js';
import type { IUserEntity } from '../../modules/users/entity.js';
import type ValidateTokenController from '../../modules/users/subModules/validateToken/index.js';
import type * as types from '../../types/index.js';
import type { IResponse } from '../../types/requests.js';
import type { Express } from 'express';
import { randomUUID } from 'crypto';

export default class Middleware {
  static setNoCache(_req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.set('cache-control', 'no-store');
    next();
  }

  static userValidation(app: express.Express): void {
    app.use((req: express.Request, res: IResponse, next: express.NextFunction): void => {
      const controller = State.controllers.resolve(enums.EControllers.Users);
      if (!controller) throw new errors.UnregisteredControllerError(enums.EControllers.Users);

      const subController = controller.resolve(enums.EUserActions.ValidateToken) as ValidateTokenController;
      if (!subController) throw new errors.UnregisteredControllerError(enums.EUserActions.ValidateToken);

      subController
        .execute(req, res)
        .then(({ login, userId }) => {
          if (!res.locals.user) {
            res.locals.user = { userId, login };
          } else {
            res.locals.user.login = login;
            res.locals.user.userId = userId;
          }
          res.locals.logger.createContext({ login });
          next();
        })
        .catch((err) => {
          Log.error('Middleware', 'Token validation failed');
          Log.debug('Middleware', (err as Error).message, (err as Error).stack);
          handleErr(new errors.UnauthorizedError(), res);
        });
    });
  }

  static async initUserProfile(_req: express.Request, res: IResponse, next: express.NextFunction): Promise<void> {
    try {
      // Validate if profile is initialized
      let user = await State.redis.getCachedUser(res.locals.user!.userId);

      if (!user) {
        user = await Middleware.fetchUserProfile(res.locals.user!.userId);
      }

      res.locals.profile = user.profile;
      res.locals.user = user.account;
      next();
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  }

  private static async fetchUserProfile(userId: string): Promise<types.ICachedUser> {
    const reqController = new ReqController();
    const user: types.ICachedUser = { account: undefined, profile: undefined };

    user.account = (
      await reqController.user.getDetails([new UserDetailsDto({ id: userId })], {
        userId,
      })
    ).payload[0];
    user.profile = (
      await reqController.profile.get(new GetProfileDto({ id: userId }), {
        userId,
      })
    ).payload as IProfileEntity;

    if (!user.profile || !user.account) {
      Log.error(
        'Token validation',
        `User token is valid, but there is no user related to it. This SHOULD NOT have happen and this is CRITICAL error. User sub ${userId}`,
      );
      throw new errors.UnauthorizedError();
    }

    await State.redis.addCachedUser(user as { account: IUserEntity; profile: IProfileEntity });
    return user;
  }

  generateMiddleware(app: Express): void {
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    if (getConfig().session.trustProxy) app.set('trust proxy', 1);
    app.use(
      cors({
        origin: getConfig().corsOrigin,
        credentials: true,
      }),
    );

    const helmetDirectives = helmet.contentSecurityPolicy.getDefaultDirectives();
    const allowedUrls = getConfig().corsOrigin;
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: false,
          directives: {
            ...helmetDirectives,
            'form-action': ["'self'", ...allowedUrls],
            'script-src': ["'self'"],
            'default-src': ["'self'", 'data:'],
            'frame-ancestors': ["'self'", ...allowedUrls],
            'frame-src': ["'self'", ...allowedUrls],
            'connect-src': ["'self'", ...allowedUrls],
          },
        },
      }),
    );

    app.use((_req: express.Request, res, next: express.NextFunction) => {
      res.header('Content-Type', 'application/json;charset=UTF-8');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    app.use(
      session({
        store: new SessionStore(),
        secret: getConfig().session.secret,
        resave: false,
        rolling: true,
        saveUninitialized: true,
        cookie: {
          secure: getConfig().session.secured,
          httpOnly: true,
          maxAge: 60 * 15 * 1000,
          sameSite: true,
        },
        name: 'authClient.sess',
      }),
    );

    // Log new req
    app.use((req, _res, next) => {
      try {
        const logBody: Record<string, string | Record<string, string>> = {
          method: req.method,
          path: req.path,
          ip: req.ip as string,
        };

        if (req.query) logBody.query = JSON.stringify(req.query);
        if (
          req.body !== undefined &&
          typeof req.body === 'object' &&
          Object.keys(req.body as Record<string, string>).length > 0
        ) {
          logBody.body = req.body as Record<string, string>;

          // Hide password in logs
          if (logBody.body.password) {
            logBody.body.password = '***';
          }
        }

        Log.log('New req', logBody);
        next();
      } catch (err) {
        Log.error('Middleware validation', err);
      }
    });

    // Measure req time
    app.use((req: express.Request, res: IResponse, next: express.NextFunction) => {
      res.locals.reqId = randomUUID();
      Log.time(res.locals.reqId);

      res.once('finish', () => {
        Log.endTime(res.locals.reqId, { path: req.originalUrl, method: req.method });
      });

      next();
    });
  }

  generateErrHandler(app: Express): void {
    app.use(
      (
        err: express.Errback | types.IFullError,
        req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        Log.error('Caught new generic error', `Caused by ${req.ip ?? 'unknown ip'}`, JSON.stringify(err));
        const error = err as types.IFullError;

        if (error.message.includes('is not valid JSON')) {
          Log.error('Middleware', 'Received req is not of json type', error.message, error.stack);
          const { message, name, status } = new errors.IncorrectDataType();
          res.status(status).json({ message, name });
          return;
        }

        if (error.name === 'SyntaxError') {
          Log.error('Middleware', 'Generic err', error.message, error.stack);
          const { message, code, name, status } = new errors.InternalError();
          res.status(status).json({ message, code, name });
          return;
        }

        if (error.code !== undefined) {
          const { message, code, name, status } = error;
          res.status(status).json({ message, code, name });
          return;
        }

        Log.error('Middleware', 'Generic err', error.message, error.stack);
        const { message, code, name, status } = new errors.InternalError();
        res.status(status).json({ message, code, name });
      },
    );
  }

  initializeControllers(app: express.Express): void {
    app.use((_req: express.Request, res: IResponse, next: express.NextFunction) => {
      res.locals.reqController = new ReqController();
      res.locals.logger = new ClientLog();
      next();
    });
  }
}
