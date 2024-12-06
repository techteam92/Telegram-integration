const userService = require('../../api/user/service/user.service');

module.exports = async (bot, chatId) => {
  const user = await userService.getUserByTelegramId(chatId.toString());

  if (!user || user.subscriptionStatus !== 'active') {
    return bot.sendMessage(chatId, 'Please subscribe to access trend settings.');
  }

  const trendSettingsKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Trade Type: Demo', callback_data: 'trend_demo' },
          { text: 'Trade Type: Live', callback_data: 'trend_live' },
        ],
        [
          { text: 'Auto-Trade: On', callback_data: 'auto_on' },
          { text: 'Auto-Trade: Off', callback_data: 'auto_off' },
        ],
        [{ text: 'Disconnect Accounts', callback_data: 'disconnect_accounts' }],
      ],
    },
  };

  await bot.sendMessage(chatId, 'Adjust your trend settings:', trendSettingsKeyboard);

  bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;

    if (data === 'trend_demo' || data === 'trend_live') {
      const tradeType = data === 'trend_demo' ? 'Demo' : 'Live';
      await userService.updateUserTradeSettings(chatId.toString(), { tradeType });
      await bot.sendMessage(chatId, `Trade type updated to ${tradeType}.`);
    } else if (data === 'auto_on' || data === 'auto_off') {
      const autoTrade = data === 'auto_on';
      await userService.updateUserTradeSettings(chatId.toString(), { autoTrade });
      await bot.sendMessage(chatId, `Auto-trade turned ${autoTrade ? 'On' : 'Off'}.`);
    } else if (data === 'disconnect_accounts') {
      await userService.removeUserAccountDetails(chatId.toString());
      await bot.sendMessage(chatId, 'All connected accounts have been disconnected.');
    }
  });
};
