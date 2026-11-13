// Every megdan played with the second set of Lost Crown moves, headless and with real input: node megdani-test.mjs
// A bot fights each champion of the pohodi, Musa in his stages and each boss of the greybox levels, and in each fight it throws
// everything new at him in turn: the slide, the launcher and the air blows, the chain, the eye, the fairy's trace, the quake,
// Šarac's trample, a mark and the map. Nothing may throw, no position may become NaN, Marko must stay in the ring, a blow
// may never land where the fight's own rules forbid it (a champion between acts, the banner on the rock, Musa's closed guard),
// no new move may stun a champion, and every fight must still end the way it ends with the mace.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
// the game rolls dice; the tests play the same game every time (SEED=<n> plays another)
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){},querySelector(){return null;},querySelectorAll(){return[];}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// the powers of the road (shrines, marko-moci) are all found, unless a test takes them away
storage.set('marko-moci',JSON.stringify(['trag','kombo','potres','oko','krilo','lanac','nalet','gaz','zidotrk']));
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,greybox,topAt}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,startChapter,startGreybox,update,keys,pressed,LEVELS,closeKarta,closeIzvor,izaberiUdar,udari,resetMoci2:()=>{amCache=null;udarCache=null;udarNext=0;},MUSA_OPEN,pushFlag:(x,y)=>ckptFlags.push({x:x-34,y,t:time}),state:()=>({p,world,mode,level,zone,arena,boss,gaz,talasi,ckpt,finisher,grapple})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
{const rig=JSON.parse(await fs.readFile('dist/assets/sprite-rig.json','utf8'));globalThis.__rig=rig;}
// monitor: a check run around every single update while it is set
let monitor=null;
const step=(n=1)=>{for(let i=0;i<n;i++){const m=monitor?.();api.update(1/120);if(m)m();}};
const S=()=>api.state(),P=()=>S().p;
const press=k=>{api.keys.add(k);api.pressed.add(k);},release=k=>api.keys.delete(k);
const tap=k=>{press(k);step();release(k);};
let checks=0;const SOFT=process.argv.includes('--soft');let fails=0;const ok=(cond,msg)=>{if(SOFT&&!cond){fails++;console.log('FAIL',msg);return;}assert(cond,msg);checks++;console.log('PASS',msg);};
storage.set('marko-skills',JSON.stringify(['niz','zid','kontra','kolut','juris','uvis','nadole','zamah','tresak','bacanje','vihor','junacki','uzlet']));
const fin=v=>Number.isFinite(v);
// the bot carries the two new heroic blows: the quake on F, Šarac on R
storage.set('marko-udari',JSON.stringify(['potres','gaz']));api.resetMoci2();
// the champion's ring: the pohod arena, or the greybox room he waits in
const ring=c=>c.arena&&fin(c.arena.x0)?[c.arena.x0,c.arena.x1]:[c.x-900,c.x+900];

