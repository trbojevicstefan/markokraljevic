// ================= Greybox (…/index.html?greybox): "Markove kule", a long level of plain grey rooms =================
// For feeling out the movement and the level structure taken in idea from The Lost Crown before anything is drawn for it:
// a connected map on three floors (cellars, the main road, the ramparts), gates that only a power opens, a tall tower shaft
// that ties the floors together, a shortcut gate that opens only from its far side, and five hidden rooms:
//  - Vinski podrum behind a cracked wall (a heavy blow breaks it),
//  - Golubarnik high above the start (the falcon's wing, once Marko has it),
//  - Riznica across the cellar's abyss (the air dash),
//  - Tajna ćelija behind a wall Marko can walk through,
//  - Kapela under a trapdoor that a far switch opens for a moment (the fairy's trace).
// A hidden room stays covered like rock until Marko steps into it, and the map shows only the rooms he has been in.
// No room, layout or asset is copied from any game. Marko and the foes are the game's own figures.
// game.js owns Marko, the foes and the drawing helpers and hands them in as `G` (GBX in game.js); this file never writes the save.

export const GB_ZONE=60;
export const GB_WALL=345;      // one jump and a ledge grab reach 266 px, the wing and a ledge grab 383 (greybox-test measures both)
export const GB_GAP=500;       // without the dash the farthest leap is 469 px (a roll, a jump at the edge, the wing on the right frame);
                               // a plain run-up, the dash and the wing reach 553 (greybox-test searches both)
export const GB_DOOR=1;        // seconds a door or trapdoor stays open after its switch; every switch is 1500 px or more away
const CW=1200,CH=720,FL=130;
export const GB_MOCI={
 krilo:{name:'Sokolovo krilo',key:'u skoku SPACE',color:'#f4ead2',text:'Još jedan skok u vazduhu. Okno kule se sada penje, ivicu po ivicu.'},
 nalet:{name:'Juriš u vazduhu',key:'u skoku SHIFT',color:'#ffcf6a',text:'Kratak nalet napred, bez pada. Skoči, jurni, pa krilo: tako se prelazi srušeni most.'},
 trag:{name:'Vilin trag',key:'V',color:'#8fffe0',text:'Ostavi trag kraj vrata (V), stani na prekidač, pa se tragom vrati (V) dok su vrata otvorena.'}
};
const room=(id,name,gx,gy,w,h,o={})=>({id,name,x0:gx*CW,y0:gy*CH,x1:(gx+w)*CW,y1:(gy+h)*CH,floor:(gy+h)*CH-FL,...o});
export const GB_ROOMS=[
 room('vinski-podrum','Vinski podrum',-1,0,1,1,{secret:true,lore:'Vinski podrum. Kad je car zabranio vino, Marko ga je ovde krio, iza zida koji je sam zazidao.'}),
 room('podgradje','Podgrađe',0,0,2,1),
 room('golubarnik','Golubarnik',1,-1,1,1,{secret:true,lore:'Golubarnik. Odavde su leteli golubovi sa Markovim pismima kad god je Prilep zvao u pomoć.'}),
 room('strazarnica','Stražarnica',2,0,1,1),
 room('riznica','Riznica',1,1,1,1,{secret:true,lore:'Riznica. Tri kese dukata: jedna za crkvu, jedna za sirotinju, jedna za onoga ko Marka sahrani.'}),
 room('podrum','Podrum',2,1,2,1),
 room('prolaz','Prolaz',3,0,2,1),
 room('tamnica','Sokolova tamnica',4,1,1,1),
 room('kula','Kula',5,-1,1,3),
 room('bedem','Bedem',6,-1,2,1),
 room('dvoriste','Dvorište',6,0,2,1),
 room('celija','Tajna ćelija',6,1,1,1,{secret:true,lore:'Tajna ćelija. Na zidu je urezan soko sa slomljenim krilom, a pod njim ime sužnja koji ga je hranio.'}),
 room('kapela','Kapela',7,1,1,1,{secret:true,lore:'Kapela. Sveti Đorđe na zidu, izbledeo od sveća. Pred njim je Marko palio sveću pred svaki megdan.'}),
 room('most','Srušeni most',8,0,2,1),
 room('vilina','Vilina odaja',10,0,2,1),
 room('predsoblje','Predsoblje',12,0,1,1),
 room('arena','Arena čuvara',13,0,1,1)
];
export const GB_X0=-CW,GB_X1=14*CW,GB_Y0=-CH,GB_Y1=2*CH;
// the map as a graph for the reachability test. A node is a room or a part of one; [from, to, what it asks, one-way?]
export const GB_LINKS=[
 ['podgradje','vinski-podrum',null],['podgradje','golubarnik','krilo',true],['golubarnik','podgradje',null,true],
 ['podgradje','strazarnica',null],['strazarnica','podrum',null,true],['podrum','riznica','nalet'],['podrum','tamnica',null],
 ['tamnica','kula-dno',null],['kula-dno','kula','krilo',true],['kula','kula-dno',null,true],['kula','kula-vrh','krilo',true],['kula-vrh','kula',null,true],
 ['kula-dno','celija',null],['kula','prolaz',null],['prolaz','strazarnica',null,true],['strazarnica','prolaz','precica',true],
 ['kula','dvoriste',null],['kula-vrh','bedem',null],['bedem','dvoriste',null,true],
 ['dvoriste','kapela','trag',true],['kapela','dvoriste','krilo',true],
 ['dvoriste','most',null],['most','most-desno','nalet'],['most-desno','vilina',null],['vilina','vilina-izlaz','trag'],
 ['vilina-izlaz','predsoblje',null],['predsoblje','arena',null]];
