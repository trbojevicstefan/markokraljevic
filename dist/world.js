export const W=1280,H=720,GRAVITY=1750;
export const chapters=[
 {name:'I · DRUM JUNAKA',start:0,end:3200,goal:'Oslobodi drum od osmanske straže',message:'Marko, odred je zatvorio drum. Prati naše crvene barjake. Space za skok; J za topuz.'},
 {name:'II · ZATOČENA KAPIJA',start:3200,end:7000,goal:'Porazi čuvare i oslobodi putnike',message:'Štit ne popušta pred lakim udarcem. K razbija gard. L odbija napad u pravom trenutku.'},
 {name:'III · VILINSKI TRAG',start:7000,end:10800,goal:'Probudi tri vilinska kamena · E',message:'Priđi svetlećim kamenovima i pritisni E. Otvoriću ti put. U vazduhu te mogu podići još jednom.'},
 {name:'IV · ŠARČEV ZALET',start:10800,end:24500,goal:'Uzjaši Šarca · E · preskoči srušeni drum',message:'Šarac te čeka! Priđi mu i pritisni E. Drži D za galop, Space za skok. Musini ljudi stoje na drumu: Šarac ih gazi, a štitonošu obori topuzom sa sedla (J).'},
 {name:'V · POSLEDNJI BARJAK',start:24500,end:28000,goal:'Slomi obruč i podigni poslednji barjak',message:'Još jedan odred čuva prilaz Musi. Vino daje snagu — Q. Sačuvaj gutljaj za završni megdan.'},
 {name:'VI · TRI SRCA KAČANIKA',start:28000,end:29900,goal:'Pobedi Musu Kesedžiju',message:'Musa ima tri srca. Posle njegovog napada gard se otvara. L za odbijanje, E za moj bljesak.'}
];
export function chapterAt(x){return Math.max(0,chapters.findIndex(z=>x<z.end));}
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const FOE_HP={shield:125,archer:65,akindzija:80,oklopnik:240,palikuca:70};
export function makeWorld(){
 const platforms=[],enemies=[],items=[],runes=[],barriers=[];let serial=0;
 const floor=(x,w,y=590,kind='stone')=>platforms.push({x,y,w,h:150,kind});
 const enemy=(x,type='sword',zone=chapterAt(x))=>enemies.push({id:serial++,x,y:590,w:36,h:75,hp:FOE_HP[type]??90,maxHp:FOE_HP[type]??90,type,zone,face:-1,mode:'idle',timer:.5+(serial%4)*.23,stun:0,flash:0,alive:true,home:x,attackId:0});
 floor(-200,1100);floor(1030,810);floor(1990,1210);floor(600,160,480);floor(1550,150,465);floor(2400,180,475);
 [1160,1380,1640,2210,2640,2880].forEach((x,i)=>enemy(x,['sword','sword','archer'][i%3]));
 floor(3200,3800);[3550,3890,4230,4610,4980,5260,5590,5940,6300,6650].forEach((x,i)=>enemy(x,['shield','sword','archer','sword'][i%4]));
 [3800,4900,5950].forEach(x=>floor(x,160,460));
 floor(7000,700);floor(7940,820);floor(8900,800);floor(9940,860);
 [7580,8540,9580].forEach((x,i)=>{runes.push({x,y:590,active:false,id:i});platforms.push({x:x+116,y:590,w:248,h:30,kind:'magic',rune:i});});
 floor(7400,100,475);floor(8270,130,465);floor(9320,130,475);floor(10250,150,465);
 [8180,9200,10300].forEach(x=>enemy(x,'archer'));
 [[845,895,140],[1785,1835,160]].forEach(([sx,bx,bw],k)=>{runes.push({x:sx,y:590,active:false,id:3+k,road:true});platforms.push({x:bx,y:590,w:bw,h:30,kind:'magic',rune:3+k});});
 let x=10800,seg=0;while(x<24500){const len=Math.min(900+((x*13)%300),24500-x);floor(x,len);if(seg%2===1&&x+len<24000){const n=enemies.length;enemy(x+len*.42,['sword','shield','sword'][seg%3]);enemy(x+len*.42+110,'sword');for(let k=n;k<enemies.length;k++)enemies[k].road=true;}seg++;if(x+len>=24500)break;barriers.push({x:x+len-310,y:590,w:45,h:65,horse:true});x+=len+190;}floor(24300,200);
 floor(24500,3500);[[2050,'akindzija'],[4400,'oklopnik'],[5750,'palikuca'],[8600,'akindzija'],[9300,'palikuca'],[25350,'oklopnik'],[26700,'palikuca'],[27450,'akindzija']].forEach(([x,t])=>enemy(x,t));[24840,25180,25530,25910,26200,26540,26880,27240,27600].forEach((x,i)=>enemy(x,['sword','shield','archer'][i%3]));
 [25250,26450,27350].forEach(x=>floor(x,150,465));floor(28000,1900);
 [450,1500,2600,3400,4450,5400,6500,7150,8400,10100,11100,15600,20500,24700,25800,27000,28200].forEach((x,i)=>items.push({id:i,x,y:555,type:i%3===0?'wine':'herb',taken:false}));
 [[1600,430],[8350,430],[27400,430]].forEach(([x,y],i)=>items.push({id:100+i,x,y,type:'relic',taken:false}));
 // Turkish cannons with their gunners: chapter II and the last siege before Musa
 const cannons=[[5480,5560],[26080,26160]].map(([x,gx])=>{enemy(gx,'palikuca');enemies[enemies.length-1].gunner=true;return{kind:'top',x,y:590,face:-1};});
 const travelers=['kaluder','putnica','trgovac','starac'].map((who,i)=>({id:i,who,x:250+i*50,home:250+i*50,face:-1,state:'camp',walk:0}));
 return {platforms,enemies,items,runes,barriers,travelers,cannons};
}
// Bodies stand on platform tops. Thin platforms are one-way; `solid` blocks (pohod terrain, towers, crates) also stop
// sideways movement and bump heads. A grounded body climbs low steps (stairs) and stays glued to them going down.
export const STEP_UP=30;
export function integrate(body,dt,platforms,runes=[]){
 const hw=(body.w||34)/2,h=body.h||100,ground=body.grounded;let feet=body.y;
 body.vy+=GRAVITY*dt;body.wallHit=0;body.wallQ=null;
 let nx=body.x+body.vx*dt;
 if(nx!==body.x){const dir=Math.sign(nx-body.x);
  for(const q of platforms){if(!q.solid||q.off)continue;if(feet<=q.y+1||feet-h>=q.y+q.h)continue;
   const face=dir>0?q.x:q.x+q.w,edge=body.x+dir*hw,next=nx+dir*hw;
   if(dir>0?(edge<=face+.5&&next>face):(edge>=face-.5&&next<face)){
    if(ground&&body.vy>=0&&q.y>=feet-STEP_UP&&!platforms.some(o=>o.solid&&!o.off&&o!==q&&o.y+o.h>q.y-h&&o.y<q.y&&nx+hw>o.x&&nx-hw<o.x+o.w)){feet=q.y;continue;}
    nx=face-dir*hw;body.wallHit=dir;body.wallQ=q;}}}
 body.x=nx;body.y=feet;const old=body.y;body.y+=body.vy*dt;body.grounded=false;
 if(body.vy<0){for(const q of platforms){if(!q.solid||q.off)continue;const bottom=q.y+q.h;if(body.x+hw>q.x+2&&body.x-hw<q.x+q.w-2&&old-h>=bottom-1&&body.y-h<bottom){body.y=bottom+h;body.vy=0;}}}
 if(body.vy>=0){let best=null;
  for(const q of platforms){if(q.off||(q.kind==='magic'&&!runes[q.rune]?.active)||(body.drop>0&&(body.dropFrom?q===body.dropFrom:!q.solid))||(body.floorOnly&&q.y<585&&!q.solid))continue;if(body.x+hw>q.x&&body.x-hw<q.x+q.w&&old<=q.y+2&&body.y>=q.y&&(!best||q.y<best.y))best=q;}
  if(!best&&ground&&body.vy<320){for(const q of platforms){if(q.off||(q.kind==='magic'&&!runes[q.rune]?.active)||(body.drop>0&&(body.dropFrom?q===body.dropFrom:!q.solid))||(body.floorOnly&&q.y<585&&!q.solid))continue;if(body.x+hw>q.x&&body.x-hw<q.x+q.w&&q.y>body.y&&q.y-body.y<=STEP_UP-2&&(!best||q.y<best.y))best=q;}}
  if(best){body.y=best.y;body.vy=0;body.grounded=true;body.on=best;}else body.on=null;}
 else body.on=null;
}