// one fight: the bot keeps facing the champion and goes through every new move in turn, real keys only
function fight(c,seconds,tag,o={}){const [x0,x1]=ring(c),bad=[],seen=new Set(),blk=[];let lo=1e9,hi=-1e9,beat=0;
 const ready=()=>{for(let k=0;k<180;k++){const q=P();if(q.grounded&&!(q.attack>0)&&!(q.cooldown>0)&&!q.lanac&&!(q.down>0)&&!(q.dash>0)&&!(q.slide>0)&&!(q.spin>0)&&!(q.castLock>0)&&!(q.hurt>0))return true;step();}const q=P();blk.push(`g${+!!q.grounded} a${(q.attack||0).toFixed(2)} c${(q.cooldown||0).toFixed(2)} l${+!!q.lanac} d${(q.down||0).toFixed(1)} h${(q.hurt||0).toFixed(1)} cl${(q.castLock||0).toFixed(1)}`);return false;};
 const face=()=>{const P0=P();if(Math.sign(c.x-P0.x)!==P0.face&&Math.abs(c.x-P0.x)>20)tap(c.x>P0.x?'KeyD':'KeyA');};
 const moves=[
  ()=>{face();tap('KeyJ');},()=>{face();tap('KeyJ');},()=>{face();tap('KeyK');},
  ()=>{ready();face();press('KeyW');tap('KeyK');release('KeyW');if(P().launcher)seen.add('podizač');step(14);tap('Space');step(10);tap('KeyJ');step(20);tap('KeyJ');step(20);tap('KeyJ');},
  ()=>{face();tap('KeyC');if(P().lanac)seen.add('lanac');},
  ()=>{ready();P().rage=100;face();tap('KeyF');if(P().potresT>0)seen.add('potres');},
  ()=>{ready();P().rage=100;face();tap('KeyR');if(S().gaz)seen.add('gaz');},
  ()=>{const d=c.x>P().x?'KeyD':'KeyA',away=d==='KeyD'?'KeyA':'KeyD';press(away);step(40);release(away);press(d);step(24);press('KeyS');step(2);tap('ShiftLeft');if(P().slide>0)seen.add('klizanje');step(30);release('KeyS');release(d);},
  ()=>{tap('KeyV');if(P().trag)seen.add('trag');step(40);tap('KeyV');},
  ()=>{press('KeyO');step(50);if(P().oko)seen.add('oko');release('KeyO');},
  ()=>{face();tap('KeyL');},
  ()=>{tap('KeyB');},
  ()=>{tap('KeyM');if(S().mode==='karta'){seen.add('karta');api.closeKarta();}},
  ()=>{tap('Space');step(20);tap('ShiftLeft');step(20);tap('Space');},
  ()=>{tap('KeyE');}];
 const steps=Math.round(seconds*120);let i=0;
 if(o.musa)monitor=()=>{const B=S().boss,h=B.hp,open=api.MUSA_OPEN.includes(B.mode),st=B.stage,kind=P().attackKind;return()=>{if(st!=='joust'&&st!=='kostac'&&!open&&B.hp<h-.01&&!api.MUSA_OPEN.includes(B.mode)&&kind!=='super'&&P().attackKind!=='super')bad.push(`${tag}: Musa hurt through a closed guard (${B.mode}, ${kind}, ${(h-B.hp).toFixed(0)}) on move ${(beat-1)%moves.length}`);};};
 while(i<steps&&c.alive&&!(o.stop?.())){
  const P0=P();if(S().mode!=='play'){if(S().mode==='karta')api.closeKarta();else if(S().mode==='izvor')api.closeIzvor();else break;}
  P0.hp=Math.max(P0.hp,P0.maxHp*.6);if(o.keep)o.keep();if(!o.musa&&c.hp<c.maxHp*.2&&!(c.invT>0))c.hp=c.maxHp*.35;
  const before={hp:c.hp,invT:c.invT||0,flag:!!c.flag?.up,open:(c.kitOpen||0)>0,stun:c.stun||0,musa:S().boss?.hp,musaOpen:api.MUSA_OPEN.includes(S().boss?.mode),stage:S().boss?.stage};
  try{const m=moves[beat++%moves.length];m();step(12);i+=60;}catch(err){bad.push(`${tag}: move ${(beat-1)%moves.length} threw ${err.stack.split('\n').slice(0,2).join(' ')}`);break;}
  const P1=P();lo=Math.min(lo,P1.x);hi=Math.max(hi,P1.x);
  if(![P1.x,P1.y,P1.vx,P1.vy,c.x,c.y,c.hp].every(fin))bad.push(`${tag}: NaN (p ${P1.x},${P1.y} c ${c.x},${c.y},${c.hp})`);
  if(before.invT>.25&&c.invT>0&&c.hp<before.hp-.01)bad.push(`${tag}: hurt between acts (${before.hp.toFixed(0)}→${c.hp.toFixed(0)}) after move ${(beat-1)%moves.length}`);
  if(before.flag&&c.flag?.up&&!before.open&&c.kit==='bajraktar'&&c.hp<before.hp-.01)bad.push(`${tag}: hurt while his banner stands (move ${(beat-1)%moves.length})`);
 }
 fight.end={i,steps,alive:c.alive,mode:S().mode,beat};
 if(c.alive&&x1-x0<2000&&(lo<x0-60||hi>x1+60))bad.push(`${tag}: Marko left the ring (${Math.round(lo)}..${Math.round(hi)} of ${Math.round(x0)}..${Math.round(x1)})`);
 monitor=null;fight.seen=seen;fight.blk=blk;return bad;}
const levelOf=id=>api.LEVELS.findIndex(L=>L.id===id);
async function arena(id){await api.startLevel(levelOf(id),'day');api.keys.clear();api.pressed.clear();const w=S().world,c=w.enemies.find(e=>e.champion);if(!c)return null;for(const e of w.enemies)if(e!==c&&!e.trioMate)e.alive=false;
 const q=w.platforms.filter(q=>q.ground&&c.arena.x0+150>q.x&&c.arena.x0+150<q.x+q.w).sort((a,b)=>a.y-b.y)[0];Object.assign(P(),{x:c.arena.x0+150,y:q?q.y:c.arena.y,vx:0,vy:0,grounded:true,climb:null});step(3);P().noMace=false;c.topuz=null;return c;}
