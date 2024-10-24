const logger = require('../../common/utils/logger');

module.exports = async (bot, chatId, userId) => {
    try {
        await bot.promoteChatMember(chatId, userId, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true,
        });
    } catch (error) {
        logger.error(`Error allowing user ${userId}: ${error.message}`);
    }
};
