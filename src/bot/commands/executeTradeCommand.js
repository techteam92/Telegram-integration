const oandaService = require('../../api/oanda/services/oanda.service');
const userService = require('../../api/user/service/user.service');
const moment = require('moment');
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

        const { apiKey, accountType, oandaAccountId } = userApiKeyInfo;
        if (!oandaAccountId) {
            await bot.sendMessage(userChatId, "Your OANDA account ID is missing. Please update it by setting up your account again.");
            return;
        }

        const latestSignal = await fetchSignalData();
        if (!latestSignal) {
            await bot.sendMessage(userChatId, "No active signals available. Please try again later.");
            return;
        }

        const signalTimestamp = moment(latestSignal.timestamp, moment.ISO_8601, true);
        if (!signalTimestamp.isValid()) {
            await bot.sendMessage(userChatId, "Received an invalid timestamp for the signal. Please try again later.");
            return;
        }

        const currentTime = moment();
        if (currentTime.diff(signalTimestamp, 'minutes') > 2) {
            await bot.sendMessage(userChatId, "This signal is outdated. Please wait for a new signal to execute a trade.");
            return;
        }

        const tradeDirection = latestSignal.buy ? 'buy' : 'sell';
        const tradeData = {
            instrument: latestSignal.symbol,
            units: '100',
            type: 'MARKET',
            positionFill: 'DEFAULT',
            side: tradeDirection
        };

        await bot.sendMessage(userChatId, `Executing ${tradeDirection} trade for ${latestSignal.symbol}...`);
        const tradeResult = await oandaService.executeOandaTrade(apiKey, accountType, oandaAccountId, tradeData);
        await bot.sendMessage(userChatId, `Trade executed successfully for ${latestSignal.symbol} in the ${tradeDirection} direction.`);
        await bot.sendMessage(userChatId, "You can view more details on the OANDA platform here: https://www.oanda.com/");

    } catch (error) {
        const errorMessage = error.response?.status === 400 
            ? "Invalid trade request. Please check your account settings or API key." 
            : "An unexpected error occurred.";
        await bot.sendMessage(userChatId, `Failed to execute trade. ${errorMessage}`);
    }
};