// a champion brought down: the last blows are the mace's, and the fight ends as it always does
function finish(c,tag){for(let i=0;i<120*12&&c.alive;i++){const P0=P();P0.hp=P0.maxHp;if(S().finisher||S().grapple){if(i%8===0)tap(P0.hvat||'KeyJ');else step();continue;}
  if(i%30)  {step();continue;}
  c.hp=Math.min(c.hp,1);c.invT=0;c.armor=0;if(c.flag)c.flag.up=false;c.kitOpen=1;c.mounted=false;
  const side=Math.sign(P0.x-c.x)||-1;Object.assign(P0,{x:c.x+side*50,y:c.y,vx:0,vy:0,grounded:true,climb:null,face:-side,attack:0,cooldown:0,down:0,dash:0});tap('KeyK');}
 return!c.alive;}

const report=[],ALL=['podizač','lanac','potres','gaz','klizanje','trag','oko','karta'];
// ---- the pohodi: every champion ----
const champs=[];for(const L of api.LEVELS){if(L.izazov||L.secret)continue;await api.startLevel(api.LEVELS.indexOf(L),'day');const c=S().world.enemies.find(e=>e.champion);if(c)champs.push(L.id);}
for(const id of champs){const c=await arena(id);const tag=`${id} (${c.kit||c.type})`;
 const bad=fight(c,40,tag);for(const b of bad){report.push(b);console.log('  ',b);}const seen=[...fight.seen];if(!ALL.every(m=>seen.includes(m)))console.log('   end',JSON.stringify(fight.end),'blk',fight.blk.slice(0,4).join(' | '));
 const down=finish(c,tag);if(!down)report.push(`${tag}: could not be brought down afterwards`);
 ok(!bad.length&&down&&ALL.every(m=>seen.includes(m)),`megdan ${tag}: 40 s of ${seen.join(', ')}; no error, no blow outside his rules, and he still falls`);}

// ---- the rules, one by one ----
{const c=await arena('rudnik');step(2);const p=P(),hp=c.hp;c.flag.up=true;c.kitOpen=0;Object.assign(p,{x:c.x-120,y:c.y,vx:0,vy:0,grounded:true,face:1,rage:100});tap('KeyF');step(60);p.rage=100;
 const h1=c.hp;ok(h1===hp,'rules: the quake does not reach the standard-bearer while his banner stands');}
{const c=await arena('klisura');const p=P();c.hp=c.maxHp*.49;step(2);const inv=c.invT>0,hp=c.hp;Object.assign(p,{x:c.x-120,y:c.y,vx:0,vy:0,grounded:true,face:1,rage:100});for(let i=0;i<40;i++){c.invT=Math.max(c.invT,.5);step();}tap('KeyF');for(let i=0;i<70;i++){c.invT=Math.max(c.invT,.5);step();}
 ok(inv&&c.hp===hp,'rules: between two acts no quake reaches the champion');}
{const c=await arena('tvrdjava');const p=P();c.kitOpen=0;c.stun=0;c.mode='idle';c.kc=99;c.timer=99;Object.assign(p,{x:c.x-300,y:c.y,vx:0,vy:0,grounded:true,face:1});tap('KeyC');for(let i=0;i<90;i++){c.kc=99;c.timer=99;step();}
 ok(c.stun<=0&&!(c.kitOpen>0),'rules: the chain takes Marko to Hasan-aga but does not stun him (only a pillar does)');
 p.rage=100;const s0=c.stun;Object.assign(p,{x:c.x-200,face:1,attack:0,cooldown:0});tap('KeyR');for(let i=0;i<220;i++){c.kc=99;c.timer=99;step();}ok(!(c.stun>s0+.01)||c.guardBroken>0,'rules: Šarac tramples past Hasan-aga without stunning him');}
{const c=await arena('klisura');const p=P();p.noMace=true;p.rage=100;Object.assign(p,{x:c.x-200,y:c.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});tap('KeyF');ok(!(p.potresT>0)&&p.rage===100,'rules: without his mace Marko cannot drive it into the ground');
 press('KeyW');tap('KeyK');release('KeyW');ok(!p.launcher,'rules: nor throw a foe up with it');p.noMace=false;}

// ---- Musa: lances, then sabres and maces, then hand to hand ----
{api.startChapter(5);step(120);const b=S().boss;ok(b.alive,'musa: the duel begins');
 const c={get alive(){return S().boss.alive&&S().boss.stage!=='kostac';},get x(){return S().boss.x;},get y(){return S().boss.y;},get hp(){return S().boss.hp;},set hp(v){S().boss.hp=v;},arena:{x0:28060,x1:29830}};
 const bad=fight(c,60,'musa',{musa:true});for(const x of bad)report.push(x);const seen=[...fight.seen];ok(!bad.length&&['lanac','potres','gaz','klizanje','oko','karta'].every(m=>seen.includes(m)),`musa: 60 s of ${seen.join(', ')} in his stages (now ${S().boss.stage}), no error and no blow through his closed guard`);
 // the rules: a closed guard takes nothing, an open one takes the quake
 const B=S().boss;if(B.stage!=='joust'&&B.stage!=='kostac'){B.mode='idle';B.timer=99;const p=P();const fresh={vx:0,vy:0,grounded:true,face:1,rage:100,attack:0,cooldown:0,down:0,hurt:0,castLock:0,lying:false,pinned:false,dash:0,spin:0,lanac:null,guardBreak:0};Object.assign(p,{x:B.x-160,y:B.y,...fresh});const h0=B.hp;tap('KeyF');for(let i=0;i<60;i++){B.mode='idle';B.timer=99;step();}
  ok(B.hp===h0,'musa: the quake glances off his closed guard');B.mode='open';B.timer=99;Object.assign(p,{x:B.x-160,y:B.y,...fresh});const h1=B.hp;tap('KeyF');for(let i=0;i<60;i++){B.mode='open';B.timer=99;step();}ok(B.hp<h1,'musa: and hurts him when his guard is open');}}

