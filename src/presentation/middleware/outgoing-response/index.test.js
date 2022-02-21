import chai from 'chai';
import spies from 'chai-spies';

import * as httpVerbs from '../../enumerators/http-verbs.js';
import * as httpCodes from '../../enumerators/http-codes.js';
import OutgoingResponseMiddleware from './index.js';
import ResponseStub from '../../../../test/utils/libs/express/index.js';
import noop from 'lodash/noop.js';

chai.use(spies);

class LoggerStub {
  constructor() {
    this.calls = [];

    this.info = this.info.bind(this);
  }

  info(args) {
    this.calls.push({ args });
  }
}

describe('OutgoingResponseMiddleware', () => {
  let logger, req, res, next, method, url;
  beforeEach(() => {
    next = chai.spy();
    method = httpVerbs.GET;
    url = 'some-url.com';
    const ctx = { method, url, reqStartedAt: new Date() };
    req = { method, url, context: ctx };
    res = new ResponseStub();
    logger = new LoggerStub();
  });

  it('should add a proxy to express response to log every `json` call', () => {
    const status = httpCodes.OK;
    const data = { ok: 1 };

    new OutgoingResponseMiddleware({ logger }).hook(req, res, next);
    const receivedResponse = res.status(status).json(data);
    receivedResponse.body.should.be.eql(data);
    receivedResponse.status.should.be.eql(status);

    logger.calls.length.should.be.eql(1);
    const loggedInfo = logger.calls[0].args;
    const fixedRegexPart = `${method.toUpperCase()} ${url} ${httpCodes.OK}`;
    loggedInfo.message.should.match(new RegExp(fixedRegexPart, 'g'));
    loggedInfo.durationMs.should.be.a('number');
    loggedInfo.reqStartedAt.should.be.a('date');
    loggedInfo.status.should.be.eql(httpCodes.OK);
  });

  it('should add a proxy to express response to log every `end` call', () => {
    new OutgoingResponseMiddleware({ logger }).hook(req, res, next);
    res.status(httpCodes.NO_CONTENT).end();

    logger.calls.length.should.be.eql(1);
    const loggedInfo = logger.calls[0].args;
    const fixedRegexPart = `${method.toUpperCase()} ${url} ${httpCodes.NO_CONTENT}`;
    loggedInfo.message.should.match(new RegExp(fixedRegexPart, 'g'));
    loggedInfo.durationMs.should.be.a('number');
    loggedInfo.reqStartedAt.should.be.a('date');
    loggedInfo.status.should.be.eql(httpCodes.NO_CONTENT);
  });
});
