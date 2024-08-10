const ApiError = require('../../../common/response/error');
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
  user.subscription_status = status;
  await user.save();
  return user;
};

const checkSubscriptionStatus = async (telegramId) => {
  const user = await User.findOne({ telegramId });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user.subscription_status;
};

module.exports = {
  createUser,
  getUserByTelegramId,
  updateUserSubscriptionStatus,
  checkSubscriptionStatus,
};
