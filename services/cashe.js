const mongoose=require("mongoose");
const util=require("util")
const redis=require("redis");

    const redisURL="redis://127.0.0.1:6379";
    const client=redis.createClient(redisURL);
    client.hget = util.promisify(client.hget)
// unmodified exec
const exec=mongoose.Query.prototype.exec;
// modifed exec


// mongoose cache unique
mongoose.Query.prototype.cache=function(option={}){
    this.useCache=true;
    this.hashKEY=JSON.stringify(option.key||"default");
    // to unable chain
    return this
}

mongoose.Query.prototype.exec=async function(){
    if(!this.useCache){
        // not true means not using
        // returning the original exec
        const result= await exec.apply(this,arguments);   
        console.log("yo");
        return result;
    }
    
    console.log("query custom");   
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);
    // so that we dont overwrite .this makes the new object combination of getQUERY AND MONGOOSEcoNNECTION.NAME
 const key=  JSON.stringify( Object.assign({},this.getQuery(),{collectionName:this.mongooseCollection.name}));
 const cachValue= await client.hget(this.hashKEY,key);
 if(cachValue){
     console.log(cachValue);
     console.log("result from redis");
     // note cache wants us to return mongoose model document not pain js (this is called hydrating of model)
    // const  doc=new this.model(JSON.parse(cachValue))
    // // note if the casheavlue is array then (hydrating of array)
    //  return doc
    // real code 
    const doc =JSON.parse(cachValue);
    return Array.isArray(doc)
            ?doc.map(ad=>new this.model(ad))
            :new this.model(doc)
        }
 
    const result= await exec.apply(this,arguments);
    // the result value is not json or any oject it is the monoogse instance 
    // so exec return mongoose model
    // console.log(result);
    client.hset(this.hashKEY,key,JSON.stringify(result));
    console.log("result from mongoose");
    return result   
}
module.exports={
    clearCache(id){
        client.del(JSON.stringify(id))
    }
}