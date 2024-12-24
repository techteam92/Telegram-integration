const express = require('express');
const router = express.Router();
const userService = require('../user/service/user.service');
const logger = require('../../common/utils/logger');
const bot = require('../../bot/bot');
const SignalManager = require('../signals/service/signal.service');

router.post('/copperx/paymentStatus', async (req, res) => {
  try {
    logger.info('Processing paymentStatus webhook from Copperx');
    const paymentStatus = req.body.data.object.paymentStatus;
    const telegramUsername = req.body.data.object.customFields.fields[0].text.value;

    if (paymentStatus !== 'paid') {
      logger.error('Payment not completed.');
      return res.status(400).send('Payment not completed');
    }

    const user = await userService.getUserByTelegramUsername(telegramUsername);

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

router.post('/signals', async (req, res) => {
  try {
    let signal = req.body;
    signal = JSON.parse(cleanJSON(signal))
    await SignalManager(signal);
    res.status(200).json({ message: 'Signal processed successfully' });
  } catch (error) {
    console.log(`Error in webhook handler: ${error}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const cleanJSON = (malformedJSON) => {
  return malformedJSON
    .replace(/,\s*}/g, '}') 
    .replace(/\n/g, '') 
    .trim(); 
};

const webhookRoutes = {
  path: '/webhook',
  router,
};

module.exports = webhookRoutes;
