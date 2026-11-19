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
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,presuda,slay,slova:()=>sabljaSlova,slusa:()=>slusa,speak,uplasi,hitCrate,seloStvari,KITS,PRELAZ_RED,slusaProbaj:v=>{slusaProba=v;},state:()=>({p,world,mode,horseMounted}),draw:()=>{try{draw(1/60);}catch(e){return e;}return null;}};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
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
 stand(t.gate.x-10);step(3);ok(api.state().p.x<t.gate.x-20&&t.korak===1,'vašar: the way on stays shut while the foal is scabby and unshod');
 stand(t.konji[2]-92);step(130);tap('KeyE');ok(t.korak===2&&p.drink>0,'vašar: E by the foal: half the wine Marko drinks, half he gives to Šarac');
 step(120*6);ok(t.zdrav&&t.korak===3,'vašar: the mange falls away');
 stand(t.konji[2]+250);step(120*3);ok(t.sx>t.konji[2]+100&&t.sx<p.x,'vašar: Šarac walks after Marko ('+Math.round(t.sx-t.konji[2])+' px from where he stood)');
 stand(t.x1-250-100);step(120*3);ok(t.korak===4,'vašar: by the smith he goes to the anvil and Novak shoes him');
 stand(t.gate.x-10);step(3);ok(api.state().p.x<t.gate.x-20,'vašar: the way stays shut while Novak hammers');step(120*4);ok(t.korak===5,'vašar: shod');
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
 const e=w.enemies.find(e=>e.sablja),T=w.traps.find(t=>t.kind==='tabor'),M=w.traps.find(t=>t.kind==='marica'),K=w.traps.find(t=>t.kind==='belakula'),C=w.traps.find(t=>t.kind==='cador');
 for(const o of w.enemies)if(o!==e&&!o.tabor&&!o.champion)o.alive=false;const {p}=api.state();const at=(x,y)=>{Object.assign(p,{x,y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});step(3);};
 // the Marica at dawn
 ok(M&&M.voda[0]>M.devojka&&M.grob>M.voda[1]&&w.items.some(i=>i.type==='zapis'&&i.x>M.voda[1]&&i.x<M.x1),'marica: the girl and her linen on this bank, the ford, the grave and the scroll on the far one');
 at(M.devojka-200,M.y);ok(M.ph==='prica','marica: the Turkish girl tells of the muddy and bloody water');step(120*6);ok(w.cemeri===1&&M.kune,'marica: she curses her brother and gives Marko the first belt of ducats');
 at((M.voda[0]+M.voda[1])/2,M.dno);ok(p.uVodi,'marica: Marko wades the ford');at(M.grob,M.y);ok(M.grobRec,'marica: the grave of the unknown hero on the far bank');
 // the white tower
 const B=w.breakables.find(b=>b.cemer);ok(K&&B&&Math.abs(B.y-K.by)<2&&w.ladders.some(l=>Math.abs(l.top-K.by)<2&&Math.abs(l.x-K.cx)<200),'bela kula: a ladder to the balcony of Mustaf-aga’s white tower, the second belt on it');
 at(B.x-60,K.by);api.hitCrate(B,9);step(2);ok(w.cemeri===2,'bela kula: the second belt of ducats');
 // the camp: the sabre from hand to hand
 ok(w.enemies.filter(o=>o.sablja).length===1,'tabor: one man only carries the sabre and its name');ok(e&&e.alive&&T&&w.enemies.filter(o=>o.tabor).length>=3,'tabor: Mustaf-aga with the sabre and three of the camp who try to draw it');
 at(T.x0+420,T.y);ok(T.ph==='ruke'&&!e.pesma,'tabor: the sabre goes from hand to hand');step(120*5);ok(w.enemies.some(o=>o.tabor&&o.vuce)&&e.hp===e.maxHp,'tabor: one after another they tug at it; nobody strikes');
 at(T.krug-60,T.y);tap('KeyE');step(2);ok(T.ph==='slova'&&api.slova(),'tabor: E — it draws itself in Marko’s hand: the three letters');
 step(120*10);ok(T.ph==='razgovor'&&e.pesma&&e.razgovor>0,'tabor: Marko asks him where he got the sabre');
 step(120*18);ok(e.pesma.i>=4&&e.alive&&e.hp===e.maxHp,'tabor: he tells of the Marica, and does not strike while they talk');
 step(120*16);ok(T.ph==='boj'&&!(e.razgovor>0),'tabor: „daj amo sablju okovanu” — then the duel');
 api.slay(e);step(4);const it=w.items.find(i=>i.cudo==='oceva-sablja');ok(!!it&&T.ph==='kraj'&&w.cemeri===3,'tabor: the sabre falls where he falls, and the third belt with him');
 ok(w.enemies.filter(o=>o.tabor&&o.alive).some(o=>o.bezi),'tabor: „otidoše caru kazivati” — the three run off');
 Object.assign(p,{x:it.x,y:it.y+38+40,vx:0,vy:0,grounded:true});step(3);ok(it.taken,'tabor: his father’s sabre is Marko’s again');
 // the megdan: a keg of powder, the leap, the Sultan’s čauši
 const H=w.enemies.find(o=>o.champion&&o.kit==='hasan'),A=H.arena,KH=api.KITS.hasan,bure=w.platforms.filter(q=>q.megdanBure);ok(bure.length===2,'hasan: two kegs of powder stand in his arena');
 Object.assign(H,{alive:true,x:bure[0].x-200,y:A.y,vx:0,grounded:true,mode:'idle',ks:'ram',rdir:1,rammed:true,kt:0,kc:0,stun:0,face:1,wallHit:1,wallQ:bure[0]});const hp=H.hp;
 Object.assign(p,{x:A.x1-120,y:A.y});KH.step(H,1/120,p.x-H.x,Math.abs(p.x-H.x));ok(bure[0].off&&H.hp<hp&&H.stun>0,'hasan: his charge into a keg of powder blows it up under him');
 Object.assign(H,{p2:true,mode:'idle',ks:null,kc:0,stun:0,wallHit:0,x:A.x0+120});Object.assign(p,{x:A.x1-120,y:A.y});KH.step(H,1/120,p.x-H.x,Math.abs(p.x-H.x));ok(H.ks==='skok'&&H.vy<0,'hasan: from the second act he leaps at Marko who stands far off');
 const n0=w.enemies.length;H.causi=false;KH.phase3(H);ok(H.ks==='bes'&&w.enemies.length===n0+2,'hasan: at a third he rages and two of the Sultan’s čauši come down');
 // the Sultan’s tent
 for(const o of w.enemies)o.alive=false;Object.assign(p,{hp:p.maxHp});at(C.c-380,C.y);ok(C.ph==='ulazi','cador: past the megdan Marko goes in under the Sultan’s tent');
 until(()=>C.ph==='sjedi'&&p.sedi>=1,120*20,'the prayer rug');ok(p.sedi>0&&Math.abs(p.vx)<1,'cador: „u čizmama sjede na serdžadu”');const cx=C.car,mx=p.x;
 until(()=>C.ph==='primice',120*10,'he rises');ok(!p.sedi,'cador: Marko rises from the rug before he steps towards the Sultan');
 until(()=>C.dukati,120*30,'the ducats');ok(C.car>cx+90&&p.x>mx+90&&!p.sedi,'cador: „car s’ odmiče, a Marko primiče, dok doćera cara do duvara”: Marko walks to him, he does not slide seated');
 until(()=>C.ph==='kraj',120*10,'out of the tent');ok(C.done&&!p.sedi,'cador: a hundred ducats for wine, and Marko rises');
 ok(api.draw()===null,'sablja: the Marica, the tower, the camp and the tent draw without an error');}
