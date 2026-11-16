// Stefan, 15. 11. 2026: ekonomija, odmor jakih udaraca, meni Napredak (stepeni veština) i Crni vrač. node napredak-test.mjs
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
storage.set('marko-moci',JSON.stringify(['trag','kombo','potres','oko','krilo','lanac','nalet','gaz','zidotrk']));
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{ok:true,json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+
 '\nreturn {startLevel,update,keys,pressed,LEVELS,JOURNEY,EKON,lootCoins,killCoins,RANK_COST,rankUp,skillRank,cdFull,cdReady,strike,bank,setBank,ownedSkills,'+
 'kupiKovac,smithLevels,slay,finishBlow,lakiKlip,uvod:()=>({uvodMeg,kamCilj}),bledo:()=>bledo,setFin:f=>{finisher=f;},kinoTick,film:()=>({slowMo,kinoT,hitstop,sepija,endSequence}),superStrike,die,arrows:()=>arrows,state:()=>({p,world,mode,corpses}),setMode:m=>{mode=m;},draw:()=>{try{draw(1/60);}catch(e){return e;}return null;}};')
 (physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
let checks=0;const ok=(c,m)=>{checks++;assert.ok(c,m);};
const S=api.state,lv=id=>api.LEVELS.findIndex(L=>L.id===id),step=n=>{for(let i=0;i<n;i++)api.update(1/120);};

// ---- ekonomija: plen upola, ponovljeno poglavlje trećina, slova 20 ----
ok(api.lootCoins(20)===10&&api.lootCoins(1)===1,'loot: a chest of 20 gives 10, never less than one');
ok(api.killCoins(false)===2&&api.killCoins(true)===5,'a foe gives 2 ducats, an elite 5');
ok(api.EKON.slova===20,'the five letters give 20 ducats');

// ---- odmor jakih udaraca: K drugi put odmah ne prolazi ----
await api.startLevel(lv('selo'));{const {p,world}=S();for(const e of world.enemies)e.alive=false;Object.assign(p,{cooldown:0,attack:0,grounded:true});
 api.strike(true);ok(p.attackKind==='heavy'&&p.cd?.tezak>1.5,'the heavy blow starts its own rest (1.6 s)');
 Object.assign(p,{attack:0,cooldown:0});const id=p.attackId;api.strike(true);ok(p.attackId===id,'a second heavy blow at once is refused while it rests');
 step(120*1.8);Object.assign(p,{attack:0,cooldown:0});api.strike(true);ok(p.attackId!==id,'after the rest K strikes again');}

// ---- Napredak: stepen veštine za dukate skraćuje odmor ----
storage.set('marko-skills',JSON.stringify(['niz','zamah']));api.ownedSkills().add('niz');api.ownedSkills().add('zamah');
api.setBank(500);const cd1=api.cdFull('tezak');ok(api.rankUp('zamah')&&api.bank()===500-api.RANK_COST[0],'rank II of the full swing costs 120 ducats');
ok(api.skillRank('zamah')===2&&Math.abs(api.cdFull('tezak')-cd1*.85)<1e-9,'rank II: the heavy blow rests 15 % less');
ok(api.rankUp('zamah')&&api.skillRank('zamah')===3&&!api.rankUp('zamah'),'rank III is the highest');
api.setBank(50);ok(!api.rankUp('niz'),'no rank without the ducats');
api.setBank(100);ok(api.kupiKovac('hp')&&api.smithLevels().hp===1&&api.bank()===30,'the smith sells mail for 70 ducats');

// ---- Crni vrač: novi nivo i bos ----
ok(api.JOURNEY.includes('vracara')&&api.JOURNEY.indexOf('vracara')===api.JOURNEY.indexOf('reka')+1,'Vračeva jaruga comes after the river, before Urvina');
await api.startLevel(lv('vracara'));{const {p,world}=S(),c=world.enemies.find(e=>e.champion);
 ok(c&&c.kit==='vrac'&&c.look==='vrac','the champion of Vračeva jaruga is the Black Sorcerer');
 Object.assign(p,{x:c.arena.x0+160,y:c.y,vx:0,vy:0,grounded:true});const seen=new Set();let cini=0;
 for(let i=0;i<120*16;i++){p.hp=p.maxHp;p.invuln=1;api.update(1/120);if(c.vk)seen.add(c.vk.s);cini=Math.max(cini,api.arrows().filter(a=>a.cini).length);}
 ok(c.engaged,'the sorcerer takes up the duel');
 ok(seen.has('carolija')&&cini>0,'he casts charms that fly at Marko');
 ok(seen.has('nestaje')&&seen.has('skriven')&&seen.has('pojavljuje'),'he vanishes in smoke and appears elsewhere');
 c.hp=c.maxHp*.45;let klon=0;for(let i=0;i<120*14;i++){p.hp=p.maxHp;p.invuln=1;api.update(1/120);klon=Math.max(klon,c.vk.klon.length);}
 ok(klon>=2,'below half he splits into shadows');
 c.vk.s='stoji';c.vk.t=5;c.vk.nevidljiv=false;c.stun=0;const h=c.hp;api.arrows().push({cini:true,x:c.x,y:c.y-80,vx:0,vy:0,life:1,enemy:false});api.update(1/120);
 ok(c.hp<=h-100,'his own charm, sent back with the shield, hurts him');
 c.vk.s='skriven';c.vk.t=5;c.vk.nevidljiv=true;const h2=c.hp;api.arrows().push({cini:true,x:c.x,y:c.y-80,vx:0,vy:0,life:1,enemy:false});api.update(1/120);
 ok(c.hp===h2,'in the smoke nothing reaches him');
 ok(api.draw()===null,'the duel draws');
 api.slay(c);ok(!c.alive&&S().corpses.some(k=>k.type==='vrac'),'he falls in his own clip');}
// ---- branik: odbrana ljudi u četiri čete ----
await api.startLevel(lv('manastir'));{const {p,world}=S(),T=world.traps.find(t=>t.kind==='branik');ok(T&&T.who==='kaluderi','the monastery has its defence of the monks');
 for(const e of world.enemies)e.alive=false;Object.assign(p,{x:T.x0+200,y:T.y,vx:0,vy:0,grounded:true});step(10);ok(T.state==='odbrana','stepping in starts the defence');
 let bands=0;for(let i=0;i<120*80&&T.state==='odbrana';i++){p.hp=p.maxHp;p.invuln=1;api.update(1/120);if(i%60===0){for(const e of world.enemies)if(e.alive&&e.prey===T)api.slay(e);bands=Math.max(bands,T.wave);}}
 ok(bands===4&&T.state==='spaseni','four bands, and the monks are saved');}
// ---- F1: kill-cam za poslednjeg dušmanina bitke ----
await api.startLevel(lv('selo'));{const {p,world}=S(),near=world.enemies.filter(e=>e.alive&&!e.champion).slice(0,4);for(const e of world.enemies)if(!near.includes(e))e.alive=false;
 near.forEach((e,i)=>Object.assign(e,{x:p.x+150+i*60,y:p.y}));step(120);for(const e of near.slice(0,3)){api.slay(e);step(30);}
 ok(api.film().slowMo<=0,'a foe falls, others still stand: no slow motion yet');api.slay(near[3]);ok(api.film().slowMo>0&&api.film().kinoT>0,'the last of the fight falls slowly, the camera leans in');}
// ---- Stefan, 16. 11.: završni udarac vraća 5 zdravlja; tri različita laka udarca; nove kombinacije ----
await api.startLevel(lv('selo'));{const {p,world}=S(),e=world.enemies.find(o=>o.alive&&!o.champion);for(const o of world.enemies)if(o!==e)o.alive=false;
 p.hp=40;const F={e,kind:'gazi',t:0,dur:1};try{api.finishBlow(F);}catch(err){}ok(p.hp===45,'a finishing blow gives back 5 health');
 try{api.finishBlow(F);}catch(err){}ok(p.hp===45,'once per finished foe, not twice');
 ok(new Set([0,1,2].map(api.lakiKlip)).size===3,'J, J J and J J J are three different blows');}
await api.startLevel(lv('selo'));{const {p,world}=S(),e=world.enemies.find(o=>o.alive&&!o.champion&&o.type!=='oklopnik');for(const o of world.enemies)if(o!==e)o.alive=false;
 Object.assign(p,{cooldown:0,attack:0,grounded:true,face:1,cd:{}});Object.assign(e,{x:p.x+90,y:p.y,hp:999,maxHp:999,stun:0});
 api.strike(false);ok(p.attackKind==='light'&&p.combo===0,'J: the first light blow');Object.assign(p,{cooldown:0,attack:0});
 api.strike(true);ok(p.attackKind==='obarac','J K: Obarač');for(let i=0;i<60&&!(e.obT>0);i++)api.update(1/120);
 ok(e.obT>0&&e.prone===1,'Obarač knocks the foe to the ground');step(240);ok(!(e.obT>0)&&!e.prone,'and he gets up after a while');
 Object.assign(p,{cooldown:0,attack:0,comboWindow:0,cd:{}});e.x=p.x-120;e.stun=0;
 api.strike(false);Object.assign(p,{cooldown:0,attack:0});api.strike(false);Object.assign(p,{cooldown:0,attack:0});api.strike(false);ok(p.combo===2,'J J J: the third blow');
 Object.assign(p,{cooldown:0,attack:0});api.strike(true);ok(p.attackKind==='tresakNiza','J J J K: Tresak niza');
 for(let i=0;i<90&&!(e.obT>0);i++)api.update(1/120);ok(e.obT>0,'Tresak niza fells a foe behind Marko too');}
// ---- Stefan, 16. 11.: držanje J ne ponavlja udarac; kombinacije sa šutom ----
{const press=(cs,n=1)=>{for(const c of cs){api.pressed.add(c);api.keys.add(c);}step(n);for(const c of cs)api.keys.delete(c);};
 const setup=async()=>{await api.startLevel(lv('selo'));const {p,world}=S(),f=world.enemies.filter(o=>o.alive&&!o.champion&&o.type!=='oklopnik'&&o.type!=='shield').slice(0,2);
  for(const o of world.enemies)if(!f.includes(o))o.alive=false;Object.assign(p,{cooldown:0,attack:0,grounded:true,face:1,cd:{},kickCd:0,vx:0});
  f.forEach((o,i)=>Object.assign(o,{x:p.x+(i?270:85),y:p.y,hp:999,maxHp:999,stun:0,obT:0,prone:0,vx:0,vy:0,grounded:true,air:false,enter:false,spava:false,razgovor:0}));return{p,f};};
 {const {p,f}=await setup();for(const o of f)o.x+=600;const ids=new Set();api.pressed.add('KeyJ');api.keys.add('KeyJ');
  for(let i=0;i<240;i++){api.update(1/120);if(p.attack>0)ids.add(p.attackId);}api.keys.delete('KeyJ');
  ok(ids.size===1,'holding J strikes once, not over and over');step(60);press(['KeyJ']);ok(p.attack>0&&!ids.has(p.attackId),'a new press of J strikes again');}
 {const {p,f}=await setup();press(['KeyS','KeyJ'],2);ok(p.kick>0,'S+J: the kick');api.keys.add('KeyS');step(46);ok(p.kickWin>0,'a kick that lands opens the window');
  press(['KeyJ']);api.keys.delete('KeyS');ok(p.attackKind==='zanjim','S+J then J: Za njim! (S may still be held)');}
 {const {p,f}=await setup();const e=f[0];press(['KeyS','KeyJ'],2);step(46);press(['KeyK']);ok(p.attackKind==='zakucaj','S+J then K: Zakucaj');
  for(let i=0;i<90&&!(e.obT>0);i++)api.update(1/120);ok(e.obT>0,'Zakucaj drives the kicked foe into the ground');}
 {const {p,f}=await setup();const [e,o]=f;press(['KeyJ']);step(50);press(['KeyJ']);step(50);ok(p.combo===1&&p.comboWindow>0,'J J, the window still open');
  press(['KeyS','KeyJ'],2);ok(p.kickJunak,'J J S+J: Junački šut');const h=o.hp;for(let i=0;i<150&&!(o.obT>0);i++)api.update(1/120);
  ok(o.obT>0&&o.hp<h,'the kicked foe flies and fells the one behind him');}}
// ---- Stefan, 16. 11.: Shift bez pravca je odskok unazad, sa pravcem kolut ----
await api.startLevel(lv('selo'));{const {p,world}=S();for(const e of world.enemies)e.alive=false;storage.set('marko-skills',JSON.stringify(['niz','zamah','kolut']));api.ownedSkills().add('kolut');
 api.keys.add('KeyD');step(120*2);api.keys.delete('KeyD');Object.assign(p,{face:1,vx:0,dashCooldown:0});step(60);let x0=p.x;api.pressed.add('ShiftLeft');step(1);
 ok(p.dash>0&&p.backstep&&p.face===1,'Shift alone: a hop back, still facing forward');step(40);ok(p.x<x0-80&&p.face===1&&p.grounded,'he lands behind where he stood');
 step(120);x0=p.x;api.keys.add('KeyD');api.pressed.add('ShiftLeft');step(1);ok(p.dash>0&&!p.backstep,'Shift with a direction: the roll');step(40);api.keys.delete('KeyD');ok(p.x>x0+80,'the roll goes forward');}
// ---- noć, F2: uvod megdana: kamera na bosa i nazad, ime velikim slovima, bos sačeka ----
await api.startLevel(lv('vracara'));{const {p,world}=S(),c=world.enemies.find(e=>e.champion);
 Object.assign(p,{x:c.arena.x0+160,y:c.y,vx:0,vy:0,grounded:true,invuln:9});step(1);
 ok(c.engaged&&api.uvod().uvodMeg&&c.uvodT>0,'megdan: the duel opens with its introduction');
 ok(api.uvod().kamCilj&&Math.abs(api.uvod().kamCilj.x-c.x)<1,'megdan: the camera goes to the champion');
 const N=api.uvod().uvodMeg.naslov;ok(N[0]===c.name&&N[1]==='senka iz jaruge','megdan: his name in great letters and who he is');
 const s0=c.vk?.s,t0=c.vk?.t;step(120);ok(c.uvodT>0||c.vk?.s===s0,'megdan: the champion holds a breath before he starts');
 step(30);ok(api.uvod().kamCilj===null,'megdan: the camera comes back to Marko');step(120*3);ok(api.uvod().uvodMeg===null,'megdan: the introduction ends');
 const st=S();await api.startLevel(lv('vracara'));{const c2=S().world.enemies.find(e=>e.champion);Object.assign(S().p,{x:c2.arena.x0+160,y:c2.y,vx:0,vy:0,grounded:true,invuln:9});step(1);
  await api.startLevel(lv('selo'));step(2);ok(api.uvod().kamCilj===null&&api.uvod().uvodMeg===null,'megdan: a new start never leaves the camera on the champion');}}
// ---- noć, F3: tiho obaranje: zum i boje izblede za trenutak ----
{const e={x:S().p.x+60,y:S().p.y};api.setFin({kind:'tiho',e,t:0,dur:1.3});for(let i=0;i<20;i++)api.kinoTick(1/60);ok(api.bledo()>.85,'tiho: the colours drain while Marko takes him silently');
 api.setFin(null);for(let i=0;i<120;i++)api.kinoTick(1/60);ok(api.bledo()===0,'tiho: and come back after');
 api.setFin({kind:'gazi',e,t:0,dur:1.2});for(let i=0;i<20;i++)api.kinoTick(1/60);ok(api.bledo()===0,'tiho: a loud finisher keeps its colours');api.setFin(null);}
// ---- noć, F4: junački udar: zamrznut kadar, zum i crvena crta pre udara ----
await api.startLevel(lv('selo'));{const {p,world}=S(),e=world.enemies.find(o=>o.alive&&!o.champion&&o.type!=='oklopnik');for(const o of world.enemies)if(o!==e)o.alive=false;
 api.ownedSkills().add('junacki');Object.assign(p,{rage:100,cooldown:0,attack:0,grounded:true,face:1,dash:0,drink:0});Object.assign(e,{x:p.x+120,y:p.y,hp:9999,maxHp:9999,stun:5});
 api.superStrike();ok(p.attackKind==='super'&&!p.superFreeze,'junački udar: Marko raises the mace');const h=e.hp;let fr=0;
 for(let i=0;i<120&&!p.superFreeze;i++){step(1);fr++;}ok(p.superFreeze&&api.film().hitstop>.2&&api.film().kinoT>0,'junački udar: at the height of the swing the picture stands still and leans in');
 ok(e.hp===h,'junački udar: the stillness comes before the blow');for(let i=0;i<200&&e.hp===h;i++)step(1);ok(e.hp<h,'junački udar: then the blow falls');}
// ---- noć, F5: kad Marko padne: usporenje, zum i sepija pre „Ustani, junače” ----
await api.startLevel(lv('selo'));{const {p,world}=S();for(const o of world.enemies)o.alive=false;step(10);api.die();
 ok(S().mode==='dead'&&api.film().kinoT>0,'pad: Marko falls, the picture leans in on him');
 step(120);const F=api.film();ok(F.endSequence?.age<.6,'pad: the moment slows (a second goes by as less than half of one)');ok(F.sepija>.6,'pad: the colours go to sepia');
 step(120*4);ok(S().mode==='dead'&&api.film().sepija>.95,'pad: sepia holds under „Ustani, junače”');
 await api.startLevel(lv('selo'));step(120);ok(api.film().sepija===0,'pad: back on the road, the colours come back');}
console.log(`PASS ${checks} napredak, ekonomija, odmori, Crni vrač, branik, kill-cam, kombinacije, odskok, uvod megdana, tiho obaranje, junački udar i pad Marka`);
