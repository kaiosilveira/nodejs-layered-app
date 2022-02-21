import * as errorSeverities from '../enumerators/error-severities.js';

export class ApplicationError extends Error {
  constructor({ msg, code, severity = errorSeverities.UNEXPECTED }) {
    super(msg);
    this.code = code;
    this.severity = severity;
  }
}
