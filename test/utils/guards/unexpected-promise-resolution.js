const unexpectedPromiseResolutionGuard = () => {
  throw new Error(
    'Unexpected promise resolution. This is probably due to a promise being resolved and the .then block being invoked when we were expecting a .catch block to be invoked due to an error thrown'
  );
};

export default unexpectedPromiseResolutionGuard;
