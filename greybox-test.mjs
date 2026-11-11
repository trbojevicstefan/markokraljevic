// The greybox level "Markove kule" (index.html?greybox), headless and with real input: node greybox-test.mjs
// Every room can be reached once its powers are collected, and every locked passage stays shut without its power:
// the tower's ledges and the pillar to the Golubarnik without the falcon's wing, both abysses without the air dash
// (even with the wing), the door and the trapdoor without the fairy's trace. The hidden rooms open the way they should:
// the cracked wall to a heavy blow only, the fake wall to a walk, the shortcut gate from its far side only.
// Then a whole run from the first room to the champion through every room, all five secrets included.
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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startGreybox,startChapter,update,keys,pressed,has,retry,damage,VIEW_W,state:()=>({p,world,mode,level,zone,arena,ckpt,camera,camY})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
const GB=physics.greybox,X=GB.X,F=590,FC=1310,FT=-130;
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const S=()=>api.state(),P=()=>S().p,W=()=>S().world,G=()=>W().gb;
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const tap=k=>{api.pressed.add(k);api.keys.add(k);step();api.keys.delete(k);};
const roomOf=()=>GB.GB_ROOMS[GB.gbRoomAt(P().x,P().y)]?.id;
const plat=(x,y)=>W().platforms.find(q=>!q.off&&x>=q.x&&x<=q.x+q.w&&Math.abs((q.surf?physics.topAt(q,x):q.y)-y)<2);
const quiet=()=>{for(const e of W().enemies)if(!e.champion)e.alive=false;};
const setMoci=m=>Object.assign(G().moci,{krilo:false,nalet:false,trag:false},m);

// ---- the map as a graph: the long level, its powers, its hidden rooms ----
{const all=new Set(['krilo','nalet','trag']),ids=GB.GB_ROOMS.map(R=>R.id),secret=GB.GB_ROOMS.filter(R=>R.secret).map(R=>R.id);
 const rooms=n=>new Set(n.map(x=>GB.GB_NODE_ROOM[x]||x));
 ok(ids.length>=15&&secret.length===5,`map: ${ids.length} rooms on three floors, ${secret.length} of them hidden (${secret.join(', ')})`);
 ok(GB.GB_X1-GB.GB_X0>=16000,`map: ${GB.GB_X1-GB.GB_X0} px from end to end`);
 ok(rooms(GB.gbReach(all)).size===ids.length,'map: holding all three powers, every room can be entered');
 let have=new Set(),order=[];for(let k=0;k<5;k++){const r=GB.gbReach(have);for(const [moc,room] of Object.entries(GB.GB_SHRINES))if(r.includes(room)&&!have.has(moc)){have.add(moc);order.push(moc);}}
 ok(order.join(' ')==='krilo nalet trag'&&rooms(GB.gbReach(have)).size===ids.length,'map: starting with nothing, each power waits in a room the ones before it open: '+order.join(', '));
 ok(!GB.gbReach(new Set()).includes('kula'),'map: with no power Marko only gets as far as the bottom of the tower');
 for(const moc of all){const less=new Set([...all].filter(m=>m!==moc)),shut=ids.filter(id=>!rooms(GB.gbReach(less)).has(id));ok(shut.length>0,`map: without ${moc} these stay shut: ${shut.join(', ')}`);}
 ok(['golubarnik','riznica','kapela'].every(id=>!GB.gbReach(new Set()).includes(id))&&!GB.gbReach(new Set(['krilo'])).includes('riznica')&&!GB.gbReach(new Set(['krilo','nalet'])).includes('kapela'),'map: three hidden rooms ask for a power found later, so Marko comes back for them');}

// ---- the start: no wing, no dash, no trace; the wall jump and the fairy's lift are off in the greybox ----
api.startGreybox();quiet();
{const {level}=S(),p=P();
 ok(level.greybox&&roomOf()==='podgradje'&&Object.values(G().moci).every(v=>!v),'start: Marko is in the Podgrađe with none of the three powers');
 ok(!api.has('zid')&&!api.has('uzlet')&&api.has('niz')&&api.has('kolut'),'start: he has his blows and the roll, but not the wall jump nor the fairy\'s lift');
 p.invuln=99;tap('Space');step(30);const v=p.vy;tap('Space');ok(!p.kriloUsed&&p.vy>v,'start: Space in the air does nothing yet');step(120);
 tap('Space');step(20);tap('ShiftLeft');ok(!p.airDash&&!p.naletUsed,'start: Shift in the air does nothing yet');step(120);
 tap('KeyV');ok(!p.trag,'start: V leaves no trace yet');}

