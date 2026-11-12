// The Lost Crown-style levels (index.html?greybox=1|2|3), headless and with real input: node greybox-test.mjs
// For every level: the map as a graph (how many rooms, secrets, checkpoints; what each power opens), then every passage
// between rooms walked with real input in both directions where it goes both ways: doors, holes, the wing's ledges,
// chimneys climbed wall to wall, cracked and fake walls, shortcut gates, abysses for the dash, doors for the trace.
// Each passage that asks for a power is also tried without it, and must not let Marko through.
// Then the level's boss falls and the level is done. Nothing is written into the save.
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
const GB=physics.greybox,ONLY=process.argv[2]?+process.argv[2]:0;
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const S=()=>api.state(),P=()=>S().p,W=()=>S().world,G=()=>W().gb;
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const tap=k=>{api.pressed.add(k);api.keys.add(k);step();api.keys.delete(k);};
const quiet=()=>{for(const e of W().enemies)if(!e.champion)e.alive=false;};
const setMoci=m=>{const g=G();for(const k of Object.keys(g.moci))g.moci[k]=m.has(k);};
const top=(q,x)=>q.surf?physics.topAt(q,x):q.y;
// the platform Marko would stand on at x, its top nearest y
const platformAt=(x,y)=>W().platforms.filter(q=>!q.off&&x>=q.x&&x<=q.x+q.w&&Math.abs(top(q,x)-y)<160).sort((u,v)=>Math.abs(top(u,x)-y)-Math.abs(top(v,x)-y))[0];
const floorY=(x,y)=>{const q=platformAt(x,y);return q?top(q,x):y;};
const nodeAt=L=>GB.gbNodeAt(L,P().x,P().y);

// ---- moving Marko: set him down once, then only keys ----
function place(x,y,face=1){const p=P();Object.assign(p,{x,y:floorY(x,y),vx:0,vy:0,grounded:true,climb:null,hang:false,ledgeT:0,ledge:null,wall:0,attack:0,dash:0,airDash:false,kriloUsed:false,naletUsed:false,face,hp:p.maxHp,invuln:1e9,trag:null,cd:{},jumpBuffer:0,coyote:.12,plunge:0,down:0,hurt:0,slide:0,spin:0,throwT:0});api.keys.clear();api.pressed.clear();step(2);}
const walk=(x,limit=3000)=>{const dir=x>P().x?1:-1,key=dir>0?'KeyD':'KeyA';api.keys.add(key);for(let f=0;f<limit&&(dir>0?P().x<x:P().x>x);f++){const p=P();if(p.grounded&&p.wallHit)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)api.pressed.add('KeyW');step();P().invuln=1e9;}api.keys.clear();step(4);return dir>0?P().x>=x:P().x<=x;};
const settle=(n=240)=>{for(let f=0;f<n;f++){step();if(P().grounded&&f>20)break;}step(10);};
function climb(q,sx,sy,dir,jx,k){place(sx,sy,dir);const key=dir>0?'KeyD':'KeyA';api.keys.add(key);let jf=-1;const y0=P().y;
 for(let f=0;f<480;f++){const p=P();if(jf<0&&(dir>0?p.x>=jx:p.x<=jx)){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===k)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)tap('KeyW');
  step();const Q=P();if(Q.grounded&&Math.abs(Q.y-q.y)<2&&Q.x>q.x&&Q.x<q.x+q.w){api.keys.clear();step(2);return true;}if(jf>=0&&f-jf>40&&Q.grounded&&Math.abs(Q.y-y0)<2)break;}
 api.keys.clear();step(2);return false;}
function fromFloor(q,y,dir){const edge=dir>0?q.x:q.x+q.w;for(const d of[10,40,80,130,170,210])for(const k of[8,14,20,26,32,38,44,50,56,999])if(climb(q,edge-dir*(d+60),y,dir,edge-dir*d,k))return{d,k};return null;}
function fromBlock(q,src,dir){const edge=dir>0?src.x+src.w:src.x,sx=src.x+src.w/2;for(const d of[2,12,25,45,70])for(const k of[8,14,20,26,32,38,44,50,56,999])if(climb(q,sx,src.y,dir,edge-dir*d,k))return{d,k};return null;}
// a chimney: two walls 150 px apart, climbed wall to wall from the floor under it
function chimney(C,y){place((C.x0+C.x1)/2,y,1);let dir=1;for(let i=0;i<120*12;i++){const p=P();api.keys.delete(dir>0?'KeyA':'KeyD');api.keys.add(dir>0?'KeyD':'KeyA');
  if(p.grounded&&p.y>C.top+20){tap('Space');continue;}if(p.wall){dir=-p.wall;tap('Space');continue;}step();if(P().grounded&&P().y<=C.top+2)break;}
 api.keys.clear();step(4);return P().grounded&&P().y<=C.top+2;}
