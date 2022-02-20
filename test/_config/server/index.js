import express from 'express';
import crypto from 'crypto-js';
import winston from 'winston';
import mongoose from 'mongoose';

import { MongoMemoryServer } from 'mongodb-memory-server';
import { ExpressAppFactory } from '../../../src/app.js';

export default class AcceptanceTestServerFactory {
  static async create() {
    const dbServer = await MongoMemoryServer.create();
    const [DB_PROTOCOL, DB_HOST, DB_PORT] = dbServer
      .getUri()
      .split(':')
      .map(i => i.replace(/\//gi, ''));

    const config = {
      libs: { express, crypto, winston, mongoose },
      env: {
        ENCRYPTION_KEY: 'enc-key',
        DB_PROTOCOL,
        DB_HOST,
        DB_PORT,
        DB_NAME: 'test-app',
      },
    };

    const app = await ExpressAppFactory.create(config);

    return { dbServer, app };
  }
}
