import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);

class ResponseStub {
  constructor() {
    this.body = {};
    this.statusCode = 200;
    this.status = this.status.bind(this);
    this.json = this.json.bind(this);
    this.send = this.send.bind(this);
    this._subscribers = { finish: [] };
  }

  on(event, callbackFn) {
    this._subscribers[event].push(callbackFn);
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(obj) {
    this._subscribers.finish.forEach(cb => cb());
    this.body = obj;
    return {
      status: this.statusCode,
      statusCode: this.statusCode,
      body: this.body,
    };
  }

  end() {
    this._subscribers.finish.forEach(cb => cb());
    return {
      status: this.statusCode,
      statusCode: this.statusCode,
      body: this.body,
    };
  }

  send(obj) {
    return {
      status: this.statusCode,
      body: obj,
    };
  }
}

export default ResponseStub;
