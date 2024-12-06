const userService = require('../../api/user/service/user.service');

module.exports = async (bot, chatId) => {
  const unitsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '$1', callback_data: 'unit_1' }],
        [{ text: '$5', callback_data: 'unit_5' }],
        [{ text: '$10', callback_data: 'unit_10' }],
      ],
    },
  };

  await bot.sendMessage(chatId, 'Select your trade units:', unitsKeyboard);

  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;

    if (data.startsWith('unit_')) {
      const units = data.split('_')[1];
      await userService.updateUserUnits(chatId.toString(), units);
      await bot.sendMessage(chatId, `Trade units updated to $${units}.`);
    }
  });
};
