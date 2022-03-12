import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import TodoRepository from './index.js';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';

import Todo from '../../../domain/entities/todo/impl/index.js';
import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';
import { asMongoDBResult } from '../../../../test/utils/db/index.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const title = 'Learn Ruby';
const due = new Date();
const ownerId = uuid();
const todo = new Todo({ title, due, ownerId });
const ctx = { actionUUID: uuid() };

describe('TodoRepository', () => {
  describe('create', () => {
    it('should add a todo', () => {
      const createdTodo = { title, due, ownerId, _id: uuid() };
      const model = chai.spy.interface({
        create: async () => Promise.resolve(asMongoDBResult(createdTodo)),
      });

      return new TodoRepository({ model }).create({ args: todo, ctx }).then(({ payload }) => {
        payload.should.be.instanceOf(Todo);
        payload.id.should.be.eql(createdTodo._id);
        payload.title.should.be.eql(createdTodo.title);
        payload.due.should.be.eql(createdTodo.due);
        payload.ownerId.should.be.eql(createdTodo.ownerId);
        model.create.should.have.been.called.with(todo.toJSON());
      }).should.not.be.rejected;
    });

    it('should handle unexpected errors from database model', () => {
      const error = new Error('error');
      const logger = chai.spy.interface({ error: noop });
      const model = chai.spy.interface({ create: async () => Promise.reejct(error) });
      return new TodoRepository({ model, logger })
        .create({ args: todo, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          model.create.should.have.been.called.with(todo.toJSON());
          message.should.be.eql('Failed to perform "create" operation');
        }).should.not.be.rejected;
    });
  });
});
