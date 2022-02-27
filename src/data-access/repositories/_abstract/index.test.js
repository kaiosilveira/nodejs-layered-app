import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';

import Repository from './index.js';
import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const obj = { field: 'value' };
const ctx = { actionUUID: uuid() };
const error = new Error('error');
const logger = chai.spy.interface({ error: noop });

describe('Repository', () => {
  describe('create', () => {
    it('should create an object', () => {
      const createdObj = { ...obj, _id: uuid() };
      const model = chai.spy.interface({ create: async () => Promise.resolve(createdObj) });
      return new Repository({ model }).create({ args: obj, ctx }).then(({ payload }) => {
        payload.should.be.eql(createdObj);
        model.create.should.have.been.called.with(obj);
      }).should.not.be.rejected;
    });

    it('should handle unexpected errors from database model', () => {
      const model = chai.spy.interface({ create: async () => Promise.reejct(error) });
      return new Repository({ model, logger })
        .create({ args: obj, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          model.create.should.have.been.called.with(obj);
          message.should.be.eql('Failed to perform "create" operation');
        }).should.not.be.rejected;
    });
  });

  describe('getBy', () => {
    afterEach(() => {
      chai.spy.restore(logger);
    });

    it('should throw an error if no criteria was given', () => {
      return new Repository()
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

      return new Repository({ model }).getBy({ args: criteria }).then(({ payload }) => {
        payload.should.be.eql(foundObject);
        model.findOne.should.have.been.called.with(criteria);
      }).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const criteria = { field: 'value' };
      const model = chai.spy.interface({ findOne: async () => Promise.reject(error) });
      return new Repository({ model, logger })
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
