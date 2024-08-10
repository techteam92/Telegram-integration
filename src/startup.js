const indexFunction = require("./index");
const { getSecretVar } = require("./common/utils/secret-manager");
const constant = require("./common/config/constant");

const startup = async () => {
    // console.log( 'Initializing Secrets...' ,process.env.NODE_ENV);
    if(!process.env.NODE_ENV || process.env.NODE_ENV == constant.PROD_DEV_ENV){
    await getSecretVar();
    console.log("Secrets Initialized done")
    };
    indexFunction()

}

startup()
