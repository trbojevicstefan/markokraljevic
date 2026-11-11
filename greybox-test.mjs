// The greybox (index.html?greybox), headless and with real input: node greybox-test.mjs
// Every room can be reached once its powers are collected, and every locked passage stays shut without its power:
// the high walls without the falcon's wing, the abyss without the air dash (even with the wing), the door without the fairy's trace.
// Then a whole run from the first room to the champion, the secret room included, and the checkpoint after a fall.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,greybox,topAt}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startGreybox,startChapter,update,keys,pressed,has,retry,damage,VIEW_W,state:()=>({p,world,mode,level,zone,arena,ckpt,camera})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
const GB=physics.greybox,F=590;
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const S=()=>api.state();
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const tap=k=>{api.pressed.add(k);api.keys.add(k);step();api.keys.delete(k);};
const gate=(w,moc,x)=>w.platforms.find(q=>q.gbGate===moc&&Math.abs(q.x-x)<10);

// ---- the map as a graph: what each power opens ----
{const all=new Set(['krilo','nalet','trag']),ids=GB.GB_ROOMS.map(R=>R.id);
 ok(ids.length>=6&&ids.length<=8,`map: ${ids.length} rooms`);
 ok(GB.gbReach(all).length===ids.length,'map: holding all three powers, every room can be entered');
 let have=new Set(),order=[];for(let k=0;k<5;k++){const rooms=GB.gbReach(have);for(const [moc,room] of Object.entries(GB.GB_SHRINES))if(rooms.includes(room)&&!have.has(moc)){have.add(moc);order.push(moc);}}
 ok(order.join(' ')==='krilo nalet trag'&&GB.gbReach(have).length===ids.length,'map: starting with nothing, each power is found in a room the ones before it open: '+order.join(', '));
 ok(GB.gbReach(new Set()).join(' ')==='predvorje strazarnica sokolova','map: with no power only the first three rooms are open');
 for(const moc of all){const less=new Set([...all].filter(m=>m!==moc)),shut=ids.filter(id=>!GB.gbReach(less).includes(id));ok(shut.length>0,`map: without ${moc} these stay shut: ${shut.join(', ')}`);}}

// ---- the start: no wing, no dash, no trace; the wall jump and the fairy's lift are off in the greybox ----
api.startGreybox();
{const {p,world:w,level}=S();for(const e of w.enemies)if(!e.champion)e.alive=false;
 ok(level.greybox&&S().zone===GB.GB_ZONE&&Object.values(w.gb.moci).every(v=>!v),'start: the greybox opens with none of the three powers');
 ok(!api.has('zid')&&!api.has('uzlet')&&api.has('niz')&&api.has('kolut'),'start: Marko has his blows and the roll, but not the wall jump nor the fairy\'s lift');
 p.invuln=99;tap('Space');step(30);const v=p.vy;tap('Space');ok(!p.kriloUsed&&p.vy>v,'start: Space in the air does nothing yet');step(120);
 tap('Space');step(20);tap('ShiftLeft');ok(!p.airDash&&!p.naletUsed,'start: Shift in the air does nothing yet');step(120);
 tap('KeyV');ok(!p.trag,'start: V leaves no trace yet');}

// ---- helpers: real input only; Marko is placed once at the start of an attempt and then only keys move him ----
function place(x,face=1){const p=S().p;Object.assign(p,{x,y:F,vx:0,vy:0,grounded:true,climb:null,hang:false,ledgeT:0,ledge:null,wall:0,attack:0,dash:0,airDash:false,kriloUsed:false,naletUsed:false,face,hp:p.maxHp,invuln:99,trag:null,cd:{}});api.keys.clear();api.pressed.clear();step(2);}
function setMoci(m){Object.assign(S().world.gb.moci,{krilo:false,nalet:false,trag:false},m);}
// over a high wall: run at it, jump at a set distance, the wing at a set frame, climb when hanging (W)
function overWall(q,dir,{d,k}){const side=dir>0?q.x:q.x+q.w,beyond=x=>dir>0?x>q.x+q.w:x<q.x;place(side-dir*(d+60),dir);const key=dir>0?'KeyD':'KeyA';api.keys.add(key);
 let jf=-1,top=false;for(let f=0;f<420;f++){const p=S().p;if(jf<0&&Math.abs(p.x-side)<=d+17){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===k)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)tap('KeyW');
  step();const P=S().p;if(P.grounded&&Math.abs(P.y-q.y)<2&&P.x>q.x&&P.x<q.x+q.w)top=true;if(beyond(P.x)&&P.grounded)break;}
 api.keys.clear();step(2);return top||beyond(S().p.x);}
