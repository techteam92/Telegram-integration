const oandaService = require('../../api/oanda/services/oanda.service');
const logger = require('../../common/utils/logger');
module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    
    try {
        await bot.sendMessage(chatId, "Please enter your OANDA API key.");
        
        bot.once('message', async (response) => {
            const apiKey = response.text;
            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Test Account', callback_data: `set_account_test_${apiKey}` }],
                        [{ text: 'Live Account', callback_data: `set_account_live_${apiKey}` }]
                    ]
                }
            };

            await bot.sendMessage(chatId, "Choose the environment for your OANDA account:", keyboard);
        });
    } catch (error) {
        logger.error(`Error in /set_oanda_key: ${error.message}`);
        await bot.sendMessage(chatId, "An error occurred. Please try again.");
    }
};