// across an abyss: a run, the jump, the wing and the dash on set frames
function leap(z,dir,y,{roll,jumpAt,k,n}){const near=dir>0?z.x0:z.x1,far=dir>0?z.x1:z.x0;place(near-dir*560,y,dir);const key=dir>0?'KeyD':'KeyA';api.keys.add(key);let jf=-1,rolled=false;
 for(let f=0;f<520;f++){const p=P();if(roll!=null&&!rolled&&dir*(p.x-(near-dir*roll))>=0){rolled=true;api.pressed.add('ShiftLeft');}
  if(jf<0&&dir*(p.x-(near+dir*jumpAt))>=0){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===k)api.pressed.add('Space');if(jf>=0&&n!=null&&f-jf===n)api.pressed.add('ShiftLeft');
  step();const Q=P();if(Q.grounded&&dir*(Q.x-far)>-17&&Math.abs(Q.y-y)<1){api.keys.clear();step(2);return true;}if(jf>=0&&Q.grounded&&dir*(Q.x-near)<0)break;if(Q.y>y+100)break;}
 api.keys.clear();step(30);return false;}
const noDash=(z,dir,y)=>{for(const roll of[null,80,160])for(const jumpAt of[-15,0,10])for(let k=60;k<=110;k+=2)if(leap(z,dir,y,{roll,jumpAt,k,n:null}))return true;return false;};
// a door or trapdoor on a switch: the trace left beside it, back to the switch, V
function race(D){const q=D.q;place(D.sw.x,D.sw.y,D.sw.x<q.x?1:-1);step(2);const opened=D.open>0&&q.off,toX=q.x+q.w/2;api.keys.add(toX>D.sw.x?'KeyD':'KeyA');let through=false;
 for(let f=0;f<900;f++){const p=P();if(Math.abs(p.x-toX)<30){api.keys.clear();step();continue;}if(p.grounded&&f%10===0)api.pressed.add(f%40===0?'ShiftLeft':'Space');if(!p.grounded&&f%12===0)api.pressed.add(p.naletUsed?'Space':'ShiftLeft');step();if(D.solved)through=true;}
 api.keys.clear();step(2);return{opened,through};}
function traced(D,stand){const q=D.q;place(stand.x,stand.y,1);tap('KeyV');const left=!!P().trag;api.keys.add(stand.x>D.sw.x?'KeyA':'KeyD');for(let f=0;f<1100&&Math.abs(P().x-D.sw.x)>20;f++){const p=P();if(p.grounded&&p.wallHit)api.pressed.add('Space');step();}api.keys.clear();step(2);
 const open=D.open>0;tap('KeyV');return left&&open;}

