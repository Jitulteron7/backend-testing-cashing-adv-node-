const {clearCache}=require("../services/cashe");
module.exports= async (req,res,next)=>{
    await next();
    clearCache(req.user.id);
}