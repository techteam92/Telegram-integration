const { logger_methods } = require('../utils/logger/logger_methods');
const { __mf } = require("i18n");

module.exports.response = (statusCode, message = "", data, status= true, req, res) => {
  const resMessage = message ? __mf(message?.msg, message?.keys) : "";
  logger_methods[statusCode](
    resMessage,
    statusCode,
    req.user?.id,
    req.originalUrl,
    req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.connection.remoteAddress || null
  );
  return res.status(statusCode).json({
    status: status,
    statusCode: statusCode,
    message: resMessage,
    data: data
  });
};
