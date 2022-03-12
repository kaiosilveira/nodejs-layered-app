import chai from 'chai';
import { v4 as uuid } from 'uuid';

import Todo from './index.js';
import DateTimeUtils from '../../../utils/date-time/index.js';

chai.should();

const title = 'Learn Ruby';
const id = uuid();
const due = new Date();
const ownerId = uuid();

describe('Todo', () => {
  it('should have a title, owner and a due date', () => {
    const product = new Todo({ title, due, ownerId });
    product.title.should.be.eql(title);
    product.due.should.be.eql(due);
    product.ownerId.should.be.eql(ownerId);
  });

  it('should set the due datetime to the next hour if none is passed in', () => {
    const product = new Todo({ title, ownerId });
    product.due.should.be.eql(DateTimeUtils.nextHour());
  });

  describe('toJSON', () => {
    it('should return a JSON representation of itself', () => {
      const instance = new Todo({ id, title, ownerId, due });
      const result = instance.toJSON();
      result.id.should.be.eql(instance.id);
      result.ownerId.should.be.eql(instance.ownerId);
      result.due.should.be.eql(instance.due);
      result.title.should.be.eql(instance.title);
    });
  });
});
