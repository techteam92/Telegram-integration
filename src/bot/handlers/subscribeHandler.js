const userService = require('../../api/user/service/user.service');
const paymentLink = 'https://buy.copperx.io/payment/payment-link/462bb3e8-fb93-4d3c-a3f2-288f20d47c14';

module.exports = async (bot, chatId) => {
  const user = await userService.getUserByTelegramId(chatId.toString());

  if (user && user.subscriptionStatus === 'active') {
    await bot.sendMessage(
      chatId,
      `You are already subscribed to the Solo Trend bot. Use the "Billing Info" menu to manage your subscription.`
    );
  } else {
    const subscribeKeyboard = {
      reply_markup: {
        keyboard: [
          [{ text: 'Subscribe Monthly ($8/month)' }],
          [{ text: 'Subscribe Annually ($79/year)' }],
          [{ text: 'Back to Menu' }],
        ],
        resize_keyboard: true,
        one_time_keyboard: false,
      },
    };

    await bot.sendMessage(
      chatId,
      `Choose a plan to subscribe to the Solo Trend bot:`,
      subscribeKeyboard
    );
  }
};
