import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {handle} from '../worker.js';
const allowed=new Map([['/','index.html'],['/index.html','index.html'],['/src/main.js','src/main.js'],['/src/style.css','src/style.css'],['/favicon.svg','favicon.svg']]);
const mime={html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml'};
createServer(async(req,res)=>{
 try{const url=new URL(req.url,'http://localhost:4174');let response;
 if(url.pathname.startsWith('/api/')){let raw='';for await(const c of req){raw+=c;if(raw.length>200000){res.writeHead(413);return res.end('Too large')}};response=await handle(new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:raw}:{})}))}
 else if(allowed.has(url.pathname)){const file=allowed.get(url.pathname);response=new Response(readFileSync(file),{headers:{'Content-Type':mime[file.split('.').pop()]+'; charset=utf-8'}})}
 else response=new Response('Not found',{status:404});
 res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500);res.end('Server error')}
}).listen(4174,'127.0.0.1',()=>console.log('亚马逊运营助手 http://localhost:4174'));
