// Plays the pohod mechanics with real input, headless: node mechanics-test.mjs
// Ladders, wall jumps up a shaft, dropping through planks, crates and chests, ducats, marvels, the thrown mace,
// foes that jump gaps and steps and climb ladders, archers shooting down from towers, and the plow teams.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
// the game rolls dice; the tests play the same game every time (SEED=<n> plays another)
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// the powers of the road (shrines, marko-moci) are all found, unless a test takes them away
storage.set('marko-moci',JSON.stringify(['trag','kombo','potres','oko','krilo','lanac','nalet','gaz','zidotrk']));
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {start,startChapter,startLevel,update,keys,pressed,LEVELS,plowSpoils,slay,has,SKILLS,levelOpen,completeLevel,playerPose,placeLabel,idleFrame,FOE_IDLE,damage,TRAG_LIFE,TRAG_CD,startVezbaliste,MOCI2,AMAJLIJE,amState,am,amToggle,resetMoci2:()=>{amCache=null;udarCache=null;udarNext=0;},udari,izaberiUdar,izvori,putuj,closeIzvor,closeKarta,lanacTarget,ducanList,buyDucan,UK,moc2,moc,vilaTu,MOC_GDE,mociReset:()=>{mociCache=null;},OKO_MAX,ZID_TIME,setBank,bank,setLevel:v=>{level=v;},shakeNow:()=>shake,grunts:()=>gruntCount,state:()=>({p,world,mode,level,thrown,coins,perks,bank:bank(),zone,boss,arrows,lastSafe,gaz,talasi,ckpt,izvorAt})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const S=()=>api.state();
const levelOf=id=>api.LEVELS.findIndex(L=>L.id===id);
async function start(id){await api.startLevel(levelOf(id),'day');api.keys.clear();api.pressed.clear();return S().world;}
function stand(x,y){const {p}=S();p.x=x;p.y=y;p.vx=0;p.vy=0;p.grounded=true;p.climb=null;p.hp=p.maxHp;p.invuln=99;p.wall=0;p.ledgeT=0;p.attack=0;p.cooldown=0;}
const press=k=>{api.keys.add(k);api.pressed.add(k);};const release=k=>api.keys.delete(k);
const tap=k=>{press(k);step();release(k);};
const quiet=(w,keep=[])=>{for(const e of w.enemies)if(!keep.includes(e))e.alive=false;};
const floorAt=(w,x)=>w.platforms.filter(q=>q.ground&&x>q.x+10&&x<q.x+q.w-10).sort((a,b)=>a.y-b.y)[0];
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};

// ---- the journey: pohodi open one by one, each finished pohod teaches a skill ----
{ok(api.levelOpen(0)&&!api.levelOpen(1),'journey: the song begins in the village, and only the first pohod is open');ok(api.LEVELS.filter(L=>!L.izazov).map(L=>L.id).join(' ')==='selo suma manastir oranje tvrdjava podrum mocvara pecina prevoj klisura rusevine rudnik reka urvina san','journey: the pohodi follow the life of Marko');ok(api.LEVELS.findIndex(L=>L.izazov)>=api.LEVELS.length-api.LEVELS.filter(L=>L.izazov).length,'journey: the challenge pohodi (izazov) stand after it, apart from the song');
 {const done=api.LEVELS.slice(0,9).map(L=>L.id);storage.set('marko-levels',JSON.stringify(done));ok(api.levelOpen(8)&&!api.levelOpen(9),'journey: after the ninth pohod the road is shut until Musa falls');storage.set('marko-kacanik','won');ok(api.levelOpen(9)&&!api.levelOpen(10),'journey: Musa fallen, the gorge opens');storage.delete('marko-levels');storage.delete('marko-kacanik');}
 {const order=api.LEVELS.map(L=>L.id),learn=id=>order.indexOf(api.SKILLS.find(k=>k.id===id).land),need=order.filter(id=>(physics.RECIPES[id]||'').split(' ').includes('chimney^'));ok(need.length>=3&&need.every(id=>learn('zid')<order.indexOf(id)),'journey: every pohod whose road climbs wall to wall ('+need.join(', ')+') comes after the wall jump is learned');
  ok(api.SKILLS.every((k,i)=>i===0||learn(k.id)>learn(api.SKILLS[i-1].id)),'journey: the skills are learned in the order they are listed');}
 const w=await start('manastir');quiet(w);ok(!api.has('zid'),'journey: the wall jump is still locked');
 const a=w.platforms.find(q=>q.hang&&!q.bedem),gy=floorAt(w,a.x+a.w+20).y;stand(a.x+a.w+30,gy);tap('Space');api.keys.add('KeyA');let grabbed=false;for(let i=0;i<120;i++){step();if(S().p.wall)grabbed=true;}api.keys.clear();ok(!grabbed,'journey: without the skill Marko cannot cling to a wall');
 await start('selo');api.completeLevel();ok(api.has('niz')&&api.levelOpen(1),'journey: finishing the village teaches the combo and opens the monastery');}
// ---- story chapters start where the map says: the horse in IV, Musa in VI ----
{api.startChapter(3);ok(S().mode==='play'&&api.state().zone===3,'story: chapter IV starts at Šarac');step(10);
 api.startChapter(5);ok(api.state().zone===5&&api.state().boss.alive,'story: chapter VI starts at the duel with Musa');
 api.startChapter(1);ok(api.state().zone===1,'story: chapter II starts at the gate and its waves');}
storage.set('marko-skills',JSON.stringify(api.SKILLS.map(k=>k.id)));

// ---- ladders: W climbs to the top and steps off onto the platform ----
{const w=await start('klisura');quiet(w);const l=w.ladders.find(l=>l.side===1);stand(l.x,l.bottom);press('KeyW');step(240);release('KeyW');step(20);const {p}=S();
 ok(Math.abs(p.y-l.top)<2&&p.grounded&&!p.climb,`ladder: Marko climbs ${l.bottom-l.top}px and stands on top`);}
// ---- the watchtower deck: climb up, then S+Space drops back through the planks ----
{const w=await start('selo');quiet(w);const t=w.towers[0],l=w.ladders.find(l=>l.top===t.top);stand(l.x,l.bottom);press('KeyW');step(260);release('KeyW');step(10);
 ok(Math.abs(S().p.y-t.top)<2&&S().p.grounded,'watchtower: the ladder ends on the deck');
 S().p.x=t.x+40;step(10);press('KeyS');step(2);tap('Space');step(40);release('KeyS');step(60);ok(S().p.y>t.top+100,'watchtower: S+Space drops through the deck');}
// ---- a shaft above the road: jump in and climb it wall to wall ----
async function climbShaft(id,mandatory){const w=await start(id);quiet(w);const a=w.platforms.find(q=>q.hang&&!q.bedem),b=w.platforms.filter(q=>q.solid&&q.x>a.x+a.w&&q.x-(a.x+a.w)<200).sort((u,v)=>u.x-v.x)[0];
 const gy=floorAt(w,a.x+a.w+20).y;stand(a.x+a.w+(b.x-a.x-a.w)/2,gy);let dir=1,jumps=0,best=gy;
 for(let i=0;i<120*9;i++){const {p}=S();api.keys.delete(dir>0?'KeyA':'KeyD');api.keys.add(dir>0?'KeyD':'KeyA');
  if(p.grounded&&p.y>b.y+20){tap('Space');continue;}
  if(p.wall){dir=-p.wall;tap('Space');jumps++;continue;}
  step();best=Math.min(best,S().p.y);if(S().p.grounded&&S().p.y<=Math.max(a.y,b.y)+2)break;}
 api.keys.clear();step(30);const {p}=S();
 ok(p.grounded&&p.y<=Math.max(a.y,b.y)+2,`${id}: ${mandatory?'the road climbs':'a shaft climbs'} ${Math.round(gy-p.y)}px wall to wall (${jumps} wall jumps)`);}
await climbShaft('manastir',false);
await climbShaft('rusevine',true);
// ---- crates and jars break, ducats fly out and are collected; chests open ----
{const w=await start('selo');quiet(w);const b=w.breakables.find(b=>['sanduk','bure','plast'].includes(b.kind)&&b.y===floorAt(w,b.x)?.y);stand(b.x-70,b.y);S().p.face=1;const before=S().bank;
 for(let i=0;i<6&&!b.broken;i++){tap('KeyJ');step(70);}
 ok(b.broken,'crates: J breaks a crate');ok(!w.platforms.includes(b.plat),'crates: a broken crate no longer blocks the road');
 step(240);const got=S().bank-before;ok(b.loot.coins?got>=b.loot.coins:true,`crates: ducats from the crate reach the purse (+${got})`);
 const c=w.breakables.find(b=>b.kind==='kovceg');if(c){stand(c.x-60,c.y);S().p.face=1;tap('KeyJ');step(80);ok(c.opened,'chests: one blow opens a chest');}}
// ---- the land's marvel is kept for good and strengthens Marko on the next pohod ----
{const w=await start('manastir');quiet(w);const i=w.items.find(i=>i.type==='cudo');ok(i&&i.cudo==='carska-knjiga','marvels: the monastery hides the Tsar\'s charter');
 stand(i.x,i.y+46);step(5);ok(i.taken&&JSON.parse(storage.get('marko-cuda')).includes('carska-knjiga'),'marvels: taking it stores it in the treasury');
 await start('selo');ok(S().p.maxHp===135,`marvels: the charter adds 15 health on the next pohod (${S().p.maxHp})`);storage.delete('marko-cuda');}
// ---- the thrown mace hits on the way out and comes back ----
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch);quiet(w,[e]);const gy=floorAt(w,e.x-240).y;e.y=gy;stand(e.x-240,gy);S().p.face=1;S().p.energy=100;e.stun=9;const hp=e.hp;
 tap('KeyI');step(90);ok(e.hp<hp,`mace: the thrown mace hits a foe 240px away (−${Math.round(hp-e.hp)})`);step(360);ok(!S().thrown,'mace: it comes back to Marko\'s hand');}
