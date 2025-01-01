module.exports = async (bot, chatId) => {
  const unitsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '0.01', callback_data: 'unit_0.01' },
          { text: '0.02', callback_data: 'unit_0.02' },
          { text: '0.05', callback_data: 'unit_0.05' },
          { text: '0.1', callback_data: 'unit_0.1' },
        ],
        [
          { text: '0.2', callback_data: 'unit_0.2' },
          { text: '0.5', callback_data: 'unit_0.5' },
          { text: '1', callback_data: 'unit_1' },
          { text: 'Custom Value', callback_data: 'unit_custom' },
        ],
      ],
    },
  };

  await bot.sendMessage(chatId, 'Select your lot size (1 lot = 100,000 units):', unitsKeyboard);
};
