import UsersRepository from '../../../data-access/repositories/user/index.js';
import { ApplicationError } from '../../errors/index.js';
import CryptoService from '../crypto/index.js';
import * as errors from './errors.js';

const TAG = 'securityService';

export default class SecurityService {
  constructor(props = { applicationLayer: {}, dataAccessLayer: {} }) {
    this.logger = props.logger;
    this.props = { ...props.applicationLayer.services, ...props.dataAccessLayer.repositories };
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register({ args, ctx }) {
    const { username, password } = args;
    if (!username) {
      throw new ApplicationError(errors.INVALID_USERNAME());
    }

    if (!password) {
      throw new ApplicationError(errors.INVALID_PASSWORD());
    }

    try {
      const { cryptoService, usersRepository } = this.props;
      const { payload: encryptedPwd } = cryptoService.hash({ args: password });
      const { payload: createdUser } = await usersRepository.create({
        username,
        password: encryptedPwd,
      });

      return { payload: createdUser };
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      throw new ApplicationError(errors.UNEXPECTED());
    }
  }

  async login() {}
}

SecurityService.$tag = TAG;
SecurityService.$inject = {
  applicationLayer: { services: { cryptoService: CryptoService.$tag } },
  dataAccessLayer: { repositories: { usersRepository: UsersRepository.$tag } },
};
