import Log from 'simpl-loggar';
import Mongo from '../connections/mongo/index.js';
import KeysController from '../modules/keys/index.js';
import KeyModel from '../modules/keys/model.js';
import KeysRepository from '../modules/keys/repository/index.js';

class RotateKeys {
  private readonly _mongo: Mongo;
  private readonly _keys: KeysController;

  constructor() {
    this._mongo = new Mongo();
    this._keys = new KeysController();
  }

  private get mongo(): Mongo {
    return this._mongo;
  }

  private get keys(): KeysController {
    return this._keys;
  }

  init(): void {
    this.configLogger();
    Log.log('Keys rotation', 'Started');

    this.rotateKeys()
      .then(() => {
        Log.log('Keys rotation', 'Added new keys');
        this.close();
      })
      .catch((err) => {
        Log.error('Keys rotation', 'Could not rotate keys', (err as Error).message, (err as Error).stack);
        this.close();
        process.exit(1);
      });
  }

  private close(): void {
    try {
      this.mongo.disconnect();
    } catch (err) {
      Log.error('Keys rotation', 'Got error while closing connection to mongoDB', (err as Error).message);
    }
  }

  private async rotateKeys(): Promise<void> {
    await this.mongo.init();
    const repo = new KeysRepository(KeyModel);
    const keys = await repo.getAll();

    // #TODO This assumes that refresh token life is max 2 weeks. If longer, this will cause issues. Rewrite it to create amount of keys based on TTL enum
    if (keys.length === 3) {
      const oldest = keys.sort((a, b) => {
        const startA = new Date(a.createdAt);
        const startB = new Date(b.createdAt);

        if (startA > startB) return 1;
        if (startB > startA) return -1;
        return 0;
      })[0]!;
      await repo.remove(oldest._id.toString());
      await this.keys.createKeys();
    } else {
      await this.keys.createKeys(3 - keys.length);
    }
  }

  private configLogger(): void {
    Log.setPrefix('monsters');
  }
}

new RotateKeys().init();
