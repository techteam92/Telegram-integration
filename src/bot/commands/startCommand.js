const userService = require('../../api/user/service/user.service');
const config = require('../../common/config/config');
const logger = require('../../common/utils/logger');

const adminTelegramId = '659928723';

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || 'Anonymous';
    
    try {
        if (telegramId === adminTelegramId) {
            await bot.sendMessage(chatId, "Hello, you are the admin.");
            return;
        }
        
        let user = await userService.getUserByTelegramId(telegramId);
        
        if (!user) {
            user = await userService.createUser({ telegramId, username, subscriptionStatus: 'inactive' });
            logger.info(`New user added: ${username} with default inactive status.`);
        } else if (user.subscriptionStatus !== 'active') {
            await bot.sendMessage(chatId, `Hello, you are not subscribe. Use subscribe command to get subscription purchase link and join ${config.tgGroupLink} to receive forex trading signals and execute trades.`);
        } else {
            await bot.sendMessage(chatId, `Hello, you are subscribed to receive forex trading signals and execute trades on ${config.tgGroupLink}.`);
        }
    } catch (error) {
        logger.error(`Error in /start command: ${error.message}`);
    }
};