export const GB_SHRINES={krilo:'tamnica',nalet:'bedem',trag:'vilina'};
export const GB_NODE_ROOM={'kula-dno':'kula','kula-vrh':'kula','most-desno':'most','vilina-izlaz':'vilina'};
export function gbReach(moci,start='podgradje'){const seen=new Set([start]);let grown=true;
 while(grown){grown=false;for(const [a,b,need,one] of GB_LINKS){const ok=!need||moci.has(need)||(need==='precica'&&seen.has('prolaz'));if(!ok)continue;for(const [u,v] of one?[[a,b]]:[[a,b],[b,a]])if(seen.has(u)&&!seen.has(v)){seen.add(v);grown=true;}}}
 return[...seen];}

// where things stand
const at=id=>GB_ROOMS.find(R=>R.id===id);
export const X={spawn:300,ck1:450,ledge:1050,pillar:2140,hole3:1950,drop:2950,perch:3250,gap4:2450,crumble:3700,low:4300,gate:3640,lever:3780,
 ck2:5000,krilo:5500,shaft:6000,ck3:7450,sw2:7650,trap:9200,hole6:8800,nalet:9300,pit:10400,sw1:12150,trag:12500,door:14250,ck4:14550,arena0:15640,arena1:16760};
// the lie of the land: hills (+) and hollows (−) as smooth bumps on a room's floor line, world x
const BUMPS={podgradje:[[600,950,-50],[1350,1800,90]],prolaz:[[4100,4700,70],[5000,5600,-60]],vilina:[[13000,13600,120]],predsoblje:[[14750,15150,60],[15250,15550,-45]]};
export function gbGround(x,R=GB_ROOMS.find(R=>x>=R.x0&&x<R.x1&&R.y0>=0&&R.y0<CH)){let y=R?R.floor:CH-FL;for(const [a,b,h] of BUMPS[R?.id]||[])if(x>a&&x<b)y-=h*(1-Math.cos(2*Math.PI*(x-a)/(b-a)))/2;return y;}
export function gbRoomAt(x,y){return GB_ROOMS.findIndex(R=>x>=R.x0&&x<R.x1&&y-40>=R.y0&&y-40<R.y1);}
const clampN=(n,a,b)=>Math.max(a,Math.min(b,n));

