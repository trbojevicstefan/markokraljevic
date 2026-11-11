// ================= Greybox (…/index.html?greybox): plain grey rooms for feeling out the moves =================
// A small connected map, eight rooms, for trying the movement taken in idea from The Lost Crown before anything is drawn for it.
// Only mechanics and structure: no art, no backgrounds, no room copied from any game. Marko and the foes are the game's own figures.
// Marko starts without the three new moves; each waits in its own room and opens its own kind of passage:
//  - Sokolovo krilo (double jump): a wall too high for one jump and a ledge grab;
//  - Juriš u vazduhu (air dash): an abyss too wide for a jump, even with the wing;
//  - Vilin trag (the fairy's trace): a door that a far switch opens only for a moment.
// The secret room behind the first wall waits for the wing; the champion in the last room ends the greybox.
// game.js owns Marko, the foes and the drawing helpers and hands them in as `G` (GBX in game.js); this file never writes the save.

export const GB_ZONE=60;
export const GB_WALL=345;      // one jump and a ledge grab reach 266 px, the wing and a ledge grab 383 (greybox-test measures both)
export const GB_GAP=500;       // without the dash the farthest leap is 469 px (a roll, a jump at the edge, the wing on the right frame);
                               // a plain run-up, the dash and the wing reach 553 (greybox-test searches both)
export const GB_DOOR=1;        // seconds the door stays open after the switch; the switch is 1300 px away
const F=590,BOT=840,ROOF=-60,ROOF_TOP=-420,CAM_TOP=-130,CAM_BOT=760;
export const GB_MOCI={
 krilo:{name:'Sokolovo krilo',key:'u skoku SPACE',color:'#f4ead2',text:'Još jedan skok u vazduhu. Visok zid na kraju sobe sada možeš da preskočiš.'},
 nalet:{name:'Juriš u vazduhu',key:'u skoku SHIFT',color:'#ffcf6a',text:'Kratak nalet napred, bez pada. Skoči, jurni, pa krilo: tako se prelazi ponor.'},
 trag:{name:'Vilin trag',key:'V',color:'#8fffe0',text:'Ostavi trag kraj vrata (V), stani na prekidač, pa se tragom vrati (V) dok su vrata otvorena.'}
};
// x ranges of the rooms, left to right; the map draws them as one row
export const GB_ROOMS=[
 {id:'riznica',name:'Skrivena riznica',x0:0,x1:1400,secret:true},
 {id:'predvorje',name:'Predvorje',x0:1400,x1:3000},
 {id:'strazarnica',name:'Stražarnica',x0:3000,x1:4800},
 {id:'sokolova',name:'Sokolova odaja',x0:4800,x1:6400},
 {id:'ponor',name:'Ponor',x0:6400,x1:8900},
 {id:'vilina',name:'Vilina odaja',x0:8900,x1:10700},
 {id:'predsoblje',name:'Predsoblje',x0:10700,x1:12400},
 {id:'arena',name:'Arena čuvara',x0:12400,x1:13600}
];
export const GB_WIDTH=13600;
// how the rooms connect and what each passage asks (the reachability test walks this graph, and checks every lock with real input)
export const GB_LINKS=[['riznica','predvorje','krilo'],['predvorje','strazarnica',null],['strazarnica','sokolova',null],['sokolova','ponor','krilo'],['ponor','vilina','nalet'],['vilina','predsoblje','trag'],['predsoblje','arena',null]];
export const GB_SHRINES={krilo:'sokolova',nalet:'ponor',trag:'vilina'};
// where things stand (x); the rooms above are built around them
const X={spawn:1800,ck1:1980,wall1:1400,ledge:2450,foe1:3750,perch:4200,foe1b:4350,krilo:5250,wall2:6050,foe2:6850,foe2b:7150,nalet:7600,pit:8000,
 sw:9050,trag:9500,door:10350,ck2:10900,foe3:11450,foe3b:11850,arena0:12440,arena1:13560,secret:560};
