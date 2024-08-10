
const CryptoJS = require('crypto-js');
const config = require('../../config/config')

exports.encryptToken = (token) => {
  const x = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(token), config.aesEncryptDcryptKey).toString();
  return Buffer.from(x, 'utf8').toString('base64');
};

exports.decryptToken = (token) => {
  const utf8encoded = Buffer.from(token, 'base64').toString('utf8');
  const bytes = CryptoJS.AES.decrypt(utf8encoded, config.aesEncryptDcryptKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
