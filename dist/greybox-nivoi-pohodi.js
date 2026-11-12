// ================= Lost Crown pohodi za sve pohode igre (…/index.html?greybox=4 i dalje; motor je greybox.js) =================
// Isti oblik podataka kao greybox-nivoi.js: sobe na mreži 1200×720 ([id, ime, kolona, red, širina, visina, opcije]; red 0 je
// drum, iznad su zidovi i kule, ispod podrumi i pećine), vrata, rupe, brda, build(B) i `veze` sa uputstvom kako ih test prelazi.
// Ovde ih ne piše ruka nego mali alat (`kit`): dimnjak, ispust za krilo, ponor za juriš, vrata za Vilin trag, napukli i lažni
// zid, prečica sa polugom. Svaki pomoćnik postavi blokove i u istom potezu zapiše vezu, pa soba, test i mapa uvek pričaju isto.
// Nivoi idu redom priče (JOURNEY u game.js), posle tri nivoa iz greybox-nivoi.js: ?greybox=4 je Kosovsko selo.
// Od igre Lost Crown je uzeta samo ideja strukture; sobe, imena i priča su iz pesama o Marku (pesme/) i iz pohoda ove igre.
// Biom (`biom`) je iz manifesta realističnih slika (podgradje, urvina, klisura); `zeljeniBiom` kaže koji bi crtež tu išao.
// Kuka dok greybox.js nema registar: ovaj fajl sam doda svoje nivoe u GB_NIVOI (world.js ga uvozi samo u pregledaču).
import{GB_NIVOI}from'./greybox-nivoi.js';
import{lik}from'./zamke.js';

const CW=1200,CH=720;
export const FY=row=>(row+1)*CH-130;   // pod reda: red 0 → 590, red -1 → -130, red 1 → 1310
const F0=FY(0);

// bosovi iz BOSSES (world.js) sa svojim nameštajem arene; snaga je oko pola, kao kod greybox bosova
const BOS={
 oklopnik:{type:'oklopnik',name:'Hasan-aga Oklopnik',hp:1000,kit:'hasan',look:'hasan-aga',arena:(a,pl)=>{a.block(.13,70,95,{pillar:true});a.block(.87,70,95,{pillar:true});pl(.5,175);}},
 akindzija:{type:'akindzija',name:'Akindžijski beg',hp:800,kit:'beg',look:'beg',arena:(a,pl)=>{pl(.3,140);pl(.7,140);}},
 palikuca:{type:'palikuca',name:'Ognjeni aga',hp:760,kit:'ognjeni',look:'ognjeni-aga',arena:(a,pl)=>{pl(.2,120);pl(.5,195);pl(.8,120);}},
 shield:{type:'shield',name:'Bajraktar sa štitom',hp:880,kit:'bajraktar',look:'bajraktar',arena:(a,pl)=>{pl(.45,150,130);}},
 sword:{type:'sword',name:'Janičarski aga',hp:780,kit:'janicar',look:'janicarski-aga',arena:(a,pl)=>{pl(.16,150);pl(.4,265,140);pl(.64,150);pl(.86,240,140);}},
 lovac:{type:'sword',name:'Lovac-aga',hp:760,kit:'lovac',look:'lovac-aga',arena:(a,pl)=>{pl(.35,150);pl(.65,150);}},
 azdaja:{type:'azdaja',name:'Aždaja',hp:1500,kit:'azdaja',scale:1,arena:(a,pl)=>{a.block(.2,70,110,{pillar:true});a.block(.45,70,110,{pillar:true});pl(.32,170,130);pl(.68,175,170);},x:.8},
 dzelat:{type:'dzelat',name:'Dželat',hp:1100,kit:'dzelat',scale:1,arena:(a,pl)=>{pl(.25,140);pl(.5,140);pl(.75,140);pl(.38,260,120);pl(.62,260,120);}},
 djemo:{type:'djemo',name:'Đemo Brđanin',hp:1000,kit:'djemo',scale:1,arena:(a,pl)=>{pl(.3,150);pl(.7,150);}},
 trio:{type:'sword',name:'Tri janičara',hp:480,kit:'trio',scale:1.15,arena:(a,pl)=>{pl(.5,160,170);}},
 kopljanik:{type:'kopljanik',name:'Kopljanik-baša',hp:860,kit:'kopljanik',scale:1.3,look:'kopljanik-basa',arena:(a,pl)=>{pl(.35,150);pl(.65,150);}},
 arapin:{type:'arapin',name:'Arapin',hp:1200,kit:'arapin',scale:1,arena:(a,pl)=>{pl(.3,150);pl(.7,150);}},
 basa:{type:'tufekdzija',name:'Tufekdžija-baša',hp:700,kit:'basa',scale:1.3,look:'basa',arena:(a,pl)=>{pl(.3,140);pl(.55,140);pl(.8,150);}}
};

