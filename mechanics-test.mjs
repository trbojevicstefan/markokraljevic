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
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,breakPlow,state:()=>({p,world,mode,level,thrown,coins,perks,bank:bank()})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
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
console.log(`${checks} pohod mechanics checks passed.`);