export function makeGreybox(){
 const platforms=[],enemies=[],breakables=[],pits=[];let id=3000;
 const block=(x,y,w,h,o={})=>{const q={x,y,w,h,kind:'stone',solid:true,...o};platforms.push(q);return q;};
 const foe=(type,x,y,o={})=>{const hp={shield:125,archer:65,akindzija:80,oklopnik:240,palikuca:70,pas:60}[type]??90;enemies.push({id:id++,x,y,vx:0,vy:0,w:36,h:type==='pas'?50:75,hp,maxHp:hp,type,zone:GB_ZONE,face:-1,mode:'idle',timer:.5+(enemies.length%4)*.23,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:true,...o});};
 // openings in the walls between rooms (x, top, bottom) and holes in the floors (from, to, the side whose edge cannot be caught)
 const OPEN=[[0,385,590],[2400,330,590],[2400,1050,1310],[3600,330,590],[4800,1050,1310],[6000,1050,1310],[6000,330,590],
  [7200,330,590],[7200,-390,-130],[7200,1110,1310],[9600,330,590],[12000,330,590],[14400,330,590],[15600,330,590]];
 const HOLES={strazarnica:[[X.drop,X.drop+200]],golubarnik:[[X.hole3,X.hole3+300]],bedem:[[X.hole6,X.hole6+150]],dvoriste:[[X.trap,X.trap+120]],
  podrum:[[X.gap4,X.gap4+GB_GAP,'left'],[X.crumble,X.crumble+400]],most:[[X.pit,X.pit+GB_GAP,'right']]};
 // walls: each room's two sides, from its top down to its floor, cut where an opening is; a shared side is built once
 const done=new Set();for(const R of GB_ROOMS)for(const x of[R.x0,R.x1]){const key=`${x}|${R.y0}|${R.floor}`;if(done.has(key))continue;done.add(key);
  const cuts=OPEN.filter(([ox,a,b])=>ox===x&&b>R.y0&&a<R.floor).sort((u,v)=>u[1]-v[1]);let y=R.y0;
  for(const [,a,b] of cuts){if(a>y)block(x-20,y,40,a-y,{gbWall:true});y=Math.max(y,b);}if(R.floor>y)block(x-20,y,40,R.floor-y,{gbWall:true});}
 // floors: a slab from the floor line to the bottom of the room; hills and hollows make a slope (`surf`) that bodies walk along
 for(const R of GB_ROOMS){const holes=(HOLES[R.id]||[]).slice().sort((u,v)=>u[0]-v[0]);let x=R.x0;const segs=[];
  holes.forEach(([a,b,lip])=>{segs.push([x,a,lip==='left'?'end':null]);x=b;});segs.push([x,R.x1,holes.at(-1)?.[2]==='right'?'start':null]);
  for(let [a,b,lip] of segs){if(b-a<1)continue;
   // the last 60 px before the far side of an abyss is a 'step', whose edge cannot be caught from below
   if(lip==='end'){const s=Math.max(a,b-60);block(s,R.floor,b-s,FL,{kind:'step',ground:true,gbLip:true});b=s;}
   if(lip==='start'){const s=Math.min(b,a+60);block(a,R.floor,s-a,FL,{kind:'step',ground:true,gbLip:true});a=s;}
   if(b-a<1)continue;const bumps=(BUMPS[R.id]||[]).some(([u,v])=>u<b&&v>a);
   if(bumps){const S=[],w=Math.round((b-a)/8)*8;for(let k=0;k<=w;k+=8)S.push(Math.round(gbGround(a+k,R)*10)/10);const top=Math.min(...S);platforms.push({x:a,y:top,w,h:R.y1-top,kind:'stone',ground:true,surf:S,sx:8});block(a,R.y1-30,w,30);}
   else block(a,R.floor,b-a,FL,{ground:true});}
  // a roof wherever no room stands above
  const above=GB_ROOMS.filter(o=>o.y1===R.y0&&o.x1>R.x0&&o.x0<R.x1).sort((u,v)=>u.x0-v.x0);let rx=R.x0;
  for(const o of above){if(o.x0>rx)block(rx,R.y0-160,o.x0-rx,160,{gbRoof:true});rx=Math.max(rx,o.x1);}if(rx<R.x1)block(rx,R.y0-160,R.x1-rx,160,{gbRoof:true});}
 // the abysses: falling into one costs 20 health and brings Marko back to firm ground
 pits.push({x0:X.gap4,x1:X.gap4+GB_GAP,y:at('podrum').floor+150},{x0:X.crumble,x1:X.crumble+400,y:at('podrum').floor+150},{x0:X.pit,x1:X.pit+GB_GAP,y:at('most').floor+150});
 const F=at('podgradje').floor,FC=at('podrum').floor,FT=at('bedem').floor;
 // Podgrađe: a low block to learn the ledge grab on, a ledge high under the hole to the Golubarnik (Marko walks under it), the cracked wall to the Vinski podrum
 block(X.ledge,F-150,170,150);block(X.pillar,F-365,100,40,{gbGate:'krilo'});
 {const b={id:1,x:0,y:F,kind:'zid',hp:4,hp0:4,w:74,h:205,solid:true,flash:0,loot:{coins:6}};b.plat={x:-37,y:F-205,w:74,h:205,kind:'crate',solid:true};platforms.push(b.plat);breakables.push(b);}
 // Stražarnica: a janičar, an archer on a raised block, and the hole down into the cellar
 block(X.perch,F-120,200,120);foe('sword',2650,F);foe('archer',X.perch+100,F-120);
 // Podrum: the abyss to the Riznica (its far edge cannot be caught), planks that give way over a pit, a low vault
 block(X.crumble,FC,200,18,{kind:'plank',solid:false,crumble:true});block(X.crumble+200,FC,200,18,{kind:'plank',solid:false,crumble:true});
 block(X.low,CH,400,FC-150-CH);foe('shield',3400,FC);foe('pas',4500,FC);foe('sword',4700,FC);
 // Kula: ledges up the shaft, each a wing's height apart; the main road crosses it, the ramparts leave it at the top
 const sh=X.shaft;block(sh+400,FC-355,400,FL,{gbGate:'krilo'});block(sh,F,250,FL,{gbGate:'krilo'});block(sh+950,F,250,FL,{gbGate:'krilo'});
 block(sh+450,F-355,300,FL,{gbGate:'krilo'});block(sh+950,FT,250,FL,{gbGate:'krilo'});
 // Prolaz: the gate to the Stražarnica that opens only from this side, a rider and a dog on the hills
 const gate=block(X.gate,0,40,F,{gbOneWay:true});foe('akindzija',4400,gbGround(4400));foe('pas',5300,gbGround(5300));
 // Dvorište: the switch, the trapdoor to the Kapela at the far end; a rider and an armoured man
 const trap=block(X.trap,F,120,FL,{gbTrap:true});foe('akindzija',8100,F);foe('oklopnik',8500,F);
 // Bedem: archers on the merlons, a janičar, the hole down into the Dvorište, the dash at the end
 block(7700,FT-120,100,120);block(8250,FT-120,100,120);foe('archer',7750,FT-120);foe('archer',8300,FT-120);foe('sword',8000,FT);
 // Kapela: a ledge to climb back up through the trapdoor once it stays open
 block(9000,FC-355,150,FL,{gbGate:'krilo'});
 // Srušeni most: a štitonoša past the abyss
 foe('shield',11400,F);
 // Vilina odaja: the door at the far end
 const door=block(X.door,0,44,F,{gbDoor:true});
 // Predsoblje: an armoured man and a fire-raiser on the hills
 foe('oklopnik',15000,gbGround(15000));foe('palikuca',15400,gbGround(15400));
 // Arena čuvara: Janičarski aga, on the beams he jumps between
 const a0=X.arena0,len=X.arena1-a0,plank=(k,dy,w=150)=>platforms.push({x:Math.round(a0+len*k-w/2),y:F-dy,w,h:18,kind:'plank',arena:true});
 plank(.16,150);plank(.4,265,140);plank(.64,150);plank(.86,240,140);
 foe('sword',Math.round(a0+len*.68),F,{id:3100,champion:true,scale:1.35,hp:700,maxHp:700,name:'Čuvar arene (Janičarski aga)',kit:'janicar',look:'janicarski-aga',w:50,h:100,arena:{x0:a0,x1:X.arena1,y:F}});
 const level={id:'greybox',greybox:true,name:'Markove kule',width:GB_X1,spawn:{x:X.spawn,y:F},goal:{x:GB_X1+5000,y:F},props:[],peace:false,design:{goal:'Pronađi tri moći i pobedi čuvara'}};
 const secret=GB_ROOMS.filter(R=>R.secret);
 const gb={t:0,room:-1,seen:new Set(),moci:{krilo:false,nalet:false,trag:false},pits,
  shrines:[['krilo','tamnica'],['nalet','bedem'],['trag','vilina']].map(([moc,r])=>({moc,x:X[moc],y:at(r).floor,taken:false})),
  ckpts:[{id:1,x:X.ck1,y:F},{id:2,x:X.ck2,y:FC},{id:3,x:X.ck3,y:F},{id:4,x:X.ck4,y:gbGround(X.ck4)}],ckpt:1,
  doors:[{id:'vilina',q:door,sw:{x:X.sw1,y:F,w:90},open:0,solved:false,down:false},{id:'kapela',q:trap,sw:{x:X.sw2,y:F,w:90},open:0,solved:false,down:false,floor:true}],
  gate:{q:gate,lever:{x:X.lever,y:F},open:false},
  fakes:[{x:7180,y:FC-200,w:60,h:200,found:false}],
  hearts:secret.map(R=>({room:R.id,x:R.id==='kapela'?8700:Math.round((R.x0+R.x1)/2),y:R.floor,taken:false})),
  secrets:secret.length,found:new Set(),cover:Object.fromEntries(secret.map(R=>[R.id,1])),done:false,told:{}};
 return{platforms,enemies,items:[],runes:[],barriers:[],goals:[],level,ladders:[],breakables,towers:[],plows:[],plowTeams:[],traps:[],cannons:[],guns:[],vaults:[],logori:[],busy:[],y0:GB_Y0,pitY:GB_Y1+500,gb,
  chapter:{name:'GREYBOX · MARKOVE KULE',start:GB_X0,end:GB_X1,goal:level.design.goal,message:''}};
}