// ---------- the kit: rooms by name, and the passages written once for the build, the map and the test ----------
function kit(sobe){
 const R={};for(const [id,name,gx,gy,w,h,o={}] of sobe)R[id]={id,name,gx,gy,w,h,x0:gx*CW,x1:(gx+w)*CW,y0:gy*CH,floor:FY(gy+h-1),top:gy,bottom:gy+h-1,...o};
 const K={R,vrata:[],rupe:[],veze:[],delovi:{},ops:[],brda:{},n:{borbe:0,likovi:0,zamke:0,krilo:0,nalet:0,trag:0,lomljiv:0,lazni:0,precica:0}};
 const room=id=>{const r=R[id];if(!r)throw new Error(`nema sobe ${id}`);return r;};
 const node=(id,row)=>{const r=room(id);row??=r.bottom;if(row<r.top||row>r.bottom)throw new Error(`${id} nema red ${row}`);return r.h>1?`${id}@${row}`:id;};
 const X=(id,dx)=>room(id).x0+dx;
 const op=f=>K.ops.push(f);
 Object.assign(K,{node,X,
  // ---- passages ----
  door(a,b,row,o={}){row??=Math.max(room(a).top,room(b).top);if(room(a).x1!==room(b).x0)throw new Error(`${a} i ${b} nisu susedi`);node(a,row);node(b,row);K.vrata.push([a,b,row,o]);return K;},
  // a hole in the floor down into the room below (its node is `to`)
  drop(id,dx0,dx1,to,o={}){K.rupe.push([id,dx0,dx1,{to,...o}]);return K;},
  // a hole with nothing under it but stakes: the game's pit rule (a fall costs health and Marko is back on the edge)
  pit(id,dx0,dx1,o={}){const r=room(id),name=o.name||`pit-${id}-${dx0}`;K.rupe.push([id,dx0,dx1,o.lip?{lip:o.lip}:{}]);op(B=>B.pit(name,r.x0+dx0,r.x0+dx1,r.floor+150));return name;},
  // two walls 150 px apart climbed wall to wall, from a floor up to the row above; in a tall room the row above gets a
  // walkway on both sides, between two rooms the chimney rises through a hole in the upper room's floor
  chimney(id,dx,o={}){const r=room(id),x=r.x0+dx,name=`ch-${id}-${dx}`,upper=o.upper;
   if(upper){const u=room(upper),top=u.floor,bottom=r.floor-150;if(x+40<u.x0+40||x+190>u.x1-40)throw new Error(`dimnjak iz ${id} nije ispod sobe ${upper}`);K.rupe.push([upper,x+40-u.x0,x+190-u.x0,{to:node(id)}]);op(B=>B.chimney(name,x,top,bottom));
    K.veze.push([node(id),node(upper),null,true,{chimney:[name,x+430]}]);return K;}
   const row=o.row??r.bottom,rowTop=row-1,top=FY(rowTop),bottom=FY(row)-150;
   op(B=>{B.chimney(name,x,top,bottom);if(x>r.x0+20)B.block(r.x0+20,top,x-r.x0-20,40);if(x+230<r.x1-20)B.block(x+230,top,r.x1-20-x-230,40);});
   const exit=x+230+200<r.x1-60?x+430:x-200;
   K.veze.push([node(id,rowTop+1),node(id,rowTop),null,true,{chimney:[name,exit]}],[node(id,rowTop),node(id,rowTop+1),null,true,{walk:[exit>x?x+330:x-120,top,x+115],wait:150}]);return K;},
  // the wing's ledge (365 px up, one jump does 266) and a walkway one row up whose edge is caught with the wing again;
  // in a tall room from the row `row` to the one above it, between rooms through a hole in the upper room's floor
  wing(id,dx,o={}){const r=room(id);K.n.krilo++;
   if(o.upper){const u=room(o.upper),hx=r.x0+dx,lx=hx+190,F=r.floor;if(hx<u.x0+200||hx+300>u.x1-20)throw new Error(`krilo iz ${id} nije ispod sobe ${o.upper}`);K.rupe.push([o.upper,hx-u.x0,hx+300-u.x0,{to:node(id)}]);op(B=>B.ledge(lx,F-365,100,{gbGate:'krilo'}));
    K.veze.push([node(id),node(o.upper),'krilo',true,{up:[['floor',F,1,[lx+50,F-365]],[[lx+50,F-365],[hx-150,u.floor],-1]]}]);return K;}
   const row=o.row??r.bottom,F=FY(row),x=r.x0+dx,top=FY(row-1),w=o.w??r.x1-20-(x+250);
   op(B=>{B.ledge(x,F-365,100,{gbGate:'krilo'});B.block(x+250,top,w,40);});
   K.veze.push([node(id,row),node(id,row-1),'krilo',true,{up:[['floor',F,1,[x+50,F-365]],[[x+50,F-365],[x+250+Math.min(100,w/2),top],1]]}],
    [node(id,row-1),node(id,row),null,true,{walk:[x+250+Math.min(100,w/2),top,x+150],wait:150}]);return K;},
  // an abyss of 500 px that only the dash crosses; the far side is its own node (`soba>`)
  dash(id,dx0,o={}){const r=room(id),F=r.floor,x0=r.x0+dx0,name=`pit-${id}-${dx0}`,part=`${id}>`;K.n.nalet++;
   if(dx0<620||x0+700>r.x1)throw new Error(`ponor u ${id} nema zaleta`);
   K.rupe.push([id,dx0,dx0+500,{lip:'R'}]);K.delovi[part]={room:id,x0:x0+500};op(B=>B.pit(name,x0,x0+500,F+150));
   K.veze.push([node(id),part,'nalet',false,{leap:[name,1,F,x0+700,x0-200]}]);return part;},
  // a door on a far switch (1100 px away) between two neighbouring rooms: only the fairy's trace gets Marko through
  trace(id,to,o={}){const a=room(id),b=room(to),right=a.x1===b.x0;if(!right&&b.x1!==a.x0)throw new Error(`${id} i ${to} nisu susedi`);K.n.trag++;
   const row=o.row??Math.max(a.top,b.top),F=FY(row),x=right?a.x1:a.x0,name=`vrata-${id}-${to}`,dq=right?x-60:x+16,sw=right?x-1100:x+1100,stand=right?x-130:x+130;
   op(B=>{B.open(x,F-260,F);B.door(name,dq,F-260,F,{x:sw,y:F});});
   K.veze.push([o.from||node(id,row),node(to,row),'trag',true,{trace:[name,[stand,F]]}],[node(to,row),o.from||node(id,row),null,true,{open:name,walk:[right?x+300:x-300,F,right?x-400:x+400]}]);return K;},
  // a cracked wall (the heavy blow, K) or a wall that is not there at all, between two neighbouring rooms
  crack(id,to,o={}){const a=room(id),b=room(to),right=a.x1===b.x0,row=o.row??Math.max(a.top,b.top),F=FY(row),x=right?a.x1:a.x0,name=`zid-${id}-${to}`;K.n.lomljiv++;
   op(B=>{B.open(x,F-205,F);B.breakable(name,x,F);});K.veze.push([node(id,row),node(to,row),null,false,{break:[name,right?x-150:x+150,F,right?x+600:x-600]}]);return K;},
  fake(id,to,o={}){const a=room(id),b=room(to),right=a.x1===b.x0,row=o.row??Math.max(a.top,b.top),F=FY(row),x=right?a.x1:a.x0,name=`lazni-${id}-${to}`;K.n.lazni++;
   op(B=>{B.open(x,F-200,F);B.fake(name,x-20,F-200,60,200);});K.veze.push([node(id,row),node(to,row),null,false,{walk:[right?x-250:x+250,F,right?x+550:x-550],back:[right?x+550:x-550,F,right?x-250:x+250]}]);return K;},
  // a shortcut: a gate in the door from a to b whose lever stands on b's side; it opens once Marko comes round to b
  gate(a,b,row,o={}){const A=room(a);row??=Math.max(A.top,room(b).top);const F=FY(row),name=`kapija-${a}-${b}`;K.n.precica++;
   K.door(a,b,row,{...o,need:`posle:${node(b,row)}`});op(B=>B.gate(name,A.x1-60,row*CH,F,{x:A.x1+80,y:F}));return K;},
  // ---- what stands in the rooms ----
  ckpt:(id,dx,row)=>op(B=>B.ckpt(X(id,dx),FY(row??room(id).bottom))),
  shrine:(moc,id,dx,row)=>op(B=>B.shrine(moc,X(id,dx),FY(row??room(id).bottom))),
  heart:(id,dx,row,dy=0)=>op(B=>B.heart(X(id,dx),FY(row??room(id).bottom)-dy)),
  cudo:(id,dx,name,row)=>op(B=>B.cudo(X(id,dx),FY(row??room(id).bottom),name)),
  prop:(pid,id,dx,h,row)=>op(B=>B.prop(pid,X(id,dx),FY(row??room(id).bottom),h)),
  block:(id,dx,dy,w,h,row,o)=>op(B=>B.block(X(id,dx),FY(row??room(id).bottom)-dy,w,h,o)),
  plank:(id,dx,dy,w,row)=>op(B=>B.plank(X(id,dx),FY(row??room(id).bottom)-dy,w)),
  // a fight: a band of the land's foes; [type, dx, dy] each, dy for one standing on a block
  borba(id,foes,row){K.n.borbe++;op(B=>{for(const [type,dx,dy=0] of foes)B.foe(type,X(id,dx),FY(row??room(id).bottom)-dy);});return K;},
  // traps from zamke.js and the game's own
  spikes:(id,dx,w,row)=>op(B=>B.spikes(X(id,dx),FY(row??room(id).bottom),w)),
  crumble:(id,dx,w,row,dy=0)=>op(B=>B.crumble(X(id,dx),FY(row??room(id).bottom)-dy,w)),
  strelnica(id,dx,o={}){K.n.zamke++;const F=FY(o.row??room(id).bottom);op(B=>B.strelnica({x:X(id,dx),y:F-(o.low?26:40),gy:F,dir:o.dir??-1,every:o.every??2.6,phase:o.phase??0}));return K;},
  // a beam that slides over a pit of stakes: the pit is a hole, the beam carries Marko across
  greda(id,dx,o={}){K.n.zamke++;const r=room(id),F=FY(o.row??r.bottom),w=o.w??140,x=r.x0+dx,span=o.span??260,pw=span+w;
   K.pit(id,dx,dx+pw,{name:`pit-greda-${id}-${dx}`});
   op(B=>{const q=B.plank(x,F,w);B.greda(q,{ax:x,bx:x+span,period:o.period??3.4,phase:o.phase??0});});return K;},
  // a guslar who sings the song's verses as Marko comes near, and the song's people, each with a line
  guslar(id,dx,stih,row){K.n.likovi++;op(B=>B.strelnica({zamka:{kind:'guslar',x:X(id,dx),y:FY(row??room(id).bottom),mir:true,state:'ceka',hp:100,stih,t:0}}));return K;},
  lik(id,dx,clip,text,row,o={}){K.n.likovi++;op(B=>B.strelnica({zamka:lik({x:X(id,dx),y:FY(row??room(id).bottom),clip,text,...o})}));return K;},
  // the land's champion in the last room, with his arena furniture
  bos(id,kind,o={}){const r=room(id),S=BOS[kind],y=r.floor,x0=r.x0+40,x1=r.x1-40,len=x1-x0,planks=[],a={block:(k,w,h,bo)=>op(B=>B.block(Math.round(x0+len*k-w/2),y-h,w,h,bo))};
   S.arena(a,(k,dy,w=150)=>planks.push([len*k,dy,w]));K.bosRoom=id;
   op(B=>B.boss(S.type,Math.round(x0+len*(S.x??.68)),y,{hp:o.hp??S.hp,maxHp:o.hp??S.hp,name:o.name||S.name,kit:S.kit,look:S.look,scale:S.scale??1.35},{x0,x1,y},planks));return K;}});
 return K;}

