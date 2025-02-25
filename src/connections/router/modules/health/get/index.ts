import AbstractRouter from '../../../../../tools/abstractions/router.js';
import type { EControllers, EHealthActions } from '../../../../../enums/controllers.js';
import type { IHealth } from '../../../../../modules/health/subModules/get/types.js';

export default class InventoryRouter extends AbstractRouter<EControllers.Health, EHealthActions.Get> {
  async execute(): Promise<IHealth> {
    return this.controller.execute();
  }
}
