const { Users } = require("../models/users");
const { Groups } = require("../models/groups");
const { getTokenSymbol } = require("./../controllers/userWallet")

async function handleOthersButton(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.reply("will come in next update stay tuned.");
}

async function handleAllGroupsButton(ctx) {
  try {
    await ctx.answerCallbackQuery();
    const telegramUserId = ctx.update.callback_query.from.id;
    const adminUsers = await Users.find({ telegramUserId, isAdmin: true });
    const groupButtons = [];
    for (const adminUser of adminUsers) {
      const group = await Groups.findOne({ groupId: adminUser.groupId });
      if (group) {
        groupButtons.push([
          {
            text: group.groupTitle,
            callback_data: `group_${group.groupId}`,
          },
        ]);
      }
    }
    if (groupButtons.length > 0) {
      await ctx.reply(
        "You chose 'All Groups'. Here are the groups you're an admin in:",
        {
          reply_markup: {
            inline_keyboard: groupButtons,
          },
        }
      );
    } else {
      await ctx.reply("You are not an admin in any groups.");
    }
  } catch (error) {
    console.error("Error in handleAllGroupsButton:", error);
  }
}

async function groupMenu(ctx) {
  const groupId = ctx.match[1];
  const group = await Groups.findOne({ groupId: Number(groupId) });

  if (group) {
    const inlineKeyboard = {
      inline_keyboard: [
        [{ text: "Group Info", callback_data: `getGroupInfo_${groupId}` }],
        [{ text: "Price Chart of Token", callback_data: `chart_${groupId}` }],
        [
          {
            text: "Modify Welcome Message",
            callback_data: `welcomeMessage_${groupId}`,
          },
          {
            text: "Wallet Link Settings",
            callback_data: `WalletLink_${groupId}`,
          },
        ],
        [
          {
            text: "Add/Update Social Media Link",
            callback_data: `socialMedia_${groupId}`,
          },
        ],
      ],
    };

    await ctx.reply("<b>Group Actions</b>", {
      reply_markup: inlineKeyboard,
      parse_mode: "html",
    });
  } else {
    await ctx.reply("Sorry, this group was not found.");
  }
  await ctx.answerCallbackQuery();
}

async function handleGetGroupInfo(ctx) {
  const groupId = ctx.match[1];
  try {
    const group = await Groups.findOne({ groupId: groupId });
    let res;

    if (group.contractAddress != undefined) {
      res = `<b>${group.groupTitle}</b>
<b>Token Info : </b>
  
    Chain : EVM
  
    Token Type: ERC20
  
    Token address: ${group.contractAddress}
  
<b>Social Media:</b>
  
    | <a href="${group.twitterLink}">Twitter</a> | <a href="${group.discordLink}">Discord</a> | <a href="${group.websiteLink}">Website</a> |`;
    } else {
      res = `<b>${group.groupTitle}</b>
<b>Social Media:</b>
      | <a href="${group.twitterLink}">Twitter</a> | <a href="${group.discordLink}">Discord</a> | <a href="${group.websiteLink}">Website</a> |`;
    }

    await ctx.reply(res, {
      parse_mode: "html",
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.log(error);
    await ctx.reply("An error occurred while fetching group info.");
  }
}

async function handlePriceChartOfToken(ctx) {
  const groupId = ctx.match[1];

  try {
    const group = await Groups.findOne({ groupId: groupId });

    if (!group.walletLink) {
      await ctx.reply("Wallet not configured");
    } else if (group.contractAddress) {
      const symbol = await getTokenSymbol(group.contractAddress)
      const data = await client.getMetadata({ symbol: symbol });
      let metadata = data.data;
      let coin = metadata[Object.keys(metadata)[0]];
      let name = coin.name;
      let id = coin.id;
      let s = coin.symbol;
      let details = coin.description;
      details = convertNumbersInString(details);
      let logo = coin.logo;

      let res = `<b>## Coin Details ##\n\nCoin Name: ${name}\nCoin Symbol: ${s}\nCoin Id: ${id}\nCoin Details: ${details}</b>`;

      await ctx.replyWithPhoto(
        { url: logo },
        { caption: res, parse_mode: "HTML" }
      );
    } else {
      await ctx.reply("<b>Coin Not Linked!!</b>", { parse_mode: "HTML" });
    }
  } catch (error) {
    console.log(error);
    await ctx.reply("An error occurred while fetching coin details.");
  }
}

async function handleModifyWelcomeMessage(ctx) {
  const groupId = ctx.match[1];
  try {
    const message = await ctx.reply(
      "Type the welcome message now. Use ##GROUP_NAME##, ##USER_NAME##, ##TOKEN_AMOUNT##, ##ASSET_NAME## for dynamic content."
    );
    await Groups.findOneAndUpdate(
      { groupId },
      { messageId: message.message_id }
    );
  } catch (err) {
    console.log(err);
    await ctx.reply("An error occurred.");
  }
}

async function handleWalletLinkSettings(ctx) {
  const groupId = ctx.match[1];

  try {
    await ctx.reply("<b>Wallet Link Options</b>", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Enable Wallet Link",
              callback_data: `EnableWalletLink_${groupId}`,
            },
            {
              text: "Disable Wallet Link",
              callback_data: `DisableWalletLink_${groupId}`,
            },
          ],
        ],
      },
      parse_mode: "html",
    });
  } catch (error) {
    console.log(error);
    await ctx.reply("An error occurred while setting Wallet Link.");
  }
}

