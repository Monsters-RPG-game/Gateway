import add from './add/router.js';
import get from './get/router.js';
import type { Router } from 'express';

const initSkillsRoutes = (router: Router): void => {
  const prefix = '/skills';

  router.use(prefix, get.router).use(prefix, add.router);
};

export default initSkillsRoutes;