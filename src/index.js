const mongoose = require('mongoose');
const app = require('./app');
const config = require('./common/config/config');
const logger = require('./common/utils/logger');
const constant = require('./common/config/constant');
const fs = require('fs');
const https = require('https');
require('./bot/bot');
const startSubscriptionCheckJob = require('./jobs/subscriptionJob');
const { scheduleTokenRefreshJob } = require('./jobs/accesstokenJob');

const createHttpsServer = (app, config) => {
  const sslOptions = {
    key: fs.readFileSync(config.ssl.privKey),
    cert: fs.readFileSync(config.ssl.fullChainKey)
  };
  return https.createServer(sslOptions, app);
};

const setupServer = (app, config) => {
  if (config.env === constant.STAGING_DEV_ENV || config.env === constant.PROD_DEV_ENV) {
    const server = createHttpsServer(app, config);
    return server.listen(config.port, () => {
      logger.info(`Listening to port ${config.port} (HTTPS)`);
      logger.info(`Server URL: ${config.url}/api/v1`);
    });
  }
  
  return app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
    logger.info(`Server URL: ${config.url}/api/v1`);
  });
};

const setupProcessHandlers = (server) => {
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

const indexFunction = async () => {
  try {
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info('Connected to MongoDB: ' + config.mongoose.url);

    const server = setupServer(app, config);
    setupProcessHandlers(server);

    // scheduleTokenRefreshJob();
    startSubscriptionCheckJob();
  } catch (err) {
    logger.error('Error connecting to MongoDB: ', err);
    process.exit(1);
  }
};

module.exports = indexFunction;
