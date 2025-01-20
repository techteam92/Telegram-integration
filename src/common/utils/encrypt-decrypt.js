const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.PLATFORM_ENCRYPTION_KEY; 
const IV_LENGTH = 16;       

/**
 * Encrypts plain text.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} - The encrypted text in base64 format.
 */
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('base64')}:${encrypted}`;
};

/**
 * Decrypts encrypted text.
 * @param {string} encryptedText - The encrypted text in base64 format.
 * @returns {string} - The decrypted plain text.
 */
const decrypt = (encryptedText) => {
  const [iv, encrypted] = encryptedText.split(':').map((part) => Buffer.from(part, 'base64'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

module.exports = { encrypt, decrypt };
