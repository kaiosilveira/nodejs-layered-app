import SecurityService from '../../../../application/services/security/index.js';
import * as httpCodes from '../../../enumerators/http-codes.js';
import * as errors from './errors.js';

const tag = 'securityController';
export default class SecurityController {
  constructor(props = { libs: {}, applicationLayer: { services: {} }, env: {} }) {
    this.logger = props.logger;
    this.props = { ...props.applicationLayer.services, ...props.libs, ...props.env };

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
  }

  async register(req, res) {
    const { username, password } = req.body;
    const ctx = req.context;
    try {
      const { securityService } = this.props;

      if (!username) {
        return res.status(httpCodes.BAD_REQUEST).json(errors.INVALID_USERNAME());
      }

      if (!password) {
        return res.status(httpCodes.BAD_REQUEST).json(errors.INVALID_PASSWORD());
      }

      const { payload: createdUser } = await securityService.register({
        args: { username, password },
        ctx,
      });

      return res.status(httpCodes.CREATED).json(createdUser);
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      return res.status(httpCodes.INTERNAL_SERVER_ERROR).json(errors.UNEXPECTED());
    }
  }

  async login(req, res) {
    const { username, password } = req.body;
    const ctx = req.context;

    try {
      if (!username) {
        return res.status(httpCodes.BAD_REQUEST).json(errors.INVALID_USERNAME());
      }

      if (!password) {
        return res.status(httpCodes.BAD_REQUEST).json(errors.INVALID_PASSWORD());
      }

      const { securityService } = this.props;
      const token = await securityService.authenticate({ args: { username, password }, ctx });

      return res.json({ token });
    } catch ({ message, stack }) {
      this.logger.error({ message, stack, ...ctx });
      return res.status(httpCodes.INTERNAL_SERVER_ERROR).json(errors.UNEXPECTED());
    }
  }
}

SecurityController.$tag = tag;
SecurityController.$inject = {
  applicationLayer: { services: { securityService: SecurityService.$tag } },
};
