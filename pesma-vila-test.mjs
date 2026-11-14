// Plays „Marko Kraljević i vila” in Ravijojla's forest from the first verse to the last, headless: node pesma-vila-test.mjs
// The ride with Miloš, his song to the gusle (J and K in time), the two white arrows, the chase on Šarac (sighted, the leap,
// the mace), Marko over the vila, the herbs as the vila (answering Marko, thorns, falcons), the healing, the ride on with
// Miloš on his own horse, and Miloš on foot beside Marko. Every step must lead on: nothing may stall the song.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
storage.set('marko-moci',JSON.stringify(['trag','kombo','potres','oko','krilo','lanac','nalet','gaz','zidotrk']));
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,vilaTu,state:()=>({p,world,mode,level,horseMounted}),pesma:()=>pesma,jahanje:jahanjeTrap,potera:poteraTrap,draw:()=>{try{draw(1/60);}catch(e){return e;}return null;}};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
const step=(n=1)=>{for(let i=0;i<n;i++){const {p}=api.state();p.invuln=99;p.hp=p.maxHp;api.update(1/120);}};
const press=k=>{api.keys.add(k);api.pressed.add(k);};const release=k=>api.keys.delete(k);
const tap=k=>{press(k);step();release(k);};
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const until=(cond,maxSteps,msg)=>{for(let i=0;i<maxSteps;i++){if(cond())return i;step();}assert(false,'stalled: '+msg);};

await api.startLevel(api.LEVELS.findIndex(L=>L.id==='suma'),'day');api.keys.clear();api.pressed.clear();
const {world}=api.state();for(const e of world.enemies)e.alive=false;
const J=api.jahanje(),T=api.potera();
ok(J&&T&&J.x1<=T.x0&&J.x0<T.x0,'forest: the song opens the land, the ride comes before the chase');
step(10);
ok(api.state().horseMounted&&J.milos&&J.milos.st==='jase','ride: Marko is on Šarac and Miloš rides beside him');

// ---- the ride: D, Space over the two logs; the verses come by the road ----
press('KeyD');
until(()=>{const {p,world}=api.state();const b=world.barriers.find(b=>b.horse&&b.x>p.x&&b.x-p.x<150);if(b&&p.grounded)tap('Space');return api.pesma()?.ph==='peva';},120*60,'the ride to the song');
release('KeyD');
ok(J.said===5,'ride: the five verses of the ride were sung (the brothers, side by side, sleep, the vila\'s threat, Marko\'s answer)');
ok(Math.abs(J.milos.x-(api.state().p.x+130))<120,'ride: Miloš kept beside Marko, a length ahead');
ok(api.state().p.dremlje,'song: Marko sleeps in the saddle while Miloš sings');

// ---- Miloš sings: J and K on the beat of the gusle ----
let hits=0;
until(()=>{const P=api.pesma();if(!P||P.ph!=='peva')return true;if(P.sing==='milos')for(const n of P.notes)if(!n.st&&Math.abs(n.at-P.rt)<.02){tap(n.lane?'KeyK':'KeyJ');hits++;break;}return false;},120*90,'Miloš\'s song');
ok(hits===24,`song: three strophes of 6, 8 and 10 notes, every one sung (${hits})`);
ok(api.pesma()?.ph==='strele','song: the vila, outsung, takes up her bow');

// ---- the two white arrows; Marko wakes and leaves the saddle ----
until(()=>J.ph==='potera',120*25,'the arrows and Marko waking');
ok(J.milos.st==='lezi'&&!api.state().horseMounted&&!api.state().p.dremlje,'arrows: Miloš lies wounded, Marko is awake and on his feet');
ok(Math.abs(T.sx-api.state().p.x)<120,'arrows: Šarac stands by Marko, where he left the saddle');

// ---- the chase: E onto Šarac; she is unseen, then sighted; the leap; the mace ----
{const {p}=api.state();p.x=T.sx;p.grounded=true;}tap('KeyE');
ok(T.state==='trka'&&api.state().horseMounted,'chase: E onto Šarac\'s shoulders');
press('KeyD');let leapt=0,thrown=false;
until(()=>{const {p,world}=api.state();
 if(T.canLeap&&!T.reach){tap('Space');leapt++;}
 const b=world.barriers.find(b=>b.horse&&b.x>p.x&&b.x-p.x<150);if(b&&p.grounded)tap('Space');
 if(T.reach&&!thrown){tap('KeyI');thrown=true;}return T.state==='pala'||T.state==='bije';},120*90,'the chase');
release('KeyD');
ok(T.sagleda&&T.vila.vid>=1,'chase: first nowhere to be seen, then Šarac sights her');
ok(leapt>=1,`chase: Šarac's leap of three lances (${leapt})`);
until(()=>T.state==='bije',120*6,'the vila falling');
ok(!api.state().horseMounted&&T.saracX!=null,'mace: she falls, Marko comes down from the saddle and Šarac stands by');

