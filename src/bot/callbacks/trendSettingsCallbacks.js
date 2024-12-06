const userService = require('../../api/user/service/user.service');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  switch (data) {
    case 'trend_demo':
      await userService.updateUserTradeSettings(chatId, { tradeType: 'Demo' });
      return bot.sendMessage(chatId, 'Trade type updated to Demo.');

    case 'trend_live':
      await userService.updateUserTradeSettings(chatId, { tradeType: 'Live' });
      return bot.sendMessage(chatId, 'Trade type updated to Live.');

    case 'auto_on':
      await userService.updateUserTradeSettings(chatId, { autoTrade: true });
      return bot.sendMessage(chatId, 'Auto-trade turned On.');

    case 'auto_off':
      await userService.updateUserTradeSettings(chatId, { autoTrade: false });
      return bot.sendMessage(chatId, 'Auto-trade turned Off.');

    case 'disconnect_accounts':
      await userService.removeUserAccountDetails(chatId);
      return bot.sendMessage(chatId, 'All connected accounts have been disconnected.');

    default:
      return bot.sendMessage(chatId, 'Invalid trend setting action.');
  }
};
