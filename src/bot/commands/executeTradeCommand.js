module.exports = async (bot, msg) => {
    const userChatId = msg.from.id;
    const telegramId = msg.from.id.toString();

    try {
        const userApiKeyInfo = await userService.getUserApiKey(telegramId);

        if (!userApiKeyInfo) {
            await bot.sendMessage(userChatId, "To execute trades, please set up your OANDA API key with /set_oanda_key command.");
            return;
        }

        const groupInviteLink = "https://t.me/LOLOLLAW";
        await bot.sendMessage(
            userChatId,
            `To execute trades, join our trading signals group here: ${groupInviteLink}\n\nYou'll receive signals and can execute trades within 2 minutes of each signal for best results.`
        );
    } catch (error) {
        logger.error(`Error in /execute_trade command: ${error.message}`);
        await bot.sendMessage(userChatId, "An error occurred. Please try again later.");
    }
};