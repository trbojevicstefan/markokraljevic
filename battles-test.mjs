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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {start,startChapter,startLevel,startTraining,update,keys,pressed,LEVELS,slay,state:()=>({p,world,mode,level,zone,boss,arrows,fires,horseMounted,camera,finisher,heads,corpses,bones,particles,decals})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
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

// ---- a fairy stone by each pit of chapter I: woken, it raises a stone bridge for the travellers ----
{api.startChapter(0);const w=S().world,T=w.travelers;w.enemies.forEach(e=>e.alive=false);Object.assign(S().p,{x:1800,y:590});safe();
 until(()=>T.some(t=>t.waitGap),120*30);ok(T.some(t=>t.waitGap)&&T.every(t=>t.x<905),'stones: at the first pit the travellers wait at the edge');
 const r=w.runes.find(r=>r.road&&r.x<900);Object.assign(S().p,{x:r.x+40,y:590,grounded:true,energy:100});safe();tap('KeyE');step(120);ok(r.active,'stones: E wakes the fairy stone');
 Object.assign(S().p,{x:1800});until(()=>T.every(t=>t.x>1040),120*30);ok(T.every(t=>t.x>1040),'stones: the travellers cross its stone bridge');
 api.startChapter(0);const T2=S().world.travelers;Object.assign(S().p,{x:1200});safe();step(120*8);api.startChapter(1);step(2);ok(S().world.travelers.every(t=>t.x>physics.chapters[1].start),'stones: left at a pit, they still reach chapter II');
 ok(S().world.runes.filter(r=>physics.chapterAt(r.x)===2).length===3,'stones: chapter III still asks for its own three stones');}

// ---- from a crouch the mace is thrown low ----
{storage.set('marko-skills',JSON.stringify(['bacanje']));api.startChapter(0);const p=S().p;Object.assign(p,{energy:100,face:1});safe();api.keys.add('KeyS');step(10);api.pressed.add('KeyI');step(80);api.keys.clear();
 ok(p.lowThrow,'throw: crouching, Marko throws the mace low');}

// ---- the finish: only for a foe under a quarter of his strength, not every time, four buttons, four ends ----
async function finishWith(key){api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,face:1,grounded:true});safe();
 Object.assign(e,{stun:30,mode:'stun',hp:e.maxHp*.2});until(()=>e.finT>0,120*30);const opened=e.finT>0;api.pressed.add(key);step(2);const started=!!S().finisher;step(150);return{e,opened,started};}
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,face:1,grounded:true});safe();
 Object.assign(e,{stun:3,mode:'stun',hp:e.maxHp});step(120*6);ok(!(e.finT>0),'finish: never while the foe is still strong');}
{const r=await finishWith("KeyJ");ok(r.opened&&r.started&&!r.e.alive&&S().heads.length===1&&S().corpses.some(c=>c.headless),'finish: X / J takes the head');}
{const r=await finishWith('KeyK');ok(r.started&&!r.e.alive&&S().corpses.some(c=>c.headless?.fast)&&S().heads.length===0,'finish: Y / K bursts his head under the mace');}
{const r=await finishWith('ShiftLeft');ok(r.started&&!r.e.alive&&S().corpses.some(c=>c.launched),'finish: B / Shift lifts him and hurls him away');}
{const r=await finishWith('Space');ok(r.started&&!r.e.alive&&S().corpses.some(c=>!c.headless&&!c.launched),'finish: A / Space knocks him down and lands on him');}
{let opens=0,tries=0;for(let n=0;n<12;n++){api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,grounded:true});safe();Object.assign(e,{stun:9,mode:'stun',hp:e.maxHp*.2});step(3);tries++;if(e.finT>0)opens++;}
 ok(opens<tries,'finish: the chance does not come every time ('+opens+' of '+tries+')');}
{const r=await finishWith('KeyJ');step(120*4);ok(S().heads.length===1&&S().heads[0].rest,'finish: the head comes to rest on the ground');}

// ---- the training room: foes keep coming, every one of them can be finished at once ----
{api.startTraining();step(120*3);const w=S().world;ok(w.enemies.filter(e=>e.alive).length>=2,'training: foes keep coming');
 const e=w.enemies.find(e=>e.alive);until(()=>e.finT>0||!e.alive,120*6);ok(e.finT>0&&e.hp===e.maxHp,'training: a fresh foe can be finished right away');
 tap('KeyK');step(160);ok(!e.alive,'training: and the finish takes him');step(120*2);ok(w.enemies.filter(e=>e.alive).length>=2,'training: the next ones come');
 api.pressed.add('Digit9');step(120*4);ok(S().world.enemies.filter(e=>e.alive).every(e=>e.type==='pas'),'training: a number picks the kind of foe');}

