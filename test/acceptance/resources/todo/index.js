import chai from 'chai';

export default class TodoResource {
  constructor({ app }) {
    this._app = app.instance;
  }

  async create({ todo, token }) {
    const req = chai.request(this._app).post('/todos');
    req.set('authorization', `Bearer ${token}`);
    return await req.send(todo);
  }
}
