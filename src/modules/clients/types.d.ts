import type { IClientEntity } from './entity.js';
import type mongoose from 'mongoose';

export interface IClient extends IClientEntity, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}
