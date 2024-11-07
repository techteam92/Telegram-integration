const TelegramBot = require('node-telegram-bot-api');
const logger = require('../common/utils/logger');
const startCommand = require('./commands/startCommand');
const setOandaKeyCommand = require('./commands/setOandaKeyCommand');
const config = require('../common/config/config');
const tradingSignalsCommand = require('./commands/tradingSignalsCommand');
const oandaService = require('../api/oanda/services/oanda.service');
const userService = require('../api/user/service/user.service');
const paymentLink = 'https://buy.copperx.io/payment/payment-link/462bb3e8-fb93-4d3c-a3f2-288f20d47c14';
const updateOandaAccountCommand = require('./commands/updateOandaAccountCommand');
const Signal = require('../api/signals/models/signal.model');
const setUnitsCommand = require('./commands/setUnitsCommand');
const subscribeCommand = require('./commands/subscribeCommand');
const bot = new TelegramBot(config.botToken, { polling: true });

bot.setMyCommands([
  { command: '/start', description: 'Start the bot' },
  { command: '/set_oanda_key', description: 'Set your OANDA API key' },
  { command: '/trading_signals', description: 'Get trading signals' },
  { command: '/set_units', description: 'Set units for trade execution, by default unit is set to 100' },
  { command: '/subscribe', description: 'Subscribe to the bot' },
  { command: '/update_account', description: 'Update oanda account' },
]);

bot.on('chat_member', async (msg) => {
  console.log('Inside Chat member');
  const chatId = msg.chat.id;
  const member = msg.new_chat_member;
  if (!member) return;
  const userId = member.user.id.toString();
  const username = member.user.username || 'Anonymous';
  if (['left', 'kicked'].includes(member.status) || (member.status === 'restricted' && !member.is_member)) {
    logger.info(`${username} left or was kicked from the group.`);
    return;
  }

  try {
    let user = await userService.getUserByTelegramId(userId);
    if (!user) {
      user = await userService.createUser({ telegramId: userId, username, subscriptionStatus: 'inactive' });
      logger.info(`New user added: ${username} with default inactive status.`);
      restrictUser(chatId, userId);
      await safeSendGroupMessage(chatId, `Welcome ${username}, you need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
      return;
    } else if (user.subscriptionStatus !== 'active') {
      restrictUser(chatId, userId);
      await safeSendGroupMessage(chatId, `Welcome ${username}, you need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
      return;
    } else {
      allowUser(chatId, userId);
    }
  } catch (error) {
    logger.error(`Error in chat_member handler: ${error.message}`);
  }
});
bot.on("left_chat_member", async (msg) => {
    console.log("left_chat_member =====================")
console.log(msg)
console.log("=====================left_chat_member")
})

bot.on("chat_join_request", async (msg) => {
    console.log("chat_join_request =====================")
console.log(msg)
console.log("====================chat_join_request=")
})


const restrictUser = (chatId, userId) => {
  bot
    .restrictChatMember(chatId, userId, {
      permissions: {
        can_send_messages: false,
        can_send_media_messages: false,
        can_send_other_messages: false,
        can_add_web_page_previews: false,
      },
    })
    .catch((error) => {
      logger.error(`Error restricting user ${userId}: ${error.message}`);
    });
};

const allowUser = (chatId, userId) => {
  bot
    .promoteChatMember(chatId, userId, {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    })
    .catch((error) => {
      logger.error(`Error allowing user ${userId}: ${error.message}`);
    });
};

const safeSendGroupMessage = async (chatId, text) => {
  try {
    await bot.sendMessage(chatId, text);
  } catch (error) {
    logger.error(`Error sending message to group ${chatId}: ${error.message}`);
  }
};

bot.onText(/\/start/, (msg) => startCommand(bot, msg));
bot.onText(/\/set_oanda_key/, (msg) => setOandaKeyCommand(bot, msg));
bot.onText(/\/update_account/, (msg) => updateOandaAccountCommand(bot, msg));
bot.onText(/\/trading_signals/, (msg) => tradingSignalsCommand(bot, msg));
bot.onText(/\/set_units/, (msg) => setUnitsCommand(bot, msg));
bot.onText(/\/subscribe/, (msg) => subscribeCommand(bot, msg));

bot.on('callback_query', async (callbackQuery) => {
  const userChatId = callbackQuery.from.id;
  const data = callbackQuery.data;
  console.log('Callback data:', data);
  if (data.startsWith('execute_trade')) {
    const [_, symbol, tradeType, signalId] = data.split('-');
    const user = await userService.getUserByTelegramId(callbackQuery.from.id.toString());
    if (!user || user.subscriptionStatus !== 'active') {
      await bot.sendMessage(userChatId, `You need to subscribe to execute trades. Please subscribe here: ${paymentLink}`);
      return;
    }
    const signal = await Signal.findById(signalId);
    if (!signal) {
      await bot.sendMessage(userChatId, 'Signal not found or may have expired.');
      return;
    }

    const signalAgeMinutes = (Date.now() - signal.createdAt.getTime()) / 60000;

        if (signalAgeMinutes > 2) {
            await bot.sendMessage(userChatId, `The signal for ${symbol} is an old signal is not be reliable. Please wait for a new signal.`);
            return;
        }
  
        try {
            const userApiKeyInfo = await userService.getUserApiKey(callbackQuery.from.id.toString());
            if (!userApiKeyInfo) {
                await bot.sendMessage(userChatId, "Please set up your OANDA API key first using /set_oanda_key.");
                return;
            }
            const { oandaApiKey, oandaAccountType, oandaAccountId, units = '100' } = userApiKeyInfo;
  
            if (!oandaAccountId) {
                await bot.sendMessage(userChatId, "Your OANDA account ID is missing. Please update it by setting up your account again.");
                return;
            }
  
            await bot.sendMessage(userChatId, `Executing ${tradeType.toUpperCase()} trade for ${symbol}...`);
            console.log("symbol", symbol);
            const tradeUnits  = tradeType === 'sell' ? `-${units}` : units;
            const tradeData = {
                instrument: symbol,
                units: tradeUnits,
                type: 'MARKET',
                accountId: oandaAccountId  
            };
  
            const tradeResult = await oandaService.executeOandaTrade(oandaApiKey, oandaAccountType, oandaAccountId, tradeData);
            await bot.sendMessage(userChatId, `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} trade for ${symbol} executed successfully!`);
        } catch (error) {
            const errorMessage = error.response && error.response.status === 400
                ? "Invalid request. Please check your API key and inputs."
                : "An unexpected error occurred. Please try again later.";
  
            await bot.sendMessage(userChatId, `Failed to execute ${tradeType} trade for ${symbol}. Error: ${errorMessage}`);
            logger.error(`Error executing trade for ${symbol}: ${error.message}`);
            console.log(error.response?.data?.errorMessage);
        }
    }
  });
  
  

bot.on('polling_error', (error) => {
  logger.error(`Polling error: ${error.message}`);
});

module.exports = bot;
