import fs from 'node:fs/promises';
let s=await fs.readFile('dist/game.js','utf8');
function edit(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,90));s=s.replace(a,b);}
edit('castLock:0};','castLock:0,crouch:0,crouching:false,blocking:false,guard:100,guardBreak:0,rage:0,superImpact:false};');
edit("'drink','castLock']", "'drink','castLock','guardBreak']");
edit("function strike(heavy=false){if(p.cooldown>0||p.dash>0||p.drink>0)return;", "function strike(heavy=false){if(p.cooldown>0||p.dash>0||p.drink>0||p.blocking||p.crouching||p.guardBreak>0)return;");
edit("function isDown(...codes)", `function attackDuration(){return p.attackKind==='super'?.95:p.attackKind==='heavy'?.52:.33;}
function superStrike(){if(p.rage<100){toast('Junački bes puni se pogocima i odbijanjem.',2);return;}if(p.cooldown>0||p.dash>0||p.drink>0||horseMounted||!p.grounded||p.guardBreak>0)return;p.rage=0;p.attack=.95;p.attackKind='super';p.cooldown=1.4;p.superImpact=false;p.blocking=false;p.crouching=false;p.crouch=0;p.invuln=Math.max(p.invuln,.7);sound('swing');toast('JUNAČKI UDAR',1.2);}
function isDown(...codes)`);
edit("const axis=(isDown", `p.crouching=p.grounded&&!horseMounted&&p.attack<=0&&p.drink<=0&&isDown('KeyS','ArrowDown');p.crouch=clamp(p.crouch+(p.crouching?1:-1)*dt*7,0,1);p.h=112-48*p.crouch;
 p.blocking=isDown('KeyL')&&p.grounded&&!horseMounted&&!p.crouching&&p.attack<=0&&p.drink<=0&&p.dash<=0&&p.guardBreak<=0&&p.guard>0;
 p.guard=clamp(p.guard+dt*(p.blocking?-12:p.guardBreak>0?0:26),0,100);if(p.guard<=0&&p.blocking){p.guardBreak=.85;p.blocking=false;toast('Gard je slomljen',1);}
 if(tap('KeyR'))superStrike();
 if(p.attackKind==='super'&&p.attack>0&&p.attack<.45&&!p.superImpact){p.superImpact=true;fx('hit',p.x+p.face*70,p.y-12,true);fx('spell',p.x+p.face*70,p.y-12);burst(p.x+p.face*70,p.y-12,'#ffcc72',55,300);dust(p.x,p.y,20,2.5);shake=settings.reduced?0:9;sound('hit');}
 const axis=(isDown`);
