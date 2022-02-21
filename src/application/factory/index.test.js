import chai from 'chai';
import noop from 'lodash/noop.js';

import SecurityService from '../services/security/index.js';
import ApplicationLayerFactory from './index.js';

chai.should();

describe('ApplicationLayerFactory', () => {
  describe('make', () => {
    it('should resolve a default object if dependency specification does not contain an applicationLayer field', () => {
      const result = ApplicationLayerFactory.make(undefined);
      result.should.be.eql({
        applicationLayer: { services: {} },
      });
    });

    it('should resolve the defined dependencies', () => {
      const config = { libs: {}, env: {}, dbConn: { model: noop }, logger: { child: noop } };
      const deps = { applicationLayer: { services: { securityService: SecurityService.$tag } } };
      const result = ApplicationLayerFactory.make(deps, config);
      result.applicationLayer.services.securityService.should.be.instanceOf(SecurityService);
    });
  });
});
