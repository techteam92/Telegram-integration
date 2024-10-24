const logger = require("../../common/utils/logger");

module.exports = async (bot, chatId, userId) => {
    try {
        await bot.restrictChatMember(chatId, userId, {
            permissions: {
                can_send_messages: false,
                can_send_media_messages: false,
                can_send_other_messages: false,
                can_add_web_page_previews: false,
            },
        });
    } catch (error) {
        logger.error(`Error restricting user ${userId}: ${error.message}`);
    }
};
