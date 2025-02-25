import express from 'express';
import Log from 'simpl-loggar';
import Middleware from './middleware.js';
import AppRouter from './router.js';
import getConfig from '../../tools/configLoader.js';
import http from 'http';

export default class Router {
  private readonly _middleware: Middleware;
  private readonly _app: express.Express;
  private readonly _router: AppRouter;
  private _server: http.Server | undefined = undefined;

  constructor() {
    this._app = express();
    this._middleware = new Middleware();
    this._router = new AppRouter(this.app);
  }

  get app(): express.Express {
    return this._app;
  }

  get router(): AppRouter {
    return this._router;
  }

  private get middleware(): Middleware {
    return this._middleware;
  }

  private get server(): http.Server {
    return this._server!;
  }

  init(): void {
    this.initDocumentation();
    this.initMiddleware();
    this.initWebsocket();
    this.initRouter();
    this.initServer();
    this.initSecuredRouter();
    this.initFourOhFour();
    this.initErrHandler();
  }

  /**
   * Close server.
   */
  close(): void {
    Log.log('Server', 'Closing');
    if (!this.server) return;

    this.server.closeAllConnections();
    this.server.close();
  }

  /**
   * Initialize middleware to handle express.
   */
  private initMiddleware(): void {
    this.middleware.generateMiddleware(this.app);
    this.middleware.initializeControllers(this.app);
  }

  /**
   * Init err handler, catching errors in whole app.
   */
  private initErrHandler(): void {
    this.middleware.generateErrHandler(this.app);
  }

  /**
   * Init swagger documentation.
   */
  private initDocumentation(): void {
    this.router.generateDocumentation();
  }

  /**
   * Init basic routes.
   */
  private initRouter(): void {
    this.router.initRoutes();
  }

  /**
   * Init secured routes.
   */
  private initSecuredRouter(): void {
    this.router.initSecuredRoutes(this.app);
  }

  /**
   * Init websocket upgrade route.
   */
  private initWebsocket(): void {
    this.router.initWebsocket(this.app);
  }

  /**
   * Init websocket upgrade route.
   */
  private initFourOhFour(): void {
    this.router.initFourOhFour(this.app);
  }

  /**
   * Initialize http server.
   */
  private initServer(): void {
    if (process.env.NODE_ENV === 'test') return;
    this._server = http.createServer(this.app);

    this.server.listen(getConfig().httpPort, () => {
      Log.log('Server', `Listening on ${getConfig().httpPort}`);
    });
  }
}