// ---- foes chase Marko: across a gap, over a pillar, up a ladder ----
{const w=await start('prevoj');const gapEdge=w.platforms.filter(q=>q.ground).sort((a,b)=>a.x-b.x).find((q,i,arr)=>arr[i+1]&&arr[i+1].x-(q.x+q.w)>100&&Math.abs(arr[i+1].y-q.y)<5);
 const far=w.platforms.filter(q=>q.ground).find(q=>q.x>gapEdge.x+gapEdge.w+100);const e=w.enemies.find(e=>!e.perch&&e.type==='sword')||w.enemies[0];quiet(w,[e]);e.type='sword';e.perch=false;
 e.x=gapEdge.x+gapEdge.w-80;e.y=gapEdge.y;e.grounded=true;stand(far.x+260,far.y);S().p.invuln=99;step(120*5);
 ok(e.alive&&e.x>far.x&&Math.abs(e.y-far.y)<3,`foes: a janissary jumps a ${far.x-(gapEdge.x+gapEdge.w)}px gap to reach Marko`);}
{const w=await start('selo');const pil=w.platforms.find(q=>q.pillar);const e=w.enemies.find(e=>!e.perch);quiet(w,[e]);e.type='sword';const gy=floorAt(w,pil.x-120).y;e.x=pil.x-120;e.y=gy;e.grounded=true;stand(pil.x+pil.w+330,gy);S().p.invuln=99;step(120*5);
 ok(e.alive&&e.x>pil.x+pil.w,`foes: a janissary jumps a ${gy-pil.y}px pillar`);}
{const w=await start('klisura');const l=w.ladders.find(l=>l.side===1);const e=w.enemies.find(e=>!e.perch);quiet(w,[e]);e.type='sword';e.perch=false;e.x=l.x-150;e.y=l.bottom;e.grounded=true;stand(l.x+160,l.top);S().p.invuln=99;step(120*7);
 ok(e.alive&&Math.abs(e.y-l.top)<3,`foes: a janissary climbs a ${l.bottom-l.top}px ladder after Marko`);}
// ---- archers on towers shoot down at Marko ----
{const w=await start('manastir');const a=w.enemies.find(e=>e.perch);quiet(w,[a]);const gy=floorAt(w,a.x-260)?.y??590;stand(a.x-260,gy);S().p.invuln=99;step(120*3);
 const shot=S().world&&api.state();ok(a.alive&&a.perch,'archers: a tower archer stays on his perch');}
{const w=await start('manastir');const a=w.enemies.find(e=>e.perch);quiet(w,[a]);const gy=floorAt(w,a.x-260)?.y??590;stand(a.x-260,gy);S().p.invuln=0;const hp=S().p.hp;step(120*4);
 ok(S().p.hp<hp,`archers: arrows aimed down from ${Math.round(gy-a.y)}px above hit Marko`);}
// ---- the plowing road: Marko plows it himself; the janissaries come to forbid it; he lifts the plow and the oxen ----
{const w=await start('oranje');quiet(w);const pl=w.plowTeams[0],x0=pl.x;stand(pl.x-700,pl.y);step(120*2);ok(pl.x===x0&&!w.enemies.some(e=>e.alive&&e.plow===pl.id),'plow: the team waits for Marko, and no Turk plows the road');
 stand(pl.x-165,pl.y);S().p.invuln=0;tap('KeyE');step(3);ok(pl.held&&S().p.ore===pl,'plow: Marko takes the plow by the handles');
 press('KeyD');step(120*2);ok(pl.x>x0+150&&Math.abs(S().p.x-(pl.x-168))<4&&pl.furrow.length>3,'plow: he plows the road and walks behind the team');
 for(let i=0;i<120*12&&pl.phase==='ore';i++)step();release('KeyD');ok(pl.phase==='boj'&&pl.x===pl.x1,'plow: the furrow reaches the boundary stone');
 const turks=w.enemies.filter(e=>e.alive&&e.plow===pl.id);ok(turks.length===3&&turks.every(e=>e.x>pl.x+300),'plow: three janissaries come to forbid the plowing');
 for(const e of turks){e.x=S().p.x+150+turks.indexOf(e)*60;}S().p.invuln=99;const hp=turks.map(e=>e.hp);tap('KeyK');step(2);
 ok(pl.lifted&&!pl.held&&turks.every((e,k)=>e.hp<hp[k]||!e.alive),'plow: he lifts the plow and the oxen, and the blow falls on all three');
 for(const e of turks)if(e.alive)api.slay(e);step(60);ok(pl.phase==='gotovo'&&w.items.some(i=>i.type==='tovar'&&i.plow===pl),'plow: the janissaries fallen, a load of treasure lies on the furrow');
 stand(pl.x-165,pl.y);tap('KeyE');step(2);ok(!pl.held,'plow: a finished stretch is not plowed twice');}
// ---- down + jump drops through planks in a pohod, and through the floating stones of the Kačanik story ----
{const w=await start('selo');quiet(w);const q=w.platforms.find(q=>q.kind==='plank'&&!q.bridge&&!q.crumble);stand(q.x+q.w/2,q.y);step(5);api.keys.add('KeyS');step(3);tap('Space');step(30);api.keys.clear();step(60);
 ok(S().p.y>q.y+60&&S().p.grounded,`drop: S+Space leaves a plank ${Math.round(S().p.y-q.y)}px above the road`);}
{api.start();const w=S().world;const q=w.platforms.find(q=>q.y<585&&q.kind!=='magic');stand(q.x+q.w/2,q.y);S().p.invuln=99;step(5);api.keys.add('KeyS');step(3);tap('Space');step(30);api.keys.clear();step(80);
 ok(S().p.y===590&&S().p.grounded,'drop: the Kačanik story too: down through a floating stone onto the road');
 stand(q.x+q.w/2-300,590);step(5);api.keys.add('KeyS');step(3);tap('Space');step(60);api.keys.clear();step(200);ok(S().p.y===590&&S().p.grounded,'drop: the road itself never gives way');}
// ---- the letters М-А-Р-К-О: all five heal and pay ----
{const w=await start('suma');quiet(w);const ls=w.items.filter(i=>i.type==='slovo');ok(ls.length===5,'letters: five letters hide in a pohod');S().p.hp=20;const before=S().bank;
 for(const l of ls){stand(l.x,l.y+40);step(3);}step(200);ok(S().p.letters===31&&S().p.hp===S().p.maxHp,'letters: all five restore Marko');ok(S().bank-before>=40,'letters: and pay 40 ducats');ok(JSON.parse(storage.get('marko-slova')).includes('suma'),'letters: the pohod is marked МАРКО');}
// ---- enchanted maces: thunder jumps from foe to foe ----
{const w=await start('selo');const [e1,e2,e3]=w.enemies.filter(e=>!e.perch);quiet(w,[e1,e2,e3]);const gy=floorAt(w,e1.x).y;for(const [e,dx] of[[e1,0],[e2,90],[e3,170]]){e.x=e1.x+dx;e.y=gy;e.type='sword';e.stun=5;e.hp=e.maxHp=200;}
 stand(e1.x-80,gy);S().p.face=1;S().p.pow={id:'grom',t:20};tap('KeyJ');step(40);ok(e2.hp<200&&e3.hp<200,'powers: the thunder mace strikes the foes behind the first');}
// ---- new blows ----
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch);quiet(w,[e]);const gy=floorAt(w,e.x).y;e.y=gy;e.type='sword';e.stun=5;e.hp=e.maxHp=300;stand(e.x-70,gy);S().p.face=1;
 api.keys.add('KeyW');tap('KeyJ');api.keys.delete('KeyW');step(30);ok(e.vy<0||e.y<gy-20,'blows: W+J throws a janissary into the air');
 step(200);stand(e.x-260,floorAt(w,e.x).y);e.stun=5;S().p.face=1;const hp=e.hp;tap('ShiftLeft');step(10);tap('KeyJ');step(50);ok(e.hp<hp,'blows: Shift then J charges through a foe');}
// ---- traps ----
{const w=await start('selo');quiet(w);const t=w.traps.find(t=>t.kind==='spikes');stand(t.x+t.w/2,t.y);S().p.invuln=0;const hp=S().p.hp;step(3);ok(S().p.hp<hp&&S().p.vy<0,'traps: the stakes hurt and throw Marko up');}
{const w=await start('pecina');quiet(w);const q=w.platforms.find(q=>q.crumble);stand(q.x+q.w/2,q.y);step(30);ok(!q.off,'traps: a crumbling plank holds for a moment');step(60);ok(q.off&&S().p.y>q.y+20,'traps: then it gives way');}
{const w=await start('suma');quiet(w);const t=w.traps.find(t=>t.kind==='log');let hit=false;stand(t.x,t.y);S().p.invuln=0;for(let i=0;i<120*5&&!hit;i++){const hp=S().p.hp;step();if(S().p.hp<hp)hit=true;S().p.x=t.x;if(S().p.y>t.y){S().p.y=t.y;}}ok(hit,'traps: the swinging log knocks Marko down');}
{const w=await start('podrum');quiet(w);const t=w.traps.find(t=>t.kind==='barrels');stand(t.x-500,floorAt(w,t.x-500).y);S().p.invuln=99;step(120*3);ok(t.list.length>0&&t.list.some(b=>b.x<t.x-100),'traps: barrels roll down at Marko');}
{const w=await start('manastir');quiet(w);const t=w.traps.find(t=>t.kind==='timed');stand(t.gate.x-200,t.gate.y);api.keys.add('KeyD');step(120);api.keys.clear();ok(S().p.x<=t.gate.x-33,'traps: the timed gate is shut');
 stand(t.lever.x,t.lever.y);tap('KeyE');step(2);ok(t.open>0,'traps: the lever opens it');api.keys.add('KeyD');for(let i=0;i<120*5&&S().p.x<t.gate.x+80;i++){step();const pl=w.platforms.find(q=>q.pillar&&Math.abs(q.x-S().p.x-40)<30);if(S().p.grounded&&(pl||w.traps.some(o=>o.kind==='spikes'&&o.x-S().p.x<70&&o.x-S().p.x>20)))tap('Space');}api.keys.clear();ok(S().p.x>t.gate.x,'traps: running through before it shuts');}
// ---- the chase: run, and the boulder ends in the ravine ----
{const w=await start('klisura');quiet(w);const t=w.traps.find(t=>t.kind==='boulder');stand(t.x0+100,t.y);S().p.invuln=0;api.keys.add('KeyD');
 for(let i=0;i<120*12&&t.state!=='done';i++){const {p}=S();const ahead=w.platforms.find(q=>q.pillar&&q.x-p.x>10&&q.x-p.x<60)||w.traps.find(o=>o.kind==='spikes'&&o.x-p.x>10&&o.x-p.x<70)||(p.x>t.end-60&&p.x<t.end);if(p.grounded&&ahead)tap('Space');else step();}
 api.keys.clear();ok(t.state==='done'&&S().mode==='play','chase: Marko outruns the boulder and it falls into the ravine');}
