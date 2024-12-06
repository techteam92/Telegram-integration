const userService = require('../../api/user/service/user.service');

module.exports = async (bot, chatId) => {
  const user = await userService.getUserByTelegramId(chatId.toString());

  if (!user || user.subscriptionStatus !== 'active') {
    return bot.sendMessage(chatId, 'You are not currently receiving any signals.');
  }

  await bot.sendMessage(chatId, 'You have successfully stopped receiving signals. Use the "Start Signal" button to resume.');
};
