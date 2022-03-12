export default class Repository {
  constructor({ entityCtor, model, logger } = {}) {
    this._entityCtor = entityCtor;
    this._model = model;
    this._logger = logger;

    this.create = this.create.bind(this);
    this.getBy = this.getBy.bind(this);
  }

  async create({ args: obj, ctx }) {
    try {
      const payload = await this._model.create(obj.toJSON());
      const parsedObj = payload.toObject()
      const instance = new this._entityCtor({ ...parsedObj, id: parsedObj._id });
      return { payload: instance };
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
      const parsedObj = payload.toObject()
      return { payload: new this._entityCtor({ ...parsedObj, id: parsedObj._id }) };
    } catch ({ message, stack }) {
      this._logger.error({ message, stack, ...ctx });
      throw new Error('Failed to perform "getBy" operation');
    }
  }
}
