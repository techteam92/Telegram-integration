const ApiError = require('../../../common/response/error');
const logger = require('../../../common/utils/logger');
const Platform = require('../model/platform.model');
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

const updateUserTrendSettings = async (telegramId, trendSettings) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { $set: { trendSettings } },
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

const updateUserTimeframes = async (telegramId, timeframes) => {
  const allowedTimeframes = ['1m', '5m', '10m', '15m', '30m', '1hr'];
  const validatedTimeframes = timeframes.filter((tf) => allowedTimeframes.includes(tf));

  if (validatedTimeframes.length === 0) {
    validatedTimeframes.push('1m'); 
  }

  return await User.findOneAndUpdate(
    { telegramId },
    { $set: { 'trendSettings.timeframes': validatedTimeframes } },
    { new: true }
  );
};

const getSubscribedUsersWithTimeframe = async (timeframe) => {
  return await User.find({
    subscriptionStatus: 'active',
    'trendSettings.timeframes': timeframe, 
  });
};

const checkPlatformAccount = async (userId, platformName) => {
  const platform = await Platform.findOne({ userId, platformName });
  if (!platform) {
    return null;
  }
  return platform
};

const getPlatformAccounts = async (userId, platformName) => {
  const platform = await Platform.findOne({ userId, platformName });
  return platform?.accounts || [];
};

const setActivePlatformAccount = async (userId, platformName, accountId) => {
  await Platform.updateOne(
    { userId, platformName, 'accounts.accountId': accountId },
    { $set: { 'accounts.$.isActive': true, currentAccount: accountId } }
  );
  return Platform.findOne({ userId, platformName });
};

const addPlatformAccount = async (userId, platformName, account) => {
  try {
    const existingPlatform = await Platform.findOne({
      userId,
      platformName,
      accounts: { $elemMatch: { accountId: account.accountId } },
    });

    if (existingPlatform) {
      logger.info(`Account ${account.accountId} already exists for platform ${platformName}`);
      return existingPlatform;
    }
    const platform = await Platform.findOneAndUpdate(
      { userId, platformName },
      { $push: { accounts: account } },
      { new: true, upsert: true }
    );
    return platform;
  } catch (error) {
    logger.error(
      `Error adding account ${account.accountId} to platform ${platformName} for user ${userId}: ${error.message}`
    );
    throw new Error('Failed to add platform account');
  }
};

const createOrUpdatePlatform = async (userId, platformName, accessToken, tokenExpiry) => {
  try {
    const platform = await Platform.findOneAndUpdate(
      { userId, platformName },
      { accessToken, tokenExpiry }, 
      { new: true, upsert: true }
    );
    return platform;
  } catch (error) {
    logger.error(
      `Error creating or updating platform ${platformName} for user ${userId}: ${error.message}`
    );
    throw new Error('Failed to create or update platform');
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
  updateUserTrendSettings,
  updateUserAccountDetails,
  updateUserTimeframes, 
  getSubscribedUsersWithTimeframe, 
  getPlatformAccounts,
  setActivePlatformAccount,
  addPlatformAccount,
  createOrUpdatePlatform,
  checkPlatformAccount
};
