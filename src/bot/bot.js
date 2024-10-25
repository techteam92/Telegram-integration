const TelegramBot = require('node-telegram-bot-api');
const logger = require('../common/utils/logger');
const startCommand = require('./commands/startCommand');
const setOandaKeyCommand = require('./commands/setOandaKeyCommand');
const executeTradeCommand = require('./commands/executeTradeCommand');
const config = require('../common/config/config');
const tradingSignalsCommand = require('./commands/tradingSignalsCommand');
const oandaService = require('../api/oanda/services/oanda.service');
const chatMember = require('./events/chatMember');
const updateOandaAccountCommand = require('./commands/updateOandaAccountCommand');
const bot = new TelegramBot(config.botToken, { polling: true });

bot.setMyCommands([
    { command: '/start', description: 'Start the bot' },
    { command: '/set_oanda_key', description: 'Set your OANDA API key' },
    { command: '/execute_trade', description: 'Execute a trade' },
    { command: '/trading_signals', description: 'Get trading signals' }  
  ]);

bot.on('chat_member', (msg) => chatMember(bot, msg));

bot.onText(/\/start/, (msg) => startCommand(bot, msg));
bot.onText(/\/set_oanda_key/, (msg) => setOandaKeyCommand(bot, msg));
bot.onText(/\/update_account/, (msg) => updateOandaAccountCommand(bot, msg));
bot.onText(/\/execute_trade/, (msg) => executeTradeCommand(bot, msg));
bot.onText(/\/trading_signals/, (msg) => tradingSignalsCommand(bot, msg));

bot.on('callback_query', async (callbackQuery) => {
  const userChatId = callbackQuery.from.id;  
  const data = callbackQuery.data;

  if (data.startsWith('execute_trade')) {
      const [_, symbol, tradeType, timestamp] = data.split('_');

      const signalAgeMinutes = moment().diff(moment(timestamp), 'minutes');
      if (signalAgeMinutes > 2) {
          await bot.sendMessage(userChatId, `The signal for ${symbol} is older than 2 minutes and may not be reliable. Please wait for a new signal.`);
          return;
      }

      try {
          await bot.sendMessage(userChatId, `Executing ${tradeType.toUpperCase()} trade for ${symbol}...`);
          const tradeData = {
              instrument: symbol,
              units: 100,
              type: 'MARKET',
              side: tradeType,
          };

          const tradeResult = await oandaService.executeOandaTrade(callbackQuery.from.id.toString(), tradeData);
          await bot.sendMessage(userChatId, `${tradeType.charAt(0).toUpperCase() + tradeType.slice(1)} trade for ${symbol} executed successfully!`);
      } catch (error) {
          const errorMessage = error.response && error.response.status === 400
              ? "Invalid request. Please check your API key and inputs."
              : "An unexpected error occurred. Please try again later.";

          await bot.sendMessage(userChatId, `Failed to execute ${tradeType} trade for ${symbol}. Error: ${errorMessage}`);
          logger.error(`Error executing trade for ${symbol}: ${error.message}`);
      }
  }
});

bot.on('polling_error', (error) => {
  logger.error(`Polling error: ${error.message}`);
});

module.exports = bot;