// ---- a champion locks the arena until he falls ----
{const w=await start('tvrdjava');const c=w.enemies.find(e=>e.champion);quiet(w,[c]);ok(c&&c.name==='Hasan-aga Oklopnik','champions: the fortress ends with Hasan-aga');
 stand(c.arena.x0+150,c.y);S().p.invuln=99;step(4);S().p.x=c.arena.x0-200;step(2);ok(S().p.x>=c.arena.x0+30,'champions: the arena holds Marko in');
 c.p2=c.p3=true;c.hp=1;c.stun=5;stand(c.x-80,c.y);S().p.face=1;tap('KeyK');step(80);ok(!c.alive,'champions: the aga falls');step(5);S().p.x=c.arena.x1+40;step(2);ok(S().p.x>c.arena.x1,'champions: the arena opens again');
 ok(w.items.some(i=>i.type==='moc'&&i.id===8990),'champions: he leaves an enchanted mace behind');}
// ---- abilities on cooldown and the charge meter ----
{const w=await start('selo');quiet(w);const gy=floorAt(w,2000).y;stand(2000,gy);S().p.energy=100;tap('KeyI');step(220);ok(!S().thrown&&S().p.cd.throw>0,'cooldown: the mace is back but cannot fly again yet');tap('KeyI');step(2);ok(!S().thrown&&!(S().p.throwT>0),'cooldown: a second throw is refused');step(120*2);tap('KeyI');step(40);ok(!!S().thrown,'cooldown: after 2.5 s it flies again');step(300);
 stand(2000,gy);api.keys.add('KeyK');api.pressed.add('KeyK');for(let i=0;i<220;i++)step();ok(S().p.chargeFull&&S().p.chargeLvl===3,'charge: holding K fills three notches');api.keys.clear();step(80);}
// ---- weak points ----
{const w=await start('suma');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'shield',y:gy,hp:200,maxHp:200,face:-1,stun:0,mode:'idle',timer:5});stand(e.x-70,gy);S().p.face=1;tap('KeyJ');step(30);ok(e.hp===200,'shield: a light blow from the front is turned aside');
 step(60);stand(e.x+70,gy);S().p.face=-1;e.face=-1;e.timer=5;tap('KeyJ');step(30);ok(e.hp<200,'shield: from behind it lands');}
{const w=await start('manastir');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'oklopnik',y:gy,hp:600,maxHp:600,armor:3,face:-1});
 for(let i=0;i<3;i++){e.stun=5;stand(e.x-90,gy);S().p.face=1;tap('KeyK');step(130);}ok(e.armor===0,'armour: three heavy blows break it');const hp=e.hp;e.stun=5;stand(e.x-70,gy);S().p.face=1;tap('KeyJ');step(30);ok(e.hp<hp,'armour: then light blows hurt');}
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'akindzija',y:gy,hp:200,maxHp:200,stun:0,mode:'idle',timer:5});stand(e.x-70,gy);S().p.face=1;tap('KeyJ');step(30);ok(e.hp===200,'akindžija: dodges the first light blow');}
{const w=await start('suma');const a=w.enemies.find(e=>e.perch);quiet(w,[a]);stand(a.x-300,floorAt(w,a.x-300)?.y??a.y);S().p.invuln=99;S().p.parry=0;let reflected=false;for(let i=0;i<120*5&&a.alive;i++){const ar=S().arrows.find(x=>x.enemy&&Math.abs(x.x-S().p.x)<90);if(ar&&!reflected){S().p.parry=.3;S().p.face=Math.sign(a.x-S().p.x);reflected=true;}step();}ok(!a.alive,'archer: his own arrow sent back fells him');}
{const w=await start('podrum');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'palikuca',y:gy,hp:300,maxHp:300,mode:'windup',variant:'torch',timer:1,windupDuration:1,stun:0});stand(e.x-80,gy);S().p.face=1;tap('KeyK');step(40);ok(e.burn>0,'palikuća: struck while raising the torch he sets himself alight');}
// ---- puzzles ----
{const w=await start('selo');quiet(w);const t=w.traps.find(t=>t.kind==='plate'),c=w.platforms.find(q=>q.push);stand(t.gate.x-200,t.y);api.keys.add('KeyD');step(120);api.keys.clear();ok(!(t.open>0),'plate: the vault gate is shut');
 stand(c.x-20,t.y);api.keys.add('KeyD');for(let i=0;i<120*8&&!t.pressed;i++)step();api.keys.clear();ok(t.pressed,'plate: Marko pushes the heavy crate onto the plate');
 api.keys.add('KeyD');step(120*2);api.keys.clear();ok(t.pressed&&c.locked&&t.open>0,'plate: the crate settles on the plate and pushing on does not move it off');
 api.keys.add('KeyD');for(let i=0;i<120*4&&S().p.x<t.gate.x-60;i++){step();if(S().p.grounded&&S().p.wallHit)tap('Space');}api.keys.clear();ok(S().p.x>t.gate.x-80,'plate: and reaches the open gate');
 stand(t.gate.x,t.gate.y);step(2);tap('KeyW');step(5);const v=S().p.vault;ok(!!v&&Math.abs(S().p.y-v.y)<2,'vault: W at the open gate leads into the treasury');
 const before=S().bank;for(const b of w.breakables.filter(b=>b.y===v.y)){stand(b.x-60,v.y);S().p.face=1;tap('KeyK');step(90);}step(200);ok(S().bank-before>=30,`vault: its chests and jars pay ${S().bank-before} ducats`);
 stand(v.x0+70,v.y);step(2);tap('KeyW');step(5);ok(!S().p.vault&&Math.abs(S().p.x-t.gate.x)<2&&S().p.y===t.gate.y,'vault: W at its door leads back out to the gate');}
{const w=await start('selo');quiet(w);const q=w.platforms.find(q=>q.kind==='cracked');stand(q.x+q.w/2,q.y-200);S().p.grounded=false;S().p.vy=0;step(2);api.keys.add('KeyS');tap('KeyJ');step(160);api.keys.clear();ok(q.off&&S().p.y>q.y+100,'cellar: a blow from above breaks the cracked slab and Marko drops into the cellar');}
{const w=await start('pecina');quiet(w);const t=w.traps.find(t=>t.bed);stand(t.x+t.w/2,t.y-220);S().p.grounded=false;S().p.vy=0;S().p.invuln=0;const hp=S().p.hp;step(2);api.keys.add('KeyS');tap('KeyJ');let up=false;for(let i=0;i<120*2;i++){step();if(S().p.vy<-400&&!up){up=true;api.keys.delete('KeyS');api.keys.add('KeyD');}}api.keys.clear();ok(up&&S().p.hp===hp&&S().p.x>t.x+t.w,'pogo: a blow from above bounces off the stakes and Marko clears the bed unhurt');}
{const w=await start('klisura');quiet(w);const t=w.traps.find(t=>t.kind==='lift');stand(t.lever.x,t.lever.y);step(5);tap('KeyE');step(3);const q=t.q;stand(q.x+q.w/2,q.y);for(let i=0;i<120*5;i++)step();ok(Math.abs(S().p.y-q.top)<3,`lift: the lever sends Marko ${q.base-q.top}px up the cliff`);}
{const w=await start('mocvara');quiet(w);const q=w.platforms.find(q=>q.kind==='raft');stand(q.x+q.w/2,q.y);step(2);const x0=S().p.x;let far=0;for(let i=0;i<120*6;i++){step();if(S().p.on===q)far=Math.max(far,Math.abs(S().p.x-x0));}ok(far>150&&S().p.y===q.y,`raft: it carries Marko ${Math.round(far)}px over the water`);}
// ---- combos ----
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'sword',y:gy,hp:999,maxHp:999,stun:5});stand(e.x-80,gy);S().p.face=1;
 tap('KeyJ');step(46);tap('KeyJ');step(46);let kind='';for(let i=0;i<40&&kind!=='lomilac';i++){tap('KeyK');kind=S().p.attackKind;}ok(kind==='lomilac','combo: J J K is the Lomilac');step(60);ok(e.vx>0||!e.grounded||e.x>gy,'combo: the Lomilac throws the janissary back');}
// ---- the launcher and the air string ----
async function juggle(id,tresak){const w=await start(id);const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'sword',y:gy,hp:600,maxHp:600,stun:0,mode:'idle',timer:9,face:-1});stand(e.x-70,gy);S().p.face=1;
 api.keys.add('KeyW');tap('KeyJ');api.keys.delete('KeyW');step(30);const lifted=e.vy<0||e.y<gy-10;tap('Space');let follow=S().p.vy<-700;for(let i=0;i<14&&!follow;i++){step();follow=S().p.vy<-700;}let hits=0,hp=e.hp;
 for(let i=0;i<120*2&&!S().p.grounded;i++){if(i%22===2){tap(tresak&&hits>=1?'KeyK':'KeyJ');}step();if(e.hp<hp){hits++;hp=e.hp;}}
 for(let i=0;i<120*2&&!(e.grounded&&!e.air);i++)step();return{e,lifted,follow,hits,slam:600-e.hp};}
{const r=await juggle('selo',false);ok(r.lifted,'launch: W+J lifts a janissary into the air (no skill needed)');ok(r.follow,'launch: Space right after it follows him up');ok(r.hits>=2,`launch: blows land in the air (${r.hits})`);ok(r.slam>=110,`launch: the string ends slamming him into the ground (−${Math.round(r.slam)})`);}
{const r=await juggle('selo',true);ok(r.slam>=130,`tresak: K in the air drives him into the ground (−${Math.round(r.slam)})`);}
{api.start();const w=S().world;const e=w.enemies.find(e=>e.zone===0&&e.type==='sword');for(const o of w.enemies)if(o!==e)o.alive=false;Object.assign(e,{stun:0,mode:'idle',timer:9,hp:300,maxHp:300});stand(e.x-70,e.y);S().p.face=1;S().p.invuln=99;
 api.keys.add('KeyW');tap('KeyJ');api.keys.delete('KeyW');step(45);ok(e.y<580,'launch: in the Kačanik story too the janissary flies');step(240);ok(e.y===590,'launch: and lands back on the road');}