// ---------- campaigns ("pohodi") built from art/world-pack-*/levels.json ----------
const THEME_FOES={selo:['sword','archer','sword','akindzija'],klisura:['sword','archer','akindzija','palikuca','shield'],suma:['archer','akindzija','sword','palikuca'],manastir:['shield','sword','oklopnik','archer'],tvrdjava:['oklopnik','palikuca','shield','archer','akindzija'],prevoj:['akindzija','oklopnik','sword','archer','shield','palikuca']};
export const LEVEL_ZONE=6;
// What each campaign asks before its end banner counts. use: press E beside it; take: walk over it;
// gate: blocks the road until everything before it is done (guarded gates also wait for nearby foes); finish: art by the banner.
const GATE=['cilj-kapija-zatvorena','cilj-kapija-otvorena'],LEVER=['cilj-poluga','cilj-poluga-povucena'];
const GOAL_PLAN={
 selo:{goals:[{kind:'gate',at:.5,art:GATE,h:290,label:'Oslobodi seosku kapiju',guarded:true},{kind:'finish',art:['cilj-bunar-svetli'],h:170,dx:-210}],finish:'Pronađi put do bunara'},
 klisura:{goals:[{kind:'use',at:.4,art:LEVER,h:120,label:'Povuci polugu uz reku',done:'Lanac je popustio. Prolaz uz reku je otvoren.'},{kind:'gate',at:.62,art:GATE,h:290,label:'Otvori prolaz uz reku'}],finish:'Pređi do kraja klisure'},
 suma:{goals:[.25,.5,.75].map(at=>({kind:'use',at,art:['cilj-vilinski-kamen','cilj-vilinski-kamen-budan'],h:150,label:'Probudi vilinske kamenove',glow:'#9fffe0',gy:.5,done:'Kamen se probudio.'})),finish:'Otkrij skriveno svetilište'},
 manastir:{goals:[{kind:'take',at:.58,art:['cilj-relikvija'],h:110,label:'Pronađi relikviju',glow:'#ffe39a',gy:.8,done:'Relikvija je spasena.'}],finish:'Podigni manastirski barjak'},
 tvrdjava:{goals:[{kind:'use',at:.4,art:['cilj-opsadna-sprava','cilj-opsadna-sprava-srusena'],h:160,label:'Onesposobi opsadnu spravu',done:'Sprava je slomljena.',smash:true},{kind:'gate',at:.66,art:GATE,h:290,label:'Otvori tvrđavsku kapiju'}],finish:'Prođi kroz tvrđavu'},
 prevoj:{goals:[],finish:'Prati barjake do kule na prevoju'},
 pecina:{goals:[{kind:'use',at:.55,art:['cilj-kristal','cilj-kristal-svetli'],h:170,label:'Probudi kristal koji pokazuje Ravijojla',glow:'#8ff3ff',gy:.5,done:'Kristal je obasjao prolaz.'}],finish:'Prođi kristalnim prolazom'},
 podrum:{goals:[],finish:'Nađi izlaz iz podruma'},
 mocvara:{goals:[.2,.4,.6,.8].map(at=>({kind:'use',at,art:['cilj-svetiljka','cilj-svetiljka-upaljena'],h:190,label:'Upali svetiljke preko močvare',glow:'#ffcf7a',gx:.3,gy:.66,done:'Svetiljka gori.'})),finish:'Prati svetiljke do kraja močvare'},
 rudnik:{goals:[{kind:'use',at:.45,art:LEVER,h:120,label:'Pronađi polugu starog okna',done:'Negde napred zaškripala je rešetka.'},{kind:'gate',at:'end',art:['cilj-rudarski-izlaz-zatvoren','cilj-rudarski-izlaz-otvoren'],h:260,label:'Otvori rudarski izlaz'}],finish:'Izađi iz rudnika'},
 rusevine:{goals:[],finish:'Popni se do poslednjeg barjaka'},
 reka:{goals:[{kind:'finish',art:['cilj-vodenica'],h:330,dx:-270}],finish:'Stigni do vodenice'}
};
export const goalArt=L=>[...new Set((GOAL_PLAN[L.id]?.goals||[]).flatMap(g=>g.art))];
export const goalFinish=L=>GOAL_PLAN[L.id]?.finish||'Stigni do barjaka na kraju puta';
function makeGoals(L,floorAt){
 const near=x=>{for(let d=0;d<2600;d+=40)for(const s of[1,-1]){const q=floorAt(x+s*d);if(q)return[x+s*d,q.y];}return null;};
 return(GOAL_PLAN[L.id]?.goals||[]).map((g,i)=>{const want=g.kind==='finish'?L.goal.x+g.dx:g.at==='end'?L.goal.x-190:L.width*g.at,spot=g.kind==='finish'?[want,L.goal.y]:near(want);if(!spot)return null;
  return{id:i,kind:g.kind,x:spot[0],y:spot[1],off:g.art[0],on:g.art[1]||null,h:g.h,label:g.label||'',doneText:g.done||'',glow:g.glow||null,gx:g.gx||0,gy:g.gy||.55,guarded:!!g.guarded,smash:!!g.smash,done:g.kind==='finish',t:9};}).filter(Boolean);
}
// ================= pohod layout: rooms read left to right =================
// Ground is solid and rises and falls by stairs and cliffs. Archers wait on towers and watchtowers that Marko has to
// climb (ladders, ledge grabs); chimneys are climbed by jumping wall to wall. Pits are rare and short.
const RISE=24,RUN=46,LOW=660;
export const BREAK={sanduk:{w:62,h:60,hp:2,solid:true},bure:{w:50,h:68,hp:2,solid:true},cup:{w:40,h:56,hp:1},korpa:{w:54,h:42,hp:1},kovceg:{w:72,h:52,hp:1},kosnica:{w:46,h:58,hp:1},plast:{w:70,h:62,hp:2},tikve:{w:64,h:40,hp:1},stena:{w:66,h:56,hp:3,solid:true},panj:{w:58,h:46,hp:2},crkva:{w:66,h:54,hp:2,solid:true},barut:{w:48,h:62,hp:1},tobolac:{w:40,h:56,hp:1},santa:{w:62,h:58,hp:2,solid:true},vagon:{w:84,h:64,hp:3,solid:true},zid:{w:74,h:205,hp:4,solid:true}};
// each land breaks its own things
export const LAND_CRATES={selo:['kosnica','plast','tikve'],klisura:['stena'],suma:['kosnica','panj'],manastir:['crkva'],tvrdjava:['barut','tobolac'],prevoj:['santa','stena'],pecina:['santa'],podrum:['barut'],mocvara:['panj'],rudnik:['vagon','stena'],oranje:['plast']};
// Marvels from the songs about Marko, one hidden in each land; each one strengthens him for good.
export const CUDA=[
 {id:'sarceva-potkova',name:'Šarčeva potkova',song:'Šarac, Markov verni konj',perk:'Brži trk',land:'selo'},
 {id:'gusle',name:'Gusle',song:'Guslar peva o Marku',perk:'Bes se puni brže',land:'klisura'},
 {id:'orlovo-pero',name:'Orlovo pero',song:'Marko Kraljević i orao',perk:'Drži skok da lebdiš pri padu',land:'suma'},
 {id:'carska-knjiga',name:'Carska knjiga',song:'Uroš i Mrnjavčevići',perk:'+15 zdravlja',land:'manastir'},
 {id:'oceva-sablja',name:'Očeva sablja',song:'Marko Kraljević poznaje očinu sablju',perk:'Laki udarci jači',land:'tvrdjava'},
 {id:'buzdovan',name:'Buzdovan',song:'Marko Kraljević i Musa Kesedžija',perk:'Bačen topuz jači',land:'prevoj'},
 {id:'vilino-pero',name:'Vilino pero',song:'Marko Kraljević i vila',perk:'Ravijojla se brže vraća',land:'pecina'},
 {id:'pehar-vina',name:'Pehar rujnog vina',song:'Marko pije uz ramazan vino',perk:'Čutura prima još jedno vino',land:'podrum'},
 {id:'tri-kese-dukata',name:'Tri kese dukata',song:'Smrt Marka Kraljevića',perk:'Više dukata',land:'rudnik'},
 {id:'kljuc-kule',name:'Ključ arapske kule',song:'Marko Kraljević ukida svadbarinu',perk:'Kovčezi daju duplo',land:'rusevine'},
 {id:'zlatno-ralo',name:'Zlatno ralo',song:'Oranje Marka Kraljevića',perk:'Teški udarci jači',land:'oranje'},
 {id:'sokolovo-pero',name:'Sokolovo pero',song:'Kraljević Marko i soko',perk:'Vazdušni udarci te duže drže u vazduhu',land:'mocvara'},
 {id:'prelomljeno-koplje',name:'Prelomljeno koplje',song:'Smrt Marka Kraljevića',perk:'Juriš se brže hladi',land:'reka'},
 {id:'musina-sablja',name:'Musina sablja',song:'Marko Kraljević i Musa Kesedžija',perk:'Manje primljene štete',land:'kacanik'},
];
// Each land: a string of rooms. Traps (spikes, crumbling planks, swinging logs, falling rocks, rolling barrels, a lever
// gate on a timer), a chase, and in five lands a champion waiting in an arena at the end.
export const RECIPES={
 selo:'flat crates stairs+ watch plate spikes stairs- ledges cellar pillars kljuc crates terrace+ flat terrace- watch ledges crates flat boss:djemo',
 klisura:'flat terrace+ ladder+ guslar tower chase flat chimney lift greda crates guslar crumble zid stairs+ watch rocks crates ledges terrace+ logs flat guslar:mir boss:kopljanik',
 suma:'flat watch crates gnezdo logs plate watch terrace+ ledges cellar spikes kljuc watch kolo stairs+ flat greda crates stairs- chimney flat boss:lovac',
 manastir:'flat stairs+ flat stairs+ crates tower lever kljuc cellar greda chimney zvona zid stairs- ledges lift stairs+ tower flat boss:dzelat',
 tvrdjava:'flat topnica crates tower barrels plate zid chimney^ flat tower lever kljuc crates sator pillars ladder+ tower flat top barut flat boss:oklopnik',
 prevoj:'flat stairs+ terrace+ ladder+ chase sator watch top lift stairs+ chimney flat rocks zid terrace+ crates flat boss:akindzija',
 pecina:'flat terrace- crates crumble greda crates spikebed chimney ledges terrace+ cellar flat ogledala pillars zid gap tower crumble crates flat boss:azdaja',
 podrum:'flat crates stairs- greda barrels plate ladder+ kljuc crates spikebed zid chimney crates stairs+ barrels tower crates boss:palikuca',
 mocvara:'flat bridge watch crumble ferry bridge crates logs kljuc spikebed watch ledges flat bridge pillars watch flat boss:tufekdzija',
 rudnik:'flat ladder+ crates rocks zid lift ledges tower lever greda chimney cellar teg crumble ladder+ barrels crates flat boss:shield',
 rusevine:'flat stairs+ ladder+ chimney^ crates svatovi crumble greda stairs+ tower flat spikebed zid svatovi ladder+ crates chimney^ logs kljuc terrace+ ladder+ watch svatovi stairs+ flat boss:arapin',
 reka:'flat crates bridge flat watch ferry sator top stairs+ logs kljuc stairs- plate bridge crumble crates ledges watch flat boss:sword',
 oranje:'flat plow crates sator plow watch plate stairs+ flat stairs- plow crates ledges flat boss:trio',
};
// each champion has his own way of fighting (kit) and his own ground: pillars, planks, a ledge with a banner, a tower
export const BOSSES={oklopnik:{name:'Hasan-aga Oklopnik',hp:1980,kit:'hasan'},akindzija:{name:'Akindžijski beg',hp:1460,kit:'beg'},palikuca:{name:'Ognjeni aga',hp:1350,kit:'ognjeni'},shield:{name:'Bajraktar sa štitom',hp:1610,kit:'bajraktar'},sword:{name:'Janičarski aga',hp:1400,kit:'janicar'},
 arapin:{name:'Arapin',hp:2340,kit:'arapin',scale:1},tufekdzija:{name:'Tufekdžija-baša',hp:1250,kit:'basa',scale:1.3},lovac:{name:'Lovac-aga',hp:1350,kit:'lovac',type:'sword',look:'lovac-aga'},
 azdaja:{name:'Aždaja',hp:2860,kit:'azdaja',scale:1},dzelat:{name:'Dželat',hp:2030,kit:'dzelat',scale:1},djemo:{name:'Đemo Brđanin',hp:1820,kit:'djemo',scale:1},
 trio:{name:'Tri janičara',hp:830,kit:'trio',type:'sword',scale:1.15},kopljanik:{name:'Kopljanik-baša',hp:1560,kit:'kopljanik',scale:1.3}};
