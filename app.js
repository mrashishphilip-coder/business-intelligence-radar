const sections = ['today', 'threads', 'deepdive', 'weekly', 'sources', 'preferences'];
async function init(){
 const html = await Promise.all(sections.map(async id => (await fetch(id+'.html')).text()));
 document.getElementById('views').innerHTML = html.join('\n');
 bindNav(); restoreFeedback(); loadLiveRadar();
}
function bindNav(){document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));}
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));window.scrollTo(0,0)}
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function feedback(btn,type,id){btn.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');btn.textContent=type==='useful'?'✓ Useful recorded':'✓ Suppressed';if(id){localStorage.setItem('bir:'+id,type)}}
function restoreFeedback(){}
function goDeepDive(){showView('deepdive')}
function fmtDate(d){try{return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(d))}catch{return ''}}
function ideaCard(x){
 const id=btoa(unescape(encodeURIComponent((x.source||'')+'|'+(x.title||'')))).slice(0,24);
 const saved=localStorage.getItem('bir:'+id);
 return '<article class="card insight"><div class="rank">#'+x.rank+' · '+esc((x.category||'BUSINESS').toUpperCase())+'</div>'+(x.rank===1?'<span class="tag">Live signal</span>':'')+'<h3>'+esc(x.title)+'</h3><p class="why">'+esc(x.why||'Fresh episode detected. Open the source for full context.')+'</p><div class="scores"><span class="score"><b>Novelty</b> '+x.scores.novelty+'</span><span class="score"><b>Evidence</b> '+x.scores.evidence+'</span><span class="score"><b>Confidence</b> '+x.scores.confidence+'</span><span class="score"><b>Relevance</b> '+x.scores.relevance+'</span></div><div class="sources">Source: '+esc(x.source)+' · '+esc(fmtDate(x.publishedAt))+(x.link?' · <a href="'+esc(x.link)+'" target="_blank" rel="noopener">Open episode ↗</a>':'')+'</div><div class="actions"><button '+(saved==='useful'?'class="selected"':'')+' onclick="feedback(this,\'useful\',\''+id+'\')">'+(saved==='useful'?'✓ Useful recorded':'👍 Useful')+'</button><button '+(saved==='skip'?'class="selected"':'')+' onclick="feedback(this,\'skip\',\''+id+'\')">'+(saved==='skip'?'✓ Suppressed':'👎 Not for me')+'</button>'+(x.link?'<a class="primary" href="'+esc(x.link)+'" target="_blank" rel="noopener" style="text-decoration:none">🔎 Explore source</a>':'')+'</div></article>';
}
async function loadLiveRadar(){
 const status=document.getElementById('live-status');
 try{
   const r=await fetch('/api/radar',{cache:'no-store'}); if(!r.ok) throw new Error('HTTP '+r.status);
   const d=await r.json();
   document.getElementById('live-date').textContent=fmtDate(d.generatedAt)+' · '+d.cleared+' live signals';
   document.getElementById('m-scanned').textContent=d.episodesScanned;
   document.getElementById('m-extracted').textContent=d.ideasExtracted;
   document.getElementById('m-cleared').textContent=d.cleared;
   document.getElementById('m-suppressed').textContent=d.suppressed;
   document.getElementById('live-ideas').innerHTML=d.ideas.map(ideaCard).join('')||'<div class="card pad">No high-signal items found right now.</div>';
   const top=d.ideas[0];
   document.getElementById('live-reco').innerHTML=top?'<div class="quote">'+esc(top.title)+'</div><div class="small" style="margin-top:10px">'+esc(top.source)+' · relevance '+top.scores.relevance+'/10</div>':'No recommendation yet.';
   document.getElementById('source-health').innerHTML=d.sources.map(s=>'<div class="mini"><h4>'+esc(s.name)+'</h4><p>'+(s.ok?'Live · '+s.episodes+' recent episodes parsed':'Feed unavailable on this refresh')+'</p></div>').join('');
   if(status)status.textContent='LIVE · refreshed '+new Date(d.generatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
 }catch(e){if(status)status.textContent='LIVE REFRESH FAILED · showing fallback sample';}
}
init();