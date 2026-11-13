import assert from 'node:assert/strict';
import {WEAK_MARKO_CLIPS, fluidEase, fluidFadeDuration, fluidEchoDuration, fluidEchoAlpha} from './dist/anim-fluid.js';
import fs from 'node:fs/promises';

const rig=JSON.parse(await fs.readFile('dist/assets/sprite-rig.json','utf8'));
assert(WEAK_MARKO_CLIPS.size >= 24, 'cover the weaker original Marko clips');
for (const name of WEAK_MARKO_CLIPS) assert(rig[name]?.frames?.length >= 3, 'known sprite exists: '+name);
for (const t of [-1,0,.05,.25,.5,.75,.95,1,2]) {
  assert(fluidEase(t) >= 0 && fluidEase(t) <= 1);
  if(t>=0&&t<=1) assert(Math.abs(fluidEase(1-t)+fluidEase(t)-1)<1e-9);
}
assert.equal(fluidFadeDuration('marko-run','marko-walk'), .105);
assert.equal(fluidFadeDuration('marko-jump-rise','marko-fall'), .08);
assert.equal(fluidFadeDuration('marko-sablja-idle','marko-sablja-trci'), .095);
assert.equal(fluidFadeDuration('marko-combo-1','marko-idle'), 0);
assert.equal(fluidFadeDuration('marko-run','marko-hurt'), 0);
for(const flag of [{sharp:true},{sameFace:false},{reduced:true},{enabled:false}])
  assert.equal(fluidFadeDuration('marko-idle','marko-idle-2',flag),0);
assert.equal(fluidEchoDuration('marko-roll',1,2,{frames:6}),.028);
assert.equal(fluidEchoDuration('marko-jump',1,2,{frames:6}),.042);
assert.equal(fluidEchoDuration('marko-attack',0,1,{keyAt:.8,frames:6}),.028);
assert.equal(fluidEchoDuration('marko-attack',3,4,{keyAt:.8,frames:6}),0);
for(const flag of [{hasFlow:true},{reduced:true},{enabled:false}])
  assert.equal(fluidEchoDuration('marko-roll',1,2,{frames:6,...flag}),0);
assert.equal(fluidEchoDuration('marko-run',1,2,{frames:6}),0);
assert.equal(fluidEchoDuration('marko-roll',1,1,{frames:6}),0);
assert.equal(fluidEchoDuration('marko-roll',1,6,{frames:6}),0);
for(const T of [.028,.042]){
  assert.equal(fluidEchoAlpha(0,T),.16);
  assert.equal(fluidEchoAlpha(T,T),0);
  assert(fluidEchoAlpha(T/2,T)>0&&fluidEchoAlpha(T/2,T)<.16);
}
console.log('PASS Marko fluidity policies: compatible blends, protected impact frames, weak-frame echoes');
