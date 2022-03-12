import TodoRepository from '../../../data-access/repositories/todo/index.js';
import TodoBuilder from '../../../domain/entities/todo/builder/index.js';
import * as errorSeverities from '../../enumerators/error-severities.js';
import { ApplicationError } from '../../errors/index.js';

const TAG = 'todoService';
export default class TodoService {
  constructor({ dataAccessLayer, logger } = {}) {
    this.props = { ...dataAccessLayer?.repositories };
    this._logger = logger;
  }

  async add({ args: givenTodo = {}, ctx }) {
    const { title, due } = givenTodo;
    const { authenticatedUser: owner } = ctx;

    if (!title) {
      throw new ApplicationError({
        msg: 'Invalid todo title. Expected a non-empty string',
        severity: errorSeverities.CORRECTABLE,
      });
    }

    const builder = new TodoBuilder().withTitle(title).forUser(owner._id);
    if (due) builder.due(due);

    try {
      const { payload: createdTodo } = await this.props.todoRepository.create({
        args: builder.build(),
        ctx,
      });

      return { payload: createdTodo.toJSON() };
    } catch ({ message, stack }) {
      this._logger.error({ message, stack, ...ctx });
      throw new ApplicationError({
        msg: 'Failed to add todo',
        severity: errorSeverities.UNEXPECTED,
      });
    }
  }
}

TodoService.$tag = TAG;
TodoService.$inject = {
  dataAccessLayer: { repositories: { todoRepository: TodoRepository.$tag } },
};
