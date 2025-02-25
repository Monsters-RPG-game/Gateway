import { exportJWK, generateKeyPair } from 'jose';
import Log from 'simpl-loggar';
import KeyModel from './model.js';
import AddKey from './repository/add.js';
import KeysRepository from './repository/index.js';
import type { JWK } from 'jose';

export default class Keys {
  private getKey = async (): Promise<JWK> => {
    const { privateKey } = await generateKeyPair('RS256', { modulusLength: 2048 });
    return exportJWK(privateKey);
  };

  async createKeys(amount: number = 1): Promise<string[]> {
    Log.debug('Keys', 'Creating key');

    return this.create(amount);
  }

  private async create(amount: number): Promise<string[]> {
    const repo = new KeysRepository(KeyModel);
    const actions: (() => Promise<string>)[] = [];

    for (let i = 0; i < amount; i++) {
      actions.push(async (): Promise<string> => {
        const key = await this.getKey();
        const newKey = new AddKey(key);
        Log.debug('Keys controller', 'Adding new key', newKey);
        return repo.add(newKey);
      });
    }

    return Promise.all(actions.map((a) => a()));
  }
}
