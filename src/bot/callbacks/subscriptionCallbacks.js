module.exports.handleSubscriptionCallbacks = async (bot, callbackQuery) => {
  const { data, message } = callbackQuery;
  const chatId = message.chat.id;

  try {
    switch (data) {
      case 'subscribe_monthly':
        await bot.sendMessage(
          chatId,
          `Click the link below to subscribe to the monthly plan:\n\nhttps://buy.copperx.io/payment/payment-link/73108091-377a-4ed3-b867-c41831174c1d`,
          { parse_mode: 'Markdown' }
        );
        break;

      case 'subscribe_annually':
        await bot.sendMessage(
          chatId,
          `Click the link below to subscribe to the annual plan:\n\nhttps://buy.copperx.io/payment/payment-link/3c29b34c-e0ad-4b4e-a187-cf096902ca29`,
          { parse_mode: 'Markdown' }
        );        break;

      default:
        await bot.sendMessage(chatId, 'Invalid subscription action. Please try again.');
        break;
    }
  } catch (error) {
    console.error(`Error handling subscription callback: ${error.message}`);
    await bot.sendMessage(chatId, 'An error occurred while processing your subscription. Please try again.');
  }
};
