const oandaService = require('../../api/oanda/services/oanda.service');
const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');

module.exports = async (bot, msg) => {
  const userChatId = msg.from.id;
  const telegramId = msg.from.id.toString();

  try {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Test Account', callback_data: 'set_account_test' }],
          [{ text: 'Live Account', callback_data: 'set_account_live' }],
        ],
      },
    };
    await bot.sendMessage(userChatId, 'Choose your OANDA account type:', keyboard);
    bot.once('callback_query', async (callbackQuery) => {
      const accountType = callbackQuery.data === 'set_account_test' ? 'test' : 'live';
      await bot.sendMessage(userChatId, `You selected ${accountType} account. Now, please enter your OANDA API key.`);
      bot.once('message', async (response) => {
        const apiKey = response.text;
        try {
          const accounts = await oandaService.fetchUserAccounts(apiKey, accountType);
          const accountOptions = accounts.map((account) => [
            {
              text: account.alias || `Account ID: ${account.id}`,
              callback_data: `select_account_${account.id}`,
            },
          ]);

          const keyboard = {
            reply_markup: {
              inline_keyboard: accountOptions,
            },
          };
          await bot.sendMessage(userChatId, 'Select an account to use:', keyboard);

          bot.once('callback_query', async (accountQuery) => {
            const accountId = accountQuery.data.split('_')[2];
            await userService.saveUserAccountDetails(telegramId, apiKey, accountType, accountId);
            await bot.sendMessage(userChatId, 'Your OANDA account has been saved successfully.');
          });
        } catch (error) {
          logger.error(`Error retrieving OANDA accounts: ${error.message}`);
          await bot.sendMessage(userChatId, 'Invalid API key or no accounts found. Please try again.');
        }
      });
    });
  } catch (error) {
    logger.error(`Error in OANDA setup: ${error.message}`);
    await bot.sendMessage(userChatId, 'An error occurred. Please try again.');
  }
};
