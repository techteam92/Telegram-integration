const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const httpStatus = require('http-status');
const config = require('./common/config/config');
const morgan = require('./common/config/morgan');
const { authLimiter } = require('./common/middlewares/rateLimiter');
const api = require('./routes/api');
const { errorConverter, errorHandler } = require('./common/middlewares/error');
const i18n = require('./common/utils/i18n');
const ApiError = require('./common/response/error');
const constant = require('./common/config/constant');
const app = express();

app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: "text/plain" }));
app.use(mongoSanitize());
app.use(compression());
app.use(cors());
app.options('*', cors());
app.use(i18n.init);

if (config.env === constant.PROD_DEV_ENV) {
  app.use('/v1/auth', authLimiter);
}

app.use('/api', api);
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Route not found'));
});

app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
