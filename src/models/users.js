
var mongoose = require("mongoose");

//Password Encryption Modules
const { v4: uuidv4 } = require('uuid');

const { ObjectId } = mongoose.Schema;

//Making Schema
const UserSchema = new mongoose.Schema({

    groupId: {
        type: Number
    },

    groupObjectId: {
        type: ObjectId,
        ref: 'Groups'
    },

    //name of user
    telegramFirstName: {
        type: String
    },

    //Last Name
    telegramLastName: {
        type: String
    },

    //user name 
    telegramUserName: {
        type: String
    },

    //Id of user
    telegramUserId: {
        type: Number,
        // unique: true
    },

    verified: {
        type: Boolean,
        default: false
    },

    chatId: {
        type: Number
    },

    joinTime: {
        type: Number
    },

    walletAddress: {
        type: String
    },

    delete_message_id:{
        type:String
    },

    delete_chat_id:{
        type:String
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    messageCount:{
        type:Number,
        default:0
    },

    userAddedAfterBot:{
        type:Boolean,
        default:false
    }

}, { timestamps: true })

UserSchema.index({ telegramUserId: 1, groupId: 1 }, { unique: true });

//Exporting Schema
var Users = mongoose.model('Users', UserSchema);
module.exports = { Users }