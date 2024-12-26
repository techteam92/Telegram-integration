const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
    },
    updateOrderId: {
      type: Number,
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
