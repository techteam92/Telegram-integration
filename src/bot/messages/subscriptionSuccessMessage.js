const subscriptionSuccessMessage = (newExpiryDate) => {
  return `✅Subscription Confirmed! 
🎉Welcome to the SOLOTREND X Alerts community!

📅Your subscription is valid until: ${newExpiryDate}

Here's what happens next: 
📈You'll receive instant access to your signals. Notifications will be sent directly to this 
chat. 
🧑‍💻Support is available 24/7 for any questions. (Can we add a support sub-chat in the 
signals? Just one way communication for the client to send a request and I see the request 
only?) 
💬If you ever need to manage your subscription, type /manage_subscription. (In this 
menu lets make sure we include: Cancel subscription button, Pause Subscription button, 
Active Subscription button) 
Stay tuned for your first alert! 🚀`;
  
};

module.exports = subscriptionSuccessMessage;