const {configured}=require("../lib/thread-store");
module.exports=async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"METHOD_NOT_ALLOWED"});
  if(!configured()) return res.status(200).json({configured:false,stored:false});
  try{
    const url=process.env.SUPABASE_URL.replace(/\/$/,"");
    const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
    const body=typeof req.body==="string"?JSON.parse(req.body||"{}"):(req.body||{});
    const payload={thread_id:body.threadId||null,observation_id:body.observationId||null,feedback_type:body.type,metadata:{client:"web"}};
    const r=await fetch(url+"/rest/v1/feedback_events",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify(payload)});
    if(!r.ok) throw new Error(await r.text());
    res.status(200).json({configured:true,stored:true});
  }catch(err){res.status(500).json({error:"FEEDBACK_STORE_FAILED",detail:String(err.message||err)})}
};