import get from './get/router.js';
import type { Router } from 'express';

const initHealthRoutes = (router: Router): void => {
  const prefix = '/health';

  router.use(prefix, get().router);
};

export default initHealthRoutes;
