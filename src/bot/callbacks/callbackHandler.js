const trendSettingsCallbacks = require('./trendSettingsCallbacks');
const setUnitsCallbacks = require('./setUnitsCallbacks');
const { handleConnectAccount } = require('./connectAccountCallbacks');
const { handleSubscriptionCallbacks } = require('./subscriptionCallbacks');
const { toggleTimeframe } = require('./toggleTimeframeCallback');
const { managePlatformAccounts, setActivePlatformAccount } = require('./platformCallbackHandler');
const handleAccountInfoCallback = require('./accountInfoCallbacks');

module.exports = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();
  console.log(`Received callback query: ${data} from chatId: ${chatId}`);
  try {
    switch (true) {
      case data.startsWith('trend_'):
        return trendSettingsCallbacks(bot, callbackQuery);

      case data.startsWith('unit_'):
        return setUnitsCallbacks(bot, callbackQuery);

      case data.startsWith('connect_'):
        return handleConnectAccount(bot, callbackQuery);

      case data.startsWith('subscribe_'):
        return handleSubscriptionCallbacks(bot, callbackQuery);

      case data.startsWith('timeframe_toggle_'): {
        const timeframe = data.split('_')[2];
        return toggleTimeframe(bot, chatId, timeframe);
      }

      case data.startsWith('platform_manage_'): {
        const platformName = data.split('_')[2];
        return managePlatformAccounts(bot, chatId, platformName);
      }

      case data.startsWith('PSA/'): {
        const [ prefix, platformName, userId, accountId ] = data.split('/') ;
        return setActivePlatformAccount(bot, chatId, platformName, accountId, userId);
      }

      case data.startsWith('INFO/'): {
        return handleAccountInfoCallback(bot, chatId, data);
      }
      
      default:
        await bot.sendMessage(chatId, 'Invalid action. Please try again.');
    }
  } catch (error) {
    console.error(`Error handling callback: ${error.message}`);
    await bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
};
