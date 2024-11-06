const userService = require('../../api/user/service/user.service');
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
            await bot.sendMessage(chatId, "Hello, you are not subscribed to the forex trading group.");
            logger.info(`User ${username} is not subscribed.`);
        } else {
            logger.info(`User ${username} is already subscribed.`);
        }
    } catch (error) {
        logger.error(`Error in /start command: ${error.message}`);
    }
};
