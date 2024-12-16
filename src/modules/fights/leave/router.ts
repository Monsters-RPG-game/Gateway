import Router from './index.js';
import handleErr from '../../../errors/utils.js';
import type * as types from '../../../types/index.js';

const service = new Router();

/**
 * @openapi
 * /fights/leave:
 *   get:
 *     tags:
 *       - fights
 *     description: Leave fight
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success. Left fight.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IProfileUpdateEntity'
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/MissingArgError'
 *                 - $ref: '#/components/schemas/IncorrectArgError'
 *               description: Either required arguments are missing or provided arguments are incorrect.
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
service.router.get('/leave', async (req, res) => {
  try {
    const data = await service.get(req, res);
    res.status(200).send(data);
  } catch (err) {
    handleErr(err as types.IFullError, res);
  }
});

export default service;