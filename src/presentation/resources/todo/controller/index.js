import * as httpCodes from '../../../enumerators/http-codes.js';
import * as errors from './errors.js';

const tag = 'todoController';
export default class TodoController {
  constructor({ applicationLayer, logger } = {}) {
    this.props = { ...applicationLayer?.services };
    this._logger = logger;
  }

  async add(req, res) {
    const { title, due } = req.body;
    const ctx = req.context;

    if (!title) {
      return res.status(httpCodes.BAD_REQUEST).json(errors.INVALID_TODO_TITLE());
    }

    try {
      const todo = { title, due };
      const createdTodo = await this.props.todoService.add({ args: todo, ctx });
      return res.status(httpCodes.CREATED).json(createdTodo);
    } catch ({ message, stack }) {
      this._logger.error({ message, stack, ...ctx });
      return res.status(httpCodes.INTERNAL_SERVER_ERROR).json(errors.UNEXPECTED());
    }
  }
}

TodoController.$tag = tag;
TodoController.$inject = { applicationLayer: { services: { todoService: 'todoService' } } };
