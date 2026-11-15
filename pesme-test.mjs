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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,presuda,slay,slova:()=>sabljaSlova,state:()=>({p,world,mode,horseMounted}),draw:()=>{try{draw(1/60);}catch(e){return e;}return null;}};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
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
// ---- Zimski prevoj: under Varadin (Marko Kraljević i Vuča dženeral) ----
{const w=await start('prevoj');const T=w.traps.find(t=>t.kind==='varadin');const {p}=api.state();
 ok(T&&T.logor>T.x0&&T.logor<T.x1,'varadin: the camp in the field under Varadin');
 Object.assign(p,{x:T.x0+400,y:T.y,vx:0,vy:0,grounded:true});step(3);ok(T.ph==='logor','varadin: Miloš’s letter sealed in blood; Marko comes under Varadin');
 until(()=>T.ph==='pije',120*10,'the spear in the meadow');step(120);ok(T.koplje&&p.sedi>0,'varadin: the spear in the meadow, Šarac tied to it, Marko sits down to drink');
 until(()=>T.v2,120*25,'Vuča sends the katane');ok(w.enemies.filter(e=>e.alive&&e.katana===1).length===5,'varadin: Velimirovica sees him from the walls; Vuča sends Velimir with the katane');
 until(()=>T.ph==='opkole',120*6,'they surround him');step(120*3);const near=w.enemies.filter(e=>e.alive&&e.katana===1);ok(near.every(e=>e.x>p.x+200),'varadin: they close in and Šarac stamps his hooves, but no one strikes the seated Marko');
 tap('KeyE');step(2);ok(T.ph==='boj1'&&api.state().horseMounted,'varadin: E — Marko throws the ledjen in the grass and leaps on Šarac');
 for(const e of near)api.slay(e);step(3);ok(T.ph==='boj2pre','varadin: „kako soko među golubove” — Velimir is bound');
 until(()=>T.ph==='boj2',120*8,'Vuča’s cannons');const wave=w.enemies.filter(e=>e.alive&&e.katana===2);ok(wave.length===7,'varadin: Vuča shakes the cannons and sends more katane');
 for(const e of wave)api.slay(e);step(3);ok(T.ph==='vojvode','varadin: Vuča flees on his mare, the thrown mace brings him down');
 until(()=>T.ph==='kraj',120*32,'the voivodes');ok(T.done&&T.milos&&!api.state().horseMounted,'varadin: the general’s wife opens the dungeon: Miloš and the voivodes are free');
 ok(api.draw()===null,'varadin: the camp, Šarac and Miloš draw without an error');}
// ---- Ruševine: the Kosovo maiden (Marko Kraljević ukida svadbarinu) ----
{const w=await start('rusevine');const T=w.traps.find(t=>t.kind==='kosovka');const {p}=api.state();
 ok(T&&T.dev>T.x0&&T.dev<T.x1,'kosovka: the Kosovo maiden waits by the water at the start of the ruins');
 Object.assign(p,{x:T.dev-380,y:T.y,vx:0,vy:0,grounded:true});step(3);ok(T.ph==='govor'&&T.i===1,'kosovka: „Božja pomoć, Kosovko devojko!” — Marko asks why she is grey');
 const x0=p.x;press('KeyD');step(40);release('KeyD');ok(p.x>x0+20,'kosovka: Marko keeps his feet while they talk');
 until(()=>T.dukati,120*40,'thirty ducats');ok(T.i===4,'kosovka: the Arab’s wedding tax, her turn tonight, and Marko’s thirty ducats');
 until(()=>T.done,120*30,'the silk banner');ok(T.i===6&&T.odlazi!=null,'kosovka: she shows him the silk banner over the Arab’s tent and goes home');
 ok(api.draw()===null,'kosovka: the maiden draws without an error');}
// ---- Ruševine: the duel with the Arab (Marko Kraljević ukida svadbarinu) ----
{const w=await api.startLevel(api.LEVELS.findIndex(L=>L.id==='rusevine'),'day').then(()=>api.state().world);api.keys.clear();api.pressed.clear();
 const K=w.traps.find(t=>t.kind==='kosovka'),A=w.enemies.find(e=>e.champion&&e.kit==='arapin');for(const e of w.enemies)if(e!==A)e.alive=false;const {p}=api.state();
 ok(K&&A&&A.arena,'arapin: the Arab’s tent at the end of the ruins');
 Object.assign(p,{x:A.arena.x0+160,y:A.arena.y,vx:0,vy:0,grounded:true});step(3);step(120*10);ok(K.dukati3,'arapin: Marko throws him three ducats — „više nemam blaga”');
 p.hp=p.maxHp-20;api.update(1/120);ok(K.salis,'arapin: the first blow, and Marko laughs: „il’ se šališ, il’ od zbilje biješ?”');
 api.slay(A);step(2);ok(K.pobeda,'arapin: four servants left to tell the truth; no more wedding tax on Kosovo');}
// ---- a scene that takes the controls starts clean: no blow left hanging, on the ground ----
{const w=await start('reka');const T=w.traps.find(t=>t.kind==='mehana');const {p}=api.state();
 Object.assign(p,{x:T.x0+720,y:T.y,vx:0,vy:0,grounded:true,attack:.3,drink:.4});step(2);ok(T.ph==='dolazi'&&!(p.attack>0)&&!(p.drink>0)&&p.grounded,'scene: a blow or a drink in hand when the tavern scene starts is let go');}
{const w=await start('klisura');const T=w.traps.find(t=>t.kind==='okovi');const {p}=api.state();
 Object.assign(p,{x:T.x0+120,y:T.y-90,vx:0,vy:-200,grounded:false});step(2);ok(!T.ph,'scene: Marko in the air does not start the chains');
 Object.assign(p,{y:T.y,vy:0,grounded:true});step(2);ok(T.ph==='pad'&&p.y===T.y,'scene: on the ground the chains begin, and he stays on the ground');}
console.log(`\n${checks} checks passed.`);
