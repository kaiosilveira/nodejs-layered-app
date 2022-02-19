import express from 'express';

import SecurityService from './application/services/security/index.js';

import createSecurityResource from './presentation/resources/security/index.js';
import Logger from './kernel/logger/index.js';

export const createApp = () => {
  const app = express();
  app.use(express.json());

  const securityResource = createSecurityResource({
    libs: { express },
    applicationLayer: { services: { securityService: new SecurityService() } },
    logger: new Logger(),
  });

  app.use(`/${securityResource.path}`, securityResource.router);

  return app;
};
