import TodoBuilder from './index.js';
import DateTimeUtils from '../../../utils/date-time/index.js';
import { v4 as uuid } from 'uuid';

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

  it('should build a todo with a default due date if none is passed', () => {
    const result = new TodoBuilder().withTitle(title).forUser(uuid()).build();

    result.title.should.be.eql(title);
    result.due.should.be.eql(DateTimeUtils.nextHour());
  });

  it('should use the given due date if one is passed in', () => {
    const due = new Date();
    const result = new TodoBuilder().withTitle(title).forUser(uuid()).due(due).build();

    result.title.should.be.eql(title);
    result.due.should.be.eql(due);
  });
});
