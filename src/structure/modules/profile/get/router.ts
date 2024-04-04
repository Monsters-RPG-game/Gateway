import Router from './index.js';
import handleErr from '../../../../errors/utils.js';
import limitRate from '../../../utils.js';
import type * as types from '../../../../types/index.d.js';

const service = new Router();

/**
 * @openapi
 * /profile:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - profile
 *     description: Get user profile
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: User name
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IProfileEntity'
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
service.router.get('/', limitRate, async (req, res) => {
  try {
    const data = await service.get(req, res);
    res.status(200).send({ data });
  } catch (err) {
    handleErr(err as types.IFullError, res);
  }
});

export default service;