function searchWall(q,dir){for(const d of[10,40,80,130])for(const k of[8,14,20,26,32,38,44,50,56,999])if(overWall(q,dir,{d,k}))return{d,k};return null;}
// across the abyss: run, a roll at a set distance, a jump at a set place, the wing and the dash on set frames
const PIT=GB.GB_ROOMS.find(R=>R.id==='ponor').x1-900,LIP=PIT+GB.GB_GAP;
function leap({roll,jumpAt,k,n}){place(PIT-560,1);api.keys.add('KeyD');let jumped=false,jf=0,rolled=false,over=false;
 for(let f=0;f<520;f++){const p=S().p;if(roll!=null&&!rolled&&p.x>=PIT-roll){rolled=true;api.pressed.add('ShiftLeft');}
  if(!jumped&&p.x>=PIT+jumpAt){jumped=true;jf=f;api.pressed.add('Space');}if(jumped&&f-jf===k)api.pressed.add('Space');if(jumped&&n!=null&&f-jf===n)api.pressed.add('ShiftLeft');
  step();const P=S().p;if(P.grounded&&P.x>LIP-17&&Math.abs(P.y-F)<1){over=true;break;}if(jumped&&P.grounded&&P.x<PIT)break;}
 api.keys.clear();step(2);return over;}

// ---- the high walls: the wing climbs them, one jump and a ledge grab do not ----
{const w=S().world,w2=gate(w,'krilo',6050),w1=gate(w,'krilo',1400);
 ok(w2&&F-w2.y===GB.GB_WALL&&w1&&F-w1.y===GB.GB_WALL,`walls: both krilo walls stand ${GB.GB_WALL}px over the floor`);
 setMoci({});ok(!searchWall(w2,1),'walls: without the wing no run-up, jump or ledge grab gets over the wall into the Ponor (40 tries)');
 ok(!searchWall(w1,-1),'walls: without the wing the secret room behind the first wall stays out of reach (40 tries)');
 setMoci({krilo:true});const a=searchWall(w2,1),b=searchWall(w1,-1);
 ok(a,`walls: with the wing Marko gets over into the Ponor (jump ${a?.d}px from the wall, wing ${a?.k} frames later, then the ledge)`);
 ok(b,'walls: with the wing he gets back over the first wall into the secret room');}

// ---- the abyss: the wing alone falls short, the dash with it crosses ----
{let best=null;setMoci({krilo:true});
 for(const roll of[null,80,160])for(const jumpAt of[-15,0,10])for(let k=60;k<=110;k+=2)if(leap({roll,jumpAt,k,n:null})){best={roll,jumpAt,k};break;}
 ok(!best,`abyss: ${GB.GB_GAP}px; with the wing but no dash, 234 runs (roll or not, jump early or late, wing on every other frame) all fall short`);
 setMoci({krilo:true,nalet:true});ok(leap({roll:null,jumpAt:0,k:72,n:16}),'abyss: a plain run-up, jump at the edge, the dash, then the wing: across');
 let n=0;for(let k=56;k<=96;k+=8)for(let d=8;d<=40;d+=8)if(leap({roll:null,jumpAt:0,k,n:d}))n++;ok(n>=4,`abyss: not a frame-perfect trick: ${n} of 30 wing/dash timings make it`);}

