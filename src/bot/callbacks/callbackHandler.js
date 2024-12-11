const trendSettingsCallbacks = require('./trendSettingsCallbacks');
const setUnitsCallbacks = require('./setUnitsCallbacks');
const { handleConnectAccount } = require('./connectAccountCallbacks');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  try {
    switch (true) {
      case data.startsWith('trend_'):
        return trendSettingsCallbacks(bot, callbackQuery);

      case data.startsWith('unit_'):
        return setUnitsCallbacks(bot, callbackQuery);

      case data.startsWith('connect_'):
        return handleConnectAccount(bot, callbackQuery);

      default:
        await bot.sendMessage(chatId, 'Invalid action. Please try again.');
    }
  } catch (error) {
    console.error(`Error handling callback: ${error.message}`);
    await bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
};

