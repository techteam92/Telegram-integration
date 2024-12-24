module.exports = async (bot, chatId, user) => {
  const availableTimeframes = ['1m', '5m', '10m', '15m', '30m', '1hr'];
  const selectedTimeframes = user.trendSettings.timeframes || ['1m']; 

  const timeframeKeyboard = {
    reply_markup: {
      inline_keyboard: availableTimeframes.map((timeframe) => [
        {
          text: selectedTimeframes.includes(timeframe) ? `✅ ${timeframe}` : timeframe,
          callback_data: `timeframe_toggle_${timeframe}`,
        },
      ]),
    },
  };

  const message = `Select or unselect the timeframes for receiving signals:\n\n*Currently Selected:* ${selectedTimeframes.join(', ')}\n\n✅ - Selected\nNo tickmark - Not Selected`;

  await bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown',
    ...timeframeKeyboard,
  });
};