// ---- heart pieces, lore scrolls, treasury keys, cracked walls ----
{let all=true;for(let i=0;i<api.LEVELS.length;i++){await api.startLevel(i,'day');const w=S().world;if(!w.items.some(it=>it.type==='srce')||!w.items.some(it=>it.type==='zapis'))all=false;}ok(all,'relics: every pohod hides a heart piece and a lore scroll');}
{storage.set('marko-srca',JSON.stringify(['klisura','suma','reka']));storage.delete('marko-zapisi');const w=await start('selo');quiet(w);const hp0=S().p.maxHp,h=w.items.find(it=>it.type==='srce');stand(h.x,h.y+44);step(2);
 ok(h.taken&&S().p.maxHp===hp0+20,'heart: the fourth heart piece makes a whole heart (+20 health)');const z=w.items.find(it=>it.type==='zapis');stand(z.x,z.y+44);step(2);ok(JSON.parse(storage.get('marko-zapisi')).includes('selo'),'scroll: a found scroll is kept for the treasury');
 const w2=await start('selo');ok(w2.items.find(it=>it.type==='srce').taken&&S().p.maxHp===hp0+20,'heart: a found piece stays found and the whole heart stays');storage.delete('marko-srca');storage.delete('marko-zapisi');}
{const w=await start('selo');const t=w.traps.find(t=>t.kind==='keydoor'),h=w.enemies.find(e=>e.keyHolder);ok(t&&h&&t.holder===h.id,'key: a keeper carries the treasury key');quiet(w,[h]);
 stand(t.x,t.y);step(2);tap('KeyW');step(3);ok(!S().p.vault&&!(t.open>0),'key: without the key the iron door stays shut');
 h.alive=false;step(2);const k=w.items.find(it=>it.type==='kljuc');ok(k,'key: the fallen keeper drops the key');stand(k.x,k.y+40);step(2);ok(S().p.key,'key: Marko picks it up');
 stand(t.x,t.y);step(2);tap('KeyW');step(3);ok(t.open>0&&S().p.vault,'key: W at the door unlocks it and Marko goes into the treasury');}
{const w=await start('klisura');quiet(w);const b=w.breakables.find(b=>b.kind==='zid');ok(b,'wall: the gorge has a cracked wall across the road');stand(b.x-150,b.y);api.keys.add('KeyD');step(120);api.keys.clear();ok(S().p.x<b.x-b.w/2,'wall: it closes the road');
 stand(b.x-80,b.y);S().p.face=1;const hp=b.hp;for(let i=0;i<3;i++){tap('KeyJ');step(50);}ok(b.hp===hp&&!b.broken,'wall: light blows only ring off it');
 for(let i=0;i<4&&!b.broken;i++){stand(b.x-80,b.y);S().p.face=1;tap('KeyK');step(90);}ok(b.broken,'wall: heavy blows (K) bring it down');}
function openGround(w){return w.platforms.filter(q=>q.ground&&q.w>=760).find(q=>!w.breakables.some(b=>b.x>q.x-40&&b.x<q.x+q.w+40&&Math.abs(b.y-q.y)<5)&&!(w.traps||[]).some(t=>t.x>q.x-60&&t.x<q.x+q.w+60&&Math.abs((t.y??q.y)-q.y)<5));}
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const q=openGround(w);Object.assign(e,{type:'sword',x:q.x+360,y:q.y,hp:600,maxHp:600,stun:0,mode:'idle',timer:9,face:-1,keyHolder:false});stand(q.x+120,q.y);S().p.face=1;
 api.keys.add('KeyD');step(40);tap('KeyS');const slid=S().p.slide>0;let tripped=false;for(let i=0;i<70;i++){step();if(e.hp<600&&e.stun>0)tripped=true;}api.keys.clear();ok(slid,'slide: S while running sends Marko into a slide');ok(tripped,'slide: the slide cuts a janissary off his feet');}
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const q=openGround(w);Object.assign(e,{type:'shield',x:q.x+300,y:q.y,hp:600,maxHp:600,stun:0,mode:'idle',timer:9,face:-1,keyHolder:false});stand(q.x+220,q.y);S().p.face=1;
 api.keys.add('KeyS');tap('KeyJ');step(40);api.keys.clear();step(40);ok(e.guardBroken>0&&e.x>q.x+330,'kick: S+J knocks the shield aside and shoves him back');}
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const q=openGround(w);Object.assign(e,{type:'sword',x:q.x+300,y:q.y,hp:600,maxHp:600,stun:0,mode:'idle',timer:9,face:-1,keyHolder:false});stand(q.x+230,q.y);S().p.face=1;
 api.keys.add('KeyS');tap('KeyK');api.keys.clear();ok(S().p.attackKind==='uvis','uppercut: S+K is the uppercut');let up=false;for(let i=0;i<60;i++){step();if(e.y<q.y-40)up=true;}ok(up,'uppercut: it throws the janissary into the air');}
{const w=await start('selo');quiet(w);const q=w.platforms.find(q=>q.pillar);const {p}=S();stand(q.x-20,q.y+112);p.grounded=false;p.vy=0;p.face=1;p.hang=false;p.ledgeCool=0;step(2);
 ok(p.hang&&p.ledgeT>0,'hang: Marko catches the ledge and hangs');step(60);ok(p.hang&&Math.abs(p.y-(q.y+112))<1,'hang: he stays hanging while nothing is pressed');
 api.keys.add('KeyD');step(120);api.keys.clear();ok(!p.hang&&Math.abs(S().p.y-q.y)<1,'hang: toward the wall he climbs up');
 stand(q.x-20,q.y+112);const p2=S().p;p2.grounded=false;p2.vy=0;p2.face=1;p2.hang=false;p2.ledgeCool=0;step(2);api.keys.add('KeyS');step(30);api.keys.clear();ok(!p2.hang&&!(p2.ledgeT>0)&&p2.y>q.y+112,'hang: S lets go of the ledge');}
// ---- fluid animation: idle, walking crouched / behind the block / while charging, the whirlwind's dizziness, fewer grunts ----
async function flat(){const w=await start('selo');quiet(w);const q=openGround(w);stand(q.x+150,q.y);S().p.face=1;step(30);return q;}
{await flat();const seen=[];let runLen=0,minRun=99,last=-1,firstDone=false;for(let i=0;i<120*4;i++){step();const ps=api.playerPose();if(ps.name!=='marko-idle'&&ps.name!=='marko-idle-2')continue;seen.push(ps.name==='marko-idle-2'?-1:ps.frame);if(ps.frame===last)runLen++;else{if(last>=0&&firstDone)minRun=Math.min(minRun,runLen);if(last>=0)firstDone=true;runLen=1;last=ps.frame;}}
 ok(seen.length>400&&!seen.some(f=>f===2||f===3||f===4),'idle: Marko never shows the frames that jerk his head to the camera');ok(minRun>=18,`idle: each idle frame holds ${(minRun/120).toFixed(2)}s, calm and slow`);}
async function walkWith(keysDown){const q=await flat();const x0=S().p.x;for(const k of keysDown)press(k);api.keys.add('KeyD');let pose=null;for(let i=0;i<120;i++){step();if(i===90)pose=api.playerPose();}api.keys.clear();return{pose,dx:S().p.x-x0};}
{const r=await walkWith(['KeyS']);ok(r.dx>40&&(r.pose.name==='marko-crouch-walk'||(r.pose.name==='marko-crouch'&&r.pose.frame>=2&&r.pose.frame<=3)),`crouch-walk: S+D walks crouched (${Math.round(r.dx)}px)`);}
{const r=await walkWith(['KeyL']);ok(r.dx>30&&(r.pose.name==='marko-block-walk'||(r.pose.name==='marko-block'&&r.pose.dy!==undefined)),`block-walk: L+D steps forward behind the block (${Math.round(r.dx)}px)`);}
{const r=await walkWith(['KeyK']);ok(r.dx>40&&(r.pose.name==='marko-charge-walk'||r.pose.name==='marko-charge-hold'),`charge-walk: holding K Marko still walks while the blow charges (${Math.round(r.dx)}px)`);}
{await flat();const p=S().p;p.rage=100;api.keys.add('KeyF');step(120*1.2);api.keys.clear();step(2);ok(p.dizzy>0,'whirlwind: when it ends Marko is dizzy');const x=p.x;api.keys.add('KeyD');step(60);ok(Math.abs(p.x-x)<12,'whirlwind: dizzy, he cannot walk away');api.keys.clear();
 step(60);ok(p.down>0,'whirlwind: then he falls to the ground');let up=0;while(p.down>0&&up<600){step();up++;}ok(up>100,`whirlwind: and takes ${(up/120).toFixed(1)}s to get up`);}
{await flat();const g0=api.grunts();for(let i=0;i<10;i++){tap('KeyJ');step(35);}ok(api.grunts()-g0<=3,`voice: ten blows in three seconds, only ${api.grunts()-g0} grunts`);}
{await flat();press('KeyA');let turned=false;for(let i=0;i<14;i++){step();if(api.playerPose().name==='marko-turn')turned=true;}api.keys.clear();ok(turned,'turn: changing direction plays the turn');}
{await flat();step(40);press('KeyD');let started=false;for(let i=0;i<14;i++){step();if(api.playerPose().name==='marko-run-start')started=true;}api.keys.clear();ok(started,'run-start: the first step out of standing has its own clip');}
{const q=await flat();const p=S().p;p.y=q.y-160;p.grounded=false;p.vy=0;let landed=false;for(let i=0;i<120;i++){step();if(api.playerPose().name==='marko-land')landed=true;}ok(landed,'land: Marko lands with the landing clip');}
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const q=openGround(w);Object.assign(e,{type:'shield',x:q.x+300,y:q.y,hp:600,maxHp:600,stun:0,mode:'idle',timer:9,face:-1,keyHolder:false});stand(q.x+220,q.y);S().p.face=1;
 api.keys.add('KeyS');tap('KeyJ');let seen=false;for(let i=0;i<50;i++){step();if(e.react==='shield-guardbreak'&&e.reactT>0)seen=true;}api.keys.clear();ok(seen,'reaction: a kicked shield-bearer reels with his guard broken');
 Object.assign(e,{type:'oklopnik',armor:1,armorPrev:1,react:null,reactT:0,guardBroken:0,gbPrev:0});step(2);e.armor=0;step(2);ok(e.react==='oklopnik-armorbreak','reaction: the oklopnik staggers when his armour cracks');}
// ---- tents: Ottomans come out of them; blows tear them down ----
{const w=await start('oranje');quiet(w);const t=w.traps.find(t=>t.kind==='tent');ok(t,'tent: the plowed fields have a Turkish tent');stand(t.x-380,t.y);S().p.invuln=999;let came=0;for(let i=0;i<120*8;i++){step();S().p.hp=S().p.maxHp;const out=w.enemies.filter(e=>e.fromTent&&e.alive);if(out.length){came+=out.length;for(const e of out)e.alive=false;}}
 ok(came>=3&&t.wave===3,`tent: Ottomans come out of it in waves (${came} in ${t.wave} waves)`);const before=w.enemies.length;
 const w2=await start('oranje');quiet(w2);const t2=w2.traps.find(t=>t.kind==='tent');for(let i=0;i<8&&!t2.down;i++){stand(t2.x-90,t2.y);S().p.face=1;S().p.invuln=999;tap('KeyK');step(90);for(const e of w2.enemies)if(e.fromTent)e.alive=false;}ok(t2.down,'tent: heavy blows tear it down');
 const n=w2.enemies.length;stand(t2.x-380,t2.y);step(120*5);ok(w2.enemies.length===n,'tent: a fallen tent sends out no one');}
