import User from '../../../domain/entities/user/impl/index.js';
import Repository from '../_abstract/index.js';
const TAG = 'usersRepository';

class UsersRepository extends Repository {
  constructor(deps) {
    super({ entityCtor: User, ...deps });
  }
}

UsersRepository.$tag = TAG;

export default UsersRepository;
