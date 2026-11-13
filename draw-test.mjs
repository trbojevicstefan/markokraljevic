// Draws the game headless on a canvas that accepts every call, to catch drawing errors: node draw-test.mjs
// Kačanik (travellers, Ravijojla's bridge, the gallop, Musa's lances and the grapple), and every pohod with its puzzle and champion,
// a finish (the head flies), blood on planks, bones.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
// the game rolls dice; the tests play the same game every time (SEED=<n> plays another)
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const any=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:k==='data'?new Uint8ClampedArray(64):k==='width'||k==='height'?64:k==='canvas'?{width:1280,height:720}:any(),apply:()=>any(),set:()=>true});
const canvas=()=>({width:1280,height:720,style:{},getContext:()=>any(),addEventListener(){},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{...canvas(),hidden:false,value:'normal',checked:false,textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},querySelector(){return null;},querySelectorAll(){return[];}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// the powers of the road (shrines, marko-moci) are all found, unless a test takes them away
storage.set('marko-moci',JSON.stringify(['trag','kombo','potres','oko','krilo','lanac','nalet','gaz','zidotrk']));
const window={addEventListener(){}};
class Image{constructor(){this.width=64;this.height=64;this.naturalWidth=64;this.naturalHeight=64;}set src(v){queueMicrotask(()=>this.onload?.());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url.split('?')[0],'utf8');return{ok:true,json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('__any','physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startChapter,startLevel,update,draw,keys,pressed,LEVELS,state:()=>({p,world,mode,boss,arrows,heads,bones,corpses})};')(any,physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
await new Promise(r=>setTimeout(r,300));   // the rig and the art load
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
let frames=0;const look=(n=1)=>{for(let i=0;i<n;i++){step(8);api.draw(1/15);frames++;}};
const S=()=>api.state();const safe=()=>{S().p.invuln=99;S().p.hp=S().p.maxHp;};
// Kačanik
api.startChapter(0);look(30);Object.assign(S().p,{x:1800});safe();look(160);
api.startChapter(1);Object.assign(S().p,{x:physics.chapters[1].end-640});safe();look(80);
api.startChapter(3);Object.assign(S().p,{x:10960});api.pressed.add('KeyE');look(40);
api.startChapter(5);safe();look(120);const b=S().boss;b.stage='duel';b.phase=2;for(const m of['throwUp','unarmed','catch','stompPrep','stomp','slashPrep','slash','roar']){b.mode=m;b.timer=.5;if(m==='unarmed')b.drop={x:S().p.x,t:.3};look(3);}
b.hp=1;b.mode='open';b.timer=2;look(2);b.stage='kostac';b.mode='pin';b.pinT=12;b.vila=true;b.vilaAt=1;b.look=true;S().p.pinned=true;look(6);b.mode='noz';b.timer=1;look(6);
// a finish, blood, bones
api.startChapter(0);{const e=S().world.enemies.find(e=>e.type==='sword');Object.assign(S().p,{x:e.x-90,face:1});safe();for(const key of['KeyJ','KeyK','ShiftLeft','Space']){api.startChapter(0);const f=S().world.enemies.find(e=>e.type==='sword');Object.assign(S().p,{x:f.x-90,face:1,grounded:true});safe();Object.assign(f,{stun:9,mode:'stun',hp:f.maxHp*.2});for(let n=0;n<40&&!(f.finT>0);n++)look(1);api.pressed.add(key);look(20);}step(120*12);look(4);}
// every pohod: its road, its puzzle, its champion
storage.set('marko-kacanik','won');
for(let i=0;i<api.LEVELS.length;i++){await api.startLevel(i,'day');safe();look(6);const w=S().world;
 for(const t of w.traps||[]){const x=t.gate?.x??t.pulley?.x??t.gap?.x0??t.x;if(x==null)continue;Object.assign(S().p,{x:x-200});safe();look(4);}
 const c=w.enemies.find(e=>e.champion);if(c){const q=w.platforms.filter(q=>q.ground&&c.arena.x0+150>q.x&&c.arena.x0+150<q.x+q.w).sort((a,b)=>a.y-b.y)[0];Object.assign(S().p,{x:c.arena.x0+150,y:q.y,vx:0,vy:0,grounded:true});safe();look(240);}}
assert.equal(S().mode==='play'||S().mode==='levelDone'||S().mode==='dead',true);
console.log(`PASS ${frames} frames drawn headless across Kačanik, Musa's stages, a finish and all ${api.LEVELS.length} pohodi, without an error`);
