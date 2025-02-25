import type { IClientEntity } from '../entity.js';
import type AddClient from './add.js';

export interface IAddClient {
  clientId: string;
  failUrl: string;
  redirectUrl: string;
}

export interface IClientRepository {
  add(user: AddClient): Promise<string>;
  get(id: string): Promise<IClientEntity | null>;
  getByName(clientId: string): Promise<IClientEntity | null>;
}
