const userService = require('../../api/user/service/user.service');

const subscriptionMiddleware = (bot, next) => async (msg) => {
  const telegramId = msg.from.id.toString();
  const user = await userService.getUserByTelegramId(telegramId);

  if (!user || user.subscriptionStatus !== 'active') {
    await bot.sendMessage(telegramId, 'Your subscription is inactive. Please subscribe to use this feature.');
    return;
  }

  next(bot, msg);
};

module.exports = { subscriptionMiddleware };
