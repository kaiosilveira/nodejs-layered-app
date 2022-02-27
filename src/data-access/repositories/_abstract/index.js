export default class Repository {
  constructor({ model, logger } = {}) {
    this._model = model;
    this._logger = logger;
  }

  async create({ args: obj, ctx }) {
    try {
      const payload = await this._model.create(obj);
      return { payload };
    } catch ({ message, stack }) {
      this._logger.error({ message, stack, ...ctx });
      throw new Error('Failed to perform "create" operation');
    }
  }

  async getBy({ args: criteria, ctx }) {
    if (!criteria) {
      throw new Error('Invalid criteria given to "getBy" operation. Expected an object.');
    }

    try {
      const payload = await this._model.findOne(criteria);
      return { payload };
    } catch ({ message, stack }) {
      this._logger.error({ message, stack, ...ctx });
      throw new Error('Failed to perform "getBy" operation');
    }
  }
}
