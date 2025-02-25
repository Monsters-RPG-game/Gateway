import type mongoose from 'mongoose';

export interface IClientEntity {
  _id?: string | mongoose.Types.ObjectId;
  clientId: string;
  failUrl: string;
  redirectUrl: string;
}
