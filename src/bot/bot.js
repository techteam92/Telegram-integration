const TelegramBot = require('node-telegram-bot-api');
const config = require('../common/config/config');
const logger = require('../common/utils/logger');
const userService = require('../api/user/service/user.service');

const bot = new TelegramBot(config.botToken, { polling: true });

const adminTelegramId = '659928723'; 
const paymentLink = 'https://buy.copperx.dev/payment/payment-link/0c4b9354-9ea3-4253-a824-e2cbe9c0a3e7';

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.first_name || 'Anonymous';
    try {
        if (telegramId === adminTelegramId) {
            bot.sendMessage(chatId, "Hello, you are the admin.");
            return;
        }

        let user = await userService.getUserByTelegramId(telegramId);
        if (!user) {
            user = await userService.createUser({ telegramId, username, subscriptionStatus: 'inactive' });
            bot.sendMessage(telegramId, `Please subscribe to interact in groups: ${paymentLink}`);
        } else if (user.subscriptionStatus !== 'active') {
            bot.sendMessage(telegramId, `You are not subscribed. Please use the following link to subscribe: ${paymentLink}`);
        } else {
            bot.sendMessage(chatId, 'Welcome back! You are already subscribed.');
        }
    } catch (error) {
        logger.error(`Error in /start command: ${error}`);
        bot.sendMessage(chatId, 'There was an error processing your request.');
    }
});

bot.on('chat_member', async (msg) => {
    const chatId = msg.chat.id;
    const newMember = msg.new_chat_member.user;
    const userId = newMember.id.toString();
    const username = newMember.first_name || 'Anonymous';
    if(msg.new_chat_member.is_member){
        logger.info(`${username} left the group`)
        return
    }
    try {
        let user = await userService.getUserByTelegramId(userId);
        if (!user) {
            user = await userService.createUser({ telegramId: userId, username, subscriptionStatus: 'inactive'});
            logger.info(`New user added: ${username} with default inactive status.`);
            bot.sendMessage(userId, `Welcome ${username}! Please subscribe to interact in this group: ${paymentLink}`);
            restrictUser(chatId, userId);
        } else if (user.subscriptionStatus !== 'active') {
            restrictUser(chatId, userId);
            bot.sendMessage(userId, `You need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
        } else {
            allowUser(chatId, userId);
        }
    } catch (error) {
        logger.error(`Error in chat_member handler: ${error}`);
    }
});

const restrictUser = (chatId, userId) => {
    bot.restrictChatMember(chatId, userId, {
        permissions: {
            can_send_messages: false,
            can_send_media_messages: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
        },
    }).catch(error => {
        logger.error(`Error restricting user ${userId}: ${error}`);
    });
};

const allowUser = (chatId, userId) => {
    bot.promoteChatMember(chatId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
    }).catch(error => {
        logger.error(`Error allowing user ${userId}: ${error}`);
    });
};

bot.on('polling_error', (error) => {
    logger.error(`Polling error: ${error}`);
});

module.exports = bot;