async function handleEnableWalletLink(ctx) {
  const groupId = ctx.match[1];
  await Groups.findOneAndUpdate({ groupId }, { walletLink: true });
  await ctx.reply("<b>Please select Chain</b>", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "EVM(Ethereum)", callback_data: `EvmEthereum_${groupId}` }],
      ],
    },
    parse_mode: "HTML",
  });

}

async function handleDisableWalletLink(ctx) {
  const groupId = ctx.match[1];
  await Groups.findOneAndUpdate({ groupId }, { walletLink: false });
  await ctx.reply("Disabled Successfully");
}

async function handleEvmEthereum(ctx) {
  const groupId = ctx.match[1];
  await Groups.findOneAndUpdate(
    { groupId },
    { walletType: 1, walletName: "Ethereum" }
  );
  await ctx.reply("<b>Select Type</b>", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Token", callback_data: `SetToken_${groupId}_1` },
          { text: "NFT", callback_data: `SetToken_${groupId}_2` },
          { text: "None", callback_data: `SetToken_${groupId}_3` },
        ],
      ],
    },
    parse_mode: "HTML",
  });
}

async function handleSetToken(ctx) {
    const groupId = ctx.match[1];
    const walletType = ctx.match[2];
    let walletName;

    if (walletType === "1") walletName = "Token(ERC20)";
    else if (walletType === "2") walletName = "NFT";
    else if (walletType === "3") walletName = "None";

    await ctx.reply("Enter the contract address in reply to this message");

    // Set the session status to AWAITING_INPUT
    ctx.session.status = 'AWAITING_INPUT';
    ctx.session.groupId = groupId;  // Storing groupId for later use
    ctx.session.walletName = walletName;  // Storing walletName for later use
}

async function storeContractAddress(ctx, next) {
  if (ctx.session.status === 'AWAITING_INPUT') {
      const contractAddress = ctx.message.text;

      await Groups.findOneAndUpdate(
          { groupId: ctx.session.groupId },
          {
              tokenType: ctx.session.walletType,
              tokenTypeString: ctx.session.walletName,
              contractAddress: contractAddress
          }
      );
      ctx.session.status = 'IDLE';
      delete ctx.session.groupId;
      delete ctx.session.walletName;
      await ctx.reply('Contract address successfully saved!');
  } else {
      return next();
  }
}

async function handleAddUpdateSocialMediaLink(ctx) {
  const groupId = ctx.match[1];
  await ctx.reply('Which social media link would you like to add/update?', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Twitter', callback_data: `Twitter_${groupId}` }],
        [{ text: 'Discord', callback_data: `Discord_${groupId}` }],
        [{ text: 'Website', callback_data: `Website_${groupId}` }]
      ]
    }
  });
}

async function handleTwitterLink(ctx) {
  const groupId = ctx.match[1];
  await ctx.reply('Please provide the Twitter link in reply to this message.');

  ctx.session.status = 'AWAITING_TWITTER_LINK';
  ctx.session.groupId = groupId;
}

async function handleDiscordLink(ctx) {
  const groupId = ctx.match[1];
  await ctx.reply('Please provide the Discord link in reply to this message.');

  ctx.session.status = 'AWAITING_DISCORD_LINK';
  ctx.session.groupId = groupId;
}

