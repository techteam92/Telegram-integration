const express = require('express');
const router = express.Router();
const userService = require('../../user/service/user.service');
const logger = require('../../../common/utils/logger');
const bot = require('../../../bot/bot');
const config = require('../../../common/config/config');

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
    console.log('Processing signal webhook from TradingView');
    console.log("req.body:", req.body);
    const { body } = req;
    console.log('Received Signal Data:', body);
    if (!body || !body.text) {
      console.error('No text data received.');
      return res.status(400).send('Invalid request: no text data.');
    }

    const signalText = body.text;
    console.log('Received Signal Text:', signalText);

    const sideMatch = signalText.match(/🚀(BUY|SELL)\s*:\s*([\d.]+)/i);
    const tp1Match = signalText.match(/💰Take Profit 1\s*:\s*([\d.]+)/i);
    const tp2Match = signalText.match(/💰Take Profit 2\s*:\s*([\d.]+)/i);
    const tp3Match = signalText.match(/💰Take Profit 3\s*:\s*([\d.]+)/i);
    const slMatch = signalText.match(/🛑Stop loss\s*:\s*([\d.]+)/i);
    const timeframeMatch = signalText.match(/Timeframe:\s*(\d+)/i);
    const side_ = sideMatch ? sideMatch[1].toUpperCase() : 'N/A';
    const price = sideMatch ? sideMatch[2] : 'N/A';
    const tp1 = tp1Match ? tp1Match[1] : 'N/A';
    const tp2 = tp2Match ? tp2Match[1] : 'N/A';
    const tp3 = tp3Match ? tp3Match[1] : 'N/A';
    const sl = slMatch ? slMatch[1] : 'N/A';
    const currentTimeframe = timeframeMatch ? timeframeMatch[1] : 'N/A';

    console.log('Parsed Signal Data:', { side_, price, tp1, tp2, tp3, sl, currentTimeframe });
    if (side_ === 'N/A' || price === 'N/A' || sl === 'N/A') {
      console.error('Failed to parse required fields from the signal.');
      return res.status(400).send('Invalid signal format: required fields missing.');
    }

    const signalMessage = `
        📊 *New Signal Received*
        ⏳ *Timeframe*: ${currentTimeframe}
        🚀 *Side*: ${side_}
        💵 *Entry Price*: ${price}
        💰 *Take Profit 1*: ${tp1}
        💰 *Take Profit 2*: ${tp2}
        💰 *Take Profit 3*: ${tp3}
        🛑 *Stop Loss*: ${sl}
        📈 *Strategy*: SOLOTREND X
        `;

    console.log('Formatted Signal Message:', signalMessage);
    const users = await userService.getSubscribedUsersWithTimeframe(currentTimeframe);

    if (!users || users.length === 0) {
      console.log(`No users found for the timeframe: ${currentTimeframe}`);
      return res.status(200).send('No users found for the specified timeframe.');
    }
    for (const user of users) {
      await bot.sendMessage(user.telegramId, signalMessage, { parse_mode: 'Markdown' });
    }
    console.log(`Signal successfully sent to ${users.length} users.`);
    res.status(200).send('Signal processed and sent successfully.');
  } catch (error) {
    console.error(`Error processing TradingView signal: ${error.message}`);
    res.status(500).send('Internal server error.');
  }
});

const webhookRoutes = {
  path: '/webhook',
  router,
};

module.exports = webhookRoutes;
