const Order = require('../models/orders.models');

const createOrder = async (userId, orderCode, accountId, platformName, orderId, updateOrderId, signalId) => {
  try {
    const newOrder = new Order({
      orderId,
      signalId,
      updateOrderId,
      orderCode,
      userId,
      accountId,
      platformName,
    });
    await newOrder.save();
    return newOrder;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createOrder,
};