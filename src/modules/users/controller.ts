import UsersRepository from './repository/index.js';
import DebugController from './subModules/debug/index.js';
import RefreshTokenController from './subModules/refreshToken/index.js';
import RemoveAccountController from './subModules/removeAccount/index.js';
import RegisterController from './subModules/startRegister/index.js';
import ClientModel from '../../connections/mongo/models/client.js';
import OidcClientModel from '../../connections/mongo/models/oidcClient.js';
import UserModel from '../../connections/mongo/models/user.js';
import * as enums from '../../enums/index.js';
import AbstractController from '../../tools/abstractions/controller.js';
import ClientsRepository from '../clients/repository/index.js';
import DetailsController from './subModules/details/index.js';
import FinishLogoutController from './subModules/finishLogout/index.js';
import FinishRegisterController from './subModules/finishRegister/index.js';
import LoginController from './subModules/login/index.js';
import StartLogoutController from './subModules/startLogout/index.js';
import ValidateTokenController from './subModules/validateToken/index.js';
import OidcClientsRepository from '../oidcClients/repository/index.js';

export default class UsersController extends AbstractController<enums.EControllers.Users> {
  /**
   * Register user controllers.
   * @returns Void.
   */
  protected init(): void {
    const userRepo = new UsersRepository(UserModel);
    const oidcClientRepo = new OidcClientsRepository(OidcClientModel);
    const clientRepo = new ClientsRepository(ClientModel);

    this.register(enums.EUserActions.Debug, new DebugController());
    this.register(enums.EUserActions.StartRegister, new RegisterController(clientRepo));
    this.register(enums.EUserActions.Details, new DetailsController());
    this.register(enums.EUserActions.FinishLogout, new FinishLogoutController(clientRepo));
    this.register(enums.EUserActions.FinishRegister, new FinishRegisterController(userRepo));
    this.register(enums.EUserActions.Login, new LoginController(clientRepo, oidcClientRepo, userRepo));
    this.register(enums.EUserActions.RefreshToken, new RefreshTokenController(userRepo));
    this.register(enums.EUserActions.RemoveAccount, new RemoveAccountController(oidcClientRepo, userRepo));
    this.register(enums.EUserActions.StartLogout, new StartLogoutController());
    this.register(enums.EUserActions.ValidateToken, new ValidateTokenController(userRepo));
  }
}