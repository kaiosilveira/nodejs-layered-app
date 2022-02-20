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

describe('SecurityService', () => {
  const username = 'kaio';
  const password = 'kaio123';

  let logger, ctx;
  beforeEach(() => {
    logger = chai.spy.interface({ error: noop });
    ctx = { actionUUID: uuid() };
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
      const encryptedPwd = 'encrypted-pwd';
      const cryptoService = chai.spy.interface({ hash: () => ({ payload: encryptedPwd }) });
      const usersRepository = chai.spy.interface({
        create: async () => Promise.resolve({ payload: registeredUser }),
      });

      return new SecurityService({
        applicationLayer: { services: { cryptoService } },
        dataAccessLayer: { repositories: { usersRepository } },
      })
        .register({ args: { username, password } })
        .then(({ payload }) => {
          payload.should.be.eql(registeredUser);
          cryptoService.hash.should.have.been.called.with({ args: password });
          usersRepository.create.should.have.been.called.with({ username, password: encryptedPwd });
        }).should.not.be.rejected;
    });

    it('should handle unexpected errors when hashing the password', () => {
      const error = new Error('Failed to create string hash');
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
    it('should throw an error if username is not defined');
    it('should throw an error if password is not defined');
    it('should authenticate an user');
    it('should handle unexpected errors when signing the JWT');
  });
});
