const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();

    try {
        const user = await userService.getUserByTelegramId(telegramId);
        
        if (!user || user.subscriptionStatus !== 'active') {
            await bot.sendMessage(
                chatId,
                "You don't have an active subscription to cancel."
            );
            return;
        }

        // Update user's subscription status
        await userService.updateUser(user._id, { 
            subscriptionStatus: 'inactive',
            signalStatus: 'inactive'
        });
        
        await bot.sendMessage(
            chatId,
            "Sorry to see you go. Enjoy trading!\n\nThere will be no refund. No renewal will be done."
        );
    } catch (error) {
        logger.error(`Error in /unsubscribe command: ${error.message}`);
        await bot.sendMessage(
            chatId,
            "An error occurred while processing your unsubscribe request. Please try again later."
        );
    }
};