// ---- the door: the switch opens it for a moment; only the fairy's trace gets Marko through ----
{const w=S().world,G=w.gb,D=G.door,q=D.q,sw=G.sw;setMoci({krilo:true,nalet:true});
 place(sw.x,1);step(2);ok(D.open>0&&q.off,'door: stepping on the switch opens it');
 // the best race without the trace: run, roll, jump, dash and wing over and over
 api.keys.add('KeyD');let through=false;for(let f=0;f<720;f++){const p=S().p;if(p.grounded&&f%10===0)api.pressed.add(f%40===0?'ShiftLeft':'Space');if(!p.grounded&&f%12===0)api.pressed.add(p.naletUsed?'Space':'ShiftLeft');step();if(S().p.x>q.x+q.w)through=true;}
 api.keys.clear();step(2);ok(!through&&!q.off&&S().p.x<q.x,`door: without the trace it shuts (${GB.GB_DOOR}s) long before Marko gets there from the switch, ${q.x-sw.x}px away`);
 setMoci({krilo:true,nalet:true,trag:true});place(q.x-70,1);tap('KeyV');ok(S().p.trag,'door: the trace left beside the door');
 api.keys.add('KeyA');for(let f=0;f<900&&S().p.x>sw.x;f++)step();api.keys.clear();step(2);ok(D.open>0&&S().p.trag,'door: walked back to the switch, the door is open and the trace still there');
 tap('KeyV');ok(Math.abs(S().p.x-(q.x-70))<3,'door: V brings Marko back beside the open door');
 api.keys.add('KeyD');for(let f=0;f<120;f++)step();api.keys.clear();ok(S().p.x>q.x+q.w&&D.solved,'door: through, and now it stays open behind him');
 api.keys.add('KeyA');for(let f=0;f<120;f++)step();api.keys.clear();ok(S().p.x<q.x,'door: and Marko can go back the way he came');}

// ---- hills and hollows: Marko walks along the slope, whatever its angle, and so do the foes ----
{const w=S().world,land=w.platforms.find(q=>q.surf&&q.x===0);setMoci({});
 ok(land&&Math.abs(physics.topAt(land,2975)-(F-130))<1&&Math.abs(physics.topAt(land,3500)-(F+80))<1,'slopes: the land is a slope: a hill 130px high in the Predvorje, a hollow 80px deep past it');
 const walk=(from,to,key,run)=>{place(from,key==='KeyD'?1:-1);api.keys.add(key);let off=0,air=0,lo=F,hi=F;for(let f=0;f<900&&(key==='KeyD'?S().p.x<to:S().p.x>to);f++){if(run&&f%110===5)api.pressed.add('ShiftLeft');step();const p=S().p;if(!p.grounded)air++;else off=Math.max(off,Math.abs(p.y-GB.gbGround(p.x)));lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);}api.keys.clear();step(2);return{off,air,lo,hi};};
 let r=walk(2560,3760,'KeyD');ok(r.air===0&&r.off<1.5&&r.lo<F-128&&r.hi>F+78,`slopes: walking right Marko goes up the hill and down into the hollow without leaving the ground (feet within ${r.off.toFixed(2)}px of the slope)`);
 r=walk(3760,2560,'KeyA');ok(r.air===0&&r.off<1.5&&r.lo<F-128,'slopes: and back the other way');
 r=walk(2560,3760,'KeyD',true);ok(r.air===0&&r.off<1.5,'slopes: rolling down and up the slopes keeps him on them too');
 place(2860,1);api.keys.add('KeyD');tap('Space');let landed=null;for(let f=0;f<240&&!landed;f++){step();const p=S().p;if(p.grounded&&f>5)landed={x:p.x,y:p.y};}api.keys.clear();step(2);
 ok(landed&&Math.abs(landed.y-GB.gbGround(landed.x))<1.5&&landed.y<F-10,`slopes: a jump onto the hillside lands on the slope (x ${Math.round(landed?.x)}, ${Math.round(F-landed?.y)}px above the floor)`);
 // a janičar in the hollow climbs the hill to Marko, standing on the slope the whole way
 const e={...w.enemies.find(e=>e.type==='sword'&&!e.champion),id:3999,x:3480,y:GB.gbGround(3480),alive:true,hp:90,maxHp:90,mode:'idle',timer:.2,stun:0,vx:0,vy:0,grounded:true,air:false};w.enemies.push(e);
 place(2960,-1);const p=S().p;p.y=GB.gbGround(2960);p.invuln=1e9;let off=0;for(let f=0;f<900&&Math.abs(e.x-p.x)>130;f++){step();p.invuln=1e9;if(e.grounded)off=Math.max(off,Math.abs(e.y-GB.gbGround(e.x)));}
 ok(Math.abs(e.x-p.x)<=130&&off<3,`slopes: a janičar walks up out of the hollow to Marko on the hillside (${Math.round(Math.abs(e.x-p.x))}px away, on the slope within ${off.toFixed(2)}px)`);e.alive=false;w.enemies.pop();}