// ---- Marko over the vila: J three times, then her oath ----
for(let i=0;i<3;i++){step(90);tap('KeyJ');}
ok(T.bije.hits===3,'vila: three blows with the mace, three verses');
until(()=>api.pesma()?.ph==='bilje',120*14,'the vila\'s oath');
ok(T.state==='bilje'&&J.ph==='bilje','vila: she swears by God and Saint John, and Marko lets her go into the mountain');

// ---- the herbs, played as the vila ----
const P=api.pesma();const V=P.V;
ok(P.bilje.length===5&&P.bilje.some(b=>b.za==='za grlo')&&P.bilje.some(b=>b.za==='za srce'),'herbs: five of them, for the throat and for the heart among them');
const fly=(x,y)=>{V.x=x;V.y=y;V.vx=0;V.vy=0;step(2);};
fly(P.bilje[0].x,P.bilje[0].y-20);ok(P.nabrano===1,'herbs: flying into one gathers it');
// answering: let her forget, then she is pulled back and loses the last herb
P.odziv=1;step(30);ok(P.vraca>0&&P.nabrano===0,'herbs: a vila who does not answer is called back and drops a herb');
until(()=>!(P.vraca>0),120*3,'the pull back');
tap('KeyQ');ok(P.odziv>99&&P.bubble>0,'herbs: Q — “Sad ću doći, Bogom pobratime!”');
// thorns push her up and cost her breath
{const R=P.trnje[0];P.odziv=80;fly(R.x,R.y-40);ok(P.odziv<75&&V.vy<0,'herbs: the thorns push her up');}
{const b=P.bilje[0];P.odziv=100;fly(b.x,b.y-20);ok(!b.taken,'herbs: the dropped herb cannot be snatched up again at once');}
for(let i=0;i<300;i++){P.odziv=100;step();}   // a little later it can
for(const b of P.bilje){P.odziv=100;fly(b.x,b.y-20);}
ok(P.nabrano===5,'herbs: all five gathered');
{const M=J.milos;fly(M.x,M.y-60);tap('KeyE');}
ok(api.pesma()?.ph==='leci','healing: E by Miloš');
// the falcons were there to slip
ok(P.sokoli.length===2,'herbs: the hunter\'s two falcons circle the crags');

// ---- the healing and the ride on ----
until(()=>J.ph==='jase2'&&!api.pesma(),120*14,'the healing');
ok(T.done&&api.vilaTu(),'healing: the vila is Marko\'s sworn sister from now on');
ok(api.state().horseMounted&&J.milos.st==='jase2','ride on: Marko on Šarac, Miloš on his own horse');
ok(world.enemies.filter(e=>e.lovac&&e.alive).length===5,'ride on: the Turkish hunters come down on the road');
{const {p}=api.state();const e=world.enemies.find(e=>e.lovac&&e.alive);J.milos.x=e.x-60;J.milos.cd=0;const hp=e.hp;p.x=e.x-200;step(3);ok(e.hp<hp||!e.alive,'ride on: Miloš strikes from the saddle');}
for(const e of world.enemies)if(e.lovac)e.alive=false;
// to the end of the road: on foot, Miloš beside Marko
{const {p}=api.state();p.x=T.x1-240;p.y=T.y;}step(3);
ok(J.ph==='pesice'&&!api.state().horseMounted&&J.milos.st==='pesice','forest: the horses are led, Miloš walks beside Marko');
{const {p}=api.state();p.x=T.x1+300;p.y=T.y;p.grounded=true;step(120);ok(Math.abs(J.milos.x-p.x)<260,'companion: Miloš keeps up with Marko');
 const foe={id:9999,x:J.milos.x+60,y:J.milos.y,vx:0,vy:0,w:36,h:75,hp:200,maxHp:200,type:'sword',zone:world.enemies[0]?.zone??0,face:-1,mode:'idle',timer:9,stun:0,flash:0,alive:true,home:J.milos.x+60,attackId:0,grounded:true};world.enemies.push(foe);
 J.milos.cd=0;step(3);ok(foe.hp<200,'companion: Miloš cuts at a foe beside him');foe.alive=false;
 p.x+=2000;step(4);ok(Math.abs(J.milos.x-p.x)<200,'companion: left far behind, he comes up behind Marko');}
ok(!api.state().world.barriers.some(b=>b.x>T.x0&&b.x<T.x1&&!b.horse),'forest: nothing blocks the road after the song');
// every phase draws without an error
ok(api.draw()===null,'drawing: the forest after the song draws without an error');
console.log(`\n${checks} checks passed.`);
