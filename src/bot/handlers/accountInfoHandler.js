const accountInfoHandler = async (bot, chatId) => {
  try {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Account Metrics', callback_data: 'INFO/metrics' },
            { text: 'Account Positions', callback_data: 'INFO/positions' },
          ],
          [
            { text: 'Open Orders', callback_data: 'INFO/open_orders' },
            { text: 'Order History', callback_data: 'INFO/order_history' },
          ],
        ],
      },
    };

    await bot.sendMessage(
      chatId,
      'Select the information you would like to view:',
      keyboard
    );
  } catch (error) {
    console.error(`Error in accountInfoHandler: ${error.message}`);
    await bot.sendMessage(
      chatId,
      'An error occurred while fetching account information options. Please try again later.'
    );
  }
};

module.exports = accountInfoHandler;
