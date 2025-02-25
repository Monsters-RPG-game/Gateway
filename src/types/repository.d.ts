import type * as enums from '../enums/index.js';
import type { IClientEntity } from '../modules/clients/entity.js';
import type AddClient from '../modules/clients/repository/add.js';
import type { IKeyEntity } from '../modules/keys/entity.js';
import type AddKey from '../modules/keys/repository/add.js';
import type { IOidcClientEntity } from '../modules/oidcClients/entity.js';
import type AddOidcClient from '../modules/oidcClients/repository/add.js';
import type { ITokenEntity } from '../modules/tokens/entity.js';
import type AddToken from '../modules/tokens/repository/add.js';

export interface IRepositoryGetData {
  [enums.EModules.Client]: IClientEntity | null;
  [enums.EModules.OidcClient]: IOidcClientEntity | null;
  [enums.EModules.Token]: ITokenEntity | null;
  [enums.EModules.Key]: IKeyEntity | null;
}

export interface IRepositoryAddData {
  [enums.EModules.Client]: AddClient;
  [enums.EModules.OidcClient]: AddOidcClient;
  [enums.EModules.Token]: AddToken;
  [enums.EModules.Key]: AddKey;
}

export interface IGenericRepository<T extends enums.EModules> {
  get(id: string): Promise<IRepositoryGetData[T]>;
  add(data: IRepositoryAddData[T]): Promise<string>;
}
