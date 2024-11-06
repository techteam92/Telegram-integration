const TelegramBot = require('node-telegram-bot-api');
const logger = require('../common/utils/logger');
const startCommand = require('./commands/startCommand');
const setOandaKeyCommand = require('./commands/setOandaKeyCommand');
const executeTradeCommand = require('./commands/executeTradeCommand');
const config = require('../common/config/config');
const tradingSignalsCommand = require('./commands/tradingSignalsCommand');
const oandaService = require('../api/oanda/services/oanda.service');
const userService = require('../api/user/service/user.service');
const chatMember = require('./events/chatMember');
const updateOandaAccountCommand = require('./commands/updateOandaAccountCommand');
const Signal = require('../api/signals/models/signal.model');
const setUnitsCommand = require('./commands/setUnitsCommand');
const bot = new TelegramBot(config.botToken, { polling: true });

bot.setMyCommands([
    { command: '/start', description: 'Start the bot' },
    { command: '/set_oanda_key', description: 'Set your OANDA API key' },
    // { command: '/execute_trade', description: 'Execute a trade' },
    { command: '/trading_signals', description: 'Get trading signals' },
    { command: '/set_units', description: 'Set units for trade execution, by default unit is set to 100' },
    { command: '/update_account', description: 'Update oanda account' }    
  ]);

bot.on('chat_member', (msg) => chatMember(bot, msg));

bot.onText(/\/start/, (msg) => startCommand(bot, msg));
bot.onText(/\/set_oanda_key/, (msg) => setOandaKeyCommand(bot, msg)); 
bot.onText(/\/update_account/, (msg) => updateOandaAccountCommand(bot, msg));
// bot.onText(/\/execute_trade/, (msg) => executeTradeCommand(bot, msg));
bot.onText(/\/trading_signals/, (msg) => tradingSignalsCommand(bot, msg));
bot.onText(/\/set_units/, (msg) => setUnitsCommand(bot, msg));


bot.on('callback_query', async (callbackQuery) => {
    const userChatId = callbackQuery.from.id;
    const data = callbackQuery.data;
    console.log('Callback data:', data);
    if (data.startsWith('execute_trade')) {
        const [_, symbol, tradeType, signalId] = data.split('-');

        const signal = await Signal.findById(signalId);
        if (!signal) {
        await bot.sendMessage(userChatId, "Signal not found or may have expired.");
        return;
        }

        console.log("Extracted Symbol:", symbol); 
        console.log("Trade Type:", tradeType);
        const signalAgeMinutes = (Date.now() - signal.createdAt.getTime()) / 60000;
        console.log("signal age: ", signalAgeMinutes)
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