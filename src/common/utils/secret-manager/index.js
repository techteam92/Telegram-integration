const AWS = require('aws-sdk');

// Initialize AWS SDK with your preferred configuration
AWS.config.update({
  region: "ap-southeast-1"
});

const secretId = "dlicom-env"
const secretsManager = new AWS.SecretsManager();

let cachedSecrets = {};

function getSecretVar() {
  return new Promise((res,rej)=>{
      try {

      secretsManager.getSecretValue({ SecretId: secretId },((err,data)=> {
        if(err){
          throw err
        }

        let secret = JSON.parse(data.SecretString);
        for (const key in secret) {
          process.env[key] = secret[key];
        }
        res(secret) ;
      }))
    } catch (error) {
      console.error('Error initializing secrets:', error);
      // throw error;
      rej(error)
    }
    })
    
}
// async function initializeSecrets() {
//   try {
//     const data = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
//     const secret = JSON.parse(data.SecretString);
//     console.log("secret", secret)
//     // secret.DB_STRING = "mongodb://localhost:27017/aum-gdc"
//     // secret.PORT = secret.port
//     // secret.NODE_ENV = "Prod"
//     cachedSecrets = secret;
//   } catch (error) {
//     console.error('Error initializing secrets:', error);
//     throw error;
//   }
// }



// function getSecret(secretName) {

//   if (!cachedSecrets[secretName]) {
//     throw new Error(`Secret ${secretName} not initialized.`);
//   }
//   return cachedSecrets[secretName];
// }

module.exports = { getSecretVar };