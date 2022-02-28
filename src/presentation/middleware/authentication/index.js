import * as httpCodes from '../../enumerators/http-codes.js';

export default class AuthenticationMiddleware {
  constructor({ libs, env } = {}) {
    this._jwt = libs?.jwt;
    this._SIGNING_KEY = env?.JWT_SIGNING_KEY;

    this.hook = this.hook.bind(this);
  }

  hook(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(httpCodes.UNAUTHORIZED).json({ msg: 'Unauthorized' });
    }

    const value = token.split('Bearer ')[1];
    try {
      const user = this._jwt.verify(value, this._SIGNING_KEY);
      req.context = { ...req.context, authenticatedUser: user };
      next();
    } catch (ex) {
      return res.status(httpCodes.UNAUTHORIZED).json({ msg: 'Unauthorized' });
    }
  }
}
