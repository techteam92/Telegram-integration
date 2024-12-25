const userService = require('../../user/service/user.service');
const Signal = require('../models/signal.model');
const bot = require('../../../bot/bot');

const SignalManager = async (signal) => {
  try {
    const { side, tp1, tp2, tp3, sl, currentTimeframe, symbol, price } = signal;
    const users = await userService.getUsersByTradePreferences(symbol, `${currentTimeframe}m`);    
    if (!users || users.length === 0) {
      console.log(`No users found for symbol: ${symbol} and timeframe: ${currentTimeframe}m`);
      return;
    }
    for (const user of users) {
      const { telegramId } = user;
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
      await bot.sendMessage(telegramId, signalMessage, { parse_mode: 'html' });
    }
  } catch (error) {
    console.log(`Error in SignalManager: ${error}`);
  }
};

const saveSignal = async (signal) => {
  try {
    const newSignal = new Signal(signal);
    await newSignal.save();
    console.log('Signal saved successfully');
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
    return currentTime - signal.createdAt <= 2 * 60 * 1000; 
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


