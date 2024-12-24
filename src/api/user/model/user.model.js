const mongoose = require('mongoose');
const config = require('../../../common/config/config');

const userSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    subscriptionStatus: {
      type: String,
      required: true,
      enum: ['active', 'inactive'],
      default: 'inactive',
    },
    subscriptionStartDate: {
      type: Date,
      default: null,
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    isReceivingSignals: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: ['Monthly', 'Annually'],
      default: null,
    },
    units: {
      type: String,
      default: '100',
    },
    tradeType: {
      type: String,
      enum: ['Demo', 'Live'],
      default: 'Demo',
    },
    autoTrade: {
      type: Boolean,
      default: false,
    },
    activePlatform: {
      type: String,
      default: null,
    },
    trendSettings: {
      tradeAmount: {
        type: String,
        default: '1$',
      },
      autoTrade: {
        type: Boolean,
        default: false,
      },
      timeframes: {
        type: [String], 
        enum: ['1m', '5m', '10m', '15m', '30m', '60m'],
        default: ['1m'],
      },
      currencyPairs: {
        type: [String],
        default: ['USDJPY', 'EURUSD'], 
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('users', userSchema);
module.exports = User;
