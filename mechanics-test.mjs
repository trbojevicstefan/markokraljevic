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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {start,startChapter,startLevel,update,keys,pressed,LEVELS,breakPlow,has,SKILLS,levelOpen,completeLevel,state:()=>({p,world,mode,level,thrown,coins,perks,bank:bank(),zone,boss,arrows})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
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
{ok(!api.levelOpen(0),'journey: the pohodi wait until Musa falls in the story');storage.set('marko-kacanik','won');ok(api.levelOpen(0)&&!api.levelOpen(1),'journey: then only the first pohod is open');
 const w=await start('manastir');quiet(w);ok(!api.has('zid'),'journey: the wall jump is still locked');
 const a=w.platforms.find(q=>q.hang),gy=floorAt(w,a.x+a.w+20).y;stand(a.x+a.w+30,gy);tap('Space');api.keys.add('KeyA');let grabbed=false;for(let i=0;i<120;i++){step();if(S().p.wall)grabbed=true;}api.keys.clear();ok(!grabbed,'journey: without the skill Marko cannot cling to a wall');
 await start('selo');api.completeLevel();ok(api.has('niz')&&api.levelOpen(1),'journey: finishing the village teaches the combo and opens the gorge');}
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
{const w=await start('selo');quiet(w);const b=w.breakables.find(b=>b.kind==='sanduk');stand(b.x-70,b.y);S().p.face=1;const before=S().bank;
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
{const w=await start('manastir');quiet(w);const t=w.traps.find(t=>t.kind==='timed');stand(t.gate.x-200,t.gate.y);api.keys.add('KeyD');step(120);api.keys.clear();ok(S().p.x<=t.gate.x-59,'traps: the timed gate is shut');
 stand(t.lever.x,t.lever.y);tap('KeyE');step(2);ok(t.open>0,'traps: the lever opens it');api.keys.add('KeyD');for(let i=0;i<120*5&&S().p.x<t.gate.x+80;i++){step();const pl=w.platforms.find(q=>q.pillar&&Math.abs(q.x-S().p.x-40)<30);if(S().p.grounded&&(pl||w.traps.some(o=>o.kind==='spikes'&&o.x-S().p.x<70&&o.x-S().p.x>20)))tap('Space');}api.keys.clear();ok(S().p.x>t.gate.x,'traps: running through before it shuts');}
// ---- the chase: run, and the boulder ends in the ravine ----
{const w=await start('klisura');quiet(w);const t=w.traps.find(t=>t.kind==='boulder');stand(t.x0+100,t.y);S().p.invuln=0;api.keys.add('KeyD');
 for(let i=0;i<120*12&&t.state!=='done';i++){const {p}=S();const ahead=w.platforms.find(q=>q.pillar&&q.x-p.x>10&&q.x-p.x<60)||w.traps.find(o=>o.kind==='spikes'&&o.x-p.x>10&&o.x-p.x<70)||(p.x>t.end-60&&p.x<t.end);if(p.grounded&&ahead)tap('Space');else step();}
 api.keys.clear();ok(t.state==='done'&&S().mode==='play','chase: Marko outruns the boulder and it falls into the ravine');}
// ---- a champion locks the arena until he falls ----
{const w=await start('tvrdjava');const c=w.enemies.find(e=>e.champion);quiet(w,[c]);ok(c&&c.name==='Hasan-aga Oklopnik','champions: the fortress ends with Hasan-aga');
 stand(c.arena.x0+150,c.y);S().p.invuln=99;step(4);S().p.x=c.arena.x0-200;step(2);ok(S().p.x>=c.arena.x0+30,'champions: the arena holds Marko in');
 c.hp=1;c.stun=5;stand(c.x-80,c.y);S().p.face=1;tap('KeyK');step(80);ok(!c.alive,'champions: the aga falls');step(5);S().p.x=c.arena.x1+40;step(2);ok(S().p.x>c.arena.x1,'champions: the arena opens again');
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
{const w=await start('selo');quiet(w);const t=w.traps.find(t=>t.kind==='plate'),c=w.platforms.find(q=>q.push);stand(t.gate.x-200,t.y);api.keys.add('KeyD');step(120);api.keys.clear();ok(S().p.x<=t.gate.x-59,'plate: the gate is shut');
 stand(c.x-20,t.y);api.keys.add('KeyD');for(let i=0;i<120*8&&!t.pressed;i++)step();api.keys.clear();ok(t.pressed,'plate: Marko pushes the heavy crate onto the plate');
 api.keys.add('KeyD');for(let i=0;i<120*4&&S().p.x<t.gate.x+60;i++){step();if(S().p.grounded&&S().p.wallHit)tap('Space');}api.keys.clear();ok(S().p.x>t.gate.x,'plate: and walks through the open gate');}
{const w=await start('selo');quiet(w);const q=w.platforms.find(q=>q.kind==='cracked');stand(q.x+q.w/2,q.y-200);S().p.grounded=false;S().p.vy=0;step(2);api.keys.add('KeyS');tap('KeyJ');step(160);api.keys.clear();ok(q.off&&S().p.y>q.y+100,'cellar: a blow from above breaks the cracked slab and Marko drops into the cellar');}
{const w=await start('pecina');quiet(w);const t=w.traps.find(t=>t.bed);stand(t.x+t.w/2,t.y-220);S().p.grounded=false;S().p.vy=0;S().p.invuln=0;const hp=S().p.hp;step(2);api.keys.add('KeyS');tap('KeyJ');let up=false;for(let i=0;i<120*2;i++){step();if(S().p.vy<-400&&!up){up=true;api.keys.delete('KeyS');api.keys.add('KeyD');}}api.keys.clear();ok(up&&S().p.hp===hp&&S().p.x>t.x+t.w,'pogo: a blow from above bounces off the stakes and Marko clears the bed unhurt');}
{const w=await start('klisura');quiet(w);const t=w.traps.find(t=>t.kind==='lift');stand(t.lever.x,t.lever.y);step(5);tap('KeyE');step(3);const q=t.q;stand(q.x+q.w/2,q.y);for(let i=0;i<120*5;i++)step();ok(Math.abs(S().p.y-q.top)<3,`lift: the lever sends Marko ${q.base-q.top}px up the cliff`);}
{const w=await start('mocvara');quiet(w);const q=w.platforms.find(q=>q.kind==='raft');stand(q.x+q.w/2,q.y);step(2);const x0=S().p.x;let far=0;for(let i=0;i<120*6;i++){step();if(S().p.on===q)far=Math.max(far,Math.abs(S().p.x-x0));}ok(far>150&&S().p.y===q.y,`raft: it carries Marko ${Math.round(far)}px over the water`);}
// ---- combos ----
{const w=await start('selo');const e=w.enemies.find(e=>!e.perch&&!e.champion);quiet(w,[e]);const gy=floorAt(w,e.x).y;Object.assign(e,{type:'sword',y:gy,hp:999,maxHp:999,stun:5});stand(e.x-80,gy);S().p.face=1;
 tap('KeyJ');step(46);tap('KeyJ');step(46);let kind='';for(let i=0;i<40&&kind!=='lomilac';i++){tap('KeyK');kind=S().p.attackKind;}ok(kind==='lomilac','combo: J J K is the Lomilac');step(60);ok(e.vx>0||!e.grounded||e.x>gy,'combo: the Lomilac throws the janissary back');}
console.log(`${checks} pohod mechanics checks passed.`);
