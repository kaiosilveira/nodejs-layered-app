import Repository from '../_abstract/index.js';

const TAG = 'todoRepository';
export default class TodoRepository extends Repository {
  constructor(deps) {
    super(deps);
  }
}

TodoRepository.$tag = TAG;
