import chai from 'chai';

export default class SecurityResource {
  constructor({ app }) {
    this._app = app.instance;
  }

  async register({ username, password }) {
    return await chai.request(this._app).post('/security/register').send({ username, password });
  }

  async login({ username, password }) {
    return await chai.request(this._app).post('/security/login').send({ username, password });
  }
}
