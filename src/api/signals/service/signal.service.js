const userService = require('../../user/service/user.service');
const bot = require('../../../bot/bot');

const SignalManager = async (signal) => {
  try {
    console.log('Received signal:', signal);
    const { side, tp1, tp2, tp3, sl, currentTimeframe, symbol, price } = signal;
    console.log(`Processing signal for symbol: ${symbol} and timeframe: ${currentTimeframe}`);
    const users = await userService.getUsersByTradePreferences(symbol, currentTimeframe);

    if (!users || users.length === 0) {
      console.log(`No users found for symbol: ${symbol} and timeframe: ${currentTimeframe}`);
      return;
    }
    for (const user of users) {
      const { telegramId } = user;
      const signalMessage = `
<b>📈 Trade Signal</b>
<b>Symbol:</b> ${symbol}
<b>Side:</b> ${side}
<b>Entry Price:</b> ${price}
<b>Stop Loss (SL):</b> ${sl}
<b>Take Profit Levels:</b>
  - TP1: ${tp1}
  - TP2: ${tp2}
  - TP3: ${tp3}
<b>Timeframe:</b> ${currentTimeframe}m`;
      await bot.sendMessage(telegramId, signalMessage, { parse_mode: 'html' });
    }
  } catch (error) {
    console.log(`Error in SignalManager: ${error}`);
  }
};

module.exports = SignalManager;
