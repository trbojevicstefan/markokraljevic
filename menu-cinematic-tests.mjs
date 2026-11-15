import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {MENU_FPS,MENU_FRAME_MS,menuFrame,menuCamera,menuEase} from './dist/menu-cinematic-core.js';

assert.equal(MENU_FPS,25);
assert.equal(MENU_FRAME_MS,40);
assert.equal(menuFrame(39.5,0).due,false);
assert.equal(menuFrame(40,0).due,true);
assert.equal(menuFrame(40,0).next,40);
assert.equal(menuFrame(40,0).dt,.04);
assert.equal(menuFrame(80,40).next,80);
assert.equal(menuFrame(300,40).dt,.15);
assert.equal(menuFrame(15,40).due,false);
assert.equal(menuEase(0),0);assert.equal(menuEase(.5),.5);assert.equal(menuEase(1),1);
for (const t of [0,1,5,100]) {
 const c=menuCamera(t,.4,-.3);
 for(const v of Object.values(c))assert(Number.isFinite(v));
}
const html=await fs.readFile('dist/index.html','utf8');
const preview=await fs.readFile('dist/menu-cinematic-preview.html','utf8');
const source=await fs.readFile('dist/menu-cinematic.js','utf8');
const css=await fs.readFile('dist/menu-cinematic.css','utf8');
const game=await fs.readFile('dist/game.js','utf8');
assert(html.includes('class="overlay cinematic-menu"'));
assert(html.includes('href="menu-cinematic.css"'));
assert(html.includes('src="menu-cinematic.js"'));
assert(preview.includes('src="menu-cinematic.js"'));
assert(preview.includes('class="overlay cinematic-menu"'));
assert(css.includes('#menu.cinematic-menu'));
assert(game.includes("if(document.getElementById('menu')?.classList.contains('cinematic-menu'))return;"));
assert(game.includes("if(hasDom&&!document.getElementById('menu')?.classList.contains('cinematic-menu')"));
for(const file of ['sky.webp','far.webp','mid.webp','near.webp'])await fs.access('dist/assets/realisticno/klisura/'+file);
for(const file of ['prop-barjak-srpski.webp'])await fs.access('dist/assets/realisticno/svet-predmeti/'+file);
const rig=JSON.parse(await fs.readFile('dist/assets/sprite-rig.json','utf8'));
for(const name of [...source.matchAll(/\['(marko-[a-z0-9-]+)',[.\d]+,\d+,'(?:loop|once)'\]/g)].map(m=>m[1])) {
 assert(rig[name],name+' missing rig');
 await fs.access('dist/assets/'+rig[name].image);
}
assert(!/requestAnimationFrame\(render\)/.test(source),'scene must be capped at 25 fps');
assert(source.includes('menuFrame(now,lastTick)'),'menu must throttle animation');
console.log('PASS cinematic 25 FPS menu timing, local art, responsive presentation and game integration');
