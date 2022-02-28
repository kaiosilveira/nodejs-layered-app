import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import ResponseStub from '../../../../test/utils/libs/express/index.js';
import * as httpCodes from '../../enumerators/http-codes.js';
import AuthenticationMiddleware from './index.js';
import { v4 as uuid } from 'uuid';

chai.use(spies);
chai.use(asPromised);
chai.should();

const token = 'token';
const JWT_SIGNING_KEY = 'key';
const user = { _id: uuid(), username: 'kaio' };
const context = { actionUUID: uuid() };

describe.only('AuthenticationMiddleware', () => {
  let res;
  beforeEach(() => {
    res = new ResponseStub();
  });

  it('should return 401 (UNAUTHORIZED) if request has no authentication token', () => {
    const req = { headers: { Authorization: undefined } };
    const next = chai.spy();
    const result = new AuthenticationMiddleware().hook(req, res, next);
    result.status.should.be.eql(httpCodes.UNAUTHORIZED);
    result.body.msg.should.be.eql('Unauthorized');
  });

  it('should return 401 (UNAUTHORIZED) if it fails to decrypt', () => {
    const req = { headers: { Authorization: token } };
    const next = chai.spy();
    const error = new Error('error');
    const jwt = chai.spy.interface({
      verify: () => {
        throw error;
      },
    });

    const result = new AuthenticationMiddleware({ libs: { jwt }, env: { JWT_SIGNING_KEY } }).hook(
      req,
      res,
      next
    );
    jwt.verify.should.have.been.called.with(token, JWT_SIGNING_KEY);
    result.status.should.be.eql(httpCodes.UNAUTHORIZED);
    result.body.msg.should.be.eql('Unauthorized');
  });

  it('should move next in the stack if it succeeds', () => {
    const req = { headers: { Authorization: token }, context };
    const next = chai.spy();
    const jwt = chai.spy.interface({ verify: () => user });

    new AuthenticationMiddleware({ libs: { jwt }, env: { JWT_SIGNING_KEY } }).hook(req, res, next);

    req.context.authenticatedUser.should.be.eql(user);
    jwt.verify.should.have.been.called.with(token, JWT_SIGNING_KEY);
    next.should.have.been.called();
  });
});
