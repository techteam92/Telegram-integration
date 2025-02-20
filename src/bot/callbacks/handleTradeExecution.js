const { isSignalValid } = require('../../api/signals/service/signal.service');
const userService = require('../../api/user/service/user.service');
const novusServices = require('../../api/novus/services/novus.service');
const { generateOrderCode } = require('../../common/utils/orderCode');
const { createOrder } = require('../../api/orders/services/order.service');

const handleTradeExecution = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();
  try {
    const [_, action, signalId] = data.split('_');
    console.log('Signal ID:', signalId);
    const { signal, validity } = await isSignalValid(signalId);
    if (!validity) {
      return bot.sendMessage(chatId, '🚫 Signal expired and not reliable.', { parse_mode: 'html' });
    }

    const user = await userService.getUserByTelegramId(chatId);
    console.log('User:', user);
    const { accessToken, activeAccountId } = await userService.getActivePlatformDetails(user._id, user.activePlatform);
    if (!accessToken || !activeAccountId) {
      return bot.sendMessage(chatId, '❌ Unable to execute trade: No active account or token found, please select your account from the menu.', { parse_mode: 'html' });
    }

    const tradeUnits = await userService.getUserTradeUnits(chatId);
    const orderCode = generateOrderCode(activeAccountId);
    const tradeQuantity = parseFloat(tradeUnits) * 100000;
    const marketOrderRequest = {
      account: activeAccountId,
      orderCode: orderCode,
      type: 'MARKET',
      instrument: signal.symbol,
      quantity: tradeQuantity,
      side: signal.side.toUpperCase(),
      tif: 'IOC',
      positionEffect: 'OPEN',
    }; 
    const marketOrderResponse = await novusServices.submitOrder(activeAccountId, `DXAPI ${accessToken}`, marketOrderRequest);
    if (!marketOrderResponse || !marketOrderResponse.orderId) {
      throw new Error('Market order execution failed.');
    }
    console.log(`Market Order Request: ${JSON.stringify(marketOrderResponse)}`);;
    await createOrder(user._id, orderCode, activeAccountId, user.activePlatform, marketOrderResponse.orderId, marketOrderResponse.updateOrderId, signalId);
    await bot.sendMessage(chatId, `✅ ${signal.symbol} market order executed successfully!`, { parse_mode: 'html' });
  } catch (error) {
    console.error(`Error executing trade: ${error.message}`);
    await bot.sendMessage(chatId, '❌ Failed to execute trade. Please try again later.', { parse_mode: 'html' });
  }
};

module.exports = handleTradeExecution;
