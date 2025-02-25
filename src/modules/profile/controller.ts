import * as enums from '../../enums/index.js';
import GetProfileController from './subModules/get/index.js';
import AbstractController from '../../tools/abstractions/controller.js';

export default class ProfileController extends AbstractController<enums.EControllers.Profile> {
  /**
   * Register profile controllers.
   * @returns Void.
   */
  protected init(): void {
    this.register(enums.EProfileActions.Get, new GetProfileController());
  }
}
