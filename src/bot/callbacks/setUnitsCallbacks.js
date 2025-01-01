const userService = require('../../api/user/service/user.service');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();

  try {
    if (data.startsWith('unit_')) {
      const lotSize = data.split('_')[1];
      if (lotSize === 'custom') {
        await bot.sendMessage(
          chatId,
          'Please enter your desired lot size (e.g., 0.01, 0.1, 1):',
          { parse_mode: 'Markdown' }
        );
        bot.once('message', async (msg) => {
          if (msg.chat.id.toString() === chatId) {
            const customInput = msg.text.trim();
            const customLotSize = parseFloat(customInput);
            if (!isNaN(customLotSize) && customLotSize > 0) {
              await userService.updateUserUnits(chatId, customLotSize.toString());
              await bot.sendMessage(
                chatId,
                `✅ Trade lot size updated to ${customLotSize} lot(s).`
              );
            } else {
              await bot.sendMessage(
                chatId,
                '❌ Invalid lot size. Please enter a positive number (e.g., 0.01, 0.1, 1).'
              );
            }
          }
        });
      } else {
        await userService.updateUserUnits(chatId, lotSize);
        await bot.sendMessage(chatId, `✅ Trade lot size updated to ${lotSize} lot(s).`);
      }
    } else {
      await bot.sendMessage(chatId, '❌ Invalid action. Please try again.');
    }
  } catch (error) {
    console.error(`Error handling lot size callback for chatId ${chatId}: ${error.message}`);
    await bot.sendMessage(chatId, '❌ An error occurred. Please try again later.');
  }
};


