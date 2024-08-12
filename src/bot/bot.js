const TelegramBot = require('node-telegram-bot-api');
const config = require('../common/config/config');
const logger = require('../common/utils/logger');
const userService = require('../api/user/service/user.service');

const bot = new TelegramBot(config.botToken, { polling: true });

const adminTelegramId = '659928723'; 
const paymentLink = 'https://buy.copperx.io/payment/payment-link/462bb3e8-fb93-4d3c-a3f2-288f20d47c14';

const safeSendGroupMessage = async (chatId, text) => {
    try {
        await bot.sendMessage(chatId, text);
    } catch (error) {
        logger.error(`Error sending message to group ${chatId}: ${error.message}`);
    }
};

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id.toString();
    const username = msg.from.username || 'Anonymous';
    try {
        if (telegramId === adminTelegramId) {
            await safeSendGroupMessage(chatId, "Hello, you are the admin.");
            return;
        }
        let user = await userService.getUserByTelegramId(telegramId);
        if (!user) {
            user = await userService.createUser({ telegramId, username, subscriptionStatus: 'inactive' });
            logger.info(`New user added: ${username} with default inactive status.`);
        } else if (user.subscriptionStatus !== 'active') {
            logger.info(`User ${username} is not subscribed.`);
        } else {
            logger.info(`User ${username} is already subscribed.`);
        }
    } catch (error) {
        logger.error(`Error in /start command: ${error.message}`);
    }
});

bot.on('chat_member', async (msg) => {
    const chatId = msg.chat.id;
    console.log(chatId)
    const member = msg.new_chat_member;

    if (!member) return;

    const userId = member.user.id.toString();
    const username = member.user.username || 'Anonymous';
    if (['left', 'kicked'].includes(member.status) || (member.status === 'restricted' && !member.is_member)) {
        logger.info(`${username} left or was kicked from the group.`);
        return;
    }

    try {
        let user = await userService.getUserByTelegramId(userId);
        if (!user) {
            user = await userService.createUser({ telegramId: userId, username, subscriptionStatus: 'inactive' });
            logger.info(`New user added: ${username} with default inactive status.`);
            restrictUser(chatId, userId);
        } else if (user.subscriptionStatus !== 'active') {
            restrictUser(chatId, userId);
            await safeSendGroupMessage(chatId, `Welcome ${username}, you need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
        } else {
            allowUser(chatId, userId);
        }
    } catch (error) {
        logger.error(`Error in chat_member handler: ${error.message}`);
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
        logger.error(`Error restricting user ${userId}: ${error.message}`);
    });
};

const allowUser = (chatId, userId) => {
    bot.promoteChatMember(chatId, userId, {
        can_send_messages: true,
        can_send_media_messages: true,
        can_send_other_messages: true,
        can_add_web_page_previews: true,
    }).catch(error => {
        logger.error(`Error allowing user ${userId}: ${error.message}`);
    });
};

bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || 'Anonymous';
    await safeSendGroupMessage(chatId, `${username}, subscribe using this link: ${paymentLink}`);
});

bot.on('polling_error', (error) => {
    logger.error(`Polling error: ${error.message}`);
});

module.exports = bot;
