const userService = require('../../api/user/service/user.service');
const novusService = require('../../api/novus/services/novus.service');

const managePlatformAccounts = async (bot, chatId, platformName) => {
  try {
    if (platformName === 'Sway') {
      return bot.sendMessage(chatId, 'Sway Charts functionality is coming soon! 🚀');
    }
    const user = await userService.getUserByTelegramId(chatId);
    const userId = user._id;
    const platform = await userService.checkPlatformAccount(userId, platformName);
    if (!platform) {
      return bot.sendMessage(
        chatId,
        `You have not connected your ${platformName} account yet. Please use the "Connect Account" option in the main menu.`,
        { parse_mode: 'Markdown' },
      );
    }
    if (!platform.accessToken) {
      return bot.sendMessage(
        chatId,
        `Your ${platformName} account is not connected. Please reconnect using the "Connect Account" option in the main menu.`,
        { parse_mode: 'Markdown' },
      );
    }
    if (platformName === 'Novus') {
      try {
        const accountsResponse = await novusService.getUsers(`DXAPI ${platform.accessToken}`);
        const accounts = accountsResponse.userDetails[0]?.accounts || [];
        for (const account of accounts) {
          await userService.addPlatformAccount(userId, platformName, {
            accountId: account.account,
            accountName: account.owner,
            isActive: false,
          });
        }
        const updatedPlatform = await userService.getPlatformAccounts(userId, platformName);
        return showAccounts(bot, chatId, platformName, updatedPlatform);
      } catch (error) {
        console.error(`Error fetching Novus accounts for chatId ${chatId}: ${error.message}`);
        return bot.sendMessage(chatId, `Failed to fetch accounts from ${platformName}. Please try again later.`, { parse_mode: 'Markdown' });
      }
    }
  } catch (error) {
    console.error(`Error managing accounts for ${platformName}: ${error.message}`);
    await bot.sendMessage(chatId, `An error occurred while retrieving accounts for ${platformName}. Please try again.`);
  }
};

const showAccounts = async (bot, chatId, platformName, accounts) => {
  console.log(`Accounts for chatId ${chatId}:`, accounts);
  if (!accounts || accounts.length === 0) {
    return bot.sendMessage(chatId, `No accounts found for ${platformName}.`);
  }

  const accountKeyboard = {
    reply_markup: {
      inline_keyboard: accounts.map((account) => [
        {
          text: `${account.isActive ? '✅ ' : ''}${account.accountId}`,
          callback_data: `platform_set_active_${platformName}_${account.accountId}`,
        },
      ]),
    },
  };

  await bot.sendMessage(chatId, `Select your active account for ${platformName}:`, accountKeyboard);
};

const setActivePlatformAccount = async (bot, chatId, platformName, accountId) => {
  try {
    const platform = await userService.setActivePlatformAccount(chatId, platformName, accountId);
    if (!platform) {
      return bot.sendMessage(chatId, `Failed to set active account for ${platformName}. Please connect you account again`);
    }
    await bot.sendMessage(chatId, `Successfully set active account: ${accountId} for ${platformName}. 🎉`);
  } catch (error) {
    console.error(`Error setting active account for ${platformName}: ${error.message}`);
    await bot.sendMessage(chatId, `An error occurred while setting the active account for ${platformName}.`);
  }
};

module.exports = {
  managePlatformAccounts,
  setActivePlatformAccount,
};
