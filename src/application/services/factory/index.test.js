import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';

import TodoService from '../todo/index.js';
import CryptoService from '../crypto/index.js';
import SecurityService from '../security/index.js';
import ApplicationServiceFactory from './index.js';

chai.use(spies);
chai.should();

describe('ApplicationServiceFactory', () => {
  let logger, dbConn, config;
  beforeEach(() => {
    dbConn = chai.spy.interface({ model: noop });
    logger = chai.spy.interface({ child: noop });
    config = {
      applicationLayer: { services: {} },
      dataAccessLayer: { repositories: {} },
      libs: {},
      env: {},
      dbConn,
      logger,
    };
  });

  it('should instantiate a crypto service', () => {
    const config = { dataAccessLayer: { repositories: {} }, libs: {}, env: {} };
    const result = ApplicationServiceFactory[CryptoService.$tag](config);
    result.should.be.instanceOf(CryptoService);
  });

  it('should instantiate a security service', () => {
    const result = ApplicationServiceFactory[SecurityService.$tag](config);
    result.should.be.instanceOf(SecurityService);
  });

  it('should instantiate a todo service', () => {
    const result = ApplicationServiceFactory[TodoService.$tag](config);
    result.should.be.instanceOf(TodoService);
  });
});
