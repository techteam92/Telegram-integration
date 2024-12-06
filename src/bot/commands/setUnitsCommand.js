const userService = require('../../api/user/service/user.service');

module.exports = async (bot, msg) => {
    const userChatId = msg.from.id;
    const telegramId = msg.from.id.toString();

    await bot.sendMessage(userChatId, 'Please enter the units you want to set for trade execution:');

    bot.once('message', async (response) => {
        const units = response.text.trim();
        if (isNaN(units)) {
            await bot.sendMessage(userChatId, 'Invalid input. Please enter a valid number for units.');
            return;
        }

        try {
            await userService.updateUserUnits(telegramId, units);
            await bot.sendMessage(userChatId, `Units have been set to ${units} successfully.`);
        } catch (error) {
            await bot.sendMessage(userChatId, 'Error updating units. Please try again later.');
            console.error(`Error updating units for user ${telegramId}: ${error.message}`);
        }
    });
};
