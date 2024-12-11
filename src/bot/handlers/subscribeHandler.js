module.exports = async (bot, chatId, user) => {
  if (user && user.subscriptionStatus === 'active') {
    await bot.sendMessage(
      chatId,
      `You are already subscribed to the Solo Trend bot. Use the "Billing Info" menu to manage your subscription.`
    );
  } else {
    const subscribeKeyboard = {
      reply_markup: {
        inline_keyboard: [
            [{ text: 'Subscribe Monthly ($8/month)', callback_data: 'subscribe_monthly' }],
            [{ text: 'Subscribe Annually ($79/year)', callback_data: 'subscribe_annually' }]
        ]
      }
    };

    await bot.sendMessage(
      chatId,
      `Choose a plan to subscribe to the Solo Trend bot:`,
      subscribeKeyboard
    );
  }
};
