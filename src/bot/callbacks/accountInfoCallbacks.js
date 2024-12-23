const userService = require('../../api/user/service/user.service');
const novusService = require('../../api/novus/services/novus.service');

const handleAccountInfoCallback = async (bot, chatId, callbackData) => {
  try {
    const [_, action] = callbackData.split('/');
    const user = await userService.getUserByTelegramId(chatId);
    if (!user) {
      return bot.sendMessage(chatId, 'No user found for this Telegram ID. Please register first.', { parse_mode: 'HTML' });
    }

    const activePlatform = await userService.getActivePlatformAccount(user._id, 'Novus');
    if (!activePlatform) {
      return bot.sendMessage(chatId, 'No active platform found for Novus. Please connect your Novus account and select an active account.', {
        parse_mode: 'HTML',
      });
    }

    const { accessToken, activeAccount } = activePlatform;
    if (!accessToken) {
      return bot.sendMessage(chatId, 'Your Novus account token is missing. Please reconnect your account using the "Connect Account" option.', {
        parse_mode: 'HTML',
      });
    }

    if (!activeAccount) {
      return bot.sendMessage(chatId, 'No active account found. Please select an active account from the platform settings.', {
        parse_mode: 'HTML',
      });
    }

    const accountId = activeAccount.accountId;
    let responseMessage = '';

    switch (action) {
      case 'metrics': {
        const metrics = await novusService.getAccountMetrics(accountId, `DXAPI ${accessToken}`);
        const accountMetrics = metrics.orders.metrics[0];
        responseMessage = formatMetrics(accountMetrics);
        break;
      }

      case 'positions': {
        const positions = await novusService.getAccountPosition(accountId, `DXAPI ${accessToken}`);
        responseMessage = formatPositions(positions);
        break;
      }

      case 'open_orders': {
        const openOrders = await novusService.getOpenOrders(accountId, `DXAPI ${accessToken}`);
        responseMessage = formatOpenOrders(openOrders);
        break;
      }

      case 'order_history': {
        const orderHistory = await novusService.getOrderHistory(accountId, `DXAPI ${accessToken}`);
        responseMessage = formatOrderHistory(orderHistory);
        break;
      }

      default:        
        responseMessage = 'Invalid action. Please try again.';
    }
    await bot.sendMessage(chatId, responseMessage, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(`Error handling account info callback: ${error.message}`);
    if (error.message.includes('Authorization required')) {
      await bot.sendMessage(chatId, 'Your Novus account token has expired. Please reconnect your account.', { parse_mode: 'HTML' });
    } else {
      await bot.sendMessage(chatId, 'An error occurred. Please try again later.');
    }
  }
};

const formatMetrics = (metrics) => {
  if (!metrics) {
    return '<b>No account metrics available.</b>';
  }

  return `
<b>📊 Account Metrics</b>
<b>Account:</b> ${metrics.account}
<b>Version:</b> ${metrics.version}

<b>💵 Financials</b>
<b>Equity:</b> ${metrics.equity}
<b>Balance:</b> ${metrics.balance}
<b>Available Balance:</b> ${metrics.availableBalance}
<b>Available Funds:</b> ${metrics.availableFunds}
<b>Credit:</b> ${metrics.credit}

<b>📈 Performance</b>
<b>Open P&L:</b> ${metrics.openPL}
<b>Total P&L:</b> ${metrics.totalPL}

<b>📊 Margin Details</b>
<b>Margin Free:</b> ${metrics.marginFree}
<b>Margin:</b> ${metrics.margin}

<b>📌 Positions and Orders</b>
<b>Open Positions Count:</b> ${metrics.openPositionsCount}
<b>Open Orders Count:</b> ${metrics.openOrdersCount}
  `;
};

const formatPositions = (positions) => {
  if (!positions || !positions.orders || positions.orders.positions.length === 0) {
    return '<b>No positions available.</b>';
  }
  console.log(positions.orders.positions);
  const positionList = positions.orders.positions.map(
    (pos) => `
<b>Account:</b> ${pos.account}
<b>Position Code:</b> ${pos.positionCode}
<b>Symbol:</b> ${pos.symbol}
<b>Quantity:</b> ${pos.quantity}
<b>Side:</b> ${pos.side}
<b>Quantity Notional:</b> ${pos.quantityNotional}
<b>Open Time:</b> ${new Date(pos.openTime).toLocaleString()}
<b>Open Price:</b> ${pos.openPrice}
<b>Margin Rate:</b> ${pos.marginRate}
--------------------------------------------------------`
  );

  return `<b>📌 Account Positions</b>\n\n${positionList.join('\n')}`;
};
const formatOpenOrders = (openOrders) => {
  if (!openOrders || !openOrders.orders || openOrders.orders.length === 0) {
    return '<b>No open orders available.</b>';
  }
  const ordersList = openOrders.orders.map(
    (order) => `
<b>Order Code:</b> ${order.orderCode}
<b>Type:</b> ${order.type}
<b>Instrument:</b> ${order.instrument}
<b>Side:</b> ${order.side}`
  );

  return `<b>📄 Open Orders</b>\n\n${ordersList.join('\n')}`;
};

const formatOrderHistory = (orderHistory) => {
  if (!orderHistory || !orderHistory.orders || orderHistory.orders.length === 0) {
    return '<b>No order history available.</b>';
  }
  const historyList = orderHistory.orders.map((order) => {
    const leg = order.legs[0] || {};
    const execution = order.executions[0] || {};
    return `
<b>Order Code:</b> ${order.orderCode}
<b>Type:</b> ${order.type}
<b>Instrument:</b> ${order.instrument}
<b>Side:</b> ${order.side}
<b>Status:</b> ${order.status}
<b>Time in Force (TIF):</b> ${order.tif}
<b>Issue Time:</b> ${new Date(order.issueTime).toLocaleString()}
<b>Transaction Time:</b> ${new Date(order.transactionTime).toLocaleString()}
<b>Position Effect:</b> ${leg.positionEffect || 'N/A'}
<b>Quantity:</b> ${leg.quantity || 'N/A'}
<b>Filled Quantity:</b> ${leg.filledQuantity || 'N/A'}
<b>Remaining Quantity:</b> ${leg.remainingQuantity || 'N/A'}
<b>Average Price:</b> ${leg.averagePrice || '0.00'}
<b>Execution Status:</b> ${execution.status || 'N/A'}
<b>Reject Reason:</b> ${execution.rejectReason || 'N/A'}
-------------------------------------------------------------------------------
    `;
  });
  return `<b>📜 Order History</b>\n\n${historyList.join('\n\n')}`;
};


module.exports = handleAccountInfoCallback;
