import chai from 'chai';
import noop from 'lodash/noop.js';

import CryptoService from '../crypto/index.js';
import SecurityService from '../security/index.js';
import ApplicationServiceFactory from './index.js';

chai.should();

describe('ApplicationServiceFactory', () => {
  it('should instantiate a crypto service', () => {
    const config = { dataAccessLayer: { repositories: {} }, libs: {}, env: {} };
    const result = ApplicationServiceFactory[CryptoService.$tag](config);
    result.should.be.instanceOf(CryptoService);
  });

  it('should instantiate a security service', () => {
    const config = {
      applicationLayer: { services: {} },
      dataAccessLayer: { repositories: {} },
      libs: {},
      env: {},
      dbConn: { model: noop },
      logger: { child: noop },
    };
    const result = ApplicationServiceFactory[SecurityService.$tag](config);
    result.should.be.instanceOf(SecurityService);
  });
});
