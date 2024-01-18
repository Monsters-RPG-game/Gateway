import State from '../state';
import Logger from '../tools/logger/log';
import type * as oidc from 'oidc-provider';

export default class Adapter implements oidc.Adapter {
  private readonly _name: string;
  private readonly _prefix: string = 'oidc:';

  constructor(name: string) {
    this._name = name;
  }

  private get prefix(): string {
    return this._prefix;
  }

  private get name(): string {
    return this._name;
  }

  async upsert(id: string, payload: oidc.AdapterPayload, expiresIn?: number): Promise<void> {
    if (this.name === 'Session' && payload.authorizations) {
      await this.addGrandId(id, payload.authorizations.oidcClient!.grantId as string);
    }

    await State.redis.addOidc(this.key(id), id, payload);
    if (expiresIn && expiresIn > 0) await State.redis.setExpirationDate(this.key(id), expiresIn);
  }

  async find(id: string): Promise<oidc.AdapterPayload | undefined> {
    const data = await State.redis.getOidcHash(this.key(id), id);

    if (!data || Object.keys(data).length === 0) {
      return undefined;
    }
    return JSON.parse(data) as oidc.AdapterPayload;
  }

  async destroy(id: string): Promise<void> {
    await State.redis.removeOidcElement(this.key(id));
  }

  async findByUserCode(_userCode: string): Promise<oidc.AdapterPayload | undefined> {
    Logger.log('Find by user code', 'Not implemented');
    return new Promise((resolve) => resolve(undefined));
  }

  async findByUid(_uid: string): Promise<oidc.AdapterPayload | undefined> {
    Logger.log('Find by uid', 'Not implemented');
    return new Promise((resolve) => resolve(undefined));
  }

  async revokeByGrantId(grantId: string): Promise<void> {
    const id = await State.redis.getIdFromGrandId(this.grantId(grantId), grantId);
    await State.redis.removeOidcElement(`${this.prefix}${this.name}:${id}`);
  }

  async consume(id: string): Promise<void> {
    await State.redis.addOidc(this.key(id), '', Math.floor(Date.now() / 1000));
  }

  private key(id: string): string {
    return `${this.prefix}${this.name}:${id}`;
  }

  private grantId(grant: string): string {
    return `${this.prefix}GrantId:${grant}`;
  }

  private async addGrandId(id: string, grantId: string): Promise<void> {
    const key = this.grantId(grantId);
    await State.redis.addGrantId(key, grantId, id);
    await State.redis.setExpirationDate(key, 60);
  }
}
