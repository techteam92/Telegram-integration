const config = require('../../common/config/config');

const sendSignupVideo = async (bot, chatId, replyMarkup) => {
  try {
    const videoFileId = config.startMessageVideoFileId;
    await bot.sendVideo(chatId, videoFileId, {
      caption: `💡Welcome to SOLOTREND X Alerts!💡
Your ultimate destination for precision trading signals with 3 Take Profit levels, Stop Loss, and real-time alerts. 🚀

🎯What you'll get:
• Accurate buy/sell signals.
• Instant alerts for profitable opportunities.
• 3 Take Profit Levels and Stop Loss.

👉Ready to transform your trading game? Let's get started!
Tap the button below to continue:`,
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    });
  } catch (error) {
    console.log('error in video', error.response.body);
  }
};
module.exports = sendSignupVideo;
