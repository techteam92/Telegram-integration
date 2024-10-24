const logger = require("../../common/utils/logger");

module.exports = async (bot, chatId, text) => {
    try {
        await bot.sendMessage(chatId, text);
    } catch (error) {
        logger.error(`Error sending message to group ${chatId}: ${error.message}`);
    }
};
