module.exports = async (bot, chatId, user) => {
    const availableCurrencyPairs = ['USDJPY', 'EURUSD', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDCAD', 'NZDUSD'];
    const selectedCurrencyPairs = user.trendSettings.currencyPairs || ['USDJPY', 'EURUSD'];
  
    const currencyPairKeyboard = {
      reply_markup: {
        inline_keyboard: availableCurrencyPairs.map((currency) => [
          {
            text: selectedCurrencyPairs.includes(currency) ? `✅ ${currency}` : currency,
            callback_data: `currencypair_toggle_${currency}`,
          },
        ]),
      },
    };
  
    const message = `Select or unselect the currency pairs for receiving signals:\n\n*Currently Selected:* ${selectedCurrencyPairs.join(', ')}\n\n✅ - Selected\nNo tickmark - Not Selected`;
  
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      ...currencyPairKeyboard,
    });
  };
  