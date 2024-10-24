const axios = require('axios');
const Signal = require('../models/signal.model');

const fetchSignalData = async () => {
  try {
    const response = await axios.get('http://145.223.120.95:8000/get-signal-data/GBPUSD/minute/30');
    const { status, signal } = response.data;
    console.log(response.data);
    if (status === 'Success') {
      const signalData = signal[0]; 
      if (signalData.buy || signalData.sell) {
        const newSignal = new Signal({
          symbol: signalData.symbol,
          interval: 'minute',
          period: 10,
          buy: signalData.buy,
          sell: signalData.sell,
          pivlow: signalData.pivlow,
          pivhigh: signalData.pivhigh,
          tp_lg: signalData.tp_lg,
          tp_sh: signalData.tp_sh,
          timestamp: signalData.timestamp,
          strategyName: response.data["strategy-name"],
          strategyDescription: response.data["strategy-name"],
        });
        await newSignal.save();
        return newSignal;
      } else {
        return null; 
      }
    }
  } catch (error) {
    console.error('Error fetching signal data:', error);
    return null;
  }
};

module.exports = fetchSignalData;
