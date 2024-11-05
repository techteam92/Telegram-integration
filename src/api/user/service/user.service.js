const ApiError = require('../../../common/response/error');
const logger = require('../../../common/utils/logger');
const User = require('../model/user.model');
const httpStatus = require('http-status');

const createUser = async (userBody) => {
  if (await User.findOne({ telegramId: userBody.telegramId })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Telegram ID already exists');
  }
  const user = new User(userBody);
  await user.save();
  return user;
};

const getUserByTelegramId = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (!user) {
    return false
  } 
  return user;
};

const updateUserSubscriptionStatus = async (telegramId, status) => {
  const user = await getUserByTelegramId(telegramId);
  user.subscriptionStatus = status;
  await user.save();
  return user;
};

const checkSubscriptionStatus = async (telegramId) => {
  const user = await User.findOne({ telegramId });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user.subscriptionStatus;
};

const getUserApiKey = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  if (user && user.oandaApiKey) {
    return user;
  } else {
    return null;
  }
};

const getUserByUsername = async (username) => {
  const user = await User.findOne({ username: username });
  if (!user) {
      return null;
  }
  return user;
};

const saveUserApiKey = async (telegramId, apiKey, accountType) => {
  await User.updateOne({ telegramId }, { oandaApiKey: apiKey, oandaAccountType: accountType });
  logger.info(`OANDA API key and account type saved for user ${telegramId}`);
};

const saveUserAccountDetails = async (telegramId, apiKey, accountType, accountId) => {
  try {
      await User.updateOne(
          { telegramId },
          { oandaApiKey: apiKey, oandaAccountType: accountType, oandaAccountId: accountId },
          { upsert: true }
      );
      logger.info(`OANDA details saved for user ${telegramId}`);
  } catch (error) {
      logger.error(`Failed to save OANDA details for user ${telegramId}: ${error.message}`);
      throw new Error('Unable to save OANDA account details.');
  }
};

const updateUserAccountId = async (telegramId, accountId) => {
  try {
      const user = await User.findOneAndUpdate(
          { telegramId },
          { oandaAccountId: accountId }, 
          { new: true }
      );
      
      if (!user) {
          logger.error(`User with Telegram ID ${telegramId} not found.`);
          throw new Error('User not found.');
      }
      
      logger.info(`Updated account ID for user with Telegram ID ${telegramId}.`);
      return user;
  } catch (error) {
      logger.error(`Failed to update account ID for user ${telegramId}: ${error.message}`);
      throw error;
  }
};

module.exports = {
  createUser,
  getUserByTelegramId,
  updateUserSubscriptionStatus,
  checkSubscriptionStatus,
  getUserByUsername,
  saveUserApiKey,
  getUserApiKey,
  saveUserAccountDetails,
  updateUserAccountId
};
