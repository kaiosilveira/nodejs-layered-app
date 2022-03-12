import Todo from '../impl/index.js';

const INSUFFICIENT_PARTS_ERROR_MSG =
  'Insufficient parts to build a todo. Expected at least a title and a ownerId';

export default class TodoBuilder {
  constructor() {
    this._obj = {};

    this.withTitle = this.withTitle.bind(this);
    this.forUser = this.forUser.bind(this);
    this.due = this.due.bind(this);
    this.build = this.build.bind(this);
  }

  withTitle(title) {
    this._obj.title = title;
    return this;
  }

  forUser(id) {
    this._obj.ownerId = id;
    return this;
  }

  due(date) {
    this._obj.due = date;
    return this;
  }

  build() {
    if (!(this._obj.title && this._obj.ownerId)) {
      throw new Error(INSUFFICIENT_PARTS_ERROR_MSG);
    }

    return new Todo(this._obj);
  }
}
