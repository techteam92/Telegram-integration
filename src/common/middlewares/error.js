const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const logger = require('../utils/logger');
const ApiError = require('../../common/response/error');
const constant = require('../config/constant');
const JWT = require('jsonwebtoken');
const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    let statusCode
    if(error instanceof JWT.TokenExpiredError){
      statusCode = httpStatus.UNAUTHORIZED
    }
    else if(error instanceof mongoose.Error){
      statusCode = httpStatus.BAD_REQUEST
    }
    else{
      statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR
    }
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, true, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.log(err)
  let { statusCode, message } = err;
  if (config.env === constant.PROD_DEV_ENV && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    statusCode: statusCode,
    message : message,
    ...(config.env === constant.LOCAL_DEV_ENV && { stack: err.stack }),
  };

  if (config.env ===constant.LOCAL_DEV_ENV) {
    logger.error(err.message);
    logger.error(err.stack);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
