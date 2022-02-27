import chai from 'chai';
import asPromised from 'chai-as-promised';
import http from 'chai-http';

import TodoResource from './index.js';
import * as httpCodes from '../../../../src/presentation/enumerators/http-codes.js';
import AcceptanceTestServerFactory from '../../../_config/server/index.js';

chai.use(http);
chai.use(asPromised);
chai.should();

describe('Todo resource', () => {
  describe('create', () => {
    let app, dbServer;
    before(async () => {
      const serverStack = await AcceptanceTestServerFactory.create();
      app = serverStack.app;
      dbServer = serverStack.dbServer;
    });

    after(async () => {
      await app.destroy();
      await dbServer.stop();
    });

    it('should not allow to create todos without a title', () => {
      const todo = { title: 'Learn Ruby' };
      return new TodoResource({ app }).create(todo).then(({ status, body }) => {
        status.should.be.eql(httpCodes.BAD_REQUEST);
        body.msg.should.be.eql('Invalid todo title. Expected a non-empty string.');
      }).should.not.be.rejected;
    });
  });
});
