import * as enums from '../../enums/index.js';
import GetHealthController from './subModules/get/index.js';
import AbstractController from '../../tools/abstractions/controller.js';

export default class HealthController extends AbstractController<enums.EControllers.Health> {
  /**
   * Register health controllers.
   * @returns Void.
   */
  protected init(): void {
    this.register(enums.EHealthActions.Get, new GetHealthController());
  }
}