// one passage, walked with the powers in `moci`; true when Marko ends up in its far node
function walkLink(L,[a,b,need,one,how],moci,back=false){api.startGreybox(L.n);quiet();setMoci(moci);const from=back?b:a,to=back?a:b;
 if(how.open){const D=G().named[how.open];D.solved=true;D.q.off=true;}
 if(how.door){const [ra,rb,row,dop={}]=how.door,sa=dop.sa||200,sb=dop.sb||200,A=GB.gbRoom(L,ra),Bb=GB.gbRoom(L,rb),y=(row+1)*GB.GB_CH-GB.GB_FL,ltr=(L.delovi?.[from]?.room||GB.gbNodeRoom(from))===ra;
  if(need?.startsWith('posle:')&&!back&&moci.has('posle')){place(Bb.x0+400,y,-1);walk(A.x1-400);}
  if(ltr){place(A.x1-sa,y,1);walk(Bb.x0+sb,900);}else{place(Bb.x0+sb,y,-1);walk(A.x1-sa,900);}}
 else if(how.drop){const [r,dx0,dx1]=how.drop,R=GB.gbRoom(L,r);place(R.x0+dx0-140,R.floor,1);walk(R.x0+dx0+40,600);settle(400);}
 else if(how.hop){const [x0,edge,x1]=back?how.back:how.hop,dir=x1>x0?1:-1;place(x0,floorY(x0,590),dir);api.keys.add(dir>0?'KeyD':'KeyA');let jf=-1;
  for(let f=0;f<600&&dir*(P().x-x1)<0;f++){const p=P();if(jf<0&&dir*(p.x-(edge-dir*15))>=0){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===30)api.pressed.add('Space');step();if(P().y>700)break;}api.keys.clear();settle(60);}
 else if(how.walk){const [x,y,x1]=back&&how.back?how.back:how.walk;place(x,y,x1>x?1:-1);walk(x1,1200);settle(how.wait||60);}
 else if(how.up){let prev=null;for(const st of how.up){if(st[0]==='floor'){const [,y,dir,t]=st,q=platformAt(...t);if(!q||!fromFloor(q,y,dir))return false;prev=q;}else{const [s,t,dir]=st,src=platformAt(...s),q=platformAt(...t);if(!src||!q||!fromBlock(q,src,dir))return false;prev=q;}}}
 else if(how.chimney){const [name,exitX]=how.chimney,C=G().named[name];if(!chimney(C,floorY((C.x0+C.x1)/2,C.bottom+150)))return false;{const dir=exitX>P().x?1:-1;api.keys.add(dir>0?'KeyD':'KeyA');step(2);tap('Space');api.keys.add(dir>0?'KeyD':'KeyA');step(60);api.keys.clear();}walk(exitX,900);}
 else if(how.break){const [name,x,y,x1]=how.break,b=G().named[name];place(x,y,x1>x?1:-1);for(let i=0;i<10&&!b.broken;i++){tap('KeyK');step(80);}if(!b.broken)return false;if(back){walk(x1,900);place(x1,y,x1>x?-1:1);walk(x,900);}else walk(x1,900);}
 else if(how.leap){const [name,dir,y,after,before]=how.leap,z=G().named[name],d=back?-dir:dir;if(moci.has('nalet')){if(!leap(z,d,y,{roll:null,jumpAt:0,k:72,n:16}))return false;walk(back?before:after,900);settle(60);}else return noDash(z,d,y);}
 else if(how.trace){const [name,stand]=how.trace,D=G().named[name];if(moci.has('trag')){if(!traced(D,{x:stand[0],y:stand[1]}))return false;api.keys.add(D.sw.x<D.q.x?'KeyD':'KeyA');for(let f=0;f<300&&!D.solved;f++)step();api.keys.clear();step(150);}else{const r=race(D);if(r.through)return true;return false;}}
 else if(how.slide){const [x0,y,x1]=back?(how.back||[how.slide[2],how.slide[1],how.slide[0]]):how.slide,dir=x1>x0?1:-1,key=dir>0?'KeyD':'KeyA';place(x0,y,dir);api.keys.add(key);step(40);
  api.keys.add('KeyS');api.pressed.add('ShiftLeft');step(2);api.keys.delete('KeyS');for(let f=0;f<700&&dir*(P().x-x1)<0;f++){step();if(f>60&&Math.abs(P().vx)<1)break;}api.keys.clear();settle(60);}
 else if(how.zid){const [x0,y,jx,x1,kk]=back&&how.back?how.back:how.zid,dir=x1>x0?1:-1,key=dir>0?'KeyD':'KeyA';place(x0,y,dir);api.keys.add(key);let jf=-1,wj=-1;
  for(let f=0;f<1000;f++){const p=P();if(jf<0&&dir*(p.x-jx)>=0){jf=f;api.pressed.add('Space');}if(p.zidotrk&&p.zidotrk.t<.12&&wj<0){wj=f;api.pressed.add('Space');}if(wj>=0&&kk&&f-wj===kk)api.pressed.add('Space');
   step();if(jf>=0&&f-jf>20&&P().grounded)break;if(P().y>y+300)break;}api.keys.clear();settle(60);}
 else if(how.kuka){const K=back&&how.back?how.back:how.kuka,[x0,y]=K.from,dir=K.to>x0?1:-1,h0=G().named[K.hooks[0][0]];place(x0,y,h0.x>=x0?1:-1);
  // the chain to each hook in turn (after its wait in steps), then on toward `to` until Marko stands again
  for(const [name,wait,turn] of K.hooks){if(turn)api.keys.add(turn>0?'KeyD':'KeyA');step(wait||0);tap('KeyC');for(let f=0;f<240&&(P().lanac||f<4);f++)step();}
  api.keys.add(dir>0?'KeyD':'KeyA');for(let g=0;g<500;g++){step();if(P().grounded&&g>6)break;}api.keys.clear();settle(60);}
 else if(how.oko){const [x0,y,x1,jumps=[]]=back&&how.back?how.back:how.oko,dir=x1>x0?1:-1;place(x0,y,dir);api.keys.add('KeyO');api.pressed.add('KeyO');step(4);api.keys.add(dir>0?'KeyD':'KeyA');const done=new Map();
  for(let f=0;f<1200&&dir*(P().x-x1)<0;f++){const p=P();for(const [jx,k] of jumps){if(!done.has(jx)&&p.grounded&&dir*(p.x-jx)>=0)done.set(jx,f),api.pressed.add('Space');if(done.get(jx)!=null&&k&&f-done.get(jx)===k)api.pressed.add('Space');}step();if(P().y>y+260)break;}
  api.keys.clear();settle(60);}
 return nodeAt(L)===to;}

