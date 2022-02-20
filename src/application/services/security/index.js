import * as errorSeverities from '../../enumerators/error-severities.js';
import * as errors from './errors.js';

class ApplicationError extends Error {
  constructor({ msg, code, severity = errorSeverities.UNEXPECTED }) {
    super(msg);
    this.code = code;
    this.severity = severity;
  }
}

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
      const registeredUser = await usersRepository.create({ username, password: encryptedPwd });

      return { payload: registeredUser };
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      throw new ApplicationError(errors.UNEXPECTED());
    }
  }

  async login() {}
}
