const oandaService = require('../../api/oanda/services/oanda.service');
const userService = require('../../api/user/service/user.service');
const moment = require('moment');
const logger = require('../../common/utils/logger');
const fetchSignalData = require('../../api/signals/service/signal.service');

module.exports = async (bot, msg) => {
    const userChatId = msg.from.id;
    const telegramId = msg.from.id.toString();

    try {
        const userApiKeyInfo = await userService.getUserApiKey(telegramId);

        if (!userApiKeyInfo) {
            await bot.sendMessage(userChatId, "Please set up your OANDA API key first using /set_oanda_key.");
            return;
        }
        const latestSignal = await fetchSignalData();
        if (!latestSignal) {
            await bot.sendMessage(userChatId, "No active signals available. Please try again later.");
            return;
        }

        const signalTimestamp = moment(latestSignal.timestamp);
        const currentTime = moment();
        
        if (currentTime.diff(signalTimestamp, 'minutes') > 2) {
            await bot.sendMessage(userChatId, "This signal is outdated. Please wait for a new signal to execute a trade.");
            return;
        }

        const tradeDirection = latestSignal.buy ? 'buy' : 'sell';
        const tradeData = {
            instrument: latestSignal.symbol,
            units: 100,
            type: 'MARKET',
            side: tradeDirection
        };

        await bot.sendMessage(userChatId, `Executing ${tradeDirection} trade for ${latestSignal.symbol}...`);
        const tradeResult = await oandaService.executeOandaTrade(telegramId, tradeData);
        await bot.sendMessage(userChatId, `Trade executed successfully for ${latestSignal.symbol} in the ${tradeDirection} direction.`);
        await bot.sendMessage(userChatId, "You can view more details on the OANDA platform here: https://www.oanda.com/");

    } catch (error) {
        logger.error(`Trade execution failed: ${error.message}`);
        const errorMessage = error.response?.status === 400 ? "Invalid trade request." : "An unexpected error occurred.";
        await bot.sendMessage(userChatId, `Failed to execute trade. ${errorMessage}`);
    }
};