edit("const target=axis*speed*(p.attack>0?.5:p.drink>0?.45:1)", "const target=axis*speed*(p.attackKind==='super'&&p.attack>0?.12:p.blocking?.22:p.crouching?.3:p.attack>0?.5:p.drink>0?.45:1)");
edit("if(tap('KeyL')&&p.parryCooldown<=0)", "if(tap('KeyL')&&p.parryCooldown<=0&&p.guardBreak<=0&&!p.attack&&!p.drink&&!horseMounted)");
edit('p.jumpBuffer=0;sound(\'jump\');',"p.jumpBuffer=0;p.crouching=false;p.crouch=0;p.h=112;p.blocking=false;sound('jump');");
edit("const d=p.attackKind===\"heavy\"?.52:.33;return", "const d=attackDuration();return");
edit("const range=p.attackKind==='heavy'?145:115", "const range=p.attackKind==='super'?210:p.attackKind==='heavy'?145:115");
edit("const heavy=p.attackKind==='heavy';if(e.type", "const heavy=p.attackKind!=='light';if(e.type");
edit("const amount=(heavy?48:29)", "const amount=(p.attackKind==='super'?145:heavy?48:29)");
edit("e.hp-=amount;e.flash", "e.hp-=amount;if(p.attackKind!=='super')p.rage=Math.min(100,p.rage+(heavy?18:12));e.flash");
edit("if(boss.mode!=='open'){label", "if(boss.mode!=='open'&&p.attackKind!=='super'){label");
edit("(p.attackKind==='heavy'?58:35)", "(p.attackKind==='super'?170:p.attackKind==='heavy'?58:35)");
edit("boss.hp=Math.max(0,boss.hp-amount);", "boss.hp=Math.max(0,boss.hp-amount);if(p.attackKind!=='super')p.rage=Math.min(100,p.rage+18);");
edit("const factor=(settings.difficulty", `let blocked=false;if(p.blocking&&dir===-p.face){const cost=amount*2.3;if(p.guard>=cost){p.guard-=cost;amount*=.2;blocked=true;fx('parry',p.x+p.face*30,p.y-65);sound('parry');label('BLOK',p.x,p.y-135,'#bce5db');}else{p.guard=0;p.guardBreak=.85;p.blocking=false;toast('Gard je slomljen',1);}}p.rage=Math.min(100,p.rage+amount*.7);const factor=(settings.difficulty`);
edit('p.hurt=.22;p.invuln=1;', 'p.hurt=blocked?.06:.22;p.invuln=blocked?.2:1;');
// Perfect parries reward the meter across melee, arrow and boss paths.
s=s.replaceAll("sound('parry');label('SAVRŠENO'", "p.rage=Math.min(100,p.rage+25);sound('parry');label('SAVRŠENO'");
s=s.replaceAll("sound('parry');label('ODBIJENO'", "p.rage=Math.min(100,p.rage+25);sound('parry');label('ODBIJENO'");
edit("a.enemy=false;a.vx=-a.vx;sound('parry');", "a.enemy=false;a.vx=-a.vx;p.rage=Math.min(100,p.rage+20);sound('parry');");
s=s.replaceAll("const duration=p.attackKind==='heavy'?.52:.33", "const duration=attackDuration()");
s=s.replaceAll("const d=p.attackKind==='heavy'?.52:.33", "const d=attackDuration()");
edit("return{name:'marko-attack',frame:Math.min(5,Math.floor(phase*6))}", "return{name:p.attackKind==='super'?'marko-super':'marko-attack',frame:Math.min(5,Math.floor(phase*6))}");
edit("if(p.landing>0){const s=", "if(p.crouch>.05)return{name:'marko-crouch',frame:p.crouching?(p.crouch<.4?1:2):4};\n if(p.blocking)return{name:'marko-block',frame:p.hurt>0?3:p.parry>0?1:2};\n if(p.landing>0){const s=");
edit("$('health').style.width=", "$('rage-fill').style.width=p.rage+'%';$('guard-fill').style.width=p.guard+'%';$('rage-label').textContent=p.rage>=100?'R · SPREMNO':'R · BES '+Math.floor(p.rage);$('rage-label').classList.toggle?.('ready',p.rage>=100);$('health').style.width=");
edit("renderer:stage?'three':'2d',deathSequence", "renderer:stage?'three':'2d',rage:p.rage,guard:p.guard,blocking:p.blocking,crouching:p.crouching,playerHeight:p.h,attackKind:p.attackKind,attack:p.attack,deathSequence");
await fs.writeFile('dist/game.js',s);
let html=await fs.readFile('dist/index.html','utf8');
html=html.replace('<i id="energy"></i></div></div>', '<i id="energy"></i></div></div><div class="combat-meters"><div><span id="rage-label">R · BES 0</span><div class="mini-meter rage"><i id="rage-fill"></i></div></div><div><span>L · GARD</span><div class="mini-meter guard"><i id="guard-fill"></i></div></div></div>');
html=html.replace('<kbd>L</kbd> Odbij','<kbd>L</kbd> Blok / odbij').replace('<kbd>SHIFT</kbd> Izmakni','<kbd>S</kbd> Čučanj</span><span><kbd>R</kbd> Super</span><span><kbd>SHIFT</kbd> Izmakni');
html=html.replace('<button data-key="KeyQ">','<button data-key="KeyS" aria-label="Čučanj">↓</button><button data-key="KeyR" aria-label="Super udarac">R</button><button data-key="KeyQ">');
html=html.replace('Esc pauzira igru.','S / dole: čučanj i izbegavanje strela. Drži L za blok; početak garda odbija udarac. Gard se troši i obnavlja kad ga spustiš. R: super udarac pri 100 besa, koji puniš borbom. Esc pauzira igru.');
await fs.writeFile('dist/index.html',html);
await fs.appendFile('dist/style.css','\n.combat-meters{display:flex;gap:14px;margin-top:10px;font-size:8px;letter-spacing:1px;color:#c8d9ca}.mini-meter{width:98px;height:3px;margin-top:5px;background:#142924}.mini-meter i{display:block;height:100%;width:0}.rage i{background:linear-gradient(90deg,#d37b32,#ffe5a5)}.guard i{background:#98c8c2;width:100%}#rage-label.ready{color:#ffe09a;text-shadow:0 0 10px #ffb43b}#controls{gap:10px;flex-wrap:wrap;padding:0 10px}\n');
