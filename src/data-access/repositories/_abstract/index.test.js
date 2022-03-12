import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';

import BaseEntity from '../../../domain/entities/_base/index.js';
import Repository from './index.js';
import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';
import { asMongoDBResult } from '../../../../test/utils/db/index.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

class MyEntityCtz extends BaseEntity {
  constructor({ id, field }) {
    super({ id });
    this._field = field;
  }

  get field() {
    return this._field;
  }

  toJSON() {
    return { field: this._field };
  }
}

const value = 'value';
const entityInstance = new MyEntityCtz({ value });
const ctx = { actionUUID: uuid() };
const error = new Error('error');
const logger = chai.spy.interface({ error: noop });

describe('Repository', () => {
  describe('create', () => {
    it('should create an object', () => {
      const createdObj = { field: value, _id: uuid() };
      const model = chai.spy.interface({
        create: async () => Promise.resolve(asMongoDBResult(createdObj)),
      });

      return new Repository({ model, entityCtor: MyEntityCtz })
        .create({ args: entityInstance, ctx })
        .then(({ payload }) => {
          payload.should.be.instanceOf(MyEntityCtz);
          payload.id.should.be.eql(createdObj._id);
          payload.field.should.be.eql(value);
          model.create.should.have.been.called.with(entityInstance.toJSON());
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors from database model', () => {
      const model = chai.spy.interface({ create: async () => Promise.reejct(error) });
      return new Repository({ model, logger })
        .create({ args: entityInstance, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          model.create.should.have.been.called.with(entityInstance.toJSON());
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
      const criteria = { field: 'value' };
      const foundObject = { _id: 'id', ...criteria };
      const model = chai.spy.interface({
        findOne: async () => Promise.resolve(asMongoDBResult(foundObject)),
      });

      return new Repository({ model, entityCtor: MyEntityCtz })
        .getBy({ args: criteria })
        .then(({ payload }) => {
          payload.should.be.instanceOf(MyEntityCtz);
          payload.id.should.be.eql(foundObject._id);
          payload.field.should.be.eql(criteria.field);
          model.findOne.should.have.been.called.with(criteria);
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const criteria = { field: 'value' };
      const model = chai.spy.interface({ findOne: async () => Promise.reject(error) });
      return new Repository({ entityCtor: MyEntityCtz, model, logger })
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
