import type mongoose from 'mongoose';

export interface ITokenEntity {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  ttl: string;
  accessToken: string;
  refreshToken: string;
}
