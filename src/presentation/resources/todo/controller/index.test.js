import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';

import TodoController from './index.js';
import * as errors from './errors.js';
import * as httpCodes from '../../../enumerators/http-codes.js';
import ResponseStub from '../../../../../test/utils/libs/express/index.js';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const title = 'Learn how to scale NodeJS apps';
const user = { _id: uuid(), username: 'kaio' };
const ctx = { actionUUID: uuid(), authenticatedUser: user };
const error = new Error('error');
const logger = chai.spy.interface({ error: noop });

describe('TodoController', () => {
  let res;
  beforeEach(() => {
    res = new ResponseStub();
    chai.spy.restore(logger);
  });

  describe('add', () => {
    it('should not add a todo without a title', () => {
      const req = { body: { title: undefined } };
      const res = new ResponseStub();
      return new TodoController().add(req, res).then(({ status, body }) => {
        status.should.be.eql(httpCodes.BAD_REQUEST);
        body.should.be.eql(errors.INVALID_TODO_TITLE());
      }).should.not.be.rejected;
    });

    it('should add a todo with a title', () => {
      const createdTodo = { _id: uuid(), title };
      const todoService = chai.spy.interface({ add: async () => Promise.resolve(createdTodo) });
      const req = { body: { title }, context: ctx };

      return new TodoController({ applicationLayer: { services: { todoService } } })
        .add(req, res)
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.CREATED);
          body.should.be.eql(createdTodo);
          todoService.add.should.have.been.called.with({ args: { title, due: undefined }, ctx });
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const todoService = chai.spy.interface({ add: async () => Promise.reject(error) });
      const req = { body: { title }, context: ctx };

      return new TodoController({ applicationLayer: { services: { todoService } }, logger })
        .add(req, res)
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.INTERNAL_SERVER_ERROR);
          body.should.be.eql(errors.UNEXPECTED());
          todoService.add.should.have.been.called.with({ args: { title, due: undefined }, ctx });
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        }).should.not.be.rejected;
    });
  });
});
