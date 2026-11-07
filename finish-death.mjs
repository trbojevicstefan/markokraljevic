import fs from 'node:fs/promises';
let code=await fs.readFile('dist/game.js','utf8');
function replace(a,b){if(!code.includes(a))throw Error('Missing expected code '+a.slice(0,90));code=code.replace(a,b);}
replace("const keys=new Set()", "let endSequence=null;\nconst keys=new Set()");
replace("function start(resume=false){initAudio();", "function start(resume=false){endSequence=null;initAudio();");
replace("function die(){if(mode!=='play')return;deaths++;mode='dead';$('death').hidden=false;sound('hurt');keys.clear();}", `function die(){if(mode!=='play')return;deaths++;mode='dead';p.hp=0;p.attack=0;p.drink=0;p.dash=0;pendingMagic=null;arrows=[];keys.clear();pressed.clear();if(horseMounted){horseMounted=false;horseX=p.x+85;}const y=p.y>800?590:p.y,x=p.y>800?lastSafe:p.x;corpses.push(makeCorpse('marko',x,y,p.face,true,p.vy));endSequence={kind:'death',age:0};$('dialogue').hidden=true;$('death').hidden=true;updateHud();sound('hurt');}`);
replace("function slay(e){e.alive=false;kills++;corpses.push({type:e.type,x:e.x,y:e.y,face:e.face,t:0});fx('kill',e.x,e.y);}", "function slay(e){if(!e.alive)return;e.alive=false;kills++;corpses.push(makeCorpse(e.type,e.x,e.y,e.face));fx('kill',e.x,e.y);}");
replace("bossDamage();boss.timer-=dt;", "bossDamage();if(!boss.alive)return;boss.timer-=dt;");
replace("corpses.push({type:'musa',x:boss.x,y:boss.y,face:boss.face,t:0});", "corpses.push(makeCorpse('musa',boss.x,boss.y,boss.face,true));endSequence={kind:'victory',age:0};p.attack=0;p.dash=0;pendingMagic=null;arrows=[];keys.clear();pressed.clear();");
replace("$('victory').hidden=false;$('boss-hud')", "$('victory').hidden=true;$('boss-hud')");
replace("for(const c of corpses){const before=c.t;c.t+=dt;if(before<.42&&c.t>=.42)dust(c.x-c.face*40,c.y,10,1.6);}corpses=corpses.filter(c=>c.t<1.7);", `for(const c of corpses){const before=c.t;if(!c.grounded)integrate(c,dt,world.platforms,world.runes);if(c.y>850){c.x=lastSafe;c.y=590;c.grounded=true;}c.t+=dt;if(before<.7&&c.t>=.7)dust(c.x-c.face*20,c.y,10,1.6);}corpses=corpses.filter(c=>c.persist||c.t<3.2);if(endSequence){endSequence.age+=dt;const body=corpses.find(c=>c.type===(endSequence.kind==='death'?'marko':'musa'));if(endSequence.age>=1.55&&body?.grounded)$(endSequence.kind).hidden=false;}`);
replace("function update(dt){if(mode", "function update(dt){if(mode==='pause'){pressed.clear();return;}if(mode");
replace("updateEnemies(dt);updateBoss(dt);updateArrows(dt);", "updateEnemies(dt);if(mode==='play')updateBoss(dt);if(mode==='play')updateArrows(dt);");
replace("function drawPlayer(){if(!p)return;", "function drawPlayer(){if(!p||mode==='dead')return;");
const old=code.match(/function drawCorpse\(c\)\{[^\n]+/)[0];
replace(old,`function makeCorpse(type,x,y,face,persist=false,vy=0){return{type,x,y,face,persist,t:0,vx:0,vy:Math.max(0,vy),w:34,h:40,grounded:false};}
function deathPose(c){const frame=c.t<.13?0:c.t<.30?1:c.t<.49?2:c.t<.70?3:c.t<.90?4:5;return{name:c.type+'-death',frame,alpha:c.persist?1:1-clamp((c.t-2.5)/.7,0,1)};}
function drawCorpse(c){const pose=deathPose(c);shadow(c.x,c.y,c.type==='musa'?65:45,.35*pose.alpha);rigDraw(pose.name,pose.frame,c.x,c.y,c.face,{alpha:pose.alpha,flash:c.t<.1?(.1-c.t)*4:0,flashColor:'#fff2d0'});}`);
replace("function mainMenu(){mode='menu';", "function mainMenu(){endSequence=null;corpses=[];mode='menu';");
replace("stage.render({dt,camX", "stage.render({dt:mode==='pause'?0:dt,camX");
replace("renderer:stage?'three':'2d'", "renderer:stage?'three':'2d',deathSequence:endSequence,corpses:corpses.map(c=>({type:c.type,frame:deathPose(c).frame,t:c.t,grounded:c.grounded}))");
await fs.writeFile('dist/game.js',code);
