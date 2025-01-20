const cron = require('node-cron');
const fetchSignalData = require('../api/signals/service/signal.service');
const bot = require('../bot/bot');
const userService = require('../api/user/service/user.service'); 
const logger = require('../common/utils/logger');

async function signalJob() {
  cron.schedule('* * * * *', async () => {
    console.log('Running signal cron job...');
    try {
      const signal = await fetchSignalData();

      if (!signal) {
        logger.info('No signal data available at this time.');
        return;
      }

      const subscribedUsers = await userService.getSubscribedUsers();

      if (!subscribedUsers || subscribedUsers.length === 0) {
        logger.info('No subscribed users found.');
        return;
      }

      const message = `Signal for ${signal.symbol}:
        Buy: ${signal.buy}
        Sell: ${signal.sell}
        Pivot Low: ${signal.pivlow}
        Pivot High: ${signal.pivhigh}
        Take Profit Long: ${signal.tp_lg}
        Take Profit Short: ${signal.tp_sh}
        Timestamp: ${new Date(signal.timestamp).toLocaleString()}
        Strategy: ${signal.strategyName}`;

      const tradeType = signal.buy ? 'buy' : 'sell';
      const options = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Execute Trade', callback_data: `execute_trade-${signal.symbol}-${tradeType}-${signal._id}` }
            ]
          ]
        }
      };

      for (const user of subscribedUsers) {
        try {
          await bot.sendMessage(user.telegramId, message, options);
          logger.info(`Signal sent to user ${user.telegramId}`);
        } catch (error) {
          logger.error(`Failed to send signal to user ${user.telegramId}: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(`Error running signal job: ${error.message}`);
    }
  });
}

module.exports = signalJob;
