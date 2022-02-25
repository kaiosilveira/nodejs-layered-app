import express from 'express';
import crypto from 'crypto-js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { ExpressAppFactory } from '../../../src/app.js';
import fakeWiston from '../mocks/winston.js';

export default class AcceptanceTestServerFactory {
  static async create() {
    const dbServer = await MongoMemoryServer.create();
    const [DB_PROTOCOL, DB_HOST, DB_PORT] = dbServer
      .getUri()
      .split(':')
      .map(i => i.replace(/\//gi, ''));

    const config = {
      libs: { express, crypto, winston: fakeWiston, mongoose, uuid, jwt },
      env: {
        ENCRYPTION_KEY: 'enc-key',
        DB_NAME: 'test-app',
        DB_PROTOCOL,
        DB_HOST,
        DB_PORT,
        JWT_SIGNING_KEY: 'signing-key',
      },
    };

    const app = await ExpressAppFactory.create(config);

    return { dbServer, app };
  }
}
