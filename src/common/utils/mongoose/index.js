const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types;

module.exports.createObjectId = (id) =>{
    let objId;
    if(id && id != ""){
        if(!ObjectId.isValid(id)){
            throw new Error("Given id is not valid")
        }
        if(id instanceof ObjectId)
            objId= id 
        else
            objId=  ObjectId.createFromHexString(id)
    }else{
        objId =  new ObjectId()
    }
    return objId;
}

module.exports.isValidObjectId = (id) =>{
    return ObjectId.isValid(id) ? true : false;
}

module.exports.mongoSession = async () => {
    const session = await mongoose.startSession();
    return session;
}