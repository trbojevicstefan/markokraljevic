export const W=1280,H=720,GRAVITY=1750;
export const chapters=[
 {name:'I · DRUM JUNAKA',start:0,end:3200,goal:'Oslobodi drum od osmanske straže',message:'Marko, odred je zatvorio drum. Prati naše crvene barjake. Space za skok; J za topuz.'},
 {name:'II · ZATOČENA KAPIJA',start:3200,end:7000,goal:'Porazi čuvare i oslobodi putnike',message:'Štit ne popušta pred lakim udarcem. K razbija gard. L odbija napad u pravom trenutku.'},
 {name:'III · VILINSKI TRAG',start:7000,end:10800,goal:'Probudi tri vilinska kamena · E',message:'Priđi svetlećim kamenovima i pritisni E. Otvoriću ti put. U vazduhu te mogu podići još jednom.'},
 {name:'IV · ŠARČEV ZALET',start:10800,end:24500,goal:'Uzjaši Šarca · E · preskoči srušeni drum',message:'Šarac te čeka! Priđi mu i pritisni E. Drži D za galop, Space za skok. Zlatni trag najavljuje ponor.'},
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
 [650,1280,1640,2210,2640,2880].forEach((x,i)=>enemy(x,['sword','sword','archer'][i%3]));
 floor(3200,3800);[3550,3890,4230,4610,4980,5260,5590,5940,6300,6650].forEach((x,i)=>enemy(x,['shield','sword','archer','sword'][i%4]));
 [3800,4900,5950].forEach(x=>floor(x,160,460));
 floor(7000,700);floor(7940,820);floor(8900,800);floor(9940,860);
 [7580,8540,9580].forEach((x,i)=>{runes.push({x,y:590,active:false,id:i});platforms.push({x:x+120,y:575,w:240,h:30,kind:'magic',rune:i});});
 floor(7400,100,475);floor(8270,130,465);floor(9320,130,475);floor(10250,150,465);
 [8180,9200,10300].forEach(x=>enemy(x,'archer'));
 let x=10800;while(x<24500){const len=Math.min(900+((x*13)%300),24500-x);floor(x,len);if(x+len>=24500)break;barriers.push({x:x+len-310,y:590,w:45,h:65,horse:true});x+=len+190;}floor(24300,200);
 floor(24500,3500);[[2050,'akindzija'],[4400,'oklopnik'],[5750,'palikuca'],[8600,'akindzija'],[9300,'palikuca'],[25350,'oklopnik'],[26700,'palikuca'],[27450,'akindzija']].forEach(([x,t])=>enemy(x,t));[24840,25180,25530,25910,26200,26540,26880,27240,27600].forEach((x,i)=>enemy(x,['sword','shield','archer'][i%3]));
 [25250,26450,27350].forEach(x=>floor(x,150,465));floor(28000,1900);
 [450,1500,2600,3400,4450,5400,6500,7150,8400,10100,11100,15600,20500,24700,25800,27000,28200].forEach((x,i)=>items.push({id:i,x,y:555,type:i%3===0?'wine':'herb',taken:false}));
 [[1600,430],[8350,430],[27400,430]].forEach(([x,y],i)=>items.push({id:100+i,x,y,type:'relic',taken:false}));
 return {platforms,enemies,items,runes,barriers};
}
export function integrate(body,dt,platforms,runes=[]){
 const old=body.y;body.vy+=GRAVITY*dt;body.x+=body.vx*dt;body.y+=body.vy*dt;body.grounded=false;
 if(body.vy>=0){for(const p of platforms){if(p.kind==='magic'&&!runes[p.rune]?.active)continue;if(body.x+body.w/2>p.x&&body.x-body.w/2<p.x+p.w&&old<=p.y+2&&body.y>=p.y){body.y=p.y;body.vy=0;body.grounded=true;break;}}}
}

// ---------- campaigns ("pohodi") built from art/world-pack-*/levels.json ----------
const THEME_FOES={selo:['sword','archer','sword','akindzija'],klisura:['sword','archer','akindzija','palikuca','shield'],suma:['archer','akindzija','sword','palikuca'],manastir:['shield','sword','oklopnik','archer'],tvrdjava:['oklopnik','palikuca','shield','archer','akindzija'],prevoj:['akindzija','oklopnik','sword','archer','shield','palikuca']};
export const LEVEL_ZONE=6;
export function makeLevel(L,index,variant='day'){
 const zone=LEVEL_ZONE+index,platforms=L.platforms.map(q=>({x:q.x,y:q.y,w:q.w,h:q.h||150,kind:'stone'})),enemies=[],items=[];
 const mix=L.design?.enemyMix,pool=THEME_FOES[L.id]||(mix?.length?(mix.includes('sword')?mix:[...mix,'sword']):['sword','archer']),floorAt=x=>platforms.find(q=>(q.y>=585||q.h>=150)&&x>q.x+40&&x<q.x+q.w-40),ground=x=>!!floorAt(x);
 let k=0;const gap=470;for(let x=620;x<L.width-260;x+=gap){const xx=x+((k*137)%120)-60;if(!ground(xx)||Math.abs(xx-L.spawn.x)<420)continue;const type=pool[k%pool.length],hp=FOE_HP[type]??90;enemies.push({id:5000+index*100+k,x:xx,y:floorAt(xx).y,w:36,h:75,hp,maxHp:hp,type,zone,face:-1,mode:'idle',timer:.5+(k%4)*.23,stun:0,flash:0,alive:true,home:xx,attackId:0});const px=xx+85;if(variant==='storm'&&k%2===0&&floorAt(px)===floorAt(xx)){const t2=pool[(k+1)%pool.length],h2=FOE_HP[t2]??90;enemies.push({id:5050+index*100+k,x:px,y:floorAt(px).y,w:36,h:75,hp:h2,maxHp:h2,type:t2,zone,face:-1,mode:'idle',timer:.8+(k%3)*.2,stun:0,flash:0,alive:true,home:px,attackId:0});}k++;}
 let j=0;for(let x=900;x<L.width-300;x+=1300){if(ground(x))items.push({id:7000+index*50+j,x,y:floorAt(x).y-35,type:j%2?'herb':'wine',taken:false});j++;}
 const high=platforms.filter(q=>q.y<585).sort((a,b)=>a.y-b.y)[0];if(high)items.push({id:7045+index,x:high.x+high.w/2,y:high.y-35,type:'relic',taken:false});
 chapters[zone]={name:`POHOD ${index+1} · ${L.name.toUpperCase()}${variant==='night'?' · NOĆ':variant==='storm'?' · OLUJA':''}`,start:0,end:L.width,goal:'Stigni do barjaka na kraju puta',message:''};
 return{platforms,enemies,items,runes:[],barriers:[],level:L};
}
