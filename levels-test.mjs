// Plays every campaign's goals headlessly: node levels-test.mjs
// Checks that the end banner stays locked until the goals are done, gates block the road, and each goal can be completed.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import * as physics from './dist/world.js';
const nodes=new Map();const node=id=>{if(!nodes.has(id))nodes.set(id,{hidden:false,value:'normal',checked:false,style:{},firstElementChild:{style:{}},classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return{};},addEventListener(){}});return nodes.get(id);};
const document={getElementById:node,querySelectorAll:()=>[],addEventListener(){},activeElement:{tagName:'BODY'}};
const storage=new Map();const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const window={addEventListener(){}};
class Image{set src(v){queueMicrotask(()=>this.onload());}}
const fetchFile=async url=>{const text=await fs.readFile('dist/'+url,'utf8');return{json:async()=>JSON.parse(text)};};
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {presuda,startLevel,update,keys,pressed,LEVELS,breakPlow,levelOpen,has,state:()=>({p,world,mode,level,arrows,ckptFlags})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
assert(api.LEVELS.length>=12,'all campaigns load');
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const stand=(x,y)=>{const {p}=api.state();p.x=x;p.y=y;p.vy=0;p.vx=0;p.hp=p.maxHp;};
let total=0;
for(let i=0;i<api.LEVELS.length;i++){
 await api.startLevel(i,'day');const {world,level:L}=api.state();
 assert.equal(api.state().mode,'play',`${L.id}: level starts`);
 const tasks=world.goals.filter(g=>!g.done);total+=tasks.length;
 // the banner must wait while anything is left
 if(tasks.length){stand(L.goal.x-40,L.goal.y);step();assert.equal(api.state().mode,'play',`${L.id}: banner locked until goals are done`);}
 for(const g of world.goals){
  if(g.done)continue;
  if(g.kind==='gate'){
   assert(!world.breakables.some(b=>Math.abs(b.x-g.x)<140),`${L.id}: the gate's passage is clear of crates and jars`);
   stand(g.x-10,g.y);step();assert(api.state().p.x<=g.x-33,`${L.id}: closed gate blocks the road`);
   for(const e of world.enemies)if(e.alive&&e.x>g.x-1100&&e.x<g.x+220)e.alive=false;
   step();assert(g.done,`${L.id}: gate opens once everything before it is done`);
  }else if(g.kind==='use'){
   for(const e of world.enemies)if(e.alive&&Math.abs(e.x-g.x)<1100)e.alive=false;step();
   stand(g.x-50,g.y);Object.assign(api.state().p,{down:0,pinned:false,invuln:99});api.pressed.add('KeyE');step();api.pressed.clear();assert(g.done,`${L.id}: E completes ${g.off}`);step(80);
  }else if(g.kind==='plow'){
   api.breakPlow(g.plow);const t=world.items.find(it=>it.type==='tovar'&&it.plow===g.plow);assert(t,`${L.id}: a broken plow drops its treasure`);
   stand(t.x,t.y+30);step();step();assert(g.done,`${L.id}: taking the treasure completes the plow goal`);
  }else if(g.kind==='take'){
   stand(g.x,g.y);step();assert(g.done,`${L.id}: walking over ${g.off} takes it`);
  }
 }
 for(const e of world.enemies)e.alive=false;
 if(api.state().mode==='shop')api.presuda(3); // the monastery asks whose the empire is: Uroš's
 stand(L.goal.x-40,L.goal.y);step();
 // Urvina ends at the well on the top, not at a banner (battles-test walks the song step by step)
 if(world.traps.some(t=>t.kind==='vrh')){assert.equal(api.state().mode,'play',`${L.id}: the road does not end before the well`);console.log(`PASS ${L.id}: ends at the well`);continue;}
 if(api.state().mode!=='levelDone')console.log('DEBUG',L.id,'p',Math.round(api.state().p.x),api.state().p.y,'goal',L.goal,'pending',JSON.stringify(api.state().world.goals.filter(g=>!g.done).map(g=>[g.kind,g.label,Math.round(g.x)])));
 assert.equal(api.state().mode,'levelDone',`${L.id}: banner completes the level`);
 console.log(`PASS ${L.id}: ${tasks.length} goals`);
}
console.log(`PASS all ${api.LEVELS.length} campaigns, ${total} goals`);

// ===== Azačka kula: the climb is made with Marko's own moves, by real input, piece by piece and then in one run =====
{const S=()=>api.state(),press=k=>{api.keys.add(k);api.pressed.add(k);},tap=k=>{press(k);step();api.keys.delete(k);};
 let n=0;const ok=(c,msg)=>{assert(c,'azak: '+msg);n++;};
 const i=api.LEVELS.findIndex(L=>L.id==='azak');ok(i>=0,'the tower is among the pohodi');
 storage.clear();ok(api.levelOpen(i),'it opens from the menu on a fresh save, outside the journey');
 const start=async()=>{await api.startLevel(i,'day');api.keys.clear();api.pressed.clear();const w=S().world;for(const e of w.enemies)e.alive=false;return w;};
 const put=(x,y,o={})=>Object.assign(S().p,{x,y,vx:0,vy:0,grounded:true,on:null,climb:null,wall:0,ledgeT:0,ledge:null,hang:false,attack:0,cooldown:0,invuln:99,hp:S().p.maxHp,down:0,dash:0,dashCooldown:0,face:1,energy:100,castLock:0,airLift:false},o);
 let w=await start();const L=S().level;
 ok(['zid','kolut','nadole','uzlet','kontra'].every(k=>api.has(k)),'Marko knows every move in it, as in the dream');
 for(const [what,list] of [['foe',w.enemies],['item',w.items],['breakable',w.breakables]])ok(new Set(list.map(o=>o.id)).size===list.length,`${what} ids are unique`);
 ok(w.traps.find(t=>t.kind==='guslar')?.stih?.[0]===L.stih[0],'the guslar at the start sings the falcon from the song');
 const champ=w.enemies.find(e=>e.champion);ok(champ?.kit==='arapin','the Arab waits on top of his tower at the end');
 const JUMP=126,EDGE=266;   // from game.js: a jump rises 126 px; hands catch an edge up to 266 px over the feet
 // 1. the shaft: too tall to jump or catch, climbed wall to wall
 const a=w.platforms.find(q=>q.hang),b=w.platforms.filter(q=>q.solid&&q.x>a.x+a.w&&q.x-(a.x+a.w)<200).sort((u,v)=>u.x-v.x)[0];
 {const floor=w.platforms.filter(q=>q.ground&&!q.tower&&q.x<a.x&&q.x+q.w>b.x)[0];ok(floor.y-b.y>EDGE,'the shaft is too tall for a jump and an edge');
  put(a.x+a.w+(b.x-a.x-a.w)/2,floor.y);let dir=1,jumps=0;
  for(let k=0;k<120*12;k++){const p=S().p;api.keys.delete(dir>0?'KeyA':'KeyD');api.keys.add(dir>0?'KeyD':'KeyA');
   if(p.hang){tap('KeyW');continue;}if(p.grounded&&p.y>b.y+20){tap('Space');continue;}if(p.wall){dir=-p.wall;tap('Space');jumps++;continue;}
   step();if(S().p.grounded&&S().p.y<=b.y+2)break;}
  api.keys.clear();ok(S().p.grounded&&S().p.on===b&&jumps>=3,`the shaft climbs ${floor.y-b.y}px wall to wall (${jumps} wall jumps)`);}
 // 2. pillars over the abyss: each a little higher than a jump, caught by the edge; then down to the far bank
 const pad=w.platforms.find(q=>q.ground&&q.x===b.x+b.w),bank=w.platforms.filter(q=>q.ground&&q.x>pad.x+pad.w).sort((u,v)=>u.x-v.x)[0];
 const pillars=w.platforms.filter(q=>q.solid&&!q.ground&&!q.tower&&q.x>pad.x&&q.x<bank.x).sort((u,v)=>u.x-v.x);
 {const road=[pad,...pillars,bank];ok(pillars.length===4&&road.slice(1).filter((q,k)=>road[k].y-q.y>JUMP&&road[k].y-q.y<=EDGE).length===3,'three of the four pillars are higher than a jump, none beyond the hands');
  put(pad.x+pad.w-120,pad.y);let cur=0,fell=false;api.keys.add('KeyD');
  for(let k=0;k<120*12&&cur<road.length-1;k++){const p=S().p;if(p.hang){api.keys.delete('KeyD');tap('KeyW');api.keys.add('KeyD');continue;}
   if(p.grounded&&p.on===road[cur+1]){cur++;continue;}if(p.grounded&&p.on===road[cur]&&p.x>road[cur].x+road[cur].w-24){tap('Space');api.keys.add('KeyD');continue;}
   step();if(S().p.y>road[cur].y+400){fell=true;break;}}
  api.keys.clear();ok(!fell&&cur===road.length-1,'over the abyss pillar by pillar to the far bank, without a fall');}
 // 2b. DUPLI SKOK: the optional path over the last pillar needs a second jump; the main road never does
 {const [s1,s2]=w.platforms.filter(q=>q.tajna).sort((u,v)=>u.x-v.x),p4=pillars[3];
  ok(s1&&s2&&p4.y-s1.y>EDGE&&bank.y-s1.y>EDGE&&w.breakables.some(c=>c.kind==='kovceg'&&c.y===s2.y),'the upper path is out of reach of a jump and an edge, a chest waits on it');
  ok(!w.items.some(it=>it.type==='slovo'&&[s1,s2].some(q=>it.x>q.x-40&&it.x<q.x+q.w+40&&Math.abs(it.y-q.y)<120)),'no letter of МАРКО is up there');
  const up=lift=>{put(p4.x+p4.w-24,p4.y);step(2);tap('Space');for(let k=0;k<120*3;k++){const p=S().p;if(lift&&p.vy>=0&&!p.airLift&&!p.grounded&&!p.hang){tap('KeyE');continue;}if(p.hang){tap('KeyW');continue;}step();if(S().p.grounded&&k>30)break;}step(3);return S().p.on===s1;};
  ok(!up(false),'one jump from the pillar does not reach the upper plank');ok(up(true),'a second jump in the air (Ravijojla\'s lift today) catches its edge');}
 // 3. the arrow slits: crouch under the high arrow, jump the low one, roll through both; standing is hit
 const [hi,lo]=w.traps.filter(t=>t.kind==='strelnica').sort((u,v)=>u.y-v.y),wall=w.platforms.find(q=>q.tower&&!q.ground&&q.x===hi.x);
 {const shot=(slit,how)=>{const other=slit===hi?lo:hi;api.keys.clear();step();S().arrows.length=0;put(slit.x-200,slit.gy,{invuln:0});other.clock=99;slit.clock=.01;slit.armed=true;const hp=S().p.hp;
   if(how==='crouch')api.keys.add('KeyS');
   for(let k=0;k<144;k++){const a=S().arrows.find(a=>a.enemy),p=S().p;if(how==='roll'&&a&&a.x-p.x<90&&!(p.dash>0)&&p.dashCooldown<=0)tap('ShiftLeft');else if(how==='jump'&&a&&a.x-p.x<120&&p.grounded)tap('Space');else step();}
   api.keys.clear();return S().p.hp<hp;};
  ok(shot(hi,'stand')&&!shot(hi,'crouch')&&!shot(hi,'roll'),'the high arrow hits a standing Marko; crouching (S) or a roll (Shift) gets under it');
  ok(shot(lo,'stand')&&shot(lo,'crouch')&&!shot(lo,'jump')&&!shot(lo,'roll'),'the low arrow hits standing or crouching; a jump or a roll gets over it');
  ok(wall.y<hi.gy-JUMP&&hi.gy-wall.y<=EDGE,'the wall with the slits is caught by its edge');
  put(wall.x+40,wall.y);S().arrows.length=0;hi.clock=lo.clock=.01;step(240);ok(!S().arrows.some(a=>a.enemy),'on top of the wall the slits are silent');}
 // 4. the pit: two crumbling planks, a post, a sliding beam, a rising beam; from any moment of the beams Marko gets over
 const [g1,g2]=w.traps.filter(t=>t.kind==='greda').sort((u,v)=>u.x-v.x),[j1,j2]=w.traps.filter(t=>t.kind==='jama').sort((u,v)=>u.x-v.x);
 const b1=g1.q,b2=g2.q,x0=j1.x0,planks=w.platforms.filter(q=>q.crumble&&q.x>x0&&q.x<j2.x1),post=w.platforms.find(q=>q.pillar&&q.x>x0&&q.x<j2.x1),far=w.platforms.find(q=>q.ground&&q.x===j2.x1),base=wall.y;
 // how a player rides it: wait on the post for the sliding beam, ride it out, step over to the rising beam, ride it up
 const pitStep=()=>{const p=S().p,on=p.grounded?p.on:null;
  if(on===post){api.keys.clear();if(b1.x<=x0+775){api.keys.add('KeyD');if(p.x>on.x+on.w-22){tap('Space');return;}}}
  else if(on===b1){api.keys.clear();if(b1.x>=x0+885&&b2.y>=base-60){api.keys.add('KeyD');if(p.x>b1.x+b1.w-24){tap('Space');return;}}}
  else if(on===b2){api.keys.clear();if(b2.y<=base-118){api.keys.add('KeyD');if(p.x>b2.x+b2.w-24){tap('Space');return;}}}
  else if(on&&(on===wall||planks.includes(on))){api.keys.clear();api.keys.add('KeyD');if(p.x>on.x+on.w-22){tap('Space');return;}}
  step();};
 {ok(planks.length===2&&post&&b1.move&&b2.move&&far.y<base,'two crumbling planks, a post and two moving beams lead up to the far bank');
  let wins=0;for(let s=0;s<5;s+=.5){for(const q of planks){q.off=false;q.shakeT=0;q.fall=0;}g1.t=g2.t=s;step();put(x0-30,base);
   for(let k=0;k<120*20;k++){if(S().p.hang){api.keys.clear();tap('KeyW');continue;}pitStep();const p=S().p;if(p.y>base+80||p.grounded&&p.on===far)break;}
   api.keys.clear();if(S().p.grounded&&S().p.on===far)wins++;}
  ok(wins===10,`over the pit from every moment of the beams (${wins}/10)`);
  for(const [j,dx] of [[j1,260],[j2,1075]]){put(x0+dx,base-10,{invuln:0,grounded:false});const hp=S().p.hp;let back=false;
   for(let k=0;k<360;k++){step();if(Math.abs(S().p.x-j.back.x)<2&&Math.abs(S().p.y-j.back.y)<2){back=true;break;}}
   ok(back&&S().p.hp<hp&&hp-S().p.hp<30,`a fall into the pit: the stakes hurt once, Ravijojla lifts Marko back to ${j===j1?'the edge':'the post'}`);}}
 // 5. the secret room: a blow from above breaks the cracked slab; the lore scroll, a chest of ducats and the heart piece below
 {const slab=w.platforms.find(q=>q.kind==='cracked'),heart=w.items.find(it=>it.type==='srce'),zapis=w.items.find(it=>it.type==='zapis'),chest=w.breakables.find(c=>c.kind==='kovceg'&&c.y>slab.y);
  ok(heart&&zapis&&chest&&heart.y>slab.y&&zapis.y>slab.y&&zapis.x>slab.x&&zapis.x<slab.x+slab.w&&Math.abs(heart.x-chest.x)>60&&Math.abs(zapis.x-chest.x)>40,'under the cracked slab: the lore scroll, a chest and the heart piece');
  put(slab.x+slab.w/2,slab.y);api.keys.add('KeyD');step(60);api.keys.clear();ok(S().world.platforms.includes(slab),'walking over the slab does not break it');
  put(slab.x+slab.w/2,slab.y-200,{grounded:false});step(2);api.keys.add('KeyS');tap('KeyJ');step(90);api.keys.clear();
  ok(!S().world.platforms.includes(slab)&&S().p.y>slab.y,'a blow from above (S + J in the air) breaks it and Marko drops into the room');
  api.keys.add('KeyA');for(let k=0;k<240&&!heart.taken;k++)step();api.keys.clear();api.keys.add('KeyD');for(let k=0;k<240&&!zapis.taken;k++)step();api.keys.clear();
  ok(heart.taken&&zapis.taken&&JSON.parse(storage.get('marko-zapisi')||'[]').includes('azak'),'the heart piece and the scroll are taken in the hidden room');}
 // 6. all of it at once, from the spawn to the banner: real input only, foes cut down by the test as Marko comes
 {w=await start();const a2=w.platforms.find(q=>q.hang),b2_=w.platforms.find(q=>q.x===b.x&&q.y===b.y),G=w.traps.filter(t=>t.kind==='greda').sort((u,v)=>u.x-v.x);
  const near=w.platforms.find(q=>q.x===wall.x&&q.y===wall.y),post2=w.platforms.find(q=>q.x===post.x&&q.pillar),pl=w.platforms.filter(q=>q.crumble&&q.x>x0&&q.x<j2.x1),B1=G[0].q,B2=G[1].q,far2=w.platforms.find(q=>q.ground&&q.x===far.x);
  const ahead=x=>{const p=S().p;return w.platforms.some(q=>!q.off&&x>q.x&&x<q.x+q.w&&q.y>=p.y-6&&q.y<p.y+60);};
  let t=0,dir=1;const flags=[];
  while(S().mode==='play'&&t<300){const p=S().p;t+=1/120;p.invuln=99;p.hp=p.maxHp;
   for(const e of w.enemies)if(e.alive&&Math.abs(e.x-p.x)<420&&Math.abs(e.y-p.y)<300)e.alive=false;
   if(S().ckptFlags.length>flags.length)flags.push(S().ckptFlags.at(-1).x);
   if(p.hang){api.keys.clear();tap('KeyW');continue;}
   if(p.x>a2.x+a2.w-10&&p.x<b2_.x+5&&p.y>b2_.y+20){api.keys.delete(dir>0?'KeyA':'KeyD');api.keys.add(dir>0?'KeyD':'KeyA');if(p.grounded){dir=1;tap('Space');continue;}if(p.wall){dir=-p.wall;tap('Space');continue;}step();continue;}
   const on=p.grounded?p.on:null;
   if(on===post2){api.keys.clear();if(B1.x<=x0+775){api.keys.add('KeyD');if(p.x>on.x+on.w-22){tap('Space');continue;}}step();continue;}
   if(on===B1){api.keys.clear();if(B1.x>=x0+885&&B2.y>=base-60){api.keys.add('KeyD');if(p.x>B1.x+B1.w-24){tap('Space');continue;}}step();continue;}
   if(on===B2){api.keys.clear();if(B2.y<=base-118){api.keys.add('KeyD');if(p.x>B2.x+B2.w-24){tap('Space');continue;}}step();continue;}
   if(on===near&&p.x>near.x+near.w-40){const k=((G[0].t%5)+5)%5;if(!(k>3.4&&k<4.2)){api.keys.clear();step();continue;}}   // set off when the beam will be there
   if(p.climb){api.keys.clear();api.keys.add('KeyW');step();continue;}
   api.keys.clear();api.keys.add('KeyD');if(p.grounded&&(p.wallHit===1||!ahead(p.x+40))){tap('Space');api.keys.add('KeyD');continue;}step();}
  api.keys.clear();ok(S().mode==='levelDone',`the whole tower is climbed from the spawn to the banner with real input (${t.toFixed(0)} s)`);
  ok(flags.some(x=>x>far.x&&x<far.x+400),'the men raise a banner right past the pit with the beams');
  ok(w.traps.find(t=>t.kind==='soko-glasnik')?.state==='leti','at the top the grey falcon takes the letter and flies off');
  console.log(`PASS azak: ${n} checks · banners at ${flags.map(Math.round).join(', ')}`);}}
