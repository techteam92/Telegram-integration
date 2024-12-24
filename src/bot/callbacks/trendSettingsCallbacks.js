const userService = require('../../api/user/service/user.service');
const startSignalHandler = require('../handlers/startSignalHandler');
const stopSignalHandler = require('../handlers/stopSignalHandler');
const setUnitHandler = require('../handlers/setUnitsHandler');
const setTimeframeHandler = require('../handlers/setTimeframeHandler');
const setCurrencyPairHandler = require('../handlers/setCurrencyPairsHandler');  // Importing the new handler

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  switch (data) {
    case 'trend_startSignal':
      const userForStartSignal = await userService.getUserByTelegramId(chatId); // Fetch user details
      return startSignalHandler(bot, chatId, userForStartSignal);

    case 'trend_stopSignal':
      return stopSignalHandler(bot, chatId);

    case 'trend_setUnits':
      return setUnitHandler(bot, chatId);

    case 'trend_setTimeframes':
      const userForTimeframe = await userService.getUserByTelegramId(chatId); // Fetch user details
      return setTimeframeHandler(bot, chatId, userForTimeframe);

    case 'trend_setCurrencyPairs':  // New case for currency pair handling
      const userForCurrencyPairs = await userService.getUserByTelegramId(chatId); // Fetch user details
      return setCurrencyPairHandler(bot, chatId, userForCurrencyPairs);  // Calling the new handler

    default:
      return bot.sendMessage(chatId, 'Invalid trend settings action. Please try again.');
  }
};
