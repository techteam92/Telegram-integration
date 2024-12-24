const userService = require('../../api/user/service/user.service');

module.exports = async (bot, chatId, user) => {
  try {
    if (user.isReceivingSignals) {
      return bot.sendMessage(chatId, 'You are already receiving signals. Use the "Trend Settings" option to configure further.');
    }
    await userService.updateUserReceivingSignals(chatId, true);
    await bot.sendMessage(
      chatId,
      'Solo trends will start sending signals here. Please hit the "Trend Settings" button to change the settings of the bot.'
    );
  } catch (error) {
    console.error(`Error in Start Signal Handler: ${error.message}`);
    bot.sendMessage(chatId, 'An error occurred while starting signals. Please try again later.');
  }
};
