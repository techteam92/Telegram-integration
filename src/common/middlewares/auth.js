const httpStatus = require('http-status');
const ApiError = require('../../common/response/error');
const { roles } = require('../../common/config/roles');
const { validate_token } = require('../utils/jwt/validate_token');
const config = require('../config/config');
const logger = require('../utils/logger');
const tokenService = require('../../api/token/service/token.service');

const auth =
  (allowedRoles = []) =>
  async (req, res, next) => {
    let token = req.headers.authorization;

    try {
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
      }

      if (token.includes('Bearer')) {
        token = token.split(' ')[1];
      }

      console.log('url:', req.originalUrl);
      console.log('token:', token);

      const payload = await validate_token(token, config.jwt.secret);
      console.log('payload:', payload);

      if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
      }

      if (![roles.admin, roles.user].includes(payload.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized');
      }

      await tokenService.verifyToken(payload, token);

      req.user = payload;
      req.role = payload.role;

      next();
    } catch (ex) {
      logger.error(ex.message);
      next(ex);
    }
  };

module.exports = auth;
