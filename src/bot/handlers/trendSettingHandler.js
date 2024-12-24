module.exports = async (bot, chatId) => {
  const trendSettingsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Start Signal', callback_data: 'trend_startSignal' }],
        [{ text: 'Stop Signal', callback_data: 'trend_stopSignal' }],
        [{ text: 'Set Units', callback_data: 'trend_setUnits' }],
        [{ text: 'Set Timeframes', callback_data: 'trend_setTimeframes' }],
        [{ text: 'Set CurrencyPair', callback_data: 'trend_setCurrencyPairs'}]
      ],
    },
  };

  await bot.sendMessage(chatId, 'Choose a trend setting to configure:', trendSettingsKeyboard);
};
