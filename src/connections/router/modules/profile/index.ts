import get from './get/router.js';
import type { Router } from 'express';

/**
 * Initialize routes for profile router.
 * @param router Express router.
 */
const initProfileRoutes = (router: Router): void => {
  const prefix = '/profile';

  router.use(prefix, get().router);
};

export default initProfileRoutes;
