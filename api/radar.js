const FEEDS=[
 {name:"Acquired",url:"https://acquired.libsyn.com/rss",weight:1.0},
 {name:"Lenny's Podcast",url:"https://api.substack.com/feed/podcast/10845.rss",weight:1.0},
 {name:"The a16z Show",url:"https://feeds.simplecast.com/JGE3yC0V",weight:0.96},
 {name:"Invest Like the Best",url:"https://investlikethebest.libsyn.com/rss",weight:0.94}
];

const TOPICS=[
 {name:"AI Products",terms:[" ai ","agent","llm","model","software","developer","coding","automation","workflow","product"]},
 {name:"Business Strategy",terms:["strategy","moat","business model","market","distribution","company","growth","pricing","platform"]},
 {name:"Investing",terms:["invest","capital","valuation","portfolio","returns","market","fund","equity"]},
 {name:"Fintech",terms:["fintech","lending","credit","bank","payments","wealth","financial","insurance"]},
 {name:"Operators",terms:["ceo","founder","operator","leadership","team","organization","execution"]}
];

function decode(s=""){return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#8217;/g,"’").replace(/&#8211;/g,"–");}
function text(s=""){return decode(s).replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim();}
function tag(block,names){for(const n of names){const m=block.match(new RegExp("<"+n+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+n+">","i"));if(m)return text(m[1]);}return "";}
function attr(block,tagName,attrName){const m=block.match(new RegExp("<"+tagName+"[^>]*"+attrName+"=[\"']([^\"']+)[\"'][^>]*>","i"));return m?decode(m[1]):"";}
function parseFeed(xml,source,sourceWeight){
 const chunks=[...(xml.match(/<item[\s\S]*?<\/item>/gi)||[]),...(xml.match(/<entry[\s\S]*?<\/entry>/gi)||[])];
 return chunks.slice(0,14).map((b,i)=>{
   const title=tag(b,["title"]);
   const description=tag(b,["content:encoded","description","summary","content"]);
   const link=tag(b,["link"])||attr(b,"link","href")||tag(b,["guid"]);
   const dateRaw=tag(b,["pubDate","published","updated"]);
   const audio=attr(b,"enclosure","url");
   return {id:source+"-"+i+"-"+title.slice(0,40),source,title,description,link,audio,publishedAt:dateRaw?new Date(dateRaw).toISOString():null,sourceWeight};
 }).filter(x=>x.title);
}
function daysOld(d){if(!d)return 30;return Math.max(0,(Date.now()-new Date(d).getTime())/86400000)}
function category(ep){const hay=(" "+ep.title+" "+ep.description+" ").toLowerCase();let best={name:"Business",n:0};for(const t of TOPICS){const n=t.terms.reduce((a,x)=>a+(hay.includes(x)?1:0),0);if(n>best.n)best={name:t.name,n};}return best.name}
function score(ep){
 const hay=(" "+ep.title+" "+ep.description+" ").toLowerCase();
 const interest=["ai","agent","strategy","business model","moat","pricing","capital","fintech","lending","credit","operator","product","workflow","distribution","market","founder"];
 const rel=interest.reduce((a,x)=>a+(hay.includes(x)?0.36:0),5.2);
 const rec=Math.max(0,2.1-daysOld(ep.publishedAt)/7);
 const depth=Math.min(1.4,ep.description.length/1200);
 return Math.min(9.9,rel+rec+depth+(ep.sourceWeight-.9)*3);
}
function sentenceSummary(s){const cleaned=text(s);const parts=cleaned.split(/(?<=[.!?])\s+/).filter(x=>x.length>45);return (parts.slice(0,2).join(" ")||cleaned).slice(0,420)}
function words(s){return new Set((s.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(x=>x.length>3))}
function sim(a,b){const A=words(a),B=words(b);if(!A.size||!B.size)return 0;let i=0;for(const x of A)if(B.has(x))i++;return i/Math.min(A.size,B.size)}
function buildIdeas(episodes){
 const sorted=episodes.map(e=>({...e,category:category(e),relevance:score(e)})).sort((a,b)=>b.relevance-a.relevance);
 const kept=[];let suppressed=0;
 for(const e of sorted){if(kept.some(k=>sim(k.title+" "+k.description,e.title+" "+e.description)>.62)){suppressed++;continue;} kept.push(e); if(kept.length>=6)break;}
 return {ideas:kept.map((e,i)=>{
   const age=daysOld(e.publishedAt);
   const novelty=Math.min(9.6,6.3+Math.max(0,2.1-age/14)+(e.title.length>55?.5:0));
   const evidence=Math.min(9.2,6.2+Math.min(2.1,e.description.length/600)+(e.sourceWeight-.9)*4);
   const confidence=Math.min(9.1,(novelty+evidence)/2-.25);
   return {rank:i+1,title:e.title,category:e.category,why:sentenceSummary(e.description),source:e.source,link:e.link,audio:e.audio,publishedAt:e.publishedAt,scores:{novelty:+novelty.toFixed(1),evidence:+evidence.toFixed(1),confidence:+confidence.toFixed(1),relevance:+e.relevance.toFixed(1)}};
 }),suppressed};
}
async function fetchFeed(f){
 const r=await fetch(f.url,{headers:{"User-Agent":"Business-Intelligence-Radar/1.0"},signal:AbortSignal.timeout(9000)});
 if(!r.ok)throw new Error(f.name+" "+r.status);return parseFeed(await r.text(),f.name,f.weight);
}
module.exports=async function handler(req,res){
 try{
   const settled=await Promise.allSettled(FEEDS.map(fetchFeed));
   const episodes=settled.flatMap(x=>x.status==="fulfilled"?x.value:[]);
   const failures=settled.map((x,i)=>x.status==="rejected"?FEEDS[i].name:null).filter(Boolean);
   const {ideas,suppressed}=buildIdeas(episodes);
   const sources=FEEDS.map(f=>({name:f.name,ok:!failures.includes(f.name),episodes:episodes.filter(e=>e.source===f.name).length}));
   res.setHeader("Cache-Control","s-maxage=1800, stale-while-revalidate=86400");
   res.status(200).json({generatedAt:new Date().toISOString(),mode:"live-rss",episodesScanned:episodes.length,ideasExtracted:episodes.length,cleared:ideas.length,suppressed,ideas,sources,failures});
 }catch(err){res.status(500).json({error:"Radar refresh failed",detail:String(err&&err.message||err)});}
}