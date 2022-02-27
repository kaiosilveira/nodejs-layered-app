import ApplicationLayerFactory from '../../application/factory/index.js';
import LoggerFactory from '../../kernel/logger/index.js';
import SecurityController from '../resources/security/controller/index.js';
import TodoController from '../resources/todo/controller/index.js';

export const instantiated = (clz, config) => PresentationControllerFactory[clz.$tag](config);

class PresentationControllerFactory {
  static [SecurityController.$tag](config) {
    return new SecurityController({
      ...ApplicationLayerFactory.make(SecurityController.$inject, config),
      logger: LoggerFactory.to({ object: SecurityController.$tag }, config),
    });
  }

  static [TodoController.$tag](config) {
    return new TodoController({
      ...ApplicationLayerFactory.make(TodoController.$inject, config),
      logger: LoggerFactory.to({ object: TodoController.$tag }, config),
    });
  }
}

export default PresentationControllerFactory;
