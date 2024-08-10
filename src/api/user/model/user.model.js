const mongoose = require('mongoose');
const config = require('../../../common/config/config');

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
    }
  }, {
    timestamps: true,
});  

const User = mongoose.model(config.collections.users, userSchema);
module.exports = User;
