module.exports = async (bot, chatId) => {
  const unitsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '$1', callback_data: 'unit_1' },
          { text: '$5', callback_data: 'unit_5' },
          { text: '$10', callback_data: 'unit_10' },
          { text: '$20', callback_data: 'unit_20' },
        ],
        [
          { text: '$50', callback_data: 'unit_50' },
          { text: '$100', callback_data: 'unit_100' },
          { text: '$200', callback_data: 'unit_200' },
          { text: '$500', callback_data: 'unit_500' },
        ],
      ],
    },
  };

  await bot.sendMessage(chatId, 'Select your trade units:', unitsKeyboard);
};
