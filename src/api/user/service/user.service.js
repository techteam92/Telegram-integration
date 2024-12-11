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
  return await User.findOne({ telegramId }) || null;
};

const getUserByTelegramUsername = async (telegramUsername) => {
  return await User.findOne({ username: telegramUsername }) || null;
};

const updateUserSubscriptionStatus = async (telegramId, status, expiryDate = null, plan = null) => {
  const updateFields = { subscriptionStatus: status };
  if (expiryDate) updateFields.subscriptionExpiry = expiryDate;
  if (plan) updateFields.subscriptionPlan = plan;

  try {
    return await User.findOneAndUpdate(
      { telegramId },
      { $set: updateFields },
      { new: true }
    );
  } catch (error) {
    logger.error(`Error updating subscription for user ${telegramId}: ${error.message}`);
    throw error;
  }
};

const getExpiredUsers = async (currentDate) => {
  return await User.find({
    subscriptionStatus: 'active',
    subscriptionExpiry: { $lt: currentDate },
  });
};

const updateUserTradeType = async (telegramId, tradeType) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { tradeType },
    { new: true }
  );
};

const updateUserUnits = async (telegramId, units) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { units },
    { new: true }
  );
};

const updateUserAutoTrade = async (telegramId, autoTrade) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { 'trendSettings.autoTrade': autoTrade },
    { new: true }
  );
};

const updateNovusToken = async (telegramId, accessToken, expiryDate) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { novusAccessToken: accessToken, novusTokenExpiry: expiryDate },
    { new: true }
  );
};

const getNovusToken = async (telegramId) => {
  const user = await User.findOne({ telegramId });
  const currentTime = new Date();
  if (user?.novusAccessToken && user.novusTokenExpiry > currentTime) {
    return user.novusAccessToken;
  }
  return null;
};

const updateUserConnectedAccounts = async (telegramId, accountType, accountId) => {
  const user = await User.findOne({ telegramId });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const existingAccountIndex = user.connectedAccounts.findIndex(
    (account) => account.accountType === accountType
  );

  if (existingAccountIndex !== -1) {
    user.connectedAccounts[existingAccountIndex].accountId = accountId;
  } else {
    user.connectedAccounts.push({ accountType, accountId });
  }
  return await user.save();
};

const disconnectUserAccount = async (telegramId, accountType) => {
  const user = await User.findOne({ telegramId });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  user.connectedAccounts = user.connectedAccounts.filter(
    (account) => account.accountType !== accountType
  );
  return await user.save();
};

const updateUserReceivingSignals = async (telegramId, isReceivingSignals) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { isReceivingSignals },
    { new: true }
  );
};

const updateUserAccountDetails = async (telegramId, sessionToken) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { telegramId },
      { novusAccessToken: sessionToken, novusTokenExpiry: new Date(Date.now() + 1800000) }, 
      { new: true }
    );
    if (!updatedUser) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating Novus account details for user ${telegramId}: ${error.message}`);
    throw error;
  }
};


module.exports = {
  createUser,
  getUserByTelegramId,
  getUserByTelegramUsername,
  updateUserSubscriptionStatus,
  getExpiredUsers,
  updateUserTradeType,
  updateUserUnits,
  updateUserAutoTrade,
  updateNovusToken,
  getNovusToken,
  updateUserConnectedAccounts,
  disconnectUserAccount,
  updateUserReceivingSignals,
  updateUserAccountDetails
};