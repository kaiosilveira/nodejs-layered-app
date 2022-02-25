import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';
import JWTService from './index.js';

chai.use(spies);
chai.should();

const token = 'jwt-token';
const JWT_SIGNING_KEY = 'JWT_SIGNING_KEY';
const logger = chai.spy.interface({ error: noop });
const error = new Error('Error');
const env = { JWT_SIGNING_KEY };
const obj = { _id: '1', name: 'kaio' };
const ctx = { actionUUID: 'fadfid-fdfiads-fdsfd' };

describe('JWTService', () => {
  describe('sign', () => {
    afterEach(() => {
      chai.spy.restore(logger);
    });

    it('should sign an object and return the correspoding token', () => {
      const jwt = chai.spy.interface({ sign: () => token });
      const result = new JWTService({ libs: { jwt }, env }).sign({ args: obj });
      result.should.be.eql({ payload: token });
      jwt.sign.should.have.been.called.with(obj, JWT_SIGNING_KEY);
    });

    it('should handle signing errors', () => {
      const jwt = chai.spy.interface({
        sign: () => {
          throw error;
        },
      });

      (() => new JWTService({ libs: { jwt }, env, logger }).sign({ args: obj, ctx })).should.throw(
        'Failed to sign JWT token'
      );

      logger.error.should.have.been.called.with({
        message: error.message,
        stack: error.stack,
        ...ctx,
      });
    });
  });
});
