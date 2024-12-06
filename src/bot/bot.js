const TelegramBot = require('node-telegram-bot-api');
const config = require('../common/config/config');
const callbackHandler = require('./callbacks/callbackHandler');
const startSignalHandler = require('./handlers/startSignalHandler');
const stopSignalHandler = require('./handlers/stopSignalHandler');
const trendSettingHandler = require('./handlers/trendSettingHandler');
const setUnitsHandler = require('./handlers/setUnitsHandler');
const userService = require('../api/user/service/user.service');

const bot = new TelegramBot(config.botToken, { polling: true });

const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: 'Start Signal' }, { text: 'Stop Signal' }],
      [{ text: 'Trend Settings' }, { text: 'Set Units' }],
      [{ text: 'Subscribe' }, { text: 'Billing Info' }],
      [{ text: 'Help' }, { text: 'Unsubscribe' }],
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

  await bot.sendMessage(chatId, 'Welcome to Solo Trend Bot! Select an option:', mainMenuKeyboard);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  switch (msg.text) {
    case 'Start Signal':
      return startSignalHandler(bot, chatId);

    case 'Stop Signal':
      return stopSignalHandler(bot, chatId);

    case 'Trend Settings':
      return trendSettingHandler(bot, chatId);

    case 'Set Units':
      return setUnitsHandler(bot, chatId);

    case 'Subscribe':
      return bot.sendMessage(chatId, 'Subscription flow coming soon!');

    case 'Billing Info':
      return bot.sendMessage(chatId, 'Billing info flow coming soon!');

    case 'Help':
      return bot.sendMessage(chatId, 'Visit our help center: https://example.com/help');

    case 'Unsubscribe':
      return bot.sendMessage(chatId, 'Sorry to see you go! Unsubscription flow coming soon.');

    default:
      return bot.sendMessage(chatId, 'Invalid option. Please choose from the menu:', mainMenuKeyboard);
  }
});

bot.on('callback_query', (callbackQuery) => {
  callbackHandler(bot, callbackQuery);
});

bot.on('polling_error', (error) => {
  console.error(`Polling error: ${error.message}`);
});

module.exports = bot;











// const TelegramBot = require('node-telegram-bot-api');
// const logger = require('../common/utils/logger');
// const startCommand = require('./handlers/startCommand');
// const setOandaKeyCommand = require('./handlers/setOandaKeyCommand');
// const config = require('../common/config/config');
// const tradingSignalsCommand = require('./handlers/tradingSignalsCommand');
// const oandaService = require('../api/oanda/services/oanda.service');
// const userService = require('../api/user/service/user.service');
// const paymentLink = 'https://buy.copperx.io/payment/payment-link/462bb3e8-fb93-4d3c-a3f2-288f20d47c14';
// const updateOandaAccountCommand = require('./handlers/updateOandaAccountCommand');
// const Signal = require('../api/signals/models/signal.model');
// const setUnitsCommand = require('./handlers/setUnitsHandler');
// const subscribeCommand = require('./handlers/subscribeHandler');
// const bot = new TelegramBot(config.botToken, { polling: true });

// bot.setMyCommands([
//   { command: '/subscribe', description: 'Subscribe to Solo Trend' },
//   { command: '/start_signal', description: 'Start receiving signals' },
//   { command: '/stop_signal', description: 'Stop receiving signals' },
//   { command: '/connect_account', description: 'Connect trading account' },
//   { command: '/trend_settings', description: 'Configure trend settings' },
//   { command: '/help', description: 'View help documentation' },
//   { command: '/billing_info', description: 'View billing information' },
//   { command: '/unsubscribe', description: 'Unsubscribe from Solo Trend' },
// ]);

// bot.onText(/\/start/, (msg) => startCommand(bot, msg));
// bot.onText(/\/set_oanda_key/, (msg) => setOandaKeyCommand(bot, msg));
// bot.onText(/\/update_account/, (msg) => updateOandaAccountCommand(bot, msg));
// bot.onText(/\/trading_signals/, (msg) => tradingSignalsCommand(bot, msg));
// bot.onText(/\/set_units/, (msg) => setUnitsCommand(bot, msg));
// bot.onText(/\/subscribe/, (msg) => subscribeCommand(bot, msg));

// bot.on('callback_query', async (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id;
//     const data = callbackQuery.data;
//     const telegramId = callbackQuery.from.id.toString();

