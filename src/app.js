import LoggerFactory from './kernel/logger/index.js';
import MongooseFactory from './data-access/factories/mongoose/index.js';
import createSecurityResource from './presentation/resources/security/index.js';
import createTodoResource from './presentation/resources/todo/index.js';
import configureMiddleware from './presentation/middleware/index.js';

export class ExpressApp {
  constructor({ appInstance, dbConn, logger }) {
    this._instance = appInstance;
    this._dbConn = dbConn;
    this._logger = logger;
  }

  get instance() {
    return this._instance;
  }

  async destroy() {
    this._logger.info({ message: 'Clearing up server resources...' });
    await this._dbConn.close();
    this._instance = null;
    this._logger.info({ message: 'Server resources cleared' });
  }
}

export class ExpressAppFactory {
  static async create({ libs, env }) {
    const winston = libs.winston;
    const express = libs.express;
    const logger = LoggerFactory.createInstance({ winston });
    const dbConn = await MongooseFactory.createConnection({ libs, env, logger });
    const config = { libs, env, logger, dbConn };
    const app = express();
    app.use(express.json());

    const middleware = configureMiddleware(config);
    app.use(middleware.incomingRequestMiddleware.hook);
    app.use(middleware.outgoingResponseMiddleware.hook);

    const securityResource = createSecurityResource({ ...config, middleware });
    const todoResource = createTodoResource({ ...config, middleware });

    app.use(`/${securityResource.path}`, securityResource.router);
    app.use(`/${todoResource.path}`, todoResource.router);

    return new ExpressApp({ appInstance: app, dbConn, logger });
  }
}
