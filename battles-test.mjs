// The new battles, headless with real input: node battles-test.mjs
// Reinforcements that arrive from somewhere, the travellers Musa keeps off the road, the mounted fight in chapter IV,
// Musa's duel in stages (lances, sabres, maces, hand to hand) and each champion's own way of fighting in the pohodi.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){},querySelector(){return null;}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {start,startChapter,startLevel,update,keys,pressed,LEVELS,state:()=>({p,world,mode,level,zone,boss,arrows,fires,horseMounted,camera})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const S=()=>api.state();
const tap=k=>{api.keys.add(k);api.pressed.add(k);step();api.keys.delete(k);};
const until=(cond,max=120*20)=>{for(let i=0;i<max;i++){if(cond())return true;step();}return cond();};
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const safe=()=>{const {p}=S();p.invuln=99;p.hp=p.maxHp;};
// the rig the browser loads, so the art-dependent paths (Musa's horse, the beg's horse) are the real ones
{const rig=JSON.parse(await fs.readFile('dist/assets/sprite-rig.json','utf8'));globalThis.__rig=rig;}

// ---- reinforcements run in from beyond the screen or leap down from the rocks; none appears in view ----
{api.startChapter(1);const {world}=S(),end=physics.chapters[1].end;world.enemies.filter(e=>e.zone===1).forEach(e=>e.alive=false);
 S().p.x=end-700;safe();step(240);S().p.x=end-640;const before=new Set(world.enemies.map(e=>e.id));until(()=>world.enemies.some(e=>!before.has(e.id)),120*3);
 const cam=S().camera,fresh=world.enemies.filter(e=>!before.has(e.id));
 ok(fresh.length===3&&fresh.every(e=>e.enter),'waves: a wave of three arrives');
 ok(fresh.every(e=>e.x<cam-50||e.x>cam+1280/1.15+50||e.y<400),'waves: each one starts beyond the edge of the screen or above it');
 step(120*4);ok(fresh.every(e=>!e.enter&&e.y===590),'waves: they come in and stand on the road to fight');}

// ---- the travellers: they wait with Marko, follow him, and run through the gate of chapter II while he holds it ----
{api.startChapter(0);const T=S().world.travelers;ok(T.length===4&&T.every(t=>t.state==='camp'),'travellers: four of them wait where the road begins');
 S().p.x=1200;safe();step(30);ok(T.every(t=>t.state==='follow'),'travellers: they follow when Marko goes ahead');
 api.startChapter(1);const T2=S().world.travelers,end=physics.chapters[1].end;step(2);ok(T2.every(t=>t.state==='follow'&&t.x>physics.chapters[1].start),'travellers: in chapter II they are with him');
 S().world.enemies.filter(e=>e.zone===1).forEach(e=>e.alive=false);S().p.x=end-600;safe();step(10);
 ok(T2.every(t=>t.state==='flee'),'travellers: the defense begins and they run for the gate');
 until(()=>T2.every(t=>t.state==='safe'),120*90);ok(T2.every(t=>t.state==='safe'),'travellers: all of them get through');}

// ---- chapter IV: Šarac tramples the road guards; a shield stops the horse ----
{api.startChapter(3);const {world}=S();const road=world.enemies.filter(e=>e.road&&e.alive);ok(road.length>=6,'gallop: Musa\'s men stand on the gallop road');
 const p=S().p;p.x=physics.chapters[3].start+200;api.keys.add('KeyE');step(2);api.keys.clear();safe();
 const horse=S().world;const sword=road.find(e=>e.type==='sword');Object.assign(S().p,{x:sword.x-140,y:590,grounded:true});
 if(!S().horseMounted){const st=S();st.p.x=st.world.enemies[0]?.x??st.p.x;}
 // mount where Šarac waits, then ride into the guard
 api.startChapter(3);const s=S();s.p.x=10960;api.pressed.add('KeyE');api.keys.add('KeyE');step(3);api.keys.clear();ok(S().horseMounted,'gallop: Marko mounts Šarac');
 const g=S().world.enemies.find(e=>e.road&&e.alive&&e.type==='sword');Object.assign(S().p,{x:g.x-160,y:590,vy:0,grounded:true});safe();api.keys.add('KeyD');until(()=>!g.alive,120*2);api.keys.clear();
 ok(!g.alive,'gallop: at full gallop Šarac tramples a guard');
 const sh=S().world.enemies.find(e=>e.road&&e.alive&&e.type==='shield');Object.assign(S().p,{x:sh.x-160,y:590,vy:0,grounded:true});safe();api.keys.add('KeyD');step(60);api.keys.clear();
 ok(sh.alive,'gallop: a shield-bearer stops the horse');}

