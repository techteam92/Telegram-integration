const express = require('express');
const router = express.Router();
const userService = require('../user/service/user.service');
const logger = require('../../common/utils/logger');


router.post('/copperx/paymentStatus', async (req, res) => {
    try {
        const { telegramId, paymentStatus } = req.body;
        if (!telegramId || !paymentStatus) {
            logger.error('Invalid webhook data received.');
            return res.status(400).send('Invalid data');
        }
        if (paymentStatus === 'success') {
            const updatedUser = await userService.updateUserSubscriptionStatus(telegramId, 'active');
            if (updatedUser) {
                logger.info(`User ${telegramId} subscription status updated to active.`);
                return res.status(200).send('Subscription status updated');
            } else {
                logger.error(`User ${telegramId} not found.`);
                return res.status(404).send('User not found');
            }
        } else {
            logger.warn(`Payment status not successful for user ${telegramId}.`);
            return res.status(200).send('Payment status not successful');
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
  

