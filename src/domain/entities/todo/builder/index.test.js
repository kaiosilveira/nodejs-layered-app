import chai from 'chai';
import { v4 as uuid } from 'uuid';

import TodoBuilder from './index.js';
import Todo from '../impl/index.js';

chai.should();

const title = 'Learn Ruby';

describe('TodoBuilder', () => {
  it('should throw an error if title is not set', () => {
    (() => new TodoBuilder().build()).should.throw(
      'Insufficient parts to build a todo. Expected at least a title and a ownerId'
    );
  });

  it('should throw an error if ownerId is not set', () => {
    (() => new TodoBuilder().withTitle(title).build()).should.throw(
      'Insufficient parts to build a todo. Expected at least a title and a ownerId'
    );
  });

  it('should build a Todo', () => {
    const due = new Date();
    const result = new TodoBuilder().withTitle(title).forUser(uuid()).due(due).build();

    result.should.be.instanceOf(Todo);
    result.title.should.be.eql(title);
    result.due.should.be.eql(due);
  });
});
