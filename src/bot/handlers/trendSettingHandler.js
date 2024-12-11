const trendSettingsCallbacks = require('../callbacks/trendSettingsCallbacks');

module.exports = async (bot, chatId) => {
  const trendSettingsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Trade Type', callback_data: 'trend_tradeType' }],
        [{ text: 'Auto-Trade', callback_data: 'trend_autoTrade' }],
        [{ text: 'Disconnect', callback_data: 'trend_disconnect' }],
      ],
    },
  };

  await bot.sendMessage(chatId, 'Choose a trend setting to configure:', trendSettingsKeyboard);
};
