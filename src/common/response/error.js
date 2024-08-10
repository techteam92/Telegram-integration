const { __mf } = require("i18n");
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    if(typeof message == "object" || typeof message == Object){
      message = message ? __mf(message?.msg, message?.keys) : "";
    }
    else{
      message = message
    }
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
