const dotenv = require('dotenv');

dotenv.config();

const config = {
  get env() {
    return process.env.NODE_ENV;
  },
  get port() {
    return process.env.PORT;
  },
  get url() {
    return process.env.URL;
  },
  get hashRound() {
    return process.env.HASH_ROUNDS;
  },
  get copperxApikey() {
    return process.env.COPPERXAPIKEY
  }
  ,
  get botToken() {
    return process.env.BOT_TOKEN
  },
  nodeMailer: {
  get email() {
    return process.env.EMAIL;
  },
  get pass() {
    return process.env.PASS;
  }
 },
  ssl: {
    get privKey() {
      return process.env.SSL_PRIV_KEY;
    },
    get fullChainKey() {
      return process.env.SSL_FULLCHAIN_KEY;
    }
  },
  s3: {
    get AWS_ACCESS_KEY_ID () {
      return process.env.AWS_ACCESS_KEY_ID
    },
    get AWS_SECRET_ACCESS_KEY () {
      return process.env.AWS_SECRET_ACCESS_KEY
    },
  },
  mongoose: {
    get DB_NAME() {
      return process.env.DB_NAME;
    },
    get DB_PORT() {
      return process.env.DB_PORT;
    },
    get DB_SERVER() {
      return process.env.DB_SERVER;
    },
    get DB_USER() {
      return process.env.DB_USER;
    },
    get DB_PASS() {
      return process.env.DB_PASS;
    },
    get url() {
      return process.env.MONGODB_URL + (process.env.NODE_ENV === 'test' ? '-test' : '');
    },
  },
  jwt: {
    get secret() {
      return process.env.JWT_SECRET;
    },
    get refreshSecret() {
      return process.env.JWT_REFRESH_SECRET;
    },
    get accessExpirationMinutes() {
      return process.env.JWT_ACCESS_EXPIRATION_MINUTES;
    },
    get refreshExpirationDays() {
      return process.env.JWT_REFRESH_EXPIRATION_DAYS;
    },
    get resetPasswordExpirationMinutes() {
      return process.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES;
    },
    get verifyEmailExpirationMinutes() {
      return process.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES;
    }
  },
  get aesEncryptDcryptKey() {
    return process.env.ENCRYPTION_KEY
  },
  s3: {
    get AWS_S3_KEY() {
      return process.env.AWS_S3_KEY;
    },
    get AWS_S3_REGION() {
      return process.env.AWS_S3_REGION;
    },
    get AWS_S3_SECRET() {
      return process.env.AWS_S3_SECRET;
    }
  },
  collections: {
    get users() {
      return "users";
    },
    get token() {
      return "tokens";
    },
    get interests() {
      return "interests"
    },
    get plugs() {
      return "communities";
    },
    get reactions() {
      return "reactions";
    },
    get notification() {
      return "notification";
    },
    get admin() {
      return "admins";
    },
    get profile() {
      return "profiles";
    },
    get verification() {
      return 'verifications';
    },
    get notification() {
      return "notifications";
    },
    get callLogs() {
      return "calllogs";
    },
  },
};

module.exports = config
