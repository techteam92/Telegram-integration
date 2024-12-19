const mongoose = require('mongoose');

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

const Platform = mongoose.model('Platform', platformSchema);
module.exports = Platform;
