const userSchema = new mongoose.Schema({
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
    },
    subscriptionExpiry: {
      type: Date,
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
  }, {
    timestamps: true,
  });
  