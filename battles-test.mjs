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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {start,startChapter,startLevel,startTraining,update,keys,pressed,LEVELS,slay,retry,die,presuda,levelOpen,forgetSkills:()=>{skillCache=null;},lovStart,lov:()=>lov,buyDucan,closeDucan,bank,setBank,ckptState:()=>({ckpt,ckptFlags}),setCkpt:(x,y)=>{ckpt={x,y};},state:()=>({p,world,mode,level,zone,boss,arrows,fires,horseMounted,camera,finisher,heads,limbs,corpses,bones,particles,decals})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
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
async function finishWith(key){api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});e.x=2450;e.home=2450;Object.assign(S().p,{x:e.x-90,face:1,grounded:true});safe();
 Object.assign(e,{stun:30,mode:'stun',hp:e.maxHp*.2});
 // the window opens by chance (45% a try); the dice are loaded here so the test never waits it out
 const R=Math.random;Math.random=()=>.2;until(()=>e.finT>0,120*30);Math.random=R;const opened=e.finT>0;api.pressed.add(key);step(2);const started=!!S().finisher;step(150);return{e,opened,started};}
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,face:1,grounded:true});safe();
 Object.assign(e,{stun:3,mode:'stun',hp:e.maxHp});step(120*6);ok(!(e.finT>0),'finish: never while the foe is still strong');}
{const r=await finishWith("KeyJ");ok(r.opened&&r.started&&!r.e.alive&&S().heads.length===1&&S().corpses.some(c=>c.headless),'finish: X / J takes the head');}
{const r=await finishWith('KeyK');ok(r.started&&!r.e.alive&&S().corpses.some(c=>c.headless?.fast)&&S().heads.length===0,'finish: Y / K bursts his head under the mace');}
{const r=await finishWith('ShiftLeft');ok(r.started&&!r.e.alive&&S().corpses.some(c=>c.legless)&&S().limbs.length===1,'finish: B / Shift takes his legs, he falls without them');step(120*3);ok(S().limbs[0]?.rest,'finish: the legs come to rest on the ground');}
{const r=await finishWith('Space');ok(r.started&&!r.e.alive&&S().corpses.some(c=>!c.headless&&!c.launched),'finish: A / Space knocks him down and lands on him');}
{let opens=0,tries=0;for(let n=0;n<12;n++){api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,grounded:true});safe();Object.assign(e,{stun:9,mode:'stun',hp:e.maxHp*.2});step(3);tries++;if(e.finT>0)opens++;}
 ok(opens<tries,'finish: the chance does not come every time ('+opens+' of '+tries+')');}
{const r=await finishWith('KeyJ');step(120*4);ok(S().heads.length===1&&S().heads[0].rest,'finish: the head comes to rest on the ground');}

// ---- the training room: foes keep coming, every one of them can be finished at once ----
{api.startTraining();step(120*3);const w=S().world;ok(w.enemies.filter(e=>e.alive).length>=2,'training: foes keep coming');
 const e=w.enemies.find(e=>e.alive);until(()=>e.finT>0||!e.alive,120*6);ok(e.finT>0&&e.hp===e.maxHp,'training: a fresh foe can be finished right away');
 tap('KeyK');step(160);ok(!e.alive,'training: and the finish takes him');step(120*2);ok(w.enemies.filter(e=>e.alive).length>=2,'training: the next ones come');
 api.pressed.add('Digit9');step(120*4);ok(S().world.enemies.filter(e=>e.alive).every(e=>e.type==='pas'),'training: a number picks the kind of foe');}

// ---- a foe answers: three light blows running and he stands firm; the heavy hand still breaks him ----
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(e,{hp:900,maxHp:900,stun:0,mode:'idle',timer:9});const p=S().p;
 const blow=k=>{Object.assign(p,{x:e.x-70,y:e.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});p.invuln=99;p.hp=p.maxHp;tap(k);step(22);};
 const x0=e.x;blow('KeyJ');ok(e.stun>0&&e.x>x0,'answer: a light blow staggers the janissary and moves him back');blow('KeyJ');ok(e.stun>0,'answer: so does the second');
 blow('KeyJ');ok(!(e.stun>0)&&(e.mode==='windup'||e.mode==='recover'),'answer: at the third he stands firm and strikes back at once');
 const hp=e.hp;blow('KeyJ');ok(e.hp<hp&&!(e.stun>0),'answer: while he stands firm light blows hurt but do not stop him');
 blow('KeyK');step(20);ok(e.stun>0,'answer: a heavy blow breaks him all the same');}
// ---- nerve and spoils: a comrade smashed by the heavy hand makes the man beside him start back; every few dead leave a flask while Marko's is not full ----
{api.startChapter(0);const w=S().world,[e,o]=w.enemies.filter(e=>e.type==='sword'),p=S().p;w.enemies.forEach(q=>{if(q!==e&&q!==o)q.alive=false;});
 Object.assign(o,{x:e.x+110,y:e.y,zone:e.zone,mode:'idle',timer:0,stun:0,grounded:true,elite:false});p.attackKind='heavy';p.wine=p.wineMax||3;const rnd=Math.random;Math.random=()=>0;api.slay(e);Math.random=rnd;
 ok(o.lunge?.t>0&&o.lunge.v>0&&o.timer>=.9,'nerve: a heavy kill makes the man beside him start back and hold off');
 p.attackKind='light';p.combo=0;const q=w.enemies.find(q=>q!==e&&q!==o&&!q.champion&&!q.elite&&q.type!=='pas'),kill=(n=1)=>{for(let i=0;i<n;i++){q.alive=true;q.zone=99;api.slay(q);}},flasks=()=>w.items.filter(i=>i.plen&&i.type==='wine');
 p.wine=p.wineMax||3;kill(8);ok(flasks().length===0,'spoils: nothing falls while his own flask is full');
 p.wine=0;kill(1);ok(flasks().length===1,'spoils: with the flask empty the next of the dead leaves one');
 flasks()[0].taken=true;kill(5);ok(flasks().length===1,'spoils: then five dead leave nothing');kill(1);ok(flasks().length===2,'spoils: and the sixth leaves a flask again');}
