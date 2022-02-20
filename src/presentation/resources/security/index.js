import SecurityController from './controller/index.js';
import SecurityService from '../../../application/services/security/index.js';
import CryptoService from '../../../application/services/crypto/index.js';
import UsersRepository from '../../../data-access/repositories/user/index.js';
import createRouter from './router.js';

export default config => {
  return {
    path: 'security',
    router: createRouter({
      router: config.libs.express.Router(),
      controller: new SecurityController({
        applicationLayer: {
          services: {
            securityService: new SecurityService({
              applicationLayer: { services: { cryptoService: new CryptoService(config) } },
              dataAccessLayer: {
                repositories: {
                  usersRepository: new UsersRepository({
                    model: config.dbConn.model('user'),
                    logger: config.logger.child({ object: 'UsersRepository' }),
                  }),
                },
              },
              logger: config.logger.child({ object: 'SecurityService' }),
            }),
          },
        },
        logger: config.logger.child({ object: 'SecurityController' }),
      }),
    }),
  };
};
