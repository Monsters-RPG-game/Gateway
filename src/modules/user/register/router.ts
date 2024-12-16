import Router from './index.js';
import handleErr from '../../../errors/utils.js';
import type * as types from '../../../types/index.js';

const service = new Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags:
 *       - user
 *     description: Register user
 *     security: []
 *     requestBody:
 *       description: Request body for user registration
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ICreateMapDto'
 *     responses:
 *       200:
 *         description: Success. User registered.
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/NoDataProvidedError'
 *                 - $ref: '#/components/schemas/MissingArgError'
 *                 - $ref: '#/components/schemas/IncorrectArgError'
 */
service.router.post('/register', async (req, res) => {
  try {
    await service.post(req, res);
    res.status(200).send();
  } catch (err) {
    handleErr(err as types.IFullError, res);
  }
});

export default service;