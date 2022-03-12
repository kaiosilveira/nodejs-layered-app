import { v4 } from 'uuid';
import User from './index.js';

const id = v4();
const username = 'kaio';
const registeredAt = new Date();

describe('User', () => {
  it('should be instantiable', () => {
    const result = new User({ id, username, registeredAt });
    result.id.should.be.eql(id);
    result.username.should.be.eql(username);
    result.registeredAt.should.be.eql(registeredAt);
  });

  describe('toJSON', () => {
    it('should create a JSON representation of ifself', () => {
      const result = new User({ id, username, registeredAt }).toJSON();
      (result instanceof User).should.be.false;
      result.id.should.be.eql(id);
      result.username.should.be.eql(username);
      result.registeredAt.should.be.eql(registeredAt);
    });
  });
});
