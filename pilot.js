function pilotLooksEpisodeTitle(s=''){return /\||\b(ep\.?\s*\d+|episode|podcast|\[[^\]]+\])\b/i.test(String(s))}
function pilotDelta(obs=[]){
  if(!obs.length)return 'No observations yet.';
  const latest=obs[0],prev=obs[1];
  if(!prev)return 'New thread created from the latest evidence.';
  const parts=[],cd=Number(latest.confidence||0)-Number(prev.confidence||0),ed=Number(latest.evidence_score||0)-Number(prev.evidence_score||0);
  if(Math.abs(cd)>=.1)parts.push('Confidence '+(cd>0?'↑ ':'↓ ')+Math.abs(cd).toFixed(1));
  if(Math.abs(ed)>=.1)parts.push('Evidence '+(ed>0?'↑ ':'↓ ')+Math.abs(ed).toFixed(1));
  if(latest.contradiction_flag)parts.push('New disagreement detected');
  const n=(latest.source_episode_ids||[]).length;if(n)parts.push(n+' source'+(n===1?'':'s')+' in latest update');
  return parts.length?parts.join(' · '):'No material score change; the latest evidence reinforces the thread.';
}
function pilotSaveFeedback(id,type,reason=''){
  let all={};try{all=JSON.parse(localStorage.getItem('bir:pilot-feedback')||'{}')}catch{}
  all[id]={type,reason,at:new Date().toISOString()};
  localStorage.setItem('bir:pilot-feedback',JSON.stringify(all));
}
window.feedback=async function(btn,type,id){
  const actions=btn.closest('.actions');
  if(type==='skip'){
    const old=actions.parentElement.querySelector('.feedback-reasons');if(old){old.remove();return}
    const row=document.createElement('div');row.className='feedback-reasons';row.style.cssText='margin-top:10px;display:flex;gap:7px;flex-wrap:wrap';
    const reasons=[['already-knew','Already knew this'],['repetitive','Repetitive'],['not-relevant','Not relevant'],['weak-evidence','Weak evidence'],['too-generic','Too generic']];
    row.innerHTML='<span class="small" style="width:100%">Why not useful?</span>'+reasons.map(r=>'<button class="ghost" style="padding:6px 9px;font-size:11px" data-reason="'+r[0]+'">'+r[1]+'</button>').join('');
    row.querySelectorAll('button').forEach(b=>b.onclick=async()=>{actions.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');btn.textContent='✓ Suppressed';localStorage.setItem('bir:feedback:'+id,'skip');pilotSaveFeedback(id,'skip',b.dataset.reason);try{const idea=(radarData?.ideas||[]).find(x=>fid(x)===id);await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({threadId:idea?.threadId||null,type:'skip',reason:b.dataset.reason})})}catch{}row.innerHTML='<span class="small">✓ Reason recorded: '+esc(b.textContent)+'</span>'});
    actions.parentElement.appendChild(row);return;
  }
  actions.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');btn.textContent='✓ Useful recorded';localStorage.setItem('bir:feedback:'+id,'useful');pilotSaveFeedback(id,'useful','');
  try{const idea=(radarData?.ideas||[]).find(x=>fid(x)===id);await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({threadId:idea?.threadId||null,type:'useful'})})}catch{}
};
window.renderServerThreads=function(rows){
  const el=document.getElementById('live-threads');if(!el)return;
  const clean=(rows||[]).filter(t=>!pilotLooksEpisodeTitle(t.canonical_thesis));
  el.innerHTML=clean.length?clean.slice(0,12).map(t=>'<div class="card pad"><span class="pill">'+esc((t.category||'IDEA').toUpperCase())+'</span><h3>'+esc(t.canonical_thesis)+'</h3><div class="scores"><span class="score"><b>Confidence</b> '+Number(t.current_confidence||0).toFixed(1)+'</span><span class="score"><b>Evidence</b> '+Number(t.current_evidence||0).toFixed(1)+'</span><span class="score"><b>Observations</b> '+(t.observations?.length||0)+'</span></div><div class="deepbox"><h4>What changed today?</h4><p>'+esc(pilotDelta(t.observations||[]))+'</p></div>'+((t.observations||[]).slice(0,4).map(o=>'<div class="threadline"><b>'+fmtDate(o.observed_at)+'</b><span>'+esc(o.claim)+(o.contradiction_flag?' · contradiction flagged':'')+'</span></div>').join('')||'')+'</div>').join(''):'<div class="card pad">No thesis-level Idea Thread yet. New runs will create threads from synthesized business theses rather than episode titles.</div>';
};
window.renderThreads=function(threads){
  const el=document.getElementById('live-threads');if(!el)return;
  const arr=Object.values(threads||{}).filter(t=>!pilotLooksEpisodeTitle(t.title)).slice(0,12);
  el.innerHTML=arr.length?arr.map(t=>'<div class="card pad"><span class="pill">'+esc((t.category||'IDEA').toUpperCase())+'</span><h3>'+esc(t.title)+'</h3><div class="scores"><span class="score"><b>Confidence</b> '+(t.confidence||'—')+'</span><span class="score"><b>Observations</b> '+(t.history?.length||0)+'</span></div><div class="deepbox"><h4>What changed today?</h4><p>Latest evidence is being tracked in local fallback memory.</p></div></div>').join(''):'<div class="card pad">Idea Threads will appear once a synthesized thesis clears the quality bar.</div>';
};
const originalOpenDeepDive=window.openDeepDive;
window.openDeepDive=async function(rank){
  try{const x=radarData?.ideas?.find(i=>i.rank===rank);if(x){pilotSaveFeedback(fid(x),'deep_dive','');await fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({threadId:x.threadId||null,type:'deep_dive'})})}}catch{}
  return originalOpenDeepDive(rank);
};