// ---- „Marko pije uz ramazan vino”: the edict, its four breakings, the hodža and the hadžija, the cup of twelve oka ----
{const w=await api.startLevel(api.LEVELS.findIndex(L=>L.id==='podrum'),'day').then(()=>api.state().world);api.keys.clear();api.pressed.clear();const {p}=api.state();
 const at=(x,y)=>{Object.assign(p,{x,y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0,drink:0});step(3);},tr=k=>w.traps.find(t=>t.kind===k),mir=()=>{for(const e of w.enemies)e.alive=false;};
 const J=tr('jasak'),D=tr('dolama'),K=tr('kadune'),U=tr('kupa'),B=w.traps.filter(t=>t.kind==='bacva');
 ok(J&&D&&K&&U&&B.length===2&&B[1].odze&&J.x0<B[0].x&&B[0].x<D.x0&&D.x0<B[1].x&&B[1].x<K.x0&&K.x0<U.x0,'ramazan: the crier, the wine, the dolama and the sabres, the hodža and the hadžija, the kolo and the tent stand in the order of the road');
 ok(w.enemies.find(e=>e.champion).arena.x1<U.c-400,'ramazan: the tent stands past the megdan');
 mir();at(J.telal-300,J.y);ok(w.jasakS?.procitan&&w.jasakS.n===0,'ramazan: the crier reads the Sultan’s edict of four things');
 at(B[0].x0+90,B[0].y);ok(B[0].state==='napad','ramazan: the čauši march on the barrel');mir();step(3);at(B[0].x-40,B[0].y);tap('KeyE');step(3);ok(w.jasakS.vino&&w.jasakS.n===1,'ramazan: Marko drinks wine in Ramadan (1/4)');step(120);
 at(D.stalak-30,D.y);tap('KeyE');step(3);ok(w.dolama&&w.jasakS.dolama&&w.enemies.some(e=>e.alive),'ramazan: he puts on the green dolama (2/4) and the guard comes down');mir();
 at(D.sablje-30,D.y);tap('KeyE');step(160);ok(w.jasakS.sablja&&p.sablja&&w.sabljaJasak,'ramazan: he breaks the seal and girds a studded sabre (3/4)');
 const O=B[1];at(O.x0+90,O.y);mir();step(3);at(O.x-40,O.y);tap('KeyE');step(140);ok(O.state==='popijeno'&&w.jasakS.n===3,'ramazan: the second barrel is drunk; a thing done once is counted once');
 at(O.odze-40,O.y);tap('KeyE');step(3);ok(!!O.piju,'ramazan: „još nagoni odže i adžije da i oni s njime piju vino”');step(120*4);ok(!!O.tuzi,'ramazan: „idu Turci caru na parnicu”');
 at(K.c-130,K.y);tap('KeyE');step(3);ok(K.ph==='igra','ramazan: Marko takes hands in the kolo of the ladies');until(()=>K.ph==='boj',120*8,'the kolo');ok(w.jasakS.n===4&&w.enemies.some(e=>e.alive&&e.kolo),'ramazan: all four are broken (4/4), and the guard breaks into the kolo');
 mir();step(240);ok(K.ph==='kraj','ramazan: the guard cut down, the kolo goes on');
 Object.assign(p,{hp:p.maxHp});at(U.c-300,U.y);ok(U.ph==='ulazi','ramazan: past the megdan Marko goes in under his tent');
 until(()=>U.ph==='zove',120*25,'the two young čauši');ok(p.sedi>=1&&U.ca[0]<U.c+200&&U.ca[1]<U.c+300,'ramazan: he sits to the cup of twelve oka and the two young čauši come down to him');
 until(()=>U.pukla,120*10,'the cup');ok(U.ca[0]===null,'ramazan: „pršte kupa, a pršte i glava”');
 until(()=>U.ph==='kraj',120*12,'the divan');ok(U.done&&!p.sedi,'ramazan: after the divan, the Sultan’s hundred ducats');
 ok(api.draw()===null,'ramazan: the cellar of the song draws without an error');}
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
// ---- Pod Varadinom, by the song: Prilep and the stones of the arming, Beograd and the Danube ----
{const w=await start('prevoj');const {p}=api.state();const R=w.traps.find(t=>t.kind==='red'),P=w.traps.find(t=>t.kind==='prilep'),D=w.traps.find(t=>t.kind==='dunav');
 const at=(x,y)=>{Object.assign(p,{x,y,vx:0,vy:0,grounded:true,face:1,attack:0,cooldown:0});step(3);};
 ok(P&&R&&R.order.join()==='1,3,2,0'&&w.items.some(i=>i.type==='zapis'&&i.x>P.x0&&i.x<P.x1),'prilep: the white church, Miloš’s letter by the knjigonoša, four stones before the gate');
 ok(['zvoni','posta','ribar','starac'].every(k=>(w.radnici||[]).some(r=>r.k===k))&&!w.enemies.some(e=>e.x>P.x0&&e.x<P.x1),'prilep: the bell-ringer and the knjigonoša at the church, the fisherman and the old man at the Danube; no foe in Prilep');
 const hit=i=>{at(R.objs[i].x-40,R.gate.y);tap('KeyJ');step(50);};
 hit(0);ok(!R.prog&&!R.done,'prilep: the mace first is not how Marko armed himself');for(const i of[1,3,2,0])hit(i);ok(R.done,'prilep: sabre, spear, wineskin, mace: the gate of Prilep opens');
 at(D.x0+140,D.y);ok(D.ph==='krcma','dunav: by Beograd he turns in at the tavern');at(D.sto,D.y);tap('KeyE');step(4);ok(D.popio,'dunav: „uvrati se, te se napi vina”');step(140);
 at(D.obala-60,D.y);press('KeyD');step(360);release('KeyD');ok(p.x<=D.obala+31,'dunav: nobody wades the Danube on foot');
 at(D.sarac,D.y);tap('KeyE');step(4);ok(api.state().horseMounted&&D.jase,'dunav: E by the post — Marko is on Šarac');
 press('KeyD');until(()=>p.x>D.obala-120,120*8,'to the bank');step(240);release('KeyD');ok(p.x<=D.obala+31&&!D.slobodno,'dunav: the ferry is on the far bank; the river waits for the call');
 step(10);tap('KeyE');step(320);ok(D.vika===1&&!D.slobodno,'dunav: he calls the ferryman once');tap('KeyE');step(4);ok(D.vika===2&&D.slobodno,'dunav: „dvaput Marko skeledžiju viknu, pa ga više ni čekati ne šće”');
 press('KeyD');until(()=>p.uVodi,120*6,'into the river');const v=Math.abs(p.vx);step(120);ok(p.uVodi&&p.y>D.y+40&&Math.abs(p.vx)<300,'dunav: Šarac wades the river, slower than he gallops');
 until(()=>D.done,120*30,'across');release('KeyD');ok(D.done&&p.x>D.voda[1],'dunav: over the Danube, under Varadin');
 const e=w.enemies.find(e=>!e.champion&&!e.perch);e.alive=true;e.hp=e.maxHp;e.x=(D.voda[0]+D.voda[1])/2;e.y=D.dno;e.vy=0;e.grounded=true;step(120*4);ok(!e.alive,'dunav: „što podavi u tihom Dunavu” — a foe driven into the river drowns');
 ok(api.draw()===null,'prilep, dunav: the church, the tavern, the dock and the river draw without an error');}
