import winston from 'winston';
import TransportStream from 'winston-transport';

export enum LogLevel {
    Debug = 'debug',
    Info = 'info',
    Warn = 'warn',
    Error = 'error',
}

const logger = winston.createLogger();

const getConsoleTransport = (level:LogLevel) => new winston.transports.Console({
    level,
    format: winston.format.cli(),
});
const getFileTransport = (filename:string, level:LogLevel) =>
    new winston.transports.File({
       filename,
       level,
    });
const addTransport = (transport: TransportStream) => logger.add(transport);
const log = (level:LogLevel, msg: string, meta?: object) => logger.log(level, msg, meta);

export {
    getConsoleTransport,
    getFileTransport,
    addTransport,
    log,
}