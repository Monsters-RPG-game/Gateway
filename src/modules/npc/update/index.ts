import RemoveCharacterDto from './dto.js';
import RouterFactory from '../../../tools/abstracts/router.js';
import type { IUpdateCharacterDto } from './types.js';
import type * as types from '../../../types/index.js';
import type express from 'express';

export default class NpcRouter extends RouterFactory {
  async remove(req: express.Request, res: express.Response): Promise<void> {
    const locals = res.locals as types.IUsersTokens;
    const { reqController } = locals;

    const data = new RemoveCharacterDto(req.body as IUpdateCharacterDto);

    await reqController.npc.update(data, {
      userId: locals.userId,
      tempId: locals.tempId,
    });
  }
}