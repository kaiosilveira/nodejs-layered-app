import chai from 'chai';
import asPromised from 'chai-as-promised';
import http from 'chai-http';

import TodoResource from './index.js';
import SecurityResource from '../security/index.js';
import * as httpCodes from '../../../../src/presentation/enumerators/http-codes.js';
import AcceptanceTestServerFactory from '../../../_config/server/index.js';

chai.use(http);
chai.use(asPromised);
chai.should();

const username = 'kaio';
const password = '123';

describe('Todo resource', () => {
  describe('create', () => {
    let app, dbServer, token;
    before(async () => {
      const serverStack = await AcceptanceTestServerFactory.create();
      app = serverStack.app;
      dbServer = serverStack.dbServer;

      const credentials = { username, password };
      const secResource = new SecurityResource({ app });
      await secResource.register(credentials);
      const loginResp = await secResource.login(credentials);
      token = loginResp.body.token;
    });

    after(async () => {
      await app.destroy();
      await dbServer.stop();
    });

    it('should return bad request if todo object has not a title', () => {
      return new TodoResource({ app })
        .create({ todo: { title: undefined }, token })
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.BAD_REQUEST);
          body.msg.should.be.eql('Invalid todo title. Expected a non-empty string.');
        }).should.not.be.rejected;
    });

    it('should allow an user to register a todo with just a title', () => {
      const title = 'Learn Ruby';
      const todo = { title };
      return new TodoResource({ app }).create({ todo, token }).then(({ status, body }) => {
        status.should.be.eql(httpCodes.CREATED);
        body.title.should.be.eql(title);
        body.id.should.be.a('string');
      }).should.not.be.rejected;
    });
  });
});
