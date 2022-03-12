import BaseEntity from '../../_base/index.js';

export default class User extends BaseEntity {
  constructor({ id, username, password, registeredAt }) {
    super({ id });
    this._username = username;
    this._password = password;
    this._registeredAt = registeredAt;
  }

  get username() {
    return this._username;
  }

  get registeredAt() {
    return this._registeredAt;
  }

  passwordMatches(value) {
    return this._password === value;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      registeredAt: this.registeredAt,
      password: this._password,
    };
  }
}
