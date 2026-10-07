const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=__dirname, DATA=path.join(ROOT,'entry-data.json'), PORT=process.env.PORT||3000, ADMIN_KEY=process.env.ENTRY_ADMIN_KEY||'change-this-key';
let db={submissions:[]}; try{db=JSON.parse(fs.readFileSync(DATA,'utf8'))}catch{}
function persist(){fs.writeFileSync(DATA,JSON.stringify(db,null,2))}
function send(res,status,data,type='application/json'){res.writeHead(status,{'Content-Type':type,'Access-Control-Allow-Origin':'*'});res.end(type==='application/json'?JSON.stringify(data):data)}
function body(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>20*1024*1024)req.destroy()});req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}});req.on('error',reject)})}
function auth(req){return req.headers['x-admin-key']===ADMIN_KEY}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'};
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(req.method==='POST'&&u.pathname==='/api/submissions'){
  try{const x=await body(req); if(!x.type) return send(res,400,{error:'type required'}); const item={...x,id:crypto.randomUUID(),submittedAt:new Date().toISOString(),status:'pending'}; db.submissions.push(item);persist();return send(res,201,{ok:true})}catch(e){return send(res,400,{error:'invalid submission'})}
 }
 if(u.pathname==='/api/approved'&&req.method==='GET'){return send(res,200,{entries:db.submissions.filter(x=>x.status==='approved').map(({status,submittedAt,approvedAt,...x})=>x)})}
 if(u.pathname==='/api/inbox'){
  if(!auth(req))return send(res,401,{error:'unauthorized'});return send(res,200,{submissions:db.submissions})
 }
 if(u.pathname.startsWith('/api/submissions/')&&req.method==='POST'){
  if(!auth(req))return send(res,401,{error:'unauthorized'});const id=u.pathname.split('/').pop();const x=db.submissions.find(v=>v.id===id);if(!x)return send(res,404,{error:'not found'});const action=(await body(req)).action;if(action==='approve'){x.status='approved';x.approvedAt=new Date().toISOString()}else if(action==='reject'){x.status='rejected'}else return send(res,400,{error:'bad action'});persist();return send(res,200,{ok:true})
 }
 let file=u.pathname==='/'?'/index.html':u.pathname; if(file==='/friends')file='/index.html'; if(file==='/admin')file='/index.html';const fp=path.normalize(path.join(ROOT,file));if(!fp.startsWith(ROOT))return send(res,403,{error:'forbidden'});fs.readFile(fp,(e,d)=>{if(e)return send(res,404,'Not found','text/plain');send(res,200,d,mime[path.extname(fp)]||'application/octet-stream')})
}).listen(PORT,()=>console.log(`ENTRY running on http://localhost:${PORT}`));
