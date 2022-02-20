import LoggerFactory from './kernel/logger/index.js';
import MongooseFactory from './data-access/factories/mongoose/index.js';
import createSecurityResource from './presentation/resources/security/index.js';

export class ExpressAppFactory {
  static async create({ libs, env }) {
    const winston = libs.winston;
    const express = libs.express;
    const logger = LoggerFactory.create({ winston });
    const dbConn = await MongooseFactory.createConnection({ libs, env, logger });
    const config = { libs, env, logger, dbConn };
    const app = express();
    app.use(express.json());

    const securityResource = createSecurityResource(config);

    app.use(`/${securityResource.path}`, securityResource.router);

    return app;
  }
}
