function configured(){
  return !!(process.env.RADAR_STORE_URL && process.env.RADAR_STORE_SECRET);
}
async function callStore(action,payload={}){
  if(!configured()) throw new Error("RADAR_STORE_NOT_CONFIGURED");
  const r=await fetch(process.env.RADAR_STORE_URL,{
    method:"POST",
    headers:{
      "content-type":"application/json",
      "x-radar-secret":process.env.RADAR_STORE_SECRET
    },
    body:JSON.stringify({action,...payload}),
    signal:AbortSignal.timeout(25000)
  });
  const text=await r.text();
  if(!r.ok) throw new Error("RADAR_STORE_"+r.status+":"+text.slice(0,500));
  return text?JSON.parse(text):{};
}
async function persistIdeas(ideas=[]){
  if(!configured()) return {configured:false,persisted:0};
  return await callStore("persistIdeas",{ideas});
}
async function getThreads(limit=50){
  if(!configured()) return [];
  const r=await callStore("getThreads",{limit});
  return r.threads||[];
}
async function addFeedback({threadId=null,observationId=null,type}){
  if(!configured()) return {configured:false,stored:false};
  return await callStore("feedback",{threadId,observationId,type});
}
module.exports={configured,persistIdeas,getThreads,addFeedback,callStore};
