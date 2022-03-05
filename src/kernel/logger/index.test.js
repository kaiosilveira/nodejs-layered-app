import chai from 'chai';
import spies from 'chai-spies';
import asPromised from 'chai-as-promised';
import noop from 'lodash/noop.js';

import LoggerFactory from './index.js';

chai.use(spies);
chai.use(asPromised);
chai.should();

class WinstonConsole {}

describe('LoggerFactory', () => {
  describe('createInstance', () => {
    const combine = (...args) => args;
    const timestamp = () => 'timestamp';
    const prettyPrint = () => 'prettyPrint';
    const simple = noop;
    const format = { combine, timestamp, prettyPrint, simple };
    const loggerInstance = chai.spy.interface({ add: noop });
    const createLogger = () => loggerInstance;
    const transports = { Console: WinstonConsole };
    const winston = { format, transports, createLogger };

    const spyOnCreateLogger = chai.spy.on(winston, 'createLogger');

    LoggerFactory.createInstance({ winston });

    spyOnCreateLogger.should.have.been.called.with({
      level: 'info',
      format: ['timestamp', 'prettyPrint'],
    });

    loggerInstance.add.should.have.been.called.with(new WinstonConsole());
  });

  describe('to', () => {
    it('should create a child logger for a given object', () => {
      const objName = 'myObj';
      const loggerInstance = chai.spy.interface({ child: noop });
      const config = { logger: loggerInstance };

      LoggerFactory.to(objName, config);
      loggerInstance.child.should.have.been.called.with({ object: objName });
    });
  });
});
