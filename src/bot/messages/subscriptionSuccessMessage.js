const config = require("../../common/config/config");

const sendSubscriptionSuccessVideo = async (bot, chatId, newExpiryDate) => {
  const videoFileId = config.subscriptionSuccessMessageVideoFileId;

  await bot.sendVideo(chatId, videoFileId, {
    caption: `✅ Subscription Confirmed! 🎉
Welcome to the SOLOTREND X Alerts community!

📅 Your subscription is valid until: <b>${newExpiryDate.toDateString()}</b>

📈 You'll receive instant access to signals. Notifications will be sent directly to this chat.
🧑‍💻 Support is available 24/7 for any questions.
💬 Manage your subscription anytime with /manage_subscription.

Stay tuned for your first alert! 🚀`,
    parse_mode: "HTML",
  });
};

module.exports = sendSubscriptionSuccessVideo;
