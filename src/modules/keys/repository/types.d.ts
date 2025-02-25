import type { IKeyEntity } from '../entity.js';
import type AddKey from './add.js';

export interface IAddKey {
  kty: string;
  n: string;
  e: string;
  d: string;
  p: string;
  q: string;
  dp: string;
  dq: string;
  qi: string;
}

export interface IKeyRepository {
  add(user: AddKey): Promise<string>;
  get(id: string): Promise<IKeyEntity | null>;
  getAll(): Promise<IKeyEntity[]>;
}
