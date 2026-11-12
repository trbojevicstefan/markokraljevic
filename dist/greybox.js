// ================= Greybox levels (…/index.html?greybox=1|2|3): long levels in the style of The Lost Crown =================
// The engine: rooms on a grid of 1200×720 cells, built from the data in greybox-nivoi.js (rooms, doors, holes in floors,
// hills, and each level's own blocks, foes, traps, gates and secrets), then played with the game's own Marko, foes and
// physics. Only the structure is taken in idea from The Lost Crown: a connected map on many floors, powers as keys, gates
// that open from their far side, hidden rooms covered like rock until Marko steps in, a map drawn as he explores.
// No room, layout or asset is copied from any game. greybox-svet.js dresses the rooms; until its pictures load they are grey.
// game.js owns Marko, the foes and the drawing helpers and hands them in as `G` (GBX in game.js); this file never writes the save.
import{strelnica,greda}from'./zamke.js';
import{GB_NIVOI}from'./greybox-nivoi.js';
import{artBack,artFront,artFore,artLook,artName}from'./greybox-svet.js';

export const GB_ZONE=60;
export const GB_WALL=345;      // one jump and a ledge grab reach 266 px, the wing and a ledge grab 383 (greybox-test measures both)
export const GB_GAP=500;       // without the dash the farthest leap is 469 px; a plain run-up, the dash and the wing reach 553
export const GB_DOOR=1;        // seconds a door or trapdoor stays open after its switch; every switch is far enough away
export const GB_CW=1200,GB_CH=720,GB_FL=130;
const CW=GB_CW,CH=GB_CH,FL=GB_FL;
export const GB_MOCI={
 krilo:{name:'Sokolovo krilo',key:'u skoku SPACE',color:'#f4ead2',text:'Još jedan skok u vazduhu. Ispusti koji su bili previsoki sada se dohvataju.'},
 nalet:{name:'Juriš u vazduhu',key:'u skoku SHIFT',color:'#ffcf6a',text:'Kratak nalet napred, bez pada. Skoči, jurni, pa krilo: tako se prelaze ponori.'},
 trag:{name:'Vilin trag',key:'V',color:'#8fffe0',text:'Ostavi trag kraj vrata (V), stani na prekidač, pa se tragom vrati (V) dok su vrata otvorena.'}
};
// ---------- the registry of levels: the three here (greybox-nivoi.js) and whatever a data file adds ----------
// dist/greybox-nivoi-pohodi.js (the Lost Crown versions of the other pohodi, ?greybox=4 and on) exports GB_POHODI in the same
// format; in the browser it is loaded once, and if it is not there the three levels are all there is. gbRegister takes any
// {number: level} object, keeps the numbers already taken, and tells the menu.
export const GB_LEVELS=GB_NIVOI;
const gbListeners=[];
export function gbRegister(levels){for(const [n,L] of Object.entries(levels||{}))if(L?.sobe&&!GB_NIVOI[n])GB_NIVOI[n]=L;for(const f of gbListeners)try{f();}catch{}return GB_NIVOI;}
export const gbOnRegister=f=>{gbListeners.push(f);};
export const gbReady=typeof window==='undefined'?Promise.resolve(GB_NIVOI):import('./greybox-nivoi-pohodi.js').then(m=>gbRegister(m.GB_POHODI||m.default),()=>GB_NIVOI);
const clampN=(n,a,b)=>Math.max(a,Math.min(b,n));

// ---------- a level as rooms, nodes and links (shared by the game and the reachability test) ----------
export function gbLevel(n){const k=GB_NIVOI[n]?+n:1,L=GB_NIVOI[k];if(L.ready)return L;L.n=k;
 L.rooms=L.sobe.map(([id,name,gx,gy,w,h,o={}])=>({id,name,gx,gy,w,h,x0:gx*CW,y0:gy*CH,x1:(gx+w)*CW,y1:(gy+h)*CH,floor:(gy+h)*CH-FL,...o}));
 const xs=L.rooms.flatMap(R=>[R.x0,R.x1]),ys=L.rooms.flatMap(R=>[R.y0,R.y1]);L.X0=Math.min(...xs);L.X1=Math.max(...xs);L.Y0=Math.min(...ys);L.Y1=Math.max(...ys);
 L.links=[];for(const [a,b,row,o={}] of L.vrata||[])L.links.push([o.na||gbNode(L,a,row),o.nb||gbNode(L,b,row),o.need||null,!!o.oneway,{door:[a,b,row,o]}]);
 for(const [r,dx0,dx1,o={}] of L.rupe||[])if(o.to){const R=gbRoom(L,r);L.links.push([o.from||gbNode(L,r,R.gy+R.h-1),o.to,o.need||null,true,{drop:[r,dx0,dx1]}]);}
 L.links.push(...(L.veze||[]));L.ready=true;return L;}
export const gbRoom=(L,id)=>L.rooms.find(R=>R.id===id);
// a tall room has one node per floor (`kula@-1`); a one-floor room is its own node
export function gbNode(L,id,row){const R=gbRoom(L,id);return R.h>1?`${id}@${row}`:id;}
export const gbNodeRoom=node=>node.split('@')[0];
export function gbNodeAt(L,x,y){const i=gbRoomAt(L,x,y);if(i<0)return null;const R=L.rooms[i];for(const [name,d] of Object.entries(L.delovi||{}))if(d.room===R.id&&x>=(d.x0??-1e9)&&x<(d.x1??1e9))return name;return R.h>1?`${R.id}@${Math.floor((y-40)/CH)}`:R.id;}
export function gbRoomAt(L,x,y){return L.rooms.findIndex(R=>x>=R.x0&&x<R.x1&&y-40>=R.y0&&y-40<R.y1);}
// which nodes can be reached holding these powers; 'posle:<node>' is a gate that opens once that node has been reached
export function gbReach(L,moci,start=L.start){const seen=new Set([start]);let grown=true;
 while(grown){grown=false;for(const [a,b,need,one] of L.links){const ok=!need||moci.has(need)||(need.startsWith('posle:')&&seen.has(need.slice(6)));if(!ok)continue;
  for(const [u,v] of one?[[a,b]]:[[a,b],[b,a]])if(seen.has(u)&&!seen.has(v)){seen.add(v);grown=true;}}}
 return[...seen];}

