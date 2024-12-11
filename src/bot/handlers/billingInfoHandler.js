const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || 'Anonymous';

    try {
        const user = await userService.getUserByTelegramId(telegramId);
        
        if (!user || user.subscriptionStatus !== 'active') {
            await bot.sendMessage(
                chatId,
                "Hey, you are not subscribed to the solo trend. Please subscribe by clicking on \"Subscribe\""
            );
            return;
        }

        const planInfo = {
            monthly: { price: '8$', type: 'Monthly' },
            annually: { price: '79$', type: 'Annually' }
        };

        const currentPlan = planInfo[user.subscriptionPlan] || planInfo.monthly;
        const message = `Hello ${username} (@${username}),\nHere are the billing info for the plan you are subscribed to:\n\nPlan: ${currentPlan.type}\nAmount: ${currentPlan.price}\nSubscription vaild till: ${new Date(user.subscriptionExpiry).toLocaleDateString()}`;
        await bot.sendMessage(chatId, message);
    } catch (error) {
        logger.error(`Error in /billing_info command: ${error.message}`);
        await bot.sendMessage(
            chatId,
            "An error occurred while retrieving billing information. Please try again later."
        );
    }
};