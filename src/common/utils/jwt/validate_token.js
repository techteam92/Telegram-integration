const jwt = require('jsonwebtoken');
const { decryptToken } = require('./encrypt_decrypt');

exports.validate_token = async (token, secret) => {
  try {
    const jwtToken = token;
    if (jwtToken.includes('Bearer')) {
      jwtToken = jwtToken.split(' ')[1];
    }
    const decrypt = decryptToken(jwtToken);
    const data = jwt.verify(decrypt, secret);
    console.log('data', data);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};
