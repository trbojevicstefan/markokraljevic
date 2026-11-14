import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {EPISODE_SECONDS,MIROC_PHASES,MIROC_LINES,MIROC_HERBS,phaseAt,lyricAt,pct,prettyTime,scoreEpisode} from '../dist/miroc-episode-data.js';
import {integrate,GRAVITY} from '../dist/world.js';

assert.equal(EPISODE_SECONDS,300,'episode lasts five minutes');
assert.equal(MIROC_PHASES.length,7);
assert.equal(MIROC_PHASES[0].from,0);
assert.equal(MIROC_PHASES.at(-1).to,300);
for(let i=0;i<MIROC_PHASES.length;i++){
 const p=MIROC_PHASES[i];assert(p.from<p.to);
 assert.equal(phaseAt(p.from).id,p.id);
 if(i>0)assert.equal(MIROC_PHASES[i-1].to,p.from);
}
assert.equal(phaseAt(299.99).id,'healing');
assert.equal(phaseAt(300).id,'healing');
assert.equal(prettyTime(0),'5:00');
assert.equal(prettyTime(300),'0:00');
assert.equal(pct(150),.5);
assert.equal(scoreEpisode({jumps:2,hits:3,herbs:3,heal:1}),4);
assert.equal(scoreEpisode({}),0);
assert.equal(MIROC_HERBS.length,3);
assert(MIROC_LINES.some(c=>c[1].toLowerCase().includes('grlo')));
assert(lyricAt(91).includes('strele'));
const html=await readFile('dist/miroc-episode.html','utf8');
const js=await readFile('dist/miroc-episode.js','utf8');
const menu=await readFile('dist/index.html','utf8');
assert(menu.includes('href="miroc-episode.html"'),'main menu must link the level');
for(const id of ['game','miroc-intro','miroc-start','miroc-hud','miroc-end','miroc-touch','miroc-lyric'])
  assert(html.includes('id="'+id+'"'), 'missing UI '+id);
assert(js.includes("import {integrate, GRAVITY} from './world.js'"),'use existing world physics');
for(const phase of ['ride','sing','arrows','chase','battle','herbs','healing'])
  assert(js.includes("'"+phase+"'"),'scene missing '+phase);
assert(js.includes('blood('),'mace combat impact fx');
assert(js.includes('drawLodgedArrow('),'two embedded arrows');
assert(js.includes('MIROC_HERBS'),'herb gameplay');
assert(js.includes("assets/sfx/guslar_pesma_duga.ogg"),'sound cue');
assert(js.includes('state.herbs.size===3'),'healing requires herb collection');
assert(js.includes('state.t>=EPISODE_SECONDS'),'ending at 300 seconds');
const rig=JSON.parse(await readFile('dist/assets/sprite-rig.json','utf8'));
for(const key of [
 'sarac-galop','marko-idle','marko-odmor','marko-pocinak','marko-odmor-ustaje',
 'marko-run','marko-attack','marko-mounted-attack','marko-jump','marko-hurt',
 'marko-victory','marko-sablja-idle','vila-let','vila-carolija','vila-isceljenje'
]){
 assert(rig[key]?.image&&rig[key].frames?.length>0,'missing sprite '+key);
 await access('dist/assets/'+rig[key].image);
}
for(const area of ['svet-prevoj','svet-suma','svet-manastir'])
 for(const layer of ['sky','far','mid','near'])
  await access('dist/assets/realisticno/'+area+'/'+layer+'.webp');
for(const path of ['dist/assets/sfx/guslar_pesma_duga.ogg','dist/assets/sfx/hoof_0.ogg','dist/assets/sfx/bow_0.ogg',
 'dist/assets/sfx/arrow_0.ogg','dist/assets/sfx/hit_heavy_0.ogg','dist/assets/sfx/hit_body_0.ogg',
 'dist/assets/sfx/magic_0.ogg','dist/assets/sfx/magic_big_0.ogg','dist/assets/sfx/pickup_0.ogg'])await access(path);
// Original engine collision, used by the Miroc battle, must remain available.
assert.equal(typeof integrate,'function');assert(GRAVITY>0);
const hero={x:100,y:592,w:34,h:100,vx:0,vy:0,grounded:true,drop:0};
integrate(hero,1/120,[{x:0,y:592,w:1200,h:100,kind:'stone'}]);
assert(hero.y>=590&&hero.y<=595,'hero remains on original floor');
console.log('PASS · Miroc: seven contiguous scenes, 300s, controls/DOM, game physics, sprites, audio and live link');
