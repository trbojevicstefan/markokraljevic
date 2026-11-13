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
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {presuda,start,startChapter,startLevel,update,keys,pressed,LEVELS,plowSpoils,has,SKILLS,levelOpen,completeLevel,playerPose,grunts:()=>gruntCount,state:()=>({p,world,mode,level,thrown,coins,perks,bank:bank(),zone,boss,arrows})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
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

// Road test: a bot walks every pohod left to right with simple habits: node road-test.mjs
// It may only stop at designed puzzles it cannot solve (the lift, a wall-jump shaft, a plow team, the bells, mirrors, scale,
// fairy ring and powder keg); anywhere else is a soft-lock.
storage.set('marko-kacanik','won');storage.set('marko-skills',JSON.stringify(api.SKILLS.map(k=>k.id)));
const report=[];
for(let li=0;li<api.LEVELS.length;li++){const w=await start(api.LEVELS[li].id);const L=S().level,p=S().p,goalX=L.goal.x;let best=p.x,bestT=0,t=0,stuck=[],jumpCd=0;
 while(p.x<goalX-60&&t<520){t+=1/120;p.invuln=99;p.hp=p.maxHp;api.keys.clear();api.keys.add('KeyD');if(p.hang)api.keys.add('KeyW');
  for(const e of w.enemies)if(e.alive&&e.x>p.x-80&&e.x<p.x+500&&Math.abs(e.y-p.y)<300)e.alive=false;
  const ahead=x=>w.platforms.some(q=>!q.off&&x>q.x&&x<q.x+q.w&&q.y>=p.y-6&&q.y<p.y+60);
  const lintel=w.platforms.find(q=>q.lintel&&q.x-p.x<130&&q.x+q.w>p.x-20);if(lintel)api.keys.add('KeyS');
  const wall=(w.breakables||[]).find(b=>!b.broken&&b.kind==='zid'&&b.x-p.x>0&&b.x-p.x<130&&Math.abs(b.y-p.y)<10);if(wall&&p.attack<=0){p.face=1;press('KeyK');}
  const lad=(w.ladders||[]).find(l=>Math.abs(l.x-p.x)<36&&l.top<p.y-30&&l.bottom>=p.y-10);if(lad||p.climb)api.keys.add('KeyW');
  for(const tr of w.traps||[]){const lv=tr.lever;if(lv&&Math.abs(lv.x-p.x)<90&&Math.abs(lv.y-p.y)<100&&!(tr.open>0)&&t%1<.01)press('KeyE');}
  for(const g of w.goals||[])if(!g.done&&g.kind==='use'&&Math.abs(g.x-p.x)<100&&t%1<.01)press('KeyE');
  // the defence of the guslar is a fight the bot does not fight (battles-test does): it counts as a set piece passed by
  for(const tr of w.traps||[])if(tr.kind==='guslar'&&tr.state==='odbrana'){tr.state='peva';for(const e of w.enemies)if(e.prey===tr)e.alive=false;stuck.push({at:'odbrana guslara',known:true});}
  jumpCd-=1/120;if(p.grounded&&!lintel&&jumpCd<=0&&!p.climb&&(p.wallHit===1||(Math.abs(p.vx)<20&&t-bestT>.6)||!ahead(p.x+46))){press('Space');jumpCd=.35;}
  if(p.wall&&jumpCd<=0){press('Space');jumpCd=.25;}
  step();if(S().mode==='shop')api.presuda(3);if(p.x>best+15){best=p.x;bestT=t;}
  if(t-bestT>5){const near=[...(w.traps||[]).filter(tr=>Math.abs((tr.x??tr.gate?.x??tr.gap?.x0??tr.pulley?.x??0)-p.x)<500).map(tr=>tr.kind),...(w.ladders||[]).filter(l=>Math.abs(l.x-p.x)<250).map(()=>'ladder')];
   const known=['lift','bells','mirrors','scale','kolo','powder','red','dren','melodija','potera','pogled'].some(k=>near.includes(k))||(w.goals||[]).some(g=>g.kind==='gate'&&!g.done&&Math.abs(g.x-p.x)<300)||(w.traps||[]).some(tr=>tr.vreme&&p.x>tr.lever.x-200&&p.x<tr.gate.x+100)||(w.plows||[]).some(pl=>Math.abs(pl.x-p.x)<700)||w.platforms.some(q=>!q.ground&&q.solid&&q.x<p.x+300&&q.x+q.w>p.x-250&&q.y+q.h<p.y-60);
   stuck.push({at:`${Math.round(p.x)},${Math.round(p.y)} [${[...new Set(near)].join(' ')}]`,known});
   const nxt=w.platforms.filter(q=>q.ground&&q.x>p.x+120).sort((a,b)=>a.x-b.x)[0],here=w.platforms.find(q=>q.ground&&Math.abs(q.y-p.y)<4&&p.x+400<q.x+q.w);
   if(here&&(!nxt||nxt.x>p.x+900))p.x+=400;else if(nxt){p.x=nxt.x+40;p.y=nxt.y;}else break;p.vx=0;p.vy=0;p.climb=null;p.wall=0;best=p.x;bestT=t;}}
 const bad=stuck.filter(x=>!x.known);report.push(`${L.id}: ${p.x>=goalX-60?'goal':'GAVE UP'} in ${t.toFixed(0)}s, puzzles skipped ${stuck.length-bad.length}${bad.length?', SOFT-LOCK at '+bad.map(x=>x.at).join(' | '):''}`);
 assert(p.x>=goalX-60,`${L.id}: the bot reaches the goal`);assert(!bad.length,`${L.id}: no soft-lock (${bad.map(x=>x.at).join(' | ')})`);}
console.log(report.join('\n'));console.log(`PASS road: the bot walks all ${api.LEVELS.length} pohodi to the goal, stopping only at designed puzzles`);
