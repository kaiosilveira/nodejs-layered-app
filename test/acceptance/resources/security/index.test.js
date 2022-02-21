import chai from 'chai';
import asPromised from 'chai-as-promised';
import http from 'chai-http';
import mongoose from 'mongoose';

import SecurityResource from './index.js';
import * as httpCodes from '../../../../src/presentation/enumerators/http-codes.js';
import AcceptanceTestServerFactory from '../../../_config/server/index.js';

chai.use(http);
chai.use(asPromised);
chai.should();

describe('Security resource', () => {
  const username = 'kaio';
  const password = 'kaio123';

  describe('register', () => {
    let app, dbServer;
    before(async () => {
      const serverStack = await AcceptanceTestServerFactory.create();
      app = serverStack.app;
      dbServer = serverStack.dbServer;
    });

    after(async () => {
      await mongoose.disconnect();
      await dbServer.stop();
      app = null;
    });

    it('should return bad request if username is not defined', () => {
      return new SecurityResource({ app })
        .register({ username: undefined, password })
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.BAD_REQUEST);
          body.msg.should.be.eql('Invalid username, expected a string');
        }).should.not.be.rejected;
    });

    it('should return bad request if password is not defined', () => {
      return new SecurityResource({ app })
        .register({ username, password: undefined })
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.BAD_REQUEST);
          body.msg.should.be.eql('Invalid password, expected a string');
        }).should.not.be.rejected;
    });

    it('should allow an user to register using username and password', () => {
      return new SecurityResource({ app })
        .register({ username, password })
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.CREATED);
          body._id.should.be.a('string');
          body.username.should.be.eql(username);
          body.password.should.not.be.eql(password);
        }).should.not.be.rejected;
    });
  });
});