//     try {
//         // Subscription related callbacks
//         if (data === 'subscribe_monthly' || data === 'subscribe_annual') {
//             const plan = data === 'subscribe_monthly' ? 'monthly' : 'annually';
//             const price = plan === 'monthly' ? '8$' : '79$';
//             // Here you would integrate with your payment system
//             await bot.sendMessage(chatId, `Please complete your ${plan} subscription payment of ${price}.`);
//         }

//         // Settings related callbacks
//         if (data.startsWith('settings_')) {
//             const setting = data.split('_')[1];
//             switch (setting) {
//                 case 'trade_type':
//                     const tradeTypeKeyboard = {
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'Demo', callback_data: 'trade_type_demo' }],
//                                 [{ text: 'Live', callback_data: 'trade_type_live' }]
//                             ]
//                         }
//                     };
//                     await bot.sendMessage(chatId, 'Select trade type:', tradeTypeKeyboard);
//                     break;
//                 case 'amount':
//                     const amountKeyboard = {
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: '$1', callback_data: 'amount_1' }],
//                                 [{ text: '$5', callback_data: 'amount_5' }],
//                                 [{ text: '$10', callback_data: 'amount_10' }],
//                                 [{ text: '$15', callback_data: 'amount_15' }]
//                             ]
//                         }
//                     };
//                     await bot.sendMessage(chatId, 'Select trade amount:', amountKeyboard);
//                     break;
//                 case 'auto_trade':
//                     const autoTradeKeyboard = {
//                         reply_markup: {
//                             inline_keyboard: [
//                                 [{ text: 'On', callback_data: 'auto_trade_on' }],
//                                 [{ text: 'Off', callback_data: 'auto_trade_off' }]
//                             ]
//                         }
//                     };
//                     await bot.sendMessage(chatId, 'Auto-trade setting:', autoTradeKeyboard);
//                     break;
//                 case 'disconnect':
//                     const user = await userService.getUserByTelegramId(telegramId);
//                     if (user && user.connectedAccounts) {
//                         const disconnectButtons = user.connectedAccounts.map(account => ([{
//                             text: `${account.name} ✅`,
//                             callback_data: `disconnect_${account.id}`
//                         }]));
//                         const keyboard = {
//                             reply_markup: {
//                                 inline_keyboard: disconnectButtons
//                             }
//                         };
//                         await bot.sendMessage(chatId, 'Select account to disconnect:', keyboard);
//                     } else {
//                         await bot.sendMessage(chatId, 'No connected accounts found.');
//                     }
//                     break;
//             }
//         }

//         // Handle settings selections
//         if (data.startsWith('trade_type_')) {
//             const type = data.split('_')[2];
//             await userService.updateUserSettings(telegramId, { tradeType: type });
//             await bot.sendMessage(chatId, `Trade type set to: ${type}`);
//         }

//         if (data.startsWith('amount_')) {
//             const amount = data.split('_')[1];
//             await userService.updateUserSettings(telegramId, { tradeAmount: parseInt(amount) });
//             await bot.sendMessage(chatId, `Trade amount set to: $${amount}`);
//         }

//         if (data.startsWith('auto_trade_')) {
//             const status = data.split('_')[2];
//             await userService.updateUserSettings(telegramId, { autoTrade: status === 'on' });
//             await bot.sendMessage(chatId, `Auto-trade turned ${status}`);
//         }

//         if (data.startsWith('disconnect_')) {
//             const accountId = data.split('_')[1];
//             await userService.disconnectAccount(telegramId, accountId);
//             await bot.sendMessage(chatId, 'Account disconnected successfully');
//         }

//         // Billing related callbacks
//         if (data.startsWith('billing_')) {
//             const action = data.split('_')[1];
//             if (action === 'upgrade') {
//                 await bot.sendMessage(chatId, 'To upgrade to annual plan, please complete the payment.');
//             } else if (action === 'downgrade') {
//                 await bot.sendMessage(chatId, 'To downgrade to monthly plan, please complete the payment.');
//             }
//         }

//     } catch (error) {
//         logger.error(`Error handling callback query: ${error.message}`);
//         await bot.sendMessage(chatId, 'An error occurred. Please try again.');
//     }
// });

// bot.on('polling_error', (error) => {
//   logger.error(`Polling error: ${error.message}`);
// });

// module.exports = bot;
