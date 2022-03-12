export default class BaseEntity {
  constructor({ id }) {
    this._id = id;
  }

  get id() {
    return this._id;
  }
}
