const userService = require('../../api/user/service/user.service');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  if (data === 'trend_tradeType') {
    const tradeTypeKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Demo', callback_data: 'trend_tradeType_demo' }],
          [{ text: 'Live', callback_data: 'trend_tradeType_live' }],
        ],
      },
    };

    await bot.sendMessage(chatId, 'Select your trade type:', tradeTypeKeyboard);
  } else if (data.startsWith('trend_tradeType_')) {
    const tradeType = data.split('_')[2];
    await userService.updateUserTrendSettings(chatId, { tradeType });
    await bot.sendMessage(chatId, `Trade type updated to ${tradeType}.`);
  } else if (data.startsWith('trend_amount_')) {
    const amount = `$${data.split('_')[2]}`;
    await userService.updateUserTrendSettings(chatId, { tradeAmount: amount });
    await bot.sendMessage(chatId, `Trade amount updated to ${amount}.`);
  } else if (data === 'trend_autoTrade') {
    const autoTradeKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'On', callback_data: 'trend_autoTrade_on' }],
          [{ text: 'Off', callback_data: 'trend_autoTrade_off' }],
        ],
      },
    };

    await bot.sendMessage(chatId, 'Enable or disable auto-trade:', autoTradeKeyboard);
  } else if (data.startsWith('trend_autoTrade_')) {
    const autoTrade = data.split('_')[2] === 'on';
    await userService.updateUserTrendSettings(chatId, { autoTrade });
    await bot.sendMessage(chatId, `Auto-trade is now ${autoTrade ? 'enabled' : 'disabled'}.`);
  } else if (data === 'trend_disconnect') {
    const connectedAccounts = await userService.getUserByTelegramId(chatId).connectedAccounts;

    if (connectedAccounts.length === 0) {
      return bot.sendMessage(chatId, 'No connected accounts to disconnect.');
    }

    const disconnectKeyboard = {
      reply_markup: {
        inline_keyboard: connectedAccounts.map((account) => [
          {
            text: `${account.accountType} (${account.accountId})`,
            callback_data: `trend_disconnect_${account.accountType}`,
          },
        ]),
      },
    };

    await bot.sendMessage(chatId, 'Select an account to disconnect:', disconnectKeyboard);
  } else if (data.startsWith('trend_disconnect_')) {
    const accountType = data.split('_')[2];
    await userService.disconnectUserAccount(chatId, accountType);
    await bot.sendMessage(chatId, `${accountType} account disconnected.`);
  } else {
    await bot.sendMessage(chatId, 'Invalid trend settings action. Please try again.');
  }
};
