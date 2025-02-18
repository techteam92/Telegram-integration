const TelegramBot = require('node-telegram-bot-api');
const config = require('../common/config/config');
const callbackHandler = require('./callbacks/callbackHandler');
const trendSettingHandler = require('./handlers/trendSettingHandler');
const userService = require('../api/user/service/user.service');
const connectAccountHandler = require('./handlers/connectAccountHandler');
const subscribeHandler = require('./handlers/subscribeHandler');
const unsubscribeHandler = require('./handlers/unsubscribeHandler');
const billingInfoHandler = require('./handlers/billingInfoHandler');
const platformAccountHandler = require('./handlers/platformAccountHandler');
const accountInfoHandler = require('./handlers/accountInfoHandler');
const sendSignupVideo = require('./messages/startMessage');
const bot = new TelegramBot(config.botToken, { polling: true });

const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Trend Settings' }, { text: 'Connect Account' }],
      [{ text: 'Subscribe' }, { text: 'Billing Info' }],
      [{ text: 'Help' }, { text: 'Unsubscribe' }],
      [{ text: 'Select Account'}, { text: 'Account Info' }],
    ],
    resize_keyboard: true,
  },
};

const startMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: ' ⬇️ [Sign Up Now] ', callback_data: 'signup_now' }],
    ],
  },
};

bot.setMyCommands([
  { command: '/start', description: 'Getting started with solo trend bot' }
]);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  console.log(`Received message from user: ${msg.chat.id}`);
  const username = msg.from.username || 'Anonymous';  
  const user = await userService.getUserByTelegramId(chatId.toString());
  if (!user) {
    await userService.createUser({
      telegramId: chatId.toString(),
      username,
      subscriptionStatus: 'inactive',
    });
  }
  await sendSignupVideo(bot, chatId, startMenuKeyboard.reply_markup);
  await bot.sendMessage(chatId, 'On right side of your Message tab you can access the trend bot menu', mainMenuKeyboard);

});

bot.onText(/\/grant_sub/, async (msg, match) => {
  const chatId = msg.chat.id;
  console.log(`Received grant_sub command from user: ${chatId}`);
  try {
    const user = await userService.getUserByTelegramId(chatId);    
    if (!user) {
      return bot.sendMessage(`❌ User with Telegram ID ${chatId} not found.`);
    }
    let newExpiryDate = new Date();
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    await userService.updateUserSubscriptionStatus(chatId, 'active', newExpiryDate, 'Annually');
    await bot.sendMessage(chatId, `✅ Subscription updated for @${user.username} (${chatId}) until ${newExpiryDate.toDateString()}.`);
    await bot.sendMessage(user.telegramId, `🎉 Your subscription has been activated for 1 year! Enjoy SOLOTREND X Alerts. 🚀`);

  } catch (error) {
    console.error(`Error updating subscription: ${error}`);
    await bot.sendMessage(chatId, "❌ Failed to update subscription. Please try again later.");
  }
});


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Anonymous';

  if (!msg.text || msg.text.startsWith('/')) return;

  let user = await userService.getUserByTelegramId(chatId.toString());
  if (!user) {
    user = await userService.createUser({
      telegramId: chatId.toString(),
      username,
      subscriptionStatus: 'inactive',
    });
  }
  const subscriptionRequiredActions = ['Start Signal', 'Stop Signal', 'Trend Settings', 'Set Units'];
  if (subscriptionRequiredActions.includes(msg.text) && user.subscriptionStatus !== 'active') {
    return bot.sendMessage(chatId, 'Your subscription is inactive. Please subscribe to use this feature.');
  }
  switch (msg.text) {
    case 'Trend Settings':
      return trendSettingHandler(bot, chatId);

    case 'Connect Account':
      return connectAccountHandler.initiateConnectAccount(bot, chatId);

    case 'Select Account': 
      return platformAccountHandler(bot, chatId);

    case 'Account Info':
      return accountInfoHandler(bot, chatId);

    case 'Subscribe':
      return subscribeHandler(bot, chatId, user);

    case 'Billing Info':
      return billingInfoHandler(bot, msg);

    case 'Help':
      return bot.sendMessage(chatId, 'Visit our help center: https://example.com/help');

    case 'Unsubscribe':
      return unsubscribeHandler(bot, msg);

    default:
      return;
  }
});

bot.on('callback_query', (callbackQuery) => {
  callbackHandler(bot, callbackQuery);
});

bot.on('polling_error', (error) => {
  return;
});

module.exports = bot;
