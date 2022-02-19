import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import { v4 as uuid } from 'uuid';
import noop from 'lodash/noop.js';

import SecurityController from './index.js';
import * as errors from './errors.js';
import * as httpCodes from '../../../enumerators/http-codes.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

describe('SecurityController', () => {
  const username = 'kaio';
  const password = 'kaio123';

  let res, logger, ctx, error;
  beforeEach(() => {
    error = new Error('Unexpected error');
    logger = chai.spy.interface({ error: noop });
    ctx = { actionUUID: uuid() };
    res = chai.spy.interface({
      status(code) {
        this._statusCode = code;
        return this;
      },
      json(body) {
        return { status: this._statusCode || httpCodes.OK, body };
      },
    });
  });

  describe('register', () => {
    it('should return bad request if username is not defined', () => {
      const req = { body: { username: undefined, password } };
      return new SecurityController().register(req, res).then(({ status, body }) => {
        status.should.be.eql(httpCodes.BAD_REQUEST);
        body.should.be.eql(errors.INVALID_USERNAME());
      }).should.not.be.rejected;
    });

    it('should return bad request if password is not defined', () => {
      const req = { body: { username, password: undefined } };
      return new SecurityController().register(req, res).then(({ status, body }) => {
        status.should.be.eql(httpCodes.BAD_REQUEST);
        body.should.be.eql(errors.INVALID_PASSWORD());
      }).should.not.be.rejected;
    });

    it('should register an user', () => {
      const req = { body: { username, password }, context: ctx };
      const createdUser = Object.assign({ username }, { _id: uuid() });
      const securityService = chai.spy.interface({
        register: async () => Promise.resolve(createdUser),
      });

      return new SecurityController({ applicationLayer: { services: { securityService } } })
        .register(req, res)
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.CREATED);
          body.should.be.eql(createdUser);
          securityService.register.should.have.been.called.with({ args: { username, password }, ctx });
        }).should.not.be.rejected;
    });

    it('should handle service errors', () => {
      const req = { body: { username, password }, context: ctx };
      const securityService = chai.spy.interface({
        register: async () => {
          throw error;
        },
      });

      return new SecurityController({ applicationLayer: { services: { securityService } }, logger })
        .register(req, res)
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.INTERNAL_SERVER_ERROR);
          body.should.be.eql(errors.UNEXPECTED());

          const { message, stack } = error;
          logger.error.should.have.been.called.with({ message, stack, ...ctx });
          securityService.register.should.have.been.called.with({ args: { username, password }, ctx });
        }).should.not.be.rejected;
    });
  });

  describe('login', () => {
    it('should return bad request if username is not defined', () => {
      const req = { body: { username: undefined, password } };
      return new SecurityController().login(req, res).then(({ status, body }) => {
        status.should.be.eql(httpCodes.BAD_REQUEST);
        body.should.be.eql(errors.INVALID_USERNAME());
      }).should.not.be.rejected;
    });

    it('should return bad request if password is not defined', () => {
      const req = { body: { username, password: undefined } };
      return new SecurityController().login(req, res).then(({ status, body }) => {
        status.should.be.eql(httpCodes.BAD_REQUEST);
        body.should.be.eql(errors.INVALID_PASSWORD());
      }).should.not.be.rejected;
    });

    it('should allow an user to login', () => {
      const req = { body: { username, password }, context: ctx };
      const token = 'jwt-token';
      const securityService = chai.spy.interface({
        authenticate: async () => Promise.resolve(token),
      });
      return new SecurityController({ applicationLayer: { services: { securityService } } })
        .login(req, res)
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.OK);
          body.token.should.be.eql(token);
          securityService.authenticate.should.have.been.called.with({
            args: { username, password },
            ctx,
          });
        });
    });

    it('should handle unexpected service errors', () => {
      const req = { body: { username, password }, context: ctx };
      const securityService = chai.spy.interface({
        authenticate: async () => {
          throw error;
        },
      });

      return new SecurityController({ applicationLayer: { services: { securityService } }, logger })
        .login(req, res)
        .then(({ status, body }) => {
          status.should.be.eql(httpCodes.INTERNAL_SERVER_ERROR);
          body.should.be.eql(errors.UNEXPECTED());

          const { message, stack } = error;
          logger.error.should.have.been.called.with({ message, stack, ...ctx });
          securityService.authenticate.should.have.been.called.with({
            args: { username, password },
            ctx,
          });
        });
    });
  });
});
