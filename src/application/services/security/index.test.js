import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';

import asPromised from 'chai-as-promised';
import * as errorSeverities from '../../enumerators/error-severities.js';
import * as errors from './errors.js';
import SecurityService from './index.js';
import unexpectedPromiseResolutionGuard from '../../../../test/utils/guards/unexpected-promise-resolution.js';
import { v4 as uuid } from 'uuid';

chai.use(spies);
chai.use(asPromised);
chai.should();

const username = 'kaio';
const password = 'kaio123';
const encryptedPwd = 'encrypted-pwd';
const token = 'jwt-token';
const user = { _id: uuid(), username, password: encryptedPwd };
const ctx = { actionUUID: uuid() };
const logger = chai.spy.interface({ error: noop });
const error = new Error('Error');

describe('SecurityService', () => {
  afterEach(() => {
    chai.spy.restore(logger);
  });

  describe('register', () => {
    it('should throw an error if username is not defined', () => {
      return new SecurityService()
        .register({ args: { username: undefined, password } })
        .catch(({ message, severity, code }) => {
          const error = errors.INVALID_USERNAME();
          code.should.be.eql(error.code);
          message.should.be.eql(error.msg);
          severity.should.be.eql(errorSeverities.CORRECTABLE);
        }).should.not.be.rejected;
    });

    it('should throw an error if password is not defined', () => {
      return new SecurityService()
        .register({ args: { username, password: undefined } })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, severity, code }) => {
          const error = errors.INVALID_PASSWORD();
          code.should.be.eql(error.code);
          message.should.be.eql(error.msg);
          severity.should.be.eql(errorSeverities.CORRECTABLE);
        }).should.not.be.rejected;
    });

    it('should register an user and hash her password', () => {
      const registeredUser = { _id: uuid(), username };
      const cryptoService = chai.spy.interface({ hash: () => ({ payload: encryptedPwd }) });
      const usersRepository = chai.spy.interface({
        create: async () => Promise.resolve({ payload: registeredUser }),
      });

      return new SecurityService({
        applicationLayer: { services: { cryptoService } },
        dataAccessLayer: { repositories: { usersRepository } },
      })
        .register({ args: { username, password }, ctx })
        .then(({ payload }) => {
          payload.should.be.eql(registeredUser);
          cryptoService.hash.should.have.been.called.with({ args: password });
          usersRepository.create.should.have.been.called.with({
            args: { username, password: encryptedPwd },
            ctx,
          });
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors when hashing the password', () => {
      const cryptoService = chai.spy.interface({
        hash: () => {
          throw error;
        },
      });

      return new SecurityService({
        applicationLayer: { services: { cryptoService } },
        dataAccessLayer: { repositories: {} },
        logger,
      })
        .register({ args: { username, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(ex => {
          const { msg, code, severity } = errors.UNEXPECTED();
          ex.message.should.be.eql(msg);
          ex.code.should.be.eql(code);
          ex.severity.should.be.eql(severity);
          cryptoService.hash.should.have.been.called.with({ args: password });
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        }).should.not.be.rejected;
    });
  });

  describe('login', () => {
    it('should throw an error if username is not defined', () => {
      return new SecurityService()
        .authenticate({ args: { username: undefined, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, code, severity }) => {
          const err = errors.INVALID_USERNAME();
          message.should.be.eql(err.msg);
          code.should.be.eql(err.code);
          severity.should.be.eql(err.severity);
        }).should.not.be.rejected;
    });

    it('should throw an error if password is not defined', () => {
      return new SecurityService()
        .authenticate({ args: { username, password: undefined }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, code, severity }) => {
          const err = errors.INVALID_PASSWORD();
          message.should.be.eql(err.msg);
          code.should.be.eql(err.code);
          severity.should.be.eql(err.severity);
        }).should.not.be.rejected;
    });

    it('should throw an error if user was not found', () => {
      const usersRepository = chai.spy.interface({
        getBy: async () => Promise.resolve({ payload: undefined }),
      });

      return new SecurityService({
        dataAccessLayer: { repositories: { usersRepository } },
      })
        .authenticate({ args: { username, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, code, severity }) => {
          const err = errors.USER_NOT_FOUND();
          message.should.be.eql(err.msg);
          code.should.be.eql(err.code);
          severity.should.be.eql(err.severity);
          usersRepository.getBy.should.have.been.called.with({ args: { username } });
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors when fetching user', () => {
      const usersRepository = chai.spy.interface({ getBy: async () => Promise.reject(error) });
      return new SecurityService({
        dataAccessLayer: { repositories: { usersRepository } },
        logger,
      })
        .authenticate({ args: { username, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, code, severity }) => {
          const err = errors.UNEXPECTED();
          message.should.be.eql(err.msg);
          code.should.be.eql(err.code);
          severity.should.be.eql(err.severity);
          usersRepository.getBy.should.have.been.called.with({ args: { username } });
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        }).should.not.be.rejected;
    });

    it('should throw an error if passwords does not match', () => {
      const cryptoService = chai.spy.interface({
        hash: () => ({ payload: `${encryptedPwd}wrong` }),
      });

      const usersRepository = chai.spy.interface({
        getBy: async () => Promise.resolve({ payload: user }),
      });

      return new SecurityService({
        applicationLayer: { services: { cryptoService } },
        dataAccessLayer: { repositories: { usersRepository } },
      })
        .authenticate({ args: { username, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, code, severity }) => {
          const err = errors.INVALID_CREDENTIALS();
          message.should.be.eql(err.msg);
          code.should.be.eql(err.code);
          severity.should.be.eql(err.severity);
          cryptoService.hash.should.have.been.called.with({ args: password });
        }).should.not.be.rejected;
    });

    it('should authenticate an user', () => {
      const jwtService = chai.spy.interface({ sign: () => token });
      const cryptoService = chai.spy.interface({ hash: () => ({ payload: encryptedPwd }) });
      const usersRepository = chai.spy.interface({
        getBy: async () => Promise.resolve({ payload: user }),
      });

      return new SecurityService({
        applicationLayer: { services: { cryptoService, jwtService } },
        dataAccessLayer: { repositories: { usersRepository } },
      })
        .authenticate({ args: { username, password }, ctx })
        .then(({ payload }) => {
          jwtService.sign.should.have.been.called.with({ _id: user._id, username });
          payload.should.be.eql(token);
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors when signing the JWT', () => {
      const user = { _id: uuid(), username, password: encryptedPwd };
      const cryptoService = chai.spy.interface({ hash: () => ({ payload: encryptedPwd }) });
      const usersRepository = chai.spy.interface({
        getBy: async () => Promise.resolve({ payload: user }),
      });

      const jwtService = chai.spy.interface({
        sign: () => {
          throw error;
        },
      });

      return new SecurityService({
        applicationLayer: { services: { cryptoService, jwtService } },
        dataAccessLayer: { repositories: { usersRepository } },
        logger,
      })
        .authenticate({ args: { username, password }, ctx })
        .then(unexpectedPromiseResolutionGuard)
        .catch(({ message, code, severity }) => {
          jwtService.sign.should.have.been.called.with({ _id: user._id, username });
          const err = errors.UNEXPECTED();
          message.should.be.eql(err.msg);
          code.should.be.eql(err.code);
          severity.should.be.eql(err.severity);
          logger.error.should.have.been.called.with({
            message: error.message,
            stack: error.stack,
            ...ctx,
          });
        }).should.not.be.rejected;
    });
  });
});
