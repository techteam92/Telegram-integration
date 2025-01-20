const Platform = require("../api/user/model/platform.model");
const { refreshPlatformAccessToken } = require("../api/user/service/user.service");
const cron = require('node-cron');

const scheduleTokenRefreshJob = () => {
    cron.schedule('*/29 * * * *', async () => {
      try {
        console.log("starting token refresh job");
        const platforms = await Platform.find({ tokenExpiry: { $lte: new Date(Date.now() + 60 * 1000) } });
        for (const platform of platforms) {
          try {
            const { userId, platformName } = platform;
            await refreshPlatformAccessToken(userId, platformName);
          } catch (error) {
            console.error(`Error refreshing token for platform: ${platform.platformName}: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching platforms for token refresh: ${error.message}`);
      }
    });
    console.log('Token refresh job scheduled to run every 29 minutes.');
  };
  
  module.exports = { scheduleTokenRefreshJob };
  