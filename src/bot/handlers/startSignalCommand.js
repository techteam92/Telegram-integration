const userService = require('../../api/user/service/user.service');

module.exports = async (bot, chatId) => {
  const user = await userService.getUserByTelegramId(chatId.toString());

  if (!user || user.subscriptionStatus !== 'active') {
    return bot.sendMessage(
      chatId,
      'You need to subscribe to receive signals. Please subscribe from the main menu.'
    );
  }

  await bot.sendMessage(chatId, 'You will now start receiving signals. Use the "Stop Signal" button to stop receiving.');
};
