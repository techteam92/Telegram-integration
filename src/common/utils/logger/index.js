const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const constant = require('../../config/constant')
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '../../../../..');
const logsDir = path.join(projectRoot, 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
// Create separate transports for different log levels
const errorTransport = new DailyRotateFile({
  level: 'error',
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '7d'
});

const infoTransport = new DailyRotateFile({
  level: 'info',
  filename: path.join(logsDir, 'info-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '7d'
});

const debugTransport = new DailyRotateFile({
  level: 'debug',
  filename: path.join(logsDir, 'debug-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '7d'
});

const combineTransport = new DailyRotateFile({
  level: 'silly',
  filename: path.join(logsDir, 'combine-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '7d'
});

// Create a logger and add transports
const infoLogger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    infoTransport,
    combineTransport
  ]
});

const errorLogger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    errorTransport,
    combineTransport
  ]
});

const debugLogger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    debugTransport,
    combineTransport
  ]
});

if (process.env.NODE_ENV && process.env.NODE_ENV != constant.PROD_DEV_ENV) {
  infoLogger.add(new winston.transports.Console());
  errorLogger.add(new winston.transports.Console());
  debugLogger.add(new winston.transports.Console());
}

const logger = {
  info: (params) => {
    return infoLogger.info(params);
  },
  error: (params) => {
    return errorLogger.error(params);
  },
  debug: (params) => {
    return debugLogger.debug(params);
  },
};

module.exports = logger