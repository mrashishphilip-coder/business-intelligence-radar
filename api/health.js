module.exports=async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.status(200).json({
    ok:true,
    service:"business-intelligence-radar",
    pipeline:"rss-discovery-ranking",
    timestamp:new Date().toISOString()
  });
}