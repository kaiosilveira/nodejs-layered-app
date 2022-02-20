export const configureLogger = ({ winston }) => {
  const {
    format: { combine, timestamp, prettyPrint },
  } = winston;

  const logger = winston.createLogger({
    level: 'info',
    format: combine(timestamp(), prettyPrint()),
  });

  logger.add(new winston.transports.Console({ format: winston.format.simple() }));

  return logger;
};