// ---- Pod Varadinom: the field under Varadin (Marko Kraljević i Vuča dženeral) ----
{const w=await start('prevoj');const T=w.traps.find(t=>t.kind==='varadin');const {p}=api.state();for(const e of w.enemies)if(e.champion)e.alive=true;
 ok(T&&T.logor>T.x0&&T.logor<T.x1,'varadin: the camp in the field under Varadin');
 Object.assign(p,{x:T.x0+400,y:T.y,vx:0,vy:0,grounded:true});step(3);ok(T.ph==='logor','varadin: Miloš’s letter sealed in blood; Marko comes under Varadin');
 until(()=>T.ph==='pije',120*10,'the spear in the meadow');step(120);ok(T.koplje&&p.sedi>0,'varadin: the spear in the meadow, Šarac tied to it, Marko sits down to drink');
 until(()=>T.v2,120*25,'Vuča sends the katane');ok(w.enemies.filter(e=>e.alive&&e.katana===1).length===5,'varadin: Velimirovica sees him from the walls; Vuča sends Velimir with the katane');
 until(()=>T.ph==='opkole',120*6,'they surround him');step(120*3);const near=w.enemies.filter(e=>e.alive&&e.katana===1);ok(near.every(e=>e.x>p.x+200),'varadin: they close in and Šarac stamps his hooves, but no one strikes the seated Marko');
 tap('KeyE');step(2);ok(T.ph==='boj1'&&api.state().horseMounted,'varadin: E — Marko throws the ledjen in the grass and leaps on Šarac');
 for(const e of near)api.slay(e);step(3);ok(T.ph==='boj2pre','varadin: „kako soko među golubove” — Velimir is bound');
 until(()=>T.ph==='boj2',120*8,'Vuča’s cannons');const wave=w.enemies.filter(e=>e.alive&&e.katana===2);ok(wave.length===7,'varadin: Vuča shakes the cannons and sends more katane');
 for(const e of wave)api.slay(e);step(3);ok(T.ph==='potera','varadin: the katane are cut down, Vuča flees on his mare');
 const V=w.enemies.find(e=>e.champion&&e.look==='vuca');ok(V&&V.kit==='beg'&&V.name==='Vuča dženeral','varadin: Vuča dženeral is the champion of the pohod, on the beg’s moves');V.alive=false;step(3);ok(T.ph==='vojvode'&&T.posle,'varadin: the thrown mace brings him down „u zelenu travu”, Vuča is bound');
 const TM=w.traps.find(t=>t.kind==='tamnica'),cudo=w.items.find(i=>i.type==='cudo');step(120*16);ok(TM&&!TM.open&&T.ph==='vojvode'&&cudo.y<-9000,'varadin: the voivodes stand behind the bars; the song waits at the dungeon, the marvel is out of reach');
 Object.assign(p,{x:TM.c-TM.w/2-90,y:TM.y,vx:0,vy:0,grounded:true});step(3);tap('KeyE');step(3);ok(TM.open,'varadin: E — „te otvori prokletu tavnicu, i izvadi tri vojvode mlade”');
 until(()=>T.ph==='kraj',120*32,'the voivodes');ok(T.done&&T.milos&&!api.state().horseMounted&&cudo.y>-9000,'varadin: Miloš and the voivodes are free, the marvel lies in the open cell');
 const tov=w.breakables.filter(b=>b.tovar);ok(tov.length===3&&tov.every(b=>b.x>TM.x1),'varadin: three loads of treasure wait by the road to the last banner');
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
// ---- listening (18. 11.): Marko walks while a line is said or the guslar sings, and the road ahead waits ----
{const w=await start('selo');const {p}=api.state();const S=w.traps.find(t=>t.kind==='seljani'),G=w.traps.find(t=>t.kind==='guslar');
 ok(S&&S.ljudi.filter(s=>!s.slavi&&s.gleda==null&&s.k!=='seljak').length===2&&api.state().world.level.spawn.x<S.x0,'village: a quiet road with a mother and an old man opens Kosovsko selo');
 ok(S.ljudi.filter(s=>s.gleda===G.x).length===2&&S.kokoske.length>=4,'village: two of its people listen to the guslar, hens peck about the yards');
 {const h=S.kokoske[0],hx=h.x;Object.assign(p,{x:h.x-90,y:h.y,vx:0,vy:0,grounded:true});api.keys.add('KeyD');step(100);api.keys.clear();ok(h.x>hx+40,'village: a hen scatters when Marko runs through ('+Math.round(h.x-hx)+' px)');}
 Object.assign(p,{x:S.x0+60,y:S.y,vx:0,vy:0,grounded:true});api.keys.add('KeyD');step(120);const run=p.vx;ok(run>240&&!api.slusa(),'listening: with nothing being said Marko runs ('+Math.round(run)+' px/s)');
 api.slusaProbaj(true);const x0=p.x;api.speak('Kažu da je ovde potkovan Šarac i da je jedna potkova ostala u selu. Selo je pod opsadom: oteraj odred i stigni do barjaka.',7);step(90);const B=api.slusa()?.B;
 ok(api.slusa()&&p.vx<125&&p.vx>90,'listening: while the line is said he goes at a walk ('+Math.round(p.vx)+' px/s)');
 ok(B>x0+200&&B<=x0+560,'listening: the veil stands down the road ('+Math.round(B-x0)+' px ahead of where the line began)');
 p.x=B-20;step(120);ok(p.x===B&&p.vx===0,'listening: at the veil he stands, the road ahead waits');
 press('Space');step(40);ok(p.x<=B,'listening: a jump does not carry him through it');
 until(()=>!api.slusa(),120*9,'the line ends');step(120);ok(p.x>B+60&&p.vx>240,'listening: with the last word the veil lifts and he runs on');
 // a foe who has seen him frees him at once; one who has not is not woken from afar while he listens
 const e=w.enemies[0];Object.assign(e,{alive:true,alert:false,spava:false,x:p.x+600,y:p.y,hp:e.maxHp,mode:'idle'});api.speak('Novak kovač potkova Šarca, a jedna potkova osta u selu, da se pamti. Šarac te čeka; ti oteraj odred iz sela.',8);step(60);
 ok(api.slusa()&&!e.alert&&api.slusa().B<e.x-330,'listening: a foe who has not seen him stays unaware, and the veil stands short of him');
 e.alert=true;step(3);ok(!api.slusa(),'listening: a foe who has seen him frees him: no walk and no veil in a fight');e.alive=false;api.slusaProbaj(false);api.keys.clear();step(120*9);
 // the guslar: the verses are sung for 10.3 s; Marko walks past him and waits at the veil behind him
 Object.assign(p,{x:G.x-420,y:G.y,vx:0,vy:0,grounded:true});api.keys.add('KeyD');until(()=>G.state==='peva',120*4,'the guslar begins');step(120);
 ok(api.slusa()?.g===G&&p.vx<125,'guslar: while he sings Marko walks');const GB=Math.min(G.x+520,G.x1-60);step(120*8);ok(p.x===GB,'guslar: the veil stands behind the guslar until the verses are sung ('+Math.round(GB-G.x)+' px past him)');
 const k=(120*9+until(()=>!api.slusa(),120*4,'the verses end'))/120;ok(k>10&&k<11.5,'guslar: the three verses take their ten seconds ('+k.toFixed(1)+' s)');step(120);ok(p.x>GB+60,'guslar: then the road is open');api.keys.clear();
 // the people come out and cheer by the well when the champion of the village has fallen
 const C=w.enemies.find(e=>e.champion),W2=api.state().world,gx=W2.level.goal.x;C.alive=true;step(3);ok(!W2.seljaniSlave&&S.ljudi.some(s=>s.slavi),'village: while the bashi holds the village its people stay in their houses');
 api.slay(C);step(120*3);Object.assign(p,{x:gx-300,y:W2.level.goal.y,vx:0,vy:0,grounded:true});step(120);ok(W2.seljaniSlave&&S.ljudi.filter(s=>s.slavi&&s.rekao).length>=2,'village: the bashi fallen, they come out to the well and cheer');
 ok(api.draw()===null,'village: its people and hens draw without an error');}
// ---- the first fight of the first pohod: one plain janissary, and the second swordsman stands before the first archer ----
{await api.startLevel(api.LEVELS.findIndex(L=>L.id==='selo'),'day');const w=api.state().world,L=w.enemies.filter(e=>!e.champion&&!e.perch&&!e.kit).sort((a,b)=>a.x-b.x),[a,b]=L,S=w.traps.find(t=>t.kind==='seljani');
 ok(a.type==='sword'&&!a.elite&&a.par==null&&a.x>S.x1,'first fight: one plain janissary past the quiet road ('+Math.round(a.hp)+' hp)');
 const m=w.enemies.find(e=>e.id===b.par);ok(b.x-a.x>=500&&!b.elite&&(!m||m.type==='archer'),'first fight: the second swordsman waits '+Math.round(b.x-a.x)+' px on'+(m?', a shield before the first archer':''));}
// ---- fear and flight (18. 11.): a man who has seen enough turns and runs; out of sight he is gone ----
{const w=await start('selo');const {p}=api.state();const S=w.traps.find(t=>t.kind==='seljani'),[a,b]=w.enemies.filter(e=>!e.champion&&!e.perch&&!e.kit);
 Object.assign(p,{x:S.x0+200,y:S.y,vx:0,vy:0,grounded:true});Object.assign(a,{alive:true,type:'sword',x:p.x+260,y:p.y,hp:a.maxHp,mode:'idle',spava:false,patrola:null,elite:false,par:null,grounded:true,vx:0});
 ok(api.uplasi(a)&&a.bezi,'fear: a janissary can be frightened');const ax=a.x;step(60);ok(Math.abs(a.x-ax)<4,'fear: first he starts back where he stands');step(40);ok(w.baceno?.length===1&&w.baceno[0].k===0,'fear: and throws his sabre down');
 step(120*2);ok(a.x>ax+200&&a.face===1,'fear: then he runs from Marko ('+Math.round(a.x-ax)+' px in two seconds)');
 until(()=>!a.alive,120*12,'he runs out of sight');ok(a.pobegao&&w.pobeglo===1,'fear: out of sight he is gone, and not among the slain');
 Object.assign(b,{alive:true,type:'oklopnik',x:p.x+200,y:p.y,hp:b.maxHp,mode:'idle',spava:false,patrola:null,elite:false,par:null,grounded:true});ok(!api.uplasi(b),'fear: the armoured one does not run');b.alive=false;
 // the champion falls and his men run; Marko has a word for him
 const C=w.enemies.find(e=>e.champion);Object.assign(b,{alive:true,type:'sword',x:C.x-200,y:C.y});C.alive=true;step(2);api.slay(C);ok(b.bezi,'fear: when the champion falls his men run');
 ok(w.markoRec?.text.includes('Šarca i topuza'),'megdan: Marko has his own word for the fallen bashi');step(120*4);ok(!w.markoRec,'megdan: and says it when the blow has settled');}
// ---- the duel of Kosovsko selo: the charge into the hay cart, the beehives ----
{const w=await start('selo');const {p}=api.state();const C=w.enemies.find(e=>e.champion),A=C.arena,K=api.KITS.kopljanik;C.alive=true;
 ok(w.megdanKola.length===2&&w.breakables.filter(b=>b.megdan&&b.kind==='kosnica').length===2,'megdan: two hay carts at the ends of the field, a beehive on each plank');
 Object.assign(C,{x:A.x0+520,y:A.y,vx:0,grounded:true,mode:'idle',ks:'prep',kt:.05,face:-1,stun:0});Object.assign(p,{x:A.x0+330,y:A.y,vx:0,vy:0,grounded:true});
 const run=n=>{for(let i=0;i<n;i++){C.kt-=1/120;K.step(C,1/120,p.x-C.x,Math.abs(p.x-C.x));C.x+=C.vx/120;}};
 run(10);ok(C.ks==='juris'&&C.vx<-500,'megdan: the bashi charges with his spear couched');
 run(120);ok(C.ks==='zabio'&&C.kitOpen>3&&Math.abs(C.x-(w.megdanKola[0]+118))<2,'megdan: past Marko the spear drives into the hay cart and he stands open');
 run(120*4);ok(C.ks==null,'megdan: after a while he pulls it free');
 const h=w.breakables.find(b=>b.megdan);api.hitCrate(h,9);ok(h.broken&&w.rojevi?.length===1&&w.rojevi[0].cilj===C,'megdan: a broken hive sends its bees at the bashi');
 step(120*3);ok(C.pceleT>0&&C.kitOpen>0,'megdan: stung, he stands open');
 // the well and the stall
 const V=api.seloStvari().find(s=>s.daje==='voda'),T=api.seloStvari().find(s=>s.daje==='pogaca');ok(V&&T,'village: a well with a sweep by the guslar, a stall at the fair');
 api.slay(C);step(120*4);Object.assign(p,{x:V.x-40,y:V.y,vx:0,vy:0,grounded:true,castLock:0});step(2);tap('KeyE');ok(V.uzeto&&(p.drink>0||p.vodaT>0),'village: E by the well and Marko drinks');
 step(120);Object.assign(p,{x:V.x-40,castLock:0});tap('KeyE');ok(!(p.drink>.8)&&!(p.vodaT>1.4),'village: once from each well');}
// ---- the duel in three acts (18. 11.): the whirl, the thrust from above, the shield, the rage ----
{const w=await start('selo');const {p}=api.state();const C=w.enemies.find(e=>e.champion),A=C.arena,K=api.KITS.kopljanik;C.alive=true;C.p2=true;
 const put=(dist,kn)=>{Object.assign(C,{x:A.x0+700,y:A.y,vx:0,vy:0,grounded:true,mode:'idle',ks:null,kt:0,kc:0,kn,stun:0,face:-1,kitOpen:0});Object.assign(p,{x:C.x-dist,y:A.y,vx:0,vy:0,grounded:true});};
 const run=n=>{for(let i=0;i<n;i++){C.kt-=1/120;K.step(C,1/120,p.x-C.x,Math.abs(p.x-C.x));C.x+=C.vx/120;}};
 put(100,0);run(2);ok(C.ks==='vitloPrep','megdan: with Marko at his side the bashi winds up the whirl of the spear');
 run(120);ok(C.ks==='vitlo','megdan: and whirls it');p.x-=300;run(120*2);ok(C.ks==null&&C.mode==='stun'&&C.kitOpen>0,'megdan: after the whirl his head spins and he stands open');
 put(330,2);run(2);ok(C.ks==='ubod'&&!C.grounded,'megdan: from half his strength he leaps with the thrust from above');
 p.x-=300;run(80);C.grounded=true;C.y=A.y;run(2);ok(C.ks==='uzemlji'&&C.kitOpen>2,'megdan: missed, the spear stays in the ground and he stands open');
 put(250,0);run(2);ok(C.ks==='stit','megdan: he advances behind his shield');run(30);ok(C.vx<0&&C.invT>0,'megdan: from the front the shield takes every blow');
 p.x=C.x+70;run(2);ok(!(C.invT>0),'megdan: but his back is open');
 put(400,0);C.p3=true;K.phase3(C);ok(C.ks==='bes'&&C.invT>0,'megdan: at a third of his strength he rages');run(120*2);ok(C.ks==null,'megdan: and comes on again');
 ok(api.draw()===null,'megdan: the three acts draw without an error');}
// ---- the Executioner and Hasan-aga in three acts (18. 11., D82/D83) ----
{const w=await start('manastir');const {p}=api.state();const C=w.enemies.find(e=>e.champion&&e.kit==='dzelat'),A=C.arena,K=api.KITS.dzelat;C.alive=true;C.p2=true;
 const put=(dist,kn)=>{Object.assign(C,{x:A.x0+700,y:A.y,vx:0,vy:0,grounded:true,mode:'idle',ks:null,kt:0,kc:0,kn,stun:0,face:-1,kitOpen:0,zabio:false});Object.assign(p,{x:C.x-dist,y:A.y,vx:0,vy:0,grounded:true});};
 const run=n=>{for(let i=0;i<n;i++){C.kt-=1/120;K.step(C,1/120,p.x-C.x,Math.abs(p.x-C.x));C.x+=C.vx/120;}};
 put(100,0);run(2);ok(C.ks==='vitloPrep','dželat: with Marko at his side he winds up the whirl of the axe');run(120);ok(C.ks==='vitlo','dželat: and whirls it');
 p.x-=300;run(120*2);ok(C.ks==null&&C.mode==='stun'&&C.kitOpen>0,'dželat: after the whirl his head spins');
 put(330,1);run(2);ok(C.ks==='skok'&&!C.grounded,'dželat: from half his strength he leaps with the axe from above');p.x-=300;run(80);C.grounded=true;C.y=A.y;run(2);
 ok(C.zabio&&C.kitOpen>1.5&&C.mode==='stun','dželat: missed, the axe is buried and he stands open');
 put(400,0);C.p3=true;K.phase3(C);ok(C.ks==='bes','dželat: at a third he tears off his hood');run(120*2);ok(C.ks==null,'dželat: and comes on');ok(api.draw()===null,'dželat: draws without an error');}
{const w=await start('tvrdjava');const {p}=api.state();const C=w.enemies.find(e=>e.champion&&e.kit==='hasan'),A=C.arena,K=api.KITS.hasan;C.alive=true;C.p2=true;
 Object.assign(C,{x:A.x0+600,y:A.y,vx:0,grounded:true,mode:'idle',ks:null,kt:0,kc:0,kn:0,stun:0,face:-1});Object.assign(p,{x:C.x-150,y:A.y,vx:0,vy:0,grounded:true,invuln:0,hp:p.maxHp});
 const run=n=>{for(let i=0;i<n;i++){C.kt-=1/120;K.step(C,1/120,p.x-C.x,Math.abs(p.x-C.x));C.x+=C.vx/120;}};
 run(2);ok(C.ks==='tresak','hasan: from the second act, with Marko near, the mace goes up for the ground');const hp=p.hp;run(120);ok(p.hp<hp&&C.ks==null&&C.kitOpen>0,'hasan: the crash runs along the ground and hurts him who stands on it; then the aga is open');
 C.p3=true;K.phase3(C);ok(C.ks==='bes','hasan: at a third he rages');ok(api.draw()===null,'hasan: draws without an error');}
// ---- K then J: the backhand blow ----
{storage.set('marko-skills',JSON.stringify(['niz','zamah']));const w=await start('selo');const {p}=api.state();step(5);
 const foe={id:9998,x:p.x+92,y:p.y,vx:0,vy:0,w:36,h:75,hp:900,maxHp:900,type:'sword',zone:w.enemies[0]?.zone??0,face:-1,mode:'idle',timer:99,stun:0,flash:0,alive:true,home:p.x+92,attackId:0,grounded:true};w.enemies.push(foe);p.face=1;
 press('KeyK');step(2);release('KeyK');ok(p.attackKind==='heavy','combo: K, the heavy swing');
 until(()=>p.attack<.19,120,'the heavy swing');foe.timer=99;foe.stun=0;tap('KeyJ');until(()=>p.attackKind==='povratni',60,'the backhand');ok(true,'combo: J at the end of the heavy swing and the mace comes back up (K J)');
 until(()=>foe.air||!foe.alive,120,'the launch');ok(foe.air&&foe.vy<0,'combo: the backhand throws the foe into the air');storage.delete('marko-skills');}
// ---- the pictures between the pohodi give nothing away ----
{const R=api.PRELAZ_RED;ok(R.suma.filter(e=>!e.kad).every(e=>!/ustrel|strel|poter/i.test(e.text||''))&&R.suma.some(e=>e.kad==='ustreljen')&&R.suma.some(e=>e.kad==='trap:gnezdo'),'pictures: before the forest nothing of the arrows or the chase; the vila and the burning beech are shown when they happen');
 ok(R.manastir.some(e=>e.kad==='kraj'&&e.i===1)&&R.mocvara.some(e=>e.kad==='soko')&&R.rusevine.some(e=>e.kad==='kavezi'),'pictures: the judgment, the bound wing and the kolo wait for their moment');}
console.log(`\n${checks} checks passed.`);
