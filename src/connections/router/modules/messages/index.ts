import get from './get/router.js';
import getUnread from './getUnread/router.js';
import read from './read/router.js';
import send from './send/router.js';

import type { Router } from 'express';

const initMessagesRoutes = (router: Router): void => {
  const prefix = '/message';

  router
    .use(prefix, get().router)
    .use(prefix, send().router)
    .use(prefix, getUnread().router)
    .use(prefix, read().router);
};

export default initMessagesRoutes;
