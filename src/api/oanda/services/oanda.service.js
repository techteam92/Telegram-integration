const axios = require('axios');
const User = require('../../user/model/user.model');
const logger = require('../../../common/utils/logger');

const OANDA_TEST_URL = 'https://api-fxpractice.oanda.com/v3';
const OANDA_LIVE_URL = 'https://api-fxtrade.oanda.com/v3';

const getUserApiKey = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (user && user.oandaApiKey) {
    return { apiKey: user.oandaApiKey, accountType: user.oandaAccountType || 'test' };
  } else {
    return null;
  }
};

const saveUserApiKey = async (telegramId, apiKey, accountType) => {
  await User.updateOne({ telegramId }, { oandaApiKey: apiKey, oandaAccountType: accountType });
  logger.info(`OANDA API key and account type saved for user ${telegramId}`);
};

const executeOandaTrade = async (telegramId, tradeData) => {
  const userInfo = await getUserApiKey(telegramId);
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
    logger.error(`Error executing trade: ${error.message}`);
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

module.exports = {
  getUserApiKey,
  saveUserApiKey,
  executeOandaTrade,
  validateOandaApiKey,
};
