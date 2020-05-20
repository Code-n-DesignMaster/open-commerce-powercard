import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { format } from 'logform';
const { combine, timestamp, colorize, printf } = format;

@Injectable()
export class LoggerService implements NestLoggerService {
  public static getLogger() {
    return winston.createLogger({
      level: 'debug',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        this.myFormat,
        colorize(),
      ),
      // defaultMeta: { service: serviceName },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            this.myFormat,
          ),
        }),
      ],
    });
  }
  private static myFormat = printf(({ level, message, label, timestamp }) => {
    return `${level}: ${timestamp} [${label}] ${message}`;
  });

  protected logger: winston.Logger;

  constructor() {
    this.logger = LoggerService.getLogger();
  }

  public log(message: string, label = '') {
    this.logger.info({ message, label });
  }

  public debug(message: string, label = '') {
    this.logger.debug({ message, label });
  }

  public info(message: string, label = '') {
    this.logger.info({ message, label });
  }

  public warn(message: string, label = '') {
    this.logger.warn({ message, label });
  }

  public error(message: string, label = '') {
    this.logger.error({ message, label });
  }
}
