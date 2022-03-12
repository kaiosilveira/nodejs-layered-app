import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import { v4 as uuid } from 'uuid';
import UsersRepository from './index.js';
import noop from 'lodash/noop.js';

import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';
import User from '../../../domain/entities/user/impl/index.js';
import { asMongoDBResult } from '../../../../test/utils/db/index.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const username = 'kaio';
const password = 'pwd';
const error = new Error();
const logger = chai.spy.interface({ error: noop });
const ctx = { actionUUID: 'action-uuid' };
const user = new User({ username, password });

describe('UsersRepository', () => {
  describe('create', () => {
    afterEach(() => {
      chai.spy.restore(logger);
    });

    it('should create an user', () => {
      const createdUser = { _id: uuid(), username, password };
      const model = chai.spy.interface({
        create: async () => Promise.resolve(asMongoDBResult(createdUser)),
      });

      return new UsersRepository({ model }).create({ args: user, ctx }).then(({ payload }) => {
        payload.should.be.instanceOf(User);
        payload.id.should.be.eql(createdUser._id);
        payload.username.should.be.eql(createdUser.username);
        model.create.should.have.been.called.with(user.toJSON());
      }).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const model = chai.spy.interface({ create: async () => Promise.reject(error) });
      return new UsersRepository({ model, logger })
        .create({ args: user, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          message.should.be.eql('Failed to perform "create" operation');
          model.create.should.have.been.called.with(user.toJSON());
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        }).should.not.be.rejected;
    });
  });

  describe('getBy', () => {
    afterEach(() => {
      chai.spy.restore(logger);
    });

    it('should throw an error if no criteria was given', () => {
      return new UsersRepository()
        .getBy({ args: undefined })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          message.should.be.eql('Invalid criteria given to "getBy" operation. Expected an object.');
        }).should.not.be.rejected;
    });

    it('should perform a query with a given criteria', () => {
      const criteria = { username };
      const foundObject = { _id: 'id', ...criteria };
      const model = chai.spy.interface({
        findOne: async () => Promise.resolve(asMongoDBResult(foundObject)),
      });

      return new UsersRepository({ model }).getBy({ args: criteria }).then(({ payload }) => {
        payload.should.be.instanceOf(User);
        payload.id.should.be.eql(foundObject._id);
        payload.username.should.be.eql(foundObject.username);
        model.findOne.should.have.been.called.with(criteria);
      }).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const criteria = { field: 'value' };
      const model = chai.spy.interface({ findOne: async () => Promise.reject(error) });

      return new UsersRepository({ model, logger })
        .getBy({ args: criteria, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          message.should.be.eql('Failed to perform "getBy" operation');
          model.findOne.should.have.been.called.with(criteria);
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        }).should.not.be.rejected;
    });
  });
});
