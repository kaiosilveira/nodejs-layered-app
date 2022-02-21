const TAG = 'usersRepository';

class UsersRepository {
  constructor({ model, logger } = {}) {
    this._model = model;
    this._logger = logger;
  }

  async create(user) {
    try {
      const createdUser = await this._model.create(user);
      return { payload: createdUser };
    } catch (ex) {
      this._logger.error(ex);
      throw new Error('Failed to perform "create" operation');
    }
  }
}

UsersRepository.$tag = TAG;

export default UsersRepository;
