import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},firstElementChild:{style:{}},classList:{add(){},remove(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame',source+'\nreturn {start,update,keys,pressed,state:()=>({p,boss,world,mode,zone,elapsed,kills,horseMounted,horseX}),settings,restore,save};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{});
api.settings.difficulty='normal';
// Isolated mechanic checks use explicit fixture setup; the complete run below starts fresh.
api.start();api.pressed.add('KeyE');api.update(1/120);
assert.equal(window.markoState().fairyVisible,true,'summoning must show Ravijojla');
assert.equal(window.markoState().castPending,true,'spell waits for casting gesture');
const energyAfterCall=api.state().p.energy;api.pressed.add('KeyE');api.update(1/120);
assert(api.state().p.energy>=energyAfterCall,'repeat input during cast cannot consume energy twice');
for(let i=0;i<70;i++)api.update(1/120);
assert.equal(window.markoState().castPending,false,'spell resolves after gesture');
api.start();const fixture=api.state();fixture.p.x=fixture.world.enemies[0].x-100;api.keys.add('KeyK');api.update(1/120);api.keys.clear();
assert.equal(fixture.world.enemies[0].hp,fixture.world.enemies[0].maxHp,'backswing cannot deal damage');
for(let i=0;i<35;i++)api.update(1/120);
assert(fixture.world.enemies[0].hp<fixture.world.enemies[0].maxHp,'contact phase deals damage');
api.start();api.pressed.add('KeyQ');api.update(1/120);
assert.equal(api.state().p.buff,0,'wine buff waits for sip');
for(let i=0;i<65;i++)api.update(1/120);
assert(api.state().p.buff>0,'sip activates wine buff');
console.log('PASS summon visibility, spell timing, repeated cast guard, strike contact, wine timing');
api.start();api.save();let previousZone=-1;const stageTimes=[];let log=[];
const tap=c=>api.pressed.add(c);
for(let frame=0;frame<120*900;frame++){
 const s=api.state(),{p,boss,world,zone}=s;if(s.mode!=='play'){log.push({end:s.mode,time:s.elapsed,kills:s.kills,hp:p.hp,x:p.x,bossHp:boss.hp});break;}
 if(zone!==previousZone){stageTimes.push({zone,time:Number(s.elapsed.toFixed(2)),hp:p.hp});previousZone=zone;}
 api.keys.clear();let target=physics.chapters[zone].end;
 const foes=world.enemies.filter(e=>e.alive&&e.zone===zone).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x));const near=foes[0];
 if(near){target=near.x;if(Math.abs(near.x-p.x)<140){api.keys.add('KeyK');if(near.mode==='windup'&&near.timer<.22&&p.parryCooldown<=0)tap('KeyL');}}
 if(zone===2){const rune=world.runes.find(r=>!r.active);if(rune&&(!near||rune.x<near.x)){target=rune.x;if(Math.abs(p.x-rune.x)<95&&p.energy>=30)tap('KeyE');}}
 if(zone===3&&!s.horseMounted){target=s.horseX;if(Math.abs(p.x-target)<160)tap('KeyE');}
 if(zone===5){target=boss.x;if(Math.abs(p.x-boss.x)<140){api.keys.add('KeyK');if((boss.mode==='windup'||boss.mode==='second')&&boss.timer<.23&&p.parryCooldown<=0)tap('KeyL');if(p.energy>=35&&boss.mode!=='open'&&boss.mode!=='roar')tap('KeyE');}}
 const fighting=(near&&target===near.x)||(zone===5);const stop=fighting?102:25;if(Math.abs(target-p.x)>stop)api.keys.add(target>p.x?'KeyD':'KeyA');else if(fighting&&Math.sign(target-p.x)!==p.face)api.keys.add(target>p.x?'KeyD':'KeyA');
 if(p.grounded){const ground=world.platforms.filter(q=>q.x<=p.x&&q.x+q.w>=p.x&&Math.abs(q.y-p.y)<5&&(q.kind!=='magic'||world.runes[q.rune].active)).sort((a,b)=>b.x+b.w-a.x-a.w)[0];if(ground&&ground.x+ground.w-p.x<(s.horseMounted?120:60)&&target>p.x+50)tap('Space');if(s.horseMounted&&world.barriers.some(b=>b.x-p.x>30&&b.x-p.x<160))tap('Space');if(zone===5&&world===null)tap('Space');}
 if(p.hp<85&&p.wine>0&&p.buff<=0)tap('KeyQ');if(p.hp<75&&p.energy>=35&&p.grounded&&zone!==2&&zone!==3&&zone!==5)tap('KeyE');
 api.update(1/120);
 if(frame===120*900-1)log.push({end:'timeout',time:s.elapsed,x:p.x,zone,hp:p.hp,near});
}
const result={stageTimes,result:log,notes:'Simulation uses real movement, combat, jumps and input events; no position or health cheats. No rendering. Deterministic gameplay bot, not a human duration measurement.'};console.log(JSON.stringify(result,null,2));await fs.mkdir('output',{recursive:true});await fs.writeFile('output/simulation.json',JSON.stringify(result,null,2));
if(!log.some(s=>s.end==='victory'))process.exitCode=1;
