// Main-menu-only cinematic scene. Runs on its own 25 FPS clock; never touches gameplay timing.
import {MENU_FRAME_MS,menuFrame,menuCamera,menuEase} from './menu-cinematic-core.js';

const W=1280,H=720;
const MENU_ID='menu';
const ASSET='assets/';
const LAYERS=[
 ['sky','realisticno/klisura/sky.webp'],
 ['far','realisticno/klisura/far.webp'],
 ['mid','realisticno/klisura/mid.webp'],
 ['near','realisticno/klisura/near.webp'],
 ['banner','realisticno/svet-predmeti/prop-barjak-srpski.webp'],
 ['marko','cast/marko.png'],
 ['fairy','cast/fairy.png'],
 ['eagle','eagle.svg']
];
const ACTS=[
 ['marko-idle-2',4.6,9,'loop'],
 ['marko-idle-3',1.7,10,'once'],
 ['marko-idle-2',1.3,9,'loop'],
 ['marko-sablja-izvlaci',.55,12,'once'],
 ['marko-sablja-idle',1.8,9,'loop'],
 ['marko-sablja-vraca',.5,11,'once'],
 ['marko-idle-2',2.1,9,'loop'],
 ['marko-combo-1',.6,12,'once'],
 ['marko-idle-2',2,9,'loop'],
 ['marko-victory',.85,12,'once'],
 ['marko-idle-2',3.4,9,'loop']
];
const clips=[...new Set(ACTS.map(x=>x[0]))];
const images={};
let atlas=null,rig={},canvas=null,ctx=null,menu=null,raf=0,lastTick=0,elapsed=0,active=false;
let mouse={x:0,y:0,tx:0,ty:0};
let reduced=matchMedia('(prefers-reduced-motion: reduce)');
let slowParticles=[],dustParticles=[],blink=0,setupDone=false;
function seeded(n){let x=Math.sin(n*928.21+35.41)*43758.5453;return x-Math.floor(x)}
function prepare(){
 slowParticles=Array.from({length:58},(_,i)=>({x:seeded(i+1)*W,y:seeded(i+17)*H,p:seeded(i+31),r:.6+seeded(i+35)*2.1,s:9+seeded(i+43)*27}));
 dustParticles=Array.from({length:35},(_,i)=>({x:seeded(i+93)*W,y:300+seeded(i+103)*390,p:seeded(i+131),r:.5+seeded(i+141)*1.6,s:4+seeded(i+161)*12}));
}
function asset(key,path){
 const img=new Image();img.decoding='async';img.src=ASSET+path;
 img.onload=()=>{images[key]=img};img.onerror=()=>{};
}
async function loadSprites(){
 try{
  const response=await fetch(ASSET+'sprite-rig.json');
  if(!response.ok)return;rig=await response.json();
  for(const clip of clips){
   const r=rig[clip];if(!r)continue;
   const file=r.image;
   if(!atlas)atlas={};
   if(atlas[file])continue;
   const im=new Image();atlas[file]={img:im,loaded:false};
   im.onload=()=>{atlas[file].loaded=true};
   im.onerror=()=>{atlas[file].loaded=false};
   im.src=ASSET+file;
  }
 }catch{}
}
function cover(g,img,dx,dy,dw,dh,pan=0,vertical=0){
 if(!img?.complete||!img.naturalWidth)return;
 const iw=img.naturalWidth,ih=img.naturalHeight,k=Math.max(dw/iw,dh/ih);
 const sw=dw/k,sh=dh/k,sx=(iw-sw)/2+pan/k,sy=(ih-sh)/2+vertical/k;
 g.drawImage(img,Math.max(0,Math.min(iw-sw,sx)),Math.max(0,Math.min(ih-sh,sy)),sw,sh,dx,dy,dw,dh);
}
function layer(g,name,x,y,w,h,alpha=1){
 const img=images[name];if(!img?.naturalWidth)return;
 g.save();g.globalAlpha=alpha;
 // World layers are wide pre-painted, transparent PNG/WebP compositions. Preserve original geometry.
 const s=Math.max(w/img.naturalWidth,h/img.naturalHeight);
 g.drawImage(img,x,y,img.naturalWidth*s,img.naturalHeight*s);
 g.restore();
}
function gradient(g,y,h,colors){
 const gr=g.createLinearGradient(0,y,0,y+h);
 colors.forEach(([t,c])=>gr.addColorStop(t,c));return gr;
}
function rad(g,x,y,r,inner,outer){
 const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,inner);gr.addColorStop(1,outer);return gr;
}
function sky(g,time,cam){
 g.fillStyle=gradient(g,0,H,[[0,'#07151d'],[.5,'#553b46'],[.8,'#bf6f52'],[1,'#1b2027']]);g.fillRect(0,0,W,H);
 cover(g,images.sky,-18,-8,W+36,H+90,cam.far*.5,0);
 g.fillStyle=rad(g,960,390,490,'rgba(255,168,85,.17)','rgba(255,168,85,0)');g.fillRect(400,0,880,H);
 // Scattered distant sun shafts, moving very slowly; no expensive filters.
 for(let i=0;i<5;i++){
  g.save();g.translate(790+i*95+cam.far*1.8,-35);
  g.rotate(.19+Math.sin(time*.15+i)*.018);g.fillStyle='rgba(255,205,150,'+(.014+.008*Math.sin(time*.25+i))+')';
  g.beginPath();g.moveTo(0,0);g.lineTo(18,0);g.lineTo(120,740);g.lineTo(-90,740);g.fill();g.restore();
 }
}
function landscape(g,t,cam){
 const layers=[['far',560,8,cam.far,1],['mid',635,4,cam.mid,1],['near',720,0,cam.near,.9]];
 for(const [name,bottom,extra,pan,alpha] of layers){
  const im=images[name];if(!im?.naturalWidth)continue;
  const k=Math.max(W/im.naturalWidth, .84);
  const w=im.naturalWidth*k,h=im.naturalHeight*k;
  const x=(W-w)/2-pan, y=bottom-h+extra+cam.rise*(name==='far'?.15:1);
  g.save();g.globalAlpha=alpha;g.drawImage(im,x,y,w,h);g.restore();
 }
 // Light weather over the gorge: always behind the hero and text.
 for(let i=0;i<7;i++){
  const x=((i*350+Math.sin(t*.13+i*2)*105)+W*2)%(W+650)-320;
  const y=470+i%3*35+Math.sin(t*.11+i)*10;
  g.fillStyle=rad(g,x,y,220,'rgba(206,203,184,.052)','rgba(185,208,204,0)');
  g.beginPath();g.ellipse(x,y,250,64,0,0,Math.PI*2);g.fill();
 }
}
function heroPose(t){
 const total=ACTS.reduce((a,b)=>a+b[1],0),phase=t%total;
 let acc=0;
 for(let i=0;i<ACTS.length;i++){
  const [name,duration,fps,loop]=ACTS[i];acc+=duration;if(phase<acc){
   const local=phase-(acc-duration);
   const count=rig?.[name]?.frames?.length||8;
   const f=Math.floor(local*fps);
   const frame=loop==='loop'?f%count:Math.min(count-1,f);
   return {name,frame,local,act:i};
  }
 }return {name:'marko-idle-2',frame:0,local:0,act:0};
}
function drawHero(g,t){
 const h=heroPose(t),r=rig[h.name],im=atlas?.[r?.image];
 const hx=1047+Math.sin(t*.21)*2.2-mouse.x*8,hy=691+Math.sin(t*.48)*2.5;
 // Warm key light and cold reflected light.
 g.fillStyle=rad(g,hx-50,380,340,'rgba(247,174,98,.17)','rgba(247,174,98,0)');
 g.fillRect(600,20,650,700);
 g.fillStyle=rad(g,hx-25,687,115,'rgba(5,9,11,.55)','rgba(5,9,11,0)');
 g.beginPath();g.ellipse(hx-25,688,115,19,0,0,Math.PI*2);g.fill();
 if(!r||!im?.loaded){
  const base=images.marko;if(!base?.naturalWidth)return;
  g.save();g.translate(hx-150,115);g.globalAlpha=1;g.drawImage(base,0,0,385,565);g.restore();return;
 }
 const f=r.frames[Math.min(r.frames.length-1,h.frame)],s=r.scale*3.65;
 const x=hx-r.anchor*s,y=hy-f[4]*s,wd=f[2]*s,ht=f[3]*s;
 g.save();g.translate(x+wd/2,y+ht/2);g.scale(-1,1);g.translate(-wd/2,-ht/2);
 // Outline-style shadow is drawn behind the authored sprite, not blurred across it.
 g.shadowColor='rgba(2,6,9,.8)';g.shadowBlur=32;g.shadowOffsetX=-13;g.shadowOffsetY=15;
 g.drawImage(im.img,f[0],f[1],f[2],f[3],0,0,wd,ht);
 g.restore();
 // Animated foreground grit conceals the feet and sells the silhouette.
 g.fillStyle=gradient(g,665,55,[[0,'rgba(7,18,17,0)'],[1,'rgba(4,10,12,.72)']]);g.fillRect(780,665,500,55);
}
function banner(g,t,cam){
 const im=images.banner;if(!im?.naturalWidth)return;
 const h=330,w=h*(im.naturalWidth/im.naturalHeight);
 const x=1203+cam.near*.45,y=318;
 g.save();g.translate(x,y);g.rotate(.014*Math.sin(t*1.1));
 g.shadowColor='#05090b';g.shadowBlur=20;g.drawImage(im,-w/2,-h/2,w,h);
 g.restore();
}
function magic(g,t){
 const x=1008+43*Math.sin(t*.46),y=187+27*Math.cos(t*.64);
 const glow=rad(g,x,y,83,'rgba(189,255,226,.19)','rgba(124,216,216,0)');
 g.fillStyle=glow;g.fillRect(x-85,y-85,170,170);
 if(images.fairy?.naturalWidth){
  const w=100,h=100;g.save();g.globalAlpha=.7+.16*Math.sin(t*1.9);
  g.drawImage(images.fairy,x-w/2,y-h/2,w,h);g.restore();
 }
 for(let j=0;j<12;j++){
  const a=j*2.399+t*(j%2?-.55:.7),rr=27+(j%4)*16;
  const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr*.65;
  g.fillStyle=rad(g,px,py,7,'rgba(214,255,236,.72)','rgba(136,255,220,0)');
  g.fillRect(px-7,py-7,14,14);
 }
}
function particles(g,t,reducedMotion){
 if(reducedMotion)return;
 for(const p of slowParticles){
  const x=(p.x+Math.sin(t*.17+p.p*7)*35+p.s*t*.34)%W;
  const y=(p.y-p.s*t%H+H)%H;
  const a=.22+.28*Math.sin(t*.5+p.p*13)**2;
  g.fillStyle='rgba(255,180,104,'+a+')';
  g.fillRect(x,y,p.r,p.r);
 }
 for(const p of dustParticles){
  const x=(p.x+Math.sin(t*.38+p.p*6)*90+W)%W,y=(p.y+Math.sin(t*.54+p.p*9)*22+H)%H;
  g.fillStyle=rad(g,x,y,9,'rgba(220,235,214,.08)','rgba(215,233,211,0)');g.fillRect(x-9,y-9,18,18);
 }
}
function birds(g,t){
 g.save();g.strokeStyle='rgba(18,20,20,.66)';g.lineWidth=2.4;g.lineCap='round';
 for(let i=0;i<3;i++){
  const x=760+i*53+((t*12)%(W+120)),y=200+i*26+Math.sin(t*.67+i)*11;
  if(x>1280)continue;
  const wing=Math.sin(t*5+i*1.7)*6;
  g.beginPath();g.moveTo(x-11,y-4+wing);g.quadraticCurveTo(x-5,y-8,x,y);
  g.quadraticCurveTo(x+5,y-8,x+12,y-4-wing);g.stroke();
 }
 g.restore();
}
function atmosphere(g,t){
 // Foreground color grading, grain-free to avoid shimmer at 25 FPS.
 g.fillStyle=gradient(g,0,720,[[0,'rgba(3,9,12,.30)'],[.25,'rgba(3,9,12,.08)'],[.75,'rgba(4,10,12,.02)'],[1,'rgba(3,9,11,.74)']]);
 g.fillRect(0,0,W,H);
 g.fillStyle=rad(g,580,350,970,'rgba(0,0,0,0)','rgba(0,2,5,.42)');g.fillRect(0,0,W,H);
 const left=g.createLinearGradient(0,0,W,0);
 for(const [at,color] of [[0,'rgba(1,8,11,.95)'],[.23,'rgba(1,8,11,.74)'],[.47,'rgba(2,9,11,.33)'],[.78,'rgba(1,7,9,.02)'],[1,'rgba(1,7,9,.12)']])left.addColorStop(at,color);
 g.fillStyle=left;g.fillRect(0,0,W,H);
}
function render(){
 if(!ctx||!canvas)return;
 const scale=Math.max(canvas.width/W,canvas.height/H),offsetX=(canvas.width-W*scale)/2,offsetY=(canvas.height-H*scale)/2;
 ctx.setTransform(scale,0,0,scale,offsetX,offsetY);
 ctx.clearRect(-offsetX/scale,-offsetY/scale,canvas.width/scale,canvas.height/scale);
 mouse.x+=(mouse.tx-mouse.x)*.045;mouse.y+=(mouse.ty-mouse.y)*.045;
 const cam=menuCamera(elapsed,mouse.x,mouse.y);
 sky(ctx,elapsed,cam);landscape(ctx,elapsed,cam);
 birds(ctx,elapsed);banner(ctx,elapsed,cam);drawHero(ctx,elapsed);magic(ctx,elapsed);particles(ctx,elapsed,reduced.matches);
 atmosphere(ctx,elapsed);
}
function size(){
 if(!canvas||!menu)return;
 const width=Math.max(1,menu.clientWidth),height=Math.max(1,menu.clientHeight);
 const k=Math.min(1.4,window.devicePixelRatio||1);
 canvas.width=Math.round(width*k);canvas.height=Math.round(height*k);
}
function frame(now){
 if(!menu?.isConnected)return;
 raf=requestAnimationFrame(frame);
 if(menu.hidden||document.visibilityState==='hidden'){
  lastTick=now;return;
 }
 if(!active){active=true;lastTick=now;render();return;}
 const step=menuFrame(now,lastTick);
 if(!step.due)return;
 lastTick=step.next;
 if(!reduced.matches)elapsed+=step.dt;
 render();
}
function init(){
 if(setupDone)return;menu=document.getElementById(MENU_ID);if(!menu)return;
 setupDone=true;menu.classList.add('cinematic-menu');
 canvas=document.createElement('canvas');canvas.className='cinematic-scene';
 canvas.setAttribute('aria-hidden','true');
 menu.insertBefore(canvas,menu.firstChild);
 ctx=canvas.getContext('2d',{alpha:false});
 prepare();for(const [key,path] of LAYERS)asset(key,path);
 loadSprites();
 size();window.addEventListener('resize',size,{passive:true});
 menu.addEventListener('pointermove',event=>{
  const b=menu.getBoundingClientRect();mouse.tx=(event.clientX-b.left)/Math.max(1,b.width)*2-1;mouse.ty=(event.clientY-b.top)/Math.max(1,b.height)*2-1;
 },{passive:true});
 raf=requestAnimationFrame(frame);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
