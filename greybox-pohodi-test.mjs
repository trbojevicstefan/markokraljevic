// Lost Crown pohodi (index.html?greybox=4 i dalje, dist/greybox-nivoi-pohodi.js), bez glave i stvarnim tasterima:
// node greybox-pohodi-test.mjs [broj nivoa]. Za svaki pohod: mapa kao graf (sobe, tajne, čekpointi, borbe, likovi, zamke,
// kapije za moći; šta je dostižno sa moćima i bez njih), pa svaka veza između soba pređena stvarnim tasterima u oba smera,
// svaka veza koja traži moć probana i bez nje, put od početka do bosa kroz te veze, i na kraju megdan sa bosom.
// Pomoćnici za kretanje su isti kao u greybox-test.mjs. Ništa se ne upisuje u sačuvanu igru.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
import{GB_POHODI}from'./dist/greybox-nivoi-pohodi.js';
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
const BUDUCE=new Set(['klizanje','zid','lanac','oko']);   // moći iz lc-pokreti koje još ne postoje u greybox.js
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const S=()=>api.state(),P=()=>S().p,W=()=>S().world,G=()=>W().gb;
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const tap=k=>{api.pressed.add(k);api.keys.add(k);step();api.keys.delete(k);};
const quiet=()=>{for(const e of W().enemies)if(!e.champion)e.alive=false;};
const SVE_MOCI=['krilo','nalet','trag','klizanje','zidotrk','lanac','oko'];
const setMoci=m=>{const g=G();for(const k of new Set([...Object.keys(g.moci),...SVE_MOCI]))g.moci[k]=m.has(k);};
const top=(q,x)=>q.surf?physics.topAt(q,x):q.y;
// the platform Marko would stand on at x, its top nearest y
const platformAt=(x,y)=>W().platforms.filter(q=>!q.off&&x>=q.x&&x<=q.x+q.w&&Math.abs(top(q,x)-y)<160).sort((u,v)=>Math.abs(top(u,x)-y)-Math.abs(top(v,x)-y))[0];
const floorY=(x,y)=>{const q=platformAt(x,y);return q?top(q,x):y;};
const nodeAt=L=>GB.gbNodeAt(L,P().x,P().y);

// ---- moving Marko: set him down once, then only keys ----
// go(x): the bot walks to x with keys only. It jumps blocks and stakes, jumps holes (the wing at the top and the dash over a
// wide one, when Marko has them), waits at a pit for the beam that slides over it and rides it across, climbs a caught ledge.
const support=(x,y)=>W().platforms.some(q=>!q.off&&!q.gbWall&&x>=q.x&&x<=q.x+q.w&&Math.abs(top(q,x)-y)<=26);
function gapWidth(x,y,dir){for(let d=0;d<700;d+=10)if(support(x+dir*d,y))return d;return 999;}
function go(x,limit=3600){let air=0,wide=0,jumped=false;
 for(let f=0;f<limit;f++){const p=P();p.invuln=1e9;p.hp=p.maxHp;const dx=x-p.x;if(Math.abs(dx)<12&&p.grounded){api.keys.clear();step(4);return true;}
  const dir=dx>0?1:-1,key=dir>0?'KeyD':'KeyA',g=G();api.keys.delete(dir>0?'KeyA':'KeyD');api.keys.add(key);
  if(p.hang&&p.ledgeT>0&&f%6===0)api.pressed.add('KeyW');
  if(p.grounded){air=0;jumped=false;const ahead=p.x+dir*30,near=Math.abs(dx)<40;
   const beam=W().traps.find(t=>t.kind==='greda'&&p.on===t.q);
   if(beam){const q=beam.q,front=dir>0?q.x+q.w:q.x;if(!support(front+dir*24,p.y)||W().platforms.every(o=>o===q||o.off||!(front+dir*24>=o.x&&front+dir*24<=o.x+o.w&&Math.abs(top(o,front+dir*24)-p.y)<=26)))api.keys.delete(key);}
   else if(!near&&!support(ahead,p.y)){const w=gapWidth(ahead,p.y,dir),rail=W().traps.find(t=>t.kind==='greda'&&Math.abs(t.q.y-p.y)<30&&(dir>0?t.q.move.ax:t.q.move.ax+t.q.w)>=Math.min(ahead,ahead+dir*w)-40&&t.q.move.ax<=Math.max(ahead,ahead+dir*w)+40);
    if(rail&&!(g.moci.krilo&&w<380)&&!(g.moci.nalet&&g.moci.krilo))api.keys.delete(key);   // wait for the beam to come
    else{api.pressed.add('Space');jumped=true;wide=w;}}
   else if(p.wallHit||W().traps.some(t=>t.kind==='spikes'&&Math.abs(t.y-p.y)<12&&ahead+dir*50>t.x&&ahead<t.x+t.w+50&&dir*(t.x+t.w/2-p.x)>0)){api.pressed.add('Space');jumped=true;wide=0;}}
  else{air++;if(jumped&&g.moci.nalet&&wide>300&&air===12)api.pressed.add('ShiftLeft');if(jumped&&g.moci.krilo&&air===(wide>300?60:26))api.pressed.add('Space');}
  step();}
 api.keys.clear();step(4);return false;}
