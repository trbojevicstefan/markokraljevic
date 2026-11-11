// Plays the pohod mechanics with real input, headless: node mechanics-test.mjs
// Ladders, wall jumps up a shaft, dropping through planks, crates and chests, ducats, marvels, the thrown mace,
// foes that jump gaps and steps and climb ladders, archers shooting down from towers, and the plow teams.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {start,startChapter,startLevel,update,keys,pressed,LEVELS,breakPlow,has,SKILLS,levelOpen,completeLevel,playerPose,placeLabel,idleFrame,FOE_IDLE,shakeNow:()=>shake,grunts:()=>gruntCount,state:()=>({p,world,mode,level,thrown,coins,perks,bank:bank(),zone,boss,arrows})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
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
{ok(api.levelOpen(0)&&!api.levelOpen(1),'journey: the song begins in the village, and only the first pohod is open');ok(api.LEVELS.map(L=>L.id).join(' ')==='selo manastir oranje tvrdjava podrum mocvara suma pecina prevoj klisura rusevine rudnik reka urvina san','journey: the pohodi follow the life of Marko');
 {const done=api.LEVELS.slice(0,9).map(L=>L.id);storage.set('marko-levels',JSON.stringify(done));ok(api.levelOpen(8)&&!api.levelOpen(9),'journey: after the ninth pohod the road is shut until Musa falls');storage.set('marko-kacanik','won');ok(api.levelOpen(9)&&!api.levelOpen(10),'journey: Musa fallen, the gorge opens');storage.delete('marko-levels');storage.delete('marko-kacanik');}
 const w=await start('manastir');quiet(w);ok(!api.has('zid'),'journey: the wall jump is still locked');
 const a=w.platforms.find(q=>q.hang),gy=floorAt(w,a.x+a.w+20).y;stand(a.x+a.w+30,gy);tap('Space');api.keys.add('KeyA');let grabbed=false;for(let i=0;i<120;i++){step();if(S().p.wall)grabbed=true;}api.keys.clear();ok(!grabbed,'journey: without the skill Marko cannot cling to a wall');
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
async function climbShaft(id,mandatory){const w=await start(id);quiet(w);const a=w.platforms.find(q=>q.hang),b=w.platforms.filter(q=>q.solid&&q.x>a.x+a.w&&q.x-(a.x+a.w)<200).sort((u,v)=>u.x-v.x)[0];
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
// ---- the plowing road: the oxen trample, the plow breaks under the mace ----
{const w=await start('oranje');quiet(w);const pl=w.plowTeams[0];stand(pl.x-700,pl.y);const x0=pl.x;step(120*2);ok(pl.x<x0,'plow: the team plows the road toward Marko');
 stand(pl.x-120,pl.y);S().p.face=1;for(let i=0;i<40&&!pl.broken;i++){tap('KeyK');step(80);}ok(pl.broken,'plow: heavy blows break the plow');
 ok(w.items.some(i=>i.type==='tovar'&&i.plow===pl),'plow: the broken plow leaves a load of treasure');}
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
 api.keys.add('KeyW');tap('KeyJ');api.keys.delete('KeyW');step(30);const lifted=e.vy<0||e.y<gy-10;tap('Space');step(1);const follow=S().p.vy<-700;let hits=0,hp=e.hp;
 for(let i=0;i<120*2&&!S().p.grounded;i++){if(i%22===2){tap(tresak&&hits>=1?'KeyK':'KeyJ');}step();if(e.hp<hp){hits++;hp=e.hp;}}
 for(let i=0;i<120*2&&!(e.grounded&&!e.air);i++)step();return{e,lifted,follow,hits,slam:600-e.hp};}
{const r=await juggle('selo',false);ok(r.lifted,'launch: W+J lifts a janissary into the air (no skill needed)');ok(r.follow,'launch: Space right after it follows him up');ok(r.hits>=2,`launch: blows land in the air (${r.hits})`);ok(r.slam>=110,`launch: the string ends slamming him into the ground (−${Math.round(r.slam)})`);}
{const r=await juggle('selo',true);ok(r.slam>=130,`tresak: K in the air drives him into the ground (−${Math.round(r.slam)})`);}
{api.start();const w=S().world;const e=w.enemies.find(e=>e.zone===0&&e.type==='sword');for(const o of w.enemies)if(o!==e)o.alive=false;Object.assign(e,{stun:0,mode:'idle',timer:9,hp:300,maxHp:300});stand(e.x-70,e.y);S().p.face=1;S().p.invuln=99;
 api.keys.add('KeyW');tap('KeyJ');api.keys.delete('KeyW');step(30);ok(e.y<580,'launch: in the Kačanik story too the janissary flies');step(240);ok(e.y===590,'launch: and lands back on the road');}
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
 api.keys.add('KeyS');tap('KeyK');api.keys.clear();ok(S().p.attackKind==='uvis','uppercut: S+K is the uppercut');let up=false;for(let i=0;i<40;i++){step();if(e.y<q.y-40)up=true;}ok(up,'uppercut: it throws the janissary into the air');}
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
{const R=physics.RECIPES,haz=new Set(['spikes','crumble','logs','rocks','barrels','lever','chase','spikebed','greda','zid','sator','top']),rest=new Set(['flat','crates','cellar','kljuc','plate','arena','watch','ledges','zvona','ogledala','teg','kolo','barut','svatovi','guslar','gnezdo']);let worst='';
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
console.log(`${checks} pohod mechanics checks passed.`);
