const TAG = 'usersRepository';

class UsersRepository {
  constructor({ model, logger } = {}) {
    this._model = model;
    this._logger = logger;
  }

  async create({ args: user, ctx }) {
    try {
      const createdUser = await this._model.create(user);
      return { payload: createdUser };
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

UsersRepository.$tag = TAG;

export default UsersRepository;
