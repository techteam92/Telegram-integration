const oandaService = require('../../api/oanda/services/oanda.service');
const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');

module.exports = async (bot, msg) => {
    const userChatId = msg.from.id;
    const telegramId = msg.from.id.toString();

    try {
        const userApiKeyInfo = await userService.getUserApiKey(telegramId);
        
        if (!userApiKeyInfo) {
            await bot.sendMessage(userChatId, "Please set up your OANDA API key using /set_oanda_key.");
            return;
        }

        const accounts = await oandaService.fetchUserAccounts(userApiKeyInfo.apiKey, userApiKeyInfo.accountType);

        const accountOptions = accounts.map(account => [{
            text: account.alias || `Account ID: ${account.id}`,
            callback_data: `select_account_${account.id}`
        }]);

        const keyboard = {
            reply_markup: {
                inline_keyboard: accountOptions
            }
        };
        await bot.sendMessage(userChatId, "Select a new account to use:", keyboard);

        bot.once('callback_query', async (accountQuery) => {
            const accountId = accountQuery.data.split('_')[2];
            await userService.updateUserAccountId(telegramId, accountId);
            await bot.sendMessage(userChatId, "Your OANDA account has been updated successfully.");
        });

    } catch (error) {
        logger.error(`Error updating OANDA account: ${error.message}`);
        await bot.sendMessage(userChatId, "An error occurred while updating your account. Please try again.");
    }
};
