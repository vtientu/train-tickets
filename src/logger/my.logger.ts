import { LoggerService } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import chalk from 'chalk';
import dayjs from 'dayjs';

export class MyLogger implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.printf(({ context, message, level, time }) => {
              const strApp = chalk.green('[Nest]');
              const strContext = chalk.yellow(`[${context as string}]`);
              return `${strApp} - ${time as string} ${level} ${strContext} ${message as string}`;
            }),
          ),
        }),
        new transports.File({
          format: format.combine(format.timestamp(), format.json()),
          dirname: 'logs',
          filename: 'demo.log.dev',
        }),
      ],
    });
  }
  log(message: string, context: string) {
    const time = dayjs().format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('info', message, { time, context });
  }
  error(message: string, context: string) {
    const time = dayjs().format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('error', message, { time, context });
  }
  warn(message: string, context: string) {
    const time = dayjs().format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('warn', message, { time, context });
  }
  debug?(message: string, context: string) {
    const time = dayjs().format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('debug', message, { time, context });
  }
  verbose?(message: string, context: string) {
    const time = dayjs().format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('verbose', message, { time, context });
  }
  fatal?(message: string, context: string) {
    const time = dayjs().format('DD/MM/YYYY HH:mm:ss');
    this.logger.log('fatal', message, { time, context });
  }
}
