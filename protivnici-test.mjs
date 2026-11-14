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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,pohodSnaga,hardenFoes,state:()=>({p,world})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
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
 const gy=p.y,e={id:7777,x:p.x+120,y:gy,vx:0,vy:0,w:36,h:75,hp:300,maxHp:300,type:'akindzija',zone:w.enemies[0]?.zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:p.x+120,attackId:0,grounded:true};w.enemies.push(e);
 let slipped=0;for(let k=0;k<12&&!slipped;k++){Object.assign(e,{x:p.x+120,mode:'idle',timer:9,stun:0,izmakCd:0,lunge:null,hp:300});p.face=1;p.attack=.3;p.attackKind='heavy';p.attackId=(p.attackId||0)+1000+k;step(1);if(e.lunge&&e.lunge.v>0)slipped++;p.attack=0;step(40);}
 ok(slipped>0,'izmiče: the raider steps back from a heavy blow');
 const s={...e,id:7778,type:'shield',x:p.x+120,izmakCd:0,lunge:null};w.enemies.push(s);e.alive=false;let shieldSlip=0;
 for(let k=0;k<8;k++){Object.assign(s,{x:p.x+120,mode:'idle',lunge:null});p.attack=.3;p.attackKind='heavy';p.attackId=(p.attackId||0)+2000+k;step(1);if(s.lunge)shieldSlip++;p.attack=0;step(10);}
 ok(shieldSlip===0,'izmiče: the shield-bearer stands his ground (the heavy blow is how his guard is broken)');}
console.log(`\n${checks} checks passed.`);
