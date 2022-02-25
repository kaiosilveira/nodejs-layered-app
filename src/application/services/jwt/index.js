const tag = 'jwtService';
export default class JWTService {
  constructor({ libs, env, logger }) {
    this._jwt = libs.jwt;
    this._SIGNING_KEY = env.JWT_SIGNING_KEY;
    this._logger = logger;
    this.sign = this.sign.bind(this);
  }

  sign({ args: obj, ctx }) {
    try {
      const token = this._jwt.sign(obj, this._SIGNING_KEY);
      return { payload: token };
    } catch ({ message, stack }) {
      this._logger.error({ message, stack, ...ctx });
      throw new Error('Failed to sign JWT token');
    }
  }
}

JWTService.$tag = tag;
