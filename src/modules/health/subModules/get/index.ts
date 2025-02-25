import State from '../../../../tools/state.js';
import type { IHealth } from './types.js';
import type { IAbstractSubController } from '../../../../types/abstractions.js';

export default class GetHealthController implements IAbstractSubController<IHealth> {
  async execute(): Promise<IHealth> {
    return new Promise((resolve) => {
      resolve(State.broker.getHealth());
    });
  }
}
