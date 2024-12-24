const userService = require('../../api/user/service/user.service');
const startSignalHandler = require('./startSignalCallback');
const stopSignalHandler = require('./stopSignalCallback');
const setUnitHandler = require('./setUnitsCallback');
const setTimeframeHandler = require('./setTimeframeCallback');
const setCurrencyPairHandler = require('./setCurrencyPairsCallback');  

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  switch (data) {
    case 'trend_startSignal':
      const userForStartSignal = await userService.getUserByTelegramId(chatId); 
      return startSignalHandler(bot, chatId, userForStartSignal);

    case 'trend_stopSignal':
      return stopSignalHandler(bot, chatId);

    case 'trend_setUnits':
      return setUnitHandler(bot, chatId);

    case 'trend_setTimeframes':
      const userForTimeframe = await userService.getUserByTelegramId(chatId); 
      return setTimeframeHandler(bot, chatId, userForTimeframe);

    case 'trend_setCurrencyPairs':  
      const userForCurrencyPairs = await userService.getUserByTelegramId(chatId);
      return setCurrencyPairHandler(bot, chatId, userForCurrencyPairs);  

    default:
      return bot.sendMessage(chatId, 'Invalid trend settings action. Please try again.');
  }
};
