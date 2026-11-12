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
import{GB_MOCI}from'./greybox.js';
import{lik}from'./zamke.js';

// nove moći iz lc-pokreti (MOCI2 u game.js) kao oltari u greybox-u: greybox.js ih ne nabraja (mapa i meni ostaju sa tri moći),
// ali ih oltar (B.shrine) i natpis nad ispustom nađu po imenu
const NOVE={
 klizanje:{name:'Klizanje',key:'u trku S + SHIFT',color:'#e8c890',text:'U trku kliziš po zemlji, ispod niskih prolaza i ispod udaraca.'},
 zidotrk:{name:'Trk po zidu',key:'skoči na zid sa šarama',color:'#ffd27a',text:'Na zidu sa Ravijojlinim šarama pretrčiš nekoliko koraka vodoravno, pa skočiš sa njega (SPACE).'},
 lanac:{name:'Ravijojlin lanac',key:'C',color:'#9fe8ff',text:'Lanac te privuče do srebrne kuke i vrati ti krilo i juriš.'},
 oko:{name:'Vilinsko oko',key:'drži O',color:'#c3b2ff',text:'Dok držiš O, vidiš skrivene platforme i zidove koji su varka.'}};
for(const [id,M] of Object.entries(NOVE))if(!GB_MOCI[id])Object.defineProperty(GB_MOCI,id,{value:M,enumerable:false,configurable:true});

const CW=1200,CH=720;
export const FY=row=>(row+1)*CH-130;   // pod reda: red 0 → 590, red -1 → -130, red 1 → 1310

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
 const K={R,vrata:[],rupe:[],veze:[],delovi:{},ops:[],brda:{},n:{borbe:0,likovi:0,zamke:0,krilo:0,nalet:0,trag:0,lomljiv:0,lazni:0,precica:0,klizanje:0,zidotrk:0,lanac:0,oko:0,iluzija:0,nalazi:0}};
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
  chimney(id,dx,o={}){const r=room(id),x=r.x0+dx,name=`ch-${id}-${dx}`,upper=o.upper,low=o.part||node(id);
   if(upper){const u=room(upper),top=u.floor,bottom=r.floor-150;if(x+40<u.x0+40||x+190>u.x1-40)throw new Error(`dimnjak iz ${id} nije ispod sobe ${upper}`);K.rupe.push([upper,x+40-u.x0,x+190-u.x0,{to:low}]);op(B=>B.chimney(name,x,top,bottom));
    K.veze.push([low,node(upper),null,true,{chimney:[name,x+430<u.x1-60?x+430:x-200]}]);return K;}
   const row=o.row??r.bottom,rowTop=row-1,top=FY(rowTop),bottom=FY(row)-150;
   op(B=>{B.chimney(name,x,top,bottom);if(x>r.x0+20)B.block(r.x0+20,top,x-r.x0-20,40);if(x+230<r.x1-20)B.block(x+230,top,r.x1-20-x-230,40);});
   const exit=x+230+200<r.x1-60?x+430:x-200;
   K.veze.push([node(id,rowTop+1),node(id,rowTop),null,true,{chimney:[name,exit]}],[node(id,rowTop),node(id,rowTop+1),null,true,{walk:[exit>x?x+330:x-120,top,x+115],wait:150}]);return K;},
  // the wing's ledge (365 px up, one jump does 266) and a walkway one row up whose edge is caught with the wing again;
  // in a tall room from the row `row` to the one above it, between rooms through a hole in the upper room's floor
  wing(id,dx,o={}){const r=room(id);K.n.krilo++;
   if(o.upper){const u=room(o.upper),hx=r.x0+dx,lx=hx+190,F=FY(o.row??r.bottom),low=node(id,o.row);if(hx<u.x0+200||hx+300>u.x1-20)throw new Error(`krilo iz ${id} nije ispod sobe ${o.upper}`);K.rupe.push([o.upper,hx-u.x0,hx+300-u.x0,{to:low}]);op(B=>B.ledge(lx,F-365,100,{gbGate:'krilo'}));
    K.veze.push([low,node(o.upper),'krilo',true,{up:[['floor',F,1,[lx+50,F-365]],[[lx+50,F-365],[hx-150,u.floor],-1]]}]);return K;}
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
  guslar(id,dx,stih,row){K.n.likovi++;op(B=>{const z={kind:'guslar',x:X(id,dx),y:FY(row??room(id).bottom),mir:true,state:'ceka',hp:100,stih,t:0};B.zamka?B.zamka(z):B.strelnica({zamka:z});});return K;},
  lik(id,dx,clip,text,row,o={}){K.n.likovi++;op(B=>{const z=lik({x:X(id,dx),y:FY(row??room(id).bottom),clip,text,...o});B.zamka?B.zamka(z):B.strelnica({zamka:z});});return K;},
  // ---- moći iz lc-pokreti ----
  // oltar: nova moć na kamenu, kao krilo i juriš (B.shrine; GB_MOCI je zna po imenu)
  oltar:(moc,id,dx,row)=>op(B=>B.shrine(moc,X(id,dx),FY(row??room(id).bottom))),
  // amajlija na tlu (world.nalazi); bez imena daje sledeću amajliju koju Marko još nema
  nalaz(id,dx,row,o={}){K.n.nalazi++;op(B=>B.nalaz?.({x:X(id,dx),y:FY(row??room(id).bottom),...o}));return K;},
  // zid koji je varka (iluzija): izgleda kao zid, a uvek se prolazi; Vilinsko oko ga ocrta
  iluzija(id,dx,row,w=40,h=260){K.n.iluzija++;const F=FY(row??room(id).bottom);op(B=>B.block(X(id,dx),F-h,w,h,{kind:'iluzija',iluzija:true,off:true,solid:false}));return K;},
  // izazov nove moći usred sobe, koji je deli na delove: dir 1 ide udesno (`soba>`, pa `soba>>`), -1 ulevo (`soba<`, `soba<<`).
  // `edge` je bliža ivica prepreke. klizanje: nizak prolaz (60 px) ispod nadvratnika; lanac: ponor od 650 px sa dve srebrne kuke;
  // zidotrk: ponor od 650 px pod zidom sa šarama; oko: ponor od 650 px sa skrivenim daskama. Bez moći se ne prelazi (test proba).
  izazov(id,edge,moc,o={}){const r=room(id),dir=o.dir??1,row=r.bottom,F=r.floor,top=row*CH,W=moc==='klizanje'?200:650,e=r.x0+edge,x0=dir>0?e:e-W,x1=x0+W;K.n[moc]++;
   const mark=dir>0?'>':'<',parts=Object.keys(K.delovi).filter(k=>K.delovi[k].room===id&&k.startsWith(id+mark)),prev=parts.at(-1),near=prev||node(id),far=id+mark.repeat(parts.length+1);
   if(prev){if(dir>0)K.delovi[prev].x1=x0;else K.delovi[prev].x0=x1;}K.delovi[far]=dir>0?{room:id,x0:x1}:{room:id,x1:x0};
   const farE=dir>0?x1:x0,how=[e,farE,F,farE+dir*220,e-dir*220];
   if(moc==='klizanje'){op(B=>B.block(x0,top,W,F-60-top,{lintel:true}));K.veze.push([near,far,moc,false,{slide:how}]);return far;}
   const name=`pit-${moc}-${id}-${edge}`;K.rupe.push([id,x0-r.x0,x1-r.x0,{lip:dir>0?'R':'L'}]);op(B=>B.pit(name,x0,x1,F+150));
   if(moc==='lanac')op(B=>{B.kuka(x0+180,F-240);B.kuka(x1-180,F-240);});
   if(moc==='zidotrk')op(B=>B.zid(x0+15,F-260,W-30,220));
   if(moc==='oko')op(B=>{for(const [a,b] of [[130,290],[360,520]])B.block(x0+a,F,b-a,18,{kind:'oko',oko:true,off:true});});
   K.veze.push([near,far,moc,false,{[moc==='lanac'?'hook':moc==='zidotrk'?'zidrun':'okom']:how}]);return far;},
  // Ravijojlina staza: soba od tri polja uz `do` sa dva izazova moći `moc` i tajnom sobom iza njih (iza zida koji je varka);
  // dir -1: staza je levo od `do` (zapadno krilo), 1: desno. Na pola puta je amajlija na tlu.
  staza({soba,tajna,do:uz,moc,dir=-1,nalaz=true}){const r=room(soba),row=r.bottom;
   if(dir<0){K.door(soba,uz,row);K.izazov(soba,2900,moc,{dir});const mid=K.izazov(soba,moc==='klizanje'?1400:1500,moc,{dir});K.door(tajna,soba,row);
    K.iluzija(soba,-20,row);if(nalaz)K.nalaz(soba,moc==='klizanje'?1900:1850,row);void mid;}
   else{K.door(uz,soba,row);K.izazov(soba,700,moc,{dir});K.izazov(soba,2100,moc,{dir});K.door(soba,tajna,row);
    K.iluzija(soba,r.x1-r.x0-20,row);if(nalaz)K.nalaz(soba,moc==='klizanje'?1750:1750,row);}
   return K;},
  // the land's champion in the last room, with his arena furniture
  bos(id,kind,o={}){const r=room(id),S=BOS[kind],y=r.floor,x0=r.x0+40,x1=r.x1-40,len=x1-x0,planks=[],a={block:(k,w,h,bo)=>op(B=>B.block(Math.round(x0+len*k-w/2),y-h,w,h,bo))};
   S.arena(a,(k,dy,w=150)=>planks.push([len*k,dy,w]));K.bosRoom=id;
   op(B=>B.boss(S.type,Math.round(x0+len*(S.x??.68)),y,{hp:o.hp??S.hp,maxHp:o.hp??S.hp,name:o.name||S.name,kit:S.kit,look:o.look??S.look,scale:S.scale??1.35},{x0,x1,y},planks));return K;}});
 return K;}

// one level from its words: the kit runs once, here, and build(B) replays what it set down
export function pohod(def){const K=kit(def.sobe);def.gradi(K);
 // a door out of the right side of a room whose far part lies past an abyss leaves from that part
 // a hole must not open over another hole in the floor below it
 for(const [id,a,b,o] of K.rupe){if(!o.to)continue;const r=K.R[id],t=K.R[K.delovi[o.to]?.room||o.to.split('@')[0]];for(const [id2,a2,b2] of K.rupe)if(id2===t.id&&r.x0+a<t.x0+b2&&t.x0+a2<r.x0+b)throw new Error(`${def.id}: rupa u ${id} (${a}–${b}) pada u rupu u ${id2} (${a2}–${b2})`);}
 // the champion's arena closes behind Marko: the door into it goes one way
 for(const v of K.vrata)if(v[1]===K.bosRoom)v[3].oneway=true;
 for(const v of K.vrata){const [a,,row,o]=v;if(o.na)continue;for(const [name,d] of Object.entries(K.delovi))if(d.room===a&&d.x1==null&&row===K.R[a].bottom)o.na=name;}
 for(const v of K.vrata){const [,b,row,o]=v;if(o.nb)continue;for(const [name,d] of Object.entries(K.delovi))if(d.room===b&&d.x0==null&&d.x1!=null&&row===K.R[b].bottom)o.nb=name;}
 const{gradi,...rest}=def;
 return{...rest,vrata:K.vrata,rupe:K.rupe,delovi:K.delovi,veze:K.veze,brda:def.brda||{},broj:K.n,bosSoba:K.bosRoom,build(B){for(const f of K.ops)f(B);}};}

