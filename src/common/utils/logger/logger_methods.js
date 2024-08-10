const logger = require('./index');

/**
 * Helper function to log messages.
 * @param {Function} logMethod // logger method (error, info, warn)
 * @param {string} error_message // error_message from system
 * @param {Number} error_code // error code from system
 * @param {String} user_id // id of user generated the request from system
 * @param {String} current_end_point // current endPoint from system
 * @param {String} ip // ip of the user from system
 */

const logMessage = async (logMethod, error_message, error_code, user_id, current_end_point, ip) => {
  logMethod(`${error_message}--:--${error_code}--:--${user_id}--:--${current_end_point}--:--${ip}`);
};

exports.errorM = async (error_message, error_code, user_id, current_end_point, ip) => {
  await logMessage(logger.error, error_message, error_code, user_id, current_end_point, ip);
};

exports.info = async (error_message, error_code, user_id, current_end_point, ip) => {
  await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
};

exports.logger_methods = {
  200: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
  },
  201: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
  },
  400: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
  },
  401: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
  },
  404: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
  },
  409: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.info, error_message, error_code, user_id, current_end_point, ip);
  },
  500: async (error_message, error_code, user_id, current_end_point, ip) => {
    await logMessage(logger.error, error_message, error_code, user_id, current_end_point, ip);
  },
};
