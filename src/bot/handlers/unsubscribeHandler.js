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

        const confirmMessage = await bot.sendMessage(
            chatId,
            "Are you sure you want to unsubscribe? Please reply with 'yes' to confirm or 'no' to cancel.",
            {
                reply_markup: {
                    keyboard: [['yes', 'no']],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            }
        );

        bot.once('message', async (confirmMsg) => {
            if (confirmMsg.text.toLowerCase() === 'yes') {
                await userService.updateUserSubscriptionStatus(telegramId, 'inactive');
                await bot.sendMessage(
                    chatId,
                    "Sorry to see you go. Best of luck in your trading journey!",
                    {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    }
                );
            } else {
                await bot.sendMessage(
                    chatId,
                    "Unsubscribe cancelled. We're glad you're staying with us!",
                    {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    }
                );
            }
        });
    } catch (error) {
        logger.error(`Error in /unsubscribe command: ${error.message}`);
        await bot.sendMessage(
            chatId,
            "An error occurred while processing your unsubscribe request. Please try again later."
        );
    }
};