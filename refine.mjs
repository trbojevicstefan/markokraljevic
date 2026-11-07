import fs from 'node:fs/promises';
const path='dist/game.js';let s=await fs.readFile(path,'utf8');
s=s.replace('p.x=Math.max(40,p.x);','p.x=Math.max(chapters[zone].start+35,p.x);');
s=s.replace("$('objective').textContent=zone===2?","$('objective').textContent=defenses[zone]?.active&&!defenses[zone].done?`Zaštiti putnike · talas ${defenses[zone].wave}/3`:zone===2?");
s=s.replace("const remaining=world.enemies.some(e=>e.alive&&e.zone===zone)||(zone===2&&world.runes.some(r=>!r.active));","const remaining=(defenses[zone]&&!defenses[zone].done)||world.enemies.some(e=>e.alive&&e.zone===zone)||(zone===2&&world.runes.some(r=>!r.active));");
s=s.replace("ctx.fillStyle='#596451';ctx.fillRect(x+400,400,52,190);ctx.fillStyle='#c1b182';ctx.fillRect(x+396,398,60,12);for(let j=0;j<3;j++)ctx.fillRect(x+396+j*22,380,15,20);","sprite('arch',x+430,590,260,1);");
s=s.replace("ctx.arc(p.x,p.y-44,50,-1.3+p.face<0?Math.PI:0,1.3)","ctx.arc(p.x,p.y-44,50,(p.face<0?Math.PI:0)-1.3,(p.face<0?Math.PI:0)+1.3)");
await fs.writeFile(path,s);
await fs.appendFile('dist/style.css','\n#game-shell:has(#boss-hud:not([hidden])) #toast{top:245px}@media(max-width:600px){#game-shell:has(#boss-hud:not([hidden])) #toast{top:305px}}\n');
