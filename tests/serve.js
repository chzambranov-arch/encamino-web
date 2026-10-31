// Minimal static server for tests: serves the repo root on localhost.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
module.exports=function(port){return new Promise(res=>{const s=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});r.end(b)})});s.listen(port,'127.0.0.1',()=>res(s))})};
