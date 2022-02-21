class OutgoingResponseMiddleware {
  constructor({ logger }) {
    this._logger = logger;
    this.hook = this.hook.bind(this);
  }

  hook(req, res, next) {
    res.on('finish', () => {
      const ctx = req.context;
      const durationMs = new Date() - ctx.reqStartedAt;
      this._logger.info({
        message: `${ctx.method.toUpperCase()} ${ctx.url} ${res.statusCode} (${durationMs}ms)`,
        status: res.statusCode,
        durationMs,
        ...req.context
      });
    });

    next();
  }
}

export default OutgoingResponseMiddleware;
