const mongoose = require('mongoose');
const signalSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
    },
    currentTimeframe: {
      type: String,
      required: true,
    },
    side: {
      type: String,
      enum: ['Buy', 'Sell'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    tp1: {
      type: Number,
      required: true,
    },
    tp2: {
      type: Number,
      required: true,
    },
    tp3: {
      type: Number,
      required: true,
    },
    sl: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },  
  },
  {
    timestamps: true,
  }
);

const Signal = mongoose.model('Signal', signalSchema);

module.exports = Signal;