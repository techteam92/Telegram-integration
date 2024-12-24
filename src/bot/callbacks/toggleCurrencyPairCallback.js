const userService = require('../../api/user/service/user.service');

exports.toggleCurrencyPair = async (bot, chatId, currencyPair) => {
  try {
    const user = await userService.getUserByTelegramId(chatId);
    const availableCurrencyPairs = ['USDJPY', 'EURUSD', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD'];
    let updatedCurrencyPairs = user.trendSettings.currencyPairs || ['USDJPY', 'EURUSD'];
    if (updatedCurrencyPairs.includes(currencyPair)) {
      updatedCurrencyPairs = updatedCurrencyPairs.filter((pair) => pair !== currencyPair);
    } else {
      updatedCurrencyPairs.push(currencyPair);
    }
    if (updatedCurrencyPairs.length === 0) {
      updatedCurrencyPairs = ['USDJPY', 'EURUSD'];
      await bot.sendMessage(chatId, '⚠️ You must select at least one timeframe. Defaulting to *EURUSD*, *USDJPY*.', { parse_mode: 'Markdown' });
    }
    updatedCurrencyPairs = updatedCurrencyPairs.filter((pair) => availableCurrencyPairs.includes(pair));

    await userService.updateUserCurrencyPairs(chatId, updatedCurrencyPairs);

    const selectedCurrencyPairs = updatedCurrencyPairs.join(', ');
    const message = `Currency pairs updated successfully! 🎉\n\n*Currently Selected:* ${selectedCurrencyPairs}`;
    const keyboard = {
      reply_markup: {
        inline_keyboard: availableCurrencyPairs.map((pair) => [
          {
            text: updatedCurrencyPairs.includes(pair) ? `✅ ${pair}` : pair,
            callback_data: `currencypair_toggle_${pair}`,
          },
        ]),
      },
    };

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  } catch (error) {
    console.log(`Error toggling currency pair: ${error.message}`);
    await bot.sendMessage(chatId, 'Failed to update currency pairs. Please try again later.');
  }
};
