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
const deathFn=source.match(/function deathPose\(c\)\{[^\n]+\}/)[0];
const ROT_AT=Number(source.match(/const ROT_AT=([\d.]+)/)[1]);
const death=new Function('clamp','ROT_AT',deathFn+';return deathPose;')((x,a,b)=>Math.max(a,Math.min(b,x)),ROT_AT);
for(const type of ['marko','sword','shield','archer','musa']){
  const r=rig[type+'-death'];assert.equal(r.frames.length,6);await fs.access('dist/assets/'+r.image);
  const seen=new Set();for(let t=0;t<1.3;t+=.02)seen.add(death({type,t}).frame);
  assert.equal(seen.size,6);assert.equal(death({type,t:20,persist:true}).frame,5,'death must not loop');
  assert.equal(death({type,t:20,persist:true}).alpha,1,'hero/boss final pose persists');
  assert.equal(death({type,t:3.2}).alpha,1,'ordinary corpse stays on the ground');assert.equal(death({type,t:30}).alpha,0,'then it gives way to bones');
  assert((r.frames[5][4]-r.frames[5][5])<(r.frames[0][4]-r.frames[0][5])*.6,'final pose lies down');
}
for(const name of ['marko-crouch','marko-block','marko-super']){
  const r=rig[name];assert.equal(r.frames.length,6);await fs.access('dist/assets/'+r.image);
  const upright=r.frames[5];assert(Math.abs((upright[4]-upright[5])*r.scale-128)<.1,'new actions retain hero scale');
}
const cr=rig['marko-crouch'];assert((cr.frames[2][4]-cr.frames[2][5])*cr.scale<90,'crouch is visibly lower');
console.log('PASS 24 locomotion, 30 death and 18 combat frames; grounded soles and preserved character scales');
