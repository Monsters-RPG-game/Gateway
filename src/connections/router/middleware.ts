import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import Log from 'simpleLogger';
import ReqController from './reqController.js';
import limitRate from './utils/index.js';
import * as enums from '../../enums/index.js';
import * as errors from '../../errors/index.js';
import handleErr from '../../errors/utils.js';
import GetDetailedSkillsDto from '../../modules/skills/getDetailed/dto.js';
import UserDetailsDto from '../../modules/user/details/dto.js';
import State from '../../tools/state.js';
import SessionStore from './utils/stores/session.js';
import GetProfileDto from '../../modules/profile/get/dto.js';
import getConfig from '../../tools/configLoader.js';
import type { IProfileEntity } from '../../modules/profile/entity.js';
import type { IUserEntity } from '../../modules/user/entity.js';
import type * as types from '../../types/index.js';

export default class Middleware {
  static setNoCache(_req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.set('cache-control', 'no-store');
    next();
  }
  static userValidation(app: express.Express): void {
    app.use((_req: express.Request, _res: express.Response, next: express.NextFunction): void => {
      // if (Middleware.shouldSkipUserValidation(req)) {
      //  return next();
      // }
      //
      // try {
      //  const token =
      //    ((req.cookies as Record<string, string>)['monsters.uid'] as string) ??
      //    (req.headers.authorization !== undefined
      //      ? (req.headers.authorization.split('Bearer')?.[1] ?? '').trim()
      //      : undefined);
      //  const userToken = await validateToken(token);
      //  res.locals.userId = userToken.accountId;
      // } catch (_err) {
      //  // Access token is invalid. Check if session is valid
      //  const sessionId = (req.cookies as Record<string, string>)._session as string;
      //  const userSession = await State.provider.Session.find(sessionId);
      //
      //  if (!userSession) {
      //    Log.error('Token validation error', 'No token nor session');
      //    return handleErr(new errors.UnauthorizedError(), res);
      //  }
      //
      //  res.locals.userId = userSession.accountId;
      // }

      return next();
    });
  }

  static validateAdmin(_req: express.Request, res: express.Response, next: express.NextFunction): void {
    const { user } = res.locals as types.IUsersTokens;

    if (!user || user.type !== enums.EUserTypes.Admin) throw new errors.NoPermission();
    next();
  }

  static async initUserProfile(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const reqController = new ReqController();

    if (Middleware.shouldSkipUserValidation(req)) {
      return next();
    }

    try {
      const userId = res.locals.userId as string;
      // Validate if profile is initialized
      let user = await State.redis.getCachedUser(userId);

      if (!user) {
        user = await Middleware.fetchUserProfile(res, userId);
      }

      res.locals.profile = user.profile;
      res.locals.user = user.account;

      let skills = await State.redis.getCachedSkills(userId);
      if (!skills) {
        skills = (
          await reqController.skills.getDetailed(new GetDetailedSkillsDto(user.profile!.skills), {
            userId,
            tempId: '',
          })
        ).payload;

        await State.redis.addCachedSkills(skills, userId);
      }

      return next();
    } catch (err) {
      return handleErr(err as types.IFullError, res);
    }
  }

  static async userProfileValidation(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<void> {
    if (Middleware.shouldSkipUserValidation(req)) {
      return next();
    }

    try {
      const { user } = res.locals as types.IUsersTokens;
      let { profile } = res.locals as types.IUsersTokens;
      if (!profile) {
        const dbUser = await Middleware.fetchUserProfile(res, (res.locals as types.IUsersTokens).userId as string);
        // eslint-disable-next-line prefer-destructuring
        profile = dbUser.profile;
      }

      if (!profile?.initialized && user?.type !== enums.EUserTypes.Admin) {
        throw new errors.ProfileNotInitialized();
      }

      return next();
    } catch (_err) {
      return handleErr(new errors.ProfileNotInitialized(), res);
    }
  }

  private static shouldSkipUserValidation(req: express.Request): boolean {
    // Disable token validation for oidc routes
    const oidcRoutes = ['.well-known', 'me', 'auth', 'token', 'session', 'certs'];
    const splitRoute = req.path.split('/');
    return splitRoute.length > 1 && oidcRoutes.includes(splitRoute[1] as string);
  }

  private static async fetchUserProfile(res: express.Response, userId: string): Promise<types.ICachedUser> {
    const reqController = new ReqController();
    const user: types.ICachedUser = { account: undefined, profile: undefined };

    user.account = (
      await reqController.user.getDetails([new UserDetailsDto({ id: userId })], {
        userId,
        tempId: (res.locals.tempId ?? '') as string,
      })
    ).payload[0];
    user.profile = (
      await reqController.profile.get(new GetProfileDto(userId), {
        userId,
        tempId: (res.locals.tempId ?? '') as string,
      })
    ).payload;

    if (!user.profile || !user.account) {
      Log.error(
        'Token validation',
        'User tried to log in using token, that got validated, but there is no user related to token. Is token fake ?',
      );
      throw new errors.IncorrectTokenError();
    }

    await State.redis.addCachedUser(user as { account: IUserEntity; profile: IProfileEntity });
    return user;
  }

  generateMiddleware(app: express.Express): void {
    app.use(express.json({ limit: '500kb' }));
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
        },
        name: 'authClient.sess',
      }),
    );

    app.set('views', 'public');
    app.use('/public', express.static('public/static'));
    app.get('/favicon.ico', (_req, res) => {
      res.status(404).send();
    });
    app.set('view engine', 'ejs');

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
          if (req.path.includes('interaction') || req.path.includes('register') || req.path.includes('remove')) {
            logBody.body = { ...(req.body as Record<string, string>) };

            if (logBody.body.password) {
              logBody.body.password = '***';
            }
          } else {
            logBody.body = req.body as Record<string, string>;
          }
        }

        Log.log('New req', logBody);
        next();
      } catch (err) {
        Log.error('Middleware validation', err);
      }
    });

    app.use(limitRate);
  }

  generateErrHandler(app: express.Express): void {
    app.use(
      (
        err: express.Errback | types.IFullError,
        req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        Log.error(`Caught new generic error caused by ${req.ip ?? 'unknown ip'}`, JSON.stringify(err));
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

  initializeHandler(app: express.Express): void {
    app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.locals.reqController = new ReqController();
      next();
    });
  }
}