import chai from 'chai';
import asPromised from 'chai-as-promised';
import http from 'chai-http';
import { createApp } from '../../../../src/app.js';
import * as httpCodes from '../../../../src/presentation/enumerators/http-codes.js';

chai.use(http);
chai.use(asPromised);
chai.should();

class SecurityResource {
  constructor({ app }) {
    this._app = app;
  }

  async register({ username, password }) {
    return await chai.request(this._app).post('/security/register').send({ username, password });
  }
}

describe('Security resource', () => {
  let app;
  beforeEach(() => {
    app = createApp();
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
        }).should.not.be.rejected;
    });
  });
});
