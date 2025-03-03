const ApiError = require('../../../common/response/error');
const logger = require('../../../common/utils/logger');
const Platform = require('../model/platform.model');
const User = require('../model/user.model');
const httpStatus = require('http-status');
const novusService = require('../../novus/services/novus.service');

const createUser = async (userBody) => {
  if (await User.findOne({ telegramId: userBody.telegramId })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Telegram ID already exists');
  }
  const user = new User(userBody);
  await user.save();
  return user;
};
const getClickAction = async (telegramId, clickAction) => {
  console.log(telegramId, clickAction);
  return await User.findOneAndUpdate(
    { telegramId: telegramId },
    { $set: { ClickAction: clickAction } },
    { new: true }
  ) || null;
}

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
    { 'trendSettings.unit': units },
    { new: true }
  );
};

const updateUserReceivingSignals = async (telegramId, isReceivingSignals) => {
  return await User.findOneAndUpdate(
    { telegramId },
    { isReceivingSignals },
    { new: true }
  );
};

const updateUserTimeframes = async (telegramId, timeframes) => {
  const allowedTimeframes = ['1m', '5m', '10m', '15m', '30m', '60m'];
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

const updateUserCurrencyPairs = async (telegramId, currencies) => {
  const allowedCurrencies = ['USDJPY', 'EURUSD', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD'];
  const validatedCurrencies = currencies.filter((currency) => allowedCurrencies.includes(currency));

  if (validatedCurrencies.length === 0) {
    validatedCurrencies.push('USDJPY', 'EURUSD');
  }

  return await User.findOneAndUpdate(
    { telegramId },
    { $set: { 'trendSettings.currencyPairs': validatedCurrencies } },
    { new: true }
  );
};

const getUserTradeUnits = async (telegramId) => {
  try {
    const user = await User.findOne({ telegramId });
    if (!user || !user.trendSettings || !user.trendSettings.unit) {
      throw new Error(`Trade units not found for user with Telegram ID: ${telegramId}`);
    }
    return user.trendSettings.unit;
  } catch (error) {
    console.error(`Error fetching trade units for user ${telegramId}: ${error.message}`);
    throw new Error('Failed to fetch trade units.');
  }
};


const getUsersByTradePreferences = async (symbol, timeframe) => {
  try {
    const users = await User.find({
      subscriptionStatus: 'active',
      isReceivingSignals: true,
      'trendSettings.currencyPairs': symbol,
      'trendSettings.timeframes': timeframe,
    });
    return users;
  } catch (error) {
    console.log(`Error fetching users by preferences: ${error}`);
    throw error;
  }
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

const getActivePlatformAccount = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.activePlatform) {
      throw new Error(`Active platform not set for user with ID: ${userId}`);
    }
    const platform = await Platform.findOne({
      userId,
      platformName: user.activePlatform,
    });
    if (!platform) {
      throw new Error(`No platform details found for user with ID: ${userId} and platform: ${user.activePlatform}`);
    }
    const activeAccount = platform.accounts.find((account) => account.isActive);
    // if (!activeAccount) {
    //   throw new Error(`No active account found for platform: ${user.activePlatform}`);
    // }
    return {
      platformName: platform.platformName,
      activeAccount,
      accessToken: platform.accessToken,
      tokenExpiry: platform.tokenExpiry,
    };
  } catch (error) {
    console.error(`Error fetching active platform account for user ${userId}: ${error.message}`);
    throw new Error('Failed to fetch active platform account.');
  }
};


const setActivePlatform = async (telegramId, platformName) => {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      { activePlatform: platformName },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error(`Error setting active platform for user ${telegramId}: ${error.message}`);
    throw new Error('Failed to set active platform.');
  }
};

const setActivePlatformAccount = async (userId, platformName, accountId) => {
  await Platform.updateOne(
    { userId, platformName, 'accounts.accountId': accountId },
    { $set: { 'accounts.$.isActive': true, currentAccount: accountId } }
  );
  return Platform.findOne({ userId, platformName });
};

const getActivePlatform = async (userId) => {
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) throw new Error(`User with Telegram ID ${telegramId} not found.`);
    return user.activePlatform;
  } catch (error) {
    console.error(`Error fetching active platform for user ${telegramId}: ${error.message}`);
    throw new Error('Failed to fetch active platform.');
  }
};


const addPlatformAccount = async (userId, platformName, account) => {
  try {
    const existingPlatform = await Platform.findOne({
      userId,
      platformName,
      accounts: { $elemMatch: { accountId: account.accountId } },
    });

    if (existingPlatform) {
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

const updatePlatformAccounts = async (userId, platformName, accounts) => {
  return Platform.findOneAndUpdate(
    { userId, platformName },
    { $set: { accounts } },
    { new: true } 
  ).exec();
};

const getActivePlatformDetails = async (userId, platformName) => {
  try {
    const platform = await Platform.findOne({ userId, platformName });
    if (!platform || !platform.accessToken) {
      return false;
    }
    const activeAccount = platform.accounts.find((account) => account.isActive);
    if (!activeAccount) {
      return false;
    }
    return {
      accessToken: platform.accessToken,
      activeAccountId: activeAccount.accountId,
    };
  } catch (error) {
    console.error(`Error fetching active platform details for user ${userId}: ${error.message}`);
    throw new Error('Failed to fetch active platform details.');
  }
};

const updatePlatformCredentials = async (telegramId, platformName, username, password) => {
  try {
    const user = await User.findOne({ telegramId });
    if (!user) throw new Error(`User not found for Telegram ID: ${telegramId}`);
    const userId = user._id;
    const platform = await Platform.findOneAndUpdate(
      { userId, platformName },
      { username, password },
      { new: true, upsert: true }
    );
    return platform;
  } catch (error) {
    console.error(`Error updating platform credentials: ${error.message}`);
    throw error;
  }
};

const refreshPlatformAccessToken = async (userId, platformName) => {
  try {
    const platform = await Platform.findOne({ userId, platformName });
    if (!platform) throw new Error(`Platform not found for user ID: ${userId} and platform: ${platformName}`);
    const { username, password } = platform;
    if (!username || !password) {
      throw new Error('Username and password are required to refresh the access token.');
    }
    const decryptedPassword = password; 
    const sessionToken = await novusService.loginUser(username, 'default', decryptedPassword);
    platform.accessToken = sessionToken;
    platform.tokenExpiry = new Date(Date.now() + 30 * 60 * 1000); 
    await platform.save();
    console.log(`${username}'s Access token refreshed successfully for platform ${platformName}.`);
    return platform;
  } catch (error) {
    console.error(`Error refreshing access token: ${error.message}`);
    throw error;
  }
};


module.exports = {
  createUser,
  getUserByTelegramId,
  getUserByTelegramUsername,
  getClickAction,
  updateUserSubscriptionStatus,
  getExpiredUsers,
  updateUserTradeType,
  updateUserUnits,
  updateUserReceivingSignals,
  updateUserTimeframes,
  updateUserCurrencyPairs,
  getUserTradeUnits,
  getUsersByTradePreferences, 
  getSubscribedUsersWithTimeframe, 
  getPlatformAccounts,  
  getActivePlatformAccount,
  setActivePlatform,
  getActivePlatform,
  setActivePlatformAccount,
  addPlatformAccount,
  createOrUpdatePlatform,
  checkPlatformAccount,
  updatePlatformAccounts,
  getActivePlatformDetails,
  updatePlatformCredentials,
  refreshPlatformAccessToken
};
