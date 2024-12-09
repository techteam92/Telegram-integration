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
    subscriptionExpiry: {
      type: Date,
      default: null,
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
    connectedAccounts: {
      type: [
        {
          accountType: {
            type: String,
            enum: ['Novus', 'Sway Charts'], 
          },
          accountId: {
            type: String, 
          },
        },
      ],
      default: [], 
    },
    isReceivingSignals: {
      type: Boolean,
      default: false,
    },
    trendSettings: {
      tradeAmount: {
        type: String,
        enum: ['1$', '5$', '10$', '15$'], 
        default: '1$', 
      },
      autoTrade: {
        type: Boolean,
        default: false, 
      },
    },
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model(config.collections.users, userSchema);
module.exports = User;