// ---- the greybox levels: each boss on his roof or tower ----
for(const n of [1,2,3]){api.startGreybox(n);step(2);const w=S().world;for(const e of w.enemies)if(!e.champion)e.alive=false;for(const k of Object.keys(w.gb.moci))w.gb.moci[k]=true;for(const k of ['klizanje','zidotrk','kombo','lanac','oko'])w.gb.moci[k]=true;
 const c=w.enemies.find(e=>e.champion),A=c.arena;Object.assign(P(),{x:A.x0+80,y:A.y,vx:0,vy:0,grounded:true});P().face=1;
 for(let i=0;i<240&&!S().arena;i++){press('KeyD');step();}release('KeyD');const tag=`greybox ${n} (${c.name})`;
 const bad=fight(c,40,tag);for(const b of bad)report.push(b);const seen=[...fight.seen];const down=finish(c,tag);if(!down)report.push(`${tag}: could not be brought down afterwards`);
 ok(!bad.length&&down&&ALL.every(m=>seen.includes(m)),`megdan ${tag}: ${seen.join(', ')}; no error, Marko stays on his roof, and he falls`);}

// ---- the slide is no endless dodge, and E by a banner in a fight is still the fairy's ----
{const c=await arena('selo');const p=P();c.mode='idle';c.kc=99;c.timer=99;Object.assign(p,{x:c.arena.x0+80,y:c.y,vx:0,vy:0,grounded:true,face:1});press('KeyD');step(30);let safeT=0,T=0;
 for(let i=0;i<360;i++){if(i%8===0&&p.grounded){press('KeyS');tap('ShiftLeft');release('KeyS');}else step();T++;if(p.invuln>0||p.dash>0)safeT++;if(p.x>c.arena.x1-120){p.x=c.arena.x0+80;}}
 release('KeyD');ok(safeT/T<.55,`klizanje: slides one after another leave Marko open ${Math.round(100-safeT/T*100)}% of the time`);}
{await api.startLevel(levelOf('manastir'),'day');const w=S().world,p=P();const e=w.enemies.find(e=>!e.champion&&e.alive&&!e.spava);for(const o of w.enemies)if(o!==e)o.alive=false;e.timer=99;
 Object.assign(p,{x:e.x-220,y:e.y,vx:0,vy:0,grounded:true,energy:100,face:1});api.pushFlag(p.x,p.y);step();tap('KeyE');
 ok(S().mode==='play'&&p.energy<100,'izvori: by a banner with a foe close, E still calls Ravijojla and opens no rest');
 e.alive=false;step(240);Object.assign(p,{vx:0,vy:0,grounded:true});tap('KeyE');ok(S().mode==='izvor','izvori: with the foe down, E under the banner is a rest');api.closeIzvor();}

// ---- a megdan with rules of its own: the archery match locks Marko, and nothing new may break it ----
{let L=null;for(const lv of api.LEVELS){await api.startLevel(api.LEVELS.indexOf(lv),'day');if((S().world.traps||[]).some(t=>t.kind==='strela')){L=lv;break;}}
 if(L){const w=S().world,t=w.traps.find(t=>t.kind==='strela'),p=P();for(const e of w.enemies)e.alive=false;Object.assign(p,{x:t.x+60,y:t.y,vx:0,vy:0,grounded:true,face:1});step();tap('KeyE');
  ok(t.state==='aga'&&t.locked,`strela (${L.id}): E begins the archery match with Alil-aga`);
  p.rage=100;tap('KeyF');step(30);tap('KeyR');step(30);tap('KeyC');step(30);press('KeyW');tap('KeyK');release('KeyW');step(30);
  ok(p.rage===100&&!S().gaz&&!S().talasi.length&&!p.lanac&&!p.launcher&&S().mode==='play'&&t.state,'strela: in the match the quake, Šarac, the chain and the launcher stay still, and the match goes on');}}

console.log(report.length?'\n'+report.join('\n'):'');
console.log(`${checks} megdan checks passed.`);
