import IncomingRequestMiddleware from './incoming-request/index.js';
import OutgoingResponseMiddleware from './outgoing-response/index.js';
import AuthenticationMiddleware from './authentication/index.js';

export default config => {
  return {
    authenticationMiddleware: new AuthenticationMiddleware(config),
    incomingRequestMiddleware: new IncomingRequestMiddleware({
      generateUUID: config.libs.uuid,
      logger: config.logger.child({ object: 'IncomingRequestMiddleware' }),
    }),
    outgoingResponseMiddleware: new OutgoingResponseMiddleware({
      logger: config.logger.child({ object: 'OutgoingResponseMiddleware' }),
    }),
  };
};