// ---- helpers: real input only; Marko is set down at the start of an attempt and then only keys move him ----
function place(x,y,face=1){const p=P();Object.assign(p,{x,y,vx:0,vy:0,grounded:true,climb:null,hang:false,ledgeT:0,ledge:null,wall:0,attack:0,dash:0,airDash:false,kriloUsed:false,naletUsed:false,face,hp:p.maxHp,invuln:1e9,trag:null,cd:{},jumpBuffer:0,coyote:.12,plunge:0,down:0,hurt:0,slide:0,spin:0,throwT:0});api.keys.clear();api.pressed.clear();step(2);}
// a climb: run from (sx,sy), jump at jx, the wing k frames later, W when hanging; true when Marko stands on q
function climb(q,sx,sy,dir,jx,k){place(sx,sy,dir);const key=dir>0?'KeyD':'KeyA';api.keys.add(key);let jf=-1;
 for(let f=0;f<480;f++){const p=P();if(jf<0&&(dir>0?p.x>=jx:p.x<=jx)){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===k)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)tap('KeyW');
  step();const Q=P();if(Q.grounded&&Math.abs(Q.y-q.y)<2&&Q.x>q.x&&Q.x<q.x+q.w){api.keys.clear();step(2);return true;}if(jf>=0&&f-jf>40&&Q.grounded&&Math.abs(Q.y-sy)<2)break;}
 api.keys.clear();step(2);return false;}
// from the floor at y to a block q above it, approached from the side `dir`
function fromFloor(q,y,dir){const edge=dir>0?q.x:q.x+q.w;for(const d of[10,40,80,130,170,210])for(const k of[8,14,20,26,32,38,44,50,56,999])if(climb(q,edge-dir*(d+60),y,dir,edge-dir*d,k))return{d,k};return null;}
// from the top of block src to block q, off src's edge toward q
function fromBlock(q,src,dir){const edge=dir>0?src.x+src.w:src.x,sx=src.x+src.w/2;for(const d of[2,12,25,45,70])for(const k of[8,14,20,26,32,38,44,50,56,999])if(climb(q,sx,src.y,dir,edge-dir*d,k))return{d,k};return null;}
// across an abyss: run, a roll at a set distance, a jump, the wing and the dash on set frames; true when Marko stands past it
function leap(z,dir,y,{roll,jumpAt,k,n}){const near=dir>0?z.x0:z.x1,far=dir>0?z.x1:z.x0;place(near-dir*560,y,dir);const key=dir>0?'KeyD':'KeyA';api.keys.add(key);let jf=-1,rolled=false;
 for(let f=0;f<520;f++){const p=P();if(roll!=null&&!rolled&&dir*(p.x-(near-dir*roll))>=0){rolled=true;api.pressed.add('ShiftLeft');}
  if(jf<0&&dir*(p.x-(near+dir*jumpAt))>=0){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===k)api.pressed.add('Space');if(jf>=0&&n!=null&&f-jf===n)api.pressed.add('ShiftLeft');
  step();const Q=P();if(Q.grounded&&dir*(Q.x-far)>-17&&Math.abs(Q.y-y)<1){api.keys.clear();step(2);return true;}if(jf>=0&&Q.grounded&&dir*(Q.x-near)<0)break;if(Q.y>y+100)break;}
 api.keys.clear();step(30);return false;}
