import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import TodoRepository from './index.js';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';
import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

const todo = { title: 'Learn Ruby', due: new Date(), ownerId: uuid() };
const ctx = { actionUUID: uuid() };

describe('TodoRepository', () => {
  describe('create', () => {
    it('should add a todo', () => {
      const createdTodo = { ...todo, _id: uuid() };
      const model = chai.spy.interface({ create: async () => Promise.resolve(createdTodo) });
      return new TodoRepository({ model }).create({ args: todo, ctx }).then(({ payload }) => {
        payload.should.be.eql(createdTodo);
        model.create.should.have.been.called.with(todo);
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
          model.create.should.have.been.called.with(todo);
          message.should.be.eql('Failed to perform "create" operation');
        }).should.not.be.rejected;
    });
  });
});
