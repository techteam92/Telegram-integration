module.exports = async (bot, msg) => {
    const chatId = msg.chat.id;
    const inviteLink = "https://t.me/LOLOLLAW";
    await bot.sendMessage(chatId, `Join this group to receive trading signals: ${inviteLink}`);
};
