import { Migrations } from '@monsters/utils';
import Log from 'simpl-loggar';
import getConfig from '../tools/configLoader.js';
import actions from './actions/index.js';

const migrations = new Migrations();

migrations
  .init(actions, 'Gateway', getConfig().mongoURL)
  .then(() => migrations.disconnect())
  .catch((err) => {
    Log.error('Migrations', 'Could not migrate', JSON.stringify(err, null, 2));
    migrations.disconnect();
  });
