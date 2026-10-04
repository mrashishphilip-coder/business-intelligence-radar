const crypto=require("crypto");
function cfg(){
  const url=process.env.SUPABASE_URL;
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url&&key?{url:url.replace(/\/$/,""),key}:null;
}
async function sb(path,opts={}){
  const c=cfg(); if(!c) throw new Error("SUPABASE_NOT_CONFIGURED");
  const r=await fetch(c.url+"/rest/v1/"+path,{
    ...opts,
    headers:{
      apikey:c.key,
      Authorization:"Bearer "+c.key,
      "Content-Type":"application/json",
      Prefer:opts.prefer||"return=representation",
      ...(opts.headers||{})
    }
  });
  const txt=await r.text();
  if(!r.ok) throw new Error("SUPABASE_"+r.status+":"+txt.slice(0,500));
  return txt?JSON.parse(txt):null;
}
function configured(){return !!cfg()}
async function embed(text){
  const key=process.env.OPENAI_API_KEY;
  if(!key) return null;
  const r=await fetch("https://api.openai.com/v1/embeddings",{
    method:"POST",
    headers:{Authorization:"Bearer "+key,"Content-Type":"application/json"},
    body:JSON.stringify({model:process.env.RADAR_EMBED_MODEL||"text-embedding-3-small",input:text.slice(0,8000)})
  });
  if(!r.ok) return null;
  const j=await r.json();
  return j.data?.[0]?.embedding||null;
}
async function candidates(thesis){
  const v=await embed(thesis);
  if(v){
    try{return {method:"vector",embedding:v,rows:await sb("rpc/match_idea_threads",{method:"POST",body:JSON.stringify({query_embedding:v,match_threshold:.72,match_count:5})})||[]}}catch{}
  }
  const rows=await sb("rpc/match_idea_threads_text",{method:"POST",body:JSON.stringify({query_text:thesis,match_threshold:.18,match_count:5})})||[];
  return {method:"lexical",embedding:v,rows};
}
async function upsertSources(srcs=[]){
  if(!srcs.length)return;
  const body=srcs.map(s=>({id:s.id,source:s.source,title:s.title,url:s.link||null,transcript_url:s.transcriptUrl||null,published_at:s.publishedAt||null,content_type:s.contentType||null,metadata:{}}));
  await sb("source_episodes?on_conflict=id",{method:"POST",body:JSON.stringify(body),prefer:"resolution=merge-duplicates,return=minimal"});
}
async function createThread(idea,embedding){
  const rows=await sb("idea_threads",{method:"POST",body:JSON.stringify([{canonical_thesis:idea.title,category:idea.category||"Other",current_confidence:idea.scores?.confidence||5,current_evidence:idea.scores?.evidence||5,embedding,metadata:{thread_key:idea.threadKey||null}}])});
  return rows?.[0];
}
async function updateThread(id,idea,embedding){
  const body={canonical_thesis:idea.title,category:idea.category||"Other",current_confidence:idea.scores?.confidence||5,current_evidence:idea.scores?.evidence||5,last_seen_at:new Date().toISOString(),last_material_update_at:new Date().toISOString(),embedding};
  const rows=await sb("idea_threads?id=eq."+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify(body)});
  return rows?.[0];
}
async function addObservation(threadId,idea){
  const srcIds=(idea.sources||[]).map(s=>s.id);
  const observationKey=crypto.createHash('sha256').update(threadId+'|'+idea.title+'|'+srcIds.slice().sort().join(',')).digest('hex');
  const stance=idea.disagreement?"challenges":"supports";
  const obsEmbedding=await embed(idea.title+"\n"+(idea.why||""));
  const rows=await sb("thread_observations?on_conflict=observation_key",{method:"POST",prefer:"resolution=ignore-duplicates,return=representation",body:JSON.stringify([{observation_key:observationKey,thread_id:threadId,claim:idea.title,synthesis:idea.why||null,stance,confidence:idea.scores?.confidence||null,evidence_score:idea.scores?.evidence||null,novelty_score:idea.scores?.novelty||null,relevance_score:idea.scores?.relevance||null,source_episode_ids:srcIds,contradiction_flag:!!idea.disagreement,embedding:obsEmbedding,metadata:{consensus:idea.consensus||"",disagreement:idea.disagreement||""}}])});
  await sb("idea_threads?id=eq."+encodeURIComponent(threadId),{method:"PATCH",body:JSON.stringify({last_seen_at:new Date().toISOString()})});
  return rows?.[0];
}
async function persistIdeas(ideas=[]){
  if(!configured()) return {configured:false,persisted:0};
  let persisted=0;
  for(const idea of ideas){
    await upsertSources(idea.sources||[]);
    const c=await candidates(idea.title+"\n"+(idea.why||""));
    const best=c.rows?.[0];
    let thread;
    if(best && Number(best.similarity)>= (c.method==="vector"?.72:.30)) thread=await updateThread(best.id,idea,c.embedding);
    else thread=await createThread(idea,c.embedding);
    if(thread?.id){await addObservation(thread.id,idea); idea.threadId=thread.id; idea.threadMatch={method:c.method,similarity:best?Number(best.similarity):null}; persisted++;}
  }
  return {configured:true,persisted};
}
async function getThreads(limit=50){
  if(!configured()) return [];
  const threads=await sb("idea_threads?select=*&order=last_seen_at.desc&limit="+Math.min(limit,100))||[];
  for(const t of threads){
    t.observations=await sb("thread_observations?thread_id=eq."+encodeURIComponent(t.id)+"&select=*&order=observed_at.desc&limit=20")||[];
  }
  return threads;
}
module.exports={configured,persistIdeas,getThreads};
