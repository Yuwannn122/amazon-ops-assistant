import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
mkdirSync('dist/server',{recursive:true});
const assets={};for(const [path,type] of [['index.html','text/html'],['src/main.js','text/javascript'],['src/style.css','text/css'],['favicon.svg','image/svg+xml']])assets['/'+path]={type:type+'; charset=utf-8',content:readFileSync(path,'utf8')};
writeFileSync('dist/server/index.js',readFileSync('worker.js','utf8').replace('/*__ASSETS__*/ {}',JSON.stringify(assets)));
console.log('build ok: Cloudflare-compatible Worker with embedded public assets');
