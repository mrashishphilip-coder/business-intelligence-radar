const {getThreads,configured}=require("../lib/thread-store");
module.exports=async function handler(req,res){
  try{
    if(!configured()) return res.status(200).json({configured:false,threads:[]});
    const threads=await getThreads(Number(req.query?.limit||50));
    res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({configured:true,threads});
  }catch(err){return res.status(500).json({error:"THREAD_STORE_FAILED",detail:String(err.message||err)})}
};