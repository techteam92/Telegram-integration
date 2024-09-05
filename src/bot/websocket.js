const WebSocket = require('ws');

const wsUrl = 'wss://marketdata.tradermade.com/feedadv';
const userKey = 'wsUsvX6kOHnYFOxLoEIw';
const symbols = ['GBPUSD', 'EURUSD'];
let latestPriceData = {};

const connect = () => {
    const ws = new WebSocket(wsUrl);

    ws.on('open', function open() {
        console.log('Connected to WebSocket');
        symbols.forEach(symbol => {
            ws.send(JSON.stringify({ userKey, symbol }));
        });
    });

    ws.on('close', function() {
        console.log('Socket closed. Reconnecting...');
        setTimeout(connect, 10000);
    });

    ws.on('message', function incoming(data) {
        let message = data.toString('utf8');
        try {
            let jsonMessage = JSON.parse(message);
            console.log('Received JSON:', jsonMessage);
            latestPriceData[jsonMessage.symbol] = jsonMessage;
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });

    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
    });
};

// Function to get the latest price data
const getLatestPriceData = () => {
    return latestPriceData;
};

module.exports = { connect, getLatestPriceData };
