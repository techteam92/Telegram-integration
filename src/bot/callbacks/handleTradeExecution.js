const { isSignalValid } = require('../../api/signals/service/signal.service');
const userService = require('../../api/user/service/user.service');
const novusServices = require('../../api/novus/services/novus.service');
const { generateOrderCode } = require('../../common/utils/orderCode');

const handleTradeExecution = async (bot, callbackQuery) => {
  const { data, from } = callbackQuery;
  const chatId = from.id.toString();
  try {
    const [_, action, signalId] = data.split('_');
    const { signal , validity } = await isSignalValid(signalId);
    if (!validity) {
      return bot.sendMessage(chatId, '🚫 Signal expired and not reliable.', { parse_mode: 'html' });
    }
    const user = await userService.getUserByTelegramId(chatId);
    const { accessToken, activeAccountId } = await userService.getActivePlatformDetails(user._id, user.activePlatform);
    if (!accessToken || !activeAccountId) {
      return bot.sendMessage(chatId, '❌ Unable to execute trade: No active account or token found.', { parse_mode: 'html' });
    }
    const tradeUnits = await userService.getUserTradeUnits(chatId);
    const tpPrice = action === 'tp1' ? signal.tp1 : action === 'tp2' ? signal.tp2 : signal.tp3; 
    const orderCode = generateOrderCode(activeAccountId);
    const orderRequest = JSON.stringify({
      account: activeAccountId,
      orderCode: orderCode,
      type: 'MARKET',
      instrument: signal.symbol,
      quantity: parseFloat(tradeUnits), 
      positionEffect: 'OPEN',
      side: signal.buy ? 'BUY' : 'SELL',
      limitPrice: tpPrice,
      stopPrice: signal.sl, 
      tif: 'DAY',
    });
    console.log(orderRequest);
    await novusServices.submitOrder(activeAccountId, `DXAPI ${accessToken}`, orderRequest);
    await bot.sendMessage(chatId, `✅ Trade executed for TP${action.slice(-1)} at ${tpPrice}!`, { parse_mode: 'html' });
  } catch (error) {
    console.log(`Error executing trade: ${error}`);
    await bot.sendMessage(chatId, '❌ Failed to execute trade. Please try again later.', { parse_mode: 'html' });
  }
};

module.exports = handleTradeExecution;