export const GB_POHODI={
// ---------------------------------------------------------------------------------------------------------------------
// 4 · Kosovsko selo („Jao Šaro, moje desno krilo“): selo pod turskom stražom, kapija zatvorena iznutra. Marko ulazi preko
// osmatračnice i palisade, spušta se na trg i otvara kapiju (prečica); Sokolovo krilo čeka u Šarčevoj štali, dole kraj bunara,
// a sa njim se penje na zvonik i na kulu nad bunarom, gde čeka Kopljanik-baša.
4:pohod({id:'selo',ime:'Kosovsko selo',biom:'podgradje',zeljeniBiom:'selo',daje:'krilo',daje2:'klizanje',pocetne:[],
 cilj:'Uđi u selo, nađi Šarčevu štalu i popni se na kulu nad bunarom',start:'livada',spawnDx:260,
 uvod:'Kosovsko selo. Kapija je zatvorena iznutra, a na kuli nad bunarom sedi Kopljanik-baša. Sokolovo krilo čeka u Šarčevoj štali; uđi preko osmatračnice.',
 sobe:[
  ['skroviste','Vilinsko skrovište',-5,0,1,1,{secret:true,interior:true,lore:'Vilinsko skrovište. Ovde je Ravijojla čuvala Šarčevu srebrnu potkovicu dok Marko ne dođe po nju.'}],
  ['staza','Ravijojlina staza',-4,0,3,1,{interior:true}],
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
  // Ravijojlina staza (zapadno od livade): dva niska prolaza za klizanje, amajlija na tlu, vilinsko skrovište iza zida koji je varka
  K.staza({soba:'staza',tajna:'skroviste',do:'livada',moc:'klizanje'});K.cudo('skroviste',600,'Srebrna potkovica');K.lik('staza',3300,'vila-spreda','Ravijojla: Niski prolazi se prelaze samo klizanjem. Kamen za klizanje je u Šarčevoj štali.');
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
  K.ckpt('stala',300,1);K.shrine('krilo','stala',700,1);K.oltar('klizanje','stala',1100,1);K.lik('stala',1500,'volovi-plug','Šarac je odveden na kulu nad bunarom, a ovde su ostali samo volovi.',1);
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
  K.strelnica('stari',2380,{every:2.6});K.chimney('stari',300,{upper:'hodnik'});K.crack('stari','tamnica',{row:1});K.cudo('tamnica',600,'Careva kesa',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 9 · Noćna močvara („Lov Markov s Turcima“): kraj Zelenog jezera vezir je slomio krilo Markovom sokolu o jelu. Marko ide
// kroz tršćak i potopljene prelaze; Vilin trag čeka na Vilinom ostrvu ispod vode, a vezirov čardak ima zadnja vrata na
// daleki prekidač. Iza čardaka je lovačka staza do Zelenog jezera, gde čeka Tufekdžija-baša sa vezirovim delijama.
9:pohod({id:'mocvara',ime:'Noćna močvara',biom:'urvina',zeljeniBiom:'mocvara',daje:'trag',pocetne:['krilo','nalet'],
 cilj:'Nađi Vilin trag na ostrvu pod vodom, prođi vezirov čardak i stigni do Zelenog jezera',start:'obala',spawnDx:240,
 uvod:'Noćna močvara. Vezir je slomio krilo Markovom sokolu. Vezirov čardak ima zadnja vrata na daleki prekidač; Vilin trag svetli na ostrvu ispod vode.',
 sobe:[
  ['obala','Obala jezera',-1,0,1,1,{set:'reka'}],
  ['vrbak','Vrbak',-1,-1,1,1,{set:'suma'}],
  ['trscak','Tršćak',0,0,2,1,{set:'reka'}],
  ['jele','Jelova greda',0,-1,2,1,{set:'suma'}],
  ['gnezdo','Sokolovo gnezdo',2,-1,1,1,{set:'suma'}],
  ['vidikovac','Vidikovac',3,-1,1,1,{secret:true,set:'suma',lore:'Vidikovac. Odavde se vidi celo Zeleno jezero i utve zlatokrile kad slete na vodu.'}],
  ['brvna','Brvna preko vode',2,0,2,1,{set:'reka'}],
  ['ostrvo','Ostrvo',4,0,1,1,{set:'reka'}],
  ['cardak','Vezirov čardak',5,0,1,1,{interior:true}],
  ['sprat','Sprat čardaka',5,-1,1,1,{interior:true}],
  ['staza','Lovačka staza',6,0,2,1,{set:'suma'}],
  ['krosnje','Krošnje',6,-1,1,1,{set:'suma'}],
  ['utve','Gnezdo utava',7,-1,1,1,{secret:true,set:'suma',lore:'Gnezdo utava. Utve zlatokrile ovde legu mlade; vezirov soko ih nikad nije stigao.'}],
  ['jezero','Zeleno jezero',8,0,1,1,{set:'reka'}],
  ['jazbina','Vidrina jazbina',-1,1,1,1,{secret:true,interior:true,lore:'Vidrina jazbina. Vidra je ovde krila ribe iz jezera, a Marko joj je ostavio pola svoje pogače.'}],
  ['mulj','Mulj pod tršćakom',0,1,2,1,{interior:true}],
  ['potopljeni','Potopljeni prelaz',2,1,2,1,{interior:true}],
  ['svetiljke','Vilino ostrvo',4,1,1,1,{interior:true}],
  ['riznica','Vezirova riznica',5,1,1,1,{secret:true,interior:true,lore:'Vezirova riznica. Zlato za dvanaest delija koji su lovili sa vezirom; nijedan se nije vratio.'}],
  ['blato','Crno blato',7,1,1,1,{interior:true}],
  ['kaliste','Kalište',8,1,1,1,{secret:true,interior:true,lore:'Kalište. Ovde se Markov soko oporavio, pre nego što je opet poleteo za utvom.'}]],
 brda:{obala:[[500,900,-30]],staza:[[400,900,50]]},
 gradi(K){
  // Obala: guslar, krilo do vrbaka
  K.guslar('obala',900,['Teško mene i tebe, sokole,','lov loveći s Turci bez Srbalja,','lov loveći, krivo dijeleći!']);K.wing('obala',300,{upper:'vrbak'});K.heart('vrbak',800,-1);K.door('obala','trscak',0);
  // Tršćak: prva borba, krilo na jelovu gredu, rupa u mulj
  K.borba('trscak',[['sword',950],['akindzija',1300],['archer',2050]]);K.wing('trscak',500,{upper:'jele'});K.drop('trscak',1500,1700,'mulj');K.door('trscak','brvna',0);
  // Jelova greda i gnezdo: druga borba; ranjeni soko; lažni zid do vidikovca
  K.borba('jele',[['archer',700],['sword',1300]],-1);K.strelnica('jele',2380,{row:-1,every:2.8});K.drop('jele',1900,2100,'trscak');K.door('jele','gnezdo',-1);
  K.lik('gnezdo',600,'soko-ranjen','Soko: Vezir mi je slomio krilo o jelu. Previj mi ga, Marko, pa ću ti pokazati put.',-1);K.fake('gnezdo','vidikovac',{row:-1});K.cudo('vidikovac',700,'Sokolovo pero',-1);
  // Brvna: juriš preko vode do ostrva
  K.dash('brvna',700);K.door('brvna','ostrvo',0);K.lik('ostrvo',800,'utva-let','Utve zlatokrile lete nad jezerom. Vezirov soko ih promaši, a Markov ih stiže.');K.door('ostrvo','cardak',0);
  // Čardak: zadnja vrata na prekidač; sprat sa vezirovim slugom
  K.chimney('cardak',600,{upper:'sprat'});K.lik('sprat',400,'caus-idle','Vezirov sluga: Vezir je otišao na jezero sa dvanaest delija. Zadnja vrata čardaka ne puštaju nikog.',-1);K.heart('sprat',900,-1);K.trace('cardak','staza');
  // Lovačka staza: čekpoint, treća borba, krilo u krošnje; jezero i Tufekdžija-baša
  K.ckpt('staza',200);K.borba('staza',[['sword',1000],['shield',1300],['akindzija',1800]]);K.wing('staza',300,{upper:'krosnje'});K.heart('krosnje',900,-1);K.crack('krosnje','utve',{row:-1});K.cudo('utve',600,'Zlatno pero utve',-1);
  K.drop('staza',1500,1700,'blato');K.door('staza','jezero',0);K.bos('jezero','basa');
  // Mulj: psi, dimnjak gore; lažni zid do jazbine
  K.borba('mulj',[['pas',600],['pas',900],['sword',2000]]);K.chimney('mulj',1000,{upper:'trscak'});K.fake('mulj','jazbina',{row:1});K.heart('jazbina',500,1);K.door('mulj','potopljeni',1);
  // Potopljeni prelaz: greda nad vodom, daske, borba
  K.greda('potopljeni',500,{span:220});K.crumble('potopljeni',1300,160,1);K.crumble('potopljeni',1460,160,1);K.pit('potopljeni',1300,1620);
  K.borba('potopljeni',[['sword',1900],['shield',2150]]);K.door('potopljeni','svetiljke',1);
  // Vilino ostrvo: Vilin trag, čekpoint, dimnjak na ostrvo; vezirova riznica iza vrata na prekidač
  K.ckpt('svetiljke',450);K.shrine('trag','svetiljke',800);K.chimney('svetiljke',300,{upper:'ostrvo'});K.trace('svetiljke','riznica');K.cudo('riznica',600,'Vezirov prsten',1);
  // Crno blato: dimnjak na stazu, šiljci; napukli zid do kališta
  K.chimney('blato',700,{upper:'staza'});K.spikes('blato',300,100,1);K.crack('blato','kaliste',{row:1});K.heart('kaliste',600,1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 10 · Ravijojlina šuma („Marko Kraljević i vila“): na Miroču vila Ravijojla ustreli Miloša što je pevao lepše od nje; Marko
// je stiže, a ona bere bilje po Miroču i leči pobratima. U šumi spavaju tri vilinska kamena; Sokolovo krilo čeka kraj
// vilinskog izvora pod korenjem, a sa njim se penje klancem na vrh Miroča, gde Lovac-aga pušta pse po gori.
10:pohod({id:'suma',ime:'Ravijojlina šuma',biom:'urvina',zeljeniBiom:'suma',daje:'krilo',pocetne:[],
 cilj:'Probudi tri vilinska kamena, nađi krilo kraj izvora i popni se na vrh Miroča',start:'proplanak',spawnDx:240,
 uvod:'Ravijojlina šuma na Miroču. Tri vilinska kamena spavaju, a Lovac-aga goni po gori. Sokolovo krilo čeka kraj vilinskog izvora, pod korenjem.',
 sobe:[
  ['proplanak','Proplanak',-1,0,1,1,{set:'suma'}],
  ['bukvik','Bukova šuma',0,0,2,1,{set:'suma'}],
  ['jelak','Jelak',0,-1,2,1,{set:'suma'}],
  ['kolo','Vilino kolo',2,-1,1,1,{set:'suma'}],
  ['gnezdo','Orlovo gnezdo',3,-1,1,1,{secret:true,set:'suma',lore:'Orlovo gnezdo. Orao je ovde čuvao vilino pero dok se Ravijojla ne vrati sa Miroča.'}],
  ['potok','Šumski potok',2,0,1,1,{set:'reka'}],
  ['lovacka','Lovačka kuća',3,0,1,1,{interior:true}],
  ['gustis','Guštara',4,0,2,1,{set:'suma'}],
  ['brest','Stari brest',4,-1,2,1,{set:'suma'}],
  ['vidikovac','Vidikovac',6,-1,1,1,{set:'suma'}],
  ['kamen1','Prvi vilinski kamen',6,0,1,1,{set:'suma'}],
  ['klanac','Klanac pod Miročem',7,-2,1,3],
  ['kamen2','Drugi vilinski kamen',8,-1,1,1],
  ['vrh','Vrh Miroča',8,-2,1,1],
  ['jazbina','Vučja jazbina',-1,1,1,1,{secret:true,interior:true,lore:'Vučja jazbina. Vukovi su je ostavili kad je Šarac skočio za vilom „po tri koplja u visinu“.'}],
  ['korenje','Korenje',0,1,2,1,{interior:true}],
  ['pecina','Pećina pod šumom',2,1,2,1,{interior:true}],
  ['brlog','Medveđi brlog',3,2,1,1,{interior:true}],
  ['izvor','Vilinski izvor',4,1,1,1,{interior:true}],
  ['vilina','Vilina pećina',5,1,1,1,{interior:true}],
  ['riznica','Vilina riznica',6,1,1,1,{secret:true,interior:true,lore:'Vilina riznica. Bilje sa Miroča: Ravijojla ga je brala da izleči Miloša, pobratima Markova.'}]],
 brda:{proplanak:[[500,900,40]],bukvik:[[200,400,30]],gustis:[[600,1100,50]]},
 gradi(K){
  // Proplanak i bukova šuma: guslar, prva borba, krilo u jelak, rupa u korenje
  K.guslar('proplanak',800,['Ne streljajte po gori junaka','dok je glasa Kraljevića Marka','i njegova vidovita Šarca!']);K.prop('bukva','proplanak',400,340);K.door('proplanak','bukvik',0);
  K.block('bukvik',2050,120,160,120);K.borba('bukvik',[['akindzija',850],['sword',1400],['archer',2100,120]]);K.wing('bukvik',500,{upper:'jelak'});K.drop('bukvik',1600,1800,'korenje');K.door('bukvik','potok',0);
  // Jelak, Vilino kolo: strelnica; Ravijojla; lažni zid do orlovog gnezda
  K.strelnica('jelak',2380,{row:-1,every:2.8});K.heart('jelak',1400,-1);K.door('jelak','kolo',-1);
  K.lik('kolo',500,'vila-spreda','Ravijojla: Ne streljaj po gori, Marko. Miloš je pevao lepše od mene, a ja sam se naljutila.',-1);K.drop('kolo',700,850,'potok');K.fake('kolo','gnezdo',{row:-1});K.cudo('gnezdo',700,'Vilino pero',-1);
  // Potok i lovačka kuća: greda nad vodom; lovac
  K.greda('potok',300,{span:220});K.door('potok','lovacka',0);
  K.lik('lovacka',500,'putnik-starac-idle','Lovac: Lovac-aga je pustio pse po gori. Gore na Miroču ga čeka megdan.');K.heart('lovacka',900,0);K.door('lovacka','gustis',0);
  // Guštara: palikuća pali šumu, trnje; krilo na stari brest
  K.borba('gustis',[['palikuca',800],['sword',1000]]);K.spikes('gustis',2000,120);K.wing('gustis',1300,{upper:'brest'});K.door('gustis','kamen1',0);
  K.block('brest',500,120,120,120,-1);K.block('brest',1900,120,120,120,-1);K.borba('brest',[['archer',560,120],['archer',1960,120],['sword',1100]],-1);K.heart('brest',2200,-1);K.door('brest','vidikovac',-1);K.door('vidikovac','klanac',-1);
  // Prvi kamen, klanac, drugi kamen, vrh Miroča
  K.ckpt('kamen1',300);K.lik('kamen1',800,'vilinski-kamen-spava','Prvi vilinski kamen se budi kad mu priđeš. Ostala dva su u klancu i pod zemljom.');K.door('kamen1','klanac',0);
  K.chimney('klanac',700);K.wing('klanac',300,{row:-1});K.door('klanac','kamen2',-1);K.lik('kamen2',600,'vilinski-kamen-budi','Drugi vilinski kamen se budi. Vrh Miroča je iznad, samo krilom.',-1);
  K.door('klanac','vrh',-2);K.bos('vrh','lovac');
  // Korenje: psi Lovac-age, dimnjak gore, lažni zid do jazbine
  K.borba('korenje',[['pas',600],['pas',800],['sword',2100]]);K.chimney('korenje',1000,{upper:'bukvik'});K.fake('korenje','jazbina',{row:1});K.heart('jazbina',500,1);K.door('korenje','pecina',1);
  // Pećina: daske, strelnica, borba; rupa u brlog
  K.crumble('pecina',700,180,1);K.crumble('pecina',880,180,1);K.pit('pecina',700,1060);K.borba('pecina',[['sword',1500],['shield',2100]]);K.strelnica('pecina',2380,{every:2.6});
  K.drop('pecina',1300,1500,'brlog');K.chimney('brlog',700,{upper:'pecina'});K.heart('brlog',300,2);K.door('pecina','izvor',1);
  // Vilinski izvor: krilo, čekpoint, Ravijojla bere bilje; dimnjak u guštaru; treći kamen i vilina riznica
  K.ckpt('izvor',600);K.shrine('krilo','izvor',850);K.lik('izvor',1050,'vila-isceljenje','Ravijojla bere bilje po Miroču i leči Miloša. Uzmi krilo, Marko, i popni se na vrh.',1);
  K.chimney('izvor',300,{upper:'gustis'});K.door('izvor','vilina',1);K.lik('vilina',500,'vilinski-kamen-budan','Treći vilinski kamen je budan. Iza njega je zid koji zvuči šuplje.',1);K.crack('vilina','riznica',{row:1});K.cudo('riznica',600,'Bilje sa Miroča',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 11 · Vilinska pećina („Marko Kraljević u pećini“): u pećini Marko spava, sablja mu sama izleće iz korica, a Ravijojla drži
// gusle javorove što same gude. Kristalna dvorana i ponor pod njom prelaze se samo jurišem; juriš daje Ravijojla u svojoj
// odaji kraj podzemne reke. Na kraju pećine je leglo Aždaje.
11:pohod({id:'pecina',ime:'Vilinska pećina',biom:'urvina',zeljeniBiom:'pecina',daje:'nalet',pocetne:['krilo'],
 cilj:'Nađi Ravijojlinu odaju, pređi kristalnu dvoranu jurišem i stigni do Aždajinog legla',start:'pred',spawnDx:240,
 uvod:'Vilinska pećina. Gusle javorove same gude negde duboko. Kristalna dvorana je presečena ponorom; juriš u vazduhu daje Ravijojla u svojoj odaji, kraj podzemne reke.',
 sobe:[
  ['pred','Pred pećinom',-1,0,1,1],
  ['litica','Litica nad pećinom',-1,-1,1,1],
  ['usta','Usta pećine',0,0,2,1,{interior:true}],
  ['svod','Svod',0,-1,2,1,{interior:true}],
  ['misevi','Odaja slepih miševa',2,-1,1,1,{secret:true,interior:true,lore:'Odaja slepih miševa. Ovde su gusle javorove čekale Ravijojlu; same su gudele kad bi Marko zahrkao.'}],
  ['dvorana','Kristalna dvorana',2,0,2,1,{interior:true}],
  ['sablja','Odaja sablje',4,0,1,1,{interior:true}],
  ['stalaktiti','Stalaktiti',5,0,2,1,{interior:true}],
  ['svod2','Visoki svod',6,-1,1,1,{interior:true}],
  ['mahovina','Šarčeva mahovina',7,-1,1,1,{interior:true}],
  ['galerija','Kristalna galerija',8,-1,1,1,{interior:true}],
  ['leglo','Aždajino leglo',7,0,1,1,{interior:true}],
  ['skroviste','Skrovište',-1,1,1,1,{secret:true,interior:true,lore:'Skrovište. Čobani su ovde krili ovce od Aždaje; ostao je samo kraj od frule.'}],
  ['reka','Podzemna reka',0,1,2,1,{interior:true}],
  ['izvor','Ledeni izvor',1,2,1,1,{interior:true}],
  ['odaja','Ravijojlina odaja',2,1,1,1,{interior:true}],
  ['ponor','Ponor pod dvoranom',3,1,2,1,{interior:true}],
  ['jezero','Podzemno jezero',5,1,1,1,{interior:true}],
  ['kristalni','Kristalni prolaz',6,1,1,1,{secret:true,interior:true,lore:'Kristalni prolaz. Ravijojla ga pokazuje samo onome ko pređe ponor; kristali svetle kao sveće.'}],
  ['kosti','Kosti junaka',5,2,1,1,{interior:true}]],
 brda:{pred:[[500,800,30]]},
 gradi(K){
  // Pred pećinom: guslar; krilo na liticu
  K.guslar('pred',900,['A pred Markom vila Ravijojla,','u ruke joj gusli javorove:','same gude, same udaraju.']);K.wing('pred',300,{upper:'litica'});K.heart('litica',900,-1);K.door('pred','usta',0);
  // Usta pećine: psi i janičar; krilo na svod, rupa u podzemnu reku
  K.borba('usta',[['pas',850],['sword',1350],['pas',2100]]);K.wing('usta',500,{upper:'svod'});K.drop('usta',1600,1800,'reka');K.door('usta','dvorana',0);
  // Svod: strelac i janičar, strelnica; lažni zid do odaje slepih miševa
  K.block('svod',1000,120,140,120,-1);K.borba('svod',[['archer',1050,120],['sword',600]],-1);K.strelnica('svod',2380,{row:-1,every:2.8});K.fake('svod','misevi',{row:-1});K.cudo('misevi',600,'Gusle javorove',-1);
  // Kristalna dvorana: juriš preko ponora; odaja sablje
  K.dash('dvorana',700);K.door('dvorana','sablja',0);K.cudo('sablja',800,'Sablja iz korica');K.door('sablja','stalaktiti',0);
  // Stalaktiti: čekpoint, borba, šiljci; krilo do visokog svoda; Aždajino leglo
  K.ckpt('stalaktiti',200);K.borba('stalaktiti',[['oklopnik',1000],['shield',1400],['sword',1700]]);K.spikes('stalaktiti',2000,120);K.wing('stalaktiti',1500,{upper:'svod2'});
  K.heart('svod2',900,-1);K.door('svod2','mahovina',-1);K.strelnica('mahovina',1180,{row:-1,every:2.6});K.door('mahovina','galerija',-1);K.heart('galerija',600,-1);
  K.door('stalaktiti','leglo',0);K.bos('leglo','azdaja');
  // Podzemna reka: greda nad vodom, borba; napukli zid do skrovišta; ledeni izvor ispod
  K.greda('reka',300,{span:220});K.borba('reka',[['sword',800],['pas',1150]]);K.crack('reka','skroviste',{row:1});K.heart('skroviste',500,1);
  K.chimney('reka',1000,{upper:'usta'});K.drop('reka',1300,1450,'izvor');K.chimney('izvor',600,{upper:'reka'});K.heart('izvor',900,2);K.door('reka','odaja',1);
  // Ravijojlina odaja: juriš i čekpoint
  K.ckpt('odaja',300);K.shrine('nalet','odaja',700);K.lik('odaja',1000,'vila-carolija','Ravijojla: Spavaj, Marko, dok ja guslam. A kad se probudiš, juriš preko ponora.',1);K.door('odaja','ponor',1);
  // Ponor: juriš; dimnjak u odaju sablje; podzemno jezero i kristalni prolaz
  const dalje=K.dash('ponor',700);K.chimney('ponor',1500,{upper:'sablja',part:dalje});K.door('ponor','jezero',1);
  K.borba('jezero',[['sword',600],['shield',900]]);K.crack('jezero','kristalni',{row:1});K.cudo('kristalni',600,'Kristal',1);
  K.drop('jezero',300,500,'kosti');K.chimney('kosti',800,{upper:'jezero'});K.lik('kosti',400,'kostur-stoji','Kostur junaka: I ja sam tražio kristalni prolaz. Ponor me je stigao pre juriša.',2);K.heart('kosti',1000,2);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 12 · Zimski prevoj (stih o Đemu: „topuzinu baca u oblake“): Marko prati barjake preko snežnog prevoja. Karavan je zapeo
// u konačištu, snežni most je pukao (juriš), a karaula na sedlu prevoja ima vrata na daleki prekidač. Vilin trag čeka kraj
// ledenog izvora pod prevojem; na kuli iza karaule je Akindžijski beg.
12:pohod({id:'prevoj',ime:'Zimski prevoj',biom:'urvina',zeljeniBiom:'prevoj',daje:'trag',pocetne:['krilo','nalet'],
 cilj:'Prati barjake preko prevoja, nađi Vilin trag kraj ledenog izvora i prođi karaulu do kule',start:'podnozje',spawnDx:240,
 uvod:'Zimski prevoj. Barjaci vode do kule na prevoju, ali karaula na sedlu otvara vrata samo na daleki prekidač. Vilin trag čeka kraj ledenog izvora, ispod snega.',
 sobe:[
  ['podnozje','Podnožje prevoja',-1,0,1,1],
  ['serpentina','Serpentina',0,0,2,1],
  ['smrekovi','Smrekova šuma',0,-1,2,1,{set:'suma'}],
  ['greben','Lavinski greben',2,-1,2,1],
  ['orlova','Orlova stena',4,-1,1,1,{secret:true,lore:'Orlova stena. Đemo je odavde bacao topuz u oblake i dočekivao ga u bele ruke.'}],
  ['konaciste','Konačište',2,0,1,1,{interior:true}],
  ['most','Snežni most',3,0,2,1],
  ['karaula','Karaula',5,0,1,1,{interior:true}],
  ['sedlo','Sedlo prevoja',6,0,2,1],
  ['vidikovac','Vidikovac',6,-1,1,1],
  ['staja','Staja za konje',7,-1,1,1,{interior:true}],
  ['kula','Kula na prevoju',8,-2,1,3,{interior:true}],
  ['barjak','Poslednji barjak',9,-1,1,1],
  ['vrh','Vrh kule',9,-2,1,1],
  ['jazbina','Medveđa jazbina',-1,1,1,1,{secret:true,interior:true,lore:'Medveđa jazbina. Mečka je ovde prezimila; ostavila je saće meda i miran san.'}],
  ['pecina','Ledena pećina',0,1,2,1,{interior:true}],
  ['vucji','Vučji prolaz',2,1,2,1,{interior:true}],
  ['jama','Snežna jama',3,2,1,1,{interior:true}],
  ['izvor','Ledeni izvor',4,1,1,1,{interior:true}],
  ['potok','Zaleđeni potok',5,1,2,1,{interior:true}],
  ['riznica','Riznica karaule',7,1,1,1,{secret:true,interior:true,lore:'Riznica karaule. Carina sa prevoja: svaki karavan je ostavljao po kesu; Marko ju je vratio trgovcima.'}]],
 brda:{podnozje:[[500,900,40]],sedlo:[[900,1400,60]]},
 gradi(K){
  // Podnožje i serpentina: guslar; prva borba; krilo u smrekovu šumu, rupa u ledenu pećinu
  K.guslar('podnozje',850,['Na vrančiću noge prekrstio,','topuzinu baca u oblake,','dočekuje u bijele ruke.']);K.prop('putokaz','podnozje',450,120);K.door('podnozje','serpentina',0);
  K.block('serpentina',2050,120,160,120);K.borba('serpentina',[['akindzija',900],['sword',1300],['archer',2100,120]]);K.wing('serpentina',500,{upper:'smrekovi'});K.drop('serpentina',1700,1900,'pecina');K.door('serpentina','konaciste',0);
  // Smrekova šuma i lavinski greben: strelnica, druga borba, daske nad provalijom; lažni zid do Orlove stene
  K.strelnica('smrekovi',2380,{row:-1,every:2.8});K.heart('smrekovi',1500,-1);K.door('smrekovi','greben',-1);
  K.block('greben',600,120,120,120,-1);K.borba('greben',[['archer',650,120],['sword',1000]],-1);K.crumble('greben',1800,160,-1);K.crumble('greben',1960,160,-1);K.pit('greben',1800,2120);
  K.drop('greben',1300,1500,'most');K.fake('greben','orlova',{row:-1});K.cudo('orlova',600,'Đemov topuz',-1);
  // Konačište: karavan u snegu; snežni most (juriš); karaula sa vratima na prekidač
  K.lik('konaciste',500,'putnik-trgovac-idle','Trgovac: Karavan je zapeo u snegu. Karaula na sedlu ne pušta nikog bez prekidača.');K.heart('konaciste',950,0);K.door('konaciste','most',0);
  K.dash('most',700);K.door('most','karaula',0);
  K.lik('karaula',600,'caus-idle','Stražar: Vrata karaule otvara prekidač kraj ulaza. Dok stigneš do njih, zatvore se.');K.trace('karaula','sedlo');
  // Sedlo prevoja: čekpoint, borba, krilo do vidikovca; staja; kula sa barjakom i begom
  K.ckpt('sedlo',200);K.borba('sedlo',[['akindzija',1500],['shield',1800],['sword',2100]]);K.wing('sedlo',300,{upper:'vidikovac'});K.door('sedlo','kula',0);
  K.heart('vidikovac',900,-1);K.door('vidikovac','staja',-1);K.lik('staja',500,'putnik-starac-idle','Konjušar: Begov konj je odmoran. Beg čeka na vrhu kule, da te obori sa prevoja.',-1);K.door('staja','kula',-1);
  K.chimney('kula',700);K.wing('kula',300,{row:-1});K.door('kula','barjak',-1);K.cudo('barjak',600,'Barjak sa prevoja',-1);K.door('kula','vrh',-2);K.bos('vrh','akindzija');
  // Ledena pećina: psi, dimnjak gore; napukli zid do jazbine
  K.borba('pecina',[['pas',600],['pas',900]]);K.chimney('pecina',1000,{upper:'serpentina'});K.crack('pecina','jazbina',{row:1});K.heart('jazbina',500,1);K.door('pecina','vucji',1);
  // Vučji prolaz: greda, strelnica; snežna jama ispod
  K.greda('vucji',900,{span:220});K.strelnica('vucji',2380,{every:2.6});K.drop('vucji',1500,1700,'jama');K.chimney('jama',700,{upper:'vucji'});K.heart('jama',300,2);K.door('vucji','izvor',1);
  // Ledeni izvor: Vilin trag i čekpoint; zaleđeni potok i riznica iza vrata na prekidač
  K.ckpt('izvor',300);K.shrine('trag','izvor',700);K.lik('izvor',1000,'vila-spreda','Ravijojla: Ostavi trag kraj vrata, stani na prekidač, pa se tragom vrati.',1);K.door('izvor','potok',1);
  K.borba('potok',[['sword',400],['shield',700]]);K.trace('potok','riznica');K.cudo('riznica',600,'Carina sa prevoja',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 13 · Klisura Ibra („Marko Kraljević i Đemo Brđanin“): Marko je na slavu otišao bez oružja; Đemo ga je stigao topuzom,
// okovao i vodi ga klisurom od vešala do vešala: pod Ohridom, pod Vučitrnom, pod Zvečanom. Krčmarica Janja ga raskiva u
// svom podrumu (tamo čeka Sokolovo krilo); sa krilom se ide uz stenu i uz Zvečan, do vešala gde čeka Đemo.
13:pohod({id:'klisura',ime:'Klisura Ibra',biom:'klisura',zeljeniBiom:'klisura',daje:'krilo',pocetne:[],
 cilj:'Pređi srušene mostove, nađi krilo u Janjinom podrumu i popni se uz Zvečan do Đema',start:'ulaz',spawnDx:240,
 uvod:'Klisura Ibra. Đemo vodi okovanog Marka od vešala do vešala. Mostovi su srušeni; krčmarica Janja čuva Sokolovo krilo u svom podrumu.',
 sobe:[
  ['ulaz','Ulaz u klisuru',-1,0,1,1],
  ['obala','Obala Ibra',0,0,2,1,{set:'reka'}],
  ['stena','Stenoviti put',0,-1,2,1],
  ['isposnica','Isposnica u steni',2,-1,1,1,{secret:true,interior:true,lore:'Isposnica u steni. Kaluđer koji je tražio ribu iz Ohrida ovde se kajao što je Marka poslao bez oružja.'}],
  ['most1','Prvi srušeni most',2,0,2,1,{set:'reka'}],
  ['krcma','Janjina krčma',4,0,1,1,{interior:true}],
  ['put','Put uz stenu',5,0,2,1],
  ['strazara','Kula stražara',5,-1,1,1,{interior:true}],
  ['vucitrn','Vešala pod Vučitrnom',6,-1,1,1],
  ['ohrid','Vešala pod Ohridom',7,-1,1,1],
  ['litica','Litica pod Zvečanom',8,-1,1,1],
  ['most2','Drugi srušeni most',7,0,2,1,{set:'reka'}],
  ['zvecan','Zvečan',9,-2,1,3,{interior:true}],
  ['vesala','Vešala pod Zvečanom',10,-2,1,1],
  ['jazbina','Vidrina jazbina',-1,1,1,1,{secret:true,interior:true,lore:'Vidrina jazbina. Ovde je Šarac čekao Marka dok su ga vodili u okovima; nije hteo da ode.'}],
  ['vir','Vir',0,1,2,1,{interior:true}],
  ['podmost','Ispod mosta',2,1,2,1,{interior:true}],
  ['podrum','Janjin podrum',4,1,1,1,{interior:true}],
  ['potkop','Stari potkop',5,1,2,1,{interior:true}],
  ['tamnica','Zvečanska tamnica',7,1,1,1,{interior:true}],
  ['riznica','Tri tovara blaga',8,1,1,1,{secret:true,interior:true,lore:'Tri tovara blaga. Gospoda iz tri grada platila su Đemu da Marka ne obesi kod njih; Marko je blago vratio gradovima.'}]],
 brda:{ulaz:[[500,900,40]],put:[[600,1100,50]]},
 gradi(K){
  // Ulaz: guslar peva o slavi; majka savetuje bez oružja
  K.guslar('ulaz',850,['Slavu slavi Kraljeviću Marko,','slavu slavi svetoga Đorđija.','U Marka su mloge uzvanice.']);
  K.lik('ulaz',450,'putnica-idle','Jevrosima: Na slavu ne nosi oružje, sine. A kad krene put Ohrida, ponesi bar pamet.');K.door('ulaz','obala',0);
  // Obala Ibra: prva borba; krilo na stenoviti put; rupa u vir
  K.block('obala',2050,120,160,120);K.borba('obala',[['sword',900],['archer',2100,120]]);K.wing('obala',500,{upper:'stena'});K.drop('obala',1700,1900,'vir');K.door('obala','most1',0);
  // Stenoviti put: druga borba; lažni zid do isposnice
  K.block('stena',1000,120,140,120,-1);K.borba('stena',[['archer',1050,120],['sword',1500]],-1);K.heart('stena',300,-1);K.fake('stena','isposnica',{row:-1});K.cudo('isposnica',600,'Riba iz Ohrida',-1);
  // Prvi srušeni most: daske koje popuštaju nad vodom; rupa ispod mosta
  K.crumble('most1',600,170,0);K.crumble('most1',770,170,0);K.pit('most1',600,940);K.drop('most1',1300,1450,'podmost');K.door('most1','krcma',0);
  // Janjina krčma
  K.lik('krcma',600,'janja-idle','Janja: Đemo pije kod mene. Uspavaću ga biljem, a ti siđi u podrum, Marko.');K.heart('krcma',950,0);K.door('krcma','put',0);
  // Put uz stenu: čekpoint, treća borba, strelnica; krilo do kule stražara, gornji put preko troja vešala
  K.ckpt('put',200);K.borba('put',[['sword',800],['shield',1600],['akindzija',2000]]);K.strelnica('put',2380,{every:2.6});K.wing('put',300,{upper:'strazara'});K.door('put','most2',0);
  K.door('strazara','vucitrn',-1);K.lik('vucitrn',600,'putnik-trgovac-idle','Gospodar Vučitrna: Platili smo Đemu tovar blaga da Marka ne obesi pod našim gradom.',-1);K.door('vucitrn','ohrid',-1);
  K.lik('ohrid',600,'putnik-kaluder-idle','Kaluđer: Tražio sam ribu iz Ohrida, a Đemo je doveo Marka u okovima.',-1);K.door('ohrid','litica',-1);
  K.strelnica('litica',1180,{row:-1,every:2.8});K.heart('litica',300,-1);K.door('litica','zvecan',-1);
  // Drugi srušeni most: greda, četvrta borba; rupa u tamnicu
  K.greda('most2',1300,{span:220});K.borba('most2',[['sword',1900],['oklopnik',2150]]);K.drop('most2',300,500,'tamnica');K.door('most2','zvecan',0);
  // Zvečan: dimnjak i krilo do vešala; Đemo Brđanin
  K.chimney('zvecan',700);K.wing('zvecan',300,{row:-1});K.door('zvecan','vesala',-2);K.bos('vesala','djemo');
  // Vir: dimnjak gore, napukli zid do jazbine; ispod mosta: dimnjak i strelnica
  K.chimney('vir',1000,{upper:'obala'});K.crack('vir','jazbina',{row:1});K.heart('jazbina',500,1);K.door('vir','podmost',1);
  K.chimney('podmost',1700,{upper:'most1'});K.strelnica('podmost',2380,{every:2.6});K.door('podmost','podrum',1);
  // Janjin podrum: krilo i čekpoint
  K.ckpt('podrum',300);K.shrine('krilo','podrum',700);K.door('podrum','potkop',1);
  // Stari potkop: peta borba, daske; dimnjak na put; tamnica i blago
  K.borba('potkop',[['pas',500],['sword',800]]);K.crumble('potkop',1500,160,1);K.crumble('potkop',1660,160,1);K.pit('potkop',1500,1820);K.chimney('potkop',1200,{upper:'put'});K.door('potkop','tamnica',1);
  K.chimney('tamnica',900,{upper:'most2'});K.lik('tamnica',500,'putnik-starac-idle','Sužanj: Ovde je Đemo okovao Marka, bukagije na noge, belenzuke na ruke.',1);K.crack('tamnica','riznica',{row:1});K.cudo('riznica',600,'Tri tovara blaga',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 14 · Ruševine na brdu („Marko ukida svadbarinu“): Arap prekomorac je zakupio Kosovo i uzima svadbarinu; Kosovka devojka
// je osedela čekajući svadbu. Marko ide preko Arapove avlije i ruševina crkve na vrh brda, do poslednjeg barjaka. Juriš
// u vazduhu čeka u kripti pod ruševinama; greben pod vrhom i katakombe prelaze se samo njime.
14:pohod({id:'rusevine',ime:'Ruševine na brdu',biom:'podgradje',zeljeniBiom:'rusevine',daje:'nalet',pocetne:['krilo'],
 cilj:'Nađi juriš u kripti, pređi greben jurišem i stigni do poslednjeg barjaka',start:'podnozje',spawnDx:240,
 uvod:'Ruševine na brdu. Arap prekomorac uzima svadbarinu od svake svadbe na Kosovu. Do poslednjeg barjaka na vrhu vodi greben koji se prelazi samo jurišem; juriš čeka u kripti pod ruševinama.',
 sobe:[
  ['podnozje','Podnožje brda',-1,0,1,1],
  ['kuca','Kuća Kosovke devojke',-1,-1,1,1,{interior:true}],
  ['staza','Kosovo polje',0,0,2,1],
  ['svadbari','Tabor svatova',0,-1,2,1],
  ['kolo','Kolo svatova',2,-1,1,1],
  ['kula','Arapova kula',3,-1,2,1,{interior:true}],
  ['zvonik','Srušeni zvonik',4,-2,1,1,{secret:true,lore:'Srušeni zvonik. Zvono je palo kad je Arap zakupio Kosovo; Marko je obećao da će zazvoniti za svaku svadbu.'}],
  ['sator','Arapov šator',2,0,1,1,{interior:true}],
  ['avlija','Avlija sa kolcima',3,0,2,1],
  ['rusevine','Ruševine crkve',5,-2,1,3],
  ['trem','Trem',6,0,1,1],
  ['vinograd','Zapušteni vinograd',7,0,2,1],
  ['vidikovac','Vidikovac',7,-1,1,1],
  ['greben','Greben pod vrhom',6,-2,2,1],
  ['vrh','Poslednji barjak',8,-2,1,1],
  ['tamnica','Tamnica svatova',2,1,1,1,{secret:true,interior:true,lore:'Tamnica svatova. Svatovi koji nisu imali za svadbarinu čekali su ovde; Marko je platio za sve.'}],
  ['bunar','Arapov bunar',3,1,2,1,{interior:true}],
  ['kripta','Kripta',5,1,1,1,{interior:true}],
  ['katakombe','Katakombe',6,1,2,1,{interior:true}],
  ['riznica','Arapova riznica',8,1,1,1,{secret:true,interior:true,lore:'Arapova riznica. Svadbarina sa celog Kosova; Marko ju je razdelio devojkama za darove.'}]],
 brda:{podnozje:[[500,900,40]],staza:[[1000,1400,40]]},
 gradi(K){
  // Podnožje: guslar; krilo do kuće Kosovke devojke
  K.guslar('podnozje',850,['Odsad više nema svadbarine,','Marko za sve svadbarinu plati:','Bog da živi Kraljevića Marka!']);K.wing('podnozje',400,{upper:'kuca'});
  K.lik('kuca',600,'putnica-idle','Kosovka devojka: Osedela sam čekajući svadbu. Arap traži trideset dukata od svake mlade.',-1);K.heart('kuca',950,-1);K.door('podnozje','staza',0);
  // Kosovo polje: prva borba; krilo do tabora svatova
  K.block('staza',2050,120,160,120);K.borba('staza',[['sword',800],['akindzija',1600],['archer',2100,120]]);K.wing('staza',500,{upper:'svadbari'});K.door('staza','sator',0);
  K.heart('svadbari',1500,-1);K.door('svadbari','kolo',-1);K.lik('kolo',600,'svatovi-kolo','Svatovi igraju kolo, a svadba ne sme bez Arapove dozvole.',-1);K.door('kolo','kula',-1);
  // Arapova kula: borba, strelnica; krilo do srušenog zvonika
  K.block('kula',600,120,120,120,-1);K.borba('kula',[['archer',650,120],['shield',1000],['sword',1300]],-1);K.strelnica('kula',2380,{row:-1,every:2.8});K.wing('kula',1500,{upper:'zvonik'});K.cudo('zvonik',800,'Zvono za svadbe',-2);K.door('kula','rusevine',-1);
  // Šator i avlija: sluga; druga borba i kolci; rupa u bunar
  K.lik('sator',600,'caus-idle','Arapov sluga: Arap je zakupio Kosovo. Avlija mu je ograđena kolcima, a na kolcima su glave.');K.door('sator','avlija',0);
  K.borba('avlija',[['sword',700],['shield',1100]]);K.spikes('avlija',300,150);K.drop('avlija',1500,1700,'bunar');K.door('avlija','rusevine',0);
  // Ruševine crkve: dimnjak, krilo; greben (juriš) do poslednjeg barjaka i Arapina
  K.chimney('rusevine',700);K.wing('rusevine',300,{row:-1});K.door('rusevine','trem',0);K.door('rusevine','greben',-2);
  K.dash('greben',700);K.door('greben','vrh',-2);K.bos('vrh','arapin');
  // Trem i vinograd: čekpoint, mladoženja; četvrta borba, greda; krilo do vidikovca
  K.ckpt('trem',200);K.lik('trem',700,'mladozenja-trci','Mladoženja: Bez svadbarine nema svadbe, kaže Arap. Gore na brdu stoji njegov barjak.');K.door('trem','vinograd',0);
  K.borba('vinograd',[['sword',1500],['oklopnik',1900]]);K.greda('vinograd',900,{span:220});K.wing('vinograd',300,{upper:'vidikovac'});K.heart('vidikovac',900,-1);
  // Arapov bunar: peta borba, dimnjak gore; lažni zid do tamnice svatova; kripta sa jurišem
  K.borba('bunar',[['pas',500],['sword',800]]);K.chimney('bunar',1900,{upper:'avlija'});K.fake('bunar','tamnica',{row:1});K.lik('tamnica',600,'svatovi-zarobljeni','Svatovi: Nismo imali za svadbarinu, pa nas je Arap zatvorio.',1);K.door('bunar','kripta',1);
  K.ckpt('kripta',600);K.shrine('nalet','kripta',900);K.chimney('kripta',300,{upper:'rusevine'});K.door('kripta','katakombe',1);
  // Katakombe: juriš preko ponora do Arapove riznice
  K.dash('katakombe',700);K.door('katakombe','riznica',1);K.cudo('riznica',600,'Svadbarina sa Kosova',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 15 · Stari rudnik („U tamnici voda do koljena“, iz pesme o Azačkoj tamnici): stari rudnik je postao tamnica; voda do
// kolena, kosti do pojasa. Glavno okno vodi od potopljenih hodnika do izvoza, a stari izlaz iz rudnika otvara daleki
// prekidač. Vilin trag čeka u staroj kapeli rudara; na rudarskom trgu pred izlazom stoji Bajraktar sa štitom.
15:pohod({id:'rudnik',ime:'Stari rudnik',biom:'klisura',zeljeniBiom:'rudnik',daje:'trag',pocetne:['krilo','nalet'],
 cilj:'Siđi u tamnicu po Vilin trag, popni se glavnim oknom i otvori stari izlaz',start:'selo',spawnDx:240,
 uvod:'Stari rudnik. U tamnici je voda do kolena, a stari izlaz otvara prekidač koji je predaleko od vrata. Vilin trag čeka u staroj kapeli rudara, duboko dole.',
 sobe:[
  ['selo','Rudarsko selo',-1,0,1,1],
  ['izvoriste','Izvorište',-1,-1,1,1],
  ['ulaz','Ulaz u rudnik',0,0,2,1,{interior:true}],
  ['skela','Skele',0,-1,2,1,{interior:true}],
  ['svetlarnik','Svetlarnik',2,-1,1,1,{interior:true}],
  ['kovacnica','Kovačnica',2,0,1,1,{interior:true}],
  ['okno','Glavno okno',3,-1,1,3,{interior:true}],
  ['izvoz','Izvoz',4,-1,1,1,{interior:true}],
  ['izlaz','Stari izlaz',5,-1,2,1],
  ['trg','Rudarski trg',7,-1,1,1],
  ['hodnik','Hodnik sa šinama',4,0,2,1,{interior:true}],
  ['skladiste','Skladište baruta',6,0,1,1,{interior:true}],
  ['jazbina','Jazbina',-1,1,1,1,{secret:true,interior:true,lore:'Jazbina. Rudari su ovde krili srebro od carskih ćehaja; ostao je jedan grumen.'}],
  ['vagoneti','Pruga za vagonete',0,1,2,1,{interior:true}],
  ['potop','Potopljeno okno',2,1,1,1,{interior:true}],
  ['tamnica','Tamnica',4,1,2,1,{interior:true}],
  ['kapela','Stara kapela',6,1,1,1,{interior:true}],
  ['riznica','Rudarska riznica',7,1,1,1,{secret:true,interior:true,lore:'Rudarska riznica. Srebro iz rudnika, koje su rudari čuvali za otkup sužanja iz tamnice.'}],
  ['kosti','Kosti do pojasa',3,2,1,1,{secret:true,interior:true,lore:'Kosti do pojasa. „Od junaka kosti do pojasa“: ovde su ležali oni koje niko nije otkupio.'}],
  ['prozor','Tamnički prozor',4,2,1,1,{interior:true}]],
 brda:{selo:[[400,700,30]],izlaz:[[900,1400,40]]},
 gradi(K){
  // Rudarsko selo: guslar i rudar; krilo do izvorišta
  K.guslar('selo',900,['U tamnici voda do koljena,','od junaka kosti do pojasa:','tamnica je kuća neobična.']);
  K.lik('selo',450,'putnik-starac-idle','Rudar: Stari izlaz su Turci zatvorili vratima na prekidač. Dole je tamnica, voda do kolena.');K.wing('selo',600,{upper:'izvoriste'});K.heart('izvoriste',300,-1);K.door('selo','ulaz',0);
  // Ulaz u rudnik: prva borba; krilo na skele; rupa do pruge
  K.borba('ulaz',[['sword',900],['shield',1300]]);K.wing('ulaz',500,{upper:'skela'});K.drop('ulaz',1700,1900,'vagoneti');K.door('ulaz','kovacnica',0);
  K.block('skela',1000,120,140,120,-1);K.borba('skela',[['archer',1050,120],['sword',1500]],-1);K.strelnica('skela',2380,{row:-1,every:2.8});K.door('skela','svetlarnik',-1);
  K.heart('svetlarnik',600,-1);K.door('svetlarnik','okno',-1);
  K.lik('kovacnica',600,'novak-kuje','Kovač: Okovao sam vrata starog izlaza. Prekidač je daleko, a vrata se brzo zatvore.');K.door('kovacnica','okno',0);
  // Glavno okno: dimnjak od tamnice do hodnika, krilo do izvoza
  K.chimney('okno',700,{row:1});K.wing('okno',300,{row:0});K.door('okno','hodnik',0);K.door('okno','izvoz',-1);K.door('okno','tamnica',1);
  // Izvoz i stari izlaz: vrata na prekidač; Bajraktar na rudarskom trgu
  K.lik('izvoz',600,'caus-idle','Stražar: Ko prođe kroz stari izlaz, prošao je i mene. A vrata ne čekaju nikog.',-1);K.trace('izvoz','izlaz');
  K.ckpt('izlaz',200);K.borba('izlaz',[['shield',1400],['archer',1800]],-1);K.strelnica('izlaz',2380,{row:-1,every:2.6});K.door('izlaz','trg',-1);K.bos('trg','shield');
  // Hodnik sa šinama: borba, juriš preko urušenog dela; skladište baruta
  K.borba('hodnik',[['sword',250],['akindzija',500]]);K.dash('hodnik',700);K.door('hodnik','skladiste',0);
  K.lik('skladiste',600,'putnik-trgovac-idle','Barutdžija: Barut je za stari izlaz, ali Turci su ga zatvorili pre nego što smo ga upalili.');K.heart('skladiste',950,0);
  // Pruga za vagonete: peta borba, dimnjak gore, lažni zid do jazbine; potopljeno okno sa gredom
  K.borba('vagoneti',[['pas',500],['sword',1400]]);K.chimney('vagoneti',1000,{upper:'ulaz'});K.fake('vagoneti','jazbina',{row:1});K.cudo('jazbina',500,'Grumen srebra',1);K.door('vagoneti','potop',1);
  K.greda('potop',300,{span:220});K.door('potop','okno',1);
  // Tamnica: voda do kolena; devojke sa snegom i bosiljkom; rupa do tamničkog prozora
  K.lik('tamnica',250,'putnica-idle','Devojka: Zimi mu bacimo grudvu snega, leti struk bosiljka, da zna koje je doba godine.',1);
  K.borba('tamnica',[['sword',1300],['pas',1600]]);K.spikes('tamnica',1900,100);K.drop('tamnica',500,700,'prozor');K.door('tamnica','kapela',1);
  K.chimney('prozor',900,{upper:'tamnica'});K.lik('prozor',300,'soko-voda','Soko donosi vodu sužnju kroz tamnički prozor.',2);K.heart('prozor',600,2);K.crack('prozor','kosti',{row:2});K.cudo('kosti',600,'Okovi sužnja',2);
  // Stara kapela: Vilin trag i čekpoint; rudarska riznica iza vrata na prekidač
  K.ckpt('kapela',300);K.shrine('trag','kapela',700);K.trace('kapela','riznica');K.cudo('riznica',600,'Rudarsko srebro',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 16 · Obala pred zoru („Poranio Kraljeviću Marko u neđelju prije jarkog sunca“): pred zoru Marko jaše obalom ka moru.
// Vodenica, skela i pristanište su u turskim rukama; Sokolovo krilo čeka u Vilinom viru ispod obale, a sa njim se penje
// na svetionik i na bedem nad morem, gde stoji Janičarski aga. Na liticama kod dve tanke jele Ravijojla ga opominje.
16:pohod({id:'reka',ime:'Obala pred zoru',biom:'klisura',zeljeniBiom:'reka',daje:'krilo',pocetne:[],
 cilj:'Nađi krilo u Vilinom viru, popni se na svetionik i oteraj agu sa bedema nad morem',start:'zora',spawnDx:240,
 uvod:'Obala pred zoru. Pristanište i svetionik su u turskim rukama. Sokolovo krilo čeka u Vilinom viru, ispod obale; bez njega se na bedem nad morem ne stiže.',
 sobe:[
  ['zora','Obala pred zoru',-1,0,1,1,{set:'reka'}],
  ['pesak','Peščani sprud',0,0,2,1,{set:'reka'}],
  ['litica','Litica',0,-1,2,1],
  ['gnezdo','Galebovo gnezdo',2,-1,1,1,{secret:true,lore:'Galebovo gnezdo. Odavde se vidi more i galija koja jednom čeka da odnese Marka u Hilandar.'}],
  ['trska','Tršćak',2,0,1,1,{set:'reka'}],
  ['vodenica','Vodenica',3,-1,1,2,{interior:true}],
  ['tavan','Tavan vodenice',4,-1,1,1,{interior:true}],
  ['jele','Dve tanke jele',5,-1,1,1],
  ['skela','Skela',4,0,2,1,{set:'reka'}],
  ['pristan','Pristanište',6,0,1,1,{set:'reka'}],
  ['svetionik','Svetionik',7,-2,1,3,{interior:true}],
  ['kula','Stražarnica',8,-1,1,1,{interior:true}],
  ['bedem','Bedem nad morem',8,-2,1,1],
  ['jazbina','Rakova jazbina',-1,1,1,1,{secret:true,interior:true,lore:'Rakova jazbina. Ribari su ovde krili mreže od turske carine; Marko im je platio carinu.'}],
  ['pecina','Morska pećina',0,1,2,1,{interior:true}],
  ['vir','Podvodni prolaz',2,1,2,1,{interior:true}],
  ['izvor','Slatki izvor',3,2,1,1,{interior:true}],
  ['vilin','Vilin vir',4,1,1,1,{interior:true}],
  ['lada','Potonula lađa',5,1,2,1,{interior:true}],
  ['riznica','Blago potonule lađe',7,1,1,1,{secret:true,interior:true,lore:'Blago potonule lađe. Dubrovački trgovci su ga izgubili u oluji; Marko ga je vratio njihovim udovicama.'}]],
 brda:{zora:[[500,900,-30]],pesak:[[200,400,30]]},
 gradi(K){
  // Obala pred zoru: guslar peva Markovo poslednje jutro
  K.guslar('zora',850,['Poranio Kraljeviću Marko','u neđelju prije jarkog sunca,','pokraj mora Urvinom planinom.']);K.door('zora','pesak',0);
  // Peščani sprud: prva borba; krilo na liticu, rupa u morsku pećinu
  K.block('pesak',2050,120,160,120);K.borba('pesak',[['sword',900],['pas',1500],['archer',2100,120]]);K.wing('pesak',500,{upper:'litica'});K.drop('pesak',1700,1900,'pecina');K.door('pesak','trska',0);
  K.strelnica('litica',2380,{row:-1,every:2.8});K.heart('litica',1500,-1);K.fake('litica','gnezdo',{row:-1});K.cudo('gnezdo',600,'Galebovo pero',-1);
  // Tršćak i vodenica: vodeničar; dimnjak do tavana
  K.prop('trska','trska',600,120);K.heart('trska',900,0);K.door('trska','vodenica',0);
  K.lik('vodenica',300,'putnik-starac-idle','Vodeničar: Turci melju brašno za galiju. Na bedem nad morem ne stiže se bez krila.',0);K.chimney('vodenica',700);K.door('vodenica','skela',0);K.door('vodenica','tavan',-1);
  K.heart('tavan',600,-1);K.door('tavan','jele',-1);K.lik('jele',600,'vila-spreda','Ravijojla: Ne žuri, Marko. Umrećeš od Boga, od starog krvnika, kod dve tanke jele i bunara.',-1);
  // Skela: druga borba, greda nad vodom; krilo do jela
  K.greda('skela',600,{span:220});K.borba('skela',[['shield',1500],['sword',1900]]);K.wing('skela',1500,{upper:'jele'});K.door('skela','pristan',0);
  // Pristanište: čekpoint, iguman Vaso; svetionik, stražarnica i bedem nad morem
  K.ckpt('pristan',200);K.lik('pristan',700,'putnik-kaluder-idle','Iguman Vaso: Pred zoru se ne plovi. Na bedemu nad morem stoji Janičarski aga.');K.door('pristan','svetionik',0);
  K.borba('svetionik',[['sword',300],['akindzija',1000]],0);K.chimney('svetionik',700);K.wing('svetionik',300,{row:-1});K.door('svetionik','kula',-1);K.door('svetionik','bedem',-2);K.bos('bedem','sword');
  K.strelnica('kula',1180,{row:-1,every:2.6});K.heart('kula',400,-1);
  // Morska pećina: treća borba, dimnjak gore, napukli zid do jazbine
  K.borba('pecina',[['pas',500],['sword',1400]]);K.chimney('pecina',1000,{upper:'pesak'});K.crack('pecina','jazbina',{row:1});K.heart('jazbina',500,1);K.door('pecina','vir',1);
  // Podvodni prolaz: daske nad vodom; slatki izvor ispod
  K.crumble('vir',600,170,1);K.crumble('vir',770,170,1);K.pit('vir',600,940);K.drop('vir',1500,1700,'izvor');K.chimney('izvor',700,{upper:'vir'});K.heart('izvor',300,2);K.door('vir','vilin',1);
  // Vilin vir: krilo i čekpoint; potonula lađa i njeno blago
  K.ckpt('vilin',300);K.shrine('krilo','vilin',700);K.door('vilin','lada',1);
  K.borba('lada',[['sword',600],['shield',900]]);K.strelnica('lada',2380,{every:2.6});K.crack('lada','riznica',{row:1});K.cudo('riznica',600,'Blago potonule lađe',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 17 · San Kraljevića Marka („Marko Kraljević u pećini“): Marko spava u vilinskoj pećini, sablja mu sama izleće iz korica.
// U snu prolazi četiri odaje: slova na sablji, jabuke i prstenove, suvu drenovinu i gusle što same gude. Juriš u vazduhu
// je na dnu sna, kraj vilinog jezera; na kraju sna čeka Musa, stari megdan koji se sanja.
17:pohod({id:'san',ime:'San Kraljevića Marka',biom:'urvina',zeljeniBiom:'san',daje:'nalet',pocetne:['krilo'],
 cilj:'Prođi četiri odaje sna i probudi se',start:'postelja',spawnDx:240,
 uvod:'San Kraljevića Marka. Četiri odaje: slova, jabuke, drenovina i gusle. Hodnik senki se prelazi samo jurišem, a juriš je na dnu sna, kraj vilinog jezera.',
 sobe:[
  ['postelja','Kamena postelja',-1,0,1,1,{interior:true}],
  ['vrata','Vrata sna',-1,-1,1,1,{interior:true}],
  ['predvorje','Predvorje sna',0,0,2,1,{interior:true}],
  ['svod','Svod pećine',0,-1,2,1,{interior:true}],
  ['zvezde','Odaja zvezda',2,-1,1,1,{secret:true,interior:true,lore:'Odaja zvezda. Na svodu su zvezde kao na Đurđevdan, kad je Marko slavio krsnu slavu.'}],
  ['slova','Odaja slova',2,0,1,1,{interior:true}],
  ['hodnik','Hodnik senki',3,0,2,1,{interior:true}],
  ['mahovina','Šarčeva mahovina',3,-1,2,1,{interior:true}],
  ['jabuke','Odaja jabuka',5,0,1,1,{interior:true}],
  ['sablja','Sablja iz korica',5,-1,1,1,{interior:true}],
  ['drenovina','Odaja drenovine',6,-1,1,2,{interior:true}],
  ['oblak','Oblak nad snom',6,-2,1,1,{interior:true}],
  ['gusle','Odaja gusala',7,-1,1,1,{interior:true}],
  ['kraj','Kraj sna',8,-1,1,1,{interior:true}],
  ['senka','Senka',-1,1,1,1,{secret:true,interior:true,lore:'Senka. U snu Marko vidi svoju senku kako jaše Šarca; senka se ne osvrće.'}],
  ['ponor','Ponor sna',0,1,2,1,{interior:true}],
  ['izvor','Izvor sna',1,2,1,1,{interior:true}],
  ['jezero','Vilino jezero',2,1,1,1,{interior:true}],
  ['korenje','Korenje sna',3,1,2,1,{interior:true}],
  ['riznica','Riznica sna',5,1,1,1,{secret:true,interior:true,lore:'Riznica sna. Sve što je Marko dao sirotinji vraća mu se u snu, zlatom i pesmom.'}]],
 gradi(K){
  // Kamena postelja: guslar; krilo do vrata sna
  K.guslar('postelja',850,['Kad u sanku čudan san viđelo,','da to nije za njega livada,','već bijaše vilinska pećina.']);K.wing('postelja',400,{upper:'vrata'});K.heart('vrata',900,-1);K.door('postelja','predvorje',0);
  // Predvorje: senke janičara; krilo na svod, rupa u ponor sna
  K.block('predvorje',2050,120,160,120);K.borba('predvorje',[['sword',900],['pas',1400],['archer',2100,120]]);K.wing('predvorje',500,{upper:'svod'});K.drop('predvorje',1700,1900,'ponor');K.door('predvorje','slova',0);
  K.block('svod',1000,120,140,120,-1);K.borba('svod',[['archer',1050,120],['sword',1500]],-1);K.strelnica('svod',300,{row:-1,dir:1,every:2.8});K.crack('svod','zvezde',{row:-1});K.cudo('zvezde',600,'Đurđevdanska zvezda',-1);
  // Prva odaja: slova na sablji; pod se otvara ka vilinom jezeru
  K.lik('slova',200,'novak-idle','Novak kovač: Tri slova na sablji: moje, Vukašinovo i tvoje. Ko ih pročita, ide dalje.');K.cudo('slova',950,'Tri slova');K.door('slova','hodnik',0);
  // Hodnik senki: juriš preko ponora; krilo do Šarčeve mahovine
  K.dash('hodnik',700);K.strelnica('hodnik',2380,{every:2.6});K.wing('hodnik',200,{upper:'mahovina'});K.door('hodnik','jabuke',0);
  K.crumble('mahovina',900,170,-1);K.crumble('mahovina',1070,170,-1);K.pit('mahovina',900,1240);K.heart('mahovina',1800,-1);
  // Druga odaja: jabuke i prstenovi; čekpoint
  K.ckpt('jabuke',200);K.lik('jabuke',700,'putnica-idle','Devojka: Jabuka je dečja zabava, a prsten junačka belega. Šta ćeš uzeti, Marko?');K.door('jabuke','drenovina',0);
  // Treća odaja: suva drenovina; Musa iz sna čeka na kraju
  K.borba('drenovina',[['sword',300],['shield',1000]],0);K.lik('drenovina',500,'musa-idle','Musa: Iscedi vodu iz suve drenovine, Marko, pa izađi na megdan.',0);K.chimney('drenovina',700);
  K.wing('drenovina',200,{upper:'oblak',row:-1});K.heart('oblak',800,-2);K.door('sablja','drenovina',-1);K.cudo('sablja',500,'Sablja iz korica',-1);K.door('drenovina','gusle',-1);
  // Četvrta odaja: gusle što same gude; kraj sna
  K.lik('gusle',600,'vila-carolija','Ravijojla: Gusle same gude, Marko. Kad se probudiš, sablja će sama izleteti iz korica.',-1);K.door('gusle','kraj',-1);K.bos('kraj','sword',{name:'Musa iz sna',look:'musa',hp:820});
  // Ponor sna: greda, borba; lažni zid do senke; izvor ispod
  K.greda('ponor',400,{span:220});K.borba('ponor',[['pas',1300],['sword',1850]]);K.fake('ponor','senka',{row:1});K.heart('senka',500,1);K.chimney('ponor',1000,{upper:'predvorje'});
  K.drop('ponor',2000,2150,'izvor');K.chimney('izvor',300,{upper:'ponor'});K.heart('izvor',900,2);K.door('ponor','jezero',1);
  // Vilino jezero: juriš i čekpoint; dimnjak u odaju slova; korenje i riznica sna iza ponora
  K.ckpt('jezero',200);K.shrine('nalet','jezero',950);K.chimney('jezero',500,{upper:'slova'});K.door('jezero','korenje',1);
  K.dash('korenje',700);K.door('korenje','riznica',1);K.cudo('riznica',600,'Zlato iz sna',1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 18 · Azačka kula („Marko Kraljević u Azačkoj tamnici“): iz tamnice gde je voda do kolena Marko izlazi kroz tamnički
// prozor i avliju, uz kulu od dvadeset tavana. Vrata kule otvara daleki prekidač u stražari; Vilin trag čeka u cisterni
// ispod avlije. Na vrhu kule je Arapin, a u golubarniku sivi soko čeka knjigu za Dojčila u Solunu.
18:pohod({id:'azak',ime:'Azačka kula',biom:'klisura',zeljeniBiom:'tvrdjava',daje:'trag',pocetne:['krilo','nalet'],
 cilj:'Iz tamnice kroz avliju, Vilinim tragom kroz vrata kule i na vrh, do Arapina',start:'tamnica',spawnDx:240,
 uvod:'Azačka tamnica. Voda do kolena, kosti do pojasa. Vrata kule otvara prekidač u stražari, predaleko od vrata; Vilin trag čeka u cisterni ispod avlije.',
 sobe:[
  ['tamnica','Azačka tamnica',0,1,2,1,{interior:true}],
  ['kosti','Kosti sužanja',-1,1,1,1,{secret:true,interior:true,lore:'Kosti sužanja. Sedam godina je Marko brojao zime po grudvi snega, a leta po struku bosiljka.'}],
  ['izvor','Voda do kolena',1,2,1,1,{interior:true}],
  ['prozor','Tamnički prozor',0,0,2,1],
  ['zaduzbina','Zadužbina',-1,0,1,1,{secret:true,interior:true,lore:'Zadužbina. Marko se pokajao što je posekao kraljevu kćer koja ga je izbavila, pa je zidao zadužbine.'}],
  ['zmije','Zmije i jakrepi',2,1,1,1,{interior:true}],
  ['cisterna','Cisterna',3,1,1,1,{interior:true}],
  ['potkop','Potkop pod kulom',4,1,2,1,{interior:true}],
  ['riznica','Arapsko blago',6,1,1,1,{secret:true,interior:true,lore:'Arapsko blago. Kraljeva kći je donela tovar blaga da kupi Marka; on ga je razdao manastirima.'}],
  ['avlija','Avlija kule',2,0,2,1],
  ['bedem','Bedem',2,-1,2,1],
  ['osmatracnica','Osmatračnica',2,-2,1,1],
  ['strelnice','Hodnik strelnica',4,-1,1,1,{interior:true}],
  ['straza','Stražara',4,0,1,1,{interior:true}],
  ['kula','Kula od dvadeset tavana',5,-2,1,3,{interior:true}],
  ['konjusnica','Konjušnica',6,0,1,1,{interior:true}],
  ['more','Kula nad morem',7,0,1,1],
  ['arapkina','Odaja kraljeve kćeri',6,-1,1,1,{interior:true}],
  ['golubarnik','Golubarnik',7,-1,1,1,{interior:true}],
  ['vrh','Vrh kule',6,-2,1,1]],
 gradi(K){
  // Azačka tamnica: sužanj guslar peva o sokolu; krilo do prozora, lažni zid do kostiju, voda do kolena ispod
  K.guslar('tamnica',850,['Pa dozivlje sivoga sokola:','„O sokole, pust mi ne ostao!','Nosi knjigu ka gradu Solunu.”']);K.wing('tamnica',400,{upper:'prozor'});
  K.fake('tamnica','kosti',{row:1});K.cudo('kosti',500,'Grudva snega',1);K.drop('tamnica',1500,1650,'izvor');K.chimney('izvor',800,{upper:'tamnica'});K.heart('izvor',200,2);K.door('tamnica','zmije',1);
  // Tamnički prozor: devojke; napukli zid do zadužbine
  K.lik('prozor',1100,'putnica-idle','Devojka: Zimi mu ubacimo grudvu snega, a leti struk bosiljka, da zna koje je doba godine.');K.crack('prozor','zaduzbina',{row:0});K.cudo('zaduzbina',600,'Zadužbina');K.heart('prozor',1900,0);K.door('prozor','avlija',0);
  // Zmije i jakrepi: treća borba; dimnjak u avliju; cisterna sa Vilinim tragom
  K.borba('zmije',[['pas',600],['pas',900]],1);K.chimney('zmije',200,{upper:'avlija'});K.door('zmije','cisterna',1);
  K.ckpt('cisterna',300);K.shrine('trag','cisterna',700);K.door('cisterna','potkop',1);
  // Potkop: greda, četvrta borba; arapsko blago iza vrata na prekidač
  K.greda('potkop',400,{span:220});K.borba('potkop',[['sword',900],['shield',1100]]);K.trace('potkop','riznica');K.cudo('riznica',600,'Arapsko blago',1);
  // Avlija: prva borba, juriš preko jarka; krilo na bedem
  K.borba('avlija',[['sword',1000],['akindzija',2000]]);K.dash('avlija',1200);K.wing('avlija',500,{upper:'bedem'});K.door('avlija','straza',0);
  K.block('bedem',1300,120,140,120,-1);K.borba('bedem',[['archer',1350,120],['sword',1900]],-1);K.wing('bedem',860,{upper:'osmatracnica'});K.heart('osmatracnica',300,-2);K.door('bedem','strelnice',-1);
  K.strelnica('strelnice',1180,{row:-1,every:2.4});K.strelnica('strelnice',1180,{row:-1,every:2.4,low:true,phase:.5});K.heart('strelnice',1000,-1);
  // Stražara: čekpoint; vrata kule na daleki prekidač (Vilin trag)
  K.ckpt('straza',500);K.lik('straza',300,'caus-idle','Stražar: Vrata kule otvara prekidač kraj ulaza, a zatvore se pre nego što stigneš.');K.trace('straza','kula');
  // Kula od dvadeset tavana: peta borba, dimnjak, krilo; Arapin na vrhu
  K.borba('kula',[['sword',400],['akindzija',1000]],0);K.chimney('kula',700);K.wing('kula',300,{row:-1});K.door('kula','konjusnica',0);K.door('kula','arapkina',-1);K.door('kula','vrh',-2);K.bos('vrh','arapin');
  K.heart('konjusnica',600,0);K.door('konjusnica','more',0);K.strelnica('more',1180,{every:2.6});K.cudo('more',700,'Pogled na more');
  K.lik('arapkina',600,'putnica-idle','Kraljeva kći: Izbaviću te, Marko, ako me uzmeš za ljubu. Na vrhu kule je Arapin.',-1);K.door('arapkina','golubarnik',-1);
  K.lik('golubarnik',600,'soko-let','Sivi soko: Daj mi knjigu, Marko. Odneću je Dojčilu u Solun.',-1);K.heart('golubarnik',950,-1);}}),
// ---------------------------------------------------------------------------------------------------------------------
// 19 · Tri srca Kačanika („Marko Kraljević i Musa Kesedžija“, glavni nivo igre): šest poglavlja glavne priče kao sobe.
// Drum junaka, zatočena kapija sa putnicima (prečica iz hana), tri vilinska kamena (treći daje Sokolovo krilo: „u vazduhu
// te mogu podići još jednom“), srušeni drum na koji se penje krilom, obruč i poslednji barjak, i megdan sa Musom.
19:pohod({id:'kacanik',ime:'Tri srca Kačanika',biom:'klisura',zeljeniBiom:'klisura',daje:'krilo',pocetne:[],
 cilj:'Oslobodi drum i kapiju, probudi tri vilinska kamena i izađi na megdan Musi',start:'raskrsce',spawnDx:240,
 uvod:'Tri srca Kačanika. Musini ljudi su zatvorili drum i kapiju hana, a putnici čekaju. Tri vilinska kamena spavaju pod drumom; treći daje Sokolovo krilo, a bez njega se na srušeni drum ne penje.',
 sobe:[
  ['raskrsce','Raskršće',-1,0,1,1],
  ['drum','Drum junaka',0,0,2,1],
  ['straza','Osmatračnica nad drumom',1,-1,2,1],
  ['bedem','Bedem hana',3,-1,1,1],
  ['han','Soba u hanu',4,-1,1,1,{interior:true}],
  ['kapija','Zatočena kapija',2,0,1,1],
  ['trg','Putnički han',3,0,2,1],
  ['kamen1','Prvi vilinski kamen',5,0,1,1],
  ['urvina','Srušeni drum',6,-1,1,2],
  ['gnezdo','Orlovo gnezdo',6,-2,1,1,{secret:true,lore:'Orlovo gnezdo. Orao čuva pero za Marka; vila mu je rekla da će junak doći na Šarcu.'}],
  ['greben','Greben nad drumom',7,-1,2,1],
  ['obruc','Obruč',9,-1,1,1],
  ['megdan','Musin megdan',10,-1,1,1],
  ['drum2','Drum pod grebenom',7,0,2,1],
  ['tamnica','Musina tamnica',9,0,1,1,{interior:true}],
  ['jazbina','Jazbina pod drumom',-1,1,1,1,{secret:true,interior:true,lore:'Jazbina pod drumom. Ovde su putnici krili dukate od Musinih ljudi; Marko ih je vratio vlasnicima.'}],
  ['potok','Potok pod drumom',0,1,2,1,{interior:true}],
  ['pecina','Vilinska pećina',2,1,2,1,{interior:true}],
  ['izvor','Vilinski izvor',4,1,1,1,{interior:true}],
  ['kesa','Musina kesa',5,1,1,1,{secret:true,interior:true,lore:'Musina kesa. Plen sa zatvorenog druma; Musa je devet godina dvorio cara i nijednom nije bio plaćen.'}]],
 brda:{raskrsce:[[500,900,40]],greben:[[300,800,40]]},
 gradi(K){
  // I · Drum junaka: guslar o tri Musina srca; prva borba; dimnjak do osmatračnice, rupa u potok
  K.guslar('raskrsce',850,['Ali u Musi tri srca junačka:','jedno mu se srce umorilo,','a drugo se jako razigralo.']);K.door('raskrsce','drum',0);
  K.borba('drum',[['sword',600],['shield',1000]]);K.spikes('drum',1300,120);K.chimney('drum',1500,{upper:'straza'});K.drop('drum',300,500,'potok');K.door('drum','kapija',0);
  K.strelnica('straza',2380,{row:-1,every:2.8});K.heart('straza',300,-1);K.door('straza','bedem',-1);
  K.drop('bedem',400,600,'trg');K.door('bedem','han',-1);K.lik('han',600,'putnik-trgovac-idle','Hančija: Musini ljudi su zatvorili kapiju hana. Poluga je ovde, sa naše strane.',-1);K.heart('han',950,-1);
  // II · Zatočena kapija: zatvorena iznutra, poluga u hanu; putnici čekaju
  K.gate('kapija','trg',0);K.prop('kapija','kapija',600,260);
  K.borba('trg',[['sword',1000],['akindzija',1400]]);K.lik('trg',1800,'svatovi-zarobljeni','Putnici: Musini ljudi su nas zatvorili. Oslobodi drum, Marko!');K.door('trg','kamen1',0);
  // III · Vilinski trag: tri kamena; prvi na drumu, drugi u pećini, treći kraj izvora sa krilom
  K.lik('kamen1',600,'vilinski-kamen-spava','Prvi vilinski kamen se budi. Drugi i treći su pod drumom, u pećini.');K.door('kamen1','urvina',0);
  // IV · Srušeni drum: penje se samo krilom; Ravijojla; orlovo gnezdo iznad
  K.wing('urvina',300,{row:0});K.lik('urvina',900,'vila-spreda','Ravijojla: U vazduhu te mogu podići još jednom. Gore je greben, a iza njega Musa.',-1);
  K.wing('urvina',600,{upper:'gnezdo',row:-1});K.cudo('gnezdo',300,'Orlovo pero',-2);K.door('urvina','greben',-1);K.door('urvina','drum2',0);
  // V · Poslednji barjak: greben i obruč, čekpoint
  K.block('greben',1000,120,140,120,-1);K.borba('greben',[['archer',1050,120],['sword',1500],['oklopnik',1900]],-1);K.strelnica('greben',2380,{row:-1,every:2.6});K.door('greben','obruc',-1);
  K.ckpt('obruc',200);K.borba('obruc',[['shield',600],['sword',900]],-1);K.cudo('obruc',1050,'Poslednji barjak',-1);K.door('obruc','megdan',-1);
  // VI · Tri srca Kačanika: Musa Kesedžija
  K.bos('megdan','sword',{name:'Musa Kesedžija',look:'musa',hp:900});
  // Drum pod grebenom i Musina tamnica
  K.crumble('drum2',600,170);K.crumble('drum2',770,170);K.pit('drum2',600,940);K.heart('drum2',1600,0);K.door('drum2','tamnica',0);
  K.lik('tamnica',600,'putnik-starac-idle','Sužanj: Tri godine je Marko ovde čekao megdan; kosa mu je narasla do zemlje.');K.heart('tamnica',950,0);
  // Pod drumom: potok sa gredom, lažni zid do jazbine; pećina sa drugim kamenom; izvor sa trećim kamenom i krilom
  K.chimney('potok',1000,{upper:'drum'});K.greda('potok',1400,{span:220});K.fake('potok','jazbina',{row:1});K.heart('jazbina',500,1);K.door('potok','pecina',1);
  K.borba('pecina',[['pas',600],['sword',900]]);K.lik('pecina',1500,'vilinski-kamen-budi','Drugi vilinski kamen se budi. Treći je kraj izvora.',1);K.door('pecina','izvor',1);
  K.chimney('izvor',300,{upper:'trg'});K.ckpt('izvor',600);K.shrine('krilo','izvor',900);K.lik('izvor',450,'vilinski-kamen-budan','Treći vilinski kamen: Uzmi krilo, Marko. Srušeni drum se penje samo njime.',1);
  K.crack('izvor','kesa',{row:1});K.cudo('kesa',600,'Musina kesa',1);}})
};

// kuka do registra u greybox.js: pohodi ulaze u isti spisak kao tri nivoa iz greybox-nivoi.js
Object.assign(GB_NIVOI,GB_POHODI);
