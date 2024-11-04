const axios = require('axios');
const logger = require('../../../common/utils/logger');

const DXTRADE_BASE_URL = 'https://dx.envifx.com/dxsca-web/api';

/**
 * Logs in to DXtrade to obtain a session token.
 * @param {string} username - User's DXtrade username.
 * @param {string} domain - User's DXtrade domain.
 * @param {string} password - User's DXtrade password.
 * @returns {object} - Contains session token and timeout information.
 */

const login = async (username, domain, password) => {
  try {
    const response = await axios.post(`${DXTRADE_BASE_URL}/login`, {
      username,
      domain,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data; 
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    throw new Error("Login failed. Check your credentials.");
  }
};


/**
 * Places an order on DXtrade.
 * @param {string} sessionToken - The session token obtained from login.
 * @param {string} accountId - The account ID for placing the order.
 * @param {object} orderData - Order details including order code, type, instrument, etc.
 * @returns {object} - Response data from the order placement.
 */
const placeOrder = async (sessionToken, accountId, orderData) => {
    try {
      const response = await axios.post(`${DXTRADE_BASE_URL}/accounts/${accountId}/orders`, orderData, {
        headers: {
          'Authorization': sessionToken,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`Order placement failed: ${error.message}`);
      throw new Error("Order placement failed. Please check your order details and try again.");
    }
  };
  
  

module.exports = {
  login,
  placeOrder
};
