const userService = require('../../api/user/service/user.service');

module.exports = async (bot, chatId) => {
  try {
    await userService.updateUserReceivingSignals(chatId, false);
    await bot.sendMessage(chatId, 'Solo trend will stop sending signals here. Use the "Start Signal" button to resume.');
  } catch (error) {
    console.error(`Error in Stop Signal Handler: ${error.message}`);
    bot.sendMessage(chatId, 'An error occurred while stopping signals. Please try again later.');
  }
};
