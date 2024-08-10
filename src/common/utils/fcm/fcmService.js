const admin = require('./firebaseAdmin');
const { NOTIFICATION_Type } = require('./notifications');

async function sendPushNotification(token, data, userPreference) {
    if (!token || token.trim() === "") {
        console.log("Token not found. Notification cannot be sent.");
        return;
    }
    
    if(!userPreference.notifications){
        console.log("Notification disabale. Notification cannot be sent.");
        return;
    }
    if(data.type == "TOKEN_TRANSFER" && !userPreference.walletTransactions){
        console.log("Notification disabale. Notification cannot be sent.");
        return;
    }
    var message = {};
    message.token = token;
    message.notification = {
        title: data.title
    };

    // if(data.type == NOTIFICATION_Type.new_user_message ){
    //     if(userPreference.previewMessage)
    //         message.notification.body = data.message;
    // }else{
    //     message.notification.body = data.message;
    // }
    
    message.android = {
        notification: {
            sound: "default",
        },
    };
    message.apns = {
        payload: {
            aps: {
                sound: "default",
                contentAvailable: true,
            },
        },
    };
    message.data = data
    console.log("Message: ", message);
    try {
        admin()
            .messaging()
            .send(message)
            .then(async (response) => {
                console.log("response :", response);
            })
            .catch(async (error) => {
                console.log("Error sending message:", error);
            });
    } catch (Ex) {
        console.log("Error sending notifications: ", Ex);
    }
}

async function sendMultiplePushNotification(deviceTokens, data) {
    var message = {};
    message.tokens = deviceTokens;
    message.notification = {
        // title: data.title,
        body: data.message
    };
    message.android = {
        notification: {
            sound: "default"
        },
        "priority":"high",
    };
    message.apns = {
        payload: {
            aps: {
                sound: "default",
                contentAvailable: true
            }
        }
    }
    message.data = data;
    try {
        admin()
            .messaging()
            .sendEachForMulticast(message)
            .then(async (response) => {
                console.log("Successfully sent message:", JSON.stringify(response));
            })
            .catch(async (error) => {
                console.log("Error sending message:", JSON.stringify(error));
            });
    } catch (Ex) {
        console.log("Error sending notifications: ", Ex);
    }
}

module.exports = {
  sendPushNotification,
  sendMultiplePushNotification,
};