export function gbRoomAt(x){let i=GB_ROOMS.findIndex(R=>x<R.x1);return i<0?GB_ROOMS.length-1:i;}
const clampN=(n,a,b)=>Math.max(a,Math.min(b,n));
const block=(x,top,w,o={})=>({x,y:top,w,h:Math.max(240,BOT-top),kind:'stone',solid:true,...o});

export function makeGreybox(){
 const platforms=[],enemies=[];
 const floor=(x0,x1,o={})=>platforms.push(block(x0,F,x1-x0,{ground:true,...o}));
 const foe=(type,x,y=F,o={})=>{const hp={shield:125,archer:65,akindzija:80,oklopnik:240,palikuca:70}[type]??90;enemies.push({id:3000+enemies.length,x,y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type,zone:GB_ZONE,face:-1,mode:'idle',timer:.5+(enemies.length%4)*.23,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:true,...o});};
 // the floor runs the whole map but for the abyss; its far lip is a 'step', so Marko cannot catch it with his hands from below
 floor(0,X.pit);platforms.push(block(X.pit+GB_GAP,F,60,{kind:'step',gbLip:true}));floor(X.pit+GB_GAP+60,GB_WIDTH);
 // the ends of the world, and a roof over all the rooms (it only shows; no jump reaches it)
 platforms.push(block(-160,ROOF_TOP,160,{h:BOT-ROOF_TOP}),block(GB_WIDTH,ROOF_TOP,160,{h:BOT-ROOF_TOP}),{x:-160,y:ROOF_TOP,w:GB_WIDTH+320,h:ROOF-ROOF_TOP,kind:'stone',solid:true,gbRoof:true});
 // Predvorje: the first high wall (the secret room behind it) and a low block to learn the ledge grab on
 platforms.push(block(X.wall1,F-GB_WALL,120,{gbGate:'krilo'}),block(X.ledge,F-150,170));
 // Stražarnica: a janičar on the floor, an archer on a raised block, a štitonoša past him
 platforms.push(block(X.perch-110,F-120,260));foe('sword',X.foe1);foe('archer',X.perch+20,F-120);foe('shield',X.foe1b+260);
 // Sokolova odaja: the wing, then the second high wall
 platforms.push(block(X.wall2,F-GB_WALL,120,{gbGate:'krilo'}));
 // Ponor: two foes, the dash, the abyss
 foe('akindzija',X.foe2);foe('shield',X.foe2b);
 // Vilina odaja: the switch near the entrance, the trace, the door at the far end
 const door={x:X.door,y:ROOF,w:44,h:F-ROOF,kind:'stone',solid:true,gbDoor:true};platforms.push(door);
 // Predsoblje: a checkpoint, an oklopnik and a palikuća
 foe('oklopnik',X.foe3);foe('palikuca',X.foe3b);
 // Arena čuvara: Janičarski aga, on the beams he jumps between
 const a0=X.arena0,len=X.arena1-a0,plank=(k,dy,w=150)=>platforms.push({x:Math.round(a0+len*k-w/2),y:F-dy,w,h:18,kind:'plank',arena:true});
 plank(.16,150);plank(.4,265,140);plank(.64,150);plank(.86,240,140);
 foe('sword',Math.round(a0+len*.68),F,{id:3100,champion:true,scale:1.35,hp:700,maxHp:700,name:'Čuvar arene (Janičarski aga)',kit:'janicar',look:'janicarski-aga',w:50,h:100,arena:{x0:a0,x1:X.arena1,y:F}});
 const level={id:'greybox',greybox:true,name:'Greybox',width:GB_WIDTH,spawn:{x:X.spawn,y:F},goal:{x:GB_WIDTH+5000,y:F},props:[],peace:false,design:{goal:'Pronađi tri moći i pobedi čuvara'}};
 const gb={t:0,room:-1,seen:new Set(),moci:{krilo:false,nalet:false,trag:false},
  shrines:Object.keys(GB_SHRINES).map(moc=>({moc,x:X[moc],y:F,taken:false})),
  ckpts:[{id:1,x:X.ck1,y:F},{id:2,x:X.ck2,y:F}],ckpt:1,
  sw:{x:X.sw,y:F,w:90,down:false},door:{q:door,open:0,solved:false,told:false},
  chest:{x:X.secret,y:F,taken:false},secret:false,done:false,told:{}};
 return{platforms,enemies,items:[],runes:[],barriers:[],goals:[],level,ladders:[],breakables:[],towers:[],plows:[],plowTeams:[],traps:[],cannons:[],guns:[],vaults:[],logori:[],busy:[],y0:F-GB_WALL,pitY:F+300,gb,
  chapter:{name:'GREYBOX · SIVE SOBE',start:0,end:GB_WIDTH,goal:level.design.goal,message:''}};
}

