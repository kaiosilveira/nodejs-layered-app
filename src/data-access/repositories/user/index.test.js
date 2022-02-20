import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import { v4 as uuid } from 'uuid';
import UsersRepository from './index.js';
import noop from 'lodash/noop.js';

import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

describe('UsersRepository', () => {
  const username = 'kaio';
  const password = 'pwd';

  describe('create', () => {
    it('should create an user', () => {
      const createdUser = { _id: uuid(), username, password };
      const model = chai.spy.interface({ create: async () => Promise.resolve(createdUser) });
      return new UsersRepository({ model }).create({ username, password }).then(({ payload }) => {
        payload.should.be.eql(createdUser);
      }).should.not.be.rejected;
    });

    it('should handle unexpected errors', () => {
      const error = new Error('Database Error');
      const logger = chai.spy.interface({ error: noop });
      const model = chai.spy.interface({
        create: async () => {
          throw error;
        },
      });

      return new UsersRepository({ model, logger })
        .create({ username, password })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message }) => {
          message.should.be.eql('Failed to perform "create" operation');
          logger.error.should.have.been.called.with(error);
        }).should.not.be.rejected;
    });
  });
});
