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
  


module.exports = {
  initiateConnectAccount
};
