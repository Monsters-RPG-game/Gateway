import Log from 'simpl-loggar';
import Router from './index.js';
import { EControllers, ETTL, ETokens, EUserActions } from '../../../../../enums/index.js';
import handleErr from '../../../../../errors/handler.js';
import ConfigLoader from '../../../../../tools/config/index.js';
import { limitRate } from '../../../utils/index.js';
import type { ILoginReq } from './types.js';
import type * as types from '../../../../../types/index.js';
import type { CookieOptions } from 'express';

/**
 * Initialize routes for logging in.
 * @returns Initialized router.
 */
export default (): Router => {
  const service = new Router(EControllers.Users, EUserActions.Login);

  service.router.get('/login', limitRate, async (req: ILoginReq, res: types.IResponse) => {
    try {
      const data = await service.execute(req, res);
      if (typeof data === 'string') {
        res.redirect(data);
        return;
      }

      const options: CookieOptions = {
        httpOnly: ConfigLoader.getConfig().session.secured ? true : false,
        secure: ConfigLoader.getConfig().session.secured ? true : false,
        sameSite: ConfigLoader.getConfig().session.secured ? true : false,
      };
      if (ConfigLoader.getConfig().tokens.domain) {
        options.domain = ConfigLoader.getConfig().myDomain;
      }
      const accessOptions: CookieOptions = {
        ...options,
        maxAge: ETTL.UserAccessToken * 1000,
      };
      const refreshOptions: CookieOptions = {
        ...options,
        maxAge: ETTL.UserRefreshToken * 1000,
        path: '/user/refresh',
      };
      const sessionOptions: CookieOptions = {
        ...options,
        maxAge: ETTL.UserSessionToken * 1000,
        path: '/user/refresh',
      };

      Log.debug('Login router', 'Data', data);
      const { url, accessToken, refreshToken, sessionToken } = data as {
        url: string;
        accessToken: string;
        refreshToken: string;
        sessionToken: string;
      };

      res.cookie(ETokens.Access, accessToken, accessOptions);
      res.cookie(ETokens.Refresh, refreshToken, refreshOptions);
      res.cookie(ETokens.SessionToken, sessionToken, sessionOptions);
      Log.debug('Login router', `Moving user to ${url}`);
      res.redirect(url);
    } catch (err) {
      handleErr(err as types.IFullError, res);
    }
  });

  return service;
};