export const POWERS={oganj:{name:'Ognjeni topuz',color:'#ff8a3a'},grom:{name:'Gromovni topuz',color:'#9fd8ff'},vila:{name:'Vilinski topuz',color:'#9fffe0'}};

function seeded(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);h=h||1;return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return(h>>>0)/4294967296;};}
export function buildLayout(L,variant='day'){
 const R=seeded(L.id+'|'+variant),pick=a=>a[Math.floor(R()*a.length)],ri=(a,b)=>Math.floor(a+R()*(b-a+1));
 const platforms=[],ladders=[],breakables=[],spots=[],rewards=[],towers=[],busy=[],plows=[],traps=[],cellars=[],vaults=[];let x=0,gy=590,run=null,boss=null;
 const block=(x0,w,top,o={})=>{const q={x:Math.round(x0),y:Math.round(top),w:Math.round(w),h:Math.max(240,840-Math.round(top)),kind:'stone',solid:true,...o};platforms.push(q);return q;};
 // the walkable road; at a cliff the lower floor runs on under the higher one, so its end is hidden
 const ground=len=>{if(run&&run.y===gy&&run.x+run.w===x)run.w+=len;else{let x0=x,w=len;if(run&&run.x+run.w===x){if(gy<run.y)run.w+=50;else{x0-=50;w+=50;}}run=block(x0,w,gy,{ground:true});}x+=len;};
 const loot=()=>{const r=R();return r<.15?{herb:1}:r<.25?{wine:1}:{coins:ri(2,6)};};
 const crate=(bx,kind,o={})=>{const S=BREAK[kind];breakables.push({id:breakables.length,x:Math.round(bx),y:o.y??gy,kind,hp:S.hp,w:S.w,h:S.h,solid:!!S.solid,loot:o.loot||loot()});return S.w;};
 const steps=dir=>{const n=ri(4,7),x0=x,base=gy;busy.push([x0-60,x0+n*RUN+60]);
  if(dir<0){ground(n*RUN);for(let i=0;i<n;i++)block(x0+i*RUN,(n-i)*RUN+40,base-RISE*(i+1),{kind:'step'});gy=base-RISE*n;}
  else{const m=Math.min(n,Math.floor((LOW-base)/RISE));if(m<2)return;for(let i=0;i<m;i++)block(x0-40,(i+1)*RUN+40,base+RISE*(i+1),{kind:'step'});gy=base+RISE*m;run=block(x0-40,m*RUN+40,gy,{ground:true});x+=m*RUN;}};
 // the road never sinks far below the start, so a fall is a pit only where the land has a real gap
 const cliff=d=>{if(gy+d>LOW)return;busy.push([x-60,x+60]);gy+=d;};
 const room={
  flat(){const len=ri(440,620),x0=x;ground(len);spots.push({x:x0+len*.55,y:gy});if(R()<.5)crate(x0+len*.2,pick(['cup','korpa','sanduk','cup']));},
  arena(){const len=ri(760,880),x0=x;ground(len);spots.push({x:x0+len*.35,y:gy},{x:x0+len*.68,y:gy});},
  crates(){const len=ri(380,480),x0=x;ground(len);let bx=x0+80;const own=LAND_CRATES[L.id]||[];for(let i=ri(2,4);i>0;i--)bx+=crate(bx,pick(['sanduk','cup','bure','korpa','cup','sanduk',...own,...own]))+ri(16,44);if(R()<.6)spots.push({x:x0+len-70,y:gy});},
  'stairs+'(){steps(-1);ground(ri(160,240));},
  'stairs-'(){steps(1);ground(ri(160,240));},
  'terrace+'(){cliff(-ri(80,104));const x0=x,len=ri(300,420);ground(len);spots.push({x:x0+len*.6,y:gy});},
  'terrace-'(){cliff(ri(80,104));ground(ri(300,400));},
  drop(){cliff(ri(150,230));ground(ri(320,420));},
  'ladder+'(){ground(ri(130,170));const h=ri(190,250),cx=x;cliff(-h);ladders.push({x:cx-24,top:gy,bottom:gy+h,side:1});const x0=x,len=ri(320,420);ground(len);spots.push({x:x0+110,y:gy,perch:true});},
  tower(){ground(ri(160,220));const H=ri(200,240),w=ri(160,190),tx=x;block(tx,w,gy-H,{tower:true});ladders.push({x:tx-22,top:gy-H,bottom:gy,side:1});spots.push({x:tx+w*.6,y:gy-H,perch:true});if(R()<.5)rewards.push({x:tx+w*.3,y:gy-H,prio:1});busy.push([tx-90,tx+w+60]);ground(w);ground(ri(200,280));},
  watch(){const x0=x,len=ri(400,460);ground(len);const cx=x0+len*.55,top=gy-ri(220,245);platforms.push({x:Math.round(cx-85),y:top,w:170,h:18,kind:'deck'});ladders.push({x:Math.round(cx-62),top,bottom:gy,side:0});towers.push({kind:'watch',x:Math.round(cx),top,base:gy});spots.push({x:cx+30,y:top,perch:true});busy.push([cx-130,cx+130]);},
  // an open shaft above the road: jump in, climb wall to wall, a reward waits on top
  chimney(){const x0=x,len=ri(520,600);ground(len);const aw=ri(100,120),gap=ri(150,162),bw=ri(150,180),ax=x0+ri(100,140),top=gy-ri(420,470),low=gy-150;
   block(ax,aw,top,{hang:true,h:low-top});block(ax+aw+gap,bw,top-20,{hang:true,h:low-top+20});rewards.push({x:ax+aw+gap+bw/2,y:top-20,prio:3});busy.push([ax-40,ax+aw+gap+bw+40]);},
  // the road itself climbs: walk under the hanging wall, jump wall to wall, go on from the top of the tower
  'chimney^'(){ground(ri(150,200));const aw=ri(100,120),gap=ri(150,162),bw=ri(180,220),ax=x,H=ri(330,370);
   block(ax,aw,gy-H,{hang:true,h:H-150});ground(aw+gap+bw);const b=block(x-bw,bw,gy-H-20,{tower:true,ground:true});busy.push([ax-40,x+40]);rewards.push({x:b.x+bw*.4,y:b.y,prio:2});gy=b.y;run=null;},
  ledges(){const x0=x,len=ri(480,560);ground(len);const d=R()<.5?1:-1;let px=d>0?x0+60:x0+len-200;for(let i=1;i<=3;i++){platforms.push({x:Math.round(px),y:gy-110*i,w:140,h:18,kind:'plank'});if(i<3)px+=d*ri(150,170);}rewards.push({x:px+70,y:gy-330,prio:2});busy.push([x0,x0+len]);},
  pillars(){const x0=x,len=ri(460,540);ground(len);for(const k of[.3,.68]){const pw=ri(70,90),ph=ri(60,90);block(x0+len*k,pw,gy-ph,{pillar:true});}busy.push([x0+len*.25,x0+len*.8]);spots.push({x:x0+len*.5,y:gy});},
  gap(){busy.push([x-40,x+200]);x+=ri(130,165);run=null;ground(ri(260,340));},
  bridge(){const w=ri(280,340);busy.push([x-40,x+w+40]);platforms.push({x:x-10,y:gy,w:w+20,h:18,kind:'plank',bridge:true});x+=w;run=null;ground(ri(260,340));},
  plow(){const x0=x,len=ri(1000,1150);ground(len);plows.push({x:x0+len*.8,y:gy});spots.push({x:x0+len*.55,y:gy});busy.push([x0+len*.6,x0+len]);},
  // sharpened stakes across the road: jump them, or knock a janissary onto them
  spikes(){const x0=x,len=ri(440,520);ground(len);const w=ri(90,130),sx=Math.round(x0+len*.45);traps.push({kind:'spikes',x:sx,w,y:gy});busy.push([sx-30,sx+w+30]);spots.push({x:x0+len*.85,y:gy});},
  // planks over a pit that give way a moment after Marko steps on them
  crumble(){const w=ri(300,360),n=3,x0=x;busy.push([x-40,x+w+40]);for(let i=0;i<n;i++){const seg=(w-20)/n;platforms.push({x:Math.round(x0+10+i*seg+5),y:gy,w:Math.round(seg-10),h:18,kind:'plank',crumble:true});}x+=w;run=null;ground(ri(260,340));},
  // a log hung on two chains swings across the road
  logs(){const x0=x,len=ri(720,780);ground(len);const beam=[Math.round(x0+40),Math.round(x0+len-40)],ph=R()*6.28;for(const [k,o] of[[.3,0],[.7,Math.PI]])traps.push({kind:'log',x:Math.round(x0+len*k),y:gy,pivot:gy-330,arm:240,amp:.85,phase:ph+o,beam});busy.push([x0,x0+len]);},
  // rocks fall from the cliffs; a shadow on the ground warns where
  rocks(){const x0=x,len=ri(560,660);ground(len);traps.push({kind:'rocks',x0:x0+70,x1:x0+len-70,y:gy,every:1.05});spots.push({x:x0+len*.5,y:gy});},
  // barrels roll down from above: jump them or smash them with a heavy blow
  barrels(){steps(-1);const x0=x;ground(420);traps.push({kind:'barrels',x:x0+380,y:gy,every:2.3});spots.push({x:x0+300,y:gy});},
  // pull the lever, then run: the gate stays open only a few heartbeats
  lever(){const x0=x,len=ri(760,840);ground(len);traps.push({kind:'timed',lever:{x:x0+90,y:gy},gate:{x:x0+len-90,y:gy},time:5.2});block(x0+len*.38,80,gy-80,{pillar:true});traps.push({kind:'spikes',x:Math.round(x0+len*.6),w:90,y:gy});busy.push([x0,x0+len]);},
  // a boulder (or an avalanche in the snow) rolls after Marko down a course that ends at a ravine
  chase(){const x0=x;ground(360);block(x,80,gy-70,{pillar:true});ground(380);const sx=x;traps.push({kind:'spikes',x:sx+120,w:100,y:gy});ground(420);block(x+60,80,gy-80,{pillar:true});ground(380);const rx=x;busy.push([x0,rx+200]);x+=ri(150,165);run=null;ground(360);traps.push({kind:'boulder',trigger:x0+80,x0,end:rx,y:gy,snow:L.id==='prevoj'});},
  // a heavy iron-bound crate and a stone plate: the gate stays open only while something weighs the plate down
  plate(){const x0=x,len=ri(760,840);ground(len);const bx=x0+150,px=x0+Math.round(len*.52),gx=x0+len-110;platforms.push({x:bx,y:gy-76,w:76,h:76,kind:'teret',solid:true,push:true});traps.push({kind:'plate',x:px,w:84,y:gy,gate:{x:gx,y:gy},vault:vaults.length});vaults.push({door:{x:gx,y:gy}});busy.push([x0,x0+len]);},
  // a cracked wall closes the road: too tall to jump, only heavy blows (K) bring it down; a chest waits behind it
  zid(){const x0=x,len=ri(560,640);ground(len);const wx=x0+Math.round(len*.5);crate(wx,'zid',{loot:{coins:ri(6,10)}});crate(wx+170,'kovceg',{loot:{coins:ri(18,26)}});busy.push([x0,x0+len]);spots.push({x:x0+140,y:gy});},
  // a treasury tower beside the road: its iron-bound door opens only with the key the keeper carries
  kljuc(){const x0=x,len=ri(760,840);ground(len);const dx=x0+Math.round(len*.64),kx=x0+Math.round(len*.3);traps.push({kind:'keydoor',x:dx,y:gy,gate:{x:dx,y:gy},vault:vaults.length,keeper:{x:kx,y:gy}});vaults.push({door:{x:dx,y:gy},key:true});spots.push({x:kx,y:gy});busy.push([x0,x0+len]);},
  // a Turkish tent: Ottomans come out of it while Marko is near, until he tears it down
  topnica(){const x0=x,len=1560;ground(len);traps.push({kind:'topnica',x:x0+190,y:gy,id:traps.length+1,face:1});busy.push([x0,x0+len]);},
  top(){const x0=x,len=ri(1040,1120);ground(len);traps.push({kind:'top',x:x0+len-130,y:gy,face:-1});platforms.push({x:Math.round(x0+len*.4),y:gy-58,w:58,h:58,kind:'teret',solid:true});busy.push([x0+len-300,x0+len]);},
  guslar(arg){const x0=x,len=ri(1100,1180);ground(len);traps.push({kind:'guslar',x:x0+Math.round(len*.4),y:gy,x0,x1:x0+len,mir:arg==='mir'});busy.push([x0,x0+len]);},
  gnezdo(){const x0=x,len=ri(920,980);ground(len);traps.push({kind:'gnezdo',x:x0+Math.round(len*.5),y:gy,x0,x1:x0+len});busy.push([x0,x0+len]);},
  svatovi(){const x0=x,len=ri(560,620);ground(len);traps.push({kind:'kavez',x:x0+Math.round(len*.55),y:gy,hp:4});busy.push([x0+len*.3,x0+len*.8]);},
  sator(){const x0=x,len=ri(700,780);ground(len);const tx=x0+Math.round(len*.62);traps.push({kind:'tent',x:tx,y:gy});busy.push([x0,x0+len]);spots.push({x:x0+150,y:gy});},
  // a wall with a low gap at its foot: too low to walk through — crouch (S) or slide (S while running) under it
  greda(){const x0=x,len=ri(620,700);ground(len);const wx=x0+Math.round(len*.45),ww=170;platforms.push({x:wx,y:gy-1300,w:ww,h:1300-72,kind:'lintel',solid:true,lintel:true});crate(wx+ww+150,'kovceg',{loot:{coins:ri(14,20)}});busy.push([x0,x0+len]);spots.push({x:x0+90,y:gy});},
  // a cracked slab over a hidden cellar: only a blow from above breaks it; a chest and a ladder wait below
  cellar(){const x0=x,len=ri(560,640);const cx=x0+Math.round(len*.5),w=130,deep=170;ground(cx-x0);run=null;x=cx+w;ground(x0+len-x);
   platforms.push({x:cx,y:gy,w,h:26,kind:'cracked',solid:true});block(cx-20,w+40,gy+deep,{cellar:true});ladders.push({x:cx+w-26,top:gy,bottom:gy+deep,side:1});
   crate(cx+40,'kovceg',{y:gy+deep,loot:{coins:ri(24,32)}});cellars.push({x:cx+w/2,y:gy+deep});busy.push([cx-60,cx+w+60]);spots.push({x:x0+len*.85,y:gy});},
  // a bed of stakes too wide to jump: fall on it with a blow from above and bounce off (like a pogo)
  spikebed(){const x0=x,len=ri(700,780);ground(len);const w=ri(300,330),sx=Math.round(x0+len*.5-w/2);traps.push({kind:'spikes',x:sx,w,y:gy,bed:true});busy.push([sx-60,sx+w+60]);},
  // a cliff with no ladder: pull the lever, step on the lift, ride it up
  lift(){ground(ri(320,380));const H=ri(290,330),cx=x,lx=cx-140;platforms.push({x:lx,y:gy,w:122,h:18,kind:'lift',base:gy,top:gy-H,state:'down',t:0});traps.push({kind:'lift',lever:{x:cx-270,y:gy},x:lx+61});busy.push([cx-330,cx+60]);cliff(-H);ground(ri(320,400));spots.push({x:x-150,y:gy});},
  // a raft carries Marko over dark water, back and forth
  ferry(){const w=ri(420,470),x0=x;busy.push([x-60,x+w+60]);platforms.push({x:x0+6,y:gy,w:176,h:18,kind:'raft',a:x0+6,b:x0+w-182,t:R()*6});x+=w;run=null;ground(ri(280,340));traps.push({kind:'water',x:x0,w,y:gy});},
  // ===== puzzles made by hand: once in a land Marko has to stop and think =====
  // three bells at three heights; the fresco by the road tells the order; rung right the gate opens, rung wrong the guard hears
  zvona(){const x0=x,len=900;ground(len);const B=[[x0+215,gy-140],[x0+450,gy-280],[x0+665,gy-140]];
   platforms.push({x:x0+150,y:gy-140,w:130,h:18,kind:'plank'},{x:x0+315,y:gy-210,w:100,h:18,kind:'plank'},{x:x0+395,y:gy-280,w:120,h:18,kind:'plank'},{x:x0+600,y:gy-140,w:130,h:18,kind:'plank'});
   const order=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(R()*(i+1));[order[i],order[j]]=[order[j],order[i]];}if(order.join()==='0,1,2')order.reverse();
   traps.push({kind:'bells',bells:B.map(([bx,by])=>({x:bx,y:by})),order,tablet:{x:x0+70,y:gy},gate:{x:x0+len-50,y:gy}});busy.push([x0,x0+len]);},
  // a shaft of sunlight and three bronze mirrors; strike a mirror to turn it; the beam must reach the crystal
  ogledala(){const x0=x,len=900;ground(len);const lo=gy-60,hi=gy-300;
   platforms.push({x:x0+300,y:gy-130,w:120,h:18,kind:'plank'},{x:x0+290,y:gy-245,w:150,h:18,kind:'plank'},{x:x0+590,y:gy-245,w:150,h:18,kind:'plank'},{x:x0+445,y:gy-190,w:90,h:18,kind:'plank'});
   traps.push({kind:'mirrors',src:{x:x0+30,y:lo},m:[{x:x0+260,y:lo,s:0},{x:x0+260,y:hi,s:0},{x:x0+560,y:hi,s:1}],target:{x:x0+560,y:gy},gate:{x:x0+len-50,y:gy}});busy.push([x0,x0+len]);},
  // two pans on one rope: weigh the left one down with the iron crate and the right one lifts Marko to the ledge
  teg(){const x0=x,base=gy-100;ground(600);block(x0+50,160,base,{});platforms.push({x:x0+90,y:base-76,w:76,h:76,kind:'teret',solid:true,push:true});
   const L={x:x0+215,y:base,w:120,h:18,kind:'pan',base,side:-1},P2={x:x0+455,y:base,w:120,h:18,kind:'pan',base,side:1};platforms.push(L,P2);
   const t=block(x,260,gy-305,{tower:true,ground:true});traps.push({kind:'scale',pans:[L,P2],pulley:{x:x0+395,y:gy-420}});busy.push([x0,x+260]);x+=260;gy=t.y;run=null;},
  // the fairy ring: fireflies light the stones in an order; step on them the same way and a bridge of light crosses the chasm
  kolo(){const x0=x,len=760;ground(len);const S=[0,1,2,3,4].map(i=>({x:x0+130+i*120,y:gy}));const order=[];while(order.length<4){const k=Math.floor(R()*5);if(k!==order[order.length-1])order.push(k);}
   const gx=x;x+=300;run=null;const bridge={x:gx-10,y:gy,w:320,h:18,kind:'plank',off:true,kolo:true};platforms.push(bridge);ground(ri(300,360));
   traps.push({kind:'kolo',stones:S,order,bridge,gap:{x0:gx,x1:gx+300}});busy.push([x0,gx+300]);},
  // an iron door no blow can break, a keg of powder, a brazier on the beam above: push, climb, knock it down — and stand clear
  barut(){const x0=x,len=900;ground(len);platforms.push({x:x0+560,y:gy-150,w:150,h:18,kind:'plank'},{x:x0+130,y:gy-62,w:56,h:62,kind:'teret',solid:true,push:true,keg:true});
   traps.push({kind:'powder',brazier:{x:x0+690,y:gy-150},gate:{x:x0+len-90,y:gy}});busy.push([x0,x0+len]);},
  boss(type){const x0=x,len=ri(1000,1080),g0=gy;ground(len);boss={type,x:Math.round(x0+len*.68),y:g0,gy:g0,x0,x1:x0+len};busy.push([x0,x0+len]);
   const plank=(k,dy,w=150)=>platforms.push({x:Math.round(x0+len*k-w/2),y:g0-dy,w,h:18,kind:'plank',arena:true});
   ({oklopnik(){for(const k of[.13,.87])block(x0+len*k-35,70,g0-95,{pillar:true});plank(.5,175);},   // he rams the pillars
     akindzija(){plank(.3,140);plank(.7,140);},                                                    // jump up as the rider passes
     palikuca(){plank(.2,120);plank(.5,195);plank(.8,120);},                                       // the floor burns, the planks do not
     shield(){const b=block(x0+len-250,250,g0-100,{});boss.flag={x:Math.round(b.x+150),y:b.y};plank(.45,150,130);},
     sword(){plank(.16,150);plank(.4,265,140);plank(.64,150);plank(.86,240,140);},
     arapin(){block(x0+len*.5,120,g0-115,{});block(x0+len*.64,120,g0-230,{});const t=block(x0+len-260,260,g0-345,{tower:true});Object.assign(boss,{x:Math.round(t.x+150),y:t.y,top:t.y,topX:Math.round(t.x+150)});},
     tufekdzija(){for(const k of[.3,.52])block(x0+len*k,64,g0-72,{pillar:true});const dx=Math.round(x0+len-170),top=g0-255;platforms.push({x:dx-90,y:top,w:180,h:18,kind:'deck'});ladders.push({x:dx-70,top,bottom:g0,side:0});towers.push({kind:'watch',x:dx,top,base:g0});Object.assign(boss,{x:dx+20,y:top,deck:top,deckX:dx+20});},
     lovac(){plank(.35,150);plank(.65,150);},
     azdaja(){block(x0+len*.2,70,g0-110,{pillar:true});block(x0+len*.45,70,g0-110,{pillar:true});plank(.32,170,130);plank(.68,175,170);boss.x=Math.round(x0+len*.8);},   // stones for cover, planks up to her head
     dzelat(){plank(.25,140);plank(.5,140);plank(.75,140);plank(.38,260,120);plank(.62,260,120);},   // he splits the planks with his axe
     djemo(){plank(.3,150);plank(.7,150);},
     trio(){plank(.5,160,170);},
     kopljanik(){plank(.35,150);plank(.65,150);}})[type]?.();},
 };
 ground(ri(600,680));const spawn={x:80,y:590};
 for(const name of(RECIPES[L.id]||'flat crates stairs+ watch flat stairs- ledges flat tower flat').split(' ')){const [r,arg]=name.split(':');room[r]?.(arg);}
 if(!boss)room.arena();const x0=x;ground(520);const goal={x:x0+380,y:gy};const width=x;
 // the best reward hides the land's marvel, the others become chests
 rewards.sort((a,b)=>b.prio-a.prio);const cudo=CUDA.find(c=>c.land===L.id);
 rewards.forEach((r,i)=>{if(i===0&&cudo)r.cudo=cudo.id;else crate(r.x,'kovceg',{y:r.y,loot:{coins:ri(14,22)}});});
 if(cudo&&!rewards.length)rewards.push({x:goal.x-260,y:goal.y,cudo:cudo.id});
 // each vault: a vaulted room high above the land, reached through the gate the plate opens
 const top=Math.min(...platforms.map(q=>q.y));vaults.forEach((v,k)=>{const vy=top-760-k*560,x0=Math.round(v.door.x-300),w=600;Object.assign(v,{x0,w,y:vy});
  platforms.push({x:x0-90,y:vy,w:w+180,h:140,kind:'stone',solid:true,vault:true},{x:x0-90,y:vy-420,w:90,h:420,kind:'stone',solid:true,vault:true},{x:x0+w,y:vy-420,w:90,h:420,kind:'stone',solid:true,vault:true});
  let bx=x0+190;for(const kind of['cup','kovceg','cup','kovceg','korpa'])bx+=crate(bx,kind,{y:vy,loot:kind==='kovceg'?{coins:ri(16,24)}:{coins:ri(3,7)}})+ri(26,44);});
 // places worth reaching: the five letters М-А-Р-К-О and a power orb go to the best of them along the road
 const cands=[],grounds=platforms.filter(q=>q.ground).sort((a,b)=>a.x-b.x),taken=r=>rewards.some(o=>Math.abs(o.x-r.x)<90&&Math.abs(o.y-r.y)<90);
 for(const q of platforms){if(q.kind==='plank'&&!q.bridge)cands.push({x:q.x+q.w/2,y:q.y-44,s:2});else if(q.kind==='deck')cands.push({x:q.x+q.w*.75,y:q.y-44,s:2});else if(q.hang)cands.push({x:q.x+q.w/2,y:q.y-44,s:3});else if(q.tower&&!q.ground)cands.push({x:q.x+q.w*.75,y:q.y-44,s:2});else if(q.pillar)cands.push({x:q.x+q.w/2,y:q.y-80,s:1});}
 for(const t of traps)if(t.kind==='spikes')cands.push({x:t.x+t.w/2,y:t.y-(t.bed?230:150),s:t.bed?3:2});for(const c of cellars)cands.push({x:c.x+30,y:c.y-44,s:3});
 for(let i=1;i<grounds.length;i++){const a=grounds[i-1],b=grounds[i],g=b.x-(a.x+a.w);if(g>60&&Math.abs(a.y-b.y)<30)cands.push({x:a.x+a.w+g/2,y:Math.min(a.y,b.y)-140,s:2});}
 for(let cx=700;cx<goal.x-300;cx+=650){const q=grounds.find(q=>cx>q.x+30&&cx<q.x+q.w-30);if(q)cands.push({x:cx,y:q.y-175,s:1});}
 const end=boss?boss.x0:goal.x-150,free=cands.filter(c=>!taken(c)&&c.x>500&&c.x<end),letters=[];
 for(let i=0;i<5;i++){const a=500+(end-500)*i/5,b=500+(end-500)*(i+1)/5,bin=free.filter(c=>c.x>=a&&c.x<b).sort((u,v)=>v.s-u.s||u.x-v.x);const c=bin[Math.floor(R()*Math.min(2,bin.length))];if(c){letters.push({...c,i});free.splice(free.indexOf(c),1);}}
 const mid=free.filter(c=>c.x>end*.35&&c.x<end*.75).sort((u,v)=>v.s-u.s)[0];
 // the heart piece hides in the first treasury (or the cellar, or the hardest place left); the scroll waits on the way
 const hv=vaults[0],rest=free.filter(c=>c!==mid).sort((u,v)=>v.s-u.s||v.x-u.x);
 const heart=hv?{x:hv.x0+hv.w-110,y:hv.y-44}:cellars[0]?{x:cellars[0].x-40,y:cellars[0].y-44}:rest[0]||null;
 const zapis=rest.filter(c=>c!==heart&&c.x<end*.6).sort((u,v)=>v.s-u.s||u.x-v.x)[0]||rest.find(c=>c!==heart)||null;
 return{platforms,ladders,breakables,spots,rewards,towers,busy,plows,traps,vaults,letters,heart,zapis,power:mid||null,boss,spawn,goal,width,y0:Math.min(...platforms.map(q=>q.y)),pitY:Math.max(...platforms.filter(q=>q.ground).map(q=>q.y))+300};
}
export const EXTRA_LEVELS=[{id:'oranje',name:'Oranje drumova',width:7000,spawn:{x:80,y:590},goal:{x:6860,y:590},palette:'letnje podne nad Prilepom',
 layers:[{id:'oranje-sky',speed:.04},{id:'oranje-far',speed:.16},{id:'oranje-mid',speed:.38},{id:'oranje-near',speed:.72}],
 fallbackLayers:[{id:'selo-sky',speed:.04},{id:'selo-far',speed:.16},{id:'selo-mid',speed:.38},{id:'selo-near',speed:.72}],ground:'selo',
 props:[{id:'prop-plast-sena',x:700,y:590,height:150},{id:'prop-kruska',x:1500,y:590,height:300},{id:'prop-medjas',x:2100,y:590,height:70},{id:'prop-kola-seno',x:2700,y:590,height:170},{id:'prop-krst-raskrsce',x:3400,y:590,height:190},{id:'prop-turski-sator',x:4100,y:590,height:200},{id:'prop-plast-sena',x:4800,y:590,height:150},{id:'prop-kruska',x:5500,y:590,height:300},{id:'prop-taraba-ravna',x:6000,y:590,height:140}],
 design:{goal:'Zaustavi turska rala i uzmi tri tovara blaga'}}];