async function handleWebsiteLink(ctx) {
  const groupId = ctx.match[1];
  await ctx.reply('Please provide the Website link in reply to this message.');

  ctx.session.status = 'AWAITING_WEBSITE_LINK';
  ctx.session.groupId = groupId;
}

async function storeLinks(ctx, next) {
  if (ctx.session.status !== 'IDLE' && ctx.message && ctx.message.text) {
    const groupId = ctx.session.groupId;
    const link = ctx.message.text;
    const twitterLinkRegex = /^https:\/\/twitter\.com\/[A-Za-z0-9_]{1,15}$/;
    const discordLinkRegex = /^https:\/\/discord\.gg\/[A-Za-z0-9]+$/;
    const websiteLinkRegex = /^(https?:\/\/)?([A-Za-z0-9-]+\.){1,2}[A-Za-z]{2,6}\/?([A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]+)*$/;

    switch (ctx.session.status) {
      case 'AWAITING_TWITTER_LINK':
        if (!twitterLinkRegex.test(link)) {
          await ctx.reply('Invalid Twitter link format. Please enter a valid Twitter profile link.');
          return;
        }
        await Groups.findOneAndUpdate({ groupId }, { twitterLink: link });
        ctx.session.status = 'IDLE';
        await ctx.reply('Twitter link successfully saved!');
        break;
      case 'AWAITING_DISCORD_LINK':
        if (!discordLinkRegex.test(link)) {
          await ctx.reply('Invalid Discord link format. Please enter a valid Discord invite link.');
          return;
        }
        await Groups.findOneAndUpdate({ groupId }, { discordLink: link });
        ctx.session.status = 'IDLE';
        await ctx.reply('Discord link successfully saved!');
        break;
      case 'AWAITING_WEBSITE_LINK':
        if (!websiteLinkRegex.test(link)) {
          await ctx.reply('Invalid website link format. Please enter a valid website URL.');
          return;
        }
        await Groups.findOneAndUpdate({ groupId }, { websiteLink: link });
        ctx.session.status = 'IDLE';
        await ctx.reply('Website link successfully saved!');
        break;
      default:
        return next();
    }
  } else {
    return next();
  }
}


// Helper Functions

function formatNumber(number) {
  if (number >= 1000000000) {
    return (number / 1000000000).toFixed(2) + " billion";
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(2) + " million";
  } else if (number >= 1000) {
    return (number / 1000).toFixed(2) + " thousand";
  } else {
    return number.toString();
  }
}

function convertNumbersInString(description) {
  const numberRegex = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/g;
  const matches = description.match(numberRegex);
  if (matches) {
    for (const match of matches) {
      const formatted = formatNumber(parseFloat(match.replace(/,/g, "")));
      description = description.replace(match, formatted);
    }
  }
  return description;
}

function inlineMenu(bot) {
  bot.callbackQuery("show_others", handleOthersButton);
  bot.callbackQuery("show_all_groups", handleAllGroupsButton);
  bot.callbackQuery(/^group_(-?\d+)$/, groupMenu);

  // menu
  bot.callbackQuery(/^getGroupInfo_(-?\d+)$/, handleGetGroupInfo);
  bot.callbackQuery(/^chart_(-?\d+)$/, handlePriceChartOfToken);
  bot.callbackQuery(/^welcomeMessage_(-?\d+)$/, handleModifyWelcomeMessage);
  bot.callbackQuery(/^WalletLink_(-?\d+)$/, handleWalletLinkSettings);
  bot.callbackQuery(/^socialMedia_(-?\d+)$/, handleAddUpdateSocialMediaLink);

  //chain settings
  bot.callbackQuery(/^EnableWalletLink_(-?\d+)$/, handleEnableWalletLink);
  bot.callbackQuery(/^DisableWalletLink_(-?\d+)$/, handleDisableWalletLink);
  bot.callbackQuery(/^EvmEthereum_(-?\d+)$/, handleEvmEthereum);
  bot.callbackQuery(/^SetToken_(-?\d+)_(\d+)$/, handleSetToken);

  // Links
  bot.callbackQuery(/^Twitter_(-?\d+)$/, handleTwitterLink);
  bot.callbackQuery(/^Discord_(-?\d+)$/, handleDiscordLink);
  bot.callbackQuery(/^Website_(-?\d+)$/, handleWebsiteLink);

  // Middleware to capture the user's message when the bot is expecting input
  bot.use(storeContractAddress);
  bot.use(storeLinks);
}


module.exports = { inlineMenu };