// ---------- building a level into the game's world ----------
export function makeGreybox(n=1){const L=gbLevel(n),platforms=[],enemies=[],breakables=[],traps=[],pits=[],named={},opens=[],holes=[];let id=3000;
 const S={L,t:0,room:-1,seen:new Set(),moci:{krilo:false,nalet:false,trag:false},pits,holes,shrines:[],ckpts:[],doors:[],gates:[],fakes:[],hearts:[],cuda:[],props:[],ckpt:0,
  found:new Set(),cover:{},done:false,told:{},named};
 for(const m of L.pocetne||[])S.moci[m]=true;
 const R=rid=>gbRoom(L,rid),X=(rid,dx)=>R(rid).x0+dx,Y=rid=>R(rid).floor;
 const block=(x,y,w,h,o={})=>{const q={x,y,w,h,kind:'stone',solid:true,noCling:!o.cling,...o};delete q.cling;platforms.push(q);if(o.name)named[o.name]=q;return q;};
 const foe=(type,x,y,o={})=>{const hp={shield:125,archer:65,akindzija:80,oklopnik:240,palikuca:70,pas:60,kopljanik:100,tufekdzija:90}[type]??90;enemies.push({id:id++,x,y,vx:0,vy:0,w:36,h:type==='pas'?50:75,hp,maxHp:hp,type,zone:GB_ZONE,face:-1,mode:'idle',timer:.5+(enemies.length%4)*.23,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:true,...o});return enemies.at(-1);};
 // kuka (lc-nivoi-svi): srebrne kuke za lanac, zidovi sa šarama za trk po zidu i amajlije na tlu idu u svet nivoa (game.js ih čita)
 const svet={kuke:[],zidovi:[],nalazi:[]};
 const B={L,R,X,Y,named,kuka:(x,y)=>svet.kuke.push({x,y}),zid:(x,y,w,h)=>svet.zidovi.push({x,y,w,h}),nalaz:o=>svet.nalazi.push(o),zamka:z=>traps.push(Object.assign(z,{t:z.t||0})),
  block,ledge:(x,y,w=200,o={})=>block(x,y,w,40,o),
  plank:(x,y,w,o={})=>block(x,y,w,18,{kind:'plank',solid:false,...o}),
  crumble:(x,y,w)=>block(x,y,w,18,{kind:'plank',solid:false,crumble:true}),
  // two facing walls Marko climbs wall to wall (the only walls he can cling to in a greybox level)
  chimney(name,x,top,bottom,gap=150){block(x,top,40,bottom-top,{cling:true,gbChimney:true});block(x+40+gap,top,40,bottom-top,{cling:true,gbChimney:true});named[name]={x0:x+40,x1:x+40+gap,top,bottom};},
  spikes:(x,y,w)=>{traps.push({kind:'spikes',x,y,w,t:0});},
  strelnica:o=>{traps.push(Object.assign(strelnica(o),{t:0}));},
  greda:(q,o)=>{traps.push(Object.assign(greda(q,o),{t:0}));},
  foe,open:(x,y0,y1)=>opens.push([x,y0,y1]),hole:(rid,dx0,dx1,lip)=>holes.push([rid,dx0,dx1,lip]),
  pit:(name,x0,x1,y)=>{const z={name,x0,x1,y};pits.push(z);named[name]=z;return z;},
  gap:(name,x0,x1,y)=>{named[name]={name,x0,x1,y};},
  shrine:(moc,x,y)=>S.shrines.push({moc,x,y,taken:false}),
  ckpt:(x,y)=>S.ckpts.push({id:S.ckpts.length+1,x,y}),
  heart:(x,y)=>S.hearts.push({x,y,taken:false}),
  cudo:(x,y,name)=>S.cuda.push({x,y,name,taken:false}),
  prop:(id,x,y,h,o={})=>S.props.push({id,x,y,h,...o}),
  breakable(name,x,y){const b={id:breakables.length+1,x,y,kind:'zid',hp:4,hp0:4,w:74,h:205,solid:true,flash:0,loot:{coins:6},name};b.plat={x:x-37,y:y-205,w:74,h:205,kind:'crate',solid:true};platforms.push(b.plat);breakables.push(b);named[name]=b;},
  fake(name,x,y,w,h){const f={name,x,y,w,h,found:false};S.fakes.push(f);named[name]=f;},
  door(name,x,top,bottom,sw){const q=block(x,top,44,bottom-top,{gbDoor:true});const D={name,q,sw:{w:90,...sw},open:0,solved:false,down:false};S.doors.push(D);named[name]=D;},
  trapdoor(name,x,y,w,sw){const q=block(x,y,w,FL,{gbTrap:true});const D={name,q,sw:{w:90,...sw},open:0,solved:false,down:false,floor:true};S.doors.push(D);named[name]=D;},
  gate(name,x,top,bottom,lever){const q=block(x,top,40,bottom-top,{gbOneWay:true});const g={name,q,lever,open:false};S.gates.push(g);named[name]=g;},
  boss(type,x,y,o,arena,planks=[]){for(const [dx,dy,w] of planks)platforms.push({x:Math.round(arena.x0+dx-w/2),y:arena.y-dy,w,h:18,kind:'plank',arena:true});
   return foe(type,x,y,{id:3100,champion:true,scale:1.35,w:50,h:100,arena,...o});}};
 L.build(B);
 // the doors between rooms: an opening in the shared wall at the floor of that row, and a landing where a tall room has no floor there
 for(const [a,b,row,o={}] of L.vrata||[]){const A=R(a),Bb=R(b),y=(row+1)*CH-FL,top=y-(o.h||260);opens.push([A.x1,top,y]);
  if(A.floor!==y)block(A.x1-250,y,250,FL,{gbLanding:true});if(Bb.floor!==y)block(Bb.x0,y,250,FL,{gbLanding:true});}
 for(const [r,dx0,dx1,o={}] of L.rupe||[])holes.push([r,dx0,dx1,o.lip]);
 // walls: each room's two sides from its top to its floor, cut where an opening is; a shared side is built once
 const done=new Set();for(const Rm of L.rooms)for(const x of[Rm.x0,Rm.x1]){const key=`${x}|${Rm.y0}|${Rm.floor}`;if(done.has(key))continue;done.add(key);
  const cuts=opens.filter(([ox,a,b])=>ox===x&&b>Rm.y0&&a<Rm.floor).sort((u,v)=>u[1]-v[1]);let y=Rm.y0;
  for(const [,a,b] of cuts){if(a>y)block(x-20,y,40,a-y,{gbWall:true});y=Math.max(y,b);}if(Rm.floor>y)block(x-20,y,40,Rm.floor-y,{gbWall:true});}
 // floors: a slab from the floor line to the bottom of the room; hills and hollows make a slope (`surf`) that bodies walk along;
 // the last 60 px before the far side of an abyss is a 'step', whose edge cannot be caught from below
 for(const Rm of L.rooms){const hs=holes.filter(h=>h[0]===Rm.id).map(([,a,b,lip])=>[Rm.x0+a,Rm.x0+b,lip]).sort((u,v)=>u[0]-v[0]);let x=Rm.x0;const segs=[];
  hs.forEach(([a,b,lip])=>{segs.push([x,a,lip==='L'?'end':null]);x=b;});segs.push([x,Rm.x1,hs.at(-1)?.[2]==='R'?'start':null]);
  const bumps=(L.brda?.[Rm.id]||[]).map(([a,b,h])=>[Rm.x0+a,Rm.x0+b,h]),ground=x=>{let y=Rm.floor;for(const [a,b,h] of bumps)if(x>a&&x<b)y-=h*(1-Math.cos(2*Math.PI*(x-a)/(b-a)))/2;return y;};
  for(let [a,b,lip] of segs){if(b-a<1)continue;
   if(lip==='end'){const s=Math.max(a,b-60);block(s,Rm.floor,b-s,FL,{kind:'step',ground:true,gbLip:true});b=s;}
   if(lip==='start'){const s=Math.min(b,a+60);block(a,Rm.floor,s-a,FL,{kind:'step',ground:true,gbLip:true});a=s;}
   if(b-a<1)continue;
   // a slope only where a hill or a hollow is; the rest of the floor is flat, so its edges by a hole can be caught
   let x0=a;for(const [u,v] of bumps.filter(([u,v])=>u<b&&v>a).sort((p,q)=>p[0]-q[0])){const s0=Math.max(a,u),s1=Math.min(b,v);if(s0>x0)block(x0,Rm.floor,s0-x0,FL,{ground:true});
    const Sx=[],w=s1-s0,n=Math.ceil(w/8);for(let k=0;k<=n;k++)Sx.push(Math.round(ground(s0+Math.min(k*8,w))*10)/10);const top=Math.min(...Sx);platforms.push({x:s0,y:top,w,h:Rm.y1-top,kind:'stone',ground:true,surf:Sx,sx:8,noCling:true});block(s0,Rm.y1-30,w,30);x0=Math.max(x0,s1);}
   if(b>x0)block(x0,Rm.floor,b-x0,FL,{ground:true});}
  // a roof wherever no room stands above
  const above=L.rooms.filter(o=>o.y1===Rm.y0&&o.x1>Rm.x0&&o.x0<Rm.x1).sort((u,v)=>u.x0-v.x0);let rx=Rm.x0;
  for(const o of above){if(o.x0>rx)block(rx,Rm.y0-160,o.x0-rx,160,{gbRoof:true});rx=Math.max(rx,o.x1);}if(rx<Rm.x1)block(rx,Rm.y0-160,Rm.x1-rx,160,{gbRoof:true});}
 for(const Rm of L.rooms)if(Rm.secret)S.cover[Rm.id]=1;S.secrets=L.rooms.filter(Rm=>Rm.secret).length;
 const sp=R(gbNodeRoom(L.start)),spawn={x:sp.x0+(L.spawnDx||200),y:sp.floor};
 const level={id:'greybox',greybox:true,n:L.n,name:L.ime,width:L.X1,spawn,goal:{x:L.X1+5000,y:spawn.y},props:[],peace:false,design:{goal:L.cilj}};
 return{...svet,platforms,enemies,items:[],runes:[],barriers:[],goals:[],level,ladders:[],breakables,towers:[],plows:[],plowTeams:[],traps,cannons:[],guns:[],vaults:[],logori:[],busy:[],y0:L.Y0,pitY:L.Y1+500,gb:S,
  chapter:{name:`LOST CROWN · ${L.ime.toUpperCase()}`,start:L.X0,end:L.X1,goal:L.cilj,message:''}};
}

