class IncomingRequestMiddleware {
  constructor({ logger, generateUUID }) {
    this._logger = logger;
    this._generateUUID = generateUUID;

    this.hook = this.hook.bind(this);
  }

  hook(req, _, next) {
    const context = {
      actionUUID: this._generateUUID(),
      reqStartedAt: new Date(),
      method: req.method,
      url: req.url,
    };

    req.context = context;
    next();
  }
}

export default IncomingRequestMiddleware;
