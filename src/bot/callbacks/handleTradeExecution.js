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
    const { signal, validity } = await isSignalValid(signalId);
    if (!validity) {
      return bot.sendMessage(chatId, '🚫 Signal expired and not reliable.', { parse_mode: 'html' });
    }

    const user = await userService.getUserByTelegramId(chatId);
    const { accessToken, activeAccountId } = await userService.getActivePlatformDetails(user._id, user.activePlatform);
    if (!accessToken || !activeAccountId) {
      return bot.sendMessage(chatId, '❌ Unable to execute trade: No active account or token found, please select your account from the menu.', { parse_mode: 'html' });
    }

    const tradeUnits = await userService.getUserTradeUnits(chatId);
    const tpPrice = action === 'tp1' ? signal.tp1 : action === 'tp2' ? signal.tp2 : signal.tp3;
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
    console.log(`Market Order Request: ${JSON.stringify(marketOrderRequest)}`);
    const marketOrderResponse = await novusServices.submitOrder(activeAccountId, `DXAPI ${accessToken}`, marketOrderRequest);
    if (!marketOrderResponse || !marketOrderResponse.orderId) {
      throw new Error('Market order execution failed.');
    }
    const positions = await novusServices.getAccountPosition(activeAccountId, `DXAPI ${accessToken}`);
    const position = positions.orders.find(pos => pos.orderId === marketOrderResponse.orderId);
    if (!position || !position.positionCode) {
      throw new Error('Failed to retrieve position code after market order execution.');
    }
    const positionCode = position.positionCode;
    const stopLossOrderRequest = {
      account: activeAccountId,
      orderCode: generateOrderCode(activeAccountId),
      type: 'STOP',
      instrument: signal.symbol,
      quantity: tradeQuantity,
      side: signal.side.toUpperCase() === 'BUY' ? 'SELL' : 'BUY', 
      stopPrice: Number(signal.sl.toFixed(3)),
      tif: 'GTC', 
      positionEffect: 'CLOSE',
      positionCode: positionCode,
    };

    console.log(`Stop Loss Order Request: ${JSON.stringify(stopLossOrderRequest)}`);
    const stopLossOrderResponse = await novusServices.submitOrder(activeAccountId, `DXAPI ${accessToken}`, stopLossOrderRequest);

    if (!stopLossOrderResponse || !stopLossOrderResponse.orderId) {
      throw new Error('Stop Loss order placement failed.');
    }

    const takeProfitOrderRequest = {
      account: activeAccountId,
      orderCode: generateOrderCode(activeAccountId),
      type: 'LIMIT',
      instrument: signal.symbol,
      quantity: tradeQuantity,
      side: signal.side.toUpperCase() === 'BUY' ? 'SELL' : 'BUY',
      limitPrice: Number(tpPrice.toFixed(3)),
      tif: 'GTC', 
      positionEffect: 'CLOSE',
      positionCode: positionCode,
    };

    console.log(`Take Profit Order Request: ${JSON.stringify(takeProfitOrderRequest)}`);
    const takeProfitOrderResponse = await novusServices.submitOrder(activeAccountId, `DXAPI ${accessToken}`, takeProfitOrderRequest);

    if (!takeProfitOrderResponse || !takeProfitOrderResponse.orderId) {
      throw new Error('Take Profit order placement failed.');
    }
    await createOrder(user._id, orderCode, activeAccountId, user.activePlatform, marketOrderResponse.orderId, signalId);
    await createOrder(user._id, stopLossOrderRequest.orderCode, activeAccountId, user.activePlatform, stopLossOrderResponse.orderId, signalId);
    await createOrder(user._id, takeProfitOrderRequest.orderCode, activeAccountId, user.activePlatform, takeProfitOrderResponse.orderId, signalId);
    await bot.sendMessage(chatId, `✅ ${signal.symbol} trade executed with SL at ${signal.sl.toFixed(3)} and TP at ${tpPrice.toFixed(3)}!`, { parse_mode: 'html' });
  } catch (error) {
    console.error(`Error executing trade: ${error.message}`);
    await bot.sendMessage(chatId, '❌ Failed to execute trade. Please try again later.', { parse_mode: 'html' });
  }
};

module.exports = handleTradeExecution;
