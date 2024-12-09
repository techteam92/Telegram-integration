const userService = require('../../api/user/service/user.service');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();
  try {
    if (data.startsWith('unit_')) {
      const units = data.split('_')[1];
      await userService.updateUserUnits(chatId, units);
      await bot.sendMessage(chatId, `Trade units updated to $${units}.`);
    } else {
      await bot.sendMessage(chatId, 'Invalid trade unit selection.');
    }
  } catch (error) {
    console.error(`Error handling setUnits callback: ${error.message}`);
    await bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
};
