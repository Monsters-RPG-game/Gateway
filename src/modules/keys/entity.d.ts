import type { JWK } from 'jose';
import type mongoose from 'mongoose';

export interface IKeyEntity extends JWK {
  _id: string | mongoose.Types.ObjectId;
  createdAt: string;
}