// ---- puzzles: the low wall, kicking foes onto the stakes; pacing of the rooms ----
{const w=await start('pecina');quiet(w);const q=w.platforms.find(q=>q.lintel);ok(q,'low wall: the cave has a wall with a crawl gap');const gy=q.y+q.h+72;
 stand(q.x-120,gy);api.keys.add('KeyD');step(120*2);api.keys.clear();ok(S().p.x<q.x,'low wall: standing up, Marko cannot pass');
 stand(q.x-120,gy);api.keys.add('KeyS');step(20);api.keys.add('KeyD');step(120*4);api.keys.clear();step(30);ok(S().p.x>q.x+q.w,'low wall: crouched, he crawls through');
 stand(q.x-260,gy);api.keys.add('KeyD');step(40);tap('KeyS');step(120*4);api.keys.clear();step(30);ok(S().p.x>q.x+q.w&&!(S().p.y<gy-2),'low wall: a slide carries him under it');}
{const w=await start('selo');const t=w.traps.find(t=>t.kind==='spikes'&&!t.bed);const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);Object.assign(e,{type:'sword',x:t.x-45,y:t.y,hp:600,maxHp:600,stun:0,mode:'idle',timer:9,face:-1,keyHolder:false,grounded:true});
 stand(t.x-125,t.y);S().p.face=1;api.keys.add('KeyS');tap('KeyJ');api.keys.clear();let hit=false;for(let i=0;i<120;i++){step();if(e.hp<=600-60)hit=true;}ok(hit,'stakes: a kicked janissary lands on the stakes and bleeds');}
{const R=physics.RECIPES,haz=new Set(['spikes','crumble','logs','rocks','barrels','lever','chase','spikebed','greda','zid','sator','top','ivice','strelnice','krunjenje']),rest=new Set(['flat','crates','cellar','kljuc','plate','arena','watch','ledges','zvona','ogledala','teg','kolo','barut','svatovi','guslar','gnezdo','bedem','jaruga','predah','straza','tajna']);let worst='';
 for(const [land,rec] of Object.entries(R)){const rooms=rec.split(' ').map(r=>r.split(':')[0]);let run=0,since=0;for(const r of rooms){run=haz.has(r)?run+1:0;since=rest.has(r)?0:since+1;if(run>2)worst+=`${land}: three hazards in a row; `;if(since>5)worst+=`${land}: six rooms without rest; `;}}
 ok(!worst,'pacing: never three hazards in a row, a rest or reward at least every six rooms'+(worst?' — '+worst:''));}
// ---- polish: landings and labels ----
{const q=await flat();const p=S().p;p.y=q.y-40;p.grounded=false;p.vy=0;let soft=0;for(let i=0;i<60;i++){step();soft=Math.max(soft,api.shakeNow());}
 step(120);p.y=q.y-520;p.grounded=false;p.vy=0;let hard=0;for(let i=0;i<120;i++){step();hard=Math.max(hard,api.shakeNow());}ok(soft===0&&hard>0,'landing: a hop lands softly, a long drop shakes the ground');}
{const a=api.placeLabel(500,300,120,12),b=api.placeLabel(510,300,100,12),c=api.placeLabel(900,300,100,12);ok(a===300&&b<=300-17&&c===300,'labels: two labels in one spot stack instead of overlapping');}
{await flat();let calm=true,bad='';for(const type of Object.keys(api.FOE_IDLE)){let last=-1,run=0,first=true;for(let i=0;i<120*4;i++){step();const f=api.idleFrame(type,0);if(f===last){run++;continue;}if(last>=0&&!first&&run<22){calm=false;bad=type;}if(last>=0)first=false;last=f;run=1;}}ok(calm,'foe idles: every foe breathes slowly, no frame flicks by in under 0.18s'+(bad?' ('+bad+')':''));}
// ---- DOPUNA-8: walk, braking, rise and fall, the longer rest, a blow on the block, the roll after a high fall ----
{const seen=n=>{let x=false;return{see(){if(api.playerPose().name===n)x=true;},get v(){return x;}};};
 {await flat();step(200);const p=S().p;p.vx=120;p.grounded=true;ok(api.playerPose().name==='marko-walk','walk: below running speed Marko walks');p.vx=0;}
 {await flat();press('KeyD');step(60);api.keys.clear();const s=seen('marko-run-stop');for(let i=0;i<30;i++){step();s.see();}ok(s.v,'run-stop: letting go at full run, he brakes');}
 {const q=await flat();step(60);press('Space');const r=seen('marko-jump-rise'),f=seen('marko-fall');for(let i=0;i<160;i++){step();r.see();f.see();}api.keys.clear();ok(r.v,'jump-rise: the takeoff has its own clip');ok(f.v,'fall: coming down he falls with the fall clip');}
 {await flat();const s=seen('marko-idle-3');for(let i=0;i<120*12;i++){step();s.see();}ok(s.v,'idle-3: after a long rest the mace goes on his shoulder');}
 {const q=await flat();const p=S().p;p.y=q.y-700;p.grounded=false;p.vy=0;const s=seen('marko-roll-land');for(let i=0;i<240;i++){step();s.see();}ok(s.v,'roll-land: a high fall ends in a roll');}
 {await flat();const p=S().p;p.blocking=true;p.blockTime=1;p.hurt=.15;const n=api.playerPose().name;p.blocking=false;p.hurt=0;ok(n==='marko-block-hit','block-hit: a blow on the block has its own clip');}
}
// ---- moves after The Lost Crown: the falcon's wing, the dash in the air, the fairy's trace, firm ground after the abyss ----
{const rise=async twice=>{const q=await flat();const p=S().p;tap('Space');let top=p.y,used=false;
  for(let i=0;i<300;i++){if(twice&&!used&&p.vy>0){tap('Space');used=true;continue;}step();top=Math.min(top,p.y);if(p.grounded)break;}return q.y-top;};
 const one=await rise(false),two=await rise(true);
 ok(two>one*1.8,`sokolovo krilo: Space in the air jumps once more, almost as high again (${Math.round(one)}px → ${Math.round(two)}px)`);}
{await flat();const p=S().p;tap('Space');step(30);tap('Space');ok(p.kriloUsed&&p.vy<-400,'sokolovo krilo: the second Space lifts Marko again');
 for(let i=0;i<120&&p.vy<=0;i++)step();tap('Space');ok(p.vy>0,'sokolovo krilo: only once a flight, a third Space does nothing');
 let n=0;for(;n<300&&!p.grounded;n++)step();step(40);
 ok(n>20&&p.grounded&&p.vy===0,`jump buffer: a Space pressed ${n} steps before landing is forgotten, Marko does not jump again on landing`);
 ok(!p.kriloUsed,'sokolovo krilo: the ground gives the wing back');
 tap('Space');step(30);tap('Space');ok(p.kriloUsed&&p.vy<-400,'sokolovo krilo: and the next flight has it again');api.keys.clear();step(200);}
{const w=await start('manastir');quiet(w);const a=w.platforms.find(q=>q.hang&&!q.bedem),b=w.platforms.filter(q=>q.solid&&q.x>a.x+a.w&&q.x-(a.x+a.w)<200).sort((u,v)=>u.x-v.x)[0];
 const gy=floorAt(w,a.x+a.w+20).y;stand(a.x+a.w+(b.x-a.x-a.w)/2,gy);const p=S().p;p.face=1;tap('Space');step(24);tap('Space');step(4);tap('ShiftLeft');const used=p.kriloUsed&&p.naletUsed;
 api.keys.add('KeyD');let clung=false;for(let i=0;i<180&&!clung;i++){step();clung=!!p.wall;}step();
 ok(used&&clung&&!p.kriloUsed&&!p.naletUsed,'sokolovo krilo, juriš: catching a wall gives back the wing and the dash');api.keys.clear();step(120);}
{await flat();const p=S().p;tap('Space');step(26);const x0=p.x,y0=p.y;tap('ShiftLeft');ok(p.airDash&&p.dash>0,'juriš u vazduhu: Shift in the air dashes');
 p.invuln=0;const hp=p.hp;api.damage(30,-1);const hurt=p.hp<hp;let drop=0;for(let i=0;i<60&&p.dash>0;i++){step();drop=Math.max(drop,Math.abs(p.y-y0));}
 ok(p.x-x0>150&&drop<3,`juriš u vazduhu: ${Math.round(p.x-x0)}px straight ahead without falling (${drop.toFixed(1)}px)`);
 ok(!hurt,'juriš u vazduhu: nothing hurts Marko while he dashes');
 ok(api.playerPose().name!=='marko-roll','juriš u vazduhu: it is no roll in the air');
 tap('ShiftLeft');ok(!(p.dash>0),'juriš u vazduhu: only once a flight');
 for(let i=0;i<300&&!p.grounded;i++)step();step(10);ok(!p.naletUsed,'juriš u vazduhu: the ground gives it back');
 step(120);tap('ShiftLeft');ok(p.dash>0&&!p.airDash&&p.grounded,'kolut: on the ground Shift still rolls as before');step(120);
 tap('Space');step(26);tap('ShiftLeft');step(4);tap('KeyJ');ok(p.attackKind==='juris'&&p.attack>0,'juriš u vazduhu: Shift then J charges out of the dash');step(200);}
{await flat();const p=S().p,x0=p.x,y0=p.y;tap('KeyV');ok(p.trag&&Math.abs(p.trag.x-x0)<1&&Math.abs(p.trag.y-y0)<1,'vilin trag: V leaves the mark where Marko stands');
 press('KeyD');step(150);release('KeyD');p.invuln=0;api.damage(12,-1);step(60);const hp=p.hp,away=p.x-x0;
 tap('KeyJ');step(4);const swinging=p.attack>0;tap('KeyV');step(3);
 ok(away>200&&swinging&&Math.abs(p.x-x0)<2&&Math.abs(p.y-y0)<3,`vilin trag: V again, even mid-blow ${Math.round(away)}px away, brings Marko back to the mark`);
 ok(p.hp===hp&&hp<p.maxHp,'vilin trag: only the place comes back, not the health');
 ok(!p.trag&&p.cd.trag>0,'vilin trag: then it rests');tap('KeyV');ok(!p.trag,'vilin trag: while it rests, V leaves no new mark');
 step(Math.ceil(120*api.TRAG_CD)+2);tap('KeyV');ok(p.trag,'vilin trag: rested, it can be left again');
 step(Math.ceil(120*api.TRAG_LIFE)+2);ok(!p.trag,'vilin trag: a mark left unused fades after eight seconds');}
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const q=openGround(w);stand(q.x+160,q.y);const p=S().p;p.face=1;p.invuln=0;
 Object.assign(e,{type:'sword',x:q.x+420,y:q.y,hp:600,maxHp:600,stun:0,mode:'idle',timer:0,face:-1,keyHolder:false,grounded:true});tap('KeyV');
 press('KeyD');let close=false;for(let i=0;i<240&&!close;i++){step();close=Math.abs(e.x-p.x)<120;}release('KeyD');tap('KeyV');step(2);
 ok(close&&Math.abs(p.x-(q.x+160))<2,'vilin trag: in the thick of a fight it pulls Marko out of the foe\'s reach');}
{const q=await flat();const p=S().p;step(10);const hp=p.hp,x=p.x;p.invuln=0;p.y=(S().world.pitY||850)+5;p.grounded=false;step();
 ok(p.hp<hp&&Math.abs(p.x-x)<1,'sigurno tlo: the abyss costs health and Marko comes back where he last stood (as before)');step(120);}
{const id=api.LEVELS.map(L=>L.id).find(id=>(physics.RECIPES[id]||'').split(' ').includes('crumble'));const w=await start(id);quiet(w);
 const c=w.platforms.filter(q=>q.crumble&&!q.bridge).sort((a,b)=>a.x-b.x)[0],g=floorAt(w,c.x-60);stand(c.x-60,g.y);const p=S().p;step(10);const safe=S().lastSafe;
 stand(c.x+c.w/2,c.y);p.invuln=0;let fell=false;for(let i=0;i<120*4&&!fell;i++){step();fell=p.y<c.y-100;}step(240);
 ok(Math.abs(safe-(c.x-60))<2&&fell&&p.grounded&&!p.on?.crumble&&p.x<c.x,`sigurno tlo (${id}): a plank that gave way is not firm ground; Ravijojla sets Marko down before it`);}
