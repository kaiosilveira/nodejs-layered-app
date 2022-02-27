import Repository from '../_abstract/index.js';
const TAG = 'usersRepository';

class UsersRepository extends Repository {
  constructor(deps) {
    super(deps);
  }
}

UsersRepository.$tag = TAG;

export default UsersRepository;
