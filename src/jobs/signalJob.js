const cron = require('node-cron');
const fetchSignalData = require('../api/signals/service/signal.service');
const bot = require('../bot/bot');
const config = require('../common/config/config');

const chatId = config.groupChatId;

function signalJob() {
  cron.schedule('*/1 * * * *', async () => {
    console.log('Running cron job...');
    const signal = await fetchSignalData();
    console.log('Signal:', signal);
    if (signal) {
      const message = `Signal for ${signal.symbol}:
        Buy: ${signal.buy}
        Sell: ${signal.sell}
        Pivot Low: ${signal.pivlow}
        Pivot High: ${signal.pivhigh}
        Take Profit Long: ${signal.tp_lg}
        Take Profit Short: ${signal.tp_sh}
        Timestamp: ${signal.timestamp}
        Strategy: ${signal.strategyName}`;

      const tradeType = signal.buy ? 'buy' : 'sell';
      console.log('Trade Type:', tradeType);
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Execute Trade', callback_data: `execute_trade-${signal.symbol}-${tradeType}-${signal._id}`  }
            ]
          ]
        }
      };
      await bot.sendMessage(chatId, message, options);
   }
  });
}

module.exports = signalJob;