// ---------- once a step (game.js calls it from update while the greybox is the level) ----------
export function gbTick(G,dt){const W=G.world,S=W.gb,p=G.p;if(!S||G.mode!=='play')return;S.t+=dt;
 const r=gbRoomAt(p.x,p.y);if(r>=0&&r!==S.room){S.room=r;const R=GB_ROOMS[r];if(!S.seen.has(r)){if(S.t>.5)G.toast(R.name.toUpperCase(),1.6);if(R.secret){S.found.add(R.id);G.sfx('magic',{gain:.6});G.toast(`Tajna soba! ${S.found.size}/${S.secrets}`,2.4);if(R.lore)G.speak(R.lore,8);}}S.seen.add(r);}
 for(const R of GB_ROOMS)if(R.secret&&S.found.has(R.id))S.cover[R.id]=Math.max(0,S.cover[R.id]-dt*1.6);
 const near=(o,dx=46,dy=70)=>Math.abs(p.x-o.x)<dx&&Math.abs(p.y-o.y)<dy;
 for(const s of S.shrines)if(!s.taken&&near(s)){s.taken=true;S.moci[s.moc]=true;const M=GB_MOCI[s.moc];G.burst(s.x,s.y-70,M.color,40,240);G.sfx('magic_big',{gain:.9});G.label(M.name.toUpperCase(),s.x,s.y-160,M.color);G.speak(`${M.name} (${M.key}). ${M.text}`,9);}
 for(const h of S.hearts)if(!h.taken&&near(h,50)){h.taken=true;p.maxHp+=10;p.hp=p.maxHp;G.sfx('coins',{gain:1});G.burst(h.x,h.y-40,'#ff8a8a',30,200);G.label('DEO SRCA · +10 ZDRAVLJA',h.x,h.y-150,'#ffb0a0');}
 // a checkpoint fills the health each time Marko steps on it again, and Ravijojla brings him back to the last one
 for(const c of S.ckpts){if(!near(c,40,8)||!p.grounded){if(c.on&&Math.abs(p.x-c.x)>140)c.on=false;continue;}if(c.on)continue;c.on=true;S.ckpt=c.id;G.ckpt={x:c.x,y:c.y};p.hp=p.maxHp;G.sfx('ring',{gain:.5});G.label('ČEKPOINT',c.x,c.y-170,'#a6ffe1');}
 // a fall into an abyss: the game's own pit rule takes it from here (−20 health, back on firm ground)
 for(const z of S.pits)if(p.x>z.x0&&p.x<z.x1&&p.y>z.y){p.y=W.pitY+10;break;}
 // switches: each opens its door or trapdoor for GB_DOOR seconds; once Marko is through, it stays open
 for(const D of S.doors){const q=D.q,sw=D.sw,on=p.grounded&&Math.abs(p.x-sw.x)<sw.w/2&&Math.abs(p.y-sw.y)<4;
  if(on&&!D.down&&!D.solved){D.open=GB_DOOR;G.sfx('clang',{gain:.6,rate:1.4});G.label(D.floor?'POKLOPAC!':'VRATA!',q.x+q.w/2,q.y-(D.floor?40:260),'#8fffe0');}D.down=on;
  if(D.solved)continue;const was=q.off;D.open=Math.max(0,D.open-dt);
  const inside=D.floor?(p.x+18>q.x&&p.x-18<q.x+q.w&&p.y>q.y-6&&p.y<q.y+q.h+120):(p.x+20>q.x&&p.x-20<q.x+q.w);q.off=D.open>0||(was&&inside);
  if(was&&!q.off){G.sfx('clang',{gain:.5,rate:.8});if(!D.told&&S.moci.trag&&Math.abs(p.x-q.x)>200){D.told=true;G.speak(`${D.floor?'Poklopac':'Vrata'} se zatvori pre nego što stigneš. Ostavi Vilin trag ${D.floor?'na poklopcu':'kraj vrata'} (V), stani na prekidač, pa se tragom vrati (V).`,9);}}
  if(D.floor?(p.y>q.y+q.h+30&&p.x>q.x-30&&p.x<q.x+q.w+30):(p.x>q.x+q.w+30)){D.solved=true;q.off=true;}}
 // the shortcut gate: its lever stands on the far side only
 {const g=S.gate;if(!g.open){if(Math.abs(p.x-g.lever.x)<45&&Math.abs(p.y-g.lever.y)<10){g.open=true;g.q.off=true;G.sfx('clang',{gain:.7,rate:.7});G.label('PREČICA',g.q.x,g.lever.y-200,'#ffe39a');G.toast('Kapija je otvorena: prečica do Podgrađa.',2.6);}
  else if(!S.told.gate&&p.x<g.q.x&&p.x>g.q.x-260&&Math.abs(p.y-g.lever.y)<10){S.told.gate=true;G.toast('Kapija je zatvorena. Otvara se s druge strane.',2.6);}}}
 // the fake wall gives way as soon as Marko walks into it
 for(const f of S.fakes)if(!f.found&&p.x+17>f.x&&p.x-17<f.x+f.w&&p.y>f.y&&p.y-100<f.y+f.h){f.found=true;G.sfx('rock',{gain:.5,rate:1.3});}
 // hints, once each: the cracked wall, a ledge too high for one jump, the abyss
 {const b=W.breakables.find(b=>b.kind==='zid'&&!b.broken);if(b&&!S.told.zid&&Math.abs(p.x-b.x)<260&&Math.abs(p.y-b.y)<20){S.told.zid=true;G.toast('Zid je napukao. Laki udarac odskače, teški (K) ga ruši.',3);}}
 for(const q of W.platforms)if(q.gbGate&&!S.moci[q.gbGate]&&p.grounded&&q.y<p.y-266&&q.y>p.y-500&&Math.abs(p.x-(q.x+q.w/2))<q.w/2+150&&!S.told[q.x+'|'+q.y]){S.told[q.x+'|'+q.y]=true;G.toast(`Previsoko za jedan skok. Treba ti ${GB_MOCI[q.gbGate].name}.`,2.6);}
 for(const z of S.pits)if(!S.moci.nalet&&p.grounded&&z.x1-z.x0>=GB_GAP&&!S.told['pit'+z.x0]&&Math.abs(p.y-(z.y-150))<10&&(Math.abs(p.x-z.x0)<120||Math.abs(p.x-z.x1)<120)){S.told['pit'+z.x0]=true;G.toast('Preširoko i za krilo. Treba ti Juriš u vazduhu.',2.6);}
 const c=W.enemies.find(e=>e.champion);if(c&&!c.alive&&!S.done){S.done=true;S.doneT=S.t;const m=Math.floor(S.t/60),s=Math.floor(S.t%60);G.showTitle('MARKOVE KULE SU PREĐENE',`${m}:${String(s).padStart(2,'0')}`,`Tajne sobe: ${S.found.size}/${S.secrets}`);}
 gbMap(G);}

