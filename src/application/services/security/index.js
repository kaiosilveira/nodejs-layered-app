import UsersRepository from '../../../data-access/repositories/user/index.js';
import { ApplicationError } from '../../errors/index.js';
import CryptoService from '../crypto/index.js';
import JWTService from '../jwt/index.js';
import * as errors from './errors.js';

const TAG = 'securityService';

export default class SecurityService {
  constructor(props = { applicationLayer: {}, dataAccessLayer: {} }) {
    this.logger = props.logger;
    this.props = { ...props.applicationLayer?.services, ...props.dataAccessLayer?.repositories };

    this.register = this.register.bind(this);
    this.authenticate = this.authenticate.bind(this);

    this._fetchUserBy = this._fetchUserBy.bind(this);
    this._signJWTTokenFor = this._signJWTTokenFor.bind(this);
    this._validateHashedPassword = this._validateHashedPassword.bind(this);
  }

  async register({ args, ctx }) {
    const { username, password } = args;
    this._validateCredentials({ username, password });

    try {
      const { cryptoService, usersRepository } = this.props;
      const { payload: encryptedPwd } = cryptoService.hash({ args: password });
      const { payload: createdUser } = await usersRepository.create({
        args: { username, password: encryptedPwd },
        ctx,
      });

      return { payload: createdUser };
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      throw new ApplicationError(errors.UNEXPECTED());
    }
  }

  async authenticate({ args: { username, password }, ctx }) {
    this._validateCredentials({ username, password });
    const user = await this._fetchUserBy({ args: { username }, ctx });
    if (!user) {
      throw new ApplicationError(errors.USER_NOT_FOUND());
    }

    this._validateHashedPassword(user, password);

    const token = this._signJWTTokenFor({ args: user, ctx });
    return { payload: token };
  }

  _validateCredentials({ username, password }) {
    if (!username) {
      throw new ApplicationError(errors.INVALID_USERNAME());
    }

    if (!password) {
      throw new ApplicationError(errors.INVALID_PASSWORD());
    }
  }

  async _fetchUserBy({ args: criteria, ctx }) {
    let result;

    try {
      result = await this.props.usersRepository.getBy({ args: criteria });
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      throw new ApplicationError(errors.UNEXPECTED());
    }

    return result.payload;
  }

  _signJWTTokenFor({ args: user, ctx }) {
    try {
      const result = this.props.jwtService.sign({
        args: { _id: user._id, username: user.username },
        ctx,
      });

      return result.payload;
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      throw new ApplicationError(errors.UNEXPECTED());
    }
  }

  _validateHashedPassword(user, password) {
    const { payload: hash } = this.props.cryptoService.hash({ args: password });
    if (hash !== user.password) {
      throw new ApplicationError(errors.INVALID_CREDENTIALS());
    }
  }
}

SecurityService.$tag = TAG;
SecurityService.$inject = {
  applicationLayer: {
    services: { cryptoService: CryptoService.$tag, jwtService: JWTService.$tag },
  },
  dataAccessLayer: { repositories: { usersRepository: UsersRepository.$tag } },
};
