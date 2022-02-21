import chai from 'chai';
import spies from 'chai-spies';
import ResponseStub from '../../../../test/utils/libs/express/index.js';

import IncomingRequestMiddleware from './index.js';

chai.use(spies);
chai.should();

describe('IncomingRequestMiddleware', () => {
  it('should create a context for the request with an actionUUID', () => {
    const generatedUUID = 'action-uuid';
    const generateUUID = chai.spy(() => generatedUUID);
    const next = chai.spy();

    const req = {};
    const res = new ResponseStub();

    new IncomingRequestMiddleware({ generateUUID }).hook(req, res, next);

    req.context.actionUUID.should.be.eql(generatedUUID);
    generateUUID.should.have.been.called.once();
    next.should.have.been.called.once();
  });
});
