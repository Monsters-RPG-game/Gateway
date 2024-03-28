import RemoveUserDto from './dto';
import { NoPermissionToRemoveAccount } from '../../../../errors';
import State from '../../../../state';
import RouterFactory from '../../../../tools/abstracts/router';
import { revokeUserToken } from '../../../../tools/token';
import type { IUsersTokens } from '../../../../types';
import type express from 'express';
import type Provider from 'oidc-provider';

export default class UserRouter extends RouterFactory {
  private _provider: Provider | undefined;

  private get provider(): Provider {
    return this._provider as Provider;
  }

  private set provider(value: Provider) {
    this._provider = value;
  }

  init(provider: Provider): void {
    this.provider = provider;
  }

  async delete(_req: express.Request, res: express.Response): Promise<void> {
    const locals = res.locals as IUsersTokens;
    const { user } = locals;

    await State.redis.addAccountToRemove(user?._id as string);
  }

  async post(req: express.Request, res: express.Response): Promise<void> {
    const locals = res.locals as IUsersTokens;
    const { reqHandler, user } = locals;

    const data = new RemoveUserDto(req.body as RemoveUserDto, user?._id as string);
    const canRemove = await State.redis.getAccountToRemove(user?._id as string);
    if (!canRemove) throw new NoPermissionToRemoveAccount();

    await reqHandler.user.delete(data, { userId: locals.userId, tempId: locals.tempId });
    await revokeUserToken(
      this.provider,
      ((req.cookies as Record<string, string>)['monsters.uid'] as string) ??
        (req.headers.authorization !== undefined ? req.headers.authorization.split('Bearer')[1]!.trim() : undefined),
    );
    await State.redis.removeCachedUser(locals.userId as string);
    await State.redis.removeAccountToRemove(user?._id as string);
  }
}
