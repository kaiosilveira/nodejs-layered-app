import Todo from '../../../domain/entities/todo/impl/index.js';
import Repository from '../_abstract/index.js';

const TAG = 'todoRepository';
export default class TodoRepository extends Repository {
  constructor(deps) {
    super({ entityCtor: Todo, ...deps });
  }
}

TodoRepository.$tag = TAG;
