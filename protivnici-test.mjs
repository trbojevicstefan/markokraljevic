// Stronger foes (Stefan, 14. 11.), headless: node protivnici-test.mjs
// Chapter by chapter they have more health and strike harder; a wounded foe grows wild (BESAN: quicker, harder, red glow);
// the light foes step back from Marko's heavy blow once in a while (IZMAČE SE). Champions keep their own kits.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{ok:true,json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,pohodSnaga,hardenFoes,ownedSkills,startWindup,kise:()=>kise,state:()=>({p,world})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const start=async id=>{await api.startLevel(api.LEVELS.findIndex(L=>L.id===id),'day');api.keys.clear();api.pressed.clear();return api.state().world;};

// ---- chapter by chapter ----
const foe=()=>({type:'sword',maxHp:100,hp:100});
await start('selo');const s1=api.pohodSnaga(),f1=foe();api.hardenFoes([f1]);
await start('reka');const s2=api.pohodSnaga(),f2=foe();api.hardenFoes([f2]);
ok(s1.hp===1&&s2.hp>1.4&&s2.dmg>1.25,`chapters: the first is as it was, the late ones are harder (${s2.hp.toFixed(2)}× health, ${s2.dmg.toFixed(2)}× blows)`);
ok(f2.maxHp>f1.maxHp*1.4,`chapters: the same sabre-man is tougher by the river than in the village (${f1.maxHp} → ${f2.maxHp})`);

// ---- a wounded foe grows wild ----
{const w=await start('selo');const {p}=api.state();const e=w.enemies.find(e=>!e.champion&&!e.perch&&e.type==='sword');for(const o of w.enemies)if(o!==e)o.alive=false;
 p.x=e.x-900;p.invuln=99;e.hp=e.maxHp*.3;step(2);ok(e.besan,'besan: under a third of his health the foe grows wild');
 e.mode='windup';e.timer=1;step(12);ok(e.timer<1-12/120*1.3,'besan: his windup runs quicker');}

// ---- the light foes slip the heavy blow ----
{const w=await start('selo');const {p}=api.state();for(const o of w.enemies)o.alive=false;
 const gy=p.y,e={id:7777,x:p.x+120,y:gy,vx:0,vy:0,w:36,h:75,hp:300,maxHp:300,type:'archer',zone:w.enemies[0]?.zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:p.x+120,attackId:0,grounded:true};w.enemies.push(e);
 let slipped=0;for(let k=0;k<12&&!slipped;k++){Object.assign(e,{x:p.x+120,mode:'idle',timer:9,stun:0,izmakCd:0,lunge:null,hp:300});p.face=1;p.attack=.3;p.attackKind='heavy';p.attackId=(p.attackId||0)+1000+k;step(1);if(e.lunge&&e.lunge.v>0)slipped++;p.attack=0;step(40);}
 ok(slipped>0,'izmiče: the archer steps back from a heavy blow');
 const s={...e,id:7778,type:'shield',x:p.x+120,izmakCd:0,lunge:null};w.enemies.push(s);e.alive=false;let shieldSlip=0;
 for(let k=0;k<8;k++){Object.assign(s,{x:p.x+120,mode:'idle',lunge:null});p.attack=.3;p.attackKind='heavy';p.attackId=(p.attackId||0)+2000+k;step(1);if(s.lunge)shieldSlip++;p.attack=0;step(10);}
 ok(shieldSlip===0,'izmiče: the shield-bearer stands his ground (the heavy blow is how his guard is broken)');}