export function makeLevel(L,index,variant='day',opts={}){
 const zone=LEVEL_ZONE+index,B=buildLayout(L,variant),enemies=[],items=[],platforms=B.platforms;
 const mix=L.design?.enemyMix,base=THEME_FOES[L.id]||(mix?.length?(mix.includes('sword')?mix:[...mix,'sword']):['sword','archer','akindzija']);
 const pool=[...base,...(opts.extraFoes||[]).filter(t=>!base.includes(t)&&t!=='tufekdzija')];
 const floorAt=x=>{let best=null;for(const q of platforms)if(q.ground&&x>q.x+40&&x<q.x+q.w-40&&(!best||q.y<best.y))best=q;return best;};
 const foe=(type,x,y,o={})=>{const hp=FOE_HP[type]??90;enemies.push({id:5000+index*100+enemies.length,x:Math.round(x),y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type,zone,face:-1,mode:'idle',timer:.5+(enemies.length%4)*.23,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:true,...o});};
 let k=0,lastX=-1e9;for(const s of B.spots.sort((a,b)=>a.x-b.x)){if(Math.abs(s.x-B.spawn.x)<480)continue;
  if(s.perch){foe(opts.extraFoes?.includes('tufekdzija')&&k%3===2?'tufekdzija':'archer',s.x,s.y,{perch:true});k++;continue;}
  if(s.x-lastX<330)continue;lastX=s.x;const type=pool[k%pool.length];foe(type,s.x,s.y);
  if(variant==='storm'&&k%2===0){const t2=pool[(k+1)%pool.length];foe(t2,s.x+85,s.y);}k++;}
 for(const t of B.traps)if(t.kind==='top')foe('palikuca',t.x+80,t.y,{gunner:true});
 // the Arab's men guard each cage of wedding guests
 // the fire-raisers setting the eagle's beech alight
 for(const t of B.traps)if(t.kind==='gnezdo'){foe('palikuca',t.x-130,t.y,{gnezdo:true});foe('palikuca',t.x+140,t.y,{gnezdo:true});foe('sword',t.x+320,t.y,{gnezdo:true});}
 for(const t of B.traps)if(t.kind==='kavez'){foe('sword',t.x-170,t.y);foe(pool.includes('shield')?'shield':'sword',t.x+170,t.y);}
 let j=0;for(let x=900;x<B.width-300;x+=1300){const q=floorAt(x);if(q)items.push({id:7000+index*50+j,x,y:q.y-35,type:j%2?'herb':'wine',taken:false});j++;}
 // the eagle's feather is hers to give: it waits in its hiding place only if her nest burns
 for(const r of B.rewards){if(!r.cudo||r.cudo==='oceva-sablja')continue;const nest=r.cudo==='orlovo-pero'&&B.traps.find(t=>t.kind==='gnezdo');if(nest){nest.pero={x:r.x,y:r.y-46};continue;}items.push({id:7040+index,x:r.x,y:r.y-46,type:'cudo',cudo:r.cudo,taken:false});}
 // "Marko Kraljević poznaje očinu sablju": in the Turkish camp a young Turk wears Marko's father's sabre
 if(L.id==='tvrdjava'){const t=B.traps.find(t=>t.kind==='tent')||{x:B.width*.55,y:590};const q=floorAt(t.x+150);if(q)foe('sword',t.x+150,q.y,{look:'mladi-turcin',hp:560,maxHp:560,sablja:true,scale:1.06});}
 for(const c of B.letters)items.push({id:7060+index*10+c.i,x:Math.round(c.x),y:Math.round(c.y),type:'slovo',i:c.i,taken:false});
 const powerIds=Object.keys(POWERS);if(B.power)items.push({id:7055+index,x:Math.round(B.power.x),y:Math.round(B.power.y),type:'moc',power:powerIds[index%3],taken:false});
 if(B.heart)items.push({id:7600+index*2,x:Math.round(B.heart.x),y:Math.round(B.heart.y),type:'srce',land:L.id,taken:false});
 if(B.zapis)items.push({id:7601+index*2,x:Math.round(B.zapis.x),y:Math.round(B.zapis.y),type:'zapis',land:L.id,taken:false});
 // the keeper of each treasury key: the nearest foe, a little tougher
 for(const t of B.traps){if(t.kind!=='keydoor')continue;let h=enemies.filter(e=>!e.perch&&!e.champion&&!e.keyHolder&&e.type!=='pas'&&Math.abs(e.x-t.keeper.x)<380).sort((a,b)=>Math.abs(a.x-t.keeper.x)-Math.abs(b.x-t.keeper.x))[0];
  if(!h){const q=floorAt(t.keeper.x);foe(pool.find(k=>k!=='pas')||'sword',t.keeper.x,q?q.y:t.y);h=enemies[enemies.length-1];}h.keyHolder=true;h.hp=h.maxHp=Math.round(h.maxHp*1.4);t.holder=h.id;}
 if(B.boss?.type==='trio'){const A=B.boss,S=BOSSES.trio;for(const dx of[-130,130])foe('sword',A.x+dx,A.y,{trioMate:true,elite:true,scale:S.scale,hp:S.hp,maxHp:S.hp,w:44,h:90});}
 if(B.boss){const S=BOSSES[B.boss.type],A=B.boss;foe(S.type||A.type,A.x,A.y,{champion:true,scale:S.scale??1.35,hp:S.hp,maxHp:S.hp,name:S.name,kit:S.kit,look:S.look,w:50,h:100,arena:{x0:A.x0,x1:A.x1,y:A.gy,flag:A.flag,top:A.top,topX:A.topX,deck:A.deck,deckX:A.deckX}});}
 // the artist's props stand on the new road; props that would sit on stairs, towers or shafts are left out
 const sx=B.width/(L.width||6240),props=[];for(const pr of L.props||[]){if(pr.id.startsWith('prop-barjak-srpski'))continue;const x=pr.x*sx,q=floorAt(x);if(!q||B.busy.some(([a,b])=>x>a-60&&x<b+60))continue;props.push({...pr,x,y:q.y});}
 props.push({id:'prop-barjak-srpski',x:B.spawn.x+90,y:B.spawn.y,height:175},{id:'prop-barjak-srpski',x:B.goal.x,y:B.goal.y,height:175});
 const L2={...L,width:B.width,spawn:B.spawn,goal:B.goal,props};
 chapters[zone]={name:`POHOD ${index+1} · ${L.name.toUpperCase()}${variant==='night'?' · NOĆ':variant==='storm'?' · OLUJA':''}`,start:0,end:B.width,goal:goalFinish(L),message:''};
 const goals=makeGoals(L2,x=>B.busy.some(([a,b])=>x>a-80&&x<b+80)?null:floorAt(x));
 // nothing breakable stands inside a gate's passage
 for(const g of goals)if(g.kind==='gate')for(let i=B.breakables.length-1;i>=0;i--)if(Math.abs(B.breakables[i].x-g.x)<140)B.breakables.splice(i,1);
 // a guarded gate always has its guards
 for(const g of goals)if(g.guarded){const near=enemies.filter(e=>e.x>g.x-1100&&e.x<g.x+220&&!e.perch).length;for(let n=near,dx=260;n<2;n++,dx+=220){const q=floorAt(g.x-dx);if(q)foe(pool[n%pool.length],g.x-dx,q.y);}}
 return{platforms,enemies,items,runes:[],barriers:[],goals,level:L2,ladders:B.ladders,breakables:B.breakables,towers:B.towers,plows:B.plows,traps:B.traps,cannons:B.traps.filter(t=>t.kind==='top'),guns:B.traps.filter(t=>t.kind==='topnica'),vaults:B.vaults,y0:B.y0,pitY:B.pitY,busy:B.busy};
}
