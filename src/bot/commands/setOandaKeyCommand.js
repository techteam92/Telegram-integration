const oandaService = require('../../api/oanda/services/oanda.service');
const userService = require('../../api/user/service/user.service');
const logger = require('../../common/utils/logger');

const OANDA_HELP_MESSAGE = `
To set up your OANDA account, follow these steps:

1. Sign Up with OANDA:
   - Go to [OANDA Signup](https://www.oanda.com/us-en/) and create an account.

2. Creating an API Key:
   - Log in to your OANDA account.
   - Go to the API section in your account settings.
   - Create an API key. For test accounts, create a test API key; for live accounts, create a live API key.
   
3. Select Account Type:
   - Choose either a Test or Live account in this bot, then enter your API key and select the desired account.

After creating an API key and selecting the account type, you can enter your API key here and proceed with the setup. If you have further questions, refer to the OANDA documentation.
`;

module.exports = async (bot, msg) => {
  const userChatId = msg.from.id;
  const telegramId = msg.from.id.toString();

  try {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Test Account', callback_data: 'set_account_test' }],
          [{ text: 'Live Account', callback_data: 'set_account_live' }],
          [{ text: 'Help', callback_data: 'oanda_help' }],
          [{ text: 'Remove API Key', callback_data: 'remove_api_key' }]
        ],
      },
    };
    await bot.sendMessage(userChatId, 'Choose your OANDA account type or select Help:', keyboard);

    bot.once('callback_query', async (callbackQuery) => {
      const data = callbackQuery.data;

      if (data === 'oanda_help') {
        await bot.sendMessage(userChatId, OANDA_HELP_MESSAGE, { disable_web_page_preview: true });
        return;
      }

      if (data === 'remove_api_key') {
        await userService.removeUserAccountDetails(telegramId);
        await bot.sendMessage(userChatId, 'Your OANDA API key and account details have been removed successfully.');
        return;
      }

      const accountType = data === 'set_account_test' ? 'test' : 'live';
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