// none of the three waits for a pohod: in the first pohod, with no skill learned, they work while the ground roll still waits
{storage.set('marko-skills','[]');await flat();const p=S().p;const locked=!api.has('kolut');tap('ShiftLeft');const rolled=p.dash>0;step(120);
 tap('Space');step(26);tap('Space');const winged=p.kriloUsed;step(6);tap('ShiftLeft');const dashed=p.airDash;step(200);tap('KeyV');const traced=!!p.trag;step(200);
 ok(locked&&!rolled&&winged&&dashed&&traced,'first pohod: the wing, the dash in the air and the fairy\'s trace are known from the start; the roll still waits for its pohod');
 storage.set('marko-skills',JSON.stringify(api.SKILLS.map(k=>k.id)));}
// the gamepad, read by the game's own pollPads with a pad held in the hand: ↓ + RT leaves the fairy's trace, RT alone is still the fairy
{const grab=name=>{const i=source.indexOf(name);let d=0,j=source.indexOf('{',i);for(;j<source.length;j++){if(source[j]==='{')d++;else if(source[j]==='}'&&--d===0)break;}return source.slice(i,j+1);};
 const buttons=Array.from({length:17},()=>({pressed:false,value:0})),pad={index:0,id:'test pad',buttons,axes:[0,0,0,0]},keys=new Set(),pressed=new Set();
 const poll=new Function('navigator','$','keys','pressed',`let hasDom=true,mode='play',padIndex=0,stickMag=1,padPrev={},padNav={};const padRest=new Set(),padHeld=new Set(),markPad=()=>{},padConnected=()=>{},pause=()=>{},padMenu=()=>{};${source.match(/const PAD_MAP=\{[^}]*\};/)[0]}${grab('function padSet(')}${grab('function pollPads(')}return pollPads;`)({getGamepads:()=>[pad]},()=>null,keys,pressed);
 const hold=(i,on)=>{buttons[i].pressed=on;buttons[i].value=on?1:0;poll();},fresh=()=>pressed.clear();
 hold(13,true);hold(7,true);ok(pressed.has('KeyV')&&!pressed.has('KeyE'),'gamepad: ↓ + RT leaves the fairy\'s trace and does not call the fairy');
 hold(7,false);hold(13,false);fresh();hold(7,true);ok(pressed.has('KeyE')&&!keys.has('KeyV'),'gamepad: RT alone still calls the fairy');
 hold(7,false);fresh();hold(0,true);ok(pressed.has('Space'),'gamepad: A jumps, in the air the falcon\'s wing');hold(0,false);fresh();hold(1,true);ok(pressed.has('ShiftLeft'),'gamepad: B rolls, in the air the dash');hold(1,false);}
// ---- two roads: every pohod forks somewhere; over the rampart or through its gallery, over the rotten bridge or along the ravine ----
{for(const L of api.LEVELS){if(L.id==='san'||L.izazov)continue;const w=await start(L.id);ok(w.platforms.some(q=>q.bedem||q.jaruga),`fork: ${L.id} has a place where the road forks`);}
 const w=await start('selo');quiet(w);const b=w.platforms.find(q=>q.bedem),lad=w.ladders.find(l=>Math.abs(l.x-(b.x-22))<3),gy=lad.bottom;
 stand(b.x-120,gy);press('KeyD');for(let i=0;i<120*12&&S().p.x<b.x+b.w+60;i++)step();release('KeyD');ok(S().p.x>=b.x+b.w+60&&Math.abs(S().p.y-gy)<3,'rampart: the low road goes through the gallery under the wall');
 stand(lad.x,gy);press('KeyW');for(let i=0;i<120*6&&(S().p.y>b.y+1||S().p.climb);i++)step();release('KeyW');ok(Math.abs(S().p.y-b.y)<3&&S().p.x>b.x,'rampart: the ladder leads up onto the wall');
 press('KeyD');for(let i=0;i<120*14&&S().p.x<b.x+b.w+60;i++)step();for(let i=0;i<240&&!S().p.grounded;i++)step();release('KeyD');ok(S().p.x>b.x+b.w&&Math.abs(S().p.y-gy)<3,'rampart: the high road runs the length of the wall and comes down at its far end');
 const j=w.platforms.find(q=>q.jaruga),planks=w.platforms.filter(q=>q.kind==='plank'&&q.bridge&&q.y===j.y&&q.x>=j.x&&q.x<j.x+800),out=w.ladders.filter(l=>l.top===j.y&&l.x>j.x&&l.x<j.x+800).sort((u,v)=>v.x-u.x)[0],floor=out.bottom;
 ok(planks.length===5&&planks.filter(q=>q.crumble).length===2&&floor<=800,'ravine: five planks, two of them rotten, and a bottom the camera can reach');
 stand(planks[1].x+planks[1].w/2,j.y);for(let i=0;i<120*5&&S().p.y<floor-2;i++)step();ok(Math.abs(S().p.y-floor)<3&&S().mode==='play','ravine: a rotten plank drops Marko to the bottom, not into a pit');
 press('KeyD');for(let i=0;i<120*8&&S().p.x<out.x-6;i++)step();release('KeyD');press('KeyW');for(let i=0;i<120*6&&(S().p.y>j.y+1||S().p.climb);i++)step();release('KeyW');
 ok(Math.abs(S().p.y-j.y)<3&&S().p.x>out.x,'ravine: the ladder on the far side leads back up to the road');}
