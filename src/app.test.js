import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';

import { ExpressApp } from './app.js';

chai.use(spies);
const should = chai.should();

describe('ExpressApp', () => {
  describe('destroy', () => {
    it('should clear database resources and erase express instance', () => {
      const appInstance = {};
      const dbConn = chai.spy.interface({ close: noop });
      const logger = chai.spy.interface({ info: noop });

      const expressApp = new ExpressApp({ appInstance, dbConn, logger });

      return expressApp.destroy().then(() => {
        logger.info.should.have.been.called
          .nth(1)
          .with({ message: 'Clearing up server resources...' });

        should.not.exist(expressApp.instance);
        dbConn.close.should.have.been.called();
        logger.info.should.have.been.called.nth(2).with({ message: 'Server resources cleared' });
      });
    });
  });
});
