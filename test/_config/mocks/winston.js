import noop from 'lodash/noop.js';

const silent = !process.env.WITH_LOGS;
const outputLogMsgToConsole = ({ message }) => console.log(message);
const loggingFn = silent ? noop : outputLogMsgToConsole;
const coreLogger = { error: loggingFn, warn: loggingFn, info: loggingFn };

class FakeWinstonConsoleTransport {}
const fakeLogger = {
  add: noop,
  child: () => coreLogger,
  ...coreLogger,
};

const fakeWiston = {
  format: { combine: noop, timestamp: noop, prettyPrint: noop, simple: noop },
  transports: { Console: FakeWinstonConsoleTransport },
  createLogger: () => fakeLogger,
  child: () => fakeLogger,
  ...coreLogger,
};

export default fakeWiston;
