import Router from './index.js';
import { EControllers, EUserActions } from '../../../../../enums/controllers.js';
import { ETokens } from '../../../../../enums/tokens.js';
import { ETTL } from '../../../../../enums/ttl.js';
import handleErr from '../../../../../errors/handler.js';
import getConfig from '../../../../../tools/configLoader.js';
import { limitRate, sendResponse } from '../../../utils/index.js';
import type * as types from '../../../../../types/index.js';
import type express from 'express';
import type { CookieOptions } from 'express';

/**
 * Initialize routes for refreshing login tokens.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.RefreshToken);

  service.router.get('/refresh', limitRate, async (req: express.Request, res: types.IResponse) => {
    try {
      const token = await service.execute(req, res);
      const options: CookieOptions = {
        maxAge: ETTL.UserAccessToken * 1000,
        httpOnly: getConfig().session.secured ? true : false,
        secure: getConfig().session.secured ? true : false,
        sameSite: getConfig().session.secured ? true : false,
      };
      const accessOptions: CookieOptions = {
        ...options,
        maxAge: ETTL.UserAccessToken * 1000,
        domain: getConfig().myDomain,
      };

      if (typeof token === 'string') {
        res.cookie(ETokens.Access, token, accessOptions);
        res.sendStatus(200);
        return;
      }

      const { accessToken, refreshToken, sessionToken } = token as {
        sessionToken: string | undefined;
        refreshToken: string;
        accessToken: string;
      };

      const refreshOptions: CookieOptions = {
        ...options,
        maxAge: ETTL.UserRefreshToken * 1000,
        path: '/user/refresh',
        domain: getConfig().myDomain,
      };
      const sessionOptions: CookieOptions = {
        ...options,
        maxAge: ETTL.UserSessionToken * 1000,
        path: '/user/refresh',
      };

      res.cookie(ETokens.Access, accessToken, accessOptions);
      res.cookie(ETokens.Refresh, refreshToken, refreshOptions);
      res.cookie(ETokens.SessionToken, sessionToken, sessionOptions);
      sendResponse(res, undefined);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
