// Miroč: a complete 300-second interactive episode in the existing Marko game.
// Shares original Canvas sprite-rig, world.js physics, backgrounds and sound effects.
// No existing level logic or saves are modified.
import {integrate, GRAVITY} from './world.js';
import {EPISODE_SECONDS,MIROC_PHASES,MIROC_HERBS,clamp,phaseAt,lyricAt,pct,prettyTime,scoreEpisode} from './miroc-episode-data.js';

const W=1280,H=720,GROUND=592;
const canvas=document.getElementById('game'),g=canvas.getContext('2d',{alpha:false});
const ui={
 intro:document.getElementById('miroc-intro'),end:document.getElementById('miroc-end'),
 start:document.getElementById('miroc-start'),again:document.getElementById('miroc-again'),
 chapter:document.getElementById('miroc-chapter'),objective:document.getElementById('miroc-objective'),
 phase:document.getElementById('miroc-phase'),time:document.getElementById('miroc-time'),
 progress:document.getElementById('miroc-progress'),lyric:document.getElementById('miroc-lyric'),
 hint:document.getElementById('miroc-hint'),health:document.getElementById('miroc-health-fill'),
 resultTitle:document.getElementById('miroc-result-title'),result:document.getElementById('miroc-result'),
 score:document.getElementById('miroc-score'),toast:document.getElementById('miroc-toast'),
 pause:document.getElementById('miroc-pause'),mute:document.getElementById('miroc-mute')
};
const keys=new Set(),images=new Map(),rig={};
const random=(i)=>{const x=Math.sin(i*157.3+9.21)*43758.5453;return x-Math.floor(x)};
const music=new Audio('assets/sfx/guslar_pesma_duga.ogg');
music.preload='auto';music.loop=true;music.volume=.38;
const sounds={
 hoof:'assets/sfx/hoof_0.ogg', bow:'assets/sfx/bow_0.ogg', arrow:'assets/sfx/arrow_0.ogg',
 hit:'assets/sfx/hit_heavy_0.ogg', body:'assets/sfx/hit_body_0.ogg',
 magic:'assets/sfx/magic_0.ogg', heal:'assets/sfx/magic_big_0.ogg', pickup:'assets/sfx/pickup_0.ogg'
};
let mute=false,ready=false,lastFrame=0,state=null,toastUntil=0;
const reduced=window.matchMedia?.('(prefers-reduced-motion:reduce)').matches??false;
const BACKGROUNDS=['svet-prevoj','svet-suma','svet-manastir'];
const ACTIVE_RIGS=[
 'sarac-galop','marko-idle','marko-odmor','marko-pocinak','marko-odmor-ustaje',
 'marko-run','marko-attack','marko-mounted-attack','marko-jump','marko-hurt',
 'marko-victory','marko-sablja-idle','vila-let','vila-carolija','vila-isceljenje'
];
function newState(){
 return {
  started:false,paused:false,finished:false,t:0,phase:'ride',phaseStart:0,
  sceneStamp:-1,arrows:0,miloHurt:false,markoAwake:false,
  rideX:0,chaseX:0,horseY:GROUND,horseVy:0,horseGround:true,obstacleHit:new Set(),
  jumps:0,hits:0,herbs:new Set(),heal:0,health:100,attackTime:0,
  hero:{x:240,y:GROUND,w:34,h:100,vx:0,vy:0,grounded:true,drop:0},
  fairy:{x:640,y:385,flash:0},particles:[],fireflies:[],shake:0,
  missed:0,beat:0,finishText:''
 };
}
function loadImage(path){
 if(images.has(path))return images.get(path);
 const pic=new Image();pic.decoding='async';
 const entry={img:pic,ok:false};
 images.set(path,entry);
 pic.onload=()=>{entry.ok=true};pic.onerror=()=>{entry.ok=false};
 pic.src=path;return entry;
}
async function preload(){
 const ri=await fetch('assets/sprite-rig.json');
 if(!ri.ok)throw new Error('Ne mogu da učitam sprite-rig.json');
 Object.assign(rig,await ri.json());
 for(const name of ACTIVE_RIGS){if(rig[name]?.image)loadImage('assets/'+rig[name].image);}
 for(const biome of BACKGROUNDS)for(const layer of ['sky','far','mid','near'])
  loadImage('assets/realisticno/'+biome+'/'+layer+'.webp');
 loadImage('assets/cast/marko.png');loadImage('assets/cast/fairy.png');
 return true;
}
function playSfx(name,volume=.5){
 if(mute||!sounds[name])return;
 try{const a=new Audio(sounds[name]);a.volume=volume;a.play().catch(()=>{});}catch{}
}
function toast(message,sec=3){
 ui.toast.textContent=message;ui.toast.classList.add('visible');
 toastUntil=(state?.t||0)+sec;
}
function sprite(name,x,foot,scale=1,seconds=state.t,flags={}){
 const r=rig[name];if(!r)return false;
 const entry=images.get('assets/'+r.image);if(!entry?.ok)return false;
 const frames=r.frames;if(!frames?.length)return false;
 const fps=flags.fps??(name==='marko-pocinak'?4:12);
 const index=flags.frame!=null?clamp(flags.frame,0,frames.length-1)
  :Math.floor(Math.max(0,seconds)*fps)%frames.length;
 const f=frames[index],k=r.scale*scale;
 g.save();
 g.globalAlpha=flags.alpha??1;
 if(flags.filter)g.filter=flags.filter;
 if(flags.flip){g.translate(x,0);g.scale(-1,1);x=0;}
 g.drawImage(entry.img,f[0],f[1],f[2],f[3],
   x-r.anchor*k,foot-f[4]*k,f[2]*k,f[3]*k);
 g.restore();return true;
}
function fallbackArt(path,x,y,w,h){
 const image=images.get(path);
 if(image?.ok)g.drawImage(image.img,x,y,w,h);
}
function cover(name,offset=0,vertical=0,alpha=1){
 const image=images.get(name);if(!image?.ok)return;
 const im=image.img,k=Math.max((W+110)/im.naturalWidth,(H+36)/im.naturalHeight);
 const w=im.naturalWidth*k,h=im.naturalHeight*k;
 const dx=clamp((W-w)/2-offset, W-w,0),dy=clamp((H-h)/2+vertical,H-h,0);
 g.globalAlpha=alpha;g.drawImage(im,dx,dy,w,h);g.globalAlpha=1;
}
function biome(){
 const p=phaseAt(state.t).id;
 return p==='chase'?'svet-prevoj':p==='healing'?'svet-manastir':'svet-suma';
}
function drawBackdrop(){
 const p=biome(),move=state.t;
 const bg=g.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#183239');bg.addColorStop(.56,'#6f7160');bg.addColorStop(1,'#17261c');
 g.fillStyle=bg;g.fillRect(0,0,W,H);
 const camera=phaseAt(state.t).id==='chase'?state.chaseX*.18:state.t*9;
 cover('assets/realisticno/'+p+'/sky.webp',camera*.03,0,1);
 cover('assets/realisticno/'+p+'/far.webp',camera*.095,0,.97);
 cover('assets/realisticno/'+p+'/mid.webp',camera*.21,0,1);
 cover('assets/realisticno/'+p+'/near.webp',camera*.37,12,1);
 // Separately painted floor for reliable character foot baselines.
 g.fillStyle='#202820';g.fillRect(0,GROUND,W,H-GROUND);
 const road=g.createLinearGradient(0,GROUND,0,H);
 road.addColorStop(0,'#78806a');road.addColorStop(.11,'#465241');road.addColorStop(1,'#1c2822');
 g.fillStyle=road;g.fillRect(0,GROUND,W,H-GROUND);
 g.strokeStyle='#c2b28b66';g.lineWidth=3;
 g.beginPath();g.moveTo(0,GROUND+2);g.lineTo(W,GROUND+2);g.stroke();
 for(let i=0;i<20;i++){
  const x=((i*193-camera*.55)%1500+1500)%1500-100;
  const y=608+(i*23)%106;g.fillStyle=i%2?'#85907a55':'#1a252044';
  g.beginPath();g.ellipse(x,y,9+i%5*4,2.5+i%3,0,0,Math.PI*2);g.fill();
 }
 // Ambient mist with slight drift; no generated noise over the sprites.
 for(let i=0;i<4;i++){
  const x=270+i*320+Math.sin(move*.11+i)*80;
  const mist=g.createRadialGradient(x,510,12,x,510,260);
  mist.addColorStop(0,'rgba(213,229,203,.09)');mist.addColorStop(1,'rgba(213,229,203,0)');
  g.fillStyle=mist;g.fillRect(x-260,340,520,320);
 }
}
function canopy(){
 const t=state.t;
 for(let i=0;i<14;i++){
  const x=random(37+i)*W+Math.sin(t*.26+i)*18,y=100+random(71+i)*360;
  const r=1.8+random(95+i)*2.5;
  g.fillStyle=i%3?'rgba(231,207,115,.33)':'rgba(160,247,214,.39)';
  g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
 }
}
function drawHorse(x,foot,seconds,options={}){
 const moving=options.moving!==false;
 const opts={fps:moving?11:2,frame:moving?null:1,filter:options.brown?'sepia(.54) saturate(1.50) hue-rotate(-13deg)':'none'};
 sprite('sarac-galop',x,foot,options.scale??1,seconds,opts);
}
function drawMountedRider(kind,x,foot,seconds,options={}){
 const isMilos=kind==='milos';
 const scale=options.scale??1;
 drawHorse(x,foot,seconds,{brown:isMilos,moving:options.moving,scale});
 const sleeping=!isMilos&&options.sleep;
 let clip=isMilos?'marko-sablja-idle':sleeping?'marko-pocinak':'marko-idle';
 if(options.hurt)clip='marko-hurt';
 const filter=isMilos?'hue-rotate(35deg) saturate(.84) brightness(1.09)':undefined;
 // Rider's feet meet the authored saddle top. Only new Miloš art remains a temporary stand-in.
 sprite(clip,x-1*scale,foot-106*scale,scale*.77,seconds,{fps:sleeping?2:9,filter});
 if(isMilos){
  g.save();
  g.fillStyle='#f3e6b9';g.font='700 11px system-ui';g.textAlign='center';
  g.strokeStyle='#071614';g.lineWidth=3;g.strokeText('MILOŠ',x,foot-260*scale);
  g.fillText('MILOŠ',x,foot-260*scale);g.restore();
 }
 if(options.arrows){
  const cx=x+26*scale,base=foot-204*scale;
  drawLodgedArrow(cx,base,1);
  if(options.arrows>1)drawLodgedArrow(cx-9*scale,base+24*scale,1.18);
 }
}
function drawLodgedArrow(x,y,k=1){
 g.save();g.translate(x,y);g.rotate(-.18);
 g.strokeStyle='#6d492e';g.lineWidth=3*k;
 g.beginPath();g.moveTo(-3*k,0);g.lineTo(65*k,-15*k);g.stroke();
 g.fillStyle='#ddded0';g.beginPath();g.moveTo(-5*k,-1);g.lineTo(5*k,-5*k);g.lineTo(4*k,4*k);g.fill();
 g.strokeStyle='#f2e0b4';g.lineWidth=1.1;
 for(let i=0;i<3;i++){g.beginPath();g.moveTo((47+i*6)*k,(-12-i)*k);g.lineTo((52+i*4)*k,(-20-i*3)*k);g.stroke();}
 g.fillStyle='#a92b28';g.beginPath();g.arc(-5*k,0,5*k,0,Math.PI*2);g.fill();
 g.restore();
}
function blood(x,y,n=25,power=1){
 for(let i=0;i<n;i++){
  const a=random(i+state.t*70)*Math.PI*2,sp=70+random(i+31)*220;
  state.particles.push({x,y,vx:Math.cos(a)*sp*power,vy:Math.sin(a)*sp*power-140,life:.5+random(i+44)*.5,max:.9,type:'blood',r:2+random(i+9)*4});
 }
 state.shake=reduced?0:.22;
 playSfx('body',.58);
}
function sparks(x,y,n=15,type='gold'){
 for(let i=0;i<n;i++){
  const a=Math.PI*2*random(i*17+state.t*2),sp=40+random(i*22+10)*175;
  state.particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.5+random(i+44)*.5,max:.9,type,r:1.5+random(i)*2.5});
 }
}
function stepParticles(dt){
 for(const p of state.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(p.type==='blood'?550:85)*dt;p.life-=dt;}
 state.particles=state.particles.filter(x=>x.life>0).slice(-160);
}
function paintParticles(){
 for(const p of state.particles){
  g.save();g.globalAlpha=clamp(p.life/(p.max||.9),0,1);
  g.fillStyle=p.type==='blood'?'#9f2020':p.type==='healing'?'#92e6bd':'#ffd780';
  g.beginPath();g.arc(p.x,p.y,p.r,0,Math.PI*2);g.fill();g.restore();
 }
}
function playAudio(){
 if(!mute){music.play().catch(()=>{toast('Zvuk je blokiran: uključi ga dugmetom ♫.',2)})}
}
function start(){
 state=newState();state.started=true;state.paused=false;
 ui.intro.hidden=true;ui.end.hidden=true;ui.pause.textContent='Ⅱ';
 music.currentTime=0;playAudio();syncUi();toast('Miroč · dva pobratima kreću na put',3);
}
function restart(){
 music.pause();start();
}
function pause(value=!state.paused){
 if(!state.started||state.finished)return;
 state.paused=value;ui.pause.textContent=value?'▶':'Ⅱ';
 if(value){music.pause();toast('Pauza · P za nastavak',90);}
 else{playAudio();ui.toast.classList.remove('visible');toastUntil=0;}
}
function phaseChange(next){
 const old=state.phase;state.phase=next.id;state.phaseStart=next.from;
 toast(next.title,3.5);
 if(next.id==='arrows')playSfx('bow');
 if(next.id==='chase'){state.markoAwake=true;playSfx('hoof');}
 if(next.id==='battle'){state.hero={x:230,y:GROUND,w:34,h:100,vx:0,vy:0,grounded:true,drop:0};}
 if(next.id==='herbs'){state.fairy.x=160;state.fairy.y=400;playSfx('magic');}
 if(next.id==='healing'){state.fairy.x=720;state.fairy.y=365;playSfx('heal');}
 if(next.id==='sing'&&old==='ride')toast('Marko zaspi na Šarcu. Miloš zapeva...',4);
 syncUi();
}
function phaseSeconds(){return Math.max(0,state.t-state.phaseStart);}
function keyDown(code){
 if(code==='KeyP'||code==='Escape'){pause();return;}
 if(code==='KeyM'){setMute(!mute);return;}
 if(code==='KeyR'&&state.finished){restart();return;}
 if(!state.started||state.paused||state.finished)return;
 if(code==='Space'&&!keys.has(code))jump();
 if((code==='KeyJ'||code==='KeyK')&&!keys.has(code))attack(code==='KeyK');
 if(code==='KeyE'&&!keys.has(code))interact();
 keys.add(code);
}
function jump(){
 if(state.phase==='chase'&&state.horseGround){
  state.horseVy=-740;state.horseGround=false;state.jumps++;playSfx('hoof');
  sparks(300,GROUND-14,8,'gold');
 }else if(state.phase==='battle'&&state.hero.grounded){
  state.hero.vy=-685;state.hero.grounded=false;playSfx('hoof',.25);
 }
}
function attack(heavy){
 if(state.phase!=='battle'||state.t<state.attackTime)return;
 state.attackTime=state.t+(heavy?.65:.38);
 const f=state.fairy,hero=state.hero;
 const dx=Math.abs(hero.x-f.x),dy=Math.abs(hero.y-70-f.y);
 if(dx<=(heavy?275:225)&&dy<250){
  state.hits++;f.flash=.22;blood(f.x-18,f.y,heavy?30:20,heavy?1.3:1);
  sparks(f.x,f.y,16,'gold');
  if(state.hits===1)toast('Topuz je pogodio Ravijojlu!',2);
  if(state.hits===2)toast('Još jedan udarac! Vila pada ka zemlji.',2);
  if(state.hits>=3)toast('Ravijojla: „Pusti me da donesem bilje!“',4);
 }else{
  sparks(hero.x+100,hero.y-90,7,'gold');playSfx('hoof',.17);
 }
}
function interact(){
 if(state.phase==='herbs'){
  let nearest=-1,distance=1e9;
  MIROC_HERBS.forEach((h,i)=>{
   if(state.herbs.has(i))return;
   const d=Math.hypot(state.fairy.x-h.x,state.fairy.y-h.y);
   if(d<distance){distance=d;nearest=i;}
  });
  if(distance<105&&nearest>=0){
   state.herbs.add(nearest);playSfx('pickup',.6);
   sparks(MIROC_HERBS[nearest].x,MIROC_HERBS[nearest].y,27,'healing');
   toast('Lekovito bilje: '+state.herbs.size+' / 3',2);
  }else{toast('Približi se svetlećoj biljci pa pritisni E.',1.8);}
 }else if(state.phase==='healing'&&state.herbs.size<3){
  toast('Nedostaje bilja! Sakupljeno '+state.herbs.size+' / 3.',2);
 }
}
function setMute(value){
 mute=value;music.muted=mute;ui.mute.textContent=mute?'♪̸':'♫';
 if(!mute&&state.started&&!state.paused&&!state.finished)playAudio();
}
const CHASE_OBSTACLES=[650,1040,1530,1920,2430];
function updateChase(dt){
 const moving=keys.has('KeyD')||keys.has('ArrowRight');
 const reverse=keys.has('KeyA')||keys.has('ArrowLeft');
 const speed=reverse?90:moving?360:190;
 const previous=state.chaseX;state.chaseX=Math.min(3000,state.chaseX+speed*dt);
 state.horseVy+=GRAVITY*dt*.9;
 state.horseY+=state.horseVy*dt;
 if(state.horseY>=GROUND){state.horseY=GROUND;state.horseVy=0;state.horseGround=true;}
 for(let i=0;i<CHASE_OBSTACLES.length;i++){
  const x=CHASE_OBSTACLES[i];
  if(previous<x && state.chaseX>=x && state.horseY>GROUND-70 && !state.obstacleHit.has(i)){
   state.obstacleHit.add(i);state.health=Math.max(10,state.health-12);state.shake=.2;playSfx('hit',.3);
   toast('Prepreka! Preskači ih tasterom SPACE.',2);
  }
 }
}
function updateBattle(dt){
 const a=keys.has('KeyA')||keys.has('ArrowLeft'),d=keys.has('KeyD')||keys.has('ArrowRight');
 state.hero.vx=(d-a)*280;
 const floor=[{x:-700,y:GROUND,w:2700,h:180,kind:'stone'}];
 // Exact original engine physics: gravity, platform tops, body collision.
 integrate(state.hero,dt,floor);
 state.hero.x=clamp(state.hero.x,40,1240);
 state.fairy.x=960+Math.sin(state.t*.9)*62;
 state.fairy.y=420+Math.sin(state.t*1.6)*37;
 state.fairy.flash=Math.max(0,state.fairy.flash-dt);
 if(state.t-state.beat>3.4&&state.hits<3){
  state.beat=state.t;playSfx('magic',.3);
  sparks(state.hero.x+Math.sin(state.t)*20,state.hero.y-120,7,'gold');
  state.health=Math.max(10,state.health-3);
 }
}
function updateHerbs(dt){
 const x=(keys.has('KeyD')||keys.has('ArrowRight'))-(keys.has('KeyA')||keys.has('ArrowLeft'));
 const y=(keys.has('KeyS')||keys.has('ArrowDown'))-(keys.has('KeyW')||keys.has('ArrowUp'));
 state.fairy.x=clamp(state.fairy.x+x*320*dt,75,1200);
 state.fairy.y=clamp(state.fairy.y+y*260*dt,225,520);
}
function updateHealing(dt){
 const x=(keys.has('KeyD')||keys.has('ArrowRight'))-(keys.has('KeyA')||keys.has('ArrowLeft'));
 const y=(keys.has('KeyS')||keys.has('ArrowDown'))-(keys.has('KeyW')||keys.has('ArrowUp'));
 state.fairy.x=clamp(state.fairy.x+x*220*dt,450,980);
 state.fairy.y=clamp(state.fairy.y+y*180*dt,280,510);
 if(keys.has('KeyE')&&state.herbs.size===3&&Math.hypot(state.fairy.x-720,state.fairy.y-370)<180){
  state.heal=Math.min(1,state.heal+dt/4);
  if(Math.random()<.75)sparks(710+random(state.t*20)*120,400+random(state.t*31)*110,1,'healing');
  if(state.heal>=1&&!state.miloHealed){state.miloHealed=true;playSfx('heal',.7);toast('Miloš je izlečen! Njegov glas opet odjekuje!',5);}
 }
}
function update(dt){
 if(!state.started||state.paused||state.finished)return;
 state.t=Math.min(EPISODE_SECONDS,state.t+dt);
 const phase=phaseAt(state.t);
 if(phase.id!==state.phase)phaseChange(phase);
 if(phase.id==='ride'||phase.id==='sing')state.rideX+=((keys.has('KeyD')||keys.has('ArrowRight'))?130:40)*dt;
 if(phase.id==='arrows'){
  if(state.t>=91&&state.arrows<1){state.arrows=1;playSfx('bow');playSfx('arrow',.6);blood(685,392,15,.65);}
  if(state.t>=97&&state.arrows<2){state.arrows=2;state.miloHurt=true;playSfx('arrow',.6);blood(692,422,20,.8);}
 }
 if(phase.id==='chase')updateChase(dt);
 if(phase.id==='battle')updateBattle(dt);
 if(phase.id==='herbs')updateHerbs(dt);
 if(phase.id==='healing')updateHealing(dt);
 stepParticles(dt);
 state.shake=Math.max(0,state.shake-dt);
 if(state.t>=toastUntil)ui.toast.classList.remove('visible');
 if(state.t>=EPISODE_SECONDS)finish();
 syncUi();
}
function syncUi(){
 if(!state)return;
 const phase=phaseAt(state.t),index=MIROC_PHASES.indexOf(phase);
 ui.chapter.textContent=phase.title;ui.objective.textContent=phase.objective;
 ui.time.textContent=prettyTime(state.t);ui.progress.style.transform='scaleX('+pct(state.t)+')';
 ui.phase.textContent='Čin '+(index+1)+' / '+MIROC_PHASES.length;
 ui.lyric.textContent=lyricAt(state.t);
 ui.health.style.width=state.health+'%';
 if(phase.id==='chase')ui.hint.textContent='D / → GALOP · SPACE SKOK · Prepreke: '+state.jumps+' preskočeno';
 else if(phase.id==='battle')ui.hint.textContent='A / D KRETANJE · SPACE SKOK · J/K TOPUZ · Pogoci: '+Math.min(state.hits,3)+' / 3';
 else if(phase.id==='herbs')ui.hint.textContent='WASD POMERA VILU · E PRIKUPI BILJE · '+state.herbs.size+' / 3';
 else if(phase.id==='healing')ui.hint.textContent='Drži E blizu Miloša · Isceljenje: '+Math.round(state.heal*100)+'%';
 else ui.hint.textContent='A/D · ←/→ kretanje · SPACE skok · P pauza · M zvuk';
}
function drawShadow(x,y,rx=75){
 g.fillStyle='#04110f77';g.beginPath();g.ellipse(x,y,rx,12,0,0,Math.PI*2);g.fill();
}
function drawMarkoMilos(){
 const t=state.t,phase=state.phase;
 drawShadow(310,GROUND+6,85);drawShadow(740,GROUND+5,75);
 const sleeping=(phase==='sing'||(phase==='ride'&&state.t>21));
 drawMountedRider('marko',310,GROUND,t,{sleep:sleeping,moving:phase==='ride'});
 drawMountedRider('milos',720,GROUND,t,{moving:true,arrows:state.arrows,hurt:state.miloHurt});
 if(phase==='sing'||phase==='arrows'){
  const x=980+Math.sin(t*.45)*28,y=285+Math.cos(t*.7)*20;
  sprite('vila-let',x,y,1.38,t);
  if(t>82&&t<100)drawBow(x+30,y+4);
 }
 if(phase==='arrows'){
  const ps=[91,97];
  for(let i=0;i<2;i++){const d=t-ps[i];if(d>-.5&&d<1.2){
   const k=clamp((d+.5)/1.7,0,1),ax=970-280*k,ay=285+(i?120:90)*k;
   drawFlyingArrow(ax,ay);
  }}
 }
}
function drawBow(x,y){
 g.save();g.translate(x,y);g.strokeStyle='#c89559';g.lineWidth=3;
 g.beginPath();g.moveTo(0,-42);g.quadraticCurveTo(35,0,0,42);g.stroke();
 g.strokeStyle='#e8dfc6';g.lineWidth=1;g.beginPath();g.moveTo(0,-42);g.lineTo(0,42);g.stroke();g.restore();
}
function drawFlyingArrow(x,y){g.save();g.translate(x,y);g.rotate(Math.PI-.18);g.strokeStyle='#bda57d';g.lineWidth=3;g.beginPath();g.moveTo(-32,0);g.lineTo(32,0);g.stroke();g.fillStyle='#f1ead4';g.beginPath();g.moveTo(32,-5);g.lineTo(41,0);g.lineTo(32,5);g.fill();g.restore();}
function drawChase(){
 const t=state.t,ground=state.horseY,horseScreen=310;
 drawShadow(horseScreen,GROUND+6,85);
 drawMountedRider('marko',horseScreen,ground,t,{moving:true});
 const screenPoint=x=>horseScreen+(x-state.chaseX);
 for(const x of CHASE_OBSTACLES){
  const sx=screenPoint(x);if(sx<-90||sx>W+100)continue;
  g.fillStyle='#211e1b';g.fillRect(sx-23,GROUND-48,44,48);
  g.fillStyle='#887c6a';g.fillRect(sx-20,GROUND-51,41,8);
  g.strokeStyle='#ad8768';g.lineWidth=4;g.beginPath();g.moveTo(sx-32,GROUND-52);g.lineTo(sx+26,GROUND-9);g.stroke();
 }
 const vilaX=930+Math.sin(t*.7)*105,vilaY=235+Math.sin(t*1.9)*24;
 sprite('vila-let',vilaX,vilaY,1.5,t);
 g.fillStyle='#fff3c4';g.font='700 13px system-ui';g.textAlign='center';g.fillText('RAVIJOJLA',vilaX,vilaY-115);
}
function drawBloodStain(x,y,scale=1){
 g.save();g.translate(x,y);g.fillStyle='#8c2323a3';
 for(let i=0;i<10;i++){g.beginPath();g.ellipse((random(i+17)-.5)*75*scale,(random(i+7)-.5)*12*scale,2+random(i+30)*6*scale,1.8+random(i+9)*4*scale,random(i)*3,0,Math.PI*2);g.fill();}
 g.restore();
}
function drawBattle(){
 // The main player uses the same original Marko sprites and physics as the game.
 const h=state.hero,face=state.hero.vx<0;
 drawShadow(h.x,GROUND+4,60);
 const attacking=state.t<state.attackTime;
 const clip=attacking?'marko-attack':!h.grounded?'marko-jump':Math.abs(h.vx)>10?'marko-run':'marko-idle';
 sprite(clip,h.x,h.y,1,state.t,{flip:face,frame:attacking?Math.floor((state.attackTime-state.t)*8)%6:null});
 const f=state.fairy,fallen=state.hits>=3;
 sprite(fallen?'vila-isceljenje':'vila-carolija',f.x,f.y+(fallen?130:0),fallen?1.2:1.7,state.t,
  {filter:f.flash>0?'sepia(.6) saturate(2) hue-rotate(-34deg)':null,alpha:fallen?.92:1});
 if(state.hits>0){
  drawBloodStain(f.x,f.y+100,.85);
  g.fillStyle='#d13b38bb';g.beginPath();g.arc(f.x-23,f.y+45,Math.min(state.hits*5,13),0,Math.PI*2);g.fill();
 }
 g.font='700 14px system-ui';g.textAlign='center';g.fillStyle='#f3dfb4';g.fillText('RAVIJOJLA · '+Math.max(0,3-state.hits)+' / 3',f.x,f.y-128);
}
function drawHerb(h,idx){
 if(state.herbs.has(idx))return;
 const pulse=.75+.25*Math.sin(state.t*2.8+idx*2);
 g.save();g.translate(h.x,h.y);g.shadowColor='#8dffca';g.shadowBlur=20*pulse;
 g.strokeStyle='#6bb58b';g.lineWidth=3;g.beginPath();g.moveTo(0,16);g.quadraticCurveTo(-5,-12,1,-30);g.stroke();
 for(const [dx,dy,ang] of [[-13,-16,-.5],[10,-26,.6],[-11,-3,-.6],[11,1,.55]]){
  g.save();g.translate(dx,dy);g.rotate(ang);g.fillStyle='#94e8a8';g.beginPath();g.ellipse(0,0,12,6,0,0,Math.PI*2);g.fill();g.restore();
 }
 g.fillStyle='#f5e9ad';g.beginPath();g.arc(0,-32,5,0,Math.PI*2);g.fill();g.shadowBlur=0;
 g.font='700 12px system-ui';g.textAlign='center';g.fillStyle='#f5efd0';g.fillText('E',0,-55);
 g.restore();
}
function drawHerbs(){
 const f=state.fairy;
 for(let i=0;i<MIROC_HERBS.length;i++)drawHerb(MIROC_HERBS[i],i);
 sprite('vila-let',f.x,f.y,1.6,state.t);
 g.textAlign='center';g.fillStyle='#f8e3ac';g.font='700 15px system-ui';g.fillText('BILJE '+state.herbs.size+' / 3',f.x,f.y-120);
}
function drawHealing(){
 drawShadow(680,GROUND+5,75);
 drawHorse(565,GROUND,state.t,{moving:false,brown:true});
 // Miloš resting after both arrows, illustrated with existing game art for now.
 sprite(state.heal>.95?'marko-idle':'marko-pocinak',700,GROUND,0.8,state.t,
   {filter:'sepia(.25) hue-rotate(24deg) saturate(.8)',fps:3});
 if(state.heal<.99){drawLodgedArrow(729,GROUND-157);drawLodgedArrow(704,GROUND-134,1.1);}
 const fairy=state.fairy;
 sprite('vila-isceljenje',fairy.x,fairy.y,1.7,state.t);
 if(state.heal>0){
  g.strokeStyle='#baf9bc';g.lineWidth=4;g.beginPath();g.arc(700,465,50,Math.PI*.5,Math.PI*(.5+state.heal*2));g.stroke();
 }
 g.fillStyle='#e8f4d8';g.font='700 16px system-ui';g.textAlign='center';
 g.fillText(state.heal>=1?'MILOŠ JE IZLEČEN':'DRŽI E ZA ISCELJENJE',700,300);
}
function drawStage(){
 if(!state)return;
 g.save();
 if(state.shake>0&&!reduced)g.translate((Math.random()-.5)*state.shake*25,(Math.random()-.5)*state.shake*14);
 drawBackdrop();
 switch(state.phase){
  case 'ride':case 'sing':case 'arrows':drawMarkoMilos();break;
  case 'chase':drawChase();break;
  case 'battle':drawBattle();break;
  case 'herbs':drawHerbs();break;
  case 'healing':drawHealing();break;
 }
 canopy();paintParticles();
 const vignette=g.createLinearGradient(0,0,0,H);vignette.addColorStop(0,'rgba(4,14,15,.04)');vignette.addColorStop(1,'rgba(3,10,12,.32)');
 g.fillStyle=vignette;g.fillRect(0,0,W,H);
 g.restore();
}
function finish(){
 state.finished=true;music.pause();keys.clear();
 const score=scoreEpisode({jumps:state.jumps,hits:state.hits,herbs:state.herbs.size,heal:state.heal});
 const success=state.herbs.size===3&&state.heal>=1;
 ui.end.hidden=false;ui.resultTitle.textContent=success?'Pobratimi su spaseni':'Pesma je završena';
 ui.result.textContent=success?
  'Vila je lekovitim biljem zacelila Miloševe rane. Marko i Miloš nastavljaju put preko Timoka.':
  'Milošu je još potrebna pomoć. Ponovi pohod, savladaj vilu i pronađi sve tri lekovite biljke.';
 ui.score.textContent='Učinak '+score+' / 4 · Skokovi '+state.jumps+' · Pogoci '+state.hits+' · Bilje '+state.herbs.size+'/3 · Isceljenje '+Math.round(state.heal*100)+'%';
}
function loop(now){
 if(!lastFrame)lastFrame=now;
 const dt=Math.min(.045,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
 if(state?.started&&!state.paused&&!state.finished)update(dt);
 if(ready&&state)drawStage();
 else{
  g.fillStyle='#0b1515';g.fillRect(0,0,W,H);g.fillStyle='#e8d7aa';g.font='30px Georgia';g.textAlign='center';g.fillText('Miroč · učitavanje sveta…',W/2,H/2);
 }
 requestAnimationFrame(loop);
}
document.addEventListener('keydown',e=>{
 if(['Space','ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
 if(!e.repeat||['KeyA','KeyD','KeyW','KeyS','ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(e.code))keyDown(e.code);
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();if(state?.started&&!state?.paused&&!state?.finished)pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&state?.started&&!state?.paused&&!state?.finished)pause(true);});
ui.start.onclick=()=>{if(!ready){toast('Resursi se učitavaju…',2);return;}start()};
ui.again.onclick=restart;ui.pause.onclick=()=>pause();ui.mute.onclick=()=>setMute(!mute);
document.querySelectorAll('#miroc-touch [data-key]').forEach(el=>{
 const code=el.dataset.key;
 function down(e){e.preventDefault();el.classList.add('pressed');keyDown(code);el.setPointerCapture?.(e.pointerId);}
 function up(e){e.preventDefault();el.classList.remove('pressed');keys.delete(code);}
 el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);
 el.addEventListener('pointercancel',up);el.addEventListener('lostpointercapture',()=>{el.classList.remove('pressed');keys.delete(code)});
});
state=newState();requestAnimationFrame(loop);
preload().then(()=>{ready=true;ui.start.disabled=false;ui.start.textContent='Započni pesmu i nivo ▶';})
 .catch(e=>{console.error(e);ui.start.disabled=true;ui.start.textContent='Nedostaju asseti';toast('Greška prilikom učitavanja sveta: '+e.message,10)});