// ---- on the ground: a foe on top of Marko; mash to throw him off ----
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-90,face:1,grounded:true,hp:S().p.maxHp,invuln:0});
 for(let n=0;n<20&&!e.grappling;n++){S().p.down=1;S().p.downRolled=false;step(2);S().p.down=0;step(1);}ok(e.grappling&&S().p.pinned,'grapple: knocked down by a janissary, he jumps on Marko with his knife');
 const hp0=S().p.hp;step(120);ok(S().p.hp<hp0,'grapple: held down, Marko bleeds');step(2);const key0=S().p.hvat;ok(['KeyJ','KeyK','Space','ShiftLeft'].includes(key0),'grapple: a hold is shown to take');
 {const wrong=['KeyJ','KeyK','Space','ShiftLeft'].find(k=>k!==key0);tap(wrong);step(3);ok(S().p.pinned&&S().p.hvat===key0,'grapple: the wrong hold frees no one');step(60);}
 let holds=0;for(let i=0;i<400&&S().p.pinned&&S().p.hvat;i++){S().p.hp=S().p.maxHp;tap(S().p.hvat);holds++;step(8);}step(120);ok(holds>=3&&holds<=6&&!S().p.pinned&&!e.grappling&&(e.hp<e.maxHp||!e.alive),'grapple: three right holds throw him off and strike back');}

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
const groundY=(w,x,y)=>{let best=null;for(const q of w.platforms){if(x<q.x||x>q.x+q.w||q.y<y-400)continue;if(best===null||q.y<best)best=q.y;}return best??y;};
const levelOf=id=>api.LEVELS.findIndex(L=>L.id===id);
const armed=c=>{step(3);S().p.noMace=false;c.topuz=null;return c;};
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
{const c=armed(await arena('klisura'));ok(c.kit==='djemo','djemo: Đemo the highlander, come to the gorge for his brother');Object.assign(S().p,{x:c.x-400,y:c.y});safe();c.kc=0;c.mode='idle';until(()=>c.mace,120*3);ok(c.mace,'djemo: he throws his mace');until(()=>!c.mace,120*6);ok(!c.mace,'djemo: and it comes back to his hand');}
{const w0=await api.startLevel(levelOf('oranje'),'day');const w=S().world;ok(w.enemies.filter(e=>e.trioMate).length===2&&w.enemies.some(e=>e.champion&&e.kit==='trio'),'trio: three janissaries guard the gold');}
{const c=await arena('selo');ok(c.kit==='kopljanik','kopljanik: the spear captain besieging the village');Object.assign(S().p,{x:c.x-450,y:c.y});safe();c.kc=0;c.mode='idle';until(()=>S().arrows.some(a=>a.spear),120*3);ok(S().arrows.some(a=>a.spear),'kopljanik: he throws a spear');}
// ---- second moves and Musa's new ones ----
{api.startChapter(0);const w=S().world,e=w.enemies.find(e=>e.type==='sword');w.enemies.forEach(o=>{if(o!==e)o.alive=false;});Object.assign(S().p,{x:e.x-200,y:590,face:1});safe();e.timer=0;e.mode='idle';e.moveCool=0;
 until(()=>e.move||e.recMove,120*2);ok(e.move||e.recMove,'moves: a janissary lunges from a distance');}
{api.startChapter(5);const {boss}=S();boss.stage='duel';boss.phase=2;boss.mode='throwUp';boss.timer=.05;Object.assign(S().p,{x:boss.x-300});safe();step(10);ok(boss.mode==='unarmed'&&boss.drop,'musa: he throws his mace into the clouds and stands unarmed');
 until(()=>!boss.drop,120*3);ok(!boss.drop,'musa: the mace comes down where its shadow was');}
// ---- the Turkish cannon: the gunner fires it, a low ball rolls into a standing man, a high one flies over a crouching one; the mace breaks it ----
{api.startChapter(1);const w=S().world,c=w.cannons[0],p=S().p;w.enemies.forEach(e=>{if(!e.gunner)e.alive=false;});
 const at=()=>{Object.assign(p,{x:c.x-700,y:590,vx:0,vy:0,grounded:true,invuln:0});};
 ok(until(()=>{at();p.hp=p.maxHp;return c.balls?.length>0;},120*8),'cannon: the gunner lights the fuse and the cannon fires at Marko');
 const low=c.balls[0];ok(!low.high,'cannon: the first ball comes low');
 let hurt=false;until(()=>{p.x=c.x-700;p.invuln=0;if(p.hp<p.maxHp)hurt=true;return hurt||low.life<=0;},120*4);ok(hurt,'cannon: a low ball rolls into a man who stands');
 until(()=>{at();p.hp=p.maxHp;return c.balls.some(b=>b.high);},120*8);const hi=c.balls.find(b=>b.high);hurt=false;api.keys.add('KeyS');
 until(()=>{p.x=c.x-700;p.invuln=0;if(p.hp<p.maxHp)hurt=true;return hurt||hi.x<p.x-60||hi.life<=0;},120*4);api.keys.delete('KeyS');ok(!hurt&&hi.x<p.x-60,'cannon: the high ball flies over him when he crouches');
 for(let i=0;i<16&&!c.broken;i++){Object.assign(p,{x:c.x-90,face:1,grounded:true});safe();tap('KeyK');step(70);}
 ok(c.broken,'cannon: the mace breaks the cannon');const shots=c.shots;at();step(120*5);ok(c.shots===shots,'cannon: a broken cannon stays silent');}
{const L=api.LEVELS.findIndex(l=>l.id==='tvrdjava');await api.startLevel(L);ok(S().world.cannons?.length===1&&S().world.enemies.some(e=>e.gunner),'cannon: the fortress has a cannon and its gunner');}
// ---- Marko at the gun: T in the training room puts one down, E takes it, W/S/A/D aim, J fires into the horde ----
{api.startTraining();step(30);const p=S().p;api.pressed.add('KeyT');step(2);const G=S().world.guns?.[0];ok(!!G,'gun: T puts a cannon in the training room');
 p.x=G.x-74;safe();step(10);api.pressed.add('KeyE');step(2);ok(G.state==='battle','gun: E at the gun takes it and the horde sets out');
 const a0=G.angle;api.keys.add('KeyW');step(30);api.keys.delete('KeyW');ok(G.angle>a0,'gun: W lifts the barrel');
 until(()=>{safe();return S().world.enemies.some(e=>e.horde&&e.alive);},120*6);let kills=0;
 for(let i=0;i<40&&!kills;i++){safe();api.pressed.add('KeyJ');step(150);kills=G.kills||0;}ok(kills>0,'gun: a ball bursts among the horde and kills');
 safe();api.pressed.add('KeyE');step(2);api.keys.add('KeyD');step(20);api.keys.clear();ok(Math.abs(p.x-(G.x-74))>4,'gun: E leaves it and Marko walks again');}
{const L=api.LEVELS.findIndex(l=>l.id==='tvrdjava');await api.startLevel(L);ok(S().world.guns?.length===1,'gun: the fortress has a gun for Marko');}
// ---- a torch sent back sets the fire-thrower alight: he burns in his own clip and his health runs out ----
{api.startTraining();step(20);const w=S().world;w.enemies.forEach(e=>e.alive=false);api.pressed.add('Digit6');step(200);const e=w.enemies.find(e=>e.alive&&e.type==='palikuca');
 safe();e.enter=null;const hp0=e.hp;S().arrows.push({x:e.x-160,y:e.y-60,vx:420,vy:0,torch:true,enemy:false,life:3});until(()=>e.burn>0,120);ok(e.burn>0,'burn: his own torch sets the palikuća on fire');
 step(60);ok(e.hp<hp0,'burn: his health runs down while he burns');until(()=>!e.alive,120*6);ok(!e.alive,'burn: the fire finishes him');}
