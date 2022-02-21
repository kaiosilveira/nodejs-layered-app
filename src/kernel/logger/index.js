export default class LoggerFactory {
  static createInstance({ winston }) {
    const {
      format: { combine, timestamp, prettyPrint },
    } = winston;

    const logger = winston.createLogger({
      level: 'info',
      format: combine(timestamp(), prettyPrint()),
    });

    logger.add(new winston.transports.Console({ format: winston.format.simple() }));

    return logger;
  }

  static to(obj, config) {
    return config.logger.child({ object: obj });
  }
}
