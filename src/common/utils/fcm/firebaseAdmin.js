const fireBaseAdmin = require('firebase-admin');
const serviceAccount = require('../../../../solo-connekt-firebase-adminsdk-l5eru-a3c4a38862.json');

let firebase = '';
const admin = () => {
    if (firebase) {
        return firebase;
    } else {
        firebase = fireBaseAdmin.initializeApp({
            credential: fireBaseAdmin.credential.cert(serviceAccount)
        });
        return firebase;
    }
}

module.exports = admin;
