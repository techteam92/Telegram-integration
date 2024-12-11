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
        logger.info("Processing paymentStatus webhook from Copperx");

        const paymentStatus = req.body.data.object.paymentStatus;
        const telegramUsername = req.body.data.object.customFields.fields[0].text.value;

        if (paymentStatus !== 'paid') {
            logger.error('Payment not completed.');
            return res.status(400).send('Payment not completed');
        }

        const user = await userService.getUserByUsername(telegramUsername);

        if (!user) {
            logger.error(`User with Telegram username ${telegramUsername} not found.`);
            return res.status(404).send('User not found');
        }

        const paymentLinkId = req.body.data.object.paymentLinkId;
        let newExpiryDate = new Date();
        let subscriptionPlan = '';

        if (paymentLinkId === '3c29b34c-e0ad-4b4e-a187-cf096902ca29') {
            newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            subscriptionPlan = 'Annually';
        } else if (paymentLinkId === '73108091-377a-4ed3-b867-c41831174c1d') {
            newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
            subscriptionPlan = 'Monthly';
        } else {
            logger.error('Unknown payment link ID.');
            return res.status(400).send('Unknown payment link ID');
        }

        await userService.updateUserSubscriptionStatus(user.telegramId, 'active', newExpiryDate, subscriptionPlan);
        logger.info(`User ${user.telegramId} subscription updated to ${subscriptionPlan}.`);

        await bot.sendMessage(user.telegramId, `Your subscription is now active and valid until ${newExpiryDate.toDateString()}.`);
        return res.status(200).send('Subscription status updated');
    } catch (error) {
        logger.error(`Error processing Copperx webhook: ${error}`);
        return res.status(500).send('Internal server error');
    }
});


const webhookRoutes = {
    path: '/webhook',
    router,
  };
  
module.exports = webhookRoutes;
  

