const logger = require('../../common/utils/logger');
const restrictUser = require('../utils/restrictUser');
const allowUser = require('../utils/allowUser');
const safeSendGroupMessage = require('../utils/safeSendGroupMessage');
const userService = require('../../api/user/service/user.service');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
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
            await restrictUser(bot, chatId, userId);
            await safeSendGroupMessage(bot, chatId, `Welcome ${username}, please subscribe to participate fully in this group.`);
        } else if (user.subscriptionStatus !== 'active') {
            await restrictUser(bot, chatId, userId);
            await safeSendGroupMessage(bot, chatId, `Welcome back, ${username}. Please subscribe to access this group.`);
        } else {
            await allowUser(bot, chatId, userId);
        }
    } catch (error) {
        logger.error(`Error in managing group member: ${error.message}`);
    }
};
