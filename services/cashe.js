const mongoose=require("mongoose");
const util=require("util")
const redis=require("redis");

    const redisURL="redis://127.0.0.1:6379";
    const client=redis.createClient(redisURL);
    client.get = util.promisify(client.get)
// unmodified exec
const exec=mongoose.Query.prototype.exec;
// modifed exec
mongoose.Query.prototype.exec=async function(){
    
    console.log("query custom");   
    console.log(this.getQuery());
    console.log(this.mongooseCollection.name);
    // so that we dont overwrite .this makes the new object combination of getQUERY AND MONGOOSEcoNNECTION.NAME
 const key=  JSON.stringify( Object.assign({},this.getQuery(),{collectionName:this.mongooseCollection.name}));
 const cachValue= await client.get(key);
 if(cachValue){
     console.log(cachValue);
     console.log("result from redis");
     // note cache wants us to return mongoose model document not pain js (this is called hydrating of model)
    // const  doc=new this.model(JSON.parse(cachValue))
    // // note if the casheavlue is array then (hydrating of array)
    //  return doc
    // real code 
    const doc =JSON.parse(cashValue);
    return Array.isArray(doc)
            ?doc.map(ad=>new this.model(ad))
            :new this.model(doc)
 }
 
    const result= await exec.apply(this,arguments);
    // the result value is not json or any oject it is the monoogse instance 
    // so exec return mongoose model
    // console.log(result);
    client.set(key,JSON.stringify(result));
    console.log("result from mongoose");
    return result
 
    
}