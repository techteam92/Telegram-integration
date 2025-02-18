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
    console.log('Order created successfully:', newOrder);
    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
};