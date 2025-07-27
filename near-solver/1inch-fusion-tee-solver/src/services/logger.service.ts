import winston from 'winston';
import { env } from '../configs/env.validation';

export class LoggerService {
  private logger: winston.Logger;
  private context: string;

  constructor(context: string) {
    this.context = context;
    
    this.logger = winston.createLogger({
      level: env.LOG_LEVEL,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context || this.context;
          return `${timestamp} [${level.toUpperCase()}] [${ctx}] ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta) : ''
          }`;
        })
      ),
      defaultMeta: { context: this.context },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });

    // Add file transport in production
    if (env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        })
      );
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
        })
      );
    }
  }

  error(message: string, error?: any) {
    this.logger.error(message, { error });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  toScopeLogger(scope: string): LoggerService {
    return new LoggerService(`${this.context}:${scope}`);
  }
}