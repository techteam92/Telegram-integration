var jwt = require('jsonwebtoken');
const { encryptToken } = require('./encrypt_decrypt');

exports.create_jwt_token = async (secret, time, payload) => {
  try {
    var accessToken = jwt.sign(payload, secret, { expiresIn: time });
    accessToken = encryptToken(accessToken);
    return Promise.resolve(accessToken);
  } catch (error) {
    return Promise.reject(error);
  }
};
