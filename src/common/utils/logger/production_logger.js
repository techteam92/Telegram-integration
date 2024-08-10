/**
Project: pedalsup studio API
version : v0.1
author : @devanshu-pedalsup
desc : Logger file for production stage.
*/

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf, json } = format;

//production logger
exports.productionLogger = () => {
  const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp}--:--${level}--:--${message}`;
  });

  return createLogger({
    level: 'silly',
    format: combine(timestamp({ format: 'HH:mm:ss' }), myFormat),

    transports: [
      new transports.File({ filename: './logs/production_logs/error.log', level: 'error' }),
      new transports.File({ filename: './logs/production_logs/info.log', level: 'info' }),
    ],
  });
};