const noDash=(z,dir,y)=>{for(const roll of[null,80,160])for(const jumpAt of[-15,0,10])for(let k=60;k<=110;k+=2)if(leap(z,dir,y,{roll,jumpAt,k,n:null}))return true;return false;};
const walk=(x,limit=3000)=>{const dir=x>P().x?1:-1,key=dir>0?'KeyD':'KeyA';api.keys.add(key);for(let f=0;f<limit&&(dir>0?P().x<x:P().x>x);f++){const p=P();if(p.grounded&&p.wallHit)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)api.pressed.add('KeyW');step();P().invuln=1e9;}api.keys.clear();step(4);return dir>0?P().x>=x:P().x<=x;};
// run toward x past a hole, jumping when Marko reaches `at`
const hop=(at,x)=>{const dir=x>P().x?1:-1,key=dir>0?'KeyD':'KeyA';api.keys.add(key);let jumped=false;for(let f=0;f<900&&(dir>0?P().x<x:P().x>x);f++){if(!jumped&&dir*(P().x-at)>=0){jumped=true;tap('Space');api.keys.add(key);}step();}api.keys.clear();step(4);return dir>0?P().x>=x:P().x<=x;};
const block=(x,y)=>W().platforms.find(q=>q.solid&&!q.surf&&Math.abs(q.y-y)<1&&x>=q.x&&x<=q.x+q.w);
const pitAt=x=>G().pits.find(z=>x>z.x0-5&&x<z.x1+5);

// ---- the falcon's wing: the tower's ledges and the ledge under the Golubarnik ----
{quiet();const L1=block(6600,955),P1=block(X.pillar+50,225),S3=block(1700,FT);
 ok(L1&&P1&&S3&&FC-L1.y>266&&F-P1.y>266,`wing: the tower's first ledge stands ${FC-L1.y}px over the tower floor, the ledge ${F-P1.y}px over the Podgrađe`);
 setMoci({});ok(!fromFloor(L1,FC,1),'wing: without it no run-up, jump or ledge grab gets onto the tower\'s first ledge (60 tries)');
 ok(!fromFloor(P1,F,1),'wing: nor onto the ledge under the Golubarnik');
 setMoci({krilo:true});const a=fromFloor(L1,FC,1);ok(a,`wing: with it Marko climbs onto the first ledge (jump ${a?.d}px off it, wing ${a?.k} frames later)`);
 ok(fromFloor(P1,F,1)&&fromBlock(S3,P1,-1),'wing: and onto the ledge, then up through the hole into the Golubarnik');}
// ---- the air dash: the cellar's abyss to the Riznica (westward) and the broken bridge (eastward) ----
{quiet();const z4=pitAt(X.gap4+10),zm=pitAt(X.pit+10);
 ok(z4&&zm&&z4.x1-z4.x0===GB.GB_GAP&&zm.x1-zm.x0===GB.GB_GAP,`dash: both abysses are ${GB.GB_GAP}px wide`);
 setMoci({krilo:true});ok(!noDash(zm,1,F),'dash: with the wing but no dash, 234 runs at the broken bridge all fall short');
 ok(!noDash(z4,-1,FC),'dash: and 234 runs at the cellar\'s abyss to the Riznica');
 setMoci({krilo:true,nalet:true});ok(leap(zm,1,F,{roll:null,jumpAt:0,k:72,n:16}),'dash: a plain run-up, jump at the edge, the dash, then the wing: across the bridge');
 ok(leap(z4,-1,FC,{roll:null,jumpAt:0,k:72,n:16}),'dash: and across the cellar into the Riznica');
 let n=0;for(let k=56;k<=96;k+=8)for(let d=8;d<=40;d+=8)if(leap(zm,1,F,{roll:null,jumpAt:0,k,n:d}))n++;ok(n>=4,`dash: not a frame-perfect trick: ${n} of 30 wing/dash timings make it`);}
// ---- the fairy's trace: the door of the Vilina odaja and the trapdoor to the Kapela ----
function race(D,toX){const q=D.q;place(D.sw.x,F,toX>D.sw.x?1:-1);step(2);const opened=D.open>0&&q.off;api.keys.add(toX>D.sw.x?'KeyD':'KeyA');let through=false;
 for(let f=0;f<720;f++){const p=P();if(p.x>toX+40){api.keys.clear();step();continue;}if(p.grounded&&f%10===0)api.pressed.add(f%40===0?'ShiftLeft':'Space');if(!p.grounded&&f%12===0)api.pressed.add(p.naletUsed?'Space':'ShiftLeft');step();const Q=P();if(D.floor?(Q.y>q.y+q.h+30&&Q.x>q.x-30&&Q.x<q.x+q.w+30):Q.x>q.x+q.w)through=true;}
 api.keys.clear();step(2);return{opened,through};}
