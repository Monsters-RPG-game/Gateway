import type { IOidcClientEntity } from './entity.js';
import type mongoose from 'mongoose';

export interface IOidcClient extends IOidcClientEntity, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}
