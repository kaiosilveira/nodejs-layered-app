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
  let app, dbServer;
  beforeEach(async () => {
    const serverStack = await AcceptanceTestServerFactory.create();
    app = serverStack.app;
    dbServer = serverStack.dbServer;
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await dbServer.stop();
  });

  describe('register', () => {
    it('should allow an user to register using username and password', () => {
      const username = 'kaio';
      const password = 'kaio123';
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
