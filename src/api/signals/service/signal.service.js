const userService = require('../../user/service/user.service');
const Signal = require('../models/signal.model');

const SignalManager = async (bot, signal) => {
  try {
    const { side, tp1, tp2, tp3, sl, currentTimeframe, symbol, price } = signal;
    const savedSignal = await saveSignal(signal);
    const signalMessage = `
🚀✨ <b>Trade Signal Alert!!!</b> ✨🚀

📊 <b>Symbol:</b> <code>${symbol}</code>
📈 <b>Direction:</b> <b>${side === 'Buy' ? '🟢 Buy' : '🔴 Sell'}</b>
💰 <b>Entry Price:</b> <code>${price}</code>

🔒 <b>Stop Loss (SL):</b> <code>${sl}</code>
🎯 <b>Take Profit Levels:</b>
  - 🥇 <b>TP1:</b> <code>${tp1}</code>
  - 🥈 <b>TP2:</b> <code>${tp2}</code>
  - 🥉 <b>TP3:</b> <code>${tp3}</code>

⏳ <b>Timeframe:</b> <code>${currentTimeframe}m</code>

📌 <i>Remember to follow your risk management plan!</i> 🛡️`;

    const signalButtons = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Execute TP1', callback_data: `trade_tp1_${savedSignal._id}` },
            { text: 'Execute TP2', callback_data: `trade_tp2_${savedSignal._id}` },
            { text: 'Execute TP3', callback_data: `trade_tp3_${savedSignal._id}` },
          ],
        ],
      },
    };

    const users = await userService.getUsersByTradePreferences(symbol, `${currentTimeframe}m`);
    for (const user of users) {
      await bot.sendMessage(user.telegramId, signalMessage, { parse_mode: 'html', ...signalButtons });
    }
  } catch (error) {
    console.error(`Error in SignalManager: ${error.message}`);
  }
};

const saveSignal = async (signal) => {
  try {
    const newSignal = new Signal(signal);
    await newSignal.save();
    console.log('Signal saved successfully');
    return newSignal;
  } catch (error) {
    console.error(`Error saving signal: ${error.message}`);
    throw error;
  }
};

const isSignalValid = async (signalId) => {
  try {
    const signal = await Signal.findById(signalId);
    if (!signal) {
      throw new Error('Signal not found');
    }
    const currentTime = new Date();
    const validity = currentTime - signal.createdAt <= 10 * 60 * 1000;
    return { signal, validity };
  } catch (error) {
    console.error(`Error checking signal validity: ${error.message}`);
    throw error;
  }
};

module.exports = {
  SignalManager,
  saveSignal,
  isSignalValid,
};


