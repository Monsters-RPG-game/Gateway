import type mongoose from 'mongoose';

export interface IOidcClientEntity {
  _id?: string | mongoose.Types.ObjectId;
  clientId: string;
  clientSecret: string;
  redirectLogoutUrl: string;
  clientGrant: string;
  redirectUrl: string;
}
