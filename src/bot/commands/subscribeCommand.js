const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');
const paymentLink = 'https://buy.copperx.io/payment/payment-link/462bb3e8-fb93-4d3c-a3f2-288f20d47c14';

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || 'Anonymous';

    try {
        const user = await userService.getUserByTelegramId(telegramId);
        if (user && user.subscriptionStatus === 'active') {
            await bot.sendMessage(chatId, `${username}, you are already subscribed to the forex trading group.`);
        } else {
            await bot.sendMessage(chatId, `${username}, subscribe using this link: ${paymentLink}`);
        }
    } catch (error) {
        logger.error(`Error in /subscribe command: ${error.message}`);
        await bot.sendMessage(chatId, "An error occurred while checking your subscription status. Please try again later.");
    }
};
