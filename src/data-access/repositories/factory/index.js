import LoggerFactory from '../../../kernel/logger/index.js';
import UsersRepository from '../user/index.js';

class RepositoryFactory {
  static [UsersRepository.$tag](config) {
    return new UsersRepository({
      model: config.dbConn.model('user'),
      logger: LoggerFactory.to(UsersRepository.$tag, config),
    });
  }
}

export default RepositoryFactory;
