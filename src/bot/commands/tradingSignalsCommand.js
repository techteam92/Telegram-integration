const config = require("../../common/config/config");

module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const inviteLink = config.tgGroupLink;
    await bot.sendMessage(chatId, `Join this group to receive trading signals: ${inviteLink}`);
};