// ---- noć 16. 11., protivnik 1: sabljaš, varka i dvostruki rez, korak unazad ----
{const sab=async()=>{const w=await start('selo');const {p}=api.state();api.ownedSkills().add('kontra');const e=w.enemies.find(e=>!e.champion&&!e.perch&&!e.look&&e.type==='sword');
  for(const o of w.enemies)if(o!==e)o.alive=false;Object.assign(e,{x:p.x+90,y:p.y,stun:0,mode:'idle',timer:9,hp:999,maxHp:999,lunge:null,grounded:true,spava:false,patrola:false,alert:true});p.face=1;p.invuln=0;p.hp=p.maxHp;return{p,e};};
 let n=0;for(let i=0;i<400;i++){const e={type:'sword',mode:'idle'};api.startWindup(e,null,80);if(e.varka)n++;}
 ok(n>60&&n<180,`varka: now and then (${n} of 400 swings), not every time`);
 {const {p,e}=await sab();e.mode='windup';e.timer=.02;e.windupDuration=.7;e.varka=true;const hp=p.hp;step(4);
  ok(e.mode==='recover'&&e.varkaT>0&&!e.varka,'varka: he swings and stops');step(120);ok(p.hp===hp&&!e.dvaRez,'varka: no blow falls on a Marko who waited');}
 {const {p,e}=await sab();e.mode='windup';e.timer=.06;e.windupDuration=.7;e.varka=true;api.pressed.add('KeyL');step(1);ok(p.parry>0,'Marko parries the golden sign');
  for(let i=0;i<30&&!e.dvaRez;i++)step(1);ok(e.dvaRez,'varka: parried into thin air, the double cut comes');
  const hp=p.hp;let h1=0;for(let i=0;i<120;i++){step(1);if(!h1&&p.hp<hp)h1=p.hp;p.invuln=0;}ok(h1&&p.hp<h1,'dvostruki rez: two cuts, one after the other');}
 {const {p,e}=await sab();e.mode='windup';e.timer=.02;e.windupDuration=.7;e.varka=false;e.chainLeft=0;e.inChain=true;const x0=e.x;step(60);
  ok(e.x>x0+30,'after his blow the sabljaš steps back quickly');}}
// ---- noć 16. 11., protivnik 2: strelac drži razdaljinu (salto) i pušta kišu strela ----
{const strelac=async dx=>{const w=await start('selo');const {p}=api.state();for(const o of w.enemies)o.alive=false;p.invuln=0;p.hp=p.maxHp;p.face=1;
  const e={id:7790,x:p.x+dx,y:p.y,vx:0,vy:0,w:36,h:75,hp:300,maxHp:300,type:'archer',zone:w.enemies[0]?.zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:p.x+dx,attackId:0,grounded:true,alert:true};w.enemies.push(e);return{p,e,w};};
 {const {p,e}=await strelac(110);step(2);ok(e.salto>0&&e.lunge?.v>0,'strelac: Marko comes close, he flips back (salto)');
  step(60);ok(e.x>p.x+220,'strelac: the flip takes him out of reach');for(let i=0;i<40&&e.mode!=='windup';i++)step();ok(e.mode==='windup'&&e.windupDuration<.7,'strelac: he lands and draws his bow at once');
  e.x=p.x+110;e.mode='idle';e.timer=9;step(2);ok(!(e.salto>0),'strelac: not again at once (a rest between flips)');}
 {let n=0;for(let i=0;i<300;i++){const e={type:'archer',mode:'idle',grounded:true};api.startWindup(e,null,400);if(e.kisa)n++;}ok(n>60&&n<200,`kiša strela: now and then (${n} of 300 shots from afar)`);
  let c=0;for(let i=0;i<100;i++){const e={type:'archer',mode:'idle',grounded:true};api.startWindup(e,null,120);if(e.kisa)c++;}ok(c===0,'kiša strela: never from close by');}
 {const {p,e}=await strelac(420);e.mode='windup';e.timer=.01;e.windupDuration=1;e.kisa=true;step(2);const K=api.kise()[0];
  ok(K&&K.xs.length===5&&K.xs.some(s=>Math.abs(s.x-p.x)<20),'kiša strela: shot upward, five arrows will fall where Marko stood');
  const hp=p.hp;for(let i=0;i<300;i++){step();p.invuln=0;}ok(p.hp<hp,'kiša strela: a Marko who stands still is hit');ok(api.kise().length===0,'kiša strela: the rain is over');}
 {const {p,e}=await strelac(420);e.mode='windup';e.timer=.01;e.windupDuration=1;e.kisa=true;step(2);e.alive=false;const hp=p.hp;api.keys.add('KeyD');step(110);api.keys.delete('KeyD');for(let i=0;i<120;i++){step();p.invuln=0;}
  ok(p.hp===hp,'kiša strela: a Marko who gets clear of the shadows is not hit');}}
