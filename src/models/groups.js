var mongoose = require("mongoose");

//Password Encryption Modules
const { v4: uuidv4 } = require("uuid");

const GroupsSchema = new mongoose.Schema({
  isBotAdmin: {
    type: Boolean,
  },

  groupId: {
    type: Number,
    unique: true,
  },

  groupTitle: {
    type: String,
  },

  groupType: {
    type: String,
  },
  messageId: {
    type: Number,
  },

  welcomeMessage: {
    type: String,
    default: `Hello ##USER_NAME## welcome to ##GROUP_NAME##`,
  },

  walletLink: {
    type: Boolean,
    default: false,
  },

  //1 for EVM
  //2 for Solana
  walletType: {
    type: Number,
    default: 0,
  },

  walletName: {
    type: String,
    default: "none",
  },
  messageId: {
    type: Number,
  },

  welcomeMessage: {
    type: String,
    default: `Hello ##USER_NAME## welcome to ##GROUP_NAME##`,
  },

  //1 token
  //2 NFT
  //3 none
  tokenType: {
    type: Number,
    default: 3,
  },

  tokenTypeString: {
    type: String,
    default: "None",
  },

  contractAddressMessageId: {
    type: Number,
    default: -1,
  },

  contractAddress: {
    type: String,
    default: "None",
  },

  noOfTokens: {
    type: Number,
    default: 0,
  },

  noOfTokensMessageId: {
    type: Number,
    default: 0,
  },
  lastBlock: {
    type: Number,
    default: 0,
  },
  twitterLinkId: {
    type: Number,
  },
  discordLinkId: {
    type: Number,
  },
  websiteLinkId: {
    type: Number,
  },
  twitterLink: {
    type: String,
    default: "None",
  },
  discordLink: {
    type: String,
    default: "None",
  },
  websiteLink: {
    type: String,
    default: "None",
  },
});

//Exporting Schema
var Groups = mongoose.model("Groups", GroupsSchema);
module.exports = { Groups };