const mongoose = require('mongoose');
const { decrypt, encrypt } = require('../../../common/utils/encrypt-decrypt');

const platformSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users', 
      required: true 
    },
    platformName: { 
      type: String, 
      enum: ['Novus', 'Sway'], 
      required: true 
    },
    accounts: [
      {
        accountId: { type: String, required: true },
        accountName: { type: String },
        isActive: { type: Boolean, default: false },
      },
    ],
    username: {
      type: String,
      default: null,
    },
    password: {
      type: String, 
      default: null,
      get: decrypt, 
      set: encrypt
    },
    accessToken: { 
      type: String, 
      default: null 
    },
    tokenExpiry: { 
      type: Date, 
      default: null 
    },
  },
  { timestamps: true },
);

platformSchema.set('toJSON', { getters: true });
platformSchema.set('toObject', { getters: true });

const Platform = mongoose.model('Platform', platformSchema);
module.exports = Platform;