// ---------- once a step (game.js calls it from update while a greybox level is on) ----------
export function gbTick(G,dt){const W=G.world,S=W.gb,p=G.p;if(!S||G.mode!=='play')return;const L=S.L;S.t+=dt;
 // the arena's door is an open doorway here: once the megdan begins, the aga and whatever he calls stay inside it
 for(const c of W.enemies)if(c.champion&&c.alive&&c.engaged&&c.arena){const A=c.arena;for(const e of W.enemies)if(e.alive&&Math.abs(e.y-A.y)<300&&e.x>A.x0-260&&e.x<A.x1+260)e.x=Math.max(A.x0+25,Math.min(A.x1-25,e.x));}
 const r=gbRoomAt(L,p.x,p.y);if(r>=0&&r!==S.room){S.room=r;const R=L.rooms[r];G.look=artLook(L,R);
  if(!S.seen.has(r)){if(S.t>.5)G.toast((artName(L,R)||R.name).toUpperCase(),1.6);if(R.secret){S.found.add(R.id);G.sfx('magic',{gain:.6});G.toast(`Tajna soba! ${S.found.size}/${S.secrets}`,2.4);if(R.lore)G.speak(R.lore,8);}}S.seen.add(r);}
 for(const R of L.rooms)if(R.secret&&S.found.has(R.id))S.cover[R.id]=Math.max(0,S.cover[R.id]-dt*1.6);
 const near=(o,dx=46,dy=70)=>Math.abs(p.x-o.x)<dx&&Math.abs(p.y-o.y)<dy;
 for(const s of S.shrines)if(!s.taken&&near(s)){s.taken=true;S.moci[s.moc]=true;const M=GB_MOCI[s.moc];G.burst(s.x,s.y-70,M.color,40,240);G.sfx('magic_big',{gain:.9});G.label(M.name.toUpperCase(),s.x,s.y-160,M.color);G.speak(`${M.name} (${M.key}). ${M.text}`,9);}
 for(const h of S.hearts)if(!h.taken&&near(h,50)){h.taken=true;p.maxHp+=10;p.hp=p.maxHp;G.sfx('coins',{gain:1});G.burst(h.x,h.y-40,'#ff8a8a',30,200);G.label('DEO SRCA · +10 ZDRAVLJA',h.x,h.y-150,'#ffb0a0');}
 for(const c of S.cuda)if(!c.taken&&near(c,50)){c.taken=true;G.sfx('magic_big',{gain:.8});G.burst(c.x,c.y-50,'#ffe39a',40,220);G.label(`ČUDO · ${c.name.toUpperCase()}`,c.x,c.y-160,'#ffe39a');G.toast(`Čudo: ${c.name}`,2.6);}
 // a checkpoint fills the health each time Marko steps on it again, and Ravijojla brings him back to the last one
 for(const c of S.ckpts){if(!near(c,40,8)||!p.grounded){if(c.on&&Math.abs(p.x-c.x)>140)c.on=false;continue;}if(c.on)continue;c.on=true;S.ckpt=c.id;G.ckpt={x:c.x,y:c.y};p.hp=p.maxHp;G.sfx('ring',{gain:.5});G.label('ČEKPOINT',c.x,c.y-170,'#a6ffe1');}
 // a fall into an abyss (the band just under its hole, which no jump from below reaches): the game's own pit rule takes it from here
 for(const z of S.pits)if(p.x>z.x0&&p.x<z.x1&&p.y>z.y&&p.y<z.y+90){p.y=W.pitY+10;break;}
 // switches: each opens its door or trapdoor for GB_DOOR seconds; once Marko is through, it stays open
 for(const D of S.doors){const q=D.q,sw=D.sw,on=p.grounded&&Math.abs(p.x-sw.x)<sw.w/2&&Math.abs(p.y-sw.y)<4;
  if(on&&!D.down&&!D.solved){D.open=GB_DOOR;G.sfx('clang',{gain:.6,rate:1.4});G.label(D.floor?'POKLOPAC!':'VRATA!',q.x+q.w/2,q.y-(D.floor?40:-60),'#8fffe0');}D.down=on;
  if(D.solved)continue;const was=q.off;D.open=Math.max(0,D.open-dt);
  const inside=D.floor?(p.x+18>q.x&&p.x-18<q.x+q.w&&p.y>q.y-6&&p.y<q.y+q.h+120):(p.x+20>q.x&&p.x-20<q.x+q.w&&p.y>q.y&&p.y-112<q.y+q.h);q.off=D.open>0||(was&&inside);
  if(was&&!q.off){G.sfx('clang',{gain:.5,rate:.8});if(!D.told&&S.moci.trag&&Math.abs(p.x-q.x)>200){D.told=true;G.speak(`${D.floor?'Poklopac':'Vrata'} se zatvori pre nego što stigneš. Ostavi Vilin trag ${D.floor?'na poklopcu':'kraj vrata'} (V), stani na prekidač, pa se tragom vrati (V).`,9);}}
  if(D.floor?(p.y>q.y+q.h+30&&p.x>q.x-30&&p.x<q.x+q.w+30):(p.y>q.y&&p.y-112<q.y+q.h&&(D.sw.x<q.x?p.x>q.x+q.w+30:p.x<q.x-30))){D.solved=true;q.off=true;}}
 // shortcut gates: each lever stands on the far side only
 for(const g of S.gates){if(g.open)continue;if(Math.abs(p.x-g.lever.x)<45&&Math.abs(p.y-g.lever.y)<10){g.open=true;g.q.off=true;G.sfx('clang',{gain:.7,rate:.7});G.label('PREČICA',g.q.x,g.lever.y-200,'#ffe39a');G.toast('Kapija je otvorena: prečica.',2.6);}
  else if(!S.told[g.name]&&Math.abs(p.x-g.q.x)<260&&Math.sign(p.x-g.q.x)!==Math.sign(g.lever.x-g.q.x)&&Math.abs(p.y-g.lever.y)<10){S.told[g.name]=true;G.toast('Kapija je zatvorena. Otvara se s druge strane.',2.6);}}
 // a fake wall gives way as soon as Marko walks into it
 for(const f of S.fakes)if(!f.found&&p.x+17>f.x&&p.x-17<f.x+f.w&&p.y>f.y&&p.y-100<f.y+f.h){f.found=true;G.sfx('rock',{gain:.5,rate:1.3});}
 // hints, once each: a cracked wall, a ledge too high for one jump, an abyss too wide for the wing
 for(const b of W.breakables)if(!b.broken&&!S.told[b.name]&&Math.abs(p.x-b.x)<260&&Math.abs(p.y-b.y)<20){S.told[b.name]=true;G.toast('Zid je napukao. Laki udarac odskače, teški (K) ga ruši.',3);}
 for(const q of W.platforms)if(q.gbGate&&!S.moci[q.gbGate]&&p.grounded&&q.y<p.y-266&&q.y>p.y-500&&Math.abs(p.x-(q.x+q.w/2))<q.w/2+150&&!S.told[q.x+'|'+q.y]){S.told[q.x+'|'+q.y]=true;G.toast(`Previsoko za jedan skok. Treba ti ${GB_MOCI[q.gbGate].name}.`,2.6);}
 for(const z of S.pits)if(!S.moci.nalet&&z.x1-z.x0>=GB_GAP&&p.grounded&&!S.told['pit'+z.x0]&&Math.abs(p.y-(z.y-150))<10&&(Math.abs(p.x-z.x0)<120||Math.abs(p.x-z.x1)<120)){S.told['pit'+z.x0]=true;G.toast('Preširoko i za krilo. Treba ti Juriš u vazduhu.',2.6);}
 const c=W.enemies.find(e=>e.champion);if(c&&!c.alive&&!S.done){S.done=true;S.doneT=S.t;const m=Math.floor(S.t/60),s=Math.floor(S.t%60);G.showTitle(`${L.ime.toUpperCase()} · PREĐENO`,`${m}:${String(s).padStart(2,'0')}`,`Tajne sobe: ${S.found.size}/${S.secrets} · Čuda: ${S.cuda.filter(c=>c.taken).length}/${S.cuda.length}`);}
 gbMap(G);}

