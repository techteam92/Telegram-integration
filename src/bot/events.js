const { Groups } = require("../models/groups");
const { Users } = require("../models/users");

async function botListener(ctx) {
  try {
    const newStatus = ctx.myChatMember.new_chat_member.status;
    const chatId = ctx.myChatMember.chat.id;
    const chatTitle = ctx.myChatMember.chat.title;
    const chatType = ctx.myChatMember.chat.type;

    if (newStatus === "administrator") {
      const newGroup = new Groups({
        isBotAdmin: true,
        groupId: chatId,
        groupTitle: chatTitle,
        groupType: chatType,
      });

      await newGroup.save();
      console.log(`Bot added as an admin to group ${chatTitle} (${chatId})`);
    } else if (newStatus === "left" || newStatus === "kicked") {
      await Groups.deleteOne({ groupId: chatId });
      console.log(`Bot removed from group ${chatTitle} (${chatId})`);
    }
    let admins;
    try {
      admins = await ctx.getChatAdministrators();
    } catch (err) {
      console.error(`Failed to fetch administrators for group ${chatId}, looks like admin left the group or the group was deleted`);
      return;
    }
    
    for (const admin of admins) {
      const userId = admin.user.id;
      if (admin.user.is_bot) {
        console.log(`Skipping bot ${userId} in group ${chatId}.`);
        continue; 
      }
      const existingUser = await Users.findOne({ groupId: chatId, telegramUserId: userId });
      if (existingUser) {
        await Users.updateOne(
          { groupId: chatId, telegramUserId: userId },
          { $set: { isAdmin: true } }
        );
      } else {
        const newUser = new Users({
          groupId: chatId,
          telegramFirstName: admin.user.first_name,
          telegramLastName: admin.user.last_name || "",
          telegramUserName: admin.user.username || "",
          telegramUserId: userId,
          isAdmin: true,
          verified: true,
          chatId: chatId,
          joinTime: Math.floor(Date.now() / 1000),
          userAddedAfterBot: true
        });
        await newUser.save();
      }
      console.log(`User ${userId} is an admin in group ${chatId}.`);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function groupMemberUpdates(ctx) {
  try {
    if (ctx.message && ctx.message.new_chat_members) {
      const chatId = ctx.chat.id;
      const newMembers = ctx.message.new_chat_members;
      const groupData = await Groups.findOne({ groupId: chatId, isBotAdmin: true });
      if (!groupData) {
        console.log("Bot is not an admin in this group.");
        return;
      }
      for (const member of newMembers) {
        if (!member.is_bot) {
          const newUser = new Users({
            groupId: chatId,
            groupObjectId: groupData._id,
            telegramFirstName: member.first_name,
            telegramLastName: member.last_name || "",
            telegramUserName: member.username || "",
            telegramUserId: member.id,
            verified: false,
            chatId: chatId,
            joinTime: Math.floor(Date.now() / 1000),
            userAddedAfterBot: true
          });
          await newUser.save();
          console.log(`User ${member.first_name} (${member.id}) joined group ${groupData.groupTitle} (${chatId})`);
        }
      }
    }
    if (ctx.message && ctx.message.left_chat_member) {
      const chatId = ctx.chat.id;
      const userId = ctx.message.left_chat_member.id;
      await Users.deleteOne({ groupId: chatId, telegramUserId: userId });
      console.log(`User ${userId} has left or been kicked from group ${chatId}. User data deleted.`);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

async function userStatusChange(ctx) {
  try {
    const chatId = ctx.chat.id
    const userId = ctx.chatMember.new_chat_member.user.id; 
    const newStatus = ctx.chatMember.new_chat_member.status;
    const groupData = await Groups.findOne({ groupId: chatId, isBotAdmin: true });
    if (!groupData) {
      console.log("Bot is not an admin in this group.");
      return;
    }
    if (newStatus === 'administrator') {
      await Users.updateOne(
        { groupId: chatId, telegramUserId: userId },
        { $set: { isAdmin: true } },
      );
      console.log(`User ${userId} has been promoted to admin in group ${groupData.groupTitle} (${chatId}). isAdmin field updated.`);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

module.exports = { botListener, groupMemberUpdates, userStatusChange };


// const { Bot } = require('grammy');
// const config = require('../common/config/config');
// const logger = require('../common/utils/logger');
// const userService = require('../api/user/service/user.service');

// const bot = new Bot(config.botToken);
// logger.info("Bot is running");

// const adminTelegramId = '659928723'; // Your admin Telegram ID
// const paymentLink = 'https://buy.copperx.io/payment/payment-link/a3b4ab78-f872-43c2-a00b-678a5650d33a'; // Replace with your actual payment link

// // Function to check if user is admin
// const isAdmin = (userId) => userId === adminTelegramId;

// // Handle /start command
// bot.command('start', async (ctx) => {
//   const telegramId = ctx.from.id.toString();
//   const username = ctx.from.first_name || 'Anonymous';

//   try {
//     const user = await userService.getUserByTelegramId(telegramId);
//     if (!user) {
//       // New user, create and set default status to inactive
//       const newUser = await userService.createUser({ telegramId, username, subscriptionStatus: 'inactive' });
//       await ctx.reply(`Please subscribe to interact in groups: ${paymentLink}`);
//       logger.info(`New user added: ${username} with default inactive status.`);
//     } else if (user.subscriptionStatus !== 'active') {
//       // Existing user with inactive subscription
//       await ctx.reply(`You are not subscribed. Please use the following link to subscribe: ${paymentLink}`);
//     } else {
//       // Subscribed user
//       await ctx.reply('Welcome back! You are already subscribed.');
//     }
//   } catch (error) {
//     logger.error(`Error in /start command: ${error}`);
//     await ctx.reply('There was an error processing your request.');
//   }
// });

// bot.on('message', async(ctx) => {
//   console.log(ctx.chat.type)
//   console.log(ctx.update.my_chat_member)
// })

// // Handle new chat member events
// bot.on('chat_member', async (ctx) => {
//   console.log(ctx.chat.type)
//   const newMember = ctx.update.my_chat_member.new_chat_member;
//   const userId = newMember.user.id.toString();
//   const username = newMember.user.first_name || 'Unknown User';

//   if (isAdmin(userId)) {
//     logger.info("Admin activity detected, no restrictions applied.");
//     return; // Don't restrict admins
//   }

//   if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
//     try {
//       const user = await userService.getUserByTelegramId(userId);

//       // Restrict user by default
//       await bot.api.restrictChatMember(ctx.chat.id, userId, {
//         permissions: {
//           can_send_messages: false,
//           can_send_media_messages: false,
//           can_send_other_messages: false,
//           can_add_web_page_previews: false,
//         },
//       });

//       if (!user) {
//         // New user, create and set default status to inactive
//         const newUser = await userService.createUser({ telegramId: userId, username, subscriptionStatus: 'inactive' });
//         logger.info(`New user added: ${username} with default inactive status.`);
//       }

//       const subscriptionStatus = await userService.checkSubscriptionStatus(userId);
//       if (subscriptionStatus !== 'active') {
//         // User is not subscribed, send payment link in private chat
//         await ctx.replyWithChatAction(userId, 'typing'); // Show typing indicator
//         await bot.api.sendMessage(userId, `You need to subscribe to participate in this group. Subscribe here: ${paymentLink}`);
//       } else {
//         // User is subscribed, remove restrictions
//         await bot.api.restrictChatMember(ctx.chat.id, userId, {
//           permissions: {
//             can_send_messages: true,
//             can_send_media_messages: true,
//             can_send_other_messages: true,
//             can_add_web_page_previews: true,
//           },
//         });
//       }
//     } catch (error) {
//       logger.error(`Error managing new group member: ${error}`);
//     }
//   }
// });

