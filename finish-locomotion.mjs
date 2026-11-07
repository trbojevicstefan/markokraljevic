import fs from 'node:fs/promises';
const file='dist/game.js';
let code=await fs.readFile(file,'utf8');
function replace(before,after){if(!code.includes(before))throw Error('Expected current code missing: '+before.slice(0,90));code=code.replace(before,after);}
replace("e.moveT=Math.max(0,(e.moveT||0)-dt);", "e.moveT=0;");
replace("boss.flash=Math.max(0,boss.flash-dt);boss.face", "boss.moveT=0;boss.flash=Math.max(0,boss.flash-dt);boss.face");
replace("}else if(e.moveT>0){const ph=(e.walk||0)/34;pose.dy=-Math.abs(Math.sin(ph))*4;pose.rot=e.face*(.045+Math.sin(ph)*.03);pose.sy=1+Math.abs(Math.cos(ph))*.02;}", "}else if(e.moveT>0&&e.stun<=0&&rig?.[e.type+'-run']){pose=locomotionPose(e);}");
replace("if(boss.moveT>0){const ph=(boss.walk||0)/44;pose.dy=-Math.abs(Math.sin(ph))*5;pose.rot=boss.face*(.04+Math.sin(ph)*.025);}", "if(boss.moveT>0&&rig?.['musa-run']){Object.assign(pose,locomotionPose({...boss,type:'musa'}));}");
replace('function drawSoldier(e){', `// Distance-driven stride: no root bobbing or rotation, soles stay on the rig baseline.
function locomotionPose(e){const stride=e.type==='musa'?120:e.type==='shield'?76:90;return{name:e.type+'-run',frame:Math.floor((e.walk||0)/stride*6)%6};}
function drawSoldier(e){`);
replace("map(e=>({x:e.x,hp:e.hp,mode:e.mode}))", "map(e=>({x:e.x,hp:e.hp,mode:e.mode,type:e.type,moving:e.moveT>0&&e.stun<=0,walk:e.walk||0,frame:locomotionPose(e).frame}))");
await fs.writeFile(file,code);
