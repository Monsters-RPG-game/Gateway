import type { IKeyEntity } from './entity.js';
import type mongoose from 'mongoose';

export interface IKey extends IKeyEntity, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}
