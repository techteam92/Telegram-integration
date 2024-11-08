const express = require('express');
const router = express.Router();
const userService = require('../../user/service/user.service');
const logger = require('../../../common/utils/logger');
const bot = require('../../../bot/bot');
const config = require('../../../common/config/config');

router.post('/copperx', async (req, res) => {
    console.log("This webhook was called by Copper X");
    res.sendStatus(200); 
});

router.post('/copperx/paymentStatus', async (req, res) => {
    try {
        logger.info("Processing paymentStatus webhook from Copper X");
        console.log("custom fields", req.body.data.object.customFields.fields[0].text.value)

        const paymentStatus = req.body.data.object.paymentStatus;
        const telegramUsername = req.body.data.object.customFields.fields[0].text.value; 
        if (paymentStatus !== 'paid') {
            logger.error('Invalid webhook data received.');
            return res.status(400).send('Invalid data');
        }

        const user = await userService.getUserByUsername(telegramUsername);

        if (!user) {
            logger.error(`User with Telegram username ${telegramUsername} not found.`);
            return res.status(404).send('User not found');
        }
        
        const newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        const updatedUser = await userService.updateUserSubscriptionStatus(user.telegramId, 'active', newExpiryDate);

        if (updatedUser) {
            const newExpiryDate = new Date();
            newExpiryDate.setMonth(newExpiryDate.getMonth() + 1); 
            await userService.updateUserSubscriptionStatus(user.telegramId, 'active', newExpiryDate);
            logger.info(`User ${user.telegramId} subscription status updated to active.`);
            const chatId = config.groupChatId;
            bot.promoteChatMember(chatId, user.telegramId, {
                can_send_messages: true,
                can_send_media_messages: true,
                can_send_other_messages: true,
                can_add_web_page_previews: true,
            }).catch(error => {
                logger.error(`Error allowing user ${user.telegramId}: ${error.message}`);
            });

            bot.sendMessage(chatId, `${telegramUsername}, your subscription is successful! You can now fully participate in this group.`)
                .catch(error => {
                    logger.error(`Error sending subscription confirmation message to ${telegramUsername}: ${error.message}`);
                });

            return res.status(200).send('Subscription status updated and user unblocked');
        } else {
            logger.error(`Failed to update subscription status for user ${user.telegramId}.`);
            return res.status(500).send('Failed to update subscription status');
        }
    } catch (error) {
        logger.error(`Error processing Copper X webhook: ${error}`);
        return res.status(500).send('Internal server error');
    }
});


const webhookRoutes = {
    path: '/webhook',
    router,
  };
  
module.exports = webhookRoutes;
  

