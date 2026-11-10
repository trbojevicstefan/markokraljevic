import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
http.createServer(async(req,res)=>{try{const path=resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!path.startsWith(root+sep)){res.writeHead(403).end();return;}const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'})[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404).end('Not found');}}).listen(+process.env.PORT||4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+(+process.env.PORT||4173)));
