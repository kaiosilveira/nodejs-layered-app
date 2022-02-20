import * as errorSeverities from '../../enumerators/error-severities.js';

export const INVALID_USERNAME = () => ({
  msg: 'Invalid username, expected a string',
  code: 'app:svc:sec:invalid-username',
  severity: errorSeverities.CORRECTABLE,
});

export const INVALID_PASSWORD = () => ({
  msg: 'Invalid password, expected a string',
  code: 'app:svc:sec:invalid-password',
  severity: errorSeverities.CORRECTABLE,
});

export const UNEXPECTED = () => ({
  msg: 'Unexpected error',
  code: 'app:svc:sec:unexpected',
  severity: errorSeverities.UNEXPECTED,
});
