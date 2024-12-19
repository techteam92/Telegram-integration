const userService = require('../../api/user/service/user.service');

exports.toggleTimeframe = async (bot, chatId, timeframe) => {
  try {
    const user = await userService.getUserByTelegramId(chatId);
    const availableTimeframes = ['1m', '5m', '10m', '15m', '30m', '60m'];
    let updatedTimeframes = user.trendSettings.timeframes || ['1m'];
    if (updatedTimeframes.includes(timeframe)) {
      updatedTimeframes = updatedTimeframes.filter((tf) => tf !== timeframe);
    } else {
      updatedTimeframes.push(timeframe);
    }
    if (updatedTimeframes.length === 0) {
      updatedTimeframes = ['1m'];
      await bot.sendMessage(chatId, '⚠️ You must select at least one timeframe. Defaulting to *1m*.', { parse_mode: 'Markdown' });
    }
    updatedTimeframes = updatedTimeframes.filter((tf) => availableTimeframes.includes(tf));
    await userService.updateUserTimeframes(chatId, updatedTimeframes);
    const selectedTimeframes = updatedTimeframes.join(', ');
    const message = `Timeframes updated successfully! 🎉\n\n*Currently Selected:* ${selectedTimeframes}`;
    const keyboard = {
      reply_markup: {
        inline_keyboard: availableTimeframes.map((tf) => [
          {
            text: updatedTimeframes.includes(tf) ? `✅ ${tf}` : tf,
            callback_data: `timeframe_toggle_${tf}`,
          },
        ]),
      },
    };
    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      ...keyboard,
    });
  } catch (error) {
    console.log(`Error toggling timeframe: ${error.message}`);
    await bot.sendMessage(chatId, 'Failed to update timeframes. Please try again later.');
  }
};

  
