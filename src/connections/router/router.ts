import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import Middleware from './middleware.js';
import initHealthRoutes from './modules/health/index.js';
import initMessagesRoutes from './modules/messages/index.js';
import initProfileRoutes from './modules/profile/index.js';
import { initSecuredUserRoutes, initUserRoutes } from './modules/user/index.js';
import { FourOhFour } from '../../errors/index.js';
import State from '../../tools/state.js';
import type express from 'express';
import type swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';

export default class AppRouter {
  private readonly _router: express.Router;

  constructor(router: express.Router) {
    this._router = router;
  }

  private get router(): express.Router {
    return this._router;
  }

  initRoutes(): void {
    this.initGenericRoutes();

    initUserRoutes(this.router);
    initHealthRoutes(this.router);
  }

  initSecuredRoutes(app: express.Express): void {
    Middleware.userValidation(app);

    this.router.use(Middleware.initUserProfile);

    initProfileRoutes(this.router);

    initSecuredUserRoutes(this.router);
    initMessagesRoutes(this.router);
  }

  initWebsocket(app: express.Express): void {
    app.get('/ws', (req, _res) => {
      State.socket.server.handleUpgrade(req, req.socket, Buffer.from(''), (socket) => {
        State.socket.server.emit('connection', socket, req);
      });
    });
  }

  initGenericRoutes(): void {
    // Disable favico route
    this.router.all('/favicon.ico', (_req, res) => {
      res.sendStatus(404);
    });
  }

  initFourOhFour(app: express.Express): void {
    app.all('*', (_req, res) => {
      const { status, code, message, name } = new FourOhFour();

      res.status(status).send({
        error: {
          message,
          code,
          name,
        },
      });
    });
  }

  generateDocumentation(): void {
    const jsonPackage = JSON.parse(fs.readFileSync('package.json').toString()) as Record<string, string>;
    const options: swaggerJsdoc.Options = {
      definition: {
        openapi: '3.0.1',
        description: 'This is a REST API for monsters game',
        servers: [
          {
            url: 'http://localhost',
            description: 'Development server',
          },
        ],
        info: {
          title: 'Monsters API doc',
          version: jsonPackage.version as string,
        },
        component: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: [
        './src/modules/*/docs.ts',
        './src/modules/*/subModules/*/index.ts',
        './src/modules/*/subModules/*/dto.ts',
        './src/connections/router/modules/*/*/router.ts',
        './src/connections/router/modules/*/*/index.ts',
        './src/errors/index.ts',
        './build/src/modules/*/docs.js',
        './build/src/modules/*/subModules/*/index.js',
        './build/src/modules/*/subModules/*/dto.js',
        './build/src/connections/router/modules/*/*/router.js',
        './build/src/connections/router/modules/*/*/index.js',
        './build/src/errors/index.js',
      ],
    };

    const swaggerSpec = swaggerJSDoc(options);
    this.router.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    this.router.get('docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }
}