// ---------- camera: held inside the room Marko is in, sliding over when he walks into the next one ----------
export function gbCamera(G,dt){const S=G.world.gb,p=G.p,L=S.L,R=L.rooms[S.room>=0?S.room:Math.max(0,gbRoomAt(L,p.x,p.y))];
 S.focus??=p.y;if(p.grounded||p.ledgeT>0||p.wall||p.y>S.focus+40||p.y<S.focus-220)S.focus+=(p.y-S.focus)*Math.min(1,dt*(p.grounded?6:3));
 const wx=clampN(p.x-G.VIEW_W*.4,R.x0,Math.max(R.x0,R.x1-G.VIEW_W)),wy=clampN(S.focus-470,R.y0-50,Math.max(R.y0-50,R.y1-G.VIEW_H+40));
 G.camera+=(wx-G.camera)*Math.min(1,dt*6);G.camY+=(wy-G.camY)*Math.min(1,dt*5);return true;}

// ---------- drawing: grey blocks with colour only for what matters, under the dressing when its pictures are in ----------
const C={back:'#25272c',back2:'#2a2c32',secret:'#2c2836',grid:'rgba(255,255,255,.035)',block:'#7c8088',edge:'#a7abb3',dark:'#4b4e55',plank:'#8e929a',rock:'#3a3c42'};
export const gbSurfAt=(q,x)=>{const S=q.surf,k=clampN((x-q.x)/q.sx,0,S.length-1),i=Math.floor(k);return i>=S.length-1?S[S.length-1]:S[i]+(S[i+1]-S[i])*(k-i);};
export function gbDraw(G){const g=G.ctx,W=G.world,S=W.gb,L=S?.L,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H,t=G.time;if(!g||!S)return;
 const vis=(x0,y0,x1,y1)=>x1>cam-80&&x0<cam+VW+80&&y1>cy-80&&y0<cy+VH+80,shown=L.rooms.filter(R=>vis(R.x0,R.y0,R.x1,R.y1));
 // a room's art may rise 160 px over its top (trees, towers), but not into a room above it
 const over=R=>R.over??=L.rooms.some(Q=>Q!==R&&Q.y1===R.y0&&Q.x0<R.x1&&Q.x1>R.x0)?0:160;
 const inRoom=(R,fn)=>{const o=over(R);g.save();g.beginPath();g.rect(R.x0,R.y0-o,R.x1-R.x0,R.y1-R.y0+o);g.clip();fn();g.restore();};
 g.save();g.fillStyle=C.rock;g.fillRect(cam-60,cy-60,VW+120,VH+120);
 const dressed=new Set();for(const R of shown){inRoom(R,()=>{if(artBack(G,L,R))dressed.add(R.id);});}
 // through a hole in a floor the room below shows (its backdrop, up through the floor's thickness), not the sky of the room above
 for(const [rid,a,b] of S.holes||[]){const R=gbRoom(L,rid);if(!R||!shown.includes(R))continue;const x0=R.x0+a,x1=R.x0+b,mid=(x0+x1)/2,Q=L.rooms.filter(Q=>Q!==R&&Q.y0>=R.floor-1&&Q.x0<=mid&&Q.x1>mid).sort((u,v)=>u.y0-v.y0)[0];
  if(!Q||!vis(x0,R.floor,x1,Q.y0))continue;g.save();g.beginPath();g.rect(x0,R.floor-2,x1-x0,Q.y0-R.floor+4);g.clip();if(!artBack(G,L,Q)){g.fillStyle='#141518';g.fillRect(x0,R.floor-2,x1-x0,Q.y0-R.floor+4);}
  const sh=g.createLinearGradient(0,R.floor,0,Q.y0);sh.addColorStop(0,'rgba(10,12,14,.55)');sh.addColorStop(1,'rgba(10,12,14,.15)');g.fillStyle=sh;g.fillRect(x0,R.floor-2,x1-x0,Q.y0-R.floor+4);g.restore();}
 L.rooms.forEach((R,i)=>{if(!shown.includes(R)||dressed.has(R.id))return;g.fillStyle=R.secret?C.secret:i%2?C.back2:C.back;g.fillRect(R.x0,R.y0,R.x1-R.x0,R.floor-R.y0);
  g.strokeStyle=C.grid;g.lineWidth=1;g.beginPath();for(let x=Math.max(R.x0,Math.floor((cam-60)/100)*100);x<Math.min(R.x1,cam+VW+60);x+=100){g.moveTo(x,Math.max(R.y0,cy-60));g.lineTo(x,Math.min(R.floor,cy+VH+60));}for(let y=R.floor-100;y>R.y0;y-=100){if(y<cy-60||y>cy+VH+60)continue;g.moveTo(Math.max(R.x0,cam-60),y);g.lineTo(Math.min(R.x1,cam+VW+60),y);}g.stroke();});
 // an abyss is dark down through the floor, but stops at the ceiling of a room under it
 for(const z of S.pits)if(vis(z.x0,z.y-150,z.x1,z.y+400)){let b=z.y+374;for(const R of L.rooms)if(R.x0<z.x1&&R.x1>z.x0&&R.y0>=z.y-150&&R.y0<b)b=R.y0;g.fillStyle='#141518';g.fillRect(z.x0,z.y-146,z.x1-z.x0,b-z.y+146);}
 for(const q of W.platforms){if(!vis(q.x,q.y,q.x+q.w,q.y+q.h)||q.kind==='crate'||(q.off&&q.arena))continue;
  if(q.gbDoor||q.gbTrap||q.gbOneWay){const col=q.gbOneWay?'#8f7a4a':'#3f8f7e',line=q.gbOneWay?'#ffe39a':'#8fffe0';
   if(q.off){g.strokeStyle=line;g.globalAlpha=.5;g.setLineDash([8,8]);g.strokeRect(q.x,q.y,q.w,q.h);g.setLineDash([]);g.globalAlpha=1;}
   else{g.fillStyle=col;g.fillRect(q.x,q.y,q.w,q.h);g.fillStyle=line;if(q.gbTrap)for(let x=q.x+12;x<q.x+q.w;x+=30)g.fillRect(x,q.y+q.h/2-3,16,6);else for(let y=q.y+30;y<q.y+q.h;y+=70)g.fillRect(q.x+q.w/2-3,y,6,30);}continue;}
  if(q.crumble){if(q.off)continue;const sh=q.shakeT>0?(Math.random()-.5)*3:0;g.fillStyle='#9a8a6a';g.fillRect(q.x+sh,q.y,q.w,q.h);g.strokeStyle='#5d5040';g.lineWidth=1;for(let x=q.x+20;x<q.x+q.w;x+=40){g.beginPath();g.moveTo(x+sh,q.y);g.lineTo(x+sh+6,q.y+q.h);g.stroke();}continue;}
  if(q.surf){const a=Math.max(q.x,Math.floor((cam-40)/8)*8),b=Math.min(q.x+q.w,cam+VW+48);if(b<=a)continue;g.beginPath();g.moveTo(a,q.y+q.h);for(let x=a;x<b;x+=8)g.lineTo(x,gbSurfAt(q,x));g.lineTo(b,gbSurfAt(q,b));g.lineTo(b,q.y+q.h);g.closePath();g.fillStyle=C.block;g.fill();
   g.beginPath();for(let x=a;x<b;x+=8)x===a?g.moveTo(x,gbSurfAt(q,x)):g.lineTo(x,gbSurfAt(q,x));g.lineTo(b,gbSurfAt(q,b));g.strokeStyle=C.edge;g.lineWidth=3;g.stroke();continue;}
  g.fillStyle=q.kind==='plank'?C.plank:q.gbRoof||q.gbWall?C.dark:q.gbChimney?'#6d6a62':C.block;g.fillRect(q.x,q.y,q.w,q.h);if(!q.gbWall&&!q.gbRoof){g.fillStyle=C.edge;g.fillRect(q.x,q.y,q.w,3);}g.strokeStyle=C.dark;g.lineWidth=2;g.strokeRect(q.x+1,q.y+1,q.w-2,q.h-2);
  if(q.gbChimney){g.strokeStyle='rgba(255,236,190,.25)';g.lineWidth=2;for(let y=q.y+20;y<q.y+q.h;y+=40){g.beginPath();g.moveTo(q.x+4,y);g.lineTo(q.x+q.w-4,y+10);g.stroke();}}
  if(q.gbGate){const M=GB_MOCI[q.gbGate];g.fillStyle=M.color;g.globalAlpha=.85;g.fillRect(q.x,q.y,q.w,6);g.globalAlpha=1;}
  if(q.gbLip){g.fillStyle=GB_MOCI.nalet.color;g.fillRect(q.x,q.y,q.w,6);}}
 for(const t of W.traps)if(t.kind==='spikes'&&vis(t.x,t.y-40,t.x+t.w,t.y)){g.fillStyle='#b8b1a2';for(let x=t.x;x<t.x+t.w;x+=16){g.beginPath();g.moveTo(x,t.y);g.lineTo(x+8,t.y-30);g.lineTo(x+16,t.y);g.closePath();g.fill();}g.fillStyle='#5a3a2a';g.fillRect(t.x,t.y-4,t.w,4);}
 for(const z of S.pits){if(z.x1-z.x0<GB_GAP)continue;g.fillStyle=GB_MOCI.nalet.color;g.fillRect(z.x0-40,z.y-150,40,6);g.fillRect(z.x1,z.y-150,40,6);}
 for(const R of shown)if(dressed.has(R.id))inRoom(R,()=>artFront(G,L,R,{S,platforms:W.platforms,traps:W.traps}));
 // the gameplay marks stay readable over the materials: the wing's ledges, the far lip of an abyss
 for(const q of W.platforms){if(q.off||!vis(q.x,q.y,q.x+q.w,q.y+q.h))continue;if(q.gbGate){g.fillStyle=GB_MOCI[q.gbGate].color;g.globalAlpha=.85;g.fillRect(q.x,q.y-2,q.w,5);g.globalAlpha=1;}if(q.gbLip){g.fillStyle=GB_MOCI.nalet.color;g.fillRect(q.x,q.y-2,q.w,5);}}
 for(const s of S.shrines){if(!vis(s.x-80,s.y-150,s.x+80,s.y))continue;const M=GB_MOCI[s.moc];g.fillStyle=C.dark;g.fillRect(s.x-34,s.y-36,68,36);g.fillStyle=C.edge;g.fillRect(s.x-34,s.y-36,68,3);
  if(!s.taken){const y=s.y-74+Math.sin(t*2.5)*6;G.halo(s.x,y,52,M.color,.8);g.fillStyle=M.color;g.beginPath();g.arc(s.x,y,16,0,Math.PI*2);g.fill();G.textLabel(M.name.toUpperCase(),s.x,s.y-112,{font:'bold 13px Georgia',color:M.color});}}
 for(const c of S.ckpts){if(!vis(c.x-40,c.y-140,c.x+40,c.y))continue;const on=S.ckpt===c.id;g.fillStyle=on?'#9fe6cf':'#8d9198';g.fillRect(c.x-10,c.y-120,20,120);g.fillRect(c.x-22,c.y-12,44,12);if(on)G.halo(c.x,c.y-126,40,'#a6ffe1',.7+.2*Math.sin(t*3));G.textLabel('ČEKPOINT',c.x,c.y-136,{font:'bold 12px Georgia',color:on?'#a6ffe1':'#c9ccd2'});}
 for(const D of S.doors){const sw=D.sw,q=D.q;if(vis(sw.x-60,sw.y-60,sw.x+60,sw.y+10)){g.fillStyle=D.down||D.open>0?'#8fffe0':'#3f8f7e';g.fillRect(sw.x-sw.w/2,sw.y-(D.down?3:9),sw.w,D.down?3:9);G.textLabel(D.solved?'PREKIDAČ':D.floor?'PREKIDAČ · POKLOPAC SE OTVORI NA TREN':'PREKIDAČ · VRATA SE OTVORE NA TREN',sw.x,sw.y-40,{font:'bold 12px Georgia',color:'#8fffe0'});}
  if(D.open>0&&!D.solved){const k=D.open/GB_DOOR,cx=q.x+q.w/2,cyy=D.floor?q.y-60:q.y+q.h-260;g.strokeStyle='#8fffe0';g.lineWidth=4;g.beginPath();g.arc(cx,cyy,16,-Math.PI/2,-Math.PI/2+Math.PI*2*k);g.stroke();}}
 for(const gt of S.gates){const Lv=gt.lever;if(!vis(Lv.x-40,Lv.y-80,Lv.x+40,Lv.y))continue;g.strokeStyle='#ffe39a';g.lineWidth=5;g.beginPath();g.moveTo(Lv.x,Lv.y);g.lineTo(Lv.x+(gt.open?24:-24),Lv.y-54);g.stroke();g.fillStyle='#8f7a4a';g.fillRect(Lv.x-14,Lv.y-10,28,10);if(!gt.open)G.textLabel('POLUGA',Lv.x,Lv.y-80,{font:'bold 12px Georgia',color:'#ffe39a'});}
 for(const h of S.hearts){if(h.taken||!vis(h.x-40,h.y-120,h.x+40,h.y))continue;const y=h.y-60+Math.sin(t*2.6)*5;G.halo(h.x,y,46,'#ff8a8a',.7);g.fillStyle='#ff7a7a';g.beginPath();g.moveTo(h.x,y+14);g.bezierCurveTo(h.x-26,y-4,h.x-12,y-24,h.x,y-10);g.bezierCurveTo(h.x+12,y-24,h.x+26,y-4,h.x,y+14);g.fill();G.textLabel('DEO SRCA',h.x,y-30,{font:'bold 12px Georgia',color:'#ffb0a0'});}
 for(const c of S.cuda){if(c.taken||!vis(c.x-40,c.y-140,c.x+40,c.y))continue;const y=c.y-70+Math.sin(t*2.2)*5;G.halo(c.x,y,60,'#ffe39a',.8);g.fillStyle='#ffe39a';g.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?9:20;g.lineTo(c.x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fill();G.textLabel(`ČUDO · ${c.name.toUpperCase()}`,c.x,y-34,{font:'bold 12px Georgia',color:'#ffe39a'});}
 for(const R of shown){if(R.secret&&!S.found.has(R.id))continue;// a room whose top is above the view keeps its name at the top only while Marko is in it (no names stacked on each other)
  const ny=R.y0+40>=cy+30?R.y0+40:L.rooms[S.room]===R?cy+30:null;if(ny==null)continue;const mx=clampN(cam+VW/2,R.x0+200,R.x1-200);G.textLabel((artName(L,R)||R.name).toUpperCase(),mx,ny,{font:'bold 16px Georgia',color:dressed.has(R.id)?'#f1e3bd':'#8b8f98'});}
 g.restore();}
// in front of everything: the fake walls, and the rock that covers a hidden room until Marko steps into it
export function gbDrawFront(G){const g=G.ctx,S=G.world.gb,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H;if(!g||!S)return;g.save();
 for(const R of S.L.rooms)if(R.x1>cam-200&&R.x0<cam+VW+200&&R.y1>cy&&R.y0<cy+VH)artFore(G,S.L,R,G.world.platforms);
 for(const f of S.fakes){f.a=Math.max(0,(f.a??1)-(f.found?.04:0));if(f.a<=0||f.x>cam+VW||f.x+f.w<cam)continue;g.globalAlpha=f.a;g.fillStyle=C.dark;g.fillRect(f.x,f.y,f.w,f.h);g.strokeStyle=C.dark;g.lineWidth=2;g.strokeRect(f.x+1,f.y+1,f.w-2,f.h-2);}
 for(const R of S.L.rooms){if(!R.secret)continue;const a=S.cover[R.id];if(a<=0||R.x1<cam||R.x0>cam+VW||R.y1<cy||R.y0>cy+VH)continue;g.globalAlpha=a;g.fillStyle=C.rock;g.fillRect(R.x0+20,R.y0,R.x1-R.x0-40,R.floor-R.y0);}
 g.restore();}

// ---------- the map: the rooms Marko has been in, what is in them and where he is (a small canvas over the game) ----------
let mapEl=null,mapT=0;
export function gbMapRemove(){mapEl?.remove?.();mapEl=null;}
export function gbMap(G){if(!G.hasDom)return;const S=G.world.gb;if(!S)return;const L=S.L,now=G.time;if(mapEl&&now-mapT<.1)return;mapT=now;
 if(!mapEl||!mapEl.isConnected){mapEl=document.createElement('canvas');mapEl.id='gb-map';mapEl.width=360;mapEl.height=150;mapEl.style.cssText='position:fixed;right:14px;top:104px;z-index:30;width:360px;height:150px;border-radius:6px;background:#0d0f12d9;box-shadow:inset 0 0 0 1px #9aa0a866;pointer-events:none';document.body.appendChild(mapEl);}
 const g=mapEl.getContext('2d'),k=Math.min(330/(L.X1-L.X0),100/(L.Y1-L.Y0)),ox=15+(330-(L.X1-L.X0)*k)/2,oy=24,X0=x=>ox+(x-L.X0)*k,Y0=y=>oy+(y-L.Y0)*k;g.clearRect(0,0,360,150);g.font='bold 11px Georgia';g.fillStyle='#c9ccd2';
 g.fillText('MAPA · '+(L.rooms[S.room]?.name||''),15,15);g.fillStyle='#ffe39a';g.fillText(`Tajne ${S.found.size}/${S.secrets}`,282,15);
 L.rooms.forEach((R,i)=>{if(!S.seen.has(i))return;const x=X0(R.x0),y=Y0(R.y0),w=(R.x1-R.x0)*k,h=(R.y1-R.y0)*k;g.fillStyle=i===S.room?'#5f6570':R.secret?'#4a3f55':'#3d4148';g.fillRect(x+.5,y+.5,w-1,h-1);g.strokeStyle=i===S.room?'#e6e9ee':R.secret?'#ffe39a':'#6b7079';g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);});
 const seenAt=(x,y)=>S.seen.has(gbRoomAt(L,x,y)),dot=(x,y,c,r=2.4)=>{g.fillStyle=c;g.beginPath();g.arc(X0(x),Y0(y-60),r,0,Math.PI*2);g.fill();};
 for(const s of S.shrines)if(!s.taken&&seenAt(s.x,s.y))dot(s.x,s.y,GB_MOCI[s.moc].color,3.2);
 for(const h of S.hearts)if(!h.taken&&seenAt(h.x,h.y))dot(h.x,h.y,'#ff8a8a',2.8);
 for(const c of S.cuda)if(!c.taken&&seenAt(c.x,c.y))dot(c.x,c.y,'#ffe39a',3);
 for(const c of S.ckpts)if(seenAt(c.x,c.y)){g.fillStyle=S.ckpt===c.id?'#a6ffe1':'#8b8f98';g.fillRect(X0(c.x)-1.5,Y0(c.y)-8,3,6);}
 for(const gt of S.gates){const q=gt.q;if(seenAt(q.x-60,q.y+q.h)||seenAt(q.x+80,q.y+q.h)){g.fillStyle=gt.open?'#5f6570':'#ffe39a';g.fillRect(X0(q.x)-1,Y0(q.y),2.5,Math.max(2,q.h*k));}}
 for(const D of S.doors){const q=D.q;if(!seenAt(D.sw.x,D.sw.y))continue;g.fillStyle=D.solved?'#5f6570':GB_MOCI.trag.color;D.floor?g.fillRect(X0(q.x),Y0(q.y)-1,Math.max(2,q.w*k),2.5):g.fillRect(X0(q.x)-1,Y0(q.y),2.5,Math.max(2,q.h*k));}
 for(const z of S.pits)if(z.x1-z.x0>=GB_GAP&&(seenAt(z.x0-60,z.y-150)||seenAt(z.x1+60,z.y-150))){g.fillStyle=S.moci.nalet?'#5f6570':GB_MOCI.nalet.color;g.fillRect(X0(z.x0),Y0(z.y-150)-1,(z.x1-z.x0)*k,2.5);}
 {const c=G.world.enemies.find(e=>e.champion);if(c?.alive&&seenAt(c.x,c.y)){g.strokeStyle='#ff6a5a';g.lineWidth=2;const cx=X0(c.x),cy=Y0(c.y-60);g.beginPath();g.moveTo(cx-4,cy-4);g.lineTo(cx+4,cy+4);g.moveTo(cx+4,cy-4);g.lineTo(cx-4,cy+4);g.stroke();}}
 dot(G.p.x,G.p.y,'#ffffff',3);
 g.font='11px Georgia';let mx=15;for(const id of Object.keys(GB_MOCI)){const M=GB_MOCI[id],have=S.moci[id];g.fillStyle=have?M.color:'#6b7079';const txt=(have?'● ':'○ ')+M.name;g.fillText(txt,mx,142);mx+=g.measureText(txt).width+14;}}