// the bot's run (NOTP): Marko is never set down; place() walks him there with keys and waits until he stands still
let NOTP=false;
function place(x,y,face=1){if(NOTP){go(x);const q=P();api.keys.clear();for(let i=0;i<120&&!(q.grounded&&Math.abs(q.vx)<5);i++){step();q.invuln=1e9;q.hp=q.maxHp;}return;}const p=P();Object.assign(p,{x,y:floorY(x,y),vx:0,vy:0,grounded:true,climb:null,hang:false,ledgeT:0,ledge:null,wall:0,attack:0,dash:0,airDash:false,kriloUsed:false,naletUsed:false,face,hp:p.maxHp,invuln:1e9,trag:null,cd:{},jumpBuffer:0,coyote:.12,plunge:0,down:0,hurt:0,slide:0,spin:0,throwT:0});api.keys.clear();api.pressed.clear();step(2);}
const walk=(x,limit=3000)=>{const dir=x>P().x?1:-1,key=dir>0?'KeyD':'KeyA';api.keys.add(key);for(let f=0;f<limit&&(dir>0?P().x<x:P().x>x);f++){const p=P();if(p.grounded&&p.wallHit)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)api.pressed.add('KeyW');step();P().invuln=1e9;}api.keys.clear();step(4);return dir>0?P().x>=x:P().x<=x;};
const settle=(n=240)=>{for(let f=0;f<n;f++){step();if(P().grounded&&f>20)break;}step(10);};
function climb(q,sx,sy,dir,jx,k){place(sx,sy,dir);const key=dir>0?'KeyD':'KeyA';api.keys.add(key);let jf=-1;const y0=P().y;
 for(let f=0;f<480;f++){const p=P();if(jf<0&&(dir>0?p.x>=jx:p.x<=jx)){jf=f;api.pressed.add('Space');}if(jf>=0&&f-jf===k)api.pressed.add('Space');if(p.hang&&p.ledgeT>0&&f%6===0)tap('KeyW');
  step();const Q=P();if(Q.grounded&&Math.abs(Q.y-q.y)<2&&Q.x>q.x&&Q.x<q.x+q.w){api.keys.clear();step(2);return true;}if(jf>=0&&f-jf>40&&Q.grounded&&Math.abs(Q.y-y0)<2)break;}
 api.keys.clear();step(2);return false;}
