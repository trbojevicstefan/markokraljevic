// Characters keep one height from clip to clip: node heights-test.mjs
// Marko's standing frames sit at 128 world px (±3%); each foe's idle and run stand equally tall (±4%).
import fs from 'node:fs';
import assert from 'node:assert/strict';
const rig=JSON.parse(fs.readFileSync('dist/assets/sprite-rig.json','utf8'));
const h=(name,i)=>{const r=rig[name],hs=r.frames.map(f=>(f[4]-f[5])*r.scale);if(i==='median'){const s=[...hs].sort((a,b)=>a-b);return s[Math.floor(s.length/2)];}if(i==='max')return Math.max(...hs);return hs[i];};
let n=0;
const MARKO={'marko-idle':'median','marko-run':'max','marko-block':0,'marko-crouch':0,'marko-drink':0,'marko-kick':0,'marko-combo-1':0,'marko-hurt':0,'marko-jump':0,'marko-getup':5,'marko-push':'median','marko-lever':0};
for(const [name,i] of Object.entries(MARKO)){if(!rig[name])continue;const v=h(name,i);assert(Math.abs(v-128)/128<=.03,`${name}: Marko stands ${v.toFixed(1)} px, not 128`);n++;}
for(const who of['sword','shield','archer','akindzija','palikuca','kopljanik','tufekdzija']){const idle=h(who+'-idle','median'),run=h(who+'-run','median');assert(Math.abs(idle-run)/run<=.04,`${who}: idle ${idle.toFixed(1)} vs run ${run.toFixed(1)}`);n++;}
{const idle=h('oklopnik-idle','median'),walk=h('oklopnik-walk','median');assert(Math.abs(idle-walk)/walk<=.04,`oklopnik: idle ${idle.toFixed(1)} vs walk ${walk.toFixed(1)}`);n++;}
console.log(`PASS ${n} height checks: Marko and every foe keep one height across clips`);
