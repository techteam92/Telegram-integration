const novusService = require("../../api/novus/services/novus.service");
const userService = require('../../api/user/service/user.service');

const initiateConnectAccount = async (bot, chatId) => {
    const connectAccountKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Novus', callback_data: 'connect_novus' }],
          [{ text: 'Sway Charts', callback_data: 'connect_sway_charts' }],
        ],
      },
    };
  
    await bot.sendMessage(chatId, 'Choose an account to connect:', connectAccountKeyboard);
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
    await userService.updateUserAccountDetails(chatId, sessionToken);
    await bot.sendMessage(chatId, 'Successfully connected to Novus! 🎉');
  } catch (error) {
    console.error(`Error logging in to Novus for chatId ${chatId}: ${error.message}`);
    await bot.sendMessage(chatId, `Failed to connect to Novus: ${error.message}`);
  }
};

module.exports = {
  handleNovusLoginInput,
  initiateConnectAccount
};
