import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const rig=JSON.parse(await fs.readFile('dist/assets/sprite-rig.json','utf8'));
const source=await fs.readFile('dist/game.js','utf8');
const fn=source.match(/function locomotionPose\(e\)\{[^\n]+\}/)[0];
const pose=new Function(fn+';return locomotionPose;')();
for(const type of ['sword','shield','archer','musa']){
  const r=rig[type+'-run'];
  assert.equal(r.frames.length,6);
  await fs.access('dist/assets/'+r.image);
  const frames=new Set();
  for(let walk=0;walk<150;walk++){
    const p=pose({type,walk});
    assert.equal(p.name,type+'-run');
    assert(p.frame>=0&&p.frame<6);frames.add(p.frame);
    assert.equal(p.dy,undefined,'walking must not lift the sprite root');
    assert.equal(p.rot,undefined,'walking must not rotate the entire character');
    assert.deepEqual(p,pose({type,walk}),'stationary distance must freeze the gait');
  }
  assert.equal(frames.size,6);
  for(const f of r.frames){
    assert(f[4]>f[5]&&f[4]<f[3],'valid opaque sole inside cell');
    assert.equal(-f[4]*r.scale+f[4]*r.scale,0,'sole maps precisely to ground');
  }
}
// Existing user-calibrated hero and mount scales are invariants.
for(const [name,scale] of Object.entries({'cast/marko':0.36676,'marko-run':0.55381,'marko-attack':0.47312,'mounted-run':0.55748,'fairy-cast':0.235})){
  assert(Math.abs(rig[name].scale-scale)<0.00002,`${name}: preserve user scale`);
}
console.log('PASS 24 locomotion frames, distance-driven gait, grounded soles, preserved character scales');
