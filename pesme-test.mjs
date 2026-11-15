// The songs' set pieces in the pohodi, headless: node pesme-test.mjs
// Kosovsko selo: the horse fair where Marko takes horses by the tail and the scabby piebald foal does not budge (Šarac).
// Manastirski vis: after the judgment the king chases Marko thrice round the white church of Samodreža (Uroš i Mrnjavčevići).
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
{let s=(+process.env.SEED||1)>>>0;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{ok:true,json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,presuda,slay,slova:()=>sabljaSlova,state:()=>({p,world,mode}),draw:()=>{try{draw(1/60);}catch(e){return e;}return null;}};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
const step=(n=1)=>{for(let i=0;i<n;i++){const {p}=api.state();p.invuln=99;p.hp=p.maxHp;api.update(1/120);}};
const press=k=>{api.keys.add(k);api.pressed.add(k);};const release=k=>api.keys.delete(k);const tap=k=>{press(k);step();release(k);};
let checks=0;const ok=(cond,msg)=>{assert(cond,msg);checks++;console.log('PASS',msg);};
const until=(cond,max,msg)=>{for(let i=0;i<max;i++){if(cond())return i;step();}assert(false,'stalled: '+msg);};
const start=async id=>{await api.startLevel(api.LEVELS.findIndex(L=>L.id===id),'day');api.keys.clear();api.pressed.clear();const w=api.state().world;for(const e of w.enemies)e.alive=false;return w;};
const stand=x=>{const {p,world}=api.state();const t=world.traps.find(t=>t.kind==='vasar');Object.assign(p,{x,y:t.y,vx:0,vy:0,grounded:true,climb:null,attack:0,castLock:0});};

// ---- Kosovsko selo: the horse fair ----
{const w=await start('selo');const t=w.traps.find(t=>t.kind==='vasar');const {p}=api.state();
 ok(t&&t.konji.length===4,'vašar: four horses at the fair in the village');
 stand(t.cuvar+60);step(3);ok(t.told,'vašar: the horse-dealer tells Marko how the horse is chosen');
 stand(t.konji[0]);step(2);tap('KeyE');ok(t.stanje[0].leti>0&&!t.done,'vašar: the bay is swung by the tail and flies over his head');
 step(120);ok(t.stanje[0].odbacen,'vašar: and lands past the fence');
 stand(t.gate.x-10);step(3);ok(api.state().p.x<t.gate.x-20,'vašar: the way on stays shut until a horse is chosen');
 stand(t.konji[2]);step(2);tap('KeyE');ok(t.done&&!t.stanje[2].odbacen,'vašar: the scabby piebald foal does not budge: Šarac');
 step(120*17);ok(t.korak===3&&t.zdrav,'vašar: wine, the mange falls away, Novak shoes him');
 stand(t.gate.x-120);press('KeyD');step(120);release('KeyD');ok(api.state().p.x>t.gate.x+30,'vašar: then the road through the village is open');
 ok(api.draw()===null,'vašar: the fair draws without an error');}
// ---- Manastirski vis: thrice round the white church ----
{const w=await start('manastir');const T=w.traps.find(t=>t.kind==='samodreza'),g=w.goals.find(g=>g.kind==='take');const {p}=api.state();
 ok(T&&g&&Math.abs(g.x-T.knjiga)<5,'crkva: the books of old lie before the white church of Samodreža');
 Object.assign(p,{x:g.x-20,y:g.y,vx:0,vy:0,grounded:true});step(2);tap('KeyE');step(2);ok(api.state().mode==='shop','crkva: taking the books opens the judgment');
 api.presuda(3);ok(T.state==='beg'&&!p.blagoslov,'crkva: „na Urošu carstvo” — and the king draws his dagger: no blessing yet');
 press('KeyD');let caught=0;until(()=>{if(T.vuk.udar>.99)caught++;return T.state==='glas';},120*60,'thrice round the church');release('KeyD');
 ok(T.krug>=3&&p.hp>0,`crkva: three times round the church (the dagger glanced off ${caught} times)`);
 Object.assign(p,{x:T.crkva,vx:0});step(2);tap('KeyW');ok(T.state==='direk'&&p.uCrkvi,'crkva: „Bjež’ u crkvu” — W and Marko is inside, the door shut');
 until(()=>T.state==='kraj',120*30,'the doorpost, the repentance and the voice');ok(T.done&&p.blagoslov&&T.handzar,'crkva: the dagger in the doorpost, the curse, and the tsar’s blessing');
 Object.assign(p,{x:T.gate.x-120,vx:0});press('KeyD');step(120);release('KeyD');ok(api.state().p.x>T.gate.x+30,'crkva: then the way up the hill is open');
 ok(api.draw()===null,'crkva: the church and the king draw without an error');}
// ---- Opsednuta tvrđava: the father's sabre ----
{const w=await api.startLevel(api.LEVELS.findIndex(L=>L.id==='tvrdjava'),'day').then(()=>api.state().world);api.keys.clear();api.pressed.clear();
 const e=w.enemies.find(e=>e.sablja);for(const o of w.enemies)if(o!==e)o.alive=false;const {p}=api.state();
 ok(e&&e.alive,'sablja: the young Turk with the bound sabre stands by the tent');
 Object.assign(p,{x:e.x-420,y:e.y,vx:0,vy:0,grounded:true});step(3);ok(e.pesma&&e.razgovor>0,'sablja: Marko asks him where he got the sabre');
 const hp0=p.hp;step(120*20);ok(e.pesma.i>=3&&e.mode==='idle'&&e.alive,'sablja: he tells of the Marica, and does not strike while they talk');
 step(120*18);ok(e.pesma.i===5&&!(e.razgovor>0),'sablja: „daj amo sablju okovanu” — then the duel');
 api.slay(e);step(2);const it=w.items.find(i=>i.cudo==='oceva-sablja');ok(!!it,'sablja: the sabre falls where he falls');
 Object.assign(p,{x:it.x,y:it.y+38+40,vx:0,vy:0,grounded:true});step(3);ok(api.slova(),'sablja: it draws itself in Marko’s hand: the three letters');
 step(120*18);const S=api.slova();ok(S&&S.car&&S.dukati,'sablja: the fur cloak inside out, the sultan driven to the wall, a hundred ducats for wine');
 ok(api.draw()===null,'sablja: the letters draw without an error');}
// ---- Klisura Ibra: Marko in chains (Marko Kraljević i Đemo Brđanin) ----
{const w=await start('klisura');const T=w.traps.find(t=>t.kind==='okovi');const {p}=api.state();
 ok(T&&T.stanice.length===3&&T.mehana>T.stanice[2],'okovi: three gallows (Orid, Vučitrn, Zvečan) and Janja’s tavern in the gorge');
 Object.assign(p,{x:T.x0+120,y:T.y,vx:0,vy:0,grounded:true});step(3);ok(T.ph==='pad'&&!p.okovan,'okovi: on the bridge Marko meets Đemo, unarmed');
 step(120*13);ok(p.okovan&&T.pao,'okovi: the mace between the shoulders, then the irons: bukagije, belenzuke, sindžir');
 until(()=>T.ph==='vodi',120*10,'led away in chains');
 tap('KeyJ');tap('Space');step(30);ok(!(p.attack>0)&&p.grounded&&p.y===T.y,'okovi: in chains there is no strike and no jump');
 const x0=p.x;step(120*6);ok(p.x>x0+60,'okovi: lag behind and Đemo drags him by the chain');
 press('KeyD');until(()=>T.ph==='mehana',120*120,'past the three gallows');
 ok(T.molba?.length===3&&T.molba.every(Boolean),'okovi: at each gallows the lords pay three loads of treasure');
 until(()=>T.ph==='kraj',120*60,'Janja’s tavern');release('KeyD');
 ok(T.done&&T.raskovan&&!p.okovan&&T.djemo.bezi,'okovi: Janja’s herbs put Đemo to sleep, she unchains Marko, and Đemo flees to the duel');
 const x1=p.x;press('KeyD');step(120);release('KeyD');ok(p.x>x1+150,'okovi: Marko walks free again');
 ok(api.draw()===null,'okovi: the gallows, the tavern and Đemo draw without an error');}
// ---- Reka: the new tavern in Karlovac (Marko Kraljević i Filip Madžarin) ----
{const w=await start('reka');const T=w.traps.find(t=>t.kind==='mehana');const {p}=api.state();
 ok(T&&T.sarac>T.sto&&T.sto>T.kuca,'mehana: the new tavern, the table, and Šarac tied at the door, in that order');
 Object.assign(p,{x:T.x0+720,y:T.y,vx:0,vy:0,grounded:true});step(3);ok(T.ph==='dolazi','mehana: Marko comes to Karlovac and goes to the tavern');
 until(()=>T.ph==='pije',120*10,'he sits down to drink');step(120);ok(p.sedi>0,'mehana: he ties Šarac and sits down to drink');
 until(()=>T.ph==='sarac',120*15,'Filip comes');until(()=>T.zakuka,120*6,'Šarac cries out');ok(T.F&&T.F.x>T.sarac,'mehana: Šarac does not let Filip through, Filip beats him, Šarac cries out');
 step(120*5);tap('KeyE');step(2);ok(T.ph==='ulazi','mehana: E — „Propusti ga u mehanu, Šarče!”');
 const hp=p.hp;until(()=>T.h1,120*12,'the first blow');ok(p.hp===hp&&p.sedi>0,'mehana: Filip strikes him on the shoulders, and Marko ni habera nema');
 until(()=>T.ph==='megdan',120*20,'the cup');const f=w.enemies.find(e=>e.filip);ok(T.razbijena&&f&&f.alive&&!(p.sedi>0),'mehana: the golden cup is broken, the wine spilled: Marko leaps up and the duel begins');
 const x1=p.x;step(80);press('KeyA');step(60);release('KeyA');ok(p.x<x1-30,'mehana: in the duel Marko moves freely');
 api.slay(f);step(2);ok(T.done&&T.ph==='kraj','mehana: „Dobra gvožđa u loša junaka!” — the tavern is done');
 ok(api.draw()===null,'mehana: the tavern, Šarac and Filip draw without an error');}
console.log(`\n${checks} checks passed.`);