// ---- the guslars of the gorge: undefended, his gusle are broken; defended, he sings and Marko's rage fills ----
{const w=await land('klisura');const G=w.traps.filter(t=>t.kind==='guslar');ok(G.length===3&&G[2].mir,'guslar: the gorge has three guslars, the last one sings in peace');
 const g=G[0];Object.assign(S().p,{x:g.x0+90,y:g.y,vx:0,vy:0,grounded:true});safe();step(2);ok(g.state==='napad','guslar: Marko comes and the Turks run at the guslar');
 Object.assign(S().p,{x:g.x0-900,y:groundY(w,g.x0-900,g.y)});until(()=>{safe();return g.state==='bezi';},120*60);ok(g.state==='bezi','guslar: left alone, his gusle are broken');}
{const w=await land('klisura');const g=w.traps.find(t=>t.kind==='guslar');Object.assign(S().p,{x:g.x0+90,y:g.y,vx:0,vy:0,grounded:true,rage:0});safe();step(2);
 const kill=()=>{for(const e of w.enemies)if(e.alive&&e.prey===g)e.alive=false;};kill();until(()=>{safe();return w.enemies.some(e=>e.alive&&e.prey===g);},120*8);
 ok(w.enemies.filter(e=>e.alive&&e.prey===g).length===2,'guslar: a second band comes from behind');kill();step(3);ok(g.state==='peva','guslar: defended, he sings');
 Object.assign(S().p,{x:g.x-120,y:g.y,vx:0,vy:0});step(120*3);ok(S().p.rage>=80,'guslar: while he sings, Marko\'s rage fills');}
