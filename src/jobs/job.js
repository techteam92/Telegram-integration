const cron = require('node-cron');
const fetchSignalData = require('../api/signals/service/signal.service');
const bot = require('../bot/bot');

const chatId = '-1002212869845';

function startCronJobs() {
  cron.schedule('*/10 * * * *', async () => {
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
      await bot.sendMessage(chatId, message);
    }
  });
}

module.exports = startCronJobs;