// ---------- camera: held inside the room Marko is in, sliding over when he walks into the next one ----------
export function gbCamera(G,dt){const S=G.world.gb,p=G.p,R=GB_ROOMS[S.room>=0?S.room:Math.max(0,gbRoomAt(p.x,p.y))];
 S.focus??=p.y;if(p.grounded||p.ledgeT>0||p.y>S.focus+40||p.y<S.focus-220)S.focus+=(p.y-S.focus)*Math.min(1,dt*(p.grounded?6:3));
 const wx=clampN(p.x-G.VIEW_W*.4,R.x0,Math.max(R.x0,R.x1-G.VIEW_W)),wy=clampN(S.focus-470,R.y0-50,Math.max(R.y0-50,R.y1-G.VIEW_H+40));
 G.camera+=(wx-G.camera)*Math.min(1,dt*6);G.camY+=(wy-G.camY)*Math.min(1,dt*5);return true;}

// ---------- drawing: flat grey blocks, a 100 px grid, colour only for what matters ----------
const C={back:'#25272c',back2:'#2a2c32',secret:'#2c2836',grid:'rgba(255,255,255,.035)',block:'#7c8088',edge:'#a7abb3',dark:'#4b4e55',plank:'#8e929a',rock:'#3a3c42'};
const surfAt=(q,x)=>{const S=q.surf,k=clampN((x-q.x)/q.sx,0,S.length-1),i=Math.floor(k);return i>=S.length-1?S[S.length-1]:S[i]+(S[i+1]-S[i])*(k-i);};
export function gbDraw(G){const g=G.ctx,W=G.world,S=W.gb,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H,t=G.time;if(!g||!S)return;
 const vis=(x0,y0,x1,y1)=>x1>cam-80&&x0<cam+VW+80&&y1>cy-80&&y0<cy+VH+80;
 g.save();g.fillStyle=C.rock;g.fillRect(cam-60,cy-60,VW+120,VH+120);
 GB_ROOMS.forEach((R,i)=>{if(!vis(R.x0,R.y0,R.x1,R.y1))return;g.fillStyle=R.secret?C.secret:i%2?C.back2:C.back;g.fillRect(R.x0,R.y0,R.x1-R.x0,R.floor-R.y0);
  g.strokeStyle=C.grid;g.lineWidth=1;g.beginPath();for(let x=Math.max(R.x0,Math.floor((cam-60)/100)*100);x<Math.min(R.x1,cam+VW+60);x+=100){g.moveTo(x,R.y0);g.lineTo(x,R.floor);}for(let y=R.floor-100;y>R.y0;y-=100){g.moveTo(Math.max(R.x0,cam-60),y);g.lineTo(Math.min(R.x1,cam+VW+60),y);}g.stroke();});
 for(const z of S.pits)if(vis(z.x0,z.y-150,z.x1,z.y+400)){g.fillStyle='#141518';g.fillRect(z.x0,z.y-146,z.x1-z.x0,700);}
 for(const q of W.platforms){if(!vis(q.x,q.y,q.x+q.w,q.y+q.h)||q.kind==='crate'||(q.off&&q.arena))continue;
  if(q.gbDoor||q.gbTrap||q.gbOneWay){const col=q.gbOneWay?'#8f7a4a':'#3f8f7e',line=q.gbOneWay?'#ffe39a':'#8fffe0';
   if(q.off){g.strokeStyle=line;g.globalAlpha=.5;g.setLineDash([8,8]);g.strokeRect(q.x,q.y,q.w,q.h);g.setLineDash([]);g.globalAlpha=1;}
   else{g.fillStyle=col;g.fillRect(q.x,q.y,q.w,q.h);g.fillStyle=line;if(q.gbTrap)for(let x=q.x+12;x<q.x+q.w;x+=30)g.fillRect(x,q.y+q.h/2-3,16,6);else for(let y=q.y+30;y<q.y+q.h;y+=70)g.fillRect(q.x+q.w/2-3,y,6,30);}continue;}
  if(q.crumble){if(q.off)continue;const sh=q.shakeT>0?(Math.random()-.5)*3:0;g.fillStyle='#9a8a6a';g.fillRect(q.x+sh,q.y,q.w,q.h);g.strokeStyle='#5d5040';g.lineWidth=1;for(let x=q.x+20;x<q.x+q.w;x+=40){g.beginPath();g.moveTo(x+sh,q.y);g.lineTo(x+sh+6,q.y+q.h);g.stroke();}continue;}
  if(q.surf){const a=Math.max(q.x,Math.floor((cam-40)/8)*8),b=Math.min(q.x+q.w,cam+VW+48);if(b<=a)continue;g.beginPath();g.moveTo(a,q.y+q.h);for(let x=a;x<b;x+=8)g.lineTo(x,surfAt(q,x));g.lineTo(b,surfAt(q,b));g.lineTo(b,q.y+q.h);g.closePath();g.fillStyle=C.block;g.fill();
   g.beginPath();for(let x=a;x<b;x+=8)x===a?g.moveTo(x,surfAt(q,x)):g.lineTo(x,surfAt(q,x));g.lineTo(b,surfAt(q,b));g.strokeStyle=C.edge;g.lineWidth=3;g.stroke();continue;}
  g.fillStyle=q.kind==='plank'?C.plank:q.gbRoof||q.gbWall?C.dark:C.block;g.fillRect(q.x,q.y,q.w,q.h);if(!q.gbWall&&!q.gbRoof){g.fillStyle=C.edge;g.fillRect(q.x,q.y,q.w,3);}g.strokeStyle=C.dark;g.lineWidth=2;g.strokeRect(q.x+1,q.y+1,q.w-2,q.h-2);
  if(q.gbGate){const M=GB_MOCI[q.gbGate];g.fillStyle=M.color;g.globalAlpha=.85;g.fillRect(q.x,q.y,q.w,6);g.globalAlpha=1;}
  if(q.gbLip){g.fillStyle=GB_MOCI.nalet.color;g.fillRect(q.x,q.y,q.w,6);}}
 for(const z of S.pits){if(z.x1-z.x0<GB_GAP)continue;g.fillStyle=GB_MOCI.nalet.color;g.fillRect(z.x0-40,z.y-150,40,6);g.fillRect(z.x1,z.y-150,40,6);}
 for(const s of S.shrines){if(!vis(s.x-80,s.y-150,s.x+80,s.y))continue;const M=GB_MOCI[s.moc];g.fillStyle=C.dark;g.fillRect(s.x-34,s.y-36,68,36);g.fillStyle=C.edge;g.fillRect(s.x-34,s.y-36,68,3);
  if(!s.taken){const y=s.y-74+Math.sin(t*2.5)*6;G.halo(s.x,y,52,M.color,.8);g.fillStyle=M.color;g.beginPath();g.arc(s.x,y,16,0,Math.PI*2);g.fill();G.textLabel(M.name.toUpperCase(),s.x,s.y-112,{font:'bold 13px Georgia',color:M.color});}}
 for(const c of S.ckpts){if(!vis(c.x-40,c.y-140,c.x+40,c.y))continue;const on=S.ckpt===c.id;g.fillStyle=on?'#9fe6cf':'#8d9198';g.fillRect(c.x-10,c.y-120,20,120);g.fillRect(c.x-22,c.y-12,44,12);if(on)G.halo(c.x,c.y-126,40,'#a6ffe1',.7+.2*Math.sin(t*3));G.textLabel('ČEKPOINT',c.x,c.y-136,{font:'bold 12px Georgia',color:on?'#a6ffe1':'#c9ccd2'});}
 for(const D of S.doors){const sw=D.sw,q=D.q;if(vis(sw.x-60,sw.y-60,sw.x+60,sw.y+10)){g.fillStyle=D.down||D.open>0?'#8fffe0':'#3f8f7e';g.fillRect(sw.x-sw.w/2,sw.y-(D.down?3:9),sw.w,D.down?3:9);G.textLabel(D.solved?'PREKIDAČ':D.floor?'PREKIDAČ · POKLOPAC SE OTVORI NA TREN':'PREKIDAČ · VRATA SE OTVORE NA TREN',sw.x,sw.y-40,{font:'bold 12px Georgia',color:'#8fffe0'});}
  if(D.open>0&&!D.solved){const k=D.open/GB_DOOR,cx=q.x+q.w/2,cyy=D.floor?q.y-60:q.y+q.h-300;g.strokeStyle='#8fffe0';g.lineWidth=4;g.beginPath();g.arc(cx,cyy,16,-Math.PI/2,-Math.PI/2+Math.PI*2*k);g.stroke();}}
 {const L=S.gate.lever;if(vis(L.x-40,L.y-80,L.x+40,L.y)){g.strokeStyle='#ffe39a';g.lineWidth=5;g.beginPath();g.moveTo(L.x,L.y);g.lineTo(L.x+(S.gate.open?24:-24),L.y-54);g.stroke();g.fillStyle='#8f7a4a';g.fillRect(L.x-14,L.y-10,28,10);if(!S.gate.open)G.textLabel('POLUGA',L.x,L.y-80,{font:'bold 12px Georgia',color:'#ffe39a'});}}
 for(const h of S.hearts){if(h.taken||!vis(h.x-40,h.y-120,h.x+40,h.y))continue;const y=h.y-60+Math.sin(t*2.6)*5;G.halo(h.x,y,46,'#ff8a8a',.7);g.fillStyle='#ff7a7a';g.beginPath();g.moveTo(h.x,y+14);g.bezierCurveTo(h.x-26,y-4,h.x-12,y-24,h.x,y-10);g.bezierCurveTo(h.x+12,y-24,h.x+26,y-4,h.x,y+14);g.fill();G.textLabel('DEO SRCA',h.x,y-30,{font:'bold 12px Georgia',color:'#ffb0a0'});}
 // the names of the rooms, high on their back walls
 for(const R of GB_ROOMS){if(!vis(R.x0,R.y0,R.x1,R.y1)||R.secret&&!S.found.has(R.id))continue;const mx=clampN(cam+VW/2,R.x0+200,R.x1-200);G.textLabel(R.name.toUpperCase(),mx,Math.max(R.y0+40,cy+30),{font:'bold 16px Georgia',color:'#8b8f98'});}
 g.restore();}