function traced(D,stand){const q=D.q;place(stand,F,1);tap('KeyV');const left=!!P().trag;api.keys.add(stand>D.sw.x?'KeyA':'KeyD');for(let f=0;f<1100&&Math.abs(P().x-D.sw.x)>20;f++)step();api.keys.clear();step(2);
 const open=D.open>0;tap('KeyV');const back=Math.abs(P().x-stand)<3;return{left,open,back};}
{quiet();const [Dv,Dk]=G().doors;
 setMoci({krilo:true,nalet:true});let r=race(Dv,X.door+200);ok(r.opened&&!r.through&&!Dv.q.off,`trace: without it the Vilina door shuts (${GB.GB_DOOR}s) long before Marko gets there from the switch, ${X.door-X.sw1}px away`);
 r=race(Dk,X.trap+60);ok(r.opened&&!r.through&&!Dk.q.off,`trace: and so does the trapdoor to the Kapela, ${X.trap-X.sw2}px from its switch`+(r.opened&&!r.through&&!Dk.q.off?'':` [${JSON.stringify(r)} off ${Dk.q.off} at ${Math.round(P().x)},${Math.round(P().y)} ${roomOf()}]`));
 setMoci({krilo:true,nalet:true,trag:true});let t=traced(Dv,X.door-70);ok(t.left&&t.open&&t.back,'trace: trace by the door, back to the switch, V: Marko is beside the open door');
 api.keys.add('KeyD');step(120);api.keys.clear();ok(P().x>X.door+44&&Dv.solved,'trace: through, and the door stays open behind him');
 t=traced(Dk,X.trap+60);step(90);ok(t.left&&t.open&&t.back&&roomOf()==='kapela'&&Dk.solved,'trace: trace on the trapdoor, switch, V: Marko drops into the Kapela');}
// ---- the hidden ways in: the cracked wall, the fake wall, the shortcut gate ----
{quiet();const b=W().breakables.find(b=>b.kind==='zid');place(110,F,-1);
 for(let i=0;i<6;i++){tap('KeyJ');step(50);}ok(!b.broken&&b.hp===b.hp0,'cracked wall: light blows only ring off it');
 for(let i=0;i<8&&!b.broken;i++){tap('KeyK');step(80);}ok(b.broken,'cracked wall: heavy blows (K) bring it down');
 ok(walk(-560)&&roomOf()==='vinski-podrum','cracked wall: and the Vinski podrum lies behind it');
 place(7000,FC,1);ok(walk(7700)&&roomOf()==='celija'&&G().fakes[0].found,'fake wall: Marko walks through the bottom of the tower\'s wall into the Tajna ćelija');
 const g=G().gate;place(3500,F,1);walk(3700,240);ok(!g.open&&P().x<X.gate,'shortcut: from the Stražarnica the gate stays shut');
 place(3900,F,-1);ok(walk(3500)&&g.open,'shortcut: from the Prolaz Marko passes its lever, it opens, and he walks through into the Stražarnica');}
// ---- an abyss costs health and puts Marko back on firm ground; the planks give way under him ----
{quiet();place(3640,FC,1);P().invuln=0;const hp=P().hp;api.keys.add('KeyD');step(70);api.keys.clear();step(240);const p=P();
 ok(p.hp<hp&&p.grounded&&p.x<X.crumble+20&&Math.abs(p.y-FC)<1,`abyss: the planks gave way, Marko fell, lost ${hp-p.hp} health and stands again before the pit`+(p.grounded&&p.x<X.crumble+20&&Math.abs(p.y-FC)<1?"":` [${Math.round(p.x)},${Math.round(p.y)} ${p.grounded}]`));}