// ---- on the ground: a foe on top of Marko; mash to throw him off ----
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,face:1,grounded:true,hp:S().p.maxHp,invuln:0});
 for(let n=0;n<20&&!e.grappling;n++){S().p.down=1;S().p.downRolled=false;step(2);S().p.down=0;step(1);}ok(e.grappling&&S().p.pinned,'grapple: knocked down by a janissary, he jumps on Marko with his knife');
 const hp0=S().p.hp;step(120);ok(S().p.hp<hp0,'grapple: held down, Marko bleeds');for(let i=0;i<40;i++){tap('KeyJ');step(4);}step(120);ok(!S().p.pinned&&!e.grappling&&(e.hp<e.maxHp||!e.alive),'grapple: mashing J throws him off and strikes back');}

// ---- blood lands on a plank, not in the air; corpses stay and turn to bones ----
{api.startChapter(0);const w=S().world,q=w.platforms.find(q=>q.y<500);S().particles.length=0;S().decals.length=0;
 S().particles.push({kind:'blood',x:q.x+q.w/2,y:q.y-60,vx:0,vy:0,life:3,max:3,r:3,color:'#900'});step(120);ok(S().decals.some(d=>Math.abs(d.y-q.y)<1),'blood: a drop over a plank lands on the plank');
 S().decals.length=0;S().particles.push({kind:'blood',x:q.x+3,y:q.y-40,vx:0,vy:0,life:3,max:3,r:3,color:'#900'});step(240);ok(S().decals.some(d=>d.streak)&&S().decals.some(d=>d.y===590),'blood: at the edge it runs over and drips to the ground');
 const e=w.enemies.find(e=>e.alive);Object.assign(S().p,{x:e.x-300});safe();e.hp=0;api.slay(e);step(120*5);ok(S().corpses.length===1,'bones: the corpse is still there after five seconds');
 step(120*7);ok(S().corpses.length===0&&(!globalThis.__rig.kosturi||S().bones.length===1),'bones: then it rots to a skeleton that stays');}

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
 ok(!F.up,'bajraktar: three blows bring the banner down');
 c.hp=c.maxHp*.25;Object.assign(S().p,{x:c.x-300});safe();step(20);ok(c.p3&&F.up,'bajraktar: in his last breath he raises the banner again');}
{const c=await arena('tvrdjava');ok(c.maxHp>=1900,'champions: a fight lasts minutes now (Hasan-aga has '+c.maxHp+')');}
{const c=await arena('reka');ok(c.kit==='janicar','janicar: the janissary aga by the river');const plank=S().world.platforms.find(q=>q.arena&&q.y<c.y-200);
 Object.assign(S().p,{x:plank.x+plank.w/2,y:plank.y,vx:0,vy:0,grounded:true});safe();c.kc=0;c.mode='idle';until(()=>c.ks==='leap',120*4);ok(c.ks==='leap','janicar: Marko on a high plank, he leaps after him');}
{const c=await arena('rusevine');ok(c.kit==='arapin'&&c.type==='arapin','arapin: the Arab in the ruins, in his own picture');ok(Math.abs(c.y-c.arena.top)<2,'arapin: he stands on top of his tower');
 c.kc=0;c.mode='idle';until(()=>S().arrows.some(a=>a.spear),120*5);ok(S().arrows.some(a=>a.spear),'arapin: he throws spears down');}
{const c=await arena('mocvara');ok(c.kit==='basa'&&c.perch,'basa: the musketeer captain on his watchtower');
 Object.assign(S().p,{x:c.x-100,y:c.arena.deck,vx:0,vy:0,grounded:true});safe();until(()=>c.ks==='leap',120*3);ok(c.ks==='leap','basa: Marko climbs up and he jumps down');}
{const c=await arena('suma');ok(c.kit==='lovac','lovac: the hunter in the forest');until(()=>S().world.enemies.filter(e=>e.pack).length>=2,120*4);ok(S().world.enemies.filter(e=>e.pack&&e.alive).length>=2,'lovac: his horn calls the hounds');}

