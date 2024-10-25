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
    },
    oandaApiKey: {
        type: String,
        default: null,
    },
    oandaAccountType: {
        type: String,
        enum: ['test', 'live'],
        default: null,
    }
}, {
    timestamps: true,
});

const User = mongoose.model(config.collections.users, userSchema);
module.exports = User;
