'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const level = process.env.LOG_LEVEL || 'info';

const consoleFmt = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const m = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${m}`;
  })
);

const jsonFmt = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({ format: isProd ? jsonFmt : consoleFmt }),
];

if (isProd) {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'error-%DATE%.log'),
      level: 'error', datePattern: 'YYYY-MM-DD', maxFiles: '30d', format: jsonFmt,
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', maxFiles: '14d', format: jsonFmt,
    })
  );
}

const logger = winston.createLogger({
  level,
  defaultMeta: { service: 'tmf-backend' },
  transports,
  exitOnError: false,
});

logger.stream = { write: (msg) => logger.http(msg.trim()) };

module.exports = logger;