// ---- The Lost Crown, second set (?go=moci): flags, slide, wall run, air combo, chain, eye, charms, springs, marks, heroic blows ----
{const V=()=>{api.startVezbaliste();api.keys.clear();api.pressed.clear();return S().world;};
 const fresh=()=>{storage.delete('marko-amajlije');storage.delete('marko-udari');api.resetMoci2();};
 const foe=(x,type='sword',y=590)=>{const hp=type==='shield'?125:type==='oklopnik'?240:90,w=S().world;const e={id:70000+w.enemies.length,x,y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type,zone:S().zone,face:-1,mode:'idle',timer:99,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:true};w.enemies.push(e);return e;};
 fresh();
 // the flags: open everywhere but in the greybox, where the gate powers wait for their shrine
 {V();const ids=Object.keys(api.MOCI2);ok(['klizanje','zidotrk','kombo','lanac','oko','amajlije','putovanje','oznake','potres','gaz'].every(id=>ids.includes(id)),'lost crown II: every new power has its flag ('+ids.join(', ')+')');
  ok(ids.every(id=>api.moc2(id)),'lost crown II: outside the greybox Marko has every one from the start');
  const keep=S().level,w=S().world;api.setLevel({greybox:true});w.gb={moci:{krilo:true}};const shut=ids.filter(id=>!api.moc2(id)).join(' ');w.gb.moci.lanac=true;const lanacOpen=api.moc2('lanac');w.gb.moci.amajlije=false;const amShut=!api.moc2('amajlije');api.setLevel(keep);delete w.gb;
  ok(shut==='klizanje zidotrk kombo lanac oko'&&lanacOpen&&amShut,'lost crown II: a greybox level keeps the five gate powers shut until world.gb.moci[id] is set; springs, charms, marks and blows stay open unless it sets them false');}
 // Klizanje: under the low wall and under a blow
 {V();quiet(S().world);stand(300,590);press('KeyD');step(150);const blocked=S().p.x;release('KeyD');
  stand(390,590);S().p.invuln=0;press('KeyD');step(20);press('KeyS');step(2);tap('ShiftLeft');const sliding=S().p.slide>0,hp=S().p.hp;api.damage(30,-1);const dodged=S().p.hp===hp;step(100);release('KeyS');step(20);release('KeyD');
  ok(blocked<520&&sliding&&S().p.x>660,`klizanje: on foot Marko stops at the low wall (${Math.round(blocked)}); S + Shift in a run slides him under it to ${Math.round(S().p.x)}`);
  ok(dodged,'klizanje: a blow during the slide passes over him');}
 // Trk po zidu: across an abyss no jump, dash and wing cross
 {V();quiet(S().world);stand(700,590);press('KeyD');let jumped=false,off=false,ranY=[],wingBack=false;
  for(let i=0;i<500;i++){const P=S().p;if(!jumped&&P.x>975){tap('Space');jumped=true;continue;}if(P.zidotrk){ranY.push(P.y);if(P.zidotrk.t<.12&&!off){wingBack=!P.kriloUsed;tap('Space');off=true;continue;}}step();if(jumped&&i>40&&S().p.grounded)break;}
  release('KeyD');const P=S().p,first=ranY.slice(0,40),hold=Math.max(...first)-Math.min(...first);
  ok(ranY.length>60&&hold<3&&off&&P.grounded&&P.x>1640&&P.y===590&&P.hp===P.maxHp,`trk po zidu: Marko runs ${ranY.length} steps along the runed wall (height held within ${hold.toFixed(1)}px), jumps off with Space and lands across the 640px abyss at ${Math.round(P.x)}`);
  ok(wingBack,'trk po zidu: the wall gives the falcon\'s wing back, like any wall');
  V();quiet(S().world);S().world.zidovi=[];stand(700,590);S().p.invuln=0;press('KeyD');jumped=false;let used=false;
  for(let i=0;i<600;i++){const P=S().p;if(!jumped&&P.x>975){tap('Space');jumped=true;continue;}if(jumped&&!used&&!P.grounded&&P.vy>-100){tap('ShiftLeft');step(26);tap('Space');used=true;continue;}step();if(jumped&&i>40&&S().p.grounded)break;}release('KeyD');
  ok(S().p.x<1000&&S().p.hp<S().p.maxHp,`trk po zidu: without the runed wall the same jump with the dash and the wing falls short (back on firm ground at ${Math.round(S().p.x)}, hurt)`);}
 // Vazdušni kombo: W + K throws the foe up, Space follows, J J keeps him up, the third blow nails him down onto his mate
 {V();quiet(S().world);stand(2500,590);S().p.face=1;S().p.invuln=99;const e=foe(2580),mate=foe(2680);e.hp=e.maxHp=400;
  press('KeyW');tap('KeyK');release('KeyW');let t=0;while(!(e.lansiran>0)&&t++<60)step();const launched=e.vy<-600&&e.lansiran>0;
  step(12);tap('Space');step(3);const leap=S().p.vy<-650;let holds=0,spiked=false,top=590,lastHp=e.hp;
  for(let i=0;i<240&&!spiked;i++){if(i%22===8){tap('KeyJ');step(2);if(e.hp<lastHp&&!e.spiked&&e.vy<=-255&&!e.grounded)holds++;lastHp=e.hp;}else step();top=Math.min(top,e.y);if(e.spiked)spiked=true;}
  step(120);
  ok(launched&&leap,'vazdušni kombo: W + K throws the foe up, Space right after leaps after him');
  ok(holds>=2&&spiked&&top<440,`vazdušni kombo: J J pushes him up again (${holds} times, ${590-Math.round(top)}px over the ground) and the third blow nails him down`);
  ok(mate.hp<mate.maxHp,'vazdušni kombo: where he is nailed the ground shakes his mate');}
 // Ravijojlin lanac: to the hook, a light foe to Marko, the shield out of a hand, Marko to a heavy foe
 {V();quiet(S().world);stand(1780,590);S().p.face=1;press('KeyD');ok(api.lanacTarget()?.kind==='kuka','lanac: the silver hook above is the chain\'s mark');tap('KeyC');step(150);release('KeyD');step(30);
  ok(S().p.grounded&&S().p.y===200&&S().p.x>1950,`lanac: C pulls Marko to the hook and onto the plank 390px up (${Math.round(S().p.x)}, ${S().p.y})`);
  stand(2500,590);S().p.face=1;const e=foe(2800);tap('KeyC');step(60);ok(Math.abs(e.x-S().p.x)<130&&e.stun>0,`lanac: a light foe 300px off is pulled to Marko (${Math.round(Math.abs(e.x-S().p.x))}px) and stunned`);
  tap('KeyC');ok(!S().p.lanac,'lanac: it rests a moment before it flies again');
  step(120);quiet(S().world);stand(2500,590);S().p.face=1;const s=foe(2800,'shield');tap('KeyC');step(60);ok(s.guardBroken>0,'lanac: the shield is torn out of its bearer\'s hand');
  step(120);quiet(S().world);stand(2500,590);S().p.face=1;const o=foe(2850,'oklopnik');tap('KeyC');step(90);ok(S().p.x>2720&&Math.abs(S().p.x-o.x)<110,`lanac: an armoured foe is too heavy, the chain takes Marko ${Math.round(S().p.x-2500)}px to him`);}
 // Vilinsko oko: hidden stairs, a wall that is only a trick
 {V();quiet(S().world);fresh();const w=S().world,hid=w.platforms.filter(q=>q.oko),ilu=w.platforms.find(q=>q.iluzija);stand(2150,590);step(2);ok(hid.length===3&&hid.every(q=>q.off),'vilinsko oko: the hidden stair is not there for a closed eye');
  press('KeyO');step(3);ok(hid.every(q=>!q.off)&&S().p.oko,'vilinsko oko: holding O opens Ravijojla\'s eye and the stair holds');
  press('KeyD');let top=590;for(let i=0;i<360;i++){const P=S().p;if(P.grounded&&P.x<2700&&(P.x>2205||P.on?.oko))tap('Space');else step();top=Math.min(top,S().p.grounded?S().p.y:top);if(P.grounded&&P.y===290&&P.x>2700)break;}
  release('KeyD');step(30);ok(top===290&&api.amState().have.includes('vranino-pero'),`vilinsko oko: up the hidden stair to the plank at 290 and the charm left there (${api.amState().have.join(', ')})`);
  release('KeyO');step(60);ok(hid.every(q=>q.off)&&!S().p.oko,'vilinsko oko: the eye closed, the stair is gone');
  stand(2300,590);step(600);press('KeyO');let open=0;for(let i=0;i<Math.ceil(api.OKO_MAX*120)+240;i++){step();if(S().p.oko)open++;}ok(!S().p.oko&&Math.abs(open/120-api.OKO_MAX)<.05,`vilinsko oko: it tires after ${(open/120).toFixed(2)} s and stays shut while O is still held`);release('KeyO');
  stand(2900,590);press('KeyD');step(150);release('KeyD');ok(S().p.x>ilu.x+ilu.w&&ilu.off,'vilinsko oko: the wall before the second spring is only a trick; Marko walks through it');}
 // Ravijojlini izvori: finding one, resting, travelling, never with a foe close
 {V();quiet(S().world);fresh();const w=S().world;stand(700,590);step(2);const before=w.izvori[0].found;stand(260,590);step(2);ok(!before&&w.izvori[0].found,'izvori: walking by the spring finds it');
  S().p.hp=20;S().p.wine=0;tap('KeyE');ok(S().mode==='izvor'&&S().p.hp===S().p.maxHp&&S().p.wine>=3,'izvori: E at the spring: rest, health and wine are full');
  api.closeIzvor();ok(S().mode==='play'&&!api.putuj('v2'),'brzo putovanje: a spring not found yet cannot be reached');
  stand(3120,590);step(2);tap('KeyE');ok(w.izvori[1].found&&S().mode==='izvor','izvori: the spring behind the trick wall is found and rested at');
  api.putuj('v1');ok(S().mode==='play'&&Math.abs(S().p.x-230)<1,'brzo putovanje: from the second spring straight to the first');
  foe(420);tap('KeyE');ok(S().mode==='play','izvori: no rest with a foe close by');}
 // Amajlije: found, changed only at a spring, three places (five with the girdles), and what they do
 {V();quiet(S().world);fresh();stand(2100,200);step(4);const got=api.amState().have.includes('gvozdeni-prsten');
  ok(got&&!api.amToggle('gvozdeni-prsten')&&!api.am('gvozdeni-prsten'),'amajlije: the charm on the high plank is found, but is not put on away from a spring');
  stand(230,590);step(2);tap('KeyL');step();const plain=S().p.parry;step(120);tap('KeyE');api.amToggle('gvozdeni-prsten');api.closeIzvor();step(90);tap('KeyL');step();
  ok(api.am('gvozdeni-prsten')&&S().p.parry>plain*1.5,`amajlije: at the spring the iron ring goes on, and the parry window is longer (${plain.toFixed(2)} → ${S().p.parry.toFixed(2)} s)`);
  storage.set('marko-amajlije',JSON.stringify({have:api.AMAJLIJE.map(a=>a.id),on:[],slots:3}));api.resetMoci2();V();quiet(S().world);stand(230,590);step(2);tap('KeyE');const hp0=S().p.maxHp;
  const a=api.amToggle('kamen-srcanik'),b=api.amToggle('sokolova-kandza'),c=api.amToggle('vilin-pramen');
  ok(api.AMAJLIJE.length>=10&&a&&!b&&c&&S().p.maxHp===hp0+30,`amajlije: ${api.AMAJLIJE.length} charms; three places hold the heart stone (two) and one more, not two big ones; the heart stone gives +30 health`);
  api.closeIzvor();step(2);tap('KeyV');ok(S().p.trag?.left===14,'amajlije: Vilin pramen keeps the fairy\'s trace 14 seconds');tap('KeyV');
  api.setBank(500);const shop=api.ducanList().map(d=>d.id);ok(shop.includes('pojas'),'amajlije: the merchant sells Ravijojla\'s girdle');api.buyDucan('pojas');
  stand(230,590);step(2);tap('KeyE');api.amToggle('vilin-pramen');const d=api.amToggle('sokolova-kandza');api.closeIzvor();
  ok(api.amState().slots===4&&d,'amajlije: with the girdle there are four places, and the falcon\'s claw fits beside the heart stone');
  stand(600,590);step(2);tap('Space');step(30);tap('ShiftLeft');step(30);tap('ShiftLeft');ok(S().p.airDash&&S().p.naletN===2,'amajlije: the falcon\'s claw gives two dashes in one flight');step(120);
  storage.set('marko-amajlije',JSON.stringify({have:api.AMAJLIJE.map(a=>a.id),on:[],slots:3}));api.resetMoci2();
  const kill=async on=>{if(on){storage.set('marko-amajlije',JSON.stringify({have:api.AMAJLIJE.map(a=>a.id),on:['hajducka-kesa'],slots:3}));api.resetMoci2();}const w=await start('selo');quiet(w);const e=w.enemies.find(e=>!e.champion&&!e.elite);e.alive=true;e.hp=1;stand(e.x-60,e.y);S().p.face=1;const n=S().bank;tap('KeyJ');step(20);for(const c of S().coins){c.x=S().p.x;c.y=S().p.y-30;}step(240);return e.alive?-99:S().bank-n;};
  const plainC=await kill(false),kesa=await kill(true);ok(kesa===plainC+2,`amajlije: the outlaw's purse adds 2 ducats to each fallen foe (${plainC} → ${kesa})`);
  fresh();}
 // Oznake i mapa
 {V();quiet(S().world);const w=S().world;stand(700,590);tap('KeyB');const one=w.oznake.length;tap('KeyB');ok(one===1&&w.oznake.length===0,'oznake: B leaves a mark on the map, B by it takes it off');
  for(const x of[100,300,500,700,900,1700,1900,2500,2700]){stand(x,590);step();tap('KeyB');}ok(w.oznake.length===8,'oznake: eight marks at most');
  tap('KeyM');ok(S().mode==='karta','mapa: M opens the map');api.closeKarta();ok(S().mode==='play'&&w.istr.size>=6,`mapa: closed again; ${w.istr.size} map cells explored so far`);}
 // Junački udari: two of four, on F and R
 {V();quiet(S().world);fresh();ok(api.udari().join()==='vihor,super'&&api.UK('vihor')==='KeyF'&&api.UK('super')==='KeyR','junački udari: Vihor on F and the heroic blow on R, as before');
  api.izaberiUdar('potres');ok(api.udari().join()==='potres,super'&&api.UK('vihor')==='-','junački udari: Potres takes F in Vihor\'s place');
  stand(2800,590);S().p.face=1;S().p.invuln=99;S().p.rage=100;const a=foe(3060),b=foe(2540);tap('KeyF');step(80);
  ok(a.hp<a.maxHp&&b.hp<b.maxHp&&S().p.rage===50&&!(S().p.spin>0),`potres: F drives the mace into the ground, the wave hits foes on both sides 260px off; 50 rage spent`);
  api.izaberiUdar('gaz');ok(api.udari().join()==='potres,gaz','junački udari: Šarčev gaz takes R');
  quiet(S().world);step(60);stand(2500,590);S().p.face=1;S().p.invuln=99;S().p.rage=100;const row=[2650,2760,2870].map(x=>foe(x));tap('KeyR');step(220);
  ok(row.every(e=>e.hp<e.maxHp)&&S().p.rage===0&&!S().gaz,'šarčev gaz: R calls Šarac, he tramples the whole row and is gone; all rage spent');
  api.izaberiUdar('potres');ok(api.udari().join()==='gaz,potres','junački udari: picking one already carried swaps F and R');fresh();}
}
// the gamepad and the touch screen for the second set
{const grab=name=>{const i=source.indexOf(name);let d=0,j=source.indexOf('{',i);for(;j<source.length;j++){if(source[j]==='{')d++;else if(source[j]==='}'&&--d===0)break;}return source.slice(i,j+1);};
 const buttons=Array.from({length:17},()=>({pressed:false,value:0})),pad={index:0,id:'test pad',buttons,axes:[0,0,0,0]},keys=new Set(),pressed=new Set();
 const poll=new Function('navigator','$','keys','pressed',`let hasDom=true,mode='play',padIndex=0,stickMag=1,padPrev={},padNav={};const padRest=new Set(),padHeld=new Set(),markPad=()=>{},padConnected=()=>{},pause=()=>{},padMenu=()=>{};${source.match(/const PAD_MAP=\{[^}]*\};/)[0]}${grab('function padSet(')}${grab('function pollPads(')}return pollPads;`)({getGamepads:()=>[pad]},()=>null,keys,pressed);
 const hold=(i,on)=>{buttons[i].pressed=on;buttons[i].value=on?1:0;poll();},clear=()=>{for(let i=0;i<17;i++)hold(i,false);pressed.clear();};
 hold(12,true);hold(5,true);ok(pressed.has('KeyC')&&!keys.has('KeyI'),'gamepad: ↑ + RB throws Ravijojla\'s chain, not the mace');clear();
 hold(5,true);ok(pressed.has('KeyI')&&!keys.has('KeyC'),'gamepad: RB alone still throws the mace');clear();
 hold(12,true);hold(6,true);ok(keys.has('KeyO')&&!keys.has('KeyQ'),'gamepad: ↑ + LT held opens the fairy\'s eye and does not drink');clear();
 hold(13,true);hold(8,true);ok(pressed.has('KeyM')&&!keys.has('KeyG'),'gamepad: ↓ + ⧉ opens the map');clear();
 hold(12,true);hold(8,true);ok(pressed.has('KeyB')&&!keys.has('KeyG'),'gamepad: ↑ + ⧉ leaves a mark on the map');clear();
 hold(8,true);ok(pressed.has('KeyG'),'gamepad: ⧉ alone is still the father\'s sabre');clear();
 const html=await fs.readFile('dist/index.html','utf8');ok(['KeyC','KeyO','KeyB','KeyM'].every(k=>html.includes(`data-key="${k}"`)&&new RegExp(k+":'<").test(source)),'touch: chain, eye, mark and map have their buttons, drawn like the others');}
