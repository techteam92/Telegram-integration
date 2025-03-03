const http = require('http');
const { MongoClient } = require('mongodb');
const { port } = require('../src/common/config/config');

const url = 'mongodb://localhost:27017';
const dbName = 'solo-trend-bot';
const userInfo = 'users';
const JsonCollection = 'signals';

const PORT = 3000;


async function getJsonData() {
  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(JsonCollection);
    const data = await collection.find().toArray();
    await client.close();
    return data;
  } catch (error) {
    console.error('Error fetching JSON data:', error);
    return [];
  }
}

async function updateClickAction(data) {
  try {
    const client = new MongoClient(url);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(userInfo);
    
    const filter = { telegramId: data.telegramId };
    const update = { $set: { ClickAction: '' } };
    console.log("updateclickaction");

    const result = await collection.updateOne(filter, update);
    console.log('Updated document:', result);
    await client.close();
  } catch (error) {
    console.error('Error updating ClickAction:', error);
  }
}

const server = http.createServer(async (req, res) => {
    try {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          if (req.method === 'POST') {
            try {
              console.log("user requestment");
              const data = JSON.parse(body);
              const telegramId = data.telegramID; // Assuming telegramId is in the JSON
              
              // Connect to MongoDB and find the user
              const client = new MongoClient(url);
              await client.connect();
              const db = client.db(dbName);
              const collection = db.collection(userInfo);
  
              const filter = { telegramId: telegramId };
              const user = await collection.findOne(filter);
  
              if (user) {
                
                // Process the user data here

                let takeprofit = '';
                const jsonData = await getJsonData();
                console.log(jsonData[0].tp1,"------------------");

                switch (user.ClickAction) {
                  case "trade1":
                    takeprofit = jsonData[0].tp1;
                    break;
                  case "trade2":
                    takeprofit = jsonData[0].tp2;
                    break;
                  case "trade3":
                    takeprofit = jsonData[0].tp3;
                    break;
                  default:
                    {
                        console.log('No matching ClickAction found');
                        res.statusCode = 400;
                        res.end('Invalid ClickAction');
                        return;
                    }
                }
                console.log(user.ClickAction,"------------------");

                console.log(jsonData[0].side);
                const sendData = {
                  'stoploss': jsonData[0].sl,
                  'direction': jsonData[0].side,
                  'symbol': jsonData[0].symbol,
                  'timeframe': jsonData[0].currentTimeframe,
                  'takeprofit': takeprofit,
                };
  
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(sendData));
  
                // Update ClickAction in MongoDB before sending response
                await updateClickAction(user);
              } else {
                console.log('User not found');
                res.statusCode = 404;
                res.end('User not found');
              }
  
              await client.close();
            } catch (error) {
              console.error('Error parsing JSON:', error);
              res.statusCode = 400;
              res.end('Invalid JSON');
            }
          }
        } catch (error) {
          console.error('Error handling request:', error);
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    } catch (error) {
      console.error('Error handling request:', error);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  
server.listen(PORT, () => {
  console.log(`Server running at http://localhost/${PORT}`);
});
