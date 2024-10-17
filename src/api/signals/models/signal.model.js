const mongoose = require('mongoose');

const signalSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  interval: { type: String, required: true },
  period: { type: Number, required: true },
  buy: { type: Boolean, required: true },
  sell: { type: Boolean, required: true },
  pivlow: { type: Number },
  pivhigh: { type: Number },
  tp_lg: { type: Number },
  tp_sh: { type: Number },
  timestamp: { type: Date, required: true },
  strategyName: { type: String },
  strategyDescription: { type: String },
}, { timestamps: true });

const Signal = mongoose.model('Signal', signalSchema);

module.exports = Signal;
