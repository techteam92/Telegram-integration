const axios = require('axios');
const logger = require('../../../common/utils/logger');
const userService = require('../../user/service/user.service');

const OANDA_TEST_URL = 'https://api-fxpractice.oanda.com/v3';
const OANDA_LIVE_URL = 'https://api-fxtrade.oanda.com/v3';

const executeOandaTrade = async (telegramId, tradeData) => {
  const userInfo = await userService.getUserApiKey(telegramId);
  if (!userInfo) {
    throw new Error("API key not found. Please provide your OANDA API key.");
  }

  const { apiKey, accountType } = userInfo;
  const apiUrl = accountType === 'live' ? OANDA_LIVE_URL : OANDA_TEST_URL;
  const accountID = tradeData.accountID; 
  
  try {
    const response = await axios.post(`${apiUrl}/accounts/${accountID}/orders`, tradeData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error executing trade:", error); 
    logger.error(`Error executing trade: ${error}`);
    throw error;
  }
};

const validateOandaApiKey = async (apiKey, accountType) => {
  const apiUrl = accountType === 'live' ? OANDA_LIVE_URL : OANDA_TEST_URL;
  try {
    const response = await axios.get(`${apiUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`API Key validation failed: ${error.message}`);
    throw error;
  }
};

const fetchUserAccounts = async (apiKey, accountType) => {
  const apiUrl = accountType === 'live' ? OANDA_LIVE_URL : OANDA_TEST_URL;

  try {
      const response = await axios.get(`${apiUrl}/accounts`, {
          headers: {
              'Authorization': `Bearer ${apiKey}`
          }
      });
      return response.data.accounts;
  } catch (error) {
      logger.error(`Error fetching user accounts from OANDA: ${error.message}`);
      throw new Error("Failed to fetch accounts. Please check your API key and try again.");
  }
};

module.exports = {
  executeOandaTrade,
  validateOandaApiKey,
  fetchUserAccounts
};
