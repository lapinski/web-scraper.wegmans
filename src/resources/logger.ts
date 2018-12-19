import winston from 'winston';
import config from './config';

const logConfig = config.get('logging');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: logConfig.filename,
      level: logConfig.level,
    }),
  ],
});

if (logConfig.console) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default logger;