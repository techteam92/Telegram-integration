const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'signals',
      required: true,
    },
    updateOrderId: {
      type: String,
      required: true,
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    platformName: {
      type: String,
      required: true,
      enum: ['Novus', 'Sway'], 
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;