// one level from its words: the kit runs once, here, and build(B) replays what it set down
function pohod(def){const K=kit(def.sobe);def.gradi(K);
 // a door out of the right side of a room whose far part lies past an abyss leaves from that part
 // a hole must not open over another hole in the floor below it
 for(const [id,a,b,o] of K.rupe){if(!o.to)continue;const r=K.R[id],t=K.R[o.to.split('@')[0]];for(const [id2,a2,b2] of K.rupe)if(id2===t.id&&r.x0+a<t.x0+b2&&t.x0+a2<r.x0+b)throw new Error(`${def.id}: rupa u ${id} (${a}–${b}) pada u rupu u ${id2} (${a2}–${b2})`);}
 // the champion's arena closes behind Marko: the door into it goes one way
 for(const v of K.vrata)if(v[1]===K.bosRoom)v[3].oneway=true;
 for(const v of K.vrata){const [a,,row,o]=v;if(o.na)continue;for(const [name,d] of Object.entries(K.delovi))if(d.room===a&&d.x1==null&&row===K.R[a].bottom)o.na=name;}
 const{gradi,...rest}=def;
 return{...rest,vrata:K.vrata,rupe:K.rupe,delovi:K.delovi,veze:K.veze,brda:def.brda||{},broj:K.n,bosSoba:K.bosRoom,build(B){for(const f of K.ops)f(B);}};}

