const crypto = require('crypto');

/**
 * Generates a unique order code for each order
 * @param {string} userId - The user's unique Telegram ID or database ID
 * @param {string} signalId - The signal ID associated with the trade
 * @param {string} accountId - The user's account ID for the trade
 * @returns {string} - A unique order code
 */
const generateOrderCode = (accountId) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString('hex');
  const orderCode = `${accountId}-${timestamp}-${randomString}`;
  return orderCode.slice(0, 64);
};

module.exports = { generateOrderCode };
