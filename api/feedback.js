const {configured,addFeedback}=require("../lib/thread-store");
module.exports=async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"METHOD_NOT_ALLOWED"});
  if(!configured()) return res.status(200).json({configured:false,stored:false});
  try{
    const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
    const result=await addFeedback({
      threadId:body.threadId||null,
      observationId:body.observationId||null,
      type:body.type
    });
    res.status(200).json({configured:true,...result});
  }catch(err){res.status(500).json({error:"FEEDBACK_STORE_FAILED",detail:String(err.message||err)})}
};