// ---- the eagle's nest: left burning, it is lost; saved, the eagle follows Marko, swoops on the Turks and shades him when he is hurt ----
{const w=await land('suma');const t=w.traps.find(t=>t.kind==='gnezdo');for(const e of w.enemies)if(e.gnezdo){e.alive=true;e.x=t.x+2000;}ok(!!t,'eagle: the forest has the eagle\'s beech');Object.assign(S().p,{x:t.x-600,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);ok(t.state==='gori','eagle: the fire-raisers set the beech alight when Marko comes');
 Object.assign(S().p,{x:t.x0-1500,y:groundY(w,t.x0-1500,t.y)});for(const e of w.enemies)if(e.gnezdo){e.alive=true;e.x=t.x+200;}until(()=>{safe();return t.state!=='gori';},120*40);ok(t.state==='izgorelo'&&!w.orao,'eagle: left alone, the nest burns and she flies away');ok(w.items.some(i=>i.cudo==='orlovo-pero'&&Math.abs(i.x-t.x)>300),'eagle: the feather then waits in its hiding place');}
{const w=await land('suma');const t=w.traps.find(t=>t.kind==='gnezdo');for(const e of w.enemies)if(e.gnezdo){e.alive=true;e.x=t.x+2000;}Object.assign(S().p,{x:t.x-600,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);
 for(const e of w.enemies)if(e.gnezdo)e.alive=false;step(2);ok(t.state==='spaseno'&&w.orao,'eagle: the fire-raisers dead, the young are saved and the eagle comes');ok(w.items.some(i=>i.cudo==='orlovo-pero'&&Math.abs(i.x-t.x)<200),'eagle: she leaves the Eagle feather by the tree');
 until(()=>{safe();return w.orao.state==='prati';},120*10);ok(w.orao.state==='prati','eagle: she flies to Marko and follows him');
 const p=S().p,e={id:777,x:p.x+260,y:p.y,vx:0,vy:0,w:36,h:75,hp:200,maxHp:200,type:'sword',zone:S().zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:p.x+260,attackId:0,grounded:true};w.enemies.push(e);w.orao.cd=0;
 until(()=>{safe();e.timer=9;return e.hp<200;},120*6);ok(e.hp<=200-45,'eagle: she swoops on a Turk and wounds him');
 w.orao.state='prati';w.orao.hladCd=0;p.invuln=0;p.hp=20;step(2);ok(w.orao.state==='hlad','eagle: Marko badly hurt, she spreads her wings over him');const h0=p.hp;step(120*3);ok(p.hp>h0+20,'eagle: her shade and water heal him');}
// ---- the wounded falcon: bound, he follows Marko, spoils an archer's shot and brings water; archers lie hidden in the reeds ----
{const w=await land('mocvara');const t=w.traps.find(t=>t.kind==='soko');ok(!!t&&w.traps.filter(t=>t.kind==='trska').length>=2,'falcon: the marsh has the wounded falcon and reeds');
 ok(w.enemies.filter(e=>e.skriven).length>=4,'falcon: archers lie hidden in the reeds');
 const p=S().p,foe=(type,x,o={})=>{const e={id:770+w.enemies.length,x,y:t.y,vx:0,vy:0,w:36,h:75,hp:200,maxHp:200,type,zone:S().zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:true,...o};w.enemies.push(e);return e;};
 Object.assign(p,{x:t.x-60,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);const h=foe('sword',t.x+150);api.pressed.add('KeyE');step(2);ok(t.state==='ranjen','falcon: with a Turk beside him, Marko must first drive him off');
 h.alive=false;api.pressed.add('KeyE');step(2);ok(t.state==='previja','falcon: E beside him and Marko binds his wing');until(()=>{safe();return t.state==='spasen';},120*3);
 ok(t.state==='spasen'&&!!w.soko,'falcon: the wing bound, the falcon flies with Marko');ok(w.items.some(i=>i.cudo==='sokolovo-pero'&&Math.abs(i.x-t.x)<200),'falcon: he leaves the Falcon feather');
 until(()=>{safe();return w.soko.state==='prati';},120*10);ok(w.soko.state==='prati','falcon: he follows Marko');
 const a=foe('archer',p.x+300,{mode:'windup',timer:5,windupDuration:5,hp:65,maxHp:65});w.soko.cd=0;until(()=>{safe();if(a.mode==='windup')a.timer=5;return a.mode!=='windup';},120*3);ok(a.mode==='stun'&&a.hp<65,'falcon: he flies at an archer and spoils his shot');
 a.alive=false;w.soko.state='prati';w.soko.vodaCd=0;p.invuln=0;p.hp=p.maxHp*.3;step(2);ok(w.soko.state==='voda','falcon: Marko wounded, the falcon brings water');const h0=p.hp;step(120*3);ok(p.hp>h0+20,'falcon: the water heals him');}
{const w=await land('mocvara');const e=w.enemies.find(e=>e.skriven);e.alive=true;const p=S().p;Object.assign(p,{x:e.x-650,y:groundY(w,e.x-650,e.y),vx:0,vy:0,grounded:true});safe();step(120);ok(e.skriven&&e.mode==='idle','reeds: an archer far off stays hidden and still');
 Object.assign(p,{x:e.x-300,y:groundY(w,e.x-300,e.y)});safe();step(3);ok(!e.skriven,'reeds: close by, the ambush rises');}
// ---- Ramadan wine: the heralds spill an undefended barrel; cut down, Marko drinks; at the last barrel the Sultan sends ducats ----
{const w=await land('podrum');const B=w.traps.filter(t=>t.kind==='bacva');ok(B.length===3&&B[2].kraj,'wine: the cellar has three barrels, the last one before the champion');
 const t=B[0],p=S().p;Object.assign(p,{x:t.x0+90,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);ok(t.state==='napad'&&w.enemies.filter(e=>e.alive&&e.caus).length===2,'wine: Marko comes and two heralds march on the barrel');
 Object.assign(p,{x:t.x0-900,y:groundY(w,t.x0-900,t.y)});until(()=>{safe();return t.state!=='napad';},120*30);ok(t.state==='prolivena','wine: left alone, a herald spills it');}
{const w=await land('podrum');const t=w.traps.find(t=>t.kind==='bacva'),p=S().p;Object.assign(p,{x:t.x0+90,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);for(const e of w.enemies)if(e.alive)e.alive=false;step(2);ok(t.state==='puna','wine: the heralds cut down, the wine is saved');
 Object.assign(p,{x:t.x-40,y:t.y,vx:0,vy:0});safe();Object.assign(p,{wine:0,rage:0,hp:40});api.pressed.add('KeyE');step(2);ok(t.state==='popijeno'&&p.rage>=100&&p.wine===p.wineMax&&p.hp>=80,'wine: Marko drinks: fury full, flask filled, health back');}
{const w=await land('podrum');const t=w.traps.find(t=>t.kind==='bacva'&&t.kraj),p=S().p;Object.assign(p,{x:t.x-40,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);ok(t.state==='puna','wine: by the last barrel no one forbids him');
 api.pressed.add('KeyE');step(2);until(()=>{safe();return t.glasnik?.state==='cita';},120*15);ok(t.glasnik?.state==='cita','wine: a herald brings the Sultan\'s hundred ducats');}
// ---- pack 08, the rules of the megdan: bodies, the guard, the acts and the grapple ----
{const c=armed(await arena('klisura'));const p=S().p;ok(c.kit==='djemo','megdan: Đemo waits at the end of the gorge');
 // a body: Marko cannot walk into him
 c.kc=99;c.timer=99;c.mode='idle';c.grabCD=null;Object.assign(p,{x:c.x-200,y:c.y,vx:0,vy:0,grounded:true,face:1});safe();api.keys.add('KeyD');for(let i=0;i<240;i++){c.kc=99;c.timer=99;c.mode='idle';step();}api.keys.clear();
 ok(p.x<=c.x-40,'megdan: Marko cannot walk into a standing champion (stopped '+Math.round(c.x-p.x)+' short)');
 // the guard: light blows glance off, the third in a row earns a shove
 const light=()=>{c.kc=99;c.timer=99;c.mode='idle';Object.assign(p,{x:c.x-70,y:c.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0,combo:0});p.invuln=0;p.hp=p.maxHp;tap('KeyJ');step(30);};
 const hp0=c.hp;light();const chip=hp0-c.hp;ok(chip>0&&chip<8,'megdan: a light blow on his guard only chips him ('+chip.toFixed(1)+')');
 ok(c.guard<100,'megdan: and wears the guard a little');
 light();const hpB=p.hp;light();ok(p.hp<hpB&&p.x<c.x-120,'megdan: the third light blow in a row and he shoves Marko away');
 // a blow while he recovers from his own swing lands whole
 for(let i=0;i<150;i++){c.kc=99;c.timer=99;c.mode='idle';safe();step();}c.guard=100;c.gHits=0;c.mode='recover';c.timer=99;c.kc=99;Object.assign(p,{x:c.x-70,y:c.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0,combo:0,hurt:0,shoveT:0,down:0});safe();const hp1=c.hp;tap('KeyJ');for(let i=0;i<40;i++){c.mode='recover';c.timer=99;step();}
 ok(hp1-c.hp>20,'megdan: while he recovers from his swing the blow lands whole ('+Math.round(hp1-c.hp)+')');
 // heavy blows break the guard
 c.guard=20;c.gHits=0;c.stun=0;c.mode='idle';c.timer=99;c.kc=99;Object.assign(p,{x:c.x-80,y:c.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});safe();tap('KeyK');for(let i=0;i<90&&!(c.guardBroken>0);i++){c.kc=99;step();}
 ok(c.guardBroken>0&&c.stun>0,'megdan: a heavy blow on a worn guard breaks it and he reels');}
{const c=armed(await arena('klisura'));const p=S().p;c.kc=99;c.timer=99;
 // the acts: crossing half his strength he throws Marko back and no blow reaches him for a moment
 Object.assign(p,{x:c.x-90,y:c.y,vx:0,vy:0,grounded:true,face:1});safe();c.hp=c.maxHp*.49;step(2);
 ok(c.p2&&c.act===2&&c.invT>0,'megdan: at half strength the second act begins');step(30);ok(p.x<c.x-150,'megdan: entering it he throws Marko back');
 ok(c.grabCD!=null,'megdan: from the second act on he comes to grapple');
 // the grab: out of reach, he stumbles past and stands open
 c.invT=0;c.grabCD=0;c.mode='idle';c.ks=null;c.mace=null;Object.assign(p,{x:c.x-300,y:c.y,vx:0,vy:0,grounded:true});safe();p.invuln=0;until(()=>c.gs==='prep',120*2);ok(c.gs==='prep','megdan: he warns before he grabs');
 until(()=>c.gs==='lunge',120*2);p.x=c.x-900>c.arena.x0+40?c.x-900:c.arena.x0+40;p.dash=.5;until(()=>!c.gs,120*2);ok(c.stun>0&&c.kitOpen>0,'megdan: a missed grab leaves him stumbling and open');
 // caught: hand to hand; mashing throws him off and hurts him
 c.stun=0;c.kitOpen=0;c.grabCD=0;c.mode='idle';c.ks=null;c.mace=null;Object.assign(p,{x:c.x-150,y:c.y,vx:0,vy:0,grounded:true,dash:0});p.invuln=0;p.hp=p.maxHp;
 until(()=>{c.kc=99;c.mace=null;p.hp=Math.max(p.hp,60);return !!S().p.pinned;},120*5);ok(S().p.pinned,'megdan: caught, Marko is in the grapple');
 const hp2=c.hp;for(let i=0;i<120*6&&S().p.pinned;i++){p.hp=p.maxHp;if(i%10===0&&S().p.hvat)tap(S().p.hvat);else step();}
 ok(!S().p.pinned&&c.hp<hp2&&c.guardBroken>0,'megdan: he breaks free, throws the champion off and leaves him open');}
const clamp=physics.clamp;
// ---- the acts: every champion brings something new in his last act, and none of it breaks the fight ----
for(const [id,kit,kind] of [['tvrdjava','hasan','rain'],['podrum','ognjeni','pots'],['rudnik','bajraktar','rain'],['reka','janicar','combo'],['rusevine','arapin','rain'],['mocvara','basa','pots'],['pecina','azdaja','rain'],['manastir','dzelat','combo'],['klisura','djemo','combo'],['selo','kopljanik','slam'],['suma','lovac','rain']]){
 const c=armed(await arena(id));const p=S().p,w=S().world;ok(c.kit===kit,'acts: '+kit+' stands in '+id);
 c.hp=c.maxHp*.28;c.armor=0;step(3);ok(c.p3&&c.act===3,'acts: '+kit+' enters his last act below a third of his strength');
 // bring him down to the ground, idle and free, and let the act move come
 c.invT=0;c.grabCD=99;c.perch=false;c.y=c.arena.y;c.grounded=true;c.ks=null;c.mace=null;c.mode='idle';c.timer=99;c.kc=99;c.actCD=0;if(c.flag)c.flag.up=false;
 Object.assign(p,{x:clamp(c.x-260,c.arena.x0+60,c.arena.x1-60),y:c.arena.y,vx:0,vy:0,grounded:true});safe();
 const seen=until(()=>{safe();c.grabCD=99;c.kc=99;if(c.mode==='idle')c.timer=99;return kind==='rain'||kind==='pots'?(w.drops?.length>0):c.as===kind;},120*6);
 ok(seen,'acts: '+kit+' uses his last-act move ('+kind+')');
 // and the fight goes on: nothing throws, Marko can still be hurt and the champion still stands
 for(let i=0;i<120*6;i++){safe();c.grabCD=99;step();}ok(c.alive&&S().mode==='play'&&!c.as,'acts: '+kit+' finishes the move and fights on');}
{const c=await arena('pecina');const p=S().p,w=S().world;c.hp=c.maxHp*.28;step(3);c.invT=0;c.actCD=0;c.ks=null;c.mode='idle';c.kc=99;until(()=>w.drops?.length>0,120*4);
 const d=w.drops[0];Object.assign(p,{x:d.x,y:d.y,vx:0,vy:0,grounded:true});p.invuln=0;p.dash=0;p.hp=p.maxHp;const hp=p.hp;for(let i=0;i<120*3&&p.hp===hp;i++){c.kc=99;c.mode='idle';c.timer=99;p.x=d.x;step();}
 ok(p.hp<hp,'acts: what falls from the vault hurts Marko if he stands in its shadow');}
// ---- pack 09: the defence of the guslar, and the banners a fallen Marko comes back to ----
{const w=await land('klisura');const G=w.traps.filter(t=>t.kind==='guslar'),g=G.find(t=>t.odbrana),p=S().p;ok(g&&G.indexOf(g)===1,'odbrana: the second guslar of the gorge is the one to defend');
 for(const e of w.enemies)e.alive=false;
 Object.assign(p,{x:g.x0+120,y:g.y,vx:0,vy:0,grounded:true,rage:0});safe();step(3);ok(g.state==='odbrana','odbrana: Marko comes and the guslar begins the song of Musa');
 until(()=>{safe();return w.enemies.some(e=>e.alive&&e.prey===g);},120*8);ok(w.enemies.filter(e=>e.alive&&e.prey===g).length===3,'odbrana: the first band runs at him');
 const kill=()=>{for(const e of w.enemies)if(e.alive&&e.prey===g)api.slay(e,0);};
 for(let k=2;k<=5;k++){kill();until(()=>{safe();p.x=g.x-60;return g.wave>=k;},120*40);ok(g.wave===k,'odbrana: band '+k+' follows');}
 ok(p.rage>40,'odbrana: while the song lasts Marko\'s rage keeps filling ('+Math.round(p.rage)+')');
 kill();until(()=>{safe();return g.state==='peva';},120*10);ok(g.state==='peva','odbrana: the five bands beaten, the guslar is safe and sings on');}
{const w=await land('klisura');const g=w.traps.find(t=>t.odbrana),p=S().p;for(const e of w.enemies)e.alive=false;
 // a banner goes up on a quiet stretch before the guslar
 const q=w.platforms.filter(q=>q.ground&&q.x<g.x0-200&&q.x+q.w>g.x0-700).sort((a,b)=>b.w-a.w)[0];Object.assign(p,{x:Math.max(q.x+60,g.x0-400),y:q.y,vx:0,vy:0,grounded:true});safe();step(6);
 const C=api.ckptState();ok(C.ckpt&&Math.abs(C.ckpt.x-p.x)<5,'banners: on a quiet stretch of the road a banner is raised');const bx=C.ckpt.x;
 // left alone, the guslar falls: Marko falls with the song and wakes at the banner, the defence begins again
 Object.assign(p,{x:g.x0+120,y:g.y,vx:0,vy:0,grounded:true});safe();step(3);ok(g.state==='odbrana','banners: the defence begins');
 Object.assign(p,{x:g.x0-800,y:groundY(w,g.x0-800,g.y)});until(()=>{p.invuln=99;p.hp=p.maxHp;return S().mode!=='play';},120*120);ok(g.fallen&&S().mode==='dead','odbrana: left alone, the guslar is cut down and the song falls silent');
 api.retry();ok(S().mode==='play'&&Math.abs(S().p.x-bx)<5&&S().p.hp===S().p.maxHp,'banners: Marko comes back at the banner, whole');
 ok(!w.enemies.some(e=>e.alive&&e.prey===g)&&!g.fallen,'banners: the bands are gone and the guslar waits again');
 Object.assign(S().p,{x:g.x0+120,y:g.y,vx:0,vy:0,grounded:true});safe();step(3);ok(g.state==='odbrana'&&g.hp===100,'banners: the defence starts over');}
{const c=await arena('tvrdjava');const p=S().p,w=S().world;step(3);const C0=api.ckptState();
 // a champion Marko fell to stands whole again when he comes back
 c.hp=c.maxHp*.2;step(3);ok(c.p3,'banners: Hasan-aga is in his last act');Object.assign(p,{x:c.arena.x0-300,y:groundY(w,c.arena.x0-300,c.y)});
 api.setCkpt(c.arena.x0-300,groundY(w,c.arena.x0-300,c.y));p.invuln=0;p.hp=1;api.die();ok(S().mode==='dead','banners: Marko falls in the arena');api.retry();
 ok(S().mode==='play'&&c.hp===c.maxHp&&!c.p3&&!c.p2,'banners: back at the banner, and the champion has his strength again');}
// ---- the merchant by the road: wine, salve, a whetted mace and the amulet, paid in ducats ----
{const w=await land('selo');const t=w.traps.find(t=>t.kind==='trgovac'),c=w.enemies.find(e=>e.champion),p=S().p;ok(t&&t.x<c.arena.x0&&t.x>c.arena.x0-1400,'merchant: a merchant waits by the road before the champion');
 for(const e of w.enemies)e.alive=false;Object.assign(p,{x:t.x-40,y:t.y,vx:0,vy:0,grounded:true});safe();step(2);api.pressed.add('KeyE');step(1);ok(S().mode==='shop','merchant: E opens his stall and the road waits');
 api.setBank(100);p.wine=1;p.wineMax=3;ok(api.buyDucan('vino')&&p.wine===2&&api.bank()===88,'merchant: twelve ducats buy a flask of wine');
 p.hp=10;ok(api.buyDucan('melem')&&p.hp===p.maxHp,'merchant: the salve heals every wound');ok(!api.buyDucan('melem'),'merchant: he sells no salve to a whole man');
 const pw=p.power||1;ok(api.buyDucan('brus')&&p.power>pw&&!api.buyDucan('brus'),'merchant: the mace is whetted once for the quest');
 ok(api.buyDucan('amajlija')&&p.amajlija,'merchant: the amulet of Saint George');api.setBank(3);ok(!api.buyDucan('vino'),'merchant: no ducats, no wine');
 api.closeDucan();ok(S().mode==='play','merchant: back to the road');p.invuln=0;p.hp=1;api.die();ok(S().mode==='play'&&p.hp>1&&!p.amajlija,'merchant: the amulet lifts a fallen Marko once');api.die();ok(S().mode==='dead','merchant: and only once');}
// ---- Urvina, the last pohod: no foes, a long climb, and on the top the song step by step ----
{const w=await land('urvina');const p=S().p,t=w.traps.find(t=>t.kind==='vrh');ok(levelOf('urvina')===api.LEVELS.filter(L=>!L.secret).length-1,'urvina: Urvina is the last pohod on the road');
 ok(w.enemies.length===0,'urvina: no one stands against Marko on Urvina');ok(t&&t.y<200,'urvina: the road climbs a mountain (the top is '+Math.round(590-t.y)+' above the start)');
 const at=x=>{Object.assign(p,{x,y:t.y,vx:0,vy:0,grounded:true});step(2);},E=()=>{api.pressed.add('KeyE');step(2);};
 at(S().level.goal.x-60);step(3);ok(S().mode==='play','urvina: the road does not end before the well');
 at(t.sarac);E();ok(!t.step,'urvina: Šarac waits until Marko has looked into the well');step(120*3);S().p.castLock=0;
 at(t.bunar);E();ok(t.step===1,'urvina: between the two firs Marko leans over the well');
 at(t.sarac);E();ok(t.step===2,'urvina: he takes leave of Šarac');
 at(t.sablja);E();ok(t.step===3&&!p.sablja,'urvina: he breaks the sabre and the spear');
 at(t.more);api.pressed.add('KeyI');step(2);ok(t.step===4&&p.noMace&&t.mace,'urvina: from the cliff he throws the mace into the sea');
 const a0=p.attackId;api.pressed.add('KeyJ');step(4);ok(p.attackId===a0&&!(p.attack>0),'urvina: without the mace he strikes no more');
 at(t.bunar);E();ok(t.step===5&&p.lying,'urvina: he lies down under the fir');step(120*6);ok(S().mode==='levelDone','urvina: and the song is ended');}
// ---- the falcon's flight over the marsh: three ducks, the vizier's falcon, the broken wing ----
{const w=await land('mocvara');const T=w.traps.find(t=>t.kind==='soko');ok(api.lovStart()&&api.lov(),'flight: the marsh opens with the hunt, seen from the falcon');
 const L=api.lov(),hold=(...ks)=>{api.keys.clear();for(const k of ks)api.keys.add(k);};
 // a simple pilot: fly at the nearest duck and dive when close
 const steer=(tx,ty)=>{const ks=[];if(tx>L.x+12)ks.push('KeyD');else if(tx<L.x-12)ks.push('KeyA');if(ty>L.y+12)ks.push('KeyS');else if(ty<L.y-12)ks.push('KeyW');hold(...ks);};
 for(let i=0;i<120*90&&L.phase==='lov';i++){const u=L.utve.slice().sort((a,b)=>Math.hypot(a.x-L.x,a.y-L.y)-Math.hypot(b.x-L.x,b.y-L.y))[0];if(u){steer(u.x+u.vx*.2,u.y+u.vy*.2);if(Math.hypot(u.x-L.x,u.y-L.y)<170&&L.diveCd<=0)api.pressed.add('Space');}else hold();step();}
 ok(L.caught===3&&L.phase==='otimac','flight: the falcon catches three golden-winged ducks ('+L.caught+')');
 ok(L.rival,'flight: then the vizier\'s falcon comes to rob him');
 for(let i=0;i<120*90&&L.phase==='otimac';i++){const R=L.rival;if(R&&R.state==='umoran'){steer(R.x,R.y);if(Math.hypot(R.x-L.x,R.y-L.y)<150&&L.diveCd<=0)api.pressed.add('Space');}else if(R&&R.state==='nalet'){hold(R.vy>0?'KeyW':'KeyS',R.vx>0?'KeyA':'KeyD');}else hold();step();}
 ok(L.phase==='pad'&&L.hits>=2,'flight: struck twice while it is spent, the vizier\'s falcon scatters its feathers');
 api.keys.clear();for(let i=0;i<120*8&&api.lov();i++)step();
 ok(!api.lov()&&w.lovDone&&S().mode==='play','flight: the vizier breaks his wing; the flight ends and Marko stands at the start of the marsh');
 ok(T.state!=='spasen'&&Math.abs(S().p.x-S().level.spawn.x)<200,'flight: the falcon lies in the reeds where Marko must find him');}
// ---- the secret pohod: Marko's dream, four chambers and four riddles out of the songs ----
{const si=levelOf('san');ok(api.LEVELS[si].secret&&!api.levelOpen(si),'dream: the cave is not on the road until its secret is found');storage.set('marko-tajna','1');ok(api.levelOpen(si),'dream: the secret found, the cave opens');storage.delete('marko-tajna');
 storage.set('marko-skills',JSON.stringify(['niz','zid','bacanje','kontra','zamah','nadole','kolut','vihor','uzlet','tresak','juris','junacki']));api.forgetSkills();
 const w=await land('san');const p=S().p,T=w.traps,hit=(o,key='KeyJ')=>{Object.assign(p,{x:o.x-35,y:o.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0,combo:0,hurt:0});p.invuln=0;tap(key);step(45);};
 ok(w.enemies.length===0&&T.filter(t=>t.gate&&t.clue).length===4,'dream: no foes, four chambers, each with its inscription and its gate');
 // 1. the three letters on the sabre: smith, king, son
 const A=T.find(t=>t.title==='OČINA SABLJA'),hp0=p.hp;hit(A.objs[0]);ok(!A.done&&!A.prog&&p.hp<hp0,'dream: the wrong letter first, and the stone stings');
 for(const i of A.order)hit(A.objs[i]);ok(A.done&&A.objs[A.order[0]].glyph==='Н'&&A.objs[A.order[2]].glyph==='М','dream: Novak, Vukašin, Marko: the first gate opens');
 // 2. the girl who outwitted Marko: neither apple nor ring
 const B=T.find(t=>t.title==='MUDRA DEVOJKA');hit(B.objs[0]);ok(!B.done,'dream: an apple is a child\'s toy');hit(B.objs[1]);ok(!B.done,'dream: and a ring is not hers to take');
 hit(B.objs[8]);ok(B.done&&B.objs[8].glyph==='ПАВЛЕ','dream: she follows Ustupčić Pavle: the second gate opens');
 // 3. the dry cornel wood: no water until the strength is back
 const C=T.find(t=>t.kind==='dren'),heavy=()=>{Object.assign(p,{x:C.dren.x-45,y:C.dren.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0,hurt:0});api.keys.add('KeyK');api.pressed.add('KeyK');step(200);api.keys.delete('KeyK');step(70);};
 heavy();ok(!C.done,'dream: squeezed too soon, the wood splits but gives no water');
 for(const c of C.cups){Object.assign(p,{x:c.x,y:c.y,vx:0,vy:0,grounded:true});step(3);}ok(C.snaga===3,'dream: three cups of wine, as three months in the tavern');
 heavy();ok(C.done,'dream: now two drops of water spring from it: the third gate opens');
 // 4. the maple gusle: the melody three times, each time longer
 const G=T.find(t=>t.kind==='melodija');Object.assign(p,{x:G.gusle.x,y:G.gusle.y,vx:0,vy:0,grounded:true});step(3);
 for(let r=0;r<3;r++){until(()=>G.listen,120*12);ok(G.listen,'dream: the gusle play '+[3,5,7][r]+' notes and wait');const n=[3,5,7][r];for(let k=0;k<n;k++)hit(G.objs[G.seq[k]]);}
 ok(G.done,'dream: the melody repeated three times, the sabre falls from the scabbard');
 Object.assign(p,{x:S().level.goal.x-40,y:S().level.goal.y,vx:0,vy:0,grounded:true});step(3);ok(S().mode==='levelDone'&&storage.get('marko-probudjen')==='1','dream: and Marko wakes');}
// ---- Đemo, as in the song, catches Marko without his mace ----
{const c=await arena('klisura');const p=S().p;step(3);ok(p.noMace&&c.topuz,'djemo: his first blow strikes the mace from Marko\'s hand, across the field');
 ok(Math.abs(c.topuz.x-p.x)>Math.abs(c.x-p.x),'djemo: the mace lies beyond Đemo');
 const hp=c.hp;Object.assign(p,{x:c.x-70,y:c.y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});safe();tap('KeyJ');step(40);ok(c.hp===hp&&!(p.attack>0),'djemo: unarmed, Marko cannot strike');
 Object.assign(p,{x:c.topuz.x,y:c.arena.y,vx:0,vy:0,grounded:true});safe();step(3);ok(!p.noMace&&!c.topuz,'djemo: he reaches his mace and has it again');}
// ---- the chase after the vila: Šarac, the trunks, her arrows, the thrown mace ----
{const w=await land('suma');const t=w.traps.find(t=>t.kind==='potera'),p=S().p;ok(t&&t.x0<1200,'chase: Ravijojla\'s forest opens with the chase, as the song does');
 Object.assign(p,{x:t.sx,y:t.y,vx:0,vy:0,grounded:true});safe();step(3);api.pressed.add('KeyE');step(2);ok(t.state==='trka'&&S().horseMounted,'chase: E beside Šarac and Marko is in the saddle');
 ok(w.barriers.length>=4,'chase: fallen trunks lie across the road');const v0=t.vila.x;
 let shots=0;for(let i=0;i<120*40&&!t.reach;i++){safe();api.keys.clear();api.keys.add('KeyD');const b=w.barriers.find(b=>b.x-p.x>40&&b.x-p.x<150);if(b&&p.grounded)api.pressed.add('Space');shots=Math.max(shots,S().arrows.filter(a=>a.enemy).length);step();}
 ok(t.vila.x>v0+1500,'chase: the vila flies ahead across the mountain');ok(shots>0,'chase: and looses her arrows back at Marko');ok(t.reach,'chase: where the road ends Šarac brings Marko within a throw');
 api.keys.clear();api.pressed.add('KeyI');step(2);ok(t.state==='hitac','chase: I throws the mace');until(()=>{safe();return t.state==='kraj';},120*10);
 ok(t.done&&!S().horseMounted&&S().mode==='play','chase: the mace takes her between the shoulders, she heals Miloš, and Marko is on foot again');
 Object.assign(p,{x:t.gate.x+80,y:t.y,vx:0,vy:0,grounded:true});step(3);ok(p.x>t.gate.x,'chase: the way on through the forest is open');}
// ---- the judgment in the monastery: whose is the empire ----
{const w=await land('manastir');const g=w.goals.find(g=>g.kind==='take'),p=S().p;ok(g,'judgment: the imperial book lies in the monastery');
 Object.assign(p,{x:g.x,y:g.y,vx:0,vy:0,grounded:true,rage:0});safe();step(3);ok(g.done&&S().mode==='shop','judgment: taking the book puts the question: whose is the empire');
 const pw=p.power||1;ok(!api.presuda(0)&&S().mode==='shop','judgment: for his father is false, and the question stands');ok(!api.presuda(1)&&!api.presuda(2),'judgment: for his uncles is false too');
 ok(api.presuda(3)&&S().mode==='play'&&p.power>pw&&p.rage===100,'judgment: the empire is Uroš\'s: the tsar\'s blessing stays on Marko');}
// ---- the archery match with Alil-aga on the sultan's road ----
{const w=await land('oranje');const t=w.traps.find(t=>t.kind==='strela'),p=S().p;ok(t,'archery: Alil-aga stands in the road in Oranje');
 Object.assign(p,{x:t.x+40,y:t.y,vx:0,vy:0,grounded:true});safe();step(3);api.pressed.add('KeyE');step(2);ok(t.state==='aga'&&p.noMace,'archery: E accepts the match; the mace waits');
 until(()=>t.state==='marko',120*5);ok(t.state==='marko'&&t.r===0,'archery: the aga shoots first: 120 aršina');
 // a weak pull falls short and the round is shot again
 until(()=>t.t>.4&&t.pow<.25,120*5);api.pressed.add('KeyJ');step(2);until(()=>t.state==='marko'&&t.t<.2,120*5);ok(t.r===0&&!t.win,'archery: a slack string falls short and Marko shoots again');
 for(let r=0;r<3;r++){until(()=>t.state==='marko'&&t.t>.4&&t.pow>.9,120*12);api.pressed.add('KeyJ');step(2);until(()=>t.r>r||t.state==='kraj',120*6);ok(t.r===r+1,'archery: a full draw beats the aga\'s '+[120,300,600][r]+' aršina');}
 ok(t.state==='kraj'&&p.pobratim&&!p.noMace,'archery: beaten, Alil-aga is Marko\'s sworn brother');
 const c=w.enemies.find(e=>e.champion);for(const e of w.enemies)if(e.champion||e.trioMate){e.alive=true;e.hp=e.maxHp;}
 const q=w.platforms.filter(q=>q.ground&&c.arena.x0+150>q.x&&c.arena.x0+150<q.x+q.w).sort((a,b)=>a.y-b.y)[0];Object.assign(p,{x:c.arena.x0+150,y:q.y,vx:0,vy:0,grounded:true});
 let friendly=false;for(let i=0;i<120*14&&!friendly;i++){safe();step();friendly=S().arrows.some(a=>!a.enemy);}ok(friendly,'archery: in the megdan his arrows fall on Marko\'s foes');}
// ---- the duel of looks with Ljutica Bogdan ----
{const w=await land('reka');const t=w.traps.find(t=>t.kind==='pogled'),p=S().p;ok(t,'look: Ljutica Bogdan bars the road by the river');
 Object.assign(p,{x:t.x-400,y:t.y,vx:0,vy:0,grounded:true});safe();api.keys.add('KeyD');step(120*4);api.keys.clear();ok(p.x<t.gate.x,'look: there is no way past him');
 Object.assign(p,{x:t.x-160,y:t.y,vx:0,vy:0,grounded:true});step(3);api.pressed.add('KeyE');step(3);ok(t.state==='gleda','look: E and the two of them lock eyes');
 step(120*2);ok(t.armed&&t.t>1.5&&t.f>=1,'look: Bogdan feints while Marko holds still');tap('KeyJ');step(2);ok(t.state==='trepnuo','look: reaching for the mace is blinking');
 step(120*2);ok(!t.state&&!t.done,'look: and the duel begins again');
 api.pressed.add('KeyE');step(3);for(let i=0;i<120*8&&!t.done;i++)step();ok(t.done&&p.wine>=3,'look: held to the end, Bogdan\'s legs go numb; they make peace and drink');
 Object.assign(p,{x:t.gate.x-120,y:t.y,vx:0,vy:0,grounded:true});api.keys.add('KeyD');step(120*2);api.keys.clear();ok(p.x>t.gate.x,'look: the road through the vineyard is open');}
console.log(`${checks} battle checks passed.`);
