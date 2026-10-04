const sections = ['today', 'threads', 'deepdive', 'weekly', 'sources', 'preferences'];
async function init(){
 const html = await Promise.all(sections.map(async id => (await fetch(id+'.html')).text()));
 document.getElementById('views').innerHTML = html.join('\n');
 bindNav();
}
function bindNav(){document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));}
function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id).classList.add('active');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));window.scrollTo(0,0)}
function feedback(btn,type){btn.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');btn.textContent=type==='useful'?'✓ Useful recorded':'✓ Suppressed';}
function goDeepDive(){showView('deepdive')}
init();