// ---- hills and hollows: Marko walks along the slope, whatever its angle, and so do the foes ----
{quiet();setMoci({});
 const go=(from,to,key,run)=>{place(from,GB.gbGround(from),key==='KeyD'?1:-1);api.keys.add(key);let off=0,air=0,lo=F,hi=F;for(let f=0;f<1200&&(key==='KeyD'?P().x<to:P().x>to);f++){if(run&&f%110===5)api.pressed.add('ShiftLeft');step();const p=P();if(!p.grounded)air++;else off=Math.max(off,Math.abs(p.y-GB.gbGround(p.x)));lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);}api.keys.clear();step(2);return{off,air,lo,hi};};
 let r=go(3900,5800,'KeyD');ok(r.air===0&&r.off<1.5&&r.lo<F-68&&r.hi>F+58,`slopes: across the Prolaz Marko goes up a hill and down into a hollow without leaving the ground (feet within ${r.off.toFixed(2)}px)`);
 r=go(5800,3900,'KeyA');ok(r.air===0&&r.off<1.5,'slopes: and back the other way');
 r=go(3900,5800,'KeyD',true);ok(r.air===0&&r.off<1.5,'slopes: rolling down and up keeps him on them too');
 const e={...W().enemies.find(e=>e.type==='sword'&&!e.champion),id:3999,x:5300,y:GB.gbGround(5300),alive:true,hp:90,maxHp:90,mode:'idle',timer:.2,stun:0,vx:0,vy:0,grounded:true,air:false};W().enemies.push(e);
 place(4800,GB.gbGround(4800),1);const p=P();let off=0;for(let f=0;f<900&&Math.abs(e.x-p.x)>130;f++){step();p.invuln=1e9;if(e.grounded)off=Math.max(off,Math.abs(e.y-GB.gbGround(e.x)));}
 ok(Math.abs(e.x-p.x)<=130&&off<3,`slopes: a janičar climbs out of the hollow to Marko (${Math.round(Math.abs(e.x-p.x))}px away, on the slope within ${off.toFixed(2)}px)`);e.alive=false;W().enemies.pop();}

