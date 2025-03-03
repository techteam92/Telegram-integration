const axios = require('axios');
const { response } = require('express');
const { isFreightContainerID } = require('validator');
const { Console } = require('winston/lib/winston/transports');
const { error } = require('../../common/utils/logger');
const { string } = require('joi');
const companyName = "OxSecurities-Demo";
const accountNumber = "1090027737";
const password = "alp6ghs";
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let mtToken =new string;
const serverType = companyName.split("-")[0];
let hostArray = new Array();
const IP_Server = `http://78.46.76.71:5394/Search?company=${serverType}`;


const metaTrader1 = async () => {
    try {
        const response = await axios.get(IP_Server, {
            headers: {
                'Accept': 'text/json'
            }
        });
        let Data = response.data[0];
        const count = Data.results.length;
        for (i = 0; i < count; i++) {
            if (companyName == Data.results[i].name) {
                hostArray = Data.results[i].access;
                await logInFunction();
                console.log("Final mtToken:", mtToken);
            }
        }
        Response_Data = response.data[0];
    } catch (error) {
        console.log(error);
    }
}

const logInFunction = async () => {
    console.log("--here is login function");
    for (let i = 0; i < hostArray.length; i++) {
      let logInAddress = `http://78.46.76.71:5394/Connect?user=${accountNumber}&password=${password}&host=${hostArray[i]}&port=443`;
      try {
        const response = await axios.get(logInAddress, {
          headers: {
            'Accept': 'text/json'
          }
        });
        const token = response.data;
        if (uuidRegex.test(token)) {
          mtToken = token;
          console.log("mtToken is a valid UUID:", mtToken);
          return mtToken; // Return the valid token and exit the function
        } else {
          console.log("mtToken is not a valid UUID:", token);
        }
      } catch (error) {
        console.log(error);
      }
    }
    throw new Error("No valid UUID token found");
  };
module.exports = metaTrader1;
