import RemoveCharacterDto from './dto.js';
import RouterFactory from '../../../../tools/abstracts/router.js';
import type { IRemoveCharacterDto } from './types';
import type * as types from '../../../../types/index.d.js';
import type express from 'express';

export default class NpcRouter extends RouterFactory {
  async remove(req: express.Request, res: express.Response): Promise<void> {
    const locals = res.locals as types.IUsersTokens;
    const { reqHandler } = locals;

    const data = new RemoveCharacterDto(req.body as IRemoveCharacterDto);

    await reqHandler.npc.remove(data, {
      userId: locals.userId,
      tempId: locals.tempId,
    });
  }
}