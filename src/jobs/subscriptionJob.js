const cron = require('node-cron');
const userService = require('../api/user/service/user.service');
const logger = require('../common/utils/logger');
const bot = require('../bot/bot');

const chatId = '-1002451464440'; 

function startSubscriptionCheckJob() {
    cron.schedule('0 0 * * *', async () => {
        try {
            logger.info('Running subscription expiry check job...');
            const now = new Date();
            const expiredUsers = await userService.getExpiredUsers(now);

            for (const user of expiredUsers) {
                await userService.updateUserSubscriptionStatus(user.telegramId, 'inactive');

                bot.restrictChatMember(chatId, user.telegramId, {
                    permissions: {
                        can_send_messages: false,
                        can_send_media_messages: false,
                        can_send_other_messages: false,
                        can_add_web_page_previews: false,
                    },
                }).catch(error => {
                    logger.error(`Error restricting user ${user.telegramId}: ${error.message}`);
                });

                await bot.sendMessage(chatId, `${user.username}, your subscription has expired. Please renew your subscription to continue participating in this group.`);
                logger.info(`Subscription expired for user ${user.username} (Telegram ID: ${user.telegramId}). Restricted from group.`);
            }
        } catch (error) {
            logger.error(`Error in subscription expiry check job: ${error.message}`);
        }
    });
}

module.exports = startSubscriptionCheckJob;
