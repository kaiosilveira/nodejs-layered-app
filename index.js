import http from 'http';
import express from 'express';
import winston from 'winston';
import crypto from 'crypto-js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { ExpressAppFactory } from './src/app.js';

const PORT = process.env.PORT;
const libs = { mongoose, express, winston, crypto, uuid, jwt };
const env = {
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PROTOCOL: process.env.DB_PROTOCOL,
  DB_PORT: process.env.DB_PORT,
  JWT_SIGNING_KEY: process.env.JWT_SIGNING_KEY,
};

bootstrap();
async function bootstrap() {
  const expressApp = await ExpressAppFactory.create({ libs, env });

  http
    .createServer(expressApp.instance)
    .listen(PORT, () => console.log(`🚀 Server running at ${PORT}`));

  const die = async () => {
    await expressApp.destroy();
    process.exit(0);
  };

  process.on('SIGINT', die);
  process.on('SIGTERM', die);
}
