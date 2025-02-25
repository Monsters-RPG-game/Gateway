import type ReqController from '../connections/router/reqController.js';
import type { IProfileEntity } from '../modules/profile/entity.js';
import type { IUserEntity } from '../modules/users/entity.js';
import type { Locals } from 'express';
import type { Session } from 'express-session';
import type { JWTPayload } from 'jose';
import type { ClientLog } from 'simpl-loggar';

export interface IUserLocals extends Locals {
  reqId: string;
  reqController: ReqController;
  logger: ClientLog;
  tempId: string;
  initializedProfile: boolean;
  profile: IProfileEntity | undefined;
  user: { userId: string; login: string } | undefined;

  [key: string]: unknown;
}

export interface IUserServerTokens {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
}

export interface IUserSession extends Session {
  userId?: string;
  nonce?: string;
  client?: string;
  verifier?: string;
  logout?: boolean;
}

export interface IUserBrokerInfo {
  userId: string | undefined;
  tempId?: string;
}

export interface ICachedUser {
  account: IUserEntity | undefined;
  profile: IProfileEntity | undefined;
}

export interface IUserAuthorizationsData extends JWTPayload {
  login: string;
}
