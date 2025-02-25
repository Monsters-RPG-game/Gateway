import Client from '../../modules/clients/model.js';
import OidcClient from '../../modules/oidcClients/model.js';

export default {
  async up(): Promise<undefined | number> {
    const client = new Client({
      clientId: 'register',
      redirectUrl: 'http://127.0.0.1/register',
      failUrl: 'http://127.0.0.1/failFallback',
    });
    await client.save();

    const oidcClient = new OidcClient({
      clientId: 'oidcClient',
      clientSecret: 'superSecretPassword',
      clientGrant: 'authorization_code,refresh_token',
      redirectUrl: 'http://127.0.0.1/login',
      redirectLogoutUrl: 'http://127.0.0.1/logout',
    });
    await oidcClient.save();

    return 2;
  },

  async down(): Promise<void> {
    await Client.findOneAndDelete({ client_id: 'register' });
    await OidcClient.findOneAndDelete({ clientId: 'oidcClient' });
  },
};
