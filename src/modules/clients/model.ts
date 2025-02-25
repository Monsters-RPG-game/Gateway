import mongoose from 'mongoose';
import { EDbCollections } from '../../enums/index.js';
import type { IClient } from './types.js';

export const clientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    required: [true, 'Client_id not provided'],
  },
  redirectUrl: {
    type: String,
    required: [true, 'Redirect_urls not provided'],
  },
  failUrl: {
    type: String,
    required: [true, 'Fail url not provided'],
  },
});

const Client = mongoose.model<IClient>('Clients', clientSchema, EDbCollections.Clients);
export default Client;