// the three levels of greybox-nivoi.js (the registered pohodi have greybox-pohodi-test.mjs)
for(const [n,L0] of Object.entries(GB.GB_LEVELS)){if(+n>3||ONLY&&+n!==ONLY)continue;const L=GB.gbLevel(n),all=new Set([...(L.pocetne||[]),L.daje,...(L.daje2||[])]),before=new Set(L.pocetne||[]);
 const nodesAll=new Set(L.links.flatMap(l=>[l[0],l[1]])),roomsOf=list=>new Set(list.map(x=>L.delovi?.[x]?.room||GB.gbNodeRoom(x))),secret=L.rooms.filter(R=>R.secret).map(R=>R.id);
 const tag=`${n} ${L.id}:`;
 // ---- the map as a graph ----
 ok(L.rooms.length>=20&&L.rooms.length<=30,`${tag} ${L.rooms.length} rooms over ${(L.Y1-L.Y0)/GB.GB_CH} floors, ${(L.X1-L.X0)} px wide`);
 ok(secret.length>=2,`${tag} ${secret.length} hidden rooms (${secret.join(', ')})`);
 api.startGreybox(+n);{const g=G();ok(g.ckpts.length>=2&&g.cuda.length>=1,`${tag} ${g.ckpts.length} checkpoints, ${g.hearts.length} pieces of heart, ${g.cuda.length} marvels`);
  const foes=W().enemies.filter(e=>!e.champion),boss=W().enemies.find(e=>e.champion);ok(foes.length>=8&&boss,`${tag} ${foes.length} foes in the rooms and a boss (${boss?.name})`);
  ok(Object.entries(g.moci).every(([k,v])=>v===before.has(k)),`${tag} Marko starts with ${[...before].join(', ')||'no power'}, and finds ${[L.daje,...(L.daje2||[])].join(', ')} here`);}
 ok(roomsOf(GB.gbReach(L,all)).size===L.rooms.length&&GB.gbReach(L,all).length===nodesAll.size,`${tag} holding ${[...all].join(' and ')}, every room can be entered`);
 {const notDaje=new Set([...all].filter(m=>m!==L.daje)),shut=L.rooms.map(R=>R.id).filter(id=>!roomsOf(GB.gbReach(L,notDaje)).has(id));ok(shut.length>0&&!GB.gbReach(L,notDaje).includes(L.links.find(l=>l[2]===L.daje)[1]),`${tag} without ${L.daje} these stay shut: ${shut.join(', ')}`);
  ok(secret.some(id=>shut.includes(id))&&secret.some(id=>!shut.includes(id)),`${tag} some secrets wait for ${L.daje} (${secret.filter(id=>shut.includes(id)).join(', ')}), others for a sharp eye (${secret.filter(id=>!shut.includes(id)).join(', ')})`);}
 // every power of the level waits where Marko gets without it (with the others he can find there)
 for(const m of [L.daje,...(L.daje2||[])]){const sh=G().shrines.find(s=>s.moc===m),shrineRoom=L.rooms[GB.gbRoomAt(L,sh.x,sh.y)].id;ok(roomsOf(GB.gbReach(L,new Set([...all].filter(x=>x!==m)))).has(shrineRoom),`${tag} ${m} waits in ${shrineRoom}, which Marko reaches without it`);}
 // ---- every passage with real input ----
 for(const link of L.links){const [a,b,need,one,how]=link,kind=Object.keys(how)[0],withAll=new Set([...all,'posle']);
  ok(walkLink(L,link,withAll),`${tag} ${a} → ${b} (${kind}${need?', '+need:''})`);
  if(!one)ok(walkLink(L,link,withAll,true),`${tag} ${b} → ${a} (${kind})`);
  if(need&&(GB.GB_MOCI[need]||GB.GB_KAPIJE.includes(need))&&!how.drop){const less=new Set([...withAll].filter(m=>m!==need));ok(!walkLink(L,link,less),`${tag} without ${need} ${a} → ${b} stays shut`);}
  // an abyss under a runed wall: not even the best leap with the wing and the dash crosses it
  if((how.zid||how.oko)&&how.pit){const y=(how.zid||how.oko)[1],z=(api.startGreybox(L.n),quiet(),setMoci(new Set([...withAll].filter(m=>m!==need))),G().named[how.pit]);ok(!leap(z,1,y,{roll:null,jumpAt:0,k:72,n:16})&&!leap(z,-1,y,{roll:null,jumpAt:0,k:72,n:16}),`${tag} ${how.pit} (${z.x1-z.x0} px) is too wide for the wing and the dash`);}
  if(need?.startsWith('posle:'))ok(!walkLink(L,link,new Set(all)),`${tag} ${a} → ${b} stays shut until the gate is opened from ${need.slice(6)}`);}
 // ---- the boss ----
 {api.startGreybox(+n);quiet();setMoci(all);const c=W().enemies.find(e=>e.champion),A=c.arena;place(A.x0+60,A.y,1);walk(A.x0+200);ok(S().arena&&S().arena.boss===c,`${tag} the megdan with ${c.name} begins`);
  {const x=c.x;c.x=A.x0-120;step(2);ok(c.x>=A.x0+20,`${tag} ${c.name} cannot leave the arena through its doorway`);c.x=x;step(2);}
  c.hp=1;c.invT=0;for(let f=0;f<900&&c.alive;f++){const p=P();p.face=c.x>p.x?1:-1;api.keys.clear();if(Math.abs(c.x-p.x)>90)api.keys.add(p.face>0?'KeyD':'KeyA');if(f%30===0){api.pressed.add('KeyK');api.keys.add('KeyK');}step();p.invuln=1e9;c.guard=0;if(c.hp>1&&c.alive)c.hp=1;}
  api.keys.clear();step(240);ok(!c.alive&&G().done,`${tag} ${c.name} falls and the level is done`);}
 ok(storage.get('marko-megdani')===undefined&&storage.get('marko-levels')===undefined,`${tag} nothing was written into the save`);}