// ---------- once a step (game.js calls it from update while the greybox is the level) ----------
export function gbTick(G,dt){const W=G.world,S=W.gb,p=G.p;if(!S||G.mode!=='play')return;S.t+=dt;
 const r=gbRoomAt(p.x);if(r!==S.room){S.room=r;const R=GB_ROOMS[r];if(!S.seen.has(r)&&S.t>.5)G.toast(R.name.toUpperCase(),1.6);S.seen.add(r);if(R.secret&&!S.secret)G.toast('Tajna soba!',2);}
 const near=(o,dx=46,dy=70)=>Math.abs(p.x-o.x)<dx&&Math.abs(p.y-o.y)<dy;
 for(const s of S.shrines)if(!s.taken&&near(s)){s.taken=true;S.moci[s.moc]=true;const M=GB_MOCI[s.moc];G.burst(s.x,s.y-70,M.color,40,240);G.sfx('magic_big',{gain:.9});G.label(M.name.toUpperCase(),s.x,s.y-160,M.color);G.speak(`${M.name} (${M.key}). ${M.text}`,9);}
 // a checkpoint fills the health each time Marko steps on it again, and Ravijojla brings him back to the last one
 for(const c of S.ckpts){if(!near(c,40,8)||!p.grounded){if(c.on&&Math.abs(p.x-c.x)>140)c.on=false;continue;}if(c.on)continue;c.on=true;S.ckpt=c.id;G.ckpt={x:c.x,y:c.y};p.hp=p.maxHp;G.sfx('ring',{gain:.5});G.label('ČEKPOINT',c.x,c.y-170,'#a6ffe1');}
 // the switch opens the door for GB_DOOR seconds; once Marko is through, it stays open
 const D=S.door,q=D.q,sw=S.sw,on=p.grounded&&Math.abs(p.x-sw.x)<sw.w/2&&Math.abs(p.y-sw.y)<4;
 if(on&&!sw.down&&!D.solved){D.open=GB_DOOR;G.sfx('clang',{gain:.6,rate:1.4});G.label('VRATA!',q.x,F-260,'#8fffe0');}sw.down=on;
 if(!D.solved){const was=q.off;D.open=Math.max(0,D.open-dt);const inside=p.x+20>q.x&&p.x-20<q.x+q.w;q.off=D.open>0||(was&&inside);
  if(was&&!q.off){G.sfx('clang',{gain:.5,rate:.8});if(!D.told&&S.moci.trag&&Math.abs(p.x-q.x)>200){D.told=true;G.speak('Vrata se zatvore pre nego što stigneš. Ostavi Vilin trag kraj vrata (V), stani na prekidač, pa se tragom vrati (V).',9);}}
  if(p.x>q.x+q.w+30){D.solved=true;q.off=true;}}
 if(!S.chest.taken&&near(S.chest,50)){S.chest.taken=true;S.secret=true;p.maxHp+=20;p.hp=p.maxHp;G.sfx('coins',{gain:1});G.burst(S.chest.x,S.chest.y-40,'#ffe39a',30,200);G.label('TAJNA · +20 ZDRAVLJA',S.chest.x,S.chest.y-150,'#ffe39a');}
 // the walls say what they wait for, the first time Marko stands under one without it
 for(const g of W.platforms)if(g.gbGate&&!S.moci[g.gbGate]&&p.grounded&&Math.abs(p.x-(g.x+g.w/2))<200&&!S.told[g.x]){S.told[g.x]=true;G.toast(`Previsoko za jedan skok. Treba ti ${GB_MOCI[g.gbGate].name}.`,2.6);}
 const c=W.enemies.find(e=>e.champion);if(c&&!c.alive&&!S.done){S.done=true;S.doneT=S.t;const m=Math.floor(S.t/60),s=Math.floor(S.t%60);G.showTitle('GREYBOX JE PREĐEN',`${m}:${String(s).padStart(2,'0')}`,S.secret?'Tajna soba je nađena.':'Tajna soba je ostala skrivena: vrati se sa krilom iza prvog zida.');}
 gbMap(G);}

