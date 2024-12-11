const { handleNovusLoginInput } = require("../handlers/connectAccountHandler");

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

module.exports = {
  handleConnectAccount,
};
