const novusService = require('../../api/novus/services/novus.service');
const userService = require('../../api/user/service/user.service'); 

const handleConnectAccount = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();
  if (data === 'connect_novus') {
    await bot.sendMessage(
      chatId,
      `Please provide your Novus login details in the following format:\n\n*username password*\n\nExample:\nexample@gmail.com password123`,
      { parse_mode: 'Markdown' },
    );
    bot.once('message', async (msg) => {
      if (msg.chat.id.toString() === chatId) {
        await handleNovusLoginInput(bot, msg, chatId);
      } 
    });
  } else if (data === 'connect_sway_charts') {
    await bot.sendMessage(chatId, 'Sway Charts is coming soon!');
  } else {
    await bot.sendMessage(chatId, 'Invalid action. Please try again.');
  }
};

const handleNovusLoginInput = async (bot, msg, chatId) => {
  const text = msg.text.trim();
  const credentialsRegex = /^(\S+)\s+(.+)$/;
  const match = text.match(credentialsRegex);
  if (!match) {
    return bot.sendMessage(
      chatId,
      `Invalid format. Please provide your Novus login details in the following format:\n\n*username password*\n\nExample:\nexample@gmail.com password123`,
      { parse_mode: 'Markdown' }
    );
  }
  const [_, username, password] = match;
  try {
    await bot.sendMessage(chatId, 'Connecting to Novus...');
    const sessionToken = await novusService.loginUser(username, 'default', password);
    const user = await userService.getUserByTelegramId(chatId);
    if (!user) {
      return bot.sendMessage(
        chatId,
        'No user found for this Telegram ID. Please use the "/start" command to register.',
        { parse_mode: 'Markdown' }
      );
    }
    const userId = user._id;
    await userService.createOrUpdatePlatform(
      userId,
      'Novus',
      sessionToken,
      new Date(Date.now() + 30 * 60 * 1000)
    );
    await userService.setActivePlatform(chatId, 'Novus');
    await bot.sendMessage(chatId, 'Successfully connected to Novus! 🎉');
  } catch (error) {
    console.error(`Error logging in to Novus for chatId ${chatId}: ${error.message}`);
    await bot.sendMessage(chatId, `Failed to connect to Novus: ${error.message}`);
  }
};


module.exports = {
  handleConnectAccount,
};
