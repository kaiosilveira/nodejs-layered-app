import LoggerFactory from '../../../kernel/logger/index.js';
import TodoRepository from '../todo/index.js';
import UsersRepository from '../user/index.js';

class RepositoryFactory {
  static [UsersRepository.$tag](config) {
    return new UsersRepository({
      model: config.dbConn.model('user'),
      logger: LoggerFactory.to(UsersRepository.$tag, config),
    });
  }

  static [TodoRepository.$tag](config) {
    return new TodoRepository({
      model: config.dbConn.model('todo'),
      logger: LoggerFactory.to(TodoRepository.$tag, config),
    });
  }
}

export default RepositoryFactory;
