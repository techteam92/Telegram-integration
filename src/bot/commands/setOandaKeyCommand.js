const oandaService = require('../../api/oanda/services/oanda.service');
const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Test Account', callback_data: 'set_account_test' }],
                    [{ text: 'Live Account', callback_data: 'set_account_live' }]
                ]
            }
        };

        await bot.sendMessage(chatId, "Choose the environment for your OANDA account:", keyboard);
        
        bot.once('callback_query', async (callbackQuery) => {
            const accountType = callbackQuery.data === 'set_account_test' ? 'test' : 'live';
            await bot.sendMessage(chatId, `You selected ${accountType} account. Now, please enter your OANDA API key.`);
                bot.once('message', async (response) => {
                const apiKey = response.text;

                try {
                    console.log(`Received API key: ${apiKey}`);
                    await oandaService.validateOandaApiKey(apiKey, accountType);
                    await userService.saveUserApiKey(telegramId, apiKey, accountType);
                    await bot.sendMessage(chatId, "Your API key has been validated and saved successfully.");
                } catch (error) {
                    logger.error(`API key validation failed: ${error.message}`);
                    await bot.sendMessage(chatId, "Invalid API key. Please ensure the key is correct and try again.");
                }
            });
        });
    } catch (error) {
        logger.error(`Error in OANDA setup: ${error.message}`);
        await bot.sendMessage(chatId, "An error occurred. Please try again.");
    }
};
