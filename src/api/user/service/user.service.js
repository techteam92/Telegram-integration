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
    return false;
  }
  return user;
};

const updateUserSubscriptionStatus = async (telegramId, status, expiryDate = null) => {
  try {
    const updateFields = { subscriptionStatus: status };
    if (expiryDate) {
      updateFields.subscriptionExpiry = expiryDate;
    }
    const updatedUser = await User.findOneAndUpdate(
      { telegramId },
      { $set: updateFields },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating subscription status for ${telegramId}: ${error.message}`);
    throw error;
  }
};

const getExpiredUsers = async (currentDate) => {
  try {
    const expiredUsers = await User.find({
      subscriptionStatus: 'active',
      subscriptionExpiry: { $lt: currentDate },
    });
    return expiredUsers;
  } catch (error) {
    logger.error(`Error fetching expired users: ${error.message}`);
    throw error;
  }
};

const checkSubscriptionStatus = async (telegramId) => {
  const user = await User.findOne({ telegramId });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user.subscriptionStatus;
};

const getUserByUsername = async (username) => {
  const user = await User.findOne({ username: username });
  if (!user) {
    return null;
  }
  return user;
};

const updateUserUnits = async (telegramId, units) => {
  return User.findOneAndUpdate({ telegramId }, { units }, { new: true });
};

const updateUserReceivingSignals = async (telegramId, isReceivingSignals) => {
  try {
    const user = await User.findOneAndUpdate(
      { telegramId },
      { isReceivingSignals },
      { new: true }
    );
    return user;
  } catch (error) {
    logger.error(`Error updating signal status for user ${telegramId}: ${error.message}`);
    throw error;
  }
};

const updateUserConnectedAccounts = async (telegramId, accountType, accountId) => {
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const updatedAccounts = [...user.connectedAccounts];
    const existingAccountIndex = updatedAccounts.findIndex(
      (account) => account.accountType === accountType
    );

    if (existingAccountIndex !== -1) {
      updatedAccounts[existingAccountIndex].accountId = accountId;
    } else {
      updatedAccounts.push({ accountType, accountId });
    }
    const updatedUser = await User.findOneAndUpdate(
      { telegramId },
      { connectedAccounts: updatedAccounts },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating connected accounts for user ${telegramId}: ${error.message}`);
    throw error;
  }
};

const disconnectUserAccount = async (telegramId, accountType) => {
  try {
    const user = await User.findOne({ telegramId });
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    const updatedAccounts = user.connectedAccounts.filter(
      (account) => account.accountType !== accountType
    );
    const updatedUser = await User.findOneAndUpdate(
      { telegramId },
      { connectedAccounts: updatedAccounts },
      { new: true }
    );

    return updatedUser;
  } catch (error) {
    logger.error(`Error disconnecting account for user ${telegramId}: ${error.message}`);
    throw error;
  }
};

const updateUserTrendSettings = async (telegramId, trendSettings) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { telegramId },
      { trendSettings },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating trend settings for user ${telegramId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserByTelegramId,
  updateUserSubscriptionStatus,
  getExpiredUsers,
  checkSubscriptionStatus,
  getUserByUsername,
  updateUserUnits,
  updateUserReceivingSignals,
  updateUserConnectedAccounts,
  disconnectUserAccount,
  updateUserTrendSettings,
};