// in front of everything: the fake wall, and the rock that covers a hidden room until Marko steps into it
export function gbDrawFront(G){const g=G.ctx,S=G.world.gb,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H;if(!g||!S)return;g.save();
 for(const f of S.fakes){f.a=Math.max(0,(f.a??1)-(f.found?.04:0));if(f.a<=0||f.x>cam+VW||f.x+f.w<cam)continue;g.globalAlpha=f.a;g.fillStyle=C.dark;g.fillRect(f.x,f.y,f.w,f.h);g.strokeStyle=C.dark;g.lineWidth=2;g.strokeRect(f.x+1,f.y+1,f.w-2,f.h-2);}
 for(const R of GB_ROOMS){if(!R.secret)continue;const a=S.cover[R.id];if(a<=0||R.x1<cam||R.x0>cam+VW||R.y1<cy||R.y0>cy+VH)continue;g.globalAlpha=a;g.fillStyle=C.rock;g.fillRect(R.x0+20,R.y0,R.x1-R.x0-40,R.floor-R.y0);}
 g.restore();}

// ---------- the map: the rooms Marko has been in, what is in them and where he is (a small canvas over the game) ----------
let mapEl=null,mapT=0;
export function gbMapRemove(){mapEl?.remove?.();mapEl=null;}
export function gbMap(G){if(!G.hasDom)return;const S=G.world.gb;if(!S)return;const now=G.time;if(mapEl&&now-mapT<.1)return;mapT=now;
 if(!mapEl||!mapEl.isConnected){mapEl=document.createElement('canvas');mapEl.id='gb-map';mapEl.width=360;mapEl.height=124;mapEl.style.cssText='position:fixed;right:14px;top:104px;z-index:30;width:360px;height:124px;border-radius:6px;background:#0d0f12d9;box-shadow:inset 0 0 0 1px #9aa0a866;pointer-events:none';document.body.appendChild(mapEl);}
 const g=mapEl.getContext('2d'),k=330/(GB_X1-GB_X0),ox=15,oy=26,X0=x=>ox+(x-GB_X0)*k,Y0=y=>oy+(y-GB_Y0)*k;g.clearRect(0,0,360,124);g.font='bold 11px Georgia';g.fillStyle='#c9ccd2';
 g.fillText('MAPA · '+(GB_ROOMS[S.room]?.name||''),ox,15);g.fillStyle='#ffe39a';g.fillText(`Tajne ${S.found.size}/${S.secrets}`,290,15);
 GB_ROOMS.forEach((R,i)=>{if(!S.seen.has(i))return;const x=X0(R.x0),y=Y0(R.y0),w=(R.x1-R.x0)*k,h=(R.y1-R.y0)*k;g.fillStyle=i===S.room?'#5f6570':R.secret?'#4a3f55':'#3d4148';g.fillRect(x+.5,y+.5,w-1,h-1);g.strokeStyle=i===S.room?'#e6e9ee':R.secret?'#ffe39a':'#6b7079';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);});
 const seenAt=(x,y)=>S.seen.has(gbRoomAt(x,y));
 const dot=(x,y,c,r=2.6)=>{g.fillStyle=c;g.beginPath();g.arc(X0(x),Y0(y-60),r,0,Math.PI*2);g.fill();};
 for(const s of S.shrines)if(!s.taken&&seenAt(s.x,s.y))dot(s.x,s.y,GB_MOCI[s.moc].color,3.4);
 for(const h of S.hearts)if(!h.taken&&seenAt(h.x,h.y))dot(h.x,h.y,'#ff8a8a',3);
 for(const c of S.ckpts)if(seenAt(c.x,c.y)){g.fillStyle=S.ckpt===c.id?'#a6ffe1':'#8b8f98';g.fillRect(X0(c.x)-1.5,Y0(c.y)-9,3,7);}
 {const q=S.gate.q;if(seenAt(q.x-60,q.y+q.h)||seenAt(q.x+80,q.y+q.h)){g.fillStyle=S.gate.open?'#5f6570':'#ffe39a';g.fillRect(X0(q.x)-1,Y0(q.y)+2,3,q.h*k-2);}}
 for(const D of S.doors){const q=D.q;if(!seenAt(D.sw.x,D.sw.y))continue;g.fillStyle=D.solved?'#5f6570':GB_MOCI.trag.color;D.floor?g.fillRect(X0(q.x),Y0(q.y)-1,q.w*k+1,3):g.fillRect(X0(q.x)-1,Y0(q.y)+2,3,q.h*k-2);}
 for(const z of S.pits)if(z.x1-z.x0>=GB_GAP&&(seenAt(z.x0-60,z.y-150)||seenAt(z.x1+60,z.y-150))){g.fillStyle=S.moci.nalet?'#5f6570':GB_MOCI.nalet.color;g.fillRect(X0(z.x0),Y0(z.y-150)-1,(z.x1-z.x0)*k,3);}
 {const c=G.world.enemies.find(e=>e.champion);if(c?.alive&&seenAt(c.x,c.y)){g.strokeStyle='#ff6a5a';g.lineWidth=2;const cx=X0(c.x),cy=Y0(c.y-60);g.beginPath();g.moveTo(cx-4,cy-4);g.lineTo(cx+4,cy+4);g.moveTo(cx+4,cy-4);g.lineTo(cx-4,cy+4);g.stroke();}}
 dot(G.p.x,G.p.y,'#ffffff',3.2);
 g.font='11px Georgia';let mx=ox;for(const id of Object.keys(GB_MOCI)){const M=GB_MOCI[id],have=S.moci[id];g.fillStyle=have?M.color:'#6b7079';const txt=(have?'● ':'○ ')+M.name;g.fillText(txt,mx,116);mx+=g.measureText(txt).width+14;}}
