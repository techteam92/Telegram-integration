const userService = require('../../api/user/service/user.service');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  if (data.startsWith('unit_')) {
    const units = data.split('_')[1];
    await userService.updateUserUnits(chatId, units);
    return bot.sendMessage(chatId, `Trade units updated to $${units}.`);
  }

  return bot.sendMessage(chatId, 'Invalid unit setting action.');
};
