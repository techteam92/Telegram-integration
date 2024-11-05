const mongoose = require('mongoose');
const app = require('./app');
const config = require('./common/config/config');
const logger = require('./common/utils/logger');
const constant = require('./common/config/constant');
const fs = require('fs');
const https = require('https');
const bot = require('./bot/bot');

const indexFunction = () => {
  let server;
  mongoose.connect(config.mongoose.url, config.mongoose.options)
    .then(() => {
      logger.info('Connected to MongoDB: ' + config.mongoose.url);      
      if (config.env === constant.STAGING_DEV_ENV || config.env === constant.PROD_DEV_ENV) {
        const sslOptions = {
          key: fs.readFileSync(config.ssl.privKey),
          cert: fs.readFileSync(config.ssl.fullChainKey)
        };
        server = https.createServer(sslOptions, app).listen(config.port, () => {
          logger.info(`Listening to port ${config.port} (HTTPS)`);
          logger.info(`Server URL: ${config.url}/api/v1`);
        });
      } else {
        server = app.listen(config.port, () => {
          logger.info(`Listening to port ${config.port}`);
          logger.info(`Server URL: ${config.url}/api/v1`);
        });
      }
      const startCronJobs = require('./jobs/job')
      startCronJobs()
    })
    .catch(err => {
      logger.error('Error connecting to MongoDB: ', err);
    });

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.info('Server closed');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, { stack: error.stack });
    exitHandler();
  });

  process.on('unhandledRejection', (error) => {
    logger.error(`Unhandled Rejection: ${error.message}`, { stack: error.stack });
    exitHandler();
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) server.close();
  });
};

module.exports = indexFunction;