// ---- noć 16. 11., protivnik 3: kopljanik, dugi ubod i zid koplja ----
{const koplje=async(dx,hp=300)=>{const w=await start('selo');const {p}=api.state();for(const o of w.enemies)o.alive=false;p.invuln=0;p.hp=p.maxHp;p.face=1;p.parry=0;
  const e={id:7795,x:p.x+dx,y:p.y,vx:0,vy:0,w:36,h:75,hp,maxHp:100,type:'kopljanik',zone:w.enemies[0]?.zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:p.x+dx,attackId:0,grounded:true,alert:true,ubodCd:0};e.maxHp=300;w.enemies.push(e);return{p,e};};
 const udri=(p,e,face,air=false)=>{const y0=p.y;Object.assign(p,{face,attack:.2,attackKind:'light',combo:0,airAtk:false,attackId:(p.attackId||0)+100,grounded:!air});for(let i=0;i<12&&e.hitId!==p.attackId;i++){if(air){p.y=y0-40;p.vy=-60;p.grounded=false;}p.attack=.2;p.face=face;step(1);}p.attack=0;if(air){p.y=y0;p.vy=0;p.grounded=true;}};
 {const {p,e}=await koplje(450);step(2);ok(e.ubod&&e.mode==='windup','kopljanik: from afar he readies the long thrust (golden sign)');
  const hp=p.hp;for(let i=0;i<150&&p.hp===hp;i++)step();ok(p.hp<hp&&Math.abs(e.x-p.x)<220,'kopljanik: the thrust crosses half the screen and strikes');}
 {const {p,e}=await koplje(450);step(2);for(let i=0;i<150&&!(e.pendingHit&&e.pendingHit.t<.1);i++)step();p.parry=.3;p.face=1;const hp=p.hp;for(let i=0;i<40&&!(e.stun>0);i++)step();ok(e.stun>0&&p.hp===hp,'kopljanik: the long thrust can be parried');}
 {const {p,e}=await koplje(110,140);step(2);ok(e.gardT>0,'kopljanik: wounded, he sets his spear before him (zid koplja)');
  const h0=e.hp;udri(p,e,1);ok(e.hp===h0,'zid koplja: from the front nothing gets through');
  udri(p,e,1,true);ok(e.hp<h0,'zid koplja: a blow from above does');
  Object.assign(e,{x:p.x-70,y:p.y,face:-1,vx:0,vy:0,grounded:true,air:false,juggle:0,stun:0,gardT:1.5,lunge:null});const h1=e.hp;udri(p,e,-1);ok(e.hp<h1&&!(e.gardT>0),'zid koplja: a blow from behind breaks his wall');}
 {const {p,e}=await koplje(110,140);step(2);const hp=p.hp;for(let i=0;i<150;i++){step();p.invuln=0;}ok(p.hp<hp,'zid koplja: who stands before the spear is jabbed');}}
// ---- noć 16. 11., protivnik 4: akindžija, munja i prolaz kroz Marka ----
{const akin=async(dx,extra={})=>{const w=await start('selo');const {p}=api.state();for(const o of w.enemies)o.alive=false;p.invuln=0;p.hp=p.maxHp;p.face=1;p.attack=0;
  const e={id:7799,x:p.x+dx,y:p.y,vx:0,vy:0,w:36,h:75,hp:300,maxHp:300,type:'akindzija',zone:w.enemies[0]?.zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:p.x+dx,attackId:0,grounded:true,alert:true,dodgeReady:false,...extra};w.enemies.push(e);return{p,e};};
 {let n=0;for(let k=0;k<14&&!n;k++){const {p,e}=await akin(110,{prolazCd:99,munjaCd:0});Object.assign(p,{face:1,attack:.3,attackKind:'light',combo:0,attackId:(p.attackId||0)+500+k});step(1);if(e.lunge?.v>0&&e.munjaTrag>0)n++;}
  ok(n>0,'akindžija: when Marko swings he jerks aside like lightning (munja)');}
 {const {p,e}=await akin(240,{prolazCd:0,munjaCd:99});for(let i=0;i<240&&!e.prolazW;i++)step(1);ok(e.prolazW&&e.mode==='windup','akindžija: he readies the rush (red cross)');
  for(let i=0;i<120&&!e.prolaz;i++)step(1);ok(!!e.prolaz,'akindžija: he rushes at Marko');const hp0=p.hp;let past=false;
  for(let i=0;i<120&&e.prolaz;i++){step(1);if(e.x<p.x-40)past=true;}ok(past&&p.hp===hp0,'akindžija: straight through Marko to the other side');
  ok(e.ledja&&e.face===1,'akindžija: he turns to strike from behind');for(let i=0;i<120&&p.hp===hp0;i++){step(1);p.invuln=0;}ok(p.hp<hp0,'akindžija: the blow from behind lands on a Marko who stood');}
 {const {p,e}=await akin(240,{prolazCd:0,munjaCd:99});for(let i=0;i<360&&!e.ledja;i++)step(1);step(18);const hp0=p.hp;p.dashCooldown=0;api.ownedSkills().add('kolut');api.keys.add('KeyD');api.pressed.add('ShiftLeft');step(1);api.keys.delete('KeyD');
  for(let i=0;i<120;i++)step(1);ok(p.hp===hp0,'akindžija: a roll gets away from the blow from behind');}}
console.log(`\n${checks} checks passed.`);
