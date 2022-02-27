import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';

import setupRouter from './router.js';

chai.use(spies);
chai.should();

describe('SecurityRouter', () => {
  it('should bind the routes', () => {
    const expressRouter = chai.spy.interface({ post: noop });
    const controller = { add: noop };
    setupRouter({ expressRouterInstance: expressRouter, controller });
    expressRouter.post.should.have.been.nth(1).called.with('/', controller.add);
  });
});
