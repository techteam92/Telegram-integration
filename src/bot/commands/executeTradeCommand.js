const oandaService = require('../../api/oanda/services/oanda.service');
const logger = require('../../common/utils/logger');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    
    try {
        const userApiKeyInfo = await oandaService.getUserApiKey(telegramId);
        
        if (!userApiKeyInfo) {
            await bot.sendMessage(chatId, "Please provide your OANDA API key. You can create one by logging into your OANDA account here: https://www.oanda.com/");
            return;
        }
        
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Test Account', callback_data: 'test' }],
                    [{ text: 'Live Account', callback_data: 'live' }]
                ]
            }
        };
        
        await bot.sendMessage(chatId, "Please choose account type for executing the trade:", keyboard);
        
    } catch (error) {
        logger.error(`Error in /execute_trade: ${error.message}`);
        await bot.sendMessage(chatId, "An error occurred. Please try again later.");
    }
};