// ---------- camera: held inside the room Marko is in, sliding over when he walks into the next ----------
export function gbCamera(G,dt){const p=G.p,R=GB_ROOMS[gbRoomAt(p.x)];
 const want=clampN(p.x-G.VIEW_W*.4,R.x0,Math.max(R.x0,R.x1-G.VIEW_W));G.camera+=(want-G.camera)*Math.min(1,dt*6);
 const wy=clampN(G.levelCameraY(dt),CAM_TOP,CAM_BOT-G.VIEW_H);G.camY+=(wy-G.camY)*Math.min(1,dt*4);return true;}

// ---------- drawing: flat grey blocks, a 100 px grid, colour only for what matters ----------
const C={back:'#25272c',back2:'#2a2c32',secret:'#2c2836',grid:'rgba(255,255,255,.035)',block:'#7c8088',edge:'#a7abb3',dark:'#4b4e55',plank:'#8e929a'};
export function gbDraw(G){const g=G.ctx,W=G.world,S=W.gb,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H,t=G.time;if(!g||!S)return;
 g.save();g.fillStyle=C.back;g.fillRect(cam-60,cy-60,VW+120,VH+120);
 GB_ROOMS.forEach((R,i)=>{if(R.x1<cam-20||R.x0>cam+VW+20)return;g.fillStyle=R.secret?C.secret:i%2?C.back2:C.back;g.fillRect(R.x0,ROOF,R.x1-R.x0,F-ROOF);});
 g.strokeStyle=C.grid;g.lineWidth=1;g.beginPath();for(let x=Math.floor(cam/100)*100;x<cam+VW+100;x+=100){g.moveTo(x,ROOF);g.lineTo(x,F);}for(let y=F-100;y>ROOF;y-=100){g.moveTo(cam-60,y);g.lineTo(cam+VW+60,y);}g.stroke();
 // the doorway between two rooms: a frame in the back wall
 for(const R of GB_ROOMS){if(R.x0<cam-80||R.x0>cam+VW+80||!R.x0)continue;g.fillStyle=C.dark;g.fillRect(R.x0-10,ROOF,20,F-300-ROOF);g.fillRect(R.x0-60,F-300,120,14);}
 for(const q of W.platforms){if(q.x+q.w<cam-60||q.x>cam+VW+60||(q.off&&q.arena))continue;
  if(q.gbDoor){if(q.off){g.strokeStyle='rgba(143,255,224,.5)';g.setLineDash([8,8]);g.strokeRect(q.x,q.y,q.w,q.h);g.setLineDash([]);}else{g.fillStyle='#3f8f7e';g.fillRect(q.x,q.y,q.w,q.h);g.fillStyle='#8fffe0';for(let y=q.y+30;y<q.y+q.h;y+=70)g.fillRect(q.x+q.w/2-3,y,6,30);}continue;}
  g.fillStyle=q.kind==='plank'?C.plank:C.block;g.fillRect(q.x,q.y,q.w,q.h);g.fillStyle=C.edge;g.fillRect(q.x,q.y,q.w,3);g.strokeStyle=C.dark;g.lineWidth=2;g.strokeRect(q.x+1,q.y+1,q.w-2,q.h-2);
  if(q.gbGate){const M=GB_MOCI[q.gbGate];g.fillStyle=M.color;g.globalAlpha=.85;g.fillRect(q.x,q.y,q.w,8);g.globalAlpha=1;}
  if(q.gbLip){g.fillStyle=GB_MOCI.nalet.color;g.fillRect(q.x,q.y,q.w,6);}}
 // the abyss: its near edge and the depth below
 {g.fillStyle=GB_MOCI.nalet.color;g.fillRect(X.pit-40,F,40,6);g.fillStyle='#141518';g.fillRect(X.pit,F+4,GB_GAP,BOT);}
 for(const s of S.shrines){if(Math.abs(s.x-cam-VW/2)>VW)continue;const M=GB_MOCI[s.moc];g.fillStyle=C.dark;g.fillRect(s.x-34,s.y-36,68,36);g.fillStyle=C.edge;g.fillRect(s.x-34,s.y-36,68,3);
  if(!s.taken){const y=s.y-74+Math.sin(t*2.5)*6;G.halo(s.x,y,52,M.color,.8);g.fillStyle=M.color;g.beginPath();g.arc(s.x,y,16,0,Math.PI*2);g.fill();G.textLabel(M.name.toUpperCase(),s.x,s.y-112,{font:'bold 13px Georgia',color:M.color});}}
 for(const c of S.ckpts){if(Math.abs(c.x-cam-VW/2)>VW)continue;const on=S.ckpt===c.id;g.fillStyle=on?'#9fe6cf':'#8d9198';g.fillRect(c.x-10,c.y-120,20,120);g.fillRect(c.x-22,c.y-12,44,12);if(on)G.halo(c.x,c.y-126,40,'#a6ffe1',.7+.2*Math.sin(t*3));G.textLabel('ČEKPOINT',c.x,c.y-136,{font:'bold 12px Georgia',color:on?'#a6ffe1':'#c9ccd2'});}
 {const sw=S.sw,D=S.door;g.fillStyle=sw.down||D.open>0?'#8fffe0':'#3f8f7e';g.fillRect(sw.x-sw.w/2,sw.y-(sw.down?3:9),sw.w,sw.down?3:9);if(Math.abs(sw.x-cam-VW/2)<VW)G.textLabel(D.solved?'PREKIDAČ':'PREKIDAČ · VRATA SE OTVORE NA TREN',sw.x,sw.y-40,{font:'bold 12px Georgia',color:'#8fffe0'});
  if(D.open>0&&!D.solved){const k=D.open/GB_DOOR;g.strokeStyle='#8fffe0';g.lineWidth=4;g.beginPath();g.arc(D.q.x+D.q.w/2,F-300,16,-Math.PI/2,-Math.PI/2+Math.PI*2*k);g.stroke();}}
 {const ch=S.chest;if(Math.abs(ch.x-cam-VW/2)<VW){g.fillStyle=ch.taken?'#5d564a':'#9a8a62';g.fillRect(ch.x-34,ch.y-44,68,44);g.fillStyle='#d9c28a';g.fillRect(ch.x-34,ch.y-(ch.taken?52:44),68,6);if(!ch.taken){G.halo(ch.x,ch.y-30,60,'#ffe39a',.6);G.textLabel('TAJNA',ch.x,ch.y-70,{font:'bold 13px Georgia',color:'#ffe39a'});}}}
 // the names of the rooms, high on their back walls
 for(const R of GB_ROOMS){const mx=clampN(cam+VW/2,R.x0+200,R.x1-200);if(R.x1<cam||R.x0>cam+VW)continue;G.textLabel(R.name.toUpperCase(),mx,ROOF+40,{font:'bold 16px Georgia',color:'#8b8f98'});}
 g.restore();}