// ---- Musa: lances on horseback, then sabres and maces, then hand to hand and the hidden knife ----
{api.startChapter(5);step(2);const {boss}=S();ok(boss.stage==='joust'&&boss.mounted&&S().horseMounted,'musa: the duel opens on horseback with lances');
 for(let pass=0;pass<8&&boss.stage==='joust';pass++){safe();
  until(()=>boss.mode==='jRide'&&Math.abs(boss.x-S().p.x)<230&&Math.sign(S().p.x-boss.x)===boss.dir,120*8);
  S().p.face=-boss.dir;tap('KeyJ');until(()=>boss.mode!=='jRide',120*4);}
 ok(boss.jHits>=3,'musa: J as he passes strikes him: three hits break the lances');
 until(()=>boss.stage==='duel',120*4);ok(boss.stage==='duel'&&!S().horseMounted&&!boss.mounted,'musa: the lances broken, both fight on foot');
 boss.mode='open';boss.timer=3;boss.hp=20;Object.assign(S().p,{x:boss.x-90,face:1,y:590,grounded:true,attack:0,cooldown:0});safe();tap('KeyK');step(60);
 ok(boss.alive&&boss.stage==='kostac','musa: his last heart broken, he does not fall: he grapples');
 until(()=>boss.mode==='pin',120*4);ok(S().p.pinned,'musa: he throws Marko down and holds him');
 ok(S().p.rage===0&&S().p.energy===0,'musa: Marko\'s strength leaves him');
 const hp0=S().p.hp;step(120*3);ok(S().p.hp<hp0&&S().p.hp>=1,'musa: held down, Marko weakens but does not die');
 until(()=>boss.vila,120*8);ok(boss.vila,'musa: Ravijojla calls from the cloud');
 until(()=>boss.look,120*12);ok(boss.look,'musa: Musa looks up at her');
 step(120);tap('KeyE');ok(boss.mode==='noz','musa: E draws the hidden knife');
 until(()=>S().mode==='victory',120*4);ok(S().mode==='victory','musa: and the song ends as it should');}

// ---- the champions: each fights his own way, on his own ground ----
const levelOf=id=>api.LEVELS.findIndex(L=>L.id===id);
async function arena(id){await api.startLevel(levelOf(id),'day');api.keys.clear();api.pressed.clear();const w=S().world,c=w.enemies.find(e=>e.champion);for(const e of w.enemies)if(e!==c)e.alive=false;
 const q=w.platforms.filter(q=>q.ground&&c.arena.x0+150>q.x&&c.arena.x0+150<q.x+q.w).sort((a,b)=>a.y-b.y)[0];Object.assign(S().p,{x:c.arena.x0+150,y:q.y,vx:0,vy:0,grounded:true,climb:null});safe();step(3);return c;}
{const c=await arena('tvrdjava');ok(c.kit==='hasan'&&c.engaged,'hasan: Hasan-aga waits in the fortress');ok(S().world.platforms.filter(q=>q.pillar&&q.x>c.arena.x0&&q.x<c.arena.x1).length===2,'hasan: two pillars stand in his arena');
 c.kc=0;until(()=>c.ks==='ram',120*6);ok(c.ks==='ram','hasan: he lowers his head and charges');until(()=>c.stun>0,120*5);ok(c.stun>0&&c.kitOpen>0,'hasan: he slams into a pillar or the wall and reels');}
{const c=await arena('prevoj');ok(c.kit==='beg'&&c.mounted,'beg: the akindži beg rides');step(60);ok(c.ks==='ride'&&Math.abs(c.vx)>300,'beg: he gallops at Marko');
 c.hp=c.maxHp*.5;until(()=>c.mounted===false,120*3);ok(!c.mounted,'beg: brought low, he is thrown from his horse');}
{const c=await arena('podrum');ok(c.kit==='ognjeni','ognjeni: the fire aga in the cellar');c.kc=0;c.mode='idle';until(()=>S().fires.length>=6,120*6);ok(S().fires.length>=6,'ognjeni: the oil burns across the floor');
 ok(S().world.platforms.filter(q=>q.arena).length===3,'ognjeni: three planks above the fire');}
{const c=await arena('rudnik');ok(c.kit==='bajraktar','bajraktar: the standard-bearer in the mine');step(2);ok(c.flag?.up,'bajraktar: his banner stands on the rock');
 const F=c.flag;for(let i=0;i<3;i++){Object.assign(S().p,{x:F.x-50,y:F.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});safe();tap('KeyJ');step(50);}
 ok(!F.up,'bajraktar: three blows bring the banner down');}
{const c=await arena('reka');ok(c.kit==='janicar','janicar: the janissary aga by the river');const plank=S().world.platforms.find(q=>q.arena&&q.y<c.y-200);
 Object.assign(S().p,{x:plank.x+plank.w/2,y:plank.y,vx:0,vy:0,grounded:true});safe();c.kc=0;c.mode='idle';until(()=>c.ks==='leap',120*4);ok(c.ks==='leap','janicar: Marko on a high plank, he leaps after him');}
{const c=await arena('rusevine');ok(c.kit==='arapin'&&c.type==='arapin','arapin: the Arab in the ruins, in his own picture');ok(Math.abs(c.y-c.arena.top)<2,'arapin: he stands on top of his tower');
 c.kc=0;c.mode='idle';until(()=>S().arrows.some(a=>a.spear),120*5);ok(S().arrows.some(a=>a.spear),'arapin: he throws spears down');}
{const c=await arena('mocvara');ok(c.kit==='basa'&&c.perch,'basa: the musketeer captain on his watchtower');
 Object.assign(S().p,{x:c.x-100,y:c.arena.deck,vx:0,vy:0,grounded:true});safe();until(()=>c.ks==='leap',120*3);ok(c.ks==='leap','basa: Marko climbs up and he jumps down');}
{const c=await arena('suma');ok(c.kit==='lovac','lovac: the hunter in the forest');until(()=>S().world.enemies.filter(e=>e.pack).length>=2,120*4);ok(S().world.enemies.filter(e=>e.pack&&e.alive).length>=2,'lovac: his horn calls the hounds');}
console.log(`${checks} battle checks passed.`);