// ---------- the menu: "Lost Crown pohodi", the three levels without URL tricks ----------
export function gbMenu(start){if(typeof document==='undefined'||!document.querySelector)return;const links=document.querySelector('#menu .menu-links');if(!links||document.getElementById('gb-menu-open'))return;
 const sep=document.createElement('i');sep.textContent='✦';const b=document.createElement('button');b.id='gb-menu-open';b.textContent='Lost Crown pohodi';links.append(sep,b);
 // the list is made each time it opens, so levels registered later are in it too
 b.onclick=()=>{let m=document.getElementById('gb-menu');if(!m){m=document.createElement('section');m.id='gb-menu';m.className='modal';m.style.zIndex='60';document.body.appendChild(m);}
  m.innerHTML=`<div class="modal-card"><p class="eyebrow">PO UZORU NA THE LOST CROWN</p><h2>Lost Crown pohodi</h2><p>Dugi nivoi sa sobama, tajnama i moćima. Svaki daje Marku novu moć.</p><div style="max-height:58vh;overflow:auto">${Object.entries(GB_NIVOI).map(([n,L])=>`<button class="primary" data-gb="${n}" style="display:block;width:100%;margin:8px 0">${n}. ${L.ime}${GB_MOCI[L.daje]?' · '+GB_MOCI[L.daje].name:''}</button>`).join('')}</div><button class="text-button" data-gb="0">Nazad</button></div>`;
  m.querySelectorAll('[data-gb]').forEach(x=>x.onclick=()=>{m.hidden=true;const n=+x.dataset.gb;if(n)start(n);});m.hidden=false;};}
