import express from 'express';
import winston from 'winston';
import crypto from 'crypto-js';

import { configureLogger } from './kernel/logger/create.js';
import createSecurityResource from './presentation/resources/security/index.js';

export const createApp = () => {
  const app = express();
  app.use(express.json());

  const logger = configureLogger({ winston });

  const config = {
    libs: { express, crypto },
    env: { ENCRYPTION_KEY: process.env.ENCRYPTION_KEY },
    logger,
  };
  const securityResource = createSecurityResource(config);

  app.use(`/${securityResource.path}`, securityResource.router);

  return app;
};
