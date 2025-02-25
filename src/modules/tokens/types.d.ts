import type { ITokenEntity } from './entity.js';
import type mongoose from 'mongoose';

export interface IToken extends ITokenEntity, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}
