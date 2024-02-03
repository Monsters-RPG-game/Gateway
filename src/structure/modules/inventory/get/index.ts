import RouterFactory from '../../../../tools/abstracts/router';
import type { IInventoryEntity } from './types';
import type { IUsersTokens } from '../../../../types';
import type express from 'express';

export default class InventoryGetDto extends RouterFactory {
  async get(res: express.Response): Promise<IInventoryEntity> {
    const locals = res.locals as IUsersTokens;
    const { reqHandler } = locals;

    return (
      await reqHandler.inventory.get({
        userId: locals.userId,
        validated: locals.validated,
        tempId: locals.tempId,
      })
    ).payload;
  }
}
