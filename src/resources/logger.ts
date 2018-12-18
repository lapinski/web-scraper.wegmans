import winston, { Logger } from 'winston';
import config from './config';

export const ILoggerType = Symbol.for('ILogger');
interface LogMethod {
  (level:string, message:string):void;
  (level:string, message:string, meta:any):void;
}
interface LeveledLogMethod {
  (message:string):void;
  (message:string, meta:any):void;
}
export interface ILogger {
  log: LogMethod;

  error: LeveledLogMethod;
  warn: LeveledLogMethod;
  info: LeveledLogMethod;
  debug: LeveledLogMethod;
}

export default class WinstonLogger implements ILogger {

  private _logger:Logger;

  constructor() {
    this._logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'application.log' }),
      ],
    });

    if (config.get('env') !== 'production') {
      this._logger.add(
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      );
    }
  }

  public log(level:string, message:string, meta:any = null):void {
    this._logger.log(level, message, meta);
  }

  public error(message:string, meta:any = null):void {
    this._logger.error(message, meta);
  }

  public warn(message:string, meta:any = null):void {
    this._logger.warn(message, meta);
  }

  public info(message:string, meta:any = null):void {
    this._logger.info(message, meta);
  }

  public debug(message:string, meta:any = null):void {
    this._logger.debug(message, meta);
  }
}
