import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},firstElementChild:{style:{}},classList:{add(){},remove(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame',source+'\nreturn {start,update,keys,pressed,die,slay,win,pause,deathPose,damage,state:()=>({p,boss,world,mode,zone,elapsed,kills,horseMounted,horseX,corpses,arrows}),settings,restore,save};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{});
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
api.start();const foe=api.state().world.enemies[0];api.slay(foe);api.slay(foe);
assert.equal(api.state().kills,1,'death cannot count twice');
assert.equal(api.state().corpses.length,1);
api.pause();api.update(.2);assert.equal(api.state().corpses[0].t,0,'pause freezes death animation');api.pause();
for(let i=0;i<130;i++)api.update(1/120);
assert.equal(api.deathPose(api.state().corpses[0]).frame,5,'collapse reaches final pose');
api.start();api.state().p.y=400;api.state().p.vy=200;api.die();api.die();
assert.equal(api.state().mode,'dead');assert.equal(node('death').hidden,true,'defeat overlay waits for collapse');
const deathX=api.state().p.x;api.keys.add('KeyD');api.keys.add('KeyK');
for(let i=0;i<100;i++)api.update(1/120);
assert.equal(api.state().p.x,deathX,'no movement after death');
assert.equal(api.state().p.attack,0,'no attacks after death');
assert.equal(node('death').hidden,true,'overlay does not cover final settling pose');
for(let i=0;i<110;i++)api.update(1/120);
assert.equal(node('death').hidden,false);assert(api.state().corpses[0].grounded,'airborne defeat settles to terrain');
assert.equal(api.deathPose(api.state().corpses[0]).frame,5);
api.start();assert.equal(api.state().corpses.length,0,'retry clears corpses');
api.win();assert.equal(node('victory').hidden,true,'victory waits for Musa');
for(let i=0;i<190;i++)api.update(1/120);
assert.equal(node('victory').hidden,false);assert.equal(api.state().corpses[0].type,'musa');
console.log('PASS death sequence, duplicate kill guard, airborne landing, pause, locked input, delayed victory and retry');
api.start();api.keys.add('KeyS');for(let i=0;i<30;i++)api.update(1/120);
assert.equal(api.state().p.h,64);assert.equal(api.state().p.y,590);
api.state().arrows.push({x:150,y:510,vx:0,life:2,enemy:true});api.update(1/120);
assert.equal(api.state().p.hp,120,'crouch ducks an arrow at head height');
api.keys.clear();for(let i=0;i<30;i++)api.update(1/120);
assert(api.state().p.hp<120,'standing restores arrow collision');
api.start();api.keys.add('KeyL');for(let i=0;i<50;i++)api.update(1/120);
api.damage(20,-1);assert.equal(api.state().p.hp,116,'front block reduces damage by 80 percent');
assert(api.state().p.guard<60,'block consumes guard');
api.state().p.invuln=0;api.damage(20,1);assert.equal(api.state().p.hp,96,'rear attack bypasses guard');
api.state().p.guard=1;api.state().p.invuln=0;api.damage(20,-1);
assert(api.state().p.guardBreak>0&&!api.state().p.blocking,'exhausted guard breaks');
api.start();api.pressed.add('KeyR');api.update(1/120);assert.equal(api.state().p.attack,0,'super requires full rage');
const sf=api.state();sf.p.rage=100;sf.p.x=sf.world.enemies[0].x-100;api.pressed.add('KeyR');api.update(1/120);
assert.equal(sf.p.rage,0);assert.equal(sf.p.attackKind,'super');
for(let i=0;i<45;i++)api.update(1/120);
assert.equal(sf.world.enemies[0].hp,sf.world.enemies[0].maxHp,'super windup cannot hit');
for(let i=0;i<30;i++)api.update(1/120);
assert.equal(sf.world.enemies[0].alive,false,'super contact deals finishing damage');
assert.equal(api.state().corpses.length,1);assert(sf.p.superImpact,'super impact FX triggered');
console.log('PASS crouch arrow collision, directional block, guard break, super cost and contact timing');
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
 if(zone===5){target=boss.x;if(Math.abs(p.x-boss.x)<140){api.keys.add('KeyK');if((boss.mode==='windup'||boss.mode==='second')&&boss.timer<.23&&p.parryCooldown<=0)tap('KeyL');if(p.energy>=35&&boss.mode==='idle')tap('KeyE');}if(boss.mode==='leap'&&boss.timer<.22&&p.grounded)tap('Space');if(boss.mode==='charge'&&Math.abs(boss.x-p.x)<190&&p.dashCooldown<=0){api.keys.delete('KeyA');api.keys.delete('KeyD');api.keys.add(boss.x>p.x?'KeyD':'KeyA');tap('ShiftLeft');}}
 const fighting=(near&&target===near.x)||(zone===5);const stop=fighting?102:25;if(Math.abs(target-p.x)>stop)api.keys.add(target>p.x?'KeyD':'KeyA');else if(fighting&&Math.sign(target-p.x)!==p.face)api.keys.add(target>p.x?'KeyD':'KeyA');
 if(p.grounded){const ground=world.platforms.filter(q=>q.x<=p.x&&q.x+q.w>=p.x&&Math.abs(q.y-p.y)<5&&(q.kind!=='magic'||world.runes[q.rune].active)).sort((a,b)=>b.x+b.w-a.x-a.w)[0];if(ground&&ground.x+ground.w-p.x<(s.horseMounted?120:60)&&target>p.x+50)tap('Space');if(s.horseMounted&&world.barriers.some(b=>b.x-p.x>30&&b.x-p.x<160))tap('Space');if(zone===5&&world===null)tap('Space');}
 if(p.hp<85&&p.wine>0&&p.buff<=0)tap('KeyQ');if(p.hp<75&&p.energy>=35&&p.grounded&&zone!==2&&zone!==3&&zone!==5)tap('KeyE');
 api.update(1/120);
 if(frame===120*900-1)log.push({end:'timeout',time:s.elapsed,x:p.x,zone,hp:p.hp,near});
}
const result={stageTimes,result:log,notes:'Simulation uses real movement, combat, jumps and input events; no position or health cheats. No rendering. Deterministic gameplay bot, not a human duration measurement.'};console.log(JSON.stringify(result,null,2));await fs.mkdir('output',{recursive:true});await fs.writeFile('output/simulation.json',JSON.stringify(result,null,2));
if(!log.some(s=>s.end==='victory'))process.exitCode=1;
