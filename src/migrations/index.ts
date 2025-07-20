import { Migrations } from '@monsters/utils';
import Log from 'simpl-loggar';
import ConfigLoader from '../tools/config/index.js';
import actions from './actions/index.js';

const migrations = new Migrations();

migrations
  .init(actions, 'Gateway', ConfigLoader.getConfig().mongoURL)
  .then(() => migrations.disconnect())
  .catch((err) => {
    Log.error('Migrations', 'Could not migrate', JSON.stringify(err, null, 2));
    migrations.disconnect();
  });
