export default class Todo {
  constructor({ title, due }) {
    this._title = title;
    this._due = due;
  }

  get title() {
    return this._title;
  }

  get due() {
    return this._due;
  }
}
