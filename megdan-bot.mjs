// A bot fights every champion with real input, by the rules of the megdan: node megdan-bot.mjs
// It is not a test of skill but a check that each fight can be won the intended way and roughly how long it takes:
// wait for an opening (his missed swing, a stun, his kit's moment), wear the guard down with heavy blows, slip the grab.
// The bot has one way of fighting and no tricks for single champions: it does not climb to the banner or the towers, does
// not parry a horseman and does not roll. A champion it cannot beat is not thereby unbeatable (battles-test checks each
// champion's own mechanics); what its numbers do show is how long plain fights last and how often Marko is grappled.
// It reports, per champion: seconds to win, how often Marko fell (he is stood up again at once), guard breaks, grapples.
import fs from 'node:fs/promises';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},textContent:'',innerHTML:'',firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){},querySelector(){return null;}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// the powers of the road (shrines, marko-moci) are all found, unless a test takes them away
storage.set('marko-moci',JSON.stringify(['trag','kombo','potres','oko','krilo','lanac','nalet','gaz','zidotrk']));
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS,topAt,greybox}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,SKILLS,state:()=>({p,world,mode,level,arena,grapple})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
const S=()=>api.state(),step=()=>api.update(1/120);
const rows=[];
for(const [li,L] of api.LEVELS.entries()){
 // the bot knows what a player knows by then: the skills of the pohodi before this one
 const order=api.LEVELS.map(l=>l.id);storage.set('marko-skills',JSON.stringify(api.SKILLS.filter(k=>order.indexOf(k.land)<li).map(k=>k.id)));
 await api.startLevel(li,'day');const w=S().world,c=w.enemies.find(e=>e.champion);if(!c)continue;
 for(const e of w.enemies)if(e!==c&&!e.trioMate)e.alive=false;
 const q=w.platforms.filter(q=>q.ground&&c.arena.x0+150>q.x&&c.arena.x0+150<q.x+q.w).sort((a,b)=>a.y-b.y)[0];Object.assign(S().p,{x:c.arena.x0+150,y:q.y,vx:0,vy:0,grounded:true});
 let t=0,falls=0,breaks=0,grabs=0,wasBroken=false,wasPinned=false,hold=0,mash=0;const p=S().p,foes=()=>w.enemies.filter(e=>e.alive&&(e===c||e.trioMate||e.x>c.arena.x0-100&&e.x<c.arena.x1+100));
 while(t<420&&foes().length){t+=1/120;api.keys.clear();
  if(S().mode!=='play')break;
  if(p.hp<70){p.hp=p.maxHp;falls++;}                         // a fall: counted, and the fight goes on
  const tg=foes().sort((a,b)=>(a===c)-(b===c)||Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0],dx=tg.x-p.x,d=Math.abs(dx),dir=Math.sign(dx)||1;
  const broken=c.guardBroken>0;if(broken&&!wasBroken)breaks++;wasBroken=broken;if(p.pinned&&!wasPinned)grabs++;wasPinned=!!p.pinned;
  if(p.pinned){if(++mash%6===0)api.pressed.add('KeyJ');step();continue;}
  // his mace on the ground (Đemo): go and get it, jumping over him
  if(p.noMace&&c.topuz){const tx=c.topuz.x-p.x;api.keys.add(tx>0?'KeyD':'KeyA');if(p.grounded&&Math.abs(c.x-p.x)<170&&Math.sign(c.x-p.x)===Math.sign(tx))api.pressed.add('Space');step();continue;}
  const danger=c.gs||c.ks==='ram'||c.ks==='prep'||c.ks==='chop'||c.as==='slam'||c.as==='combo'||(c.mace&&Math.abs(c.mace.x-p.x)<170)||(w.drops||[]).some(o=>o.t>0&&o.t<.5&&Math.abs(o.x-p.x)<60);
  const open=tg.stun>0||tg.guardBroken>0||tg.kitOpen>0||tg.mode==='recover'||tg!==c||(tg.kit==='djemo'&&tg.mace)||(tg.kit==='beg'&&tg.mounted&&tg.ks==='turn');
  if(danger&&!open){if(p.grounded&&(c.gs==='lunge'||c.ks==='ram'||c.as||c.mace||d<140))api.pressed.add('Space');api.keys.add(d<260?(dir>0?'KeyA':'KeyD'):'');hold=0;step();continue;}
  if(d>92){api.keys.add(dir>0?'KeyD':'KeyA');if(p.grounded&&tg.y<p.y-60&&d<200)api.pressed.add('Space');hold=0;}
  else{p.face=dir;if(open){if(p.attack<=0&&(p.cooldown||0)<=0)api.pressed.add('KeyJ');hold=0;}
   else if(hold<95){if(hold===0)api.pressed.add('KeyK');api.keys.add('KeyK');hold++;}else hold=0;}
  step();}
 rows.push({pohod:L.id,megdan:c.name,pobeda:!foes().length,sekundi:Math.round(t),padovi:falls,gard:breaks,kostac:grabs,snaga:Math.round(c.maxHp),ostalo:Math.round(Math.max(0,c.hp)/c.maxHp*100)+'%',kraj:S().mode,cin:c.act||1});}
console.table(rows);
const lost=rows.filter(r=>!r.pobeda);if(lost.length){console.log('NOT WON:',lost.map(r=>r.megdan).join(', '));process.exitCode=1;}
