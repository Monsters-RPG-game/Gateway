import Router from './index.js';
import handleErr from '../../../errors/utils.js';
import type * as types from '../../../types/index.js';

const service = new Router();

/**
 * @openapi
 * /profile:
 *   post:
 *     tags:
 *       - profile
 *     description: Add user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Request body for adding a user profile
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/IAddProfileDto'
 *     responses:
 *       200:
 *         description: Success. Empty response.
 *       400:
 *         description: Bad request.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/NoDataProvidedError'
 *                 - $ref: '#/components/schemas/MissingArgError'
 *                 - $ref: '#/components/schemas/IncorrectArgError'
 *       401:
 *         description: User not logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 */
service.router.post('/', async (req, res) => {
  try {
    const data = await service.post(req, res);
    res.status(200).send(data);
  } catch (err) {
    handleErr(err as types.IFullError, res);
  }
});

export default service;
