import fs from 'node:fs/promises';
let s=await fs.readFile('dist/game.js','utf8');
s=s.replace('blocking:false,guard:100','blocking:false,blockTime:0,guard:100');
s=s.replace('p.guard=clamp(p.guard+dt*','p.blockTime=clamp(p.blockTime+(p.blocking?1:-1)*dt*8,0,1);p.guard=clamp(p.guard+dt*');
s=s.replace('const d=attackDuration();return p.attack>0',"const d=attackDuration();if(p.attackKind==='super')return p.attack>0&&p.attack<d*.5&&p.attack>d*.18;return p.attack>0");
s=s.replace("frame:p.crouching?(p.crouch<.4?1:2):4", "frame:p.crouching?(p.crouch<.15?0:p.crouch<.85?1:2+Math.floor(p.anim*2)%2):(p.crouch>.5?4:5)");
s=s.replace("if(p.blocking)return{name:'marko-block',frame:p.hurt>0?3:p.parry>0?1:2};", "if(p.blockTime>0||p.blocking)return{name:'marko-block',frame:!p.blocking?5:p.hurt>0?3:p.blockTime<.6?1:2};");
await fs.writeFile('dist/game.js',s);
