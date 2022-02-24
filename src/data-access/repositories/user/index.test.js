import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import { v4 as uuid } from 'uuid';
import UsersRepository from './index.js';
import noop from 'lodash/noop.js';

import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const username = 'kaio';
const password = 'pwd';
const error = new Error();
const logger = chai.spy.interface({ error: noop });
const ctx = { actionUUID: 'action-uuid' };

describe('UsersRepository', () => {
  describe('create', () => {
    afterEach(() => {
      chai.spy.restore(logger);
    });

    it('should create an user', () => {
      const createdUser = { _id: uuid(), username, password };
      const model = chai.spy.interface({ create: async () => Promise.resolve(createdUser) });
      return new UsersRepository({ model })
        .create({ args: { username, password } })
        .then(({ payload }) => payload.should.be.eql(createdUser)).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const model = chai.spy.interface({ create: async () => Promise.reject(error) });
      return new UsersRepository({ model, logger })
        .create({ args: { username, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          message.should.be.eql('Failed to perform "create" operation');
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
      const foundObject = { _id: 'id' };
      const model = chai.spy.interface({ findOne: async () => Promise.resolve(foundObject) });
      const criteria = { field: 'value' };

      return new UsersRepository({ model }).getBy({ args: criteria }).then(({ payload }) => {
        payload.should.be.eql(foundObject);
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
