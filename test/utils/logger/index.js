import chai from 'chai';
import spies from 'chai-spies';
import noop from 'lodash/noop.js';

chai.use(spies);

class LoggerFactory {
  static make() {
    return chai.spy.interface({ error: noop, warn: noop, info: noop });
  }
}

export default LoggerFactory;