// ---- a whole run, from the first room to the champion, with the secret room on the way ----
api.startGreybox();
{const w=S().world,G=w.gb,p=()=>S().p;for(const e of w.enemies)if(!e.champion)e.alive=false;p().invuln=1e9;
 const walk=(x,limit=3000)=>{const dir=x>p().x?1:-1,key=dir>0?'KeyD':'KeyA';api.keys.add(key);for(let f=0;f<limit&&(dir>0?p().x<x:p().x>x);f++){const P=p();if(P.grounded&&P.wallHit)api.pressed.add('Space');if(P.hang&&P.ledgeT>0&&f%6===0)api.pressed.add('KeyW');step();p().invuln=1e9;}api.keys.clear();step(4);return dir>0?p().x>=x:p().x<=x;};
 const camIn=()=>{const R=GB.GB_ROOMS[GB.gbRoomAt(p().x)],c=S().camera;return c>=R.x0-2&&c<=R.x1-api.VIEW_W+2;};
 ok(GB.GB_ROOMS[GB.gbRoomAt(p().x)].id==='predvorje','run: Marko starts in the Predvorje');
 const shrine=m=>G.shrines.find(s=>s.moc===m);
 ok(walk(shrine('krilo').x+30)&&G.moci.krilo,'run: through the Stražarnica to the Sokolova odaja; the wing is his');step(240);ok(camIn(),'run: the camera holds to the room Marko is in');
 // back for the secret, now that he has the wing
 const w1=gate(w,'krilo',1400),w2=gate(w,'krilo',6050);
 walk(w1.x+w1.w+300);ok(searchWall(w1,-1)&&walk(G.chest.x)&&G.secret,'run: back to the first wall, over it with the wing, and the secret room\'s chest');
 const hp=p().maxHp;ok(hp>=140,`run: the secret gives 20 more health (${hp})`);
 const back=GB.GB_ROOMS[1].x0+200;{const a=searchWall(w1,1);ok(a&&walk(back),'run: and out again over the same wall');}
 walk(w2.x-300);ok(searchWall(w2,1),'run: over the second wall into the Ponor');
 ok(walk(shrine('nalet').x+30)&&G.moci.nalet,'run: the dash is his');
 ok(leap({roll:null,jumpAt:0,k:72,n:16}),'run: across the abyss');
 ok(walk(shrine('trag').x+30)&&G.moci.trag,'run: in the Vilina odaja, the trace is his (the switch was on the way in)');
 {const q=G.door.q,sw=G.sw;walk(q.x-70);tap('KeyV');walk(sw.x);tap('KeyV');walk(q.x+q.w+120,400);ok(G.door.solved,'run: trace by the door, back to the switch, V, and through');}
 const ck=G.ckpts[1];walk(ck.x+5);ok(G.ckpt===2&&S().ckpt&&Math.abs(S().ckpt.x-ck.x)<1,'run: the second checkpoint in the Predsoblje');
 // a fall: Ravijojla brings him back to the last checkpoint
 p().invuln=0;api.damage(9999);for(let f=0;f<400&&S().mode==='play';f++)step();ok(S().mode==='dead','run: Marko falls');api.retry();ok(S().mode==='play'&&Math.abs(p().x-ck.x)<2,'run: and comes back at the checkpoint');p().invuln=1e9;
 const c=w.enemies.find(e=>e.champion);walk(c.arena.x0+200);ok(S().arena&&S().arena.boss===c,'run: in the last room the champion\'s megdan begins');
 c.hp=1;c.invT=0;c.guard=0;for(let f=0;f<600&&c.alive;f++){const P=p();P.face=c.x>P.x?1:-1;api.keys.clear();if(Math.abs(c.x-P.x)>90)api.keys.add(P.face>0?'KeyD':'KeyA');if(f%30===0){api.pressed.add('KeyK');api.keys.add('KeyK');}step();P.invuln=1e9;c.guard=0;if(c.hp>1&&c.alive)c.hp=1;}
 api.keys.clear();step(240);ok(!c.alive&&G.done,'run: the champion falls and the greybox is done');
 ok(G.seen.size===GB.GB_ROOMS.length,`run: every room was entered (${G.seen.size}/${GB.GB_ROOMS.length})`);
 ok(storage.get('marko-megdani')===undefined&&storage.get('marko-levels')===undefined,'run: the greybox wrote no megdan and no pohod into the save');}

// ---- outside the greybox nothing changed: the moves are there from the start ----
{api.startChapter(0);const p=S().p;p.invuln=99;tap('Space');step(30);tap('Space');ok(p.kriloUsed&&p.vy<-400,'story: in the Kačanik road the wing is there from the start, as before');}

console.log(`\n${checks} greybox checks passed`);
