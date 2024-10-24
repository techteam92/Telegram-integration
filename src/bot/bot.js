const TelegramBot = require('node-telegram-bot-api');
const logger = require('../common/utils/logger');
const startCommand = require('./commands/startCommand');
const setOandaKeyCommand = require('./commands/setOandaKeyCommand');
const executeTradeCommand = require('./commands/executeTradeCommand');
const config = require('../common/config/config');
const tradingSignalsCommand = require('./commands/tradingSignalsCommand');
const oandaService = require('../api/oanda/services/oanda.service');
const bot = new TelegramBot(config.botToken, { polling: true });

bot.setMyCommands([
    { command: '/start', description: 'Start the bot' },
    { command: '/set_oanda_key', description: 'Set your OANDA API key' },
    { command: '/execute_trade', description: 'Execute a trade' },
    { command: '/trading_signals', description: 'Get trading signals' }  
  ]);

bot.onText(/\/start/, (msg) => startCommand(bot, msg));
bot.onText(/\/set_oanda_key/, (msg) => setOandaKeyCommand(bot, msg));
bot.onText(/\/execute_trade/, (msg) => executeTradeCommand(bot, msg));
bot.onText(/\/trading_signals/, (msg) => tradingSignalsCommand(bot, msg));

bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const telegramId = callbackQuery.from.id.toString();
    const data = callbackQuery.data;
  
    if (data.startsWith('execute_trade')) {
      const [_, symbol, side] = data.split('_');  
      await bot.sendMessage(chatId, `Executing ${side} trade for ${symbol}...`);
  
      try {
        const tradeData = {
          instrument: symbol,
          units: 100,  
          type: 'MARKET',
          side: side
        };
        const tradeResult = await oandaService.executeOandaTrade(telegramId, tradeData);
        await bot.sendMessage(chatId, `${side.charAt(0).toUpperCase() + side.slice(1)} trade for ${symbol} executed successfully!`);
      } catch (error) {
        await bot.sendMessage(chatId, `Failed to execute ${side} trade for ${symbol}. Error: ${error.message}`);
      }
    }
  });
  
module.exports = bot;






































// const TelegramBot = require('node-telegram-bot-api');
// const config = require('../common/config/config');
// const logger = require('../common/utils/logger');
// const userService = require('../api/user/service/user.service');
// const bot = new TelegramBot(config.botToken, { polling: true });
// const oandaService = require('../api/oanda/services/oanda.service');

// const adminTelegramId = '659928723'; 
// const paymentLink = 'https://buy.copperx.io/payment/payment-link/462bb3e8-fb93-4d3c-a3f2-288f20d47c14';

// const safeSendGroupMessage = async (chatId, text) => {
//     try {
//         await bot.sendMessage(chatId, text);
//     } catch (error) {
//         logger.error(`Error sending message to group ${chatId}: ${error.message}`);
//     }
// };

// bot.onText(/\/start/, async (msg) => {
//     const chatId = msg.chat.id;
//     const telegramId = msg.from.id.toString();
//     const username = msg.from.username || 'Anonymous';
//     try {
//         if (telegramId === adminTelegramId) {
//             await safeSendGroupMessage(chatId, "Hello, you are the admin.");
//             return;
//         }
//         let user = await userService.getUserByTelegramId(telegramId);
//         if (!user) {
//             user = await userService.createUser({ telegramId, username, subscriptionStatus: 'inactive' });
//             logger.info(`New user added: ${username} with default inactive status.`);
//         } else if (user.subscriptionStatus !== 'active') {
//             await safeSendGroupMessage(chatId, "Hello, you are not subscribed to the forex trading group.");
//             logger.info(`User ${username} is not subscribed.`);
//         } else {
//             logger.info(`User ${username} is already subscribed.`);
//         }
//     } catch (error) {
//         logger.error(`Error in /start command: ${error.message}`);
//     }
// });

// bot.onText(/\/set_oanda_key/, async (msg) => {
//     const chatId = msg.chat.id;
//     const telegramId = msg.from.id.toString();
//     const username = msg.from.username || 'Anonymous';

//     try {
//         await bot.sendMessage(chatId, "Please enter your OANDA API key.");
        
//         bot.once('message', async (response) => {
//             const apiKey = response.text;

//             const keyboard = {
//                 reply_markup: {
//                     inline_keyboard: [
//                         [{ text: 'Test Account', callback_data: `set_account_test_${apiKey}` }],
//                         [{ text: 'Live Account', callback_data: `set_account_live_${apiKey}` }]
//                     ]
//                 }
//             };

//             await bot.sendMessage(chatId, "Choose the environment for your OANDA account:", keyboard);
//         });

//     } catch (error) {
//         logger.error(`Error in /set_oanda_key: ${error.message}`);
//         await bot.sendMessage(chatId, "An error occurred. Please try again.");
//     }
// });

// bot.onText(/\/trading_signals/, async (msg) => {
//     const chatId = msg.chat.id;
//     const inviteLink = "https://t.me/joinchat/YourGroupInviteLink";
//     await bot.sendMessage(chatId, `Join this group to receive trading signals: ${inviteLink}`);
// });

