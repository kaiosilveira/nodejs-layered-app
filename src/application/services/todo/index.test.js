import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import TodoService from './index.js';
import * as errors from './errors.js';
import * as errorSeverities from '../../enumerators/error-severities.js';
import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';
import DateTimeUtils from '../../../domain/utils/date-time/index.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const user = { _id: uuid(), username: 'kaio' };
const ctx = { actionUUID: uuid(), authenticatedUser: user };
const due = new Date();
const title = 'Learn how to create scalable NodeJS apps';
const createdTodo = { _id: uuid(), title };
const error = new Error('error');
const logger = chai.spy.interface({ error: noop });

describe('TodoService', () => {
  describe('add', () => {
    it('should throw an error if todo has no title', () => {
      return new TodoService()
        .add({ args: { title: undefined }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, severity }) => {
          message.should.be.eql(errors.INVALID_TODO_TITLE().msg);
          severity.should.be.eql(errorSeverities.CORRECTABLE);
        }).should.not.be.rejected;
    });

    it('should add a default due date if todo does not have one', () => {
      const defaultDueDate = DateTimeUtils.nextHour();
      const createdTodoWithDefaultDueDate = { ...createdTodo, due: defaultDueDate };
      const todoRepository = chai.spy.interface({
        create: async () => Promise.resolve(createdTodoWithDefaultDueDate),
      });

      const todo = { title, due: undefined };
      return new TodoService({ dataAccessLayer: { repositories: { todoRepository } } })
        .add({ args: todo, ctx })
        .then(({ payload }) => {
          payload.should.be.eql(createdTodoWithDefaultDueDate);
          todoRepository.create.should.have.been.called.with({
            args: { title, due: defaultDueDate, ownerId: user._id },
            ctx,
          });
        });
    });

    it('should use the todo due date if there is one', () => {
      const createdTodoWithDefaultDueDate = { ...createdTodo, due };
      const todoRepository = chai.spy.interface({
        create: async () => Promise.resolve(createdTodoWithDefaultDueDate),
      });

      const todo = { title, due };
      return new TodoService({ dataAccessLayer: { repositories: { todoRepository } } })
        .add({ args: todo, ctx })
        .then(({ payload }) => {
          payload.should.be.eql(createdTodoWithDefaultDueDate);
          todoRepository.create.should.have.been.called.with({
            args: { title, due, ownerId: user._id },
            ctx,
          });
        });
    });

    it('should handle unexpected errors from repository', () => {
      const todo = { title, due };
      const todoRepository = chai.spy.interface({ create: async () => Promise.reject(error) });
      return new TodoService({ dataAccessLayer: { repositories: { todoRepository } }, logger })
        .add({ args: todo, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, severity }) => {
          message.should.be.eql('Failed to add todo');
          severity.should.be.eql(errorSeverities.UNEXPECTED);
          todoRepository.create.should.have.been.called.with({
            args: { title, due, ownerId: user._id },
            ctx,
          });
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        });
    });
  });
});
