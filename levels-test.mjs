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
let source=await fs.readFile('dist/game.js','utf8');source=source.replace(/^import[^\n]+\n/,'const {W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt}=physics;\n');
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const api=await new AsyncFunction('physics','document','window','localStorage','Image','matchMedia','requestAnimationFrame','fetch',source+'\nreturn {startLevel,update,keys,pressed,LEVELS,state:()=>({p,world,mode,level})};')(physics,document,window,localStorage,Image,()=>({matches:false}),()=>{},fetchFile);
assert(api.LEVELS.length>=12,'all campaigns load');
const step=(n=1)=>{for(let i=0;i<n;i++)api.update(1/120);};
const stand=(x,y)=>{const {p}=api.state();p.x=x;p.y=y;p.vy=0;p.vx=0;p.hp=p.maxHp;};
let total=0;
for(let i=0;i<api.LEVELS.length;i++){
 const L=api.LEVELS[i];await api.startLevel(i,'day');const {world}=api.state();
 assert.equal(api.state().mode,'play',`${L.id}: level starts`);
 const tasks=world.goals.filter(g=>!g.done);total+=tasks.length;
 // the banner must wait while anything is left
 if(tasks.length){stand(L.goal.x-40,L.goal.y);step();assert.equal(api.state().mode,'play',`${L.id}: banner locked until goals are done`);}
 for(const g of world.goals){
  if(g.done)continue;
  if(g.kind==='gate'){
   stand(g.x-10,g.y);step();assert(api.state().p.x<=g.x-95,`${L.id}: closed gate blocks the road`);
   for(const e of world.enemies)if(e.alive&&e.x>g.x-1100&&e.x<g.x+220)e.alive=false;
   step();assert(g.done,`${L.id}: gate opens once everything before it is done`);
  }else if(g.kind==='use'){
   stand(g.x-50,g.y);api.pressed.add('KeyE');step();api.pressed.clear();assert(g.done,`${L.id}: E completes ${g.off}`);step(80);
  }else if(g.kind==='take'){
   stand(g.x,g.y);step();assert(g.done,`${L.id}: walking over ${g.off} takes it`);
  }
 }
 for(const e of world.enemies)e.alive=false;
 stand(L.goal.x-40,L.goal.y);step();
 assert.equal(api.state().mode,'levelDone',`${L.id}: banner completes the level`);
 console.log(`PASS ${L.id}: ${tasks.length} goals`);
}
console.log(`PASS all ${api.LEVELS.length} campaigns, ${total} goals`);
