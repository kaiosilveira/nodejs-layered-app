import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import noop from 'lodash/noop.js';

import MongooseFactory from './index.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const DB_PROTOCOL = 'mongodb';
const DB_HOST = 'localhost';
const DB_PORT = '27017';
const DB_NAME = 'test_db';
const env = { DB_PROTOCOL, DB_HOST, DB_PORT, DB_NAME };

class Schema {}

describe('MongooseFactory', () => {
  describe('createConnection', () => {
    it('should create a database connection', () => {
      const logger = chai.spy.interface({ info: noop });
      const connection = chai.spy.interface({ model: noop });
      const mongoose = { Schema, createConnection: () => connection };
      const libs = { mongoose };

      const spyOnCreateConnection = chai.spy.on(mongoose, 'createConnection');

      const todoSchema = { name: 'todo', def: { title: String, due: { type: Date } } };
      const userSchema = {
        name: 'user',
        def: {
          username: String,
          password: String,
          registeredAt: { type: Date, default: Date.now },
        },
      };

      const schemas = [userSchema, todoSchema];
      return MongooseFactory.createConnection({ libs, env, schemas, logger }).then(() => {
        spyOnCreateConnection.should.have.been.called.with(
          `${DB_PROTOCOL}://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 3000,
            socketTimeoutMS: 8000,
          }
        );

        connection.model.should.have.been.called.with(userSchema.name, new Schema(userSchema.def));
        connection.model.should.have.been.called.with(todoSchema.name, new Schema(todoSchema.def));
        logger.info.should.have.been.called.with({ message: 'Database connection created' });
      }).should.not.be.rejected;
    });
  });
});