export const GB_POHODI={
// ---------------------------------------------------------------------------------------------------------------------
// 4 · Kosovsko selo („Jao Šaro, moje desno krilo“): selo pod turskom stražom, kapija zatvorena iznutra. Marko ulazi preko
// osmatračnice i palisade, spušta se na trg i otvara kapiju (prečica); Sokolovo krilo čeka u Šarčevoj štali, dole kraj bunara,
// a sa njim se penje na zvonik i na kulu nad bunarom, gde čeka Kopljanik-baša.
4:pohod({id:'selo',ime:'Kosovsko selo',biom:'podgradje',zeljeniBiom:'selo',daje:'krilo',pocetne:[],
 cilj:'Uđi u selo, nađi Šarčevu štalu i popni se na kulu nad bunarom',start:'livada',spawnDx:260,
 uvod:'Kosovsko selo. Kapija je zatvorena iznutra, a na kuli nad bunarom sedi Kopljanik-baša. Sokolovo krilo čeka u Šarčevoj štali; uđi preko osmatračnice.',
 sobe:[
  ['livada','Livada pred selom',-1,0,1,1],
  ['put','Seoski put',0,0,1,1],
  ['straza','Osmatračnica',1,-1,1,2],
  ['kapija','Seoska kapija',2,0,1,1],
  ['palisada','Palisada',2,-1,2,1],
  ['trg','Seoski trg',3,0,2,1],
  ['krcma','Krčma',4,-1,1,1,{interior:true}],
  ['tavan','Tavan krčme',4,-2,1,1,{secret:true,interior:true,lore:'Tavan krčme. Ovde je krčmar krio Markovo vino od Turaka; bure je i danas puno.'}],
  ['crkva','Crkva',5,-2,1,3,{interior:true}],
  ['zvonara','Zvonara',6,-2,1,1,{secret:true,interior:true,lore:'Zvonara. Zvono su seljaci zakopali kad su došli Turci, a Marko ga je iskopao i vratio na zvonik.'}],
  ['sokak','Sokak',6,0,1,1],
  ['kovacnica','Kovačnica',6,-1,1,1,{interior:true}],
  ['vocnjak','Voćnjak',7,0,2,1],
  ['bunar','Bunar',9,-1,1,4],
  ['kula','Kula nad bunarom',10,-1,1,1],
  ['podrum','Podrum pod trgom',3,1,2,1,{interior:true}],
  ['vinski','Vinski podrum',2,1,1,1,{secret:true,interior:true,lore:'Vinski podrum. Tri bureta: jedno za Marka, jedno za Šarca, jedno za onoga ko ih nađe.'}],
  ['tunel','Stari tunel',5,1,2,1,{interior:true}],
  ['stala','Šarčeva štala',7,1,2,1,{interior:true}],
  ['izvor','Izvor pod bunarom',8,2,1,1,{interior:true}],
  ['riznica','Seoska riznica',10,1,1,1,{secret:true,interior:true,lore:'Seoska riznica. Dukati za otkup roblja; Marko ih je vratio selu kad je oterao Kopljanik-bašu.'}]],
 brda:{livada:[[500,900,40]],vocnjak:[[300,900,50],[1500,2100,-40]]},
 gradi(K){
  // Livada: početak, guslar peva o Šarcu, prvi čekpoint
  K.guslar('livada',760,['Jao Šaro, moje desno krilo,','čistim ću te srebrom potkovati,','čistim srebrom i žeženim zlatom.']);K.prop('drvo','livada',1050,300);
  K.door('livada','put',0);
  // Seoski put: prva borba (janičar i strelac na kamenu), putnica koja beži iz sela
  K.block('put',700,120,200,120);K.borba('put',[['sword',500],['archer',800,120]]);K.lik('put',250,'putnica-idle','Ne idi kroz kapiju, junače! Zatvorili su je iznutra. Popni se na osmatračnicu.');
  K.door('put','straza',0);
  // Osmatračnica: dimnjak do palisade
  K.chimney('straza',500);K.door('straza','kapija',0);K.door('straza','palisada',-1);
  // Kapija: zatvorena iznutra; poluga je na trgu (prečica)
  K.gate('kapija','trg',0);K.prop('kapija','kapija',600,260);
  // Palisada: strelci na zupcima, strelnica u zidu krčme, rupa na trg
  K.block('palisada',600,120,100,120,-1);K.block('palisada',1700,120,100,120,-1);K.borba('palisada',[['archer',650,120],['archer',1750,120],['sword',1200]],-1);
  K.strelnica('palisada',2380,{row:-1,every:2.8});K.drop('palisada',1300,1550,'trg');K.door('palisada','krcma',-1);
  // Krčma: krčmarica Janja; krilo kroz rupu u tavanu
  K.lik('krcma',500,'janja-idle','Marko! Tvoje vino je na tavanu, ali do tavana bez krila ne stižeš.',-1);K.wing('krcma',300,{upper:'tavan'});K.heart('tavan',800,-2);
  K.drop('krcma',1000,1150,'trg');
  // Trg: druga borba, sirotinja, drugi čekpoint, rupa u podrum
  K.ckpt('trg',350);K.borba('trg',[['sword',800],['akindzija',1150],['sword',1950]]);K.lik('trg',600,'sirotinja-ceka','Turci su nam uzeli i hleb i dukate. Bog da te čuva, Marko.');
  K.drop('trg',1500,1700,'podrum');K.door('trg','crkva',0);
  // Crkva: dimnjak, pa krilo do zvonika; iza zvonika zvonara
  K.chimney('crkva',700);K.wing('crkva',300,{row:-1});K.door('crkva','kovacnica',-1);K.door('crkva','zvonara',-2);K.door('crkva','sokak',0);
  K.lik('crkva',350,'putnik-kaluder-idle','Kaluđer: Zvono je zakopano, a zvonara gore zaključana visinom. Krilo, sine.',0);
  // Kovačnica: Novak kuje; čudo; dole u sokak rupa
  K.lik('kovacnica',700,'novak-kuje','Novak kovač: Potkovaću ti Šarca srebrom, Marko, kad oteraš bašu.',-1);K.cudo('kovacnica',1000,'Srebrne potkovice',-1);K.drop('kovacnica',150,400,'sokak');
  // Sokak i Voćnjak: treća borba, šiljci, greda nad jamom
  K.borba('sokak',[['sword',500],['archer',900]]);K.spikes('sokak',700,120);K.door('sokak','vocnjak',0);
  K.borba('vocnjak',[['akindzija',600],['sword',1300],['pas',1700]]);K.greda('vocnjak',950,{span:200});
  // Bunar: od izvora do kule, krilom (dole) i dimnjakom (gore)
  K.chimney('bunar',300,{row:2});K.chimney('bunar',750,{row:1});K.wing('bunar',350,{row:0});K.door('bunar','kula',-1,{oneway:true});K.door('stala','bunar',1);K.door('vocnjak','bunar',0);
  // Kula nad bunarom: Kopljanik-baša
  K.bos('kula','kopljanik');
  // Podrum pod trgom: psi, lažni zid ka vinskom podrumu, prolaz u tunel
  K.borba('podrum',[['pas',700],['pas',1000],['sword',1600]]);K.fake('podrum','vinski');K.heart('vinski',500,1);K.door('podrum','tunel',1);
  // Tunel: daske koje popuštaju nad jamom, strelnica
  K.crumble('tunel',800,180,1);K.crumble('tunel',980,180,1);K.pit('tunel',800,1160);K.strelnica('tunel',2380,{every:2.4});K.door('tunel','stala',1);
  // Šarčeva štala: krilo, treći čekpoint; Šarac čeka (volovi kao stoka u štali)
  K.ckpt('stala',300,1);K.shrine('krilo','stala',700,1);K.lik('stala',1500,'volovi-plug','Šarac je odveden na kulu nad bunarom, a ovde su ostali samo volovi.',1);
  // Izvor pod bunarom i riznica: napukli zid
  K.door('izvor','bunar',2);K.heart('izvor',400,2);K.crack('bunar','riznica',{row:1});K.cudo('riznica',700,'Seoski dukati',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 5 · Manastirski vis („Uroš i Mrnjavčevići“): četiri tabora na brdu kod crkve Samodreže, Marko ih obilazi gornjim putem
// i spušta se u manastirski dvor (prečica do kapije). U kripti mu Ravijojla daje juriš u vazduhu; njime se prelazi provalija
// pod manastirom do gubilišta, gde čeka Dželat, i ponor u kripti do isposnice.
5:pohod({id:'manastir',ime:'Manastirski vis',biom:'klisura',zeljeniBiom:'manastir',daje:'nalet',pocetne:['krilo'],
 cilj:'Obiđi četiri tabora, nađi juriš u kripti i pređi provaliju do gubilišta',start:'podnozje',spawnDx:260,
 uvod:'Manastirski vis. Četiri tabora stoje oko crkve Samodreže, a manastirska kapija je zaključana iznutra. Juriš u vazduhu čeka u kripti; bez njega se provalija do gubilišta ne prelazi.',
 sobe:[
  ['podnozje','Podnožje brda',-1,0,1,1],
  ['staza','Staza uz brdo',0,0,2,1],
  ['tabor1','Tabor kralja Vukašina',0,-1,1,1],
  ['tabor2','Tabor despota Uglješe',1,-1,1,1],
  ['tabor3','Tabor vojvode Gojka',2,-1,1,1],
  ['tabor4','Tabor cara Uroša',3,-1,1,1],
  ['konak','Konak',2,0,1,1,{interior:true}],
  ['porta','Manastirska kapija',3,0,1,1],
  ['dvor','Manastirski dvor',4,0,2,1],
  ['kelije','Kelije',4,-1,1,1,{interior:true}],
  ['trpezarija','Trpezarija',5,-1,1,1,{interior:true}],
  ['knjige','Knjige starostavne',5,-2,1,1,{secret:true,interior:true,lore:'Knjige starostavne. Marko ih je čitao i znao čije je carstvo; zato ga je otac jurio oko crkve.'}],
  ['crkva','Crkva Samodreža',6,-2,1,3,{interior:true}],
  ['riznica','Crkvena riznica',7,-2,1,1,{secret:true,interior:true,lore:'Crkvena riznica. U direku je i danas Vukašinov handžar; iz rane u drvetu kanula je krv.'}],
  ['vinograd','Manastirski vinograd',7,-1,2,1],
  ['klisura','Provalija pod manastirom',7,0,2,1],
  ['gubiliste','Gubilište',9,0,1,1],
  ['podrum','Podrum konaka',2,1,1,1,{interior:true}],
  ['kosturnica','Kosturnica',3,1,1,1,{secret:true,interior:true,lore:'Kosturnica. Kosti kaluđera koje su Turci posekli; Marko je zapalio sveću za svakog.'}],
  ['kripta','Kripta',4,1,2,1,{interior:true}],
  ['isposnica','Isposnica',6,1,1,1,{secret:true,interior:true,lore:'Isposnica. Ovde se iguman molio četrdeset dana da Marko presudi po pravdi.'}]],
 brda:{podnozje:[[500,900,40]],staza:[[1000,1400,50]],vinograd:[[200,700,40]]},
 gradi(K){
  // Podnožje i staza: guslar peva Jevrosimin savet; prva borba; krilo do prvog tabora
  K.guslar('podnozje',760,['Nemoj, sine, govoriti krivo,','ni po babu, ni po stričevima,','već po pravdi Boga istinoga.']);K.prop('krst','podnozje',1000,170);K.door('podnozje','staza',0);
  K.block('staza',1700,120,200,120);K.borba('staza',[['sword',1200],['archer',1800,120]]);K.wing('staza',500,{upper:'tabor1'});K.door('staza','konak',0);
  // Četiri tabora: gornji put do kelija
  K.door('tabor1','tabor2',-1);K.lik('tabor1',600,'putnik-starac-idle','Vukašinov sluga: Kralj hoće carstvo za sebe. Samo Marko zna šta piše u knjigama.',-1);
  K.borba('tabor2',[['shield',400],['sword',850]],-1);K.door('tabor2','tabor3',-1);
  K.strelnica('tabor3',1180,{row:-1,every:2.6});K.spikes('tabor3',500,120,-1);K.door('tabor3','tabor4',-1);
  K.lik('tabor4',600,'putnik-kaluder-idle','Car Uroš: Kaži, Marko, po pravdi, čije je carstvo. Tebe će svi poslušati.',-1);K.door('tabor4','kelije',-1);
  // Konak: majka Jevrosima; rupa u podrum
  K.lik('konak',400,'putnica-idle','Jevrosima: Ne govori krivo, sine, ni po babu ni po stričevima. Kapija je zaključana; idi gornjim putem.');
  K.drop('konak',900,1100,'podrum');K.door('konak','porta',0);
  // Kapija: zaključana iznutra, poluga u dvoru
  K.gate('porta','dvor',0);K.prop('kapija','porta',600,260);
  // Kelije: rupa u dvor; trpezarija: borba i krilo do knjiga
  K.drop('kelije',200,400,'dvor');K.door('kelije','trpezarija',-1);
  K.borba('trpezarija',[['sword',800],['shield',1050]],-1);K.wing('trpezarija',250,{upper:'knjige'});K.cudo('knjige',800,'Knjige starostavne',-2);K.door('trpezarija','crkva',-1);
  // Dvor: borba, kaluđer, čekpoint; rupa u kriptu
  K.ckpt('dvor',1600);K.borba('dvor',[['shield',1900],['oklopnik',2150]]);K.lik('dvor',1450,'putnik-kaluder-idle','Kaluđer: Bež’ u crkvu, Marko! Otac te juri sa handžarom.');
  K.drop('dvor',500,700,'kripta');K.door('dvor','crkva',0);
  // Crkva: dimnjak i krilo do kubeta; napukli zid do riznice
  K.chimney('crkva',700);K.wing('crkva',300,{row:-1});K.crack('crkva','riznica',{row:-2});K.cudo('riznica',600,'Vukašinov handžar',-2);
  K.door('crkva','vinograd',-1);K.door('crkva','klisura',0);
  // Vinograd: borba, greda nad jamom, deo srca
  K.block('vinograd',1900,120,160,120,-1);K.borba('vinograd',[['archer',1950,120],['sword',900],['oklopnik',700]],-1);K.greda('vinograd',1150,{span:220,row:-1});K.heart('vinograd',2200,-1,120);
  // Provalija: samo juriš je prelazi; gubilište i Dželat
  K.dash('klisura',700);K.door('klisura','gubiliste',0);K.bos('gubiliste','dzelat');K.lik('klisura',300,'sirotinja-ceka','Na gubilištu seku sve koji ne daju harač. Provalija je široka i za krilo.');
  // Podrum konaka: šiljci, daske koje popuštaju, dimnjak gore; napukli zid do kosturnice
  K.chimney('podrum',250,{upper:'konak'});K.spikes('podrum',550,100);K.crumble('podrum',700,150,1,0);K.heart('podrum',1000,1);K.crack('podrum','kosturnica',{row:1});K.cudo('kosturnica',700,'Sveća za pale',1);
  // Kripta: čekpoint, juriš; dimnjak u dvor; ponor do isposnice
  K.ckpt('kripta',300);K.shrine('nalet','kripta',650);K.chimney('kripta',1000,{upper:'dvor'});K.dash('kripta',1250);K.door('kripta','isposnica',1);K.heart('isposnica',600,1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 6 · Oranje drumova („Oranje Marka Kraljevića“): Marko ore careve drumove, janičari gaze oranje. Han na drumu ima zadnja
// vrata na daleki prekidač; Vilin trag čeka u podrumu hana, ispod jarka. Iza hana su carski drum, srušen most i turski
// tabor sa tri tovara blaga, gde čekaju Tri janičara. Tovari su skriveni: u karauli, u vodenici i pod taborom.
6:pohod({id:'oranje',ime:'Oranje drumova',biom:'podgradje',zeljeniBiom:'oranje',daje:'trag',pocetne:['krilo','nalet'],
 cilj:'Nađi Vilin trag pod hanom, prođi zadnja vrata hana i stigni do turskog tabora',start:'dom',spawnDx:240,
 uvod:'Oranje drumova. Majka kaže: ostavi četovanje, uzmi plug i volove. Ali drum gaze janičari, a zadnja vrata hana otvara daleki prekidač. Vilin trag je u podrumu hana.',
 sobe:[
  ['dom','Markov dom',-1,0,1,1],
  ['njiva','Njiva',0,0,2,1],
  ['brdo','Brdo nad njivom',0,-1,2,1],
  ['vetrenjaca','Vetrenjača',2,-1,1,1,{interior:true}],
  ['osmatracnica','Turska osmatračnica',3,-1,1,1],
  ['tavan','Tavan hana',4,-1,1,1,{secret:true,interior:true,lore:'Tavan hana. Hančija je ovde krio so i barut od turskih tovara.'}],
  ['drum','Carski drum',2,0,2,1],
  ['han','Han na drumu',4,0,1,1,{interior:true}],
  ['dvoriste','Dvorište hana',5,0,1,1],
  ['ambar','Ambar',5,-1,1,1,{interior:true}],
  ['drum2','Drum ka Vardaru',6,0,2,1],
  ['karaula','Karaula',6,-1,1,1,{secret:true,interior:true,lore:'Karaula. Prvi tovar blaga: careva harač-kesa sa drumova.'}],
  ['most','Srušeni most',8,0,2,1,{set:'reka'}],
  ['tabor','Turski tabor',10,0,1,1],
  ['jazbina','Lisičja jazbina',1,1,1,1,{secret:true,interior:true,lore:'Lisičja jazbina. Lisica je ovde nosila kokoške iz Markovog dvora; Marko joj je oprostio.'}],
  ['jarak','Jarak pod drumom',2,1,2,1,{interior:true}],
  ['podrum','Podrum hana',4,1,1,1,{interior:true}],
  ['potok','Podzemni potok',5,1,2,1,{interior:true}],
  ['vodenica','Stara vodenica',7,1,1,1,{secret:true,interior:true,lore:'Stara vodenica. Drugi tovar blaga: Turci su ga zakopali pod vodenični kamen.'}],
  ['pecina','Pećina pod mostom',8,1,2,1,{interior:true}],
  ['blago','Blago pod taborom',10,1,1,1,{secret:true,interior:true,lore:'Blago pod taborom. Treći tovar: Marko ga je odneo majci, a ona ga razdelila sirotinji.'}]],
 brda:{dom:[[500,900,40]],njiva:[[1200,1700,-40]],drum2:[[300,800,50]]},
 gradi(K){
  // Markov dom: guslar i majka Jevrosima
  K.guslar('dom',820,['„More Marko, ne ori drumova!”','„More Turci, ne gaz’te oranja!”','„To sam tebe danas izorao.”']);
  K.lik('dom',450,'putnica-idle','Jevrosima: Ostavi, sine, četovanje. Uzmi plug i volove, pa ori brda i doline.');K.door('dom','njiva',0);
  // Njiva: volovi, janičari gaze oranje; krilo na brdo
  K.lik('njiva',250,'volovi-plug','Volovi čekaju u brazdi. Janičari su im pregazili oranje.');K.borba('njiva',[['sword',1300],['sword',1650],['pas',1900]]);
  K.wing('njiva',500,{upper:'brdo'});K.door('njiva','drum',0);
  // Brdo, vetrenjača, osmatračnica: gornji put; strelnica, lažni zid do tavana
  K.strelnica('brdo',2380,{row:-1,every:2.8});K.heart('brdo',1500,-1);K.door('brdo','vetrenjaca',-1);
  K.lik('vetrenjaca',600,'putnik-starac-idle','Vodeničar: Vetrenjača melje za Turke. Brašno nose u tabor kraj Vardara.',-1);K.door('vetrenjaca','osmatracnica',-1);
  K.block('osmatracnica',800,120,120,120,-1);K.borba('osmatracnica',[['archer',850,120],['archer',300]],-1);K.drop('osmatracnica',300,500,'drum');K.fake('osmatracnica','tavan',{row:-1});K.cudo('tavan',700,'Hančijina so',-1);
  // Carski drum: čekpoint, borba sa akindžijama; rupa u jarak, dimnjak iz jarka
  K.ckpt('drum',250);K.block('drum',2050,120,180,120);K.borba('drum',[['akindzija',1000],['sword',1800],['archer',2120,120]]);K.drop('drum',600,800,'jarak');K.door('drum','han',0);
  // Han: trgovac; zadnja vrata na daleki prekidač (Vilin trag)
  K.lik('han',600,'putnik-trgovac-idle','Trgovac: Zadnja vrata hana otvara prekidač kraj ulaza, a zatvore se pre nego što stigneš.');K.trace('han','dvoriste');
  // Dvorište i ambar: palikuća pali žito
  K.chimney('dvoriste',300,{upper:'ambar'});K.borba('ambar',[['palikuca',900],['sword',650]],-1);K.heart('ambar',1050,-1);K.door('dvoriste','drum2',0);
  // Drum ka Vardaru: borba, šiljci, krilo do karaule
  K.borba('drum2',[['shield',1000],['sword',1300],['akindzija',1900]]);K.spikes('drum2',1550,120);K.wing('drum2',300,{upper:'karaula'});K.cudo('karaula',800,'Prvi tovar blaga',-1);K.door('drum2','most',0);
  // Srušeni most: juriš preko reke; pećina ispod; turski tabor
  K.drop('most',100,250,'pecina');K.dash('most',1100);K.door('most','tabor',0);K.bos('tabor','trio');
  K.chimney('pecina',300,{upper:'most'});K.borba('pecina',[['pas',900],['pas',1200],['sword',1600]]);K.crack('pecina','blago',{row:1});K.cudo('blago',600,'Treći tovar blaga',1);
  // Jarak: greda nad jamom, daske, dimnjak gore; lažni zid do jazbine
  K.chimney('jarak',1200,{upper:'drum'});K.greda('jarak',1500,{span:220});K.crumble('jarak',300,150,1);K.fake('jarak','jazbina',{row:1});K.heart('jazbina',500,1);K.door('jarak','podrum',1);
  // Podrum hana: Vilin trag, čekpoint; potok i vodenica iza vrata na prekidač
  K.ckpt('podrum',300);K.shrine('trag','podrum',750);K.door('podrum','potok',1);
  K.strelnica('potok',300,{dir:1,every:2.6});K.trace('potok','vodenica');K.cudo('vodenica',700,'Drugi tovar blaga',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 7 · Opsednuta tvrđava („Marko poznaje očinu sablju“): pod tvrđavom na Marici je turski opsadni logor; kapija je zatvorena
// iznutra. Marko prolazi lagumima ispod reke do cisterne, gde čeka Sokolovo krilo, i izlazi iza kapije (prečica).
// Krilom se penje na bedem, do oružarnice sa Vukašinovom sabljom i na kulu Hasan-age.
7:pohod({id:'tvrdjava',ime:'Opsednuta tvrđava',biom:'klisura',zeljeniBiom:'tvrdjava',daje:'krilo',pocetne:[],
 cilj:'Prođi lagumima do cisterne, otvori kapiju i popni se na kulu Hasan-age',start:'logor',spawnDx:260,
 uvod:'Opsednuta tvrđava na Marici. Kapija je zatvorena iznutra. Lagumi idu ispod reke do cisterne; tamo čeka Sokolovo krilo, a sa njim bedem i kula Hasan-age.',
 sobe:[
  ['logor','Opsadni logor',-1,0,1,1],
  ['sanac','Topovski šanac',0,0,2,1],
  ['osmatracnica','Osmatračnica nad šancem',1,-1,1,1],
  ['strazara','Turska stražara',2,-1,1,1,{interior:true}],
  ['sator','Mustaf-agin šator',2,0,1,1,{interior:true}],
  ['obala','Obala Marice',3,0,2,1,{set:'reka'}],
  ['podzid','Pod zidinama',5,0,1,1],
  ['kapija','Tvrđavska kapija',6,0,1,1],
  ['dvoriste','Unutrašnje dvorište',7,0,2,1],
  ['bedem','Bedem',5,-1,3,1],
  ['oruzarnica','Oružarnica',6,-2,1,1,{secret:true,interior:true,lore:'Oružarnica. Sablja sa tri slova: Novaka kovača, Vukašina kralja i Marka. Nikome se ne da izvaditi, a Marku sama iskoči.'}],
  ['barutana','Barutana',8,-1,1,1,{interior:true}],
  ['kula','Kula',9,-2,1,3,{interior:true}],
  ['vrh','Kula Hasan-age',10,-2,1,1],
  ['skroviste','Skrovište',-1,1,1,1,{secret:true,interior:true,lore:'Skrovište. Ovde je Turkinja devojka sakrila ranjenika koga je izvukla iz Marice.'}],
  ['lagum','Lagum',0,1,2,1,{interior:true}],
  ['lagum2','Lagum pod šatorom',2,1,2,1,{interior:true}],
  ['lagum3','Lagum pod Maricom',4,1,2,1,{interior:true}],
  ['cisterna','Cisterna',6,1,1,1,{interior:true}],
  ['tamnica','Tamnica',7,1,1,1,{secret:true,interior:true,lore:'Tamnica. Mustaf-aga je ovde bacio ranjenika kad mu je uzeo sablju; na zidu je urezao tri slova.'}],
  ['izvor','Izvor pod cisternom',6,2,1,1,{interior:true}]],
 brda:{logor:[[500,900,40]],obala:[[200,700,-40]]},
 gradi(K){
  // Opsadni logor: guslar i Novak kovač
  K.guslar('logor',780,['Na sablji su tri slova rišćanska:','jedno slovo Novaka kovača,','drugo slovo Vukašina kralja.']);
  K.lik('logor',450,'novak-kuje','Novak kovač: Tu sablju sam kovao Vukašinu. Samo njegov sin će je izvaditi iz korica.');K.door('logor','sanac',0);
  // Topovski šanac: prva borba, kolje; krilo do osmatračnice, rupa u lagum
  K.block('sanac',2100,120,160,120);K.borba('sanac',[['palikuca',800],['shield',1300],['archer',2150,120]]);K.spikes('sanac',1000,120);
  K.wing('sanac',1500,{upper:'osmatracnica'});K.drop('sanac',300,500,'lagum');K.door('sanac','sator',0);
  K.heart('osmatracnica',900,-1);K.door('osmatracnica','strazara',-1);K.lik('strazara',600,'caus-idle','Čauš: Hasan-aga ne silazi sa kule. Kaže da ga niko ne može dohvatiti.',-1);
  // Šator i obala: devojka sa Marice; druga borba, greda nad rekom
  K.lik('sator',600,'putnica-idle','Devojka: Marica nosi konje i kalpake. Mustaf-aga je ubio ranjenika zbog sablje.');K.door('sator','obala',0);
  K.borba('obala',[['akindzija',500],['sword',1900]]);K.greda('obala',1000,{span:240});K.door('obala','podzid',0);
  // Pod zidinama: strelnica i kolje; kapija zatvorena iznutra
  K.strelnica('podzid',1180,{every:2.4});K.spikes('podzid',600,120);K.gate('podzid','kapija',0);
  // Kapija: krilo na bedem; dvorište sa borbom i čekpointom
  K.wing('kapija',200,{upper:'bedem'});K.door('kapija','dvoriste',0);
  K.ckpt('dvoriste',700);K.borba('dvoriste',[['oklopnik',1300],['shield',1700]]);K.door('dvoriste','kula',0);
  // Bedem: strelci na zupcima, strelnica; krilo do oružarnice; rupe u podzid i dvorište
  K.block('bedem',600,120,100,120,-1);K.block('bedem',2400,120,100,120,-1);K.borba('bedem',[['archer',650,120],['archer',2450,120],['sword',1100]],-1);
  K.strelnica('bedem',3580,{row:-1,every:2.8});K.wing('bedem',1900,{upper:'oruzarnica'});K.cudo('oruzarnica',300,'Vukašinova sablja',-2);
  K.drop('bedem',300,500,'podzid');K.drop('bedem',2700,2900,'dvoriste');K.door('bedem','barutana',-1);
  K.lik('barutana',600,'putnik-starac-idle','Topdžija: Barut je vlažan od Marice. Turci ne mogu da pucaju na kulu.',-1);K.door('barutana','kula',-1);
  // Kula: dimnjak, krilo, Hasan-aga na vrhu
  K.chimney('kula',700);K.wing('kula',300,{row:-1});K.door('kula','vrh',-2);K.bos('vrh','oklopnik');
  // Lagumi: daske nad jamom, borba, greda; lažni zid do skrovišta
  K.crumble('lagum',700,180,1);K.crumble('lagum',880,180,1);K.pit('lagum',700,1060);K.fake('lagum','skroviste',{row:1});K.heart('skroviste',500,1);K.door('lagum','lagum2',1);
  K.borba('lagum2',[['sword',700],['shield',1200],['pas',1700]]);K.spikes('lagum2',2000,100,1);K.door('lagum2','lagum3',1);
  K.greda('lagum3',900,{span:220});K.strelnica('lagum3',2380,{every:2.6});K.door('lagum3','cisterna',1);
  // Cisterna: krilo i čekpoint; dimnjak do kapije; napukli zid do tamnice; izvor ispod
  K.ckpt('cisterna',150);K.shrine('krilo','cisterna',1000);K.chimney('cisterna',660,{upper:'kapija'});K.crack('cisterna','tamnica',{row:1});K.cudo('tamnica',700,'Tri slova',1);
  K.chimney('izvor',340,{upper:'cisterna'});K.heart('izvor',800,2);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 8 · Zaboravljeni podrum („Marko pije uz ramazan vino“): car je zabranio vino uz ramazan, a Marko pije u mehani nad
// starim podrumima. Gvozdena vrata podruma su zatvorena iznutra; put vodi dole, do vrela gde čeka juriš u vazduhu, preko
// ponora pod vinskim podrumom i kroz stari podrum nazad gore, do barutane u kojoj Ognjeni aga hoće da zapali zalihe.
8:pohod({id:'podrum',ime:'Zaboravljeni podrum',biom:'podgradje',zeljeniBiom:'podrum',daje:'nalet',pocetne:['krilo'],
 cilj:'Siđi do vrela po juriš, pređi ponor i otvori gvozdena vrata iznutra',start:'mehana',spawnDx:240,
 uvod:'Zaboravljeni podrum. Car je zabranio vino uz ramazan, a Ognjeni aga hoće da zapali zalihe. Gvozdena vrata su zatvorena iznutra; juriš u vazduhu čeka dole, kraj podzemnog vrela.',
 sobe:[
  ['mehana','Mehana',-1,0,1,1,{interior:true}],
  ['prolaz','Prolaz pod čaršijom',0,0,2,1,{interior:true}],
  ['carsija','Čaršija',0,-1,2,1],
  ['dzamija','Pred džamijom',2,-1,1,1],
  ['krovovi','Krovovi čaršije',2,-2,2,1,{secret:true,lore:'Krovovi čaršije. Odavde je Marko gledao kako hodže i hadžije beže pred njegovom zelenom dolamom.'}],
  ['kafana','Krčma na čaršiji',3,-1,1,1,{interior:true}],
  ['riznica','Careva riznica',4,-1,1,1,{secret:true,interior:true,lore:'Careva riznica. Kesa dukata koju car daje Marku „da se napije vina“, samo da ga ne ljuti.'}],
  ['bacvara','Bačvara',2,0,1,1,{interior:true}],
  ['vinski','Vinski podrum',3,0,2,1,{interior:true}],
  ['gvozdena','Gvozdena vrata',5,0,1,1,{interior:true}],
  ['hodnik','Hodnik stražara',6,0,2,1,{interior:true}],
  ['strazarnica','Stražarnica',7,-1,1,1,{interior:true}],
  ['barutana','Barutana',8,0,1,1,{interior:true}],
  ['grobnica','Grobnica',-1,1,1,1,{secret:true,interior:true,lore:'Grobnica. Ovde leže majstori koji su zidali podrume; svaki je ostavio po jedno bure za dušu.'}],
  ['donji','Donji podrum',0,1,2,1,{interior:true}],
  ['izvor','Podzemno vrelo',1,2,1,1,{interior:true}],
  ['cisterna','Cisterna',2,1,1,1,{interior:true}],
  ['ponor','Ponor pod podrumom',3,1,2,1,{interior:true}],
  ['vinarija','Stara vinarija',5,1,1,1,{interior:true}],
  ['stari','Stari podrum',6,1,2,1,{interior:true}],
  ['tamnica','Careva tamnica',8,1,1,1,{secret:true,interior:true,lore:'Careva tamnica. Ovde je čauš držao one što piju uz ramazan; Marko ih je pustio i počastio.'}]],
 brda:{carsija:[[1500,2100,40]]},
 gradi(K){
  // Mehana: guslar i krčmarica; prolaz sa prvom borbom, krilo do čaršije, rupa u donji podrum
  K.guslar('mehana',800,['Marko nosi zelenu dolamu,','Marko pije uz ramazan vino,','još nagoni odže i adžije.']);
  K.lik('mehana',450,'janja-toci','Krčmarica: Pij, Marko, car je zabranio, ali ovde ga niko ne pita.');K.door('mehana','prolaz',0);
  K.borba('prolaz',[['sword',800],['sword',1400]]);K.wing('prolaz',500,{upper:'carsija'});K.drop('prolaz',200,400,'donji');K.door('prolaz','bacvara',0);
  // Čaršija i džamija: borba, strelnica; čauš čita ferman; krilo na krovove
  K.block('carsija',1000,120,140,120,-1);K.borba('carsija',[['archer',1050,120],['sword',600]],-1);K.strelnica('carsija',2380,{row:-1,every:2.8});K.drop('carsija',1300,1500,'prolaz');K.door('carsija','dzamija',-1);
  K.lik('dzamija',600,'caus-ferman','Čauš: Car zabranjuje vino uz ramazan, zelenu dolamu i sablju o pojasu. Ko prekrši, ide u tamnicu.',-1);
  K.wing('dzamija',300,{upper:'krovovi'});K.cudo('krovovi',1600,'Zelena dolama',-2);K.door('dzamija','kafana',-1);
  K.drop('kafana',800,1000,'vinski');K.crack('kafana','riznica',{row:-1});K.cudo('riznica',700,'Kupa od dvanaest oka',-1);
  // Bačvara i vinski podrum: druga borba, greda nad kacom; gvozdena vrata zatvorena iznutra
  K.prop('bure','bacvara',400,90);K.prop('bure','bacvara',800,90);K.heart('bacvara',1000,0);K.door('bacvara','vinski',0);
  K.borba('vinski',[['shield',600],['sword',1100],['pas',1900]]);K.greda('vinski',1300,{span:220});K.gate('vinski','gvozdena',0);
  // Hodnik stražara: borba, čekpoint, krilo do stražarnice; barutana i Ognjeni aga
  K.door('gvozdena','hodnik',0);K.ckpt('hodnik',900);K.borba('hodnik',[['oklopnik',1200],['shield',1700],['sword',2100]]);
  K.wing('hodnik',1500,{upper:'strazarnica'});K.heart('strazarnica',900,-1);K.door('hodnik','barutana',0);K.bos('barutana','palikuca');
  // Donji podrum: psi; lažni zid do grobnice; rupa do vrela, dimnjak gore u prolaz
  K.borba('donji',[['pas',700],['pas',1000],['sword',1250]]);K.fake('donji','grobnica',{row:1});K.heart('grobnica',500,1);
  K.chimney('donji',1000,{upper:'prolaz'});K.drop('donji',1500,1700,'izvor');K.door('donji','cisterna',1);
  // Podzemno vrelo: juriš i čekpoint, dimnjak nazad
  K.ckpt('izvor',150);K.shrine('nalet','izvor',350);K.chimney('izvor',600,{upper:'donji'});
  // Cisterna: daske nad vodom; ponor samo za juriš
  K.crumble('cisterna',400,180,1);K.crumble('cisterna',580,180,1);K.pit('cisterna',400,760);K.door('cisterna','ponor',1);
  K.dash('ponor',700);K.door('ponor','vinarija',1);
  K.lik('vinarija',600,'putnik-starac-idle','Podrumar: Gvozdena vrata otvara poluga sa ove strane. Popni se kroz stari podrum.',1);K.spikes('vinarija',900,120,1);K.door('vinarija','stari',1);
  K.strelnica('stari',2380,{every:2.6});K.chimney('stari',300,{upper:'hodnik'});K.crack('stari','tamnica',{row:1});K.cudo('tamnica',600,'Careva kesa',1);}})
};

// kuka do registra u greybox.js: pohodi ulaze u isti spisak kao tri nivoa iz greybox-nivoi.js
Object.assign(GB_NIVOI,GB_POHODI);
