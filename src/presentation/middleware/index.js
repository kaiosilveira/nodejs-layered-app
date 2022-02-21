import IncomingRequestMiddleware from './incoming-request/index.js';
import OutgoingResponseMiddleware from './outgoing-response/index.js';

export default config => {
  return {
    incomingRequestMiddleware: new IncomingRequestMiddleware({
      generateUUID: config.libs.uuid,
      logger: config.logger.child({ object: 'IncomingRequestMiddleware' }),
    }),
    outgoingResponseMiddleware: new OutgoingResponseMiddleware({
      logger: config.logger.child({ object: 'OutgoingResponseMiddleware' }),
    }),
  };
};
