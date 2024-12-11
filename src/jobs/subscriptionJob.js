const cron = require('node-cron');
const userService = require('../api/user/service/user.service');
const logger = require('../common/utils/logger');
const bot = require('../bot/bot');

function startSubscriptionCheckJob() {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running subscription expiry check job...');
      const now = new Date();
      const expiredUsers = await userService.getExpiredUsers(now);

      for (const user of expiredUsers) {
        await userService.updateUserSubscriptionStatus(user.telegramId, 'inactive');

        await bot.sendMessage(
          user.telegramId,
          `${user.username}, your subscription has expired. Please renew your subscription to continue receiving signals.`
        );

        logger.info(
          `Subscription expired for user ${user.username} (Telegram ID: ${user.telegramId}).`
        );
      }
    } catch (error) {
      logger.error(`Error in subscription expiry check job: ${error.message}`);
    }
  });
}

module.exports = startSubscriptionCheckJob;
