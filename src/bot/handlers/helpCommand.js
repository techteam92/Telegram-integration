const logger = require('../../common/utils/logger');
const config = require('../../common/config/config');

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;

    try {
        const helpMessage = `For detailed information about using Solo Trend Bot, please visit our knowledge base:\nwww.solotrend.com/help`;
        await bot.sendMessage(
            chatId,
            helpMessage,
            { parse_mode: 'Markdown', disable_web_page_preview: true }
        );
    } catch (error) {
        logger.error(`Error in /help command: ${error.message}`);
        await bot.sendMessage(
            chatId,
            "An error occurred while accessing help. Please try again later."
        );
    }
};