// ---- one story: the vila joins in her forest, the powers wait at shrines on the road ----
{const w=await start('selo');quiet(w);ok(!api.vilaTu(),'one story: in the village the vila is not yet with Marko');
 {const {p}=S(),e0=p.energy;stand(p.x,p.y);tap('KeyE');step(5);ok(p.energy===e0&&!(p.castLock>0),'one story: E in the village does not call the vila');}
 const w2=await start('suma');quiet(w2);const pt=w2.traps.find(t=>t.kind==='potera');ok(pt&&!api.vilaTu(),'one story: in her forest she is the one Marko rides down, not yet his sworn sister');
 pt.state='kraj';pt.done=true;ok(api.vilaTu(),'one story: the chase over, the vila is Marko\'s sworn sister');
 await start('manastir');ok(api.vilaTu(),'one story: after the forest she is with him in every chapter');
 ok(api.LEVELS.findIndex(L=>L.id==='suma')===1,'one story: the forest of the vila is the second chapter');
 const saved=storage.get('marko-moci');storage.set('marko-moci','[]');storage.delete('marko-levels');api.mociReset();
 const w3=await start('mocvara');quiet(w3);const o=w3.oltari[0];ok(w3.oltari.length===1&&o.moc==='krilo','shrine: the marsh, where Marko binds the falcon\'s wing, holds the shrine of the falcon\'s wing');
 ok(!api.moc('krilo')&&!api.moc('nalet')&&!api.moc2('lanac'),'shrine: the powers are not Marko\'s before he finds them');
 ok(o.x>S().level.spawn.x+800&&o.x<S().level.goal.x-600&&!!floorAt(w3,o.x),'shrine: it stands on the road, away from the start and the goal');
 stand(o.x,o.y);step(3);ok(o.taken&&api.moc('krilo')&&JSON.parse(storage.get('marko-moci')).includes('krilo'),'shrine: walking up to it gives the power for good');
 await start('pecina');ok(api.moc('krilo')&&!api.moc2('lanac')&&S().world.oltari[0]?.moc==='lanac','shrine: the wing is kept in the next chapter, where the chain waits');
 api.completeLevel();ok(JSON.parse(storage.get('marko-moci')).includes('lanac'),'shrine: a chapter finished without its shrine still gives its power');storage.delete('marko-levels');
 for(const [k,id] of Object.entries(api.MOC_GDE)){storage.set('marko-moci','[]');api.mociReset();const w4=await start(id);ok(w4.oltari.length===1&&w4.oltari[0].moc===k,`shrine: ${id} has a place for ${k}`);}
 storage.set('marko-moci',saved);storage.delete('marko-levels');api.mociReset();}
// ---- Šarac's road: no hole is there beforehand; the ground cracks and falls as he comes ----
{api.setLevel(null);api.startChapter(3);const {world:w,p}=S(),fills=w.platforms.filter(q=>q.puca).sort((a,b)=>a.x-b.x),q=fills[0];
 const whole=x=>w.platforms.some(o=>!o.off&&o.y===590&&x>=o.x&&x<=o.x+o.w);
 ok(fills.length>=8&&fills.every(f=>f.puca.s===0&&!f.off)&&[...Array(60)].every((_,i)=>whole(11000+i*200)),`ride: the road to Musa is whole when Marko mounts (${fills.length} places where it will break)`);
 Object.assign(p,{x:q.x-900,y:590,vx:0,vy:0,grounded:true,invuln:99});step(10);ok(q.puca.s===0,'ride: far ahead of him the ground still holds');
 p.x=q.x-500;step(6);ok(q.puca.s===1&&!q.off,'ride: as Šarac comes near, the ground cracks, and still bears');
 step(70);ok(q.off&&q.puca.s===2&&!whole(q.x+q.w/2),'ride: then it breaks and falls, and there is a hole to jump');
 step(160);ok(q.puca.s===3&&fills[1].puca.s===0,'ride: the pieces are gone; the next place is whole until he reaches it');}
// ---- the gate on a clock (passed with the vila's trace) and the hooks over a ravine (Ravijojla's chain) ----
{const w=await start('manastir');quiet(w);const p=S().p,tr=w.traps.find(t=>t.vreme);ok(tr&&tr.gate.x-tr.lever.x>900,'time gate: the forest behind him, Marko meets a gate far from its lever');
 stand(tr.lever.x,tr.lever.y);step(2);tap('KeyE');ok(tr.open>0,'time gate: the lever opens it');api.keys.add('KeyD');let reached=false;for(let i=0;i<120*6&&tr.open>0;i++){step();if(p.x>tr.gate.x-60)reached=true;}api.keys.clear();
 ok(!reached&&p.x<tr.gate.x-200,`time gate: at a run it shuts before he is there (${Math.round(tr.gate.x-p.x)}px short)`);
 stand(tr.gate.x-90,tr.gate.y);step(40);tap('KeyV');step(4);stand(tr.lever.x,tr.lever.y);step(30);tap('KeyE');for(let i=0;i<240&&(p.castLock>0||p.leverT>0);i++)step();const left=tr.open;tap('KeyV');step(30);
 ok(tr.open>0&&Math.abs(p.x-(tr.gate.x-90))<40,`time gate: the trace left by the gate brings him back to it while it is open (${left.toFixed(1)}s left after the pull, trace ${p.trag?'still there':'used'}, ${Math.round(p.x-tr.gate.x)}px from the gate)`);
 api.keys.add('KeyD');for(let i=0;i<120*2&&p.x<tr.gate.x+80;i++)step();api.keys.clear();ok(p.x>tr.gate.x+60,'time gate: and he walks through');}
{const w=await start('klisura');quiet(w);const p=S().p,K=[...w.kuke].sort((a,b)=>a.x-b.x);ok(K.length===2,'hooks: past the cave, two silver hooks hang over a ravine');
 const gy=K[0].y+250,x0=K[0].x-260,far=w.platforms.filter(q=>q.ground&&Math.abs(q.y-gy)<4&&q.x>K[1].x).sort((a,b)=>a.x-b.x)[0];
 stand(x0-30,gy);p.face=1;step(3);tap('KeyC');api.keys.add('KeyD');let second=false;
 for(let i=0;i<120*5;i++){step();p.invuln=99;if(!second&&!p.lanac&&!p.grounded&&p.x>K[0].x-40&&!(p.cd?.lanac>0)){p.face=1;tap('KeyC');second=!!p.lanac;}if(second&&!p.lanac&&p.grounded)break;}api.keys.clear();
 ok(second&&p.grounded&&p.x>=far.x-10&&Math.abs(p.y-gy)<6,`hooks: the chain takes him from the first hook to the second and over the ravine (lands ${Math.round(p.x-far.x)}px past its edge)`);
 stand(x0-30,gy);api.keys.add('KeyD');for(let i=0;i<120*3;i++){step();p.invuln=99;}api.keys.clear();ok(p.y>gy+120&&p.hp>0&&S().mode==='play','hooks: without the chain he drops to the bottom of the ravine, not into a pit');}
console.log(`${checks} pohod mechanics checks passed.`);
