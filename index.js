import http from 'http';
import express from 'express';
import winston from 'winston';
import crypto from 'crypto-js';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

import { ExpressAppFactory } from './src/app.js';

const PORT = process.env.PORT;

const env = {
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  DB_HOST: process.env.DB_HOST,
  DB_NAME: process.env.DB_NAME,
  DB_PROTOCOL: process.env.DB_PROTOCOL,
  DB_PORT: process.env.DB_PORT,
};

const libs = { mongoose, express, winston, crypto, uuid };

http
  .createServer(ExpressAppFactory.create({ libs, env }))
  .listen(PORT, () => console.log(`🚀 Server running at ${PORT}`));
