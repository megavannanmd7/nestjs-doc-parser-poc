import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logLevel = process.env.LOG_LEVEL ?? 'info';

const prettyFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  nestWinstonModuleUtilities.format.nestLike('DocParser', {
    prettyPrint: true,
    colors: true,
  }),
);

const jsonFormat = combine(
  timestamp(),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, context, stack }) => {
    return JSON.stringify({ timestamp: ts, level, context, message, stack });
  }),
);

const isDevelopment = process.env.NODE_ENV !== 'production';

export const winstonConfig: winston.LoggerOptions = {
  level: logLevel,
  transports: [
    new winston.transports.Console({
      format: isDevelopment ? prettyFormat : jsonFormat,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
    }),
  ],
};