// ---- the pohodi 4–19 (dist/greybox-nivoi-pohodi.js, registered as in the browser): every shrine gives its power ----
if(!ONLY||ONLY>3){let pohodi={};try{pohodi=(await import('./dist/greybox-nivoi-pohodi.js')).GB_POHODI||{};}catch{}GB.gbRegister(pohodi);
 const given=[],wrong=[];for(const n of Object.keys(pohodi)){if(ONLY&&+n!==ONLY)continue;api.startGreybox(+n);quiet();
  for(const s of G().shrines){const before=!!G().moci[s.moc];place(s.x-60,s.y,1);walk(s.x+20,300);step(10);(s.taken&&G().moci[s.moc]===true&&!before?given:wrong).push(`${n}:${s.moc}`);}}
 ok(given.length>0&&wrong.length===0,`pohodi: every shrine gives its power (${given.length}: ${given.join(' ')})${wrong.length?' — not: '+wrong.join(' '):''}`);}
// ---- hills and hollows: Marko walks along the slope ----
if(!ONLY||ONLY===1){const L=GB.gbLevel(1);api.startGreybox(1);quiet();const R=GB.gbRoom(L,'varos'),qs=W().platforms.filter(q=>q.surf&&q.x<R.x1&&q.x+q.w>R.x0),under=x=>qs.find(q=>x>=q.x&&x<=q.x+q.w);
 place(R.x0+450,R.floor,1);api.keys.add('KeyD');let off=0,air=0,lo=1e9,hi=-1e9;for(let f=0;f<900&&P().x<R.x0+1000;f++){step();const p=P();if(!p.grounded)air++;else{const q=under(p.x);off=Math.max(off,Math.abs(p.y-(q?physics.topAt(q,p.x):R.floor)));}lo=Math.min(lo,p.y);hi=Math.max(hi,p.y);}api.keys.clear();
 ok(qs.length===2&&air===0&&off<1.5&&hi>R.floor+45,`slopes: Marko walks down into the Varoš hollow and out again without leaving the ground (within ${off.toFixed(2)}px)`);}
// ---- outside the greybox nothing changed: the moves are there from the start ----
{api.startChapter(0);const p=P();p.invuln=99;tap('Space');step(30);tap('Space');ok(p.kriloUsed&&p.vy<-400,'story: on the Kačanik road the wing is there from the start, as before');}
console.log(`\n${checks} greybox checks passed`);