// ---- the whole level, from the Podgrađe to the champion, through every room and all five secrets ----
api.startGreybox();
{quiet();const g=G(),p=P;p().invuln=1e9;const shrine=m=>g.shrines.find(s=>s.moc===m);
 ok(walk(2900)&&roomOf()==='strazarnica','run: out of the Podgrađe into the Stražarnica');
 ok(walk(3050)&&(step(120),roomOf()==='podrum'),'run: down the hole into the Podrum');
 walk(3800);{api.keys.add('KeyD');let jumped=false;for(let f=0;f<240;f++){if(!jumped&&p().x>3830){jumped=true;tap('Space');api.keys.add('KeyD');}step();}api.keys.clear();step(4);}
 ok(p().x>4100&&Math.abs(p().y-FC)<1,'run: over the planks that give way, jumping from one to the next');
 ok(walk(4800)&&walk(shrine('krilo').x+30)&&g.moci.krilo&&roomOf()==='tamnica','run: under the low vault into the Sokolova tamnica: the wing is his');
 ok(g.ckpt===2,'run: and the tamnica\'s checkpoint is his last');
 walk(6250);const L1=block(6600,955),RM=block(7100,F),LM=block(6100,F),L2=block(6600,235),TR=block(7100,FT);
 ok(fromFloor(L1,FC,1)&&fromBlock(RM,L1,1)&&roomOf()==='kula','run: up the tower shaft, ledge by ledge, to the main road');
 ok(fromBlock(LM,L1,-1)&&walk(5900)&&roomOf()==='prolaz','run: west into the Prolaz');
 ok(walk(3500)&&g.gate.open&&walk(3260)&&hop(X.drop+205,1900)&&roomOf()==='podgradje','run: through the shortcut gate, over the hole in the Stražarnica, back to the Podgrađe');
 {const b=W().breakables[0];place(110,F,-1);for(let i=0;i<8&&!b.broken;i++){tap('KeyK');step(80);}ok(b.broken&&walk(-600)&&g.found.has('vinski-podrum'),'run: secret 1, the Vinski podrum behind the cracked wall');}
 {const P1=block(X.pillar+50,225),S3=block(1700,FT);ok(fromFloor(P1,F,1)&&fromBlock(S3,P1,-1)&&walk(1700)&&g.found.has('golubarnik'),'run: secret 2, the Golubarnik above the start, with the wing');}
 place(5900,GB.gbGround(5900),1);ok(walk(6200)&&fromBlock(L2,LM,1)&&fromBlock(TR,L2,1)&&walk(7400)&&roomOf()==='bedem','run: up the tower to the ramparts');
 ok(walk(X.hole6-120)&&hop(X.hole6-25,shrine('nalet').x+30)&&g.moci.nalet,'run: along the ramparts, over the merlons and the hole: the dash is his');
 ok(walk(X.hole6+75)&&(step(150),roomOf()==='dvoriste'),'run: back and down the hole into the Dvorište');
 ok(walk(X.ck3)&&g.ckpt===3,'run: the Dvorište\'s checkpoint');
 ok(walk(9900)&&leap(pitAt(X.pit+10),1,F,{roll:null,jumpAt:0,k:72,n:16})&&walk(12100)&&roomOf()==='vilina','run: across the broken bridge into the Vilina odaja');
 ok(walk(shrine('trag').x+30)&&g.moci.trag,'run: the trace is his');
 {const D=g.doors[0];traced(D,X.door-70);ok(walk(X.door+200)&&D.solved,'run: trace by the door, back to the switch, and through');}
 ok(walk(X.ck4+5)&&g.ckpt===4&&roomOf()==='predsoblje','run: the Predsoblje\'s checkpoint');
 // a fall: Ravijojla brings him back to the last checkpoint
 p().invuln=0;api.damage(9999);for(let f=0;f<400&&S().mode==='play';f++)step();ok(S().mode==='dead','run: Marko falls');api.retry();ok(S().mode==='play'&&Math.abs(p().x-X.ck4)<2,'run: and comes back at the checkpoint');p().invuln=1e9;
 // the three secrets left behind: the cellar across the abyss, the cell behind the fake wall, the chapel under the trapdoor
 ok(leap(pitAt(X.gap4+10),-1,FC,{roll:null,jumpAt:0,k:72,n:16})&&walk(1800)&&g.found.has('riznica'),'run: secret 3, the Riznica across the cellar\'s abyss, with the dash');
 place(7000,FC,1);ok(walk(7800)&&g.found.has('celija'),'run: secret 4, the Tajna ćelija through the fake wall');
 {const D=g.doors[1];traced(D,X.trap+60);step(90);ok(g.found.has('kapela'),'run: secret 5, the Kapela under the trapdoor, with the trace');
  const K=block(9075,955),up=W().platforms.find(q=>q.ground&&q.x===X.trap+120);ok(walk(8700)&&fromFloor(K,FC,1)&&fromBlock(up,K,1)&&roomOf()==='dvoriste','run: and out again, up through the open trapdoor with the wing');}
 ok(g.hearts.every(h=>h.taken)&&p().maxHp>=170,`run: all five pieces of heart are his (${p().maxHp} health)`);
 const c=W().enemies.find(e=>e.champion);place(X.arena0-200,F,1);ok(walk(c.arena.x0+200)&&S().arena&&S().arena.boss===c,'run: in the last room the champion\'s megdan begins');
 c.hp=1;c.invT=0;for(let f=0;f<600&&c.alive;f++){const P2=p();P2.face=c.x>P2.x?1:-1;api.keys.clear();if(Math.abs(c.x-P2.x)>90)api.keys.add(P2.face>0?'KeyD':'KeyA');if(f%30===0){api.pressed.add('KeyK');api.keys.add('KeyK');}step();P2.invuln=1e9;c.guard=0;if(c.hp>1&&c.alive)c.hp=1;}
 api.keys.clear();step(240);ok(!c.alive&&g.done,'run: the champion falls and Markove kule are done');
 ok(g.seen.size===GB.GB_ROOMS.length&&g.found.size===5,`run: every room was entered (${g.seen.size}/${GB.GB_ROOMS.length}), every secret found (${g.found.size}/5)`);
 ok(storage.get('marko-megdani')===undefined&&storage.get('marko-levels')===undefined,'run: the greybox wrote no megdan and no pohod into the save');}

// ---- outside the greybox nothing changed: the moves are there from the start ----
{api.startChapter(0);const p=P();p.invuln=99;tap('Space');step(30);tap('Space');ok(p.kriloUsed&&p.vy<-400,'story: on the Kačanik road the wing is there from the start, as before');}

console.log(`\n${checks} greybox checks passed`);