// bot.on('callback_query', async (callbackQuery) => {
//     const message = callbackQuery.message;
//     const chatId = message.chat.id;
//     const telegramId = callbackQuery.from.id.toString();
//     const data = callbackQuery.data;

//     if (data.startsWith('set_account')) {
//         const [_, accountType, apiKey] = data.split('_');

//         try {
//             await oandaService.saveUserApiKey(telegramId, apiKey, accountType);
//             await bot.sendMessage(chatId, `Your OANDA API key and account type (${accountType}) have been set. You can now execute trades.`);
//         } catch (error) {
//             logger.error(`Error setting account type: ${error.message}`);
//             await bot.sendMessage(chatId, "An error occurred. Please try again.");
//         }
//     }
// });


// bot.on('chat_member', async (msg) => {
//     const chatId = msg.chat.id;
//     console.log(chatId)
//     const member = msg.new_chat_member;

//     if (!member) return;

//     const userId = member.user.id.toString();
//     const username = member.user.username || 'Anonymous';
//     if (['left', 'kicked'].includes(member.status) || (member.status === 'restricted' && !member.is_member)) {
//         logger.info(`${username} left or was kicked from the group.`);
//         return;
//     }

//     try {
//         let user = await userService.getUserByTelegramId(userId);
//         if (!user) {
//             user = await userService.createUser({ telegramId: userId, username, subscriptionStatus: 'inactive' });
//             logger.info(`New user added: ${username} with default inactive status.`);
//             restrictUser(chatId, userId);
//             await safeSendGroupMessage(chatId, `Welcome ${username}, you need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
//             return;
//         } else if (user.subscriptionStatus !== 'active') {
//             restrictUser(chatId, userId);
//             await safeSendGroupMessage(chatId, `Welcome ${username}, you need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
//         } else {
//             allowUser(chatId, userId);
//         }
//     } catch (error) {
//         logger.error(`Error in chat_member handler: ${error.message}`);
//     }
// });

// const restrictUser = (chatId, userId) => {
//     bot.restrictChatMember(chatId, userId, {
//         permissions: {
//             can_send_messages: false,
//             can_send_media_messages: false,
//             can_send_other_messages: false,
//             can_add_web_page_previews: false,
//         },
//     }).catch(error => {
//         logger.error(`Error restricting user ${userId}: ${error.message}`);
//     });
// };

// const allowUser = (chatId, userId) => {
//     bot.promoteChatMember(chatId, userId, {
//         can_send_messages: true,
//         can_send_media_messages: true,
//         can_send_other_messages: true,
//         can_add_web_page_previews: true,
//     }).catch(error => {
//         logger.error(`Error allowing user ${userId}: ${error.message}`);
//     });
// };

// bot.onText(/\/subscribe/, async (msg) => {
//     const chatId = msg.chat.id;
//     const username = msg.from.username || 'Anonymous';
//     await safeSendGroupMessage(chatId, `${username}, subscribe using this link: ${paymentLink}`);
// });

// bot.onText(/\/execute_trade/, async (msg) => {
//     const chatId = msg.chat.id;
//     const telegramId = msg.from.id.toString();
//     const username = msg.from.username || 'Anonymous';

//     try {
//         const userApiKeyInfo = await oandaService.getUserApiKey(telegramId);
        
//         if (!userApiKeyInfo) {
//             await bot.sendMessage(chatId, "Please provide your OANDA API key. You can create one by logging into your OANDA account here: https://www.oanda.com/");
//             return;
//         }
        
//         const keyboard = {
//             reply_markup: {
//                 inline_keyboard: [
//                     [{ text: 'Test Account', callback_data: 'test' }],
//                     [{ text: 'Live Account', callback_data: 'live' }]
//                 ]
//             }
//         };
        
//         await bot.sendMessage(chatId, "Please choose account type for executing the trade:", keyboard);
        
//     } catch (error) {
//         logger.error(`Error in /execute_trade: ${error.message}`);
//         await bot.sendMessage(chatId, "An error occurred. Please try again later.");
//     }
// });

// bot.on('callback_query', async (callbackQuery) => {
//     const message = callbackQuery.message;
//     const chatId = message.chat.id;
//     const telegramId = callbackQuery.from.id.toString();
//     const accountType = callbackQuery.data;  

//     try {
//         const userApiKeyInfo = await oandaService.getUserApiKey(telegramId);
//         if (!userApiKeyInfo) {
//             await bot.sendMessage(chatId, "Please provide your OANDA API key.");
//             return;
//         }

//         await oandaService.saveUserApiKey(telegramId, userApiKeyInfo.apiKey, accountType);

//         await bot.sendMessage(chatId, `Your account type is set to ${accountType}. You can now execute trades.`);
        

//     } catch (error) {
//         logger.error(`Error handling callback query: ${error.message}`);
//         await bot.sendMessage(chatId, "An error occurred while processing your account type. Please try again.");
//     }
// });


// bot.on('polling_error', (error) => {
//     logger.error(`Polling error: ${error.message}`);
// });

// module.exports = bot;
