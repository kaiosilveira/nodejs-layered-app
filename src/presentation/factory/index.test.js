import noop from 'lodash/index.js';
import PresentationControllerFactory from './index.js';
import SecurityController from '../resources/security/controller/index.js';
import TodoController from '../resources/todo/controller/index.js';

describe('PresentationControllerFactory', () => {
  it('should instantiate a SecurityController', () => {
    const config = {
      applicationLayer: { services: {} },
      dataAccessLayer: { repositories: {} },
      libs: {},
      env: {},
      logger: { child: noop },
      dbConn: { model: noop },
    };

    const result = PresentationControllerFactory[SecurityController.$tag](config);
    result.should.be.instanceOf(SecurityController);
  });

  it('should instantiate a SecurityController', () => {
    const config = {
      applicationLayer: { services: {} },
      dataAccessLayer: { repositories: {} },
      libs: {},
      env: {},
      logger: { child: noop },
      dbConn: { model: noop },
    };

    const result = PresentationControllerFactory[TodoController.$tag](config);
    result.should.be.instanceOf(TodoController);
  });
});
