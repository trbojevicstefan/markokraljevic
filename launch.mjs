import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const cwd=path.dirname(fileURLToPath(import.meta.url));
const url='http://127.0.0.1:4173';
function open(){const command=process.platform==='win32'?'cmd':process.platform==='darwin'?'open':'xdg-open';const args=process.platform==='win32'?['/c','start','',url]:[url];const child=spawn(command,args,{stdio:'ignore',windowsHide:true});child.unref();}
try{const r=await fetch(url);if(r.ok&&(await r.text()).includes('Tri srca Kačanika')){open();process.exit(0);}}catch{}
const server=spawn(process.execPath,['server.mjs'],{cwd,stdio:['inherit','pipe','inherit']});
let opened=false;server.stdout.on('data',data=>{process.stdout.write(data);if(!opened&&String(data).includes('Local:')){opened=true;open();}});
server.on('exit',code=>process.exit(code||0));process.on('SIGINT',()=>server.kill());
