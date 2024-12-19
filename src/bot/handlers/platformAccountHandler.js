module.exports = async (bot, chatId) => {
  const platformKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Novus', callback_data: 'platform_manage_Novus' }],
        [{ text: 'Sway Charts', callback_data: 'platform_manage_Sway' }],
      ],
    },
  };

  await bot.sendMessage(
    chatId,
    'Choose a platform to manage your accounts:',
    platformKeyboard
  );
};