// ---------- the map: a row of rooms, what is in them and where Marko is (a small canvas over the game) ----------
let mapEl=null,mapT=0;
export function gbMapRemove(){mapEl?.remove?.();mapEl=null;}
export function gbMap(G){if(!G.hasDom)return;const S=G.world.gb;if(!S)return;const now=G.time;if(mapEl&&now-mapT<.1)return;mapT=now;
 if(!mapEl||!mapEl.isConnected){mapEl=document.createElement('canvas');mapEl.id='gb-map';mapEl.width=340;mapEl.height=92;mapEl.style.cssText='position:fixed;right:14px;top:104px;z-index:30;width:340px;height:92px;border-radius:6px;background:#0d0f12d9;box-shadow:inset 0 0 0 1px #9aa0a866;pointer-events:none';document.body.appendChild(mapEl);}
 const g=mapEl.getContext('2d'),k=310/GB_WIDTH,ox=15,y=26,h=26,X0=x=>ox+x*k;g.clearRect(0,0,340,92);g.font='bold 11px Georgia';g.fillStyle='#c9ccd2';g.fillText('MAPA · '+GB_ROOMS[Math.max(0,S.room)].name,ox,15);
 GB_ROOMS.forEach((R,i)=>{const seen=S.seen.has(i),x=X0(R.x0),w=(R.x1-R.x0)*k;if(R.secret&&!seen){g.setLineDash([3,3]);g.strokeStyle='#8b8f98';g.strokeRect(x+1,y,w-2,h);g.setLineDash([]);g.fillStyle='#8b8f98';g.fillText('?',x+w/2-3,y+17);return;}
  g.fillStyle=i===S.room?'#5f6570':seen?'#3d4148':'#1c1e22';g.fillRect(x+1,y,w-2,h);g.strokeStyle=i===S.room?'#e6e9ee':'#6b7079';g.lineWidth=1;g.strokeRect(x+1,y,w-2,h);});
 const dot=(x,c,r=3)=>{g.fillStyle=c;g.beginPath();g.arc(X0(x),y+h/2,r,0,Math.PI*2);g.fill();};
 for(const s of S.shrines)if(!s.taken&&S.seen.has(gbRoomAt(s.x)))dot(s.x,GB_MOCI[s.moc].color,4);
 for(const c of S.ckpts)if(S.seen.has(gbRoomAt(c.x))){g.fillStyle=S.ckpt===c.id?'#a6ffe1':'#8b8f98';g.fillRect(X0(c.x)-2,y+3,4,8);}
 const lock=(x,moc,open)=>{g.fillStyle=open?'#5f6570':GB_MOCI[moc].color;g.fillRect(X0(x)-2,y-3,4,h+6);};
 lock(X.wall1+60,'krilo',S.moci.krilo);lock(X.wall2+60,'krilo',S.moci.krilo);lock(X.pit+GB_GAP/2,'nalet',S.moci.nalet);lock(X.door,'trag',S.door.solved);
 if(!S.chest.taken&&S.seen.has(0))dot(S.chest.x,'#ffe39a',4);
 {const c=G.world.enemies.find(e=>e.champion);if(c?.alive){g.strokeStyle='#ff6a5a';g.lineWidth=2;const cx=X0(c.arena.x0+(c.arena.x1-c.arena.x0)/2);g.beginPath();g.moveTo(cx-4,y+9);g.lineTo(cx+4,y+17);g.moveTo(cx+4,y+9);g.lineTo(cx-4,y+17);g.stroke();}}
 dot(G.p.x,'#ffffff',3.5);
 g.font='11px Georgia';let mx=ox;for(const id of Object.keys(GB_MOCI)){const M=GB_MOCI[id],have=S.moci[id];g.fillStyle=have?M.color:'#6b7079';const txt=(have?'● ':'○ ')+M.name;g.fillText(txt,mx,y+h+20);mx+=g.measureText(txt).width+14;}
 if(S.secret){g.fillStyle='#ffe39a';g.fillText('★',326,15);}}
// the map and its rooms as plain data, for the reachability test: which rooms can be entered holding these powers
export function gbReach(moci,start='predvorje'){const ids=GB_ROOMS.map(R=>R.id),seen=new Set([start]);let grown=true;
 while(grown){grown=false;for(const [a,b,need] of GB_LINKS){if(need&&!moci.has(need))continue;for(const [u,v] of[[a,b],[b,a]])if(seen.has(u)&&!seen.has(v)){seen.add(v);grown=true;}}}
 return ids.filter(id=>seen.has(id));}