const BEST=new Map(),firstBest=(key,ds,ks)=>{const b=BEST.get(key),all=ds.flatMap(d=>ks.map(k=>({d,k})));return NOTP?(b?[b,b]:all.slice(0,6)):b?[b,...all]:all;};
function fromFloor(q,y,dir){const edge=dir>0?q.x:q.x+q.w,key=`${q.x}|${q.y}|${dir}`;for(const {d,k} of firstBest(key,[10,40,80,130,170,210],[8,14,20,26,32,38,44,50,56,999]))if(climb(q,edge-dir*(d+60),y,dir,edge-dir*d,k)){BEST.set(key,{d,k});return{d,k};}return null;}
function fromBlock(q,src,dir){const edge=dir>0?src.x+src.w:src.x,sx=src.x+src.w/2,key=`${q.x}|${q.y}|${dir}|${src.x}|${src.y}`;for(const {d,k} of firstBest(key,[2,12,25,45,70],[8,14,20,26,32,38,44,50,56,999]))if(climb(q,sx,src.y,dir,edge-dir*d,k)){BEST.set(key,{d,k});return{d,k};}return null;}
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
function walkLink(L,[a,b,need,one,how],moci,back=false){if(!NOTP){api.startGreybox(L.n);quiet();setMoci(moci);}const from=back?b:a,to=back?a:b;
 if(how.open&&!NOTP){const D=G().named[how.open];D.solved=true;D.q.off=true;}
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
 else if(how.slide||how.hook||how.zidrun||how.okom){const k=Object.keys(how)[0],[e0,f0,y,a0,b0]=how[k],near=back?f0:e0,far=back?e0:f0,after=back?b0:a0,dir=far>near?1:-1,key=dir>0?'KeyD':'KeyA';
  // klizanje: zalet i S pred niskim prolazom; lanac: skok sa ivice i C dvaput (dve kuke); zid: skok na zid sa šarama i SPACE na kraju; oko: drži O i pređi skrivene daske
  if(k==='okom'){place(near-dir*150,y,dir);api.keys.add('KeyO');const ok2=go(after);api.keys.delete('KeyO');if(!ok2)return false;}
  else{place(near-dir*(k==='hook'?350:k==='zidrun'?300:320),y,dir);api.keys.add(key);let jf=-1,done=false;
   for(let f=0;f<900;f++){const p=P();
    if(k==='slide'){if(jf<0&&dir*(p.x-(near-dir*110))>=0){jf=f;api.pressed.add('KeyS');}}
    else if(jf<0&&dir*(p.x-(near-dir*10))>=0){jf=f;api.pressed.add('Space');}
    if(k==='hook'&&jf>=0&&(f-jf===12||f-jf===102))api.pressed.add('KeyC');
    if(k==='zidrun'&&p.zidotrk&&p.zidotrk.t<.05)api.pressed.add('Space');
    step();const Q=P();Q.invuln=1e9;if(Q.grounded&&dir*(Q.x-far)>10&&Math.abs(Q.y-y)<3){done=true;break;}if(Q.y>y+200)break;if(k==='slide'&&jf>=0&&f-jf>200)break;}
   api.keys.clear();step(2);if(!done)return false;walk(after,900);}}
 else if(how.trace){const [name,stand]=how.trace,D=G().named[name];if(moci.has('trag')){if(!traced(D,{x:stand[0],y:stand[1]}))return false;api.keys.add(D.sw.x<D.q.x?'KeyD':'KeyA');for(let f=0;f<300&&!D.solved;f++)step();api.keys.clear();step(150);}else{const r=race(D);if(r.through)return true;return false;}}
 return nodeAt(L)===to;}