// ---- puzzles made by hand ----
async function land(id){await api.startLevel(levelOf(id),'day');api.keys.clear();api.pressed.clear();const w=S().world;for(const e of w.enemies)e.alive=false;return w;}
const strikeAt=(x,y,face)=>{Object.assign(S().p,{x:x-face*40,y,vx:0,vy:0,grounded:true,face,attack:0,cooldown:0,climb:null});safe();tap('KeyJ');step(40);};
{const w=await land('manastir'),t=w.traps.find(t=>t.kind==='bells');ok(t&&t.bells.length===3,'bells: three bells in the monastery');
 const wrong=t.bells.findIndex((b,i)=>i!==t.order[0]);strikeAt(t.bells[wrong].x,t.bells[wrong].y,1);ok(!t.done&&(t.prog||0)===0&&w.enemies.some(e=>e.alive),'bells: the wrong bell calls a guard');
 for(const e of w.enemies)e.alive=false;for(const i of t.order)strikeAt(t.bells[i].x,t.bells[i].y,1);ok(t.done,'bells: rung in the fresco\'s order, the gate opens');}
{const w=await land('pecina'),t=w.traps.find(t=>t.kind==='mirrors');step(2);ok(t&&!t.done&&!t.beam.hit,'mirrors: the beam misses the crystal at first');
 const want=[1,1,0];for(const [i,m] of t.m.entries())if(m.s!==want[i])strikeAt(m.x+(i===0?-10:40),i===0?m.y+60:m.y+55,i===0?1:-1);
 step(2);ok(t.done&&t.beam.hit,'mirrors: turned right, the beam lights the crystal and the gate opens');}
{const w=await land('rudnik'),t=w.traps.find(t=>t.kind==='scale'),[L,R]=t.pans,crate=w.platforms.find(q=>q.kind==='teret'&&q.x<L.x&&q.x>L.x-200);ok(t&&crate,'scale: two pans and an iron crate in the mine');
 Object.assign(S().p,{x:R.x+60,y:R.y,vx:0,vy:0,grounded:true});safe();step(120*2);ok(R.y>R.base+20,'scale: Marko alone sinks his pan');
 Object.assign(S().p,{x:R.x-300,y:590});crate.x=L.x+20;crate.y=L.y-crate.h;step(120*2);Object.assign(S().p,{x:R.x+60,y:R.y,vx:0,vy:0,grounded:true});safe();step(120*2);
 ok(R.y<R.base-60,'scale: the crate on the other pan lifts Marko up');}
{const w=await land('suma'),t=w.traps.find(t=>t.kind==='kolo');ok(t&&t.bridge.off,'kolo: the fairy ring and a chasm with no bridge');
 Object.assign(S().p,{x:t.stones[0].x-200,y:t.stones[0].y,grounded:true});safe();step(3);until(()=>!(t.show>0),120*8);
 for(const i of t.order){Object.assign(S().p,{x:t.stones[i].x,y:t.stones[i].y,vx:0,vy:0,grounded:true});step(6);Object.assign(S().p,{x:t.stones[i].x+70});step(3);}
 ok(t.done&&!t.bridge.off,'kolo: stepped in the fireflies\' order, the bridge of light appears');}
{const w=await land('tvrdjava'),t=w.traps.find(t=>t.kind==='powder'),keg=w.platforms.find(q=>q.keg);ok(t&&keg,'powder: an iron door and a powder keg in the fortress');
 keg.x=t.brazier.x+60;Object.assign(S().p,{x:t.brazier.x-40,y:t.brazier.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});safe();tap('KeyJ');step(40);ok(t.brazier.down,'powder: the brazier falls');
 Object.assign(S().p,{x:t.brazier.x-300,y:590});until(()=>t.done,120*5);ok(t.done&&keg.off,'powder: the coals light the keg and the door is blown');}
// ---- the new champions ----
{const c=await arena('pecina');ok(c.kit==='azdaja','azdaja: the dragon in the cave');c.kc=0;c.mode='idle';Object.assign(S().p,{x:c.x-500});until(()=>S().arrows.some(a=>a.flame),120*3);ok(S().arrows.some(a=>a.flame),'azdaja: she breathes fire along the ground');}
{const c=await arena('manastir');ok(c.kit==='dzelat','dzelat: the executioner in the monastery');const pl=S().world.platforms.filter(q=>q.arena&&!q.off).length;Object.assign(S().p,{x:c.x-150,y:c.y});safe();c.kc=0;c.mode='idle';
 until(()=>c.stun>0,120*4);ok(c.kitOpen>0,'dzelat: his axe sticks in the ground');}
{const c=await arena('selo');ok(c.kit==='djemo','djemo: Đemo the highlander in the village');Object.assign(S().p,{x:c.x-400,y:c.y});safe();c.kc=0;c.mode='idle';until(()=>c.mace,120*3);ok(c.mace,'djemo: he throws his mace');until(()=>!c.mace,120*6);ok(!c.mace,'djemo: and it comes back to his hand');}
{const w0=await api.startLevel(levelOf('oranje'),'day');const w=S().world;ok(w.enemies.filter(e=>e.trioMate).length===2&&w.enemies.some(e=>e.champion&&e.kit==='trio'),'trio: three janissaries guard the gold');}
{const c=await arena('klisura');ok(c.kit==='kopljanik','kopljanik: the spear captain of the gorge');Object.assign(S().p,{x:c.x-450,y:c.y});safe();c.kc=0;c.mode='idle';until(()=>S().arrows.some(a=>a.spear),120*3);ok(S().arrows.some(a=>a.spear),'kopljanik: he throws a spear');}
// ---- second moves and Musa's new ones ----
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-200,y:590,face:1});safe();e.timer=0;e.mode='idle';e.moveCool=0;
 until(()=>e.move||e.recMove,120*2);ok(e.move||e.recMove,'moves: a janissary lunges from a distance');}
{api.startChapter(5);const {boss}=S();boss.stage='duel';boss.phase=2;boss.mode='throwUp';boss.timer=.05;Object.assign(S().p,{x:boss.x-300});safe();step(10);ok(boss.mode==='unarmed'&&boss.drop,'musa: he throws his mace into the clouds and stands unarmed');
 until(()=>!boss.drop,120*3);ok(!boss.drop,'musa: the mace comes down where its shadow was');}
console.log(`${checks} battle checks passed.`);
