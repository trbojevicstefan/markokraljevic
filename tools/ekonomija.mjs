// Ekonomija igre: koliko dukata daje svako poglavlje i koliko košta sve što se kupuje. node tools/ekonomija.mjs
// Broji ono što stoji u nivou kad počne: protivnike (obični, elitni), plen u kovčezima, buradima i riznicama, slova i nagrade
// scena (po vrsti zamke). Ne broji nizove udaraca i slučajni plen, pa je stvarni prihod malo veći.
import fs from 'node:fs/promises';
{let s=1;Math.random=()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^s>>>15,1|s);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296;};}
import * as physics from '../dist/world.js';
process.chdir(decodeURIComponent(new URL('..', import.meta.url).pathname).replace(/^\/([A-Z]:)/, '$1'));
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{ok:true,json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,LEVELS,JOURNEY,SMITH,DUCAN,AMAJLIJE,EKON:typeof EKON!=="undefined"?EKON:null,RANK:typeof RANK_COST!=="undefined"?{cost:RANK_COST,n:Object.keys(RANK_FX).length}:null,state:()=>({p,world})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>0,fetchFile);
// nagrade scena (dukati koje kod daje kad se scena završi), po vrsti zamke; ključ je t.kind
const SCENA={kavez:10,sator:12,top:8,guslar:40,orlovi:20,soko:8,vino:8,mehana:40,okovi:100,varadin:25,vila:25,pobratim:60,pogled:30,crkva:30,podrum:100,lov:30,horda:20};
const lv=id=>api.LEVELS.find(L=>L.id===id);
const rows=[];let total=0;
for(const id of api.JOURNEY){const i=api.LEVELS.findIndex(L=>L.id===id);if(i<0)continue;await api.startLevel(i);const {world}=api.state();
 const foes=(world.enemies||[]).filter(e=>!e.champion),elite=foes.filter(e=>e.elite).length,champ=(world.enemies||[]).filter(e=>e.champion).length;
 const kill=api.EKON?api.EKON.kill:2,killE=api.EKON?api.EKON.elite:6;
 const kills=(foes.length-elite)*kill+elite*killE;
 const plen=api.EKON?api.EKON.plen:1,loot=Math.round((world.breakables||[]).reduce((a,b)=>a+(b.loot?.coins||0),0)*plen);
 const kinds={};for(const t of world.traps||[])kinds[t.kind]=(kinds[t.kind]||0)+1;
 const scene=Object.entries(kinds).reduce((a,[k,n])=>a+(SCENA[k]||0)*(k==='top'?n:1),0);
 const slova=api.EKON?api.EKON.slova:40,sum=kills+loot+scene+slova+(champ?30:0);total+=sum;
 rows.push({id,foes:foes.length,elite,champ,kills,loot,scene,sum,total});}
console.table(rows);
const smith=api.SMITH.reduce((a,u)=>a+u.cost.reduce((x,y)=>x+y,0),0),am=api.AMAJLIJE.reduce((a,x)=>a+x.cost,0);
const pohod=api.DUCAN.reduce((a,d)=>a+d.cost,0);
console.log(`Cela priča daje oko ${total} dukata (bez nizova i slučajnog plena).`);
console.log(`Kovač i zadužbine: ${smith}; sve amajlije: ${am}; prodavac jednom svega po jedno: ${pohod} (po poglavlju).`);
const rang=api.RANK?api.RANK.cost.reduce((a,b)=>a+b,0)*api.RANK.n:0;
console.log(`Stepeni veština: ${rang}.`);
console.log(`Sve trajno (kovač + amajlije + stepeni): ${smith+am+rang} = ${Math.round((smith+am+rang)/total*100)} % prihoda.`);