const POHODI=Object.keys(GB_POHODI).map(Number);
ok(POHODI.every(n=>GB.GB_LEVELS[n]===GB_POHODI[n])&&POHODI.every(n=>!GB.GB_LEVELS[n]||n>3),`${POHODI.length} pohoda su u spisku greybox nivoa, posle tri nivoa iz greybox-nivoi.js`);
for(const n of POHODI){if(ONLY&&n!==ONLY)continue;const L=GB.gbLevel(n),all=new Set([...(L.pocetne||[]),L.daje,...(L.daje2?[L.daje2]:[])]),before=new Set(L.pocetne||[]);
 const nodesAll=new Set(L.links.flatMap(l=>[l[0],l[1]])),roomsOf=list=>new Set(list.map(x=>L.delovi?.[x]?.room||GB.gbNodeRoom(x))),secret=L.rooms.filter(R=>R.secret).map(R=>R.id);
 const tag=`${n} ${L.id}:`,N=L.broj;
 // ---- the map as a graph ----
 ok(L.rooms.length>=18&&L.rooms.length<=25,`${tag} ${L.rooms.length} soba na ${(L.Y1-L.Y0)/GB.GB_CH} sprata, ${(L.X1-L.X0)} px široko`);
 ok(secret.length>=3,`${tag} ${secret.length} tajne sobe (${secret.join(', ')})`);
 {const ids=new Set();for(const R of L.rooms){assert(!ids.has(R.id),`${tag} soba ${R.id} dvaput`);ids.add(R.id);}
  for(const A of L.rooms)for(const B of L.rooms)if(A!==B&&A.x0<B.x1&&B.x0<A.x1&&A.y0<B.y1&&B.y0<A.y1)assert.fail(`${tag} sobe ${A.id} i ${B.id} se preklapaju`);ok(true,`${tag} sobe se ne preklapaju i imena su jedinstvena`);}
 api.startGreybox(n);{const g=G();ok(g.ckpts.length>=2&&g.cuda.length>=1&&g.hearts.length>=1,`${tag} ${g.ckpts.length} čekpointa, ${g.hearts.length} dela srca, ${g.cuda.length} čuda`);
  const foes=W().enemies.filter(e=>!e.champion),boss=W().enemies.find(e=>e.champion);ok(N.borbe>=4&&N.borbe<=6&&foes.length>=8&&boss,`${tag} ${N.borbe} borbi (${foes.length} Turaka po sobama) i bos ${boss?.name}`);
  ok(N.likovi>=2&&W().traps.filter(t=>t.kind==='lik'||t.kind==='guslar').length===N.likovi,`${tag} ${N.likovi} lika iz pesme (guslar i ljudi sa svojom rečju)`);
  ok(N.zamke>=2&&W().traps.some(t=>t.kind==='strelnica')&&W().traps.some(t=>t.kind==='greda'),`${tag} zamke iz zamke.js: strelnice i grede (${N.zamke}), uz šiljke, ponore i daske koje popuštaju`);
  for(const m of all)ok(N[m]>=1,`${tag} kapije za ${m}: ${N[m]}`);
  ok(Object.entries(g.moci).every(([k,v])=>v===before.has(k)),`${tag} Marko kreće sa ${[...before].join(', ')||'bez moći'}, a ovde nalazi ${L.daje}`);}
 ok(roomsOf(GB.gbReach(L,all)).size===L.rooms.length&&GB.gbReach(L,all).length===nodesAll.size,`${tag} sa ${[...all].join(' i ')} u svaku sobu se ulazi`);
 {const shut=L.rooms.map(R=>R.id).filter(id=>!roomsOf(GB.gbReach(L,before)).has(id));ok(shut.length>0&&!GB.gbReach(L,before).includes(L.links.find(l=>l[2]===L.daje)[1]),`${tag} bez ${L.daje} ostaju zatvorene: ${shut.join(', ')}`);
  ok(shut.includes(L.bosSoba),`${tag} do bosa (${L.bosSoba}) se ne stiže bez ${L.daje}`);
  ok(secret.some(id=>shut.includes(id))&&secret.some(id=>!shut.includes(id)),`${tag} neke tajne čekaju ${L.daje} (${secret.filter(id=>shut.includes(id)).join(', ')}), druge oštro oko (${secret.filter(id=>!shut.includes(id)).join(', ')})`);}
 {const S0=G().shrines.find(s=>s.moc===L.daje),shrineRoom=L.rooms[GB.gbRoomAt(L,S0.x,S0.y)].id;ok(roomsOf(GB.gbReach(L,before)).has(shrineRoom),`${tag} ${L.daje} čeka u sobi ${shrineRoom}, do koje se stiže i bez nje`);}
 // ---- the second power (lc-pokreti): an altar, at least two challenges, and a secret that waits for it ----
 if(L.daje2){const M2=L.daje2,no2=new Set([...all].filter(m=>m!==M2)),reach2=GB.gbReach(L,no2),r2=roomsOf(reach2),shutN=[...nodesAll].filter(x=>!reach2.includes(x)),shutR=L.rooms.map(R=>R.id).filter(id=>!r2.has(id));
  ok(N[M2]>=2&&shutN.length>=3,`${tag} ${GB.GB_MOCI[M2].name}: ${N[M2]} izazova; bez nje se ne stiže u ${shutN.join(', ')}`);
  ok(secret.some(id=>shutR.includes(id)),`${tag} tajna koja traži ${GB.GB_MOCI[M2].name}: ${secret.filter(id=>shutR.includes(id)).join(', ')}`);
  const al=G().shrines.find(s=>s.moc===M2),alRoom=al&&L.rooms[GB.gbRoomAt(L,al.x,al.y)].id;ok(al&&r2.has(alRoom)&&roomsOf(GB.gbReach(L,before)).has(alRoom),`${tag} oltar za ${GB.GB_MOCI[M2].name} je u sobi ${alRoom}, do koje se stiže bez nje i bez ${L.daje}`);
  const w=W();ok((M2!=='lanac'||w.kuke?.length>=4)&&(M2!=='zidotrk'||w.zidovi?.length>=2)&&(M2!=='oko'||w.platforms.filter(q=>q.oko).length>=4)&&(M2!=='klizanje'||w.platforms.filter(q=>q.lintel).length>=2)&&w.nalazi?.length>=1&&w.platforms.some(q=>q.iluzija),
   `${tag} u svetu: ${M2==='lanac'?w.kuke.length+' kuke':M2==='zidotrk'?w.zidovi.length+' zida sa šarama':M2==='oko'?w.platforms.filter(q=>q.oko).length+' skrivene daske':w.platforms.filter(q=>q.lintel).length+' niska prolaza'}, ${w.nalazi.length} amajlija na tlu, zid koji je varka; ${G().ckpts.length} izvora za odmor i putovanje`);}
 // ---- every passage with real input ----
 const walked=new Set();
 for(const link of L.links){const [a,b,need,one,how]=link,kind=Object.keys(how)[0],withAll=new Set([...all,'posle']);
  ok(walkLink(L,link,withAll),`${tag} ${a} → ${b} (${kind}${need?', '+need:''})`);walked.add(a+'>'+b);
  if(!one){ok(walkLink(L,link,withAll,true),`${tag} ${b} → ${a} (${kind})`);walked.add(b+'>'+a);}
  if(need&&GB.GB_MOCI[need]&&!how.drop){const less=new Set([...withAll].filter(m=>m!==need));ok(!walkLink(L,link,less),`${tag} bez ${need} ${a} → ${b} ostaje zatvoreno`);}
  if(need?.startsWith('posle:'))ok(!walkLink(L,link,new Set(all)),`${tag} ${a} → ${b} je zatvoreno dok se kapija ne otvori iz ${need.slice(6)}`);}
 // ---- the way to the boss: a chain of walked passages from the start, the power picked up on the way ----
 {const bossNode=GB.gbNode(L,L.bosSoba,GB.gbRoom(L,L.bosSoba).gy+GB.gbRoom(L,L.bosSoba).h-1),shrineNode=GB.gbNodeAt(L,G().shrines[0].x,G().shrines[0].y);
  const path=(from,to,moci)=>{const prev=new Map([[from,null]]),q=[from];while(q.length){const u=q.shift();if(u===to)break;for(const [a,b,need,one] of L.links){const okN=!need||moci.has(need)||(need.startsWith('posle:')&&prev.has(need.slice(6)));if(!okN)continue;for(const [x,y] of one?[[a,b]]:[[a,b],[b,a]])if(x===u&&!prev.has(y)&&walked.has(x+'>'+y)){prev.set(y,u);q.push(y);}}}
   if(!prev.has(to))return null;const out=[];for(let v=to;v;v=prev.get(v))out.unshift(v);return out;};
  const p1=path(L.start,shrineNode,before),p2=path(shrineNode,bossNode,all);
  ok(p1&&p2,`${tag} bot: ${p1?.join(' → ')} (${L.daje}) → ${p2?.slice(1).join(' → ')}`);}
 // ---- the boss: the bot walks up to him (Đemo first knocks the mace away: the bot picks it up) and strikes ----
 {api.startGreybox(n);quiet();setMoci(all);const c=W().enemies.find(e=>e.champion),A=c.arena;place(A.x0+60,A.y,1);walk(A.x0+200);ok(S().arena&&S().arena.boss===c,`${tag} megdan sa ${c.name} počinje`);
  c.hp=1;c.invT=0;for(let f=0;f<1800&&c.alive;f++){const p=P(),tx=c.topuz?c.topuz.x:c.x;p.face=tx>p.x?1:-1;api.keys.clear();if(Math.abs(tx-p.x)>(c.topuz?20:90))api.keys.add(p.face>0?'KeyD':'KeyA');if(p.grounded&&p.wallHit)api.pressed.add('Space');if(f%30===0){api.pressed.add('KeyK');api.keys.add('KeyK');}step();p.invuln=1e9;c.guard=0;if(c.hp>1&&c.alive)c.hp=1;}
  api.keys.clear();step(240);ok(!c.alive&&G().done,`${tag} ${c.name} pada i pohod je pređen`);}
 // ---- the bot: one unbroken run with keys only, from the start to the power and on to the boss (the land's foes are
 // taken out, its traps stay); after each passage it looks where it is and picks the next one, so a fall only changes its way ----
 {api.startGreybox(n);quiet();NOTP=true;const g=G(),S0=g.shrines.find(s=>s.moc===L.daje),trail=[];let falls=0,ok2=false;
  const bossNode=GB.gbNode(L,L.bosSoba,GB.gbRoom(L,L.bosSoba).gy+GB.gbRoom(L,L.bosSoba).h-1),shrineNode=GB.gbNodeAt(L,S0.x,S0.y);
  const failed=new Map(),usable=(l,from)=>{const [a,b,need,one,how]=l,fwd=from===a;if(!fwd&&one)return false;if((failed.get(l)||0)>=2)return false;if(need&&GB.GB_MOCI[need]&&!g.moci[need])return false;
   if(need?.startsWith('posle:')&&fwd){const A=GB.gbRoom(L,how.door[0]),gt=g.gates.find(o=>Math.abs(o.q.x-(A.x1-60))<2);if(!gt?.open)return false;}
   if(how.open&&!g.named[how.open].solved)return false;return walked.has((fwd?a:b)+'>'+(fwd?b:a));};
  const plan=(from,to)=>{const prev=new Map([[from,null]]),q=[from];while(q.length){const u=q.shift();if(u===to)break;for(const l of L.links)for(const [x,y] of [[l[0],l[1]],[l[1],l[0]]])if(x===u&&!prev.has(y)&&usable(l,u))prev.set(y,{u,l});q.push(...[...prev.keys()].filter(k=>!q.includes(k)&&k!==u&&prev.get(k)?.u===u));}
   if(!prev.has(to))return null;let v=to,first=null;while(prev.get(v)){first=prev.get(v);v=first.u;}return first;};
  for(let i=0;i<90;i++){const at=nodeAt(L),goal=S0.taken?bossNode:shrineNode;if(trail.at(-1)!==at)trail.push(at);
   if(at===goal){if(!S0.taken){go(S0.x);if(!S0.taken)break;continue;}ok2=true;break;}
   const nx=plan(at,goal);if(!nx)break;const {l}=nx,back=l[1]===at;const y0=P().y,t0=Date.now();walkLink(L,l,new Set(Object.keys(g.moci).filter(k=>g.moci[k])),back);const end=nodeAt(L);
   if(end!==(back?l[0]:l[1])){failed.set(l,(failed.get(l)||0)+1);if(P().y>y0+300)falls++;}if(process.env.BOT_LOG)console.log('  bot',at,back?'<-':'->',back?l[0]:l[1],Object.keys(l[4])[0],'=>',end,Date.now()-t0,'ms');}
  NOTP=false;ok(ok2&&S0.taken,`${tag} bot bez teleporta: ${trail.join(' → ')}${falls?` (${falls} pada usput)`:''}`);
  if(ok2){const c=W().enemies.find(e=>e.champion);go(c.arena.x0+200);ok(S().arena&&S().arena.boss===c,`${tag} bot je stigao u arenu: ${c.name}`);}}
 ok(storage.get('marko-megdani')===undefined&&storage.get('marko-levels')===undefined,`${tag} ništa nije upisano u sačuvanu igru`);}
console.log(`
${checks} provera Lost Crown pohoda prošlo`);
