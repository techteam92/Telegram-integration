const signUpMessage = require('../messages/signUpMessage')

module.exports = async (bot, callbackQuery) => {
    try {
    const { data, from } = callbackQuery;
    const chatId = from.id.toString();
  
    if ( data == 'signup_now'){
        return bot.sendMessage(chatId, signUpMessage(), {
            parse_mode: 'HTML'
        });
      }  
  } catch (error) {
    console.log(error)
  }
  
};