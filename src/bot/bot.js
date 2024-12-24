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

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Anonymous';  
  const user = await userService.getUserByTelegramId(chatId.toString());
  if (!user) {
    await userService.createUser({
      telegramId: chatId.toString(),
      username,
      subscriptionStatus: 'inactive',
    });
  }
  await bot.sendMessage(chatId, 'Welcome to Solo Trend Bot! Use the keyboard buttons below to interact with the bot.', mainMenuKeyboard);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username || 'Anonymous';

  if (msg.text.startsWith('/')) return;

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
