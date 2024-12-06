const menuHandler = async (bot, chatId) => {
  const menuKeyboard = {
    reply_markup: {
      keyboard: [['Subscribe', 'Start Signal'], ['Stop Signal', 'Connect Account'], ['Trend Settings', 'Billing Info'], ['Unsubscribe']],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };

  await bot.sendMessage(chatId, `Welcome to Solo Trend bot! Use the menu below to navigate through the options.`, menuKeyboard);
};

module.exports = { menuHandler };
