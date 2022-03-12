import BaseEntity from '../../_base/index.js';
import DateTimeUtils from '../../../utils/date-time/index.js';

export default class Todo extends BaseEntity {
  constructor({ id, title, ownerId, due }) {
    super({ id });
    this._title = title;
    this._ownerId = ownerId;
    this._due = due ?? DateTimeUtils.nextHour();
  }

  get title() {
    return this._title;
  }

  get due() {
    return this._due;
  }

  get ownerId() {
    return this._ownerId;
  }

  toJSON() {
    return { id: this.id, title: this.title, due: this.due, ownerId: this.ownerId };
  }
}
