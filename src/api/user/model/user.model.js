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
    trendSettings: {
      tradeAmount: {
        type: String,
        default: '1$',
      },
      autoTrade: {
        type: Boolean,
        default: false,
      },
    },
    novusAccessToken: {
      type: String,
      default: null,
    },
    novusTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model(config.collections.users, userSchema);
module.exports = User;
