import type { EMessageTypes } from '../enums/connections.js';
import type { IProfileEntity } from '../modules/profile/entity.js';

export interface IProfileUpdate {
  state: Partial<IProfileEntity>;
}

export interface IBaseBrokerResponse {
  type: Omit<EMessageTypes, EMessageTypes.Heartbeat>;
  payload: unknown;
}

export interface IDataBrokerResponse<T> {
  type: EMessageTypes.Error | EMessageTypes.Send;
  payload: T;
}

export interface ICredentialsBrokerResponse<T> {
  type: EMessageTypes.Credentials | EMessageTypes.Error;
  payload: T;
}
