import RepositoryFactory from '../../../data-access/repositories/factory/index.js';
import UsersRepository from '../../../data-access/repositories/user/index.js';
import LoggerFactory from '../../../kernel/logger/index.js';
import CryptoService from '../crypto/index.js';
import JWTService from '../jwt/index.js';
import SecurityService from '../security/index.js';

class ApplicationServiceFactory {
  static [CryptoService.$tag](config) {
    return new CryptoService(config);
  }

  static [SecurityService.$tag](config) {
    return new SecurityService({
      applicationLayer: {
        services: {
          cryptoService: ApplicationServiceFactory[CryptoService.$tag](config),
          jwtService: new JWTService({
            ...config,
            logger: LoggerFactory.to({ object: JWTService.$tag }, config),
          }),
        },
      },
      dataAccessLayer: {
        repositories: { usersRepository: RepositoryFactory[UsersRepository.$tag](config) },
      },
      logger: LoggerFactory.to({ object: SecurityService.$tag }, config),
    });
  }
}

export default ApplicationServiceFactory;
