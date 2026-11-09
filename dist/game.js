import{W,H,chapters,chapterAt,clamp,makeWorld,integrate,makeLevel,LEVEL_ZONE,goalArt,CUDA,EXTRA_LEVELS,STEP_UP,BOSSES,POWERS}from'./world.js';
const $=id=>document.getElementById(id),canvas=$('game');
const tr=s=>globalThis.markoI18n?globalThis.markoI18n.tr(s):s;
var mmReady=false;
// The camera shows the world 15% closer; ground sits at y=612 on a 720p screen.
const ZOOM=1.15,VIEW_W=W/ZOOM,VIEW_H=H/ZOOM,GROUND=590,CAM_Y0=GROUND-612/ZOOM;
const hasDom=typeof document.createElement==='function';
function makeCanvas(w,h){if(!hasDom)return{width:w,height:h,getContext:()=>null};const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// 2D world layer and a half-resolution additive glow layer; Three.js composites both.
const layer=makeCanvas(W,H),glowLayer=makeCanvas(W/2,H/2),scratch=makeCanvas(640,640);
const ctx=layer.getContext('2d'),gctx=glowLayer.getContext('2d'),sctx=scratch.getContext('2d');
const assets={};const assetNames=['tree','platform','arch','fairy'];
await Promise.all([...assetNames.map(n=>[n,`assets/cast/${n}.png`]),['gorge','assets/gorge.png']].map(([n,url])=>new Promise(resolve=>{const im=new Image();im.onload=()=>{assets[n]=im;resolve();};im.onerror=()=>resolve();im.src=url;})));
// sprite-rig.json: one consistent scale per character plus sole/anchor per frame (see build-sprite-rig.py).
const rig=await fetch('assets/sprite-rig.json').then(r=>r.json()).catch(()=>null);
const rigImages={};const LEVELS=[...await fetch('assets/world/levels.json').then(r=>r.json()).catch(()=>[]),...EXTRA_LEVELS];
if(rig)await Promise.all([...new Set(Object.values(rig).map(r=>r.image))].map(src=>new Promise(resolve=>{const im=new Image();im.onload=()=>{rigImages[src]=im;resolve();};im.onerror=()=>resolve();im.src=`assets/${src}`;})));
let lastSafeY=590,defenses={},world=makeWorld(),p,mode='menu',camera=0,camY=CAM_Y0,time=0,elapsed=0,zone=0,checkpoint=0,boss,particles=[],arrows=[],floating=[],corpses=[],ghosts=[],attackSerial=0,shake=0,hitstop=0,dialogueTime=0,toastTime=0,saveState=null,deaths=0,kills=0,relics=0,horseX=10960,horseMounted=false,horseCompleted=false,lastSafe=150,audioEnabled=true,settings={difficulty:'normal',volume:.4,music:.35,sfx:.55,voice:.9,quality:'auto',gore:true,reduced:false};
let endSequence=null;
const keys=new Set(),pressed=new Set();let audio=null,musicClock=0;
let fairy={x:100,y:440,age:99,duration:3.2,targetX:100,targetY:440,kind:'hover'},pendingMagic=null;
try{settings={...settings,...JSON.parse(localStorage.getItem('marko-settings')||'{}')};saveState=JSON.parse(localStorage.getItem('marko-save')||'null');}catch{}
let stage=null;
if(hasDom&&assets.gorge){try{const m=await import('./stage3d.js');stage=await m.createStage({canvas,layer,glow:glowLayer,gorge:assets.gorge,W,H,zoom:ZOOM,settings:{get reduced(){return settings.reduced;},get quality(){return settings.quality;},onThunder:()=>sfx('thunder',{gain:.8,delay:.25,vary:.3})}});document.body.classList.add('webgl');}catch(err){console.warn('Three.js scena nije dostupna, koristi se 2D prikaz.',err);stage=null;}}
const screenCtx=stage?null:canvas.getContext?.('2d');
const fx=(name,...args)=>stage?.[name]?.(...args);
$('continue').hidden=!saveState;$('difficulty').value=settings.difficulty;$('volume').value=settings.volume*100;$('vol-music').value=settings.music*100;$('vol-sfx').value=settings.sfx*100;$('vol-voice').value=settings.voice*100;$('quality').value=settings.quality;$('reduced').checked=settings.reduced;$('gore').checked=settings.gore!==false;
$('loading').hidden=true;
// ---------- audio: samples (Kenney CC0 + synthesised), ElevenLabs voices, composed music ----------
const SND={norm:{},ready:false,buf:{},groups:{},voices:[],master:null,bus:{},speaking:{},track:null,trackName:'',duckUntil:0,lowAt:-99,last:{}};
function initAudio(){if(!audio)try{audio=new(window.AudioContext||window.webkitAudioContext)();}catch{}if(!audio)return;audio.resume?.();if(!SND.master){SND.master=audio.createGain();const lim=audio.createDynamicsCompressor();lim.threshold.value=-8;lim.knee.value=6;lim.ratio.value=8;lim.attack.value=.003;lim.release.value=.2;SND.master.connect(lim);lim.connect(audio.destination);for(const [k,v] of [['music',.2],['sfx',.4],['voice',1.5],['enemy',.6]]){const g=audio.createGain();g.gain.value=v;g.connect(SND.master);SND.bus[k]=g;}loadAudio();}}
async function loadAudio(){const get=async(url)=>{try{const r=await fetch(url);if(!r.ok)return null;return await audio.decodeAudioData(await r.arrayBuffer());}catch{return null;}};
 const groups=await fetch('assets/sfx/sfx.json').then(r=>r.json()).catch(()=>({}));SND.groups=groups;
 const voices=await fetch('assets/voice/lines.json').then(r=>r.json()).catch(()=>[]);SND.voices=voices;
 await Promise.all([...Object.values(groups).flat().map(async n=>{SND.buf['sfx/'+n]=await get(`assets/sfx/${n}.ogg`);}),...voices.map(async n=>{const b=await get(`assets/voice/${n}.mp3`);SND.buf['voice/'+n]=b;if(b){const d=b.getChannelData(0);let sum=0,cnt=0;for(let i=0;i<d.length;i+=8){const v=d[i];if(Math.abs(v)>.02){sum+=v*v;cnt++;}}const rms=Math.sqrt(sum/Math.max(1,cnt));SND.norm[n]=clamp(.2/Math.max(rms,.01),.6,3);}})]);
 SND.ready=true;
 for(const n of ['drum','megdan','rain','night'])SND.buf['music/'+n]=await get(`assets/music/${n}.ogg`);}
function tone(freq,duration=.15,type='sine',gain=.08,end=freq){if(!audio||!audioEnabled||!settings.volume)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,audio.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),audio.currentTime+duration);g.gain.setValueAtTime(gain*settings.volume,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}
function panAt(x){return x==null?0:clamp((x-camera-VIEW_W/2)/(VIEW_W/2),-1,1)*.55;}
function playBuf(b,{gain=1,rate=1,pan=0,bus='sfx',delay=0}={}){if(!audio||!b||!SND.bus[bus])return null;const s=audio.createBufferSource();s.buffer=b;s.playbackRate.value=rate;const g=audio.createGain();g.gain.value=gain;s.connect(g);let node=g;if(pan&&audio.createStereoPanner){const pn=audio.createStereoPanner();pn.pan.value=pan;g.connect(pn);node=pn;}node.connect(SND.bus[bus]);s.start(audio.currentTime+delay);return s;}
// Random take from a sample group; false when samples are not loaded (callers fall back to synth tones).
function sfx(group,o={}){const list=SND.groups[group];if(!SND.ready||!list?.length)return false;const name=list[Math.floor(Math.random()*list.length)];const vary=o.vary??.12;return !!playBuf(SND.buf['sfx/'+name],{gain:o.gain??1,rate:(o.rate??1)*(1+(Math.random()-.5)*vary),pan:o.pan??panAt(o.x),delay:o.delay||0});}
const VOICE_SPEAKER={musa:'musa',vila:'vila',tr:'turk'};
// say('kill') plays a random line whose id is 'kill' or starts with 'kill_'. One line per speaker at a time; higher priority interrupts.
function say(group,{chance=1,priority=1,delay=0,x=null,gap=.6}={}){if(!audio||!SND.ready||Math.random()>chance)return false;const ids=SND.voices.filter(v=>(v===group||v.startsWith(group+'_'))&&SND.buf['voice/'+v]);if(!ids.length)return false;const speaker=VOICE_SPEAKER[group.split('_')[0]]||'marko';const now=audio.currentTime+delay,cur=SND.speaking[speaker];if(cur&&now<cur.until){if(priority<=cur.priority)return false;try{cur.src.stop();}catch{}}let id=ids[Math.floor(Math.random()*ids.length)];if(ids.length>1&&id===SND.last[group])id=ids[(ids.indexOf(id)+1)%ids.length];SND.last[group]=id;const b=SND.buf['voice/'+id];const src=playBuf(b,{bus:speaker==='turk'?'enemy':'voice',gain:SND.norm[id]||1,pan:speaker==='marko'?0:panAt(x)*.5,delay});SND.speaking[speaker]={src,until:now+b.duration+gap,priority};if(speaker!=='turk')SND.duckUntil=Math.max(SND.duckUntil,now+b.duration);return true;}
function sound(type){const lt=()=>{if(type==='hit'){tone(110,.13,'triangle',.5,30);tone(480,.06,'sawtooth',.1,90);}else if(type==='parry'){tone(740,.4,'triangle',.3,1400);tone(1110,.5,'sine',.15);}else if(type==='jump')tone(180,.18,'sine',.14,340);else if(type==='magic'){[440,660,880].forEach((f,i)=>setTimeout(()=>tone(f,.6,'sine',.16),i*80));}else if(type==='hurt')tone(130,.22,'sawtooth',.18,45);else if(type==='wine')tone(300,.35,'sine',.22,600);else tone(220,.1,'triangle',.1,150);};
 if(!SND.ready)return lt();
 if(type==='hit'){sfx('hit_body');sfx('hit_armor',{gain:.55});}else if(type==='parry'){sfx('clang',{gain:.9});sfx('ring',{gain:.45});}else if(type==='jump')sfx('cloth',{gain:.6});else if(type==='magic')sfx('magic',{gain:.75});else if(type==='hurt')sfx('hit_body',{gain:.8,rate:.85});else if(type==='wine')sfx('gulp',{gain:.8});else if(type==='swing'){if(p&&p.attack>0)sayGrunt(p.attackKind!=='light');else sfx('whoosh_heavy',{gain:.45});}else lt();}
function music(dt){if(!audio)return;ambience();const want=(zone===5||level?.id==='tvrdjava')&&mode!=='menu'?'megdan':'drum';const buf=SND.buf['music/'+want];const vol=audioEnabled?settings.volume:0;applyAudioLevels();
 if(buf){if(SND.trackName!==want){if(SND.track){const old=SND.track;old.g.gain.setTargetAtTime(0,audio.currentTime,.6);setTimeout(()=>{try{old.s.stop();}catch{}},3000);}const s=audio.createBufferSource();s.buffer=buf;s.loop=true;const g=audio.createGain();g.gain.value=0;g.gain.setTargetAtTime(1,audio.currentTime,.8);s.connect(g);g.connect(SND.bus.music);s.start();SND.track={s,g};SND.trackName=want;}return;}
 musicClock-=dt;if(musicClock<=0){const notes=[146.83,220,261.63,293.66,329.63,293.66,220,164.81];tone(notes[Math.floor(time/1.7)%notes.length],1.8,'triangle',.025);tone(73.4,2,'sine',.035);musicClock=1.7;}}
function toast(text,duration=3){$('toast').textContent=text;$('toast').classList.add('visible');toastTime=duration;}
function speak(text,duration=7){$('dialogue-text').textContent=text;$('dialogue').hidden=false;dialogueTime=duration;}
// kind 'dust' stays in the painted layer; everything else becomes glowing 3D sparks.
function burst(x,y,color,count=14,speed=150,kind='glow'){if(kind!=='dust'&&stage){stage.burst(x,y,color,count,speed);return;}for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=Math.random()*speed;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='dust'?speed*.35:0),life:.4+Math.random()*.5,max:1,color,r:(kind==='dust'?3:1)+Math.random()*3,kind});}}
function dust(x,y,count=6,spread=1){for(let i=0;i<count;i++)particles.push({x:x+(Math.random()-.5)*20*spread,y:y-2,vx:(Math.random()-.5)*90*spread,vy:-20-Math.random()*45,life:.45+Math.random()*.4,max:.85,color:'#cdb68a',r:4+Math.random()*6,kind:'dust'});}
function label(text,x,y,color='#f6d895'){floating.push({text:tr(text),x,y,life:1.1,color});}
function hideModals(){['menu','pause-menu','settings','lore','death','victory','levels','level-done','knjiga','riznica'].forEach(id=>$(id).hidden=true);}
function newPlayer(x=150){return{x,y:590,w:34,h:112,vx:0,vy:0,face:1,hp:120,maxHp:120,energy:100,wine:3,buff:0,invuln:0,attack:0,attackKind:'light',attackId:0,cooldown:0,parry:0,parryCooldown:0,dash:0,dashCooldown:0,grounded:true,coyote:.12,jumpBuffer:0,airLift:false,anim:0,gait:0,landing:0,mountTime:0,hurt:0,drink:0,castLock:0,crouch:0,crouching:false,blocking:false,blockTime:0,guard:100,guardBreak:0,rage:0,superImpact:false,spin:0,spinTick:0,spinTurns:0,climb:null,drop:0,throwT:0,wineMax:3,power:1,coins:0,down:0,comboWindow:0,wallJumpT:0,plungeT:0,hurtLock:0,wall:0,wallSide:0,cd:{throw:0,uvis:0,juris:0,plunge:0}};}
function newBoss(){return{x:29100,y:590,w:50,h:100,hp:3120,maxHp:3120,phase:1,mode:'idle',timer:1.5,face:-1,flash:0,stun:0,alive:true,hitIds:new Set(),attack:0,attackDone:false};}
function start(resume=false){showControls();level=null;perks=new Set();coins=[];chunks=[];thrown=null;levelIndex=-1;stage?.setLevel?.(null);endSequence=null;initAudio();world=makeWorld();defenses={0:{active:false,t:0,wave:0,done:false},1:{active:false,t:0,wave:0,done:false},4:{active:false,t:0,wave:0,done:false}};p=newPlayer();boss=newBoss();boss.hp=boss.maxHp=Math.round(3120*Math.max(1,D().hp*.92));hardenFoes(world.enemies);zone=0;checkpoint=0;camera=0;camY=CAM_Y0;elapsed=0;deaths=0;kills=0;relics=0;horseMounted=false;horseCompleted=false;horseX=10960;particles=[];arrows=[];floating=[];corpses=[];ghosts=[];if(resume&&saveState)restore(saveState);hideModals();mode='play';$('hud').hidden=false;$('controls').hidden=false;$('touch').hidden=!matchMedia('(pointer:coarse)').matches;$('boss-hud').hidden=true;speak(chapters[zone].message);keys.clear();pressed.clear();pendingMagic=null;fairy={x:p.x-55,y:p.y-125,age:99,duration:3.2,targetX:p.x,targetY:p.y-80,kind:"hover"};updateHud();}
function snapshot(){return{version:1,zone,checkpoint,elapsed,deaths,kills,relics,maxHp:p.maxHp,wine:p.wine,dead:world.enemies.filter(e=>!e.alive).map(e=>e.id),taken:world.items.filter(i=>i.taken).map(i=>i.id),runes:world.runes.map(r=>r.active),horseCompleted};}
function save(){saveState=snapshot();try{localStorage.setItem('marko-save',JSON.stringify(saveState));}catch{}$('continue').hidden=false;}
function restore(s){zone=clamp(s.zone||0,0,5);checkpoint=zone;p=newPlayer(chapters[zone].start+130);p.maxHp=s.maxHp||120;p.hp=p.maxHp;p.wine=Math.max(2,s.wine||0);elapsed=s.elapsed||0;deaths=s.deaths||0;kills=s.kills||0;relics=s.relics||0;world.enemies.forEach(e=>{if(s.dead?.includes(e.id))e.alive=false;});world.items.forEach(i=>i.taken=s.taken?.includes(i.id)||false);world.runes.forEach((r,i)=>r.active=!!s.runes?.[i]);horseCompleted=!!s.horseCompleted;horseMounted=false;camera=Math.max(chapters[zone].start,p.x-VIEW_W*.4);lastSafe=p.x;}
function retry(){if(level){const d=deaths;startLevel(levelIndex).then(()=>{deaths=d;});toast('Ravijojla: Još tvoja pesma nije završena.');return;}const d=deaths;start(!!saveState);deaths=d;toast('Ravijojla: Još tvoja pesma nije završena.');}
function die(){if(mode!=='play')return;say('death',{priority:6});deaths++;mode='dead';p.hp=0;p.attack=0;p.drink=0;p.dash=0;pendingMagic=null;arrows=[];keys.clear();pressed.clear();if(horseMounted){horseMounted=false;horseX=p.x+85;}const y=p.y>800?590:p.y,x=p.y>800?lastSafe:p.x;corpses.push(makeCorpse('marko',x,y,p.face,true,p.vy));endSequence={kind:'death',age:0};$('dialogue').hidden=true;$('death').hidden=true;updateHud();sound('hurt');}
function damage(amount,dir=0){if(p.invuln>0||p.dash>0)return;let blocked=false;if(p.blocking&&dir===-p.face){const cost=amount*2.3;if(p.guard>=cost){p.guard-=cost;amount*=.2;blocked=true;fx('parry',p.x+p.face*30,p.y-65);sound('parry');label('BLOK',p.x,p.y-135,'#bce5db');sfx('shield',{gain:.8});say('block',{chance:.65});}else{p.guard=0;p.guardBreak=.85;p.blocking=false;toast('Gard je slomljen',1);sfx('clang',{rate:.7});say('hurt',{priority:2});}}rumble(amount>=20?.8:.45,amount>=20?260:140);p.rage=Math.min(100,p.rage+amount*.7);const factor=D().dmg*(p.buff>0?.8:1)*(perks.has('musina-sablja')?.9:1);p.hp-=amount*factor;p.hurt=blocked?.06:.22;p.invuln=blocked?.2:D().invuln;p.vx+=dir*120;if(!blocked&&amount>=20&&!horseMounted&&p.hp-amount*factor>0&&p.grounded){p.down=DOWN_TIME;p.attack=0;p.spin=0;p.dash=0;p.vx=dir*300;p.invuln=Math.max(p.invuln,DOWN_TIME+.2);dust(p.x,p.y,10,1.6);}shake=settings.reduced?0:7;burst(p.x,p.y-60,'#ff6a50',12);fx('flash','#ff3020',.06);sound('hurt');if(p.hp>0)say('hurt',{chance:.8});if(p.hp<=0){p.hp=0;die();}}
function strike(heavy=false){if(p.plunge||p.down>0||p.ledgeT>0||p.wall||p.climb||thrown||p.throwT>0)return;if((p.attack>0&&p.chargeable&&!p.chargeReleased)||p.spin>0||p.cooldown>0||p.dash>0||p.drink>0||p.blocking||p.crouching||p.guardBreak>0||p.slide>0||p.kick>0)return;if(heavy&&tryLomilac())return;if(heavy&&!p.grounded&&has('tresak')&&level!==undefined){p.attack=.34;p.attackKind='tresak';p.cooldown=.3;p.attackId=++attackSerial;p.charge=0;p.chargeable=false;p.airAtk=false;sound('swing');sayGrunt(true);return;}if(!heavy){p.combo=p.comboWindow>0?((p.combo||0)+1)%3:0;if(!has('niz'))p.combo=0;p.comboImpact=false;}p.airAtk=!heavy&&!p.grounded;p.attack=heavy?.52:p.airAtk?.3:COMBO_TIME[p.combo];p.attackKind=heavy?'heavy':'light';p.runAtk=!heavy&&!p.airAtk&&p.grounded&&Math.abs(p.vx)>180&&(p.combo||0)===0;p.cooldown=heavy?.78:p.airAtk?.17:COMBO_CD[p.combo];if(!heavy)p.comboWindow=p.attack+.35;p.attackId=++attackSerial;p.charge=0;p.chargeable=heavy&&tap('KeyK')&&has('zamah');p.chargeFull=false;p.chargeReleased=false;sound('swing');powerSwing();if(heavy)say('atk',{chance:.4});}
const COMBO_TIME=[.36,.36,.5],COMBO_CD=[.3,.3,.56];function updateCooldowns(dt){if(p.cd)for(const k in p.cd)p.cd[k]=Math.max(0,p.cd[k]-dt);p.cdFlashT=Math.max(0,(p.cdFlashT||0)-dt);p.pogoT=Math.max(0,(p.pogoT||0)-dt);p.launchT=Math.max(0,(p.launchT||0)-dt);if(!p.grounded&&p.airAtk&&p.attack>0&&p.airHits>0&&!p.plunge)p.vy-=1750*.5*dt;if(p.grounded)p.airHits=0;if(p.attackKind==='heavy'&&p.attack>0&&p.chargeable&&!p.chargeReleased){const lvl=Math.floor(clamp((p.charge||0)/1.1,0,1)*3+.0001);if(lvl!==p.chargeLvl){p.chargeLvl=lvl;if(lvl>0)sfx('ring',{gain:.45,rate:1+lvl*.25});}}else p.chargeLvl=0;}
function attackDuration(){return p.attackKind==='tresak'?.34:p.attackKind==='light'&&p.airAtk?.3:p.attackKind==='lomilac'?.56:p.attackKind==='uvis'?.42:p.attackKind==='juris'?.42:p.attackKind==='super'?.95:p.attackKind==='counter'?.55:p.attackKind==='heavy'?.52:COMBO_TIME[p.combo||0];}
function superStrike(){if(!has('junacki')){locked('junacki');return;}if(p.rage<100){toast('Junački bes puni se pogocima i odbijanjem.',2);return;}if(p.cooldown>0||p.dash>0||p.drink>0||horseMounted||!p.grounded||p.guardBreak>0)return;p.rage=0;p.attack=.95;p.attackKind='super';p.cooldown=1.4;p.superImpact=false;p.blocking=false;p.crouching=false;p.crouch=0;p.invuln=Math.max(p.invuln,.7);sound('swing');toast('JUNAČKI UDAR',1.2);say('super',{priority:4,gap:0});say('tr_fear',{chance:.5,delay:1.2,x:p.x+p.face*200});say('vila_super',{chance:.3,delay:2.6});}
function isDown(...codes){if(p&&(p.down>0||p.ledgeT>0||p.plunge===2||p.dizzy>0))return false;return codes.some(c=>keys.has(c));}function tap(...codes){if(p&&(p.down>0||p.ledgeT>0||p.plunge===2||p.dizzy>0))return false;return codes.some(c=>pressed.has(c));}
function callFairy(kind,x,y){say('vila_'+(kind==='stun'||kind==='bridge'||kind==='lift'?kind:'heal'),{priority:2,x:fairy.x,delay:.2});say('fairy',{chance:.3});fairy.age=0;fairy.duration=3.2;fairy.kind=kind;fairy.targetX=x;fairy.targetY=y;p.castLock=.8;burst(fairy.x,fairy.y-25,'#caffdf',24,95);sound('magic');}
function useFairy(){
 if(p.castLock>0)return;
 if(level&&(useGoal()||pullLever()||pullLift()))return;
 if(zone===3&&!horseCompleted&&!horseMounted&&Math.abs(p.x-horseX)<180){horseMounted=true;p.mountTime=.55;p.x=horseX;say('horse',{priority:2});sfx('hoof',{gain:.8});sfx('hoof',{gain:.6,delay:.12});toast('Šarac · D za galop, Space za skok',4);sound('magic');fx('spell',horseX,520);return;}
 const rune=world.runes.find(r=>!r.active&&Math.abs(p.x-r.x)<120);
 if(rune){if(p.energy<30){toast('Sačekaj da se obnovi vilinska energija.');return;}p.energy-=30;callFairy('bridge',rune.x+200,530);pendingMagic={delay:.55,apply:()=>{rune.active=true;burst(rune.x+200,560,'#a7ffe0',50);fx('pillar',rune.x,565);toast('Ravijojla je probudila vilinski most');}};return;}
 if(p.energy<35){toast('Potrebno je 35 vilinske energije.');return;}
 p.energy-=35;
 if(!p.grounded&&!p.airLift&&has('uzlet')){callFairy('lift',p.x,p.y-120);p.vy=-620;p.airLift=true;burst(p.x,p.y,'#a6ffe1',35,220);fx('spell',p.x,p.y-20);toast('Vilinski uzlet',1.5);return;}
 const target=zone===5&&Math.abs(boss.x-p.x)<350?boss:world.enemies.find(e=>e.alive&&Math.abs(e.x-p.x)<330);
 callFairy(target?'stun':'heal',target?.x??p.x,target?target.y-70:p.y-45);
 pendingMagic={delay:.55,apply:()=>{world.enemies.filter(e=>e.alive&&Math.abs(e.x-p.x)<330).forEach(e=>{e.stun=2;e.mode='stun';});if(zone===5&&Math.abs(boss.x-p.x)<350){musaWindow('dazed',2.2,'RAVIJOJLIN BLJESAK');toast('Ravijojlin bljesak — napadni!',2);}else{{const h=Math.round(12*D().heal);p.hp=Math.min(p.maxHp,p.hp+h);toast(`Ravijojlin blagoslov · +${h} zdravlja`,2);}}burst(fairy.targetX,fairy.targetY,'#d0ffe2',35,200);fx('spell',fairy.targetX,fairy.targetY);}};
}
function updatePlayer(dt){
 for(const key of ['invuln','attack','cooldown','parry','parryCooldown','dash','dashCooldown','buff','landing','mountTime','hurt','drink','castLock','guardBreak','down','comboWindow','wallJumpT','plungeT','hurtLock','drop'])p[key]=Math.max(0,p[key]-dt);if(p.attackKind==='heavy'&&p.attack>0&&p.chargeable){const ph=1-p.attack/attackDuration();if(ph>=.36&&isDown('KeyK')&&!p.chargeReleased){p.attack+=dt;p.cooldown+=dt;p.charge=Math.min(1.1,p.charge+dt);if(p.charge>=1.1&&!p.chargeFull){p.chargeFull=true;fx('flash','#ffd27a',.06);sfx('ring',{gain:.6});label('PUN ZAMAH',p.x,p.y-150,'#ffd890');}}else if(ph>=.36&&p.charge>.15&&!p.chargeReleased){p.chargeReleased=true;sayGrunt(true);}}p.energy=Math.min(100,p.energy+dt*(perks.has('vilino-pero')?7.5:5.5));if(p.drink>0&&p.drink<.38&&!p.drinkApplied){p.drinkApplied=true;p.buff=12;p.hp=Math.min(p.maxHp,p.hp+Math.round(18*D().heal));sound("wine");say('wine',{priority:2,delay:.5});say('vila_wine',{chance:.5,delay:3.4});toast("Junačko vino · +30% snage · 12 sekundi",3);burst(p.x,p.y-65,"#e0a95a",20);fx('flash','#ffb040',.08);}p.anim+=dt;p.gait+=Math.abs(p.vx)*dt/(horseMounted?42:25);fairy.age+=dt;if(pendingMagic){pendingMagic.delay-=dt;if(pendingMagic.delay<=0){const effect=pendingMagic;pendingMagic=null;effect.apply();}}
 if(p.grounded){p.coyote=.12;p.airLift=false;}else p.coyote-=dt;
 if(climbInput())p.jumpBuffer=0;else if(tap('Space','KeyW','ArrowUp')&&!p.climb)p.jumpBuffer=.14;else p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
 p.crouching=p.grounded&&!horseMounted&&p.attack<=0&&p.drink<=0&&(isDown('KeyS','ArrowDown')||lowCeiling());p.crouch=clamp(p.crouch+(p.crouching?1:-1)*dt*7,0,1);p.h=112-48*p.crouch;
 p.blocking=isDown('KeyL')&&p.grounded&&!horseMounted&&!p.crouching&&p.attack<=0&&p.drink<=0&&p.dash<=0&&p.guardBreak<=0&&p.guard>0;
 p.blockTime=clamp(p.blockTime+(p.blocking?1:-1)*dt*8,0,1);p.guard=clamp(p.guard+dt*(p.blocking?-12:p.guardBreak>0?0:26),0,100);if(p.guard<=0&&p.blocking){p.guardBreak=.85;p.blocking=false;toast('Gard je slomljen',1);sfx('clang',{rate:.7});say('hurt',{priority:2});}
 if(tap('KeyR'))superStrike();updateCounter();if(p.plunge===1){p.vy=Math.max(p.vy,950);p.vx*=.9;}if(p.plunge===2&&p.plungeT<=0)p.plunge=0;updateSpin(dt);ambientVoices();
 if(p.attackKind==='super'&&p.attack>0&&p.attack<.45&&!p.superImpact){p.superImpact=true;sfx('boom',{gain:1});sfx('rock',{gain:.8});fx('hit',p.x+p.face*70,p.y-12,true);burst(p.x+p.face*70,p.y-12,'#ffcc72',24,240);dust(p.x,p.y,20,2.5);shake=settings.reduced?0:9;sound('hit');}
 const axis=(isDown('KeyD','ArrowRight')?1:0)-(isDown('KeyA','ArrowLeft')?1:0);if(axis)p.face=axis;
 const speed=horseMounted?480:265*(perks.has('sarceva-potkova')?1.07:1);const target=p.wallJumpT>.12?p.vx:axis*speed*(p.spin>0?.5:p.attackKind==='super'&&p.attack>0?.12:p.blocking?.22:p.crouching?.3:p.attack>0?(p.runAtk&&p.attackKind==='light'?.85:.5):p.drink>0?.45:1);p.vx+= (target-p.vx)*Math.min(1,dt*(p.grounded?20:9));
 if(p.jumpBuffer>0&&p.wall&&!p.grounded){p.vy=-650;p.vx=-p.wall*440;p.wallSide=p.wall;p.face=-p.wall;p.wall=0;p.wallJumpT=.32;p.jumpBuffer=0;sound('jump');sayGrunt(false);dust(p.x+p.wallSide*16,p.y-40,6,1);}if(p.jumpBuffer>0&&p.coyote>0&&!p.climb){p.vy=horseMounted?-780:p.launchT>0?-820:-665;if(p.launchT>0&&!horseMounted){p.launchT=0;label('ZA NJIM!',p.x,p.y-150,'#ffe39a');}p.grounded=false;p.coyote=0;p.jumpBuffer=0;p.crouching=false;p.crouch=0;p.h=112;p.blocking=false;sound('jump');dust(p.x,p.y,horseMounted?10:6);}
 if(tap('ShiftLeft','ShiftRight')&&p.dashCooldown<=0&&!horseMounted&&(has('kolut')||(locked('kolut'),false))){p.dash=ROLL_TIME;p.dashCooldown=.85;sfx('whoosh',{gain:.6,rate:.8});dust(p.x,p.y,8,1.5);}
 if(p.dash>0){p.vx=p.face*470;if(!p.grounded)p.vy=Math.min(p.vy,0);}moveExtras(dt);
 if(!p.grounded&&!horseMounted&&!p.plunge&&p.attack<=0&&isDown('KeyS','ArrowDown')&&tap('KeyJ')&&(has('nadole')||(locked('nadole'),false))&&(cdReady('plunge')||(cdDenied('plunge'),false)))startPlunge();else if(specialStrike()){}else if(isDown('KeyJ'))strike(false);if(isDown('KeyK'))strike(true);
 if(tap('KeyL')&&p.parryCooldown<=0&&p.guardBreak<=0&&!p.attack&&!p.drink&&!horseMounted&&has('kontra')){p.parry=D().parry;p.parryCooldown=.65;sound('swing');}
 if(tap('KeyQ')){if(p.wine>0&&p.buff<=0&&p.drink<=0){p.wine--;p.drink=.85;p.drinkApplied=false;p.attack=0;}else toast(p.buff>0?'Vino već daje snagu.':'Čutura je prazna. Potraži vino uz drum.',2);}
 if(tap('KeyE'))useFairy();if(tap('KeyI'))throwMace();
 if(p.mountTime>0)p.vx=0;const wasGrounded=p.grounded,fallSpeed=p.vy;if(!p.grounded&&p.vy>150&&perks.has('orlovo-pero')&&isDown('Space','KeyW','ArrowUp')&&!horseMounted&&!p.climb){p.vy=150;if(Math.random()<.3)burst(p.x,p.y-60,'#e8e0c8',1,40);}if(!ledgeUpdate(dt)&&!(level&&updateClimb(dt)))integrate(p,dt,world.platforms,world.runes);if(!p.grounded&&!p.climb){ledgeCheck();wallCheck();}else{p.wall=0;}if(p.plunge===1&&p.grounded)plungeImpact();if(!wasGrounded&&p.grounded&&fallSpeed>220){const lk=clamp((fallSpeed-220)/700,0,1);p.landing=.2;if(fallSpeed>930&&!horseMounted&&p.attack<=0&&rig?.['marko-roll-land'])p.rollLandT=ROLL_LAND_TIME;sfx(horseMounted?'hoof':'land',{gain:horseMounted?.9:.3+.45*lk});dust(p.x,p.y,horseMounted?16:Math.round(5+12*lk),horseMounted?2:1+1.3*lk);if(lk>.75&&!horseMounted){shake=Math.max(shake,settings.reduced?0:2+3*lk);rumble(.25+.3*lk,90);}tone(horseMounted?72:100,.1,"triangle",.12,45);if(horseMounted)shake=Math.max(shake,settings.reduced?0:3);}advanceFairy(dt);p.x=Math.max(chapters[zone].start+35,p.x);
 if(p.grounded&&p.on?.kind!=='crate'){lastSafe=p.x;lastSafeY=p.y;}if(p.y>(world.pitY||850)){damage(20);if(mode==='play'){p.x=Math.max(chapters[zone].start+80,lastSafe-(level?0:80));p.y=level?lastSafeY-160:420;p.climb=null;p.vy=0;p.vx=0;p.invuln=1.2;say('pit',{priority:3});toast('Ravijojla te izvukla iz ponora · −20 zdravlja',2);}}
 if(horseMounted){for(const b of world.barriers){if(Math.abs(p.x-b.x)<38&&p.y>b.y-b.h+10){damage(12,-1);dust(b.x,b.y,14,2);b.x=-1000;}}}
 for(const i of world.items){if(!i.taken&&Math.abs(p.x-i.x)<40&&Math.abs(p.y-38-i.y)<75){i.taken=true;if(i.type==='cudo'){collectCudo(i);continue;}if(i.type==='slovo'){collectLetter(i);continue;}if(i.type==='moc'){takePower(i);continue;}if(i.type==='srce'){takeHeart(i);continue;}if(i.type==='zapis'){takeZapis(i);continue;}if(i.type==='kljuc'){takeKey(i);continue;}if(i.type==='tovar'){i.plow.treasureTaken=true;sfx('coins',{gain:1});addCoins(20,i.x,i.y);label('TOVAR BLAGA',i.x,i.y-30,'#ffe6a0');continue;}if(i.type==='wine'){p.wine=Math.min(5,p.wine+1);label('+ VINO',i.x,i.y);}else if(i.type==='herb'){{const h=Math.round(25*D().heal);p.hp=Math.min(p.maxHp,p.hp+h);label('+'+h,i.x,i.y,'#c0edb0');}}else{relics++;p.maxHp+=10;p.hp=Math.min(p.maxHp,p.hp+25);label('ZAPIS LEGENDE',i.x,i.y);say('relic',{priority:2});sfx('coins');toast('Pronađen zapis · maksimalno zdravlje +10');}sound('wine');burst(i.x,i.y,'#e7c982',12);}}
 if(level){strikeCrates();updatePlows(dt);updateTraps(dt);updateArena();updatePuzzles(dt);pogo();}updateSpecial(dt);updateHints(dt);updateStreak(dt);updateCooldowns(dt);updateFoeStates(dt);abilityBar(dt);updatePowers(dt);updateThrow(dt);updateCoins(dt);updateChunks(dt);
 const z=chapters[zone];if(p.x>z.end-130&&zone<5){const remaining=world.enemies.filter(e=>e.zone===zone&&e.alive).length;const locked=(defenses[zone]&&!defenses[zone].done)||remaining>0||(zone===2&&world.runes.some(r=>!r.active))||(zone===3&&!horseMounted);if(locked){p.x=Math.min(p.x,z.end-95);if(tap('KeyE')||time%3<dt)toast(remaining?`Preostalo čuvara: ${remaining}. Oslobodi drum.`:zone===2?'Probudi sva tri vilinska kamena.':zone===3?'Za ovaj prolaz potreban je Šarac.':'Zaštiti putnike dok prolaze kroz kapiju.',2);}else enterChapter(zone+1);}
 if(zone===5){p.x=clamp(p.x,28060,29830);}if(level){p.x=Math.min(p.x,level.width-30);updateGoals(dt);if(p.x>=level.goal.x-50){if(!pendingGoal())completeLevel();else{p.x=level.goal.x-52;goalHint(`Još nije kraj: ${goalText()}.`);}}}
 // visual only: footstep dust and dash afterimages
 const step=Math.floor(p.gait/3);if(p.grounded&&Math.abs(p.vx)>120&&step!==p.lastStep&&!p.dash){dust(p.x-p.face*14,p.y,horseMounted?5:2,horseMounted?1.4:.6);if(horseMounted){sfx('hoof',{gain:.55});sfx('hoof',{gain:.4,delay:.07});sfx('hoof',{gain:.45,delay:.15});}else sfx('step',{gain:.28});}p.lastStep=step;if(p.rage>=100&&!p.rageSaid){p.rageSaid=true;say('rage',{priority:2});}else if(p.rage<100)p.rageSaid=false;if(p.hp>0&&p.hp/p.maxHp<.3&&audio&&audio.currentTime-SND.lowAt>25){SND.lowAt=audio.currentTime;say('low',{priority:2});}
 if(p.dash>0&&(p.ghostClock=(p.ghostClock||0)-dt)<=0){p.ghostClock=.075;ghosts.push({...playerPose(),x:p.x,y:p.y,face:p.face,life:.2});}
}
function enterChapter(next){markChapter(next);sfx('horn_call',{gain:.6});{const [num,name]=chapters[next].name.split(' · ');showTitle(`POGLAVLJE ${num}`,name.charAt(0)+name.slice(1).toLowerCase(),chapters[next].goal);}if(next===5){say('musa_intro',{priority:3,delay:1.4});say('boss',{priority:3,delay:6.4});}else say('chapter',{chance:.75,delay:.4});zone=next;checkpoint=next;p.x=Math.max(p.x,chapters[next].start+100);if(next===4){horseMounted=false;horseCompleted=true;horseX=24580;p.x=24630;}p.hp=p.maxHp;p.energy=100;p.wine=Math.max(2,p.wine);p.invuln=2;lastSafe=p.x;arrows=[];save();toast('Kontrolna tačka · napredak sačuvan',3);speak(chapters[zone].message);sound('magic');fx('flash','#ffd890',.1);}
function attackActive(){const d=attackDuration();if(p.attackKind==='super')return p.attack>0&&p.attack<d*.5&&p.attack>d*.18;return p.attack>0&&p.attack<d*.58&&p.attack>d*.12;}
function slay(e,launch=0){if(!e.alive)return;if(e.keyHolder)dropKey(e);bookKill(e);blood(e.x,e.y-60,p.x<e.x?1:-1,22);e.alive=false;kills++;if(level){addCoins(e.champion?0:e.elite?6:2,e.x,e.y-60);if(e.champion){slowMo=1;hitstop=Math.max(hitstop,.12);fx('flash','#fff2d0',.12);}}say('tr_death',{chance:.55,x:e.x});sfx('fall',{gain:.7,delay:.45,x:e.x});sfx('leather',{gain:.4,delay:.5,x:e.x});say('kill',{chance:.8,delay:.35});corpses.push(launchCorpse(makeCorpse(e.type,e.x,e.y,e.face),launch,e.x));fx('kill',e.x,e.y);}
function hitEnemy(e){if(e.hitId===p.attackId||!attackActive())return;const range=p.attackKind==='tresak'?135:p.attackKind==='lomilac'?150:p.attackKind==='juris'?150:p.attackKind==='uvis'?125:p.attackKind==='super'?210:p.attackKind==='heavy'?145+((p.charge||0)>.35?30:0):p.attackKind==='counter'||p.combo===2?130:115;if(Math.abs(e.x-p.x)>range||Math.abs(e.y-p.y)>85||(e.x-p.x)*p.face< -25)return;e.hitId=p.attackId;const heavy=p.attackKind!=='light';if(e.type==='shield'&&!heavy&&e.stun<=0&&e.face!==p.face&&!(e.guardBroken>0)&&(e.x-p.x)*p.face>0){say('guard',{chance:.6});sfx('shield',{gain:.8,x:e.x});label('GARD',e.x,e.y-120,'#c4dbd2');sound('parry');fx('burst',e.x-e.face*-30,e.y-60,'#dfe8ff',10,160);return;}if(e.type==='oklopnik'&&p.attackKind==='light'&&(e.armor??(e.champion?5:3))>0&&!(e.guardBroken>0)){label('OKLOP',e.x,e.y-130,'#d8d2c0');sfx('clang',{gain:.8,x:e.x});fx('burst',e.x-p.face*20,e.y-70,'#ffe9c0',10,170);say('guard',{chance:.4});return;}const defMul=foeDefense(e,heavy);if(defMul===0)return;const amount=defMul*(p.attackKind==='lomilac'?1.5:1)*(p.attackKind==='super'?200:p.attackKind==='counter'?44:heavy?48*chargeMult():29*(p.combo===2?1.8:1))*(p.buff>0?1.3:1)*(p.power||1)*(p.attackKind==='light'&&perks.has('oceva-sablja')?1.12:1)*(heavy&&perks.has('zlatno-ralo')?1.12:1)*(p.pow?.id==='oganj'?1.2:1);e.hp-=amount;powerHit(e);streakHit(e);if(p.attackKind==='lomilac'&&!e.champion){e.vx=p.face*420;e.vy=-260;e.grounded=false;e.air=true;e.stun=Math.max(e.stun,1.2);}if(!p.grounded)airHit(e);if(p.attackKind==='uvis'&&!e.champion&&e.type==='oklopnik'&&(e.armor??3)>0)label('PRETEŽAK',e.x,e.y-150,'#d8d2c0');else if(p.attackKind==='uvis'&&!e.champion){e.air=true;e.vx=0;label('U VAZDUH!',e.x,e.y-150,'#ffe39a');e.juggle=1.2;e.vy=-660;e.grounded=false;e.air=true;e.climb=null;e.stun=Math.max(e.stun,1.3);}if(p.attackKind!=='super')p.rage=Math.min(100,p.rage+(heavy?18:12)*(perks.has('gusle')?1.25:1));e.flash=.15;e.stun=heavy?1:.32;e.mode='stun';e.knock=p.face*(heavy?16+(p.charge||0)*30:p.combo===2?18:8);e.hurtT=.34;fx('hit',e.x-p.face*8,e.y-62,heavy);blood(e.x-p.face*6,e.y-66,p.face,p.attackKind==='super'?40:heavy?24:13);sound('hit');shake=settings.reduced?0:heavy?5:2;hitstop=.035;label(Math.round(amount),e.x,e.y-110);if(e.hp<=0){slay(e,launchPower());dust(e.x,e.y,10,1.4);p.energy=Math.min(100,p.energy+7);}}
function enemyAttack(e){const distance=Math.abs(p.x-e.x);if(e.type==='archer'){sfx('bow',{gain:.7,x:e.x});arrows.push(level?{...aimArrow(e),life:3,enemy:true}:{x:e.x+e.face*30,y:e.y-80,vx:e.face*390,life:3,enemy:true});sound('swing');return;}if(distance<(e.champion?140:105)&&Math.abs(p.y-e.y)<80){if(p.parry>0&&(e.x-p.x)*p.face>=-15){e.stun=2;e.mode='stun';p.energy=Math.min(100,p.energy+15);fx('parry',p.x+p.face*40,p.y-70);burst(p.x+p.face*40,p.y-70,'#dcfff0',30);p.rage=Math.min(100,p.rage+25);sound('parry');say('block',{chance:.5,delay:.15});label('SAVRŠENO',p.x,p.y-140,'#bfffe5');startCounter(e.x);}else damage((e.type==='shield'?18:14)*(e.champion?1.5:e.elite?1.25:1),e.face);}}
function updateEnemies(dt){updateFires(dt);for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;const F=FOES[e.type];if(level){foeBody(e,dt);if(!e.alive)continue;if(e.grounded&&!e.climb)e.vx=0;}else if(e.air){e.vx=e.vx||0;e.vy=e.vy||0;e.h=e.h||75;e.floorOnly=true;foeBody(e,dt);if(!e.alive)continue;if(e.grounded)e.vx=0;}foeMotion(e,dt);e.flash=Math.max(0,e.flash-dt);e.hurtT=Math.max(0,(e.hurtT||0)-dt);e.stun=Math.max(0,e.stun-dt);e.knock=(e.knock||0)*Math.pow(.0008,dt);if(!level)e.moveT=0;hitEnemy(e);if(!e.alive)continue;if(e.stun>0||(e.air&&!e.grounded&&e.juggle>0))continue;if(e.mode==='stun'){e.mode='idle';e.timer=.5;}const dx=p.x-e.x,d=Math.abs(dx);if(e.type==='shield'&&level){const want=dx>0?1:-1;if(want!==e.face){e.turnT=(e.turnT||0)+dt;if(e.turnT>.55){e.face=want;e.turnT=0;}}else e.turnT=0;}else e.face=dx>0?1:-1;e.timer-=dt;if(e.mode==='windup'){if(e.timer<=0){e.mode='recover';e.timer=F?.recover??(e.type==='shield'?1.1:.85);if(e.champion&&championAttack(e,F)){}else if(F)foeAttack(e,F);else enemyAttack(e);}}else if(e.mode==='recover'){if(e.timer<=0){e.mode='idle';e.timer=.3;}}else if(level?levelFoe(e,F,dx,d,dt):d<650){const reach=F?.reach??(e.type==='archer'?480:84);if(d>reach){const nx=e.x+e.face*(F?.speed??(e.type==='shield'?65:95))*dt;const ground=world.platforms.some(q=>q.kind!=='magic'&&nx>q.x+25&&nx<q.x+q.w-25&&Math.abs(q.y-e.y)<2);if(ground){e.walk=(e.walk||0)+Math.abs(nx-e.x);e.moveT=.12;e.x=nx;}}else if(e.timer<=0){if(e.type!=='archer')sfx('draw',{gain:.3,x:e.x});else sfx('cloth',{gain:.35,x:e.x});say('tr_attack',{chance:.12,x:e.x});e.mode='windup';e.timer=(F?.windup??(e.type==='archer'?1.05:.7))*D().wind;if(F)e.variant=F.pick(d);e.windupDuration=e.timer;}}}}
function updateArrows(dt){for(const a of arrows){a.x+=a.vx*dt;if(!a.torch&&a.vy)a.y+=a.vy*dt;a.life-=dt;if(level&&!a.torch&&world.platforms.some(q=>q.solid&&!q.off&&a.x>q.x&&a.x<q.x+q.w&&a.y>q.y+4&&a.y<q.y+q.h)){a.life=0;dust(a.x,a.y,2,.5);continue;}if(a.torch){a.vy+=900*dt;a.y+=a.vy*dt;a.rot=(a.rot||0)+dt*12*Math.sign(a.vx);const gy=groundAt(a.x,a.y-40);if(gy!==null&&a.y>=gy){addFire(a.x,gy,a.enemy?2.8:1.5,80);sfx('boom',{gain:.35,rate:1.6,x:a.x});a.life=0;continue;}if(a.y>900){a.life=0;continue;}}if(a.life>0&&Math.abs(a.x-p.x)<27&&a.y>p.y-p.h&&a.y<p.y){if(p.parry>0){a.enemy=false;a.vx=-a.vx;if(a.vy)a.vy=-a.vy;p.rage=Math.min(100,p.rage+20);sound('parry');fx('parry',a.x,a.y);burst(a.x,a.y,'#e6fff3',10);}else if(a.enemy){damage(a.wave?20:a.bullet?24:11,Math.sign(a.vx));a.life=0;}}if(!a.enemy){for(const e of world.enemies){if(e.alive&&Math.abs(a.x-e.x)<30&&a.y>e.y-135&&a.y<e.y+12){e.hp-=e.type==='archer'&&!e.champion?999:40;if(e.type==='archer')weakHit('SOPSTVENA STRELA!');e.stun=1;e.flash=.15;a.life=0;fx('hit',e.x,e.y-70,false);if(e.hp<=0)slay(e);break;}}}}arrows=arrows.filter(a=>a.life>0);}
// Vihor (hold F): Marko spins with the mace and hits everyone around him while his rage drains.
const SPIN_MIN=25,SPIN_DRAIN=26,SPIN_TICK=.24;
function updateSpin(dt){if(p.dizzy>0){p.dizzy-=dt;p.vx*=Math.pow(.02,dt);if(p.dizzy<=0){p.dizzy=0;fallDizzy();}return;}if(tap('KeyF')&&!has('vihor'))locked('vihor');const can=has('vihor')&&isDown('KeyF')&&p.grounded&&!horseMounted&&p.attack<=0&&p.drink<=0&&p.dash<=0&&!p.blocking&&p.guardBreak<=0;
 if(can&&(p.spin>0?p.rage>0:p.rage>=SPIN_MIN)){if(p.spin<=0){p.spinTick=.06;p.spinTurns=-1;say('spin',{priority:3});say('tr_fear',{chance:.5,x:p.x+p.face*200});toast('VIHOR',1);}
  p.spin+=dt;p.rage=Math.max(0,p.rage-SPIN_DRAIN*dt);p.crouching=false;p.blocking=false;
  const turn=Math.floor(p.spin/.18);if(turn!==p.spinTurns){p.spinTurns=turn;sfx('whoosh_heavy',{gain:.32,rate:1.15});if(turn%4===0)sayGrunt(true);}
  p.spinTick-=dt;if(p.spinTick<=0){p.spinTick=SPIN_TICK;spinHit();}
  if(p.rage<=0){spinDizzy();p.spin=0;p.cooldown=Math.max(p.cooldown,.5);toast('Bes je potrošen',1.2);}}
 else if(p.spin>0){spinDizzy();p.spin=0;p.cooldown=Math.max(p.cooldown,.3);}
 else if(tap('KeyF')&&p.rage<SPIN_MIN)toast(`Vihor traži bar ${SPIN_MIN} besa · bes se puni udarcima`,2);}
function spinHit(){const power=p.buff>0?1.3:1;let hits=0;
 for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;const dx=e.x-p.x;if(Math.abs(dx)>125||Math.abs(e.y-p.y)>90)continue;const amount=16*power;e.hp-=amount;e.flash=.12;e.stun=Math.max(e.stun,.3);e.mode='stun';e.knock=Math.sign(dx||1)*12;hits++;fx('hit',e.x-Math.sign(dx||1)*8,e.y-62,false);label(Math.round(amount),e.x,e.y-110);if(e.hp<=0){slay(e,launchPower());dust(e.x,e.y,10,1.4);p.energy=Math.min(100,p.energy+5);}}
 if(zone===5&&boss.alive&&Math.abs(boss.x-p.x)<150){if(MUSA_OPEN.includes(boss.mode)){const amount=22*power;boss.hp=Math.max(0,boss.hp-amount);boss.flash=.12;fx('hit',boss.x,boss.y-80,false);label(Math.round(amount),boss.x,boss.y-160);hits++;bossAfterDamage();}else if(p.spinTurns%3===0){label('ČELIČNI GARD',boss.x,boss.y-170,'#c1ced4');sfx('clang',{gain:.6});}}
 if(hits){sound('hit');shake=settings.reduced?0:3;}dust(p.x,p.y,4,1.6);}
function sayGrunt(heavy){if(time-lastGrunt<(heavy?1.6:2.4)||Math.random()>(heavy?.6:.3))return sfx(heavy?'whoosh_heavy':'whoosh',{gain:.5});lastGrunt=time;gruntCount++;if(!audio||!SND.ready)return sfx(heavy?'whoosh_heavy':'whoosh',{gain:.6});if(p.attackKind==='super'&&p.attack>0)return;const m=SND.speaking.marko;if(m&&audio.currentTime<m.until-.4)return;const ids=SND.voices.filter(v=>v.startsWith(heavy?'gruntheavy_':'grunt_')&&SND.buf['voice/'+v]);if(!ids.length)return sfx('whoosh',{gain:.6});let id=ids[Math.floor(Math.random()*ids.length)];if(ids.length>1&&id===SND.lastGrunt)id=ids[(ids.indexOf(id)+1)%ids.length];SND.lastGrunt=id;playBuf(SND.buf['voice/'+id],{bus:'voice',gain:(heavy?.8:.65)*(SND.norm[id]||1),rate:.95+Math.random()*.1});}
// Trash talk while enemies are close, Musa's taunts, Ravijojla worrying about Marko.
function ambientVoices(){if(!audio||!SND.ready)return;const t=audio.currentTime;if(zone===5&&boss.alive){if(t-(SND.musaAt||0)>16&&Math.abs(boss.x-p.x)<500){SND.musaAt=t;say('musa_taunt',{chance:.7,x:boss.x});}}else if(t-(SND.tauntAt||0)>13&&world.enemies.some(e=>e.alive&&e.zone===zone&&Math.abs(e.x-p.x)<420)){SND.tauntAt=t;say('taunt',{chance:.65});}
 if(p.hp>0&&p.hp/p.maxHp<.25&&t-(SND.worryAt||0)>30){SND.worryAt=t;say('vila_worry',{delay:1.8,priority:2});}}
function drawSpinFx(){if(!(p.spin>0))return;const a0=p.spin*17,cx=p.x,cy=p.y-60;for(const [g,al] of [[gctx,.55],[ctx,.22]]){g.save();g.translate(cx,cy);g.scale(1,.38);for(let k=0;k<3;k++){const a=a0+k*2.09;g.beginPath();g.arc(0,0,98,a,a+1.25);g.arc(0,0,74,a+1.25,a,true);g.closePath();const gr=g.createRadialGradient(0,0,70,0,0,100);gr.addColorStop(0,'rgba(255,220,150,0)');gr.addColorStop(1,`rgba(255,226,170,${al})`);g.fillStyle=gr;g.fill();}g.restore();}emitters.push({id:'spin',kind:'buff',x:p.x,y:p.y+40,rate:34});}

function win(){try{localStorage.setItem('marko-kacanik','won');}catch{}const finalLaunch=launchPower();grantCudo('musina-sablja');say('musa_death',{priority:5,x:boss.x});say('victory',{priority:5,delay:3.2});sfx('boom',{gain:.7});boss.alive=false;mode='victory';corpses.push(launchCorpse(makeCorpse('musa',boss.x,boss.y,boss.face,true),finalLaunch*.6,boss.x));endSequence={kind:'victory',age:0};p.attack=0;p.dash=0;pendingMagic=null;arrows=[];keys.clear();pressed.clear();fx('roar',boss.x,boss.y);$('victory').hidden=true;$('boss-hud').hidden=true;$('dialogue').hidden=true;$('stats').innerHTML=`<div><b>${formatTime(elapsed)}</b>Vreme prolaska</div><div><b>${kills}</b>Poraženi čuvari</div><div><b>${relics}/3</b>Zapisi legende</div>`;try{localStorage.removeItem('marko-save');}catch{}saveState=null;$('continue').hidden=true;sound('magic');}
function formatTime(t){return`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
function updateDefense(dt){const d=defenses[zone];if(!d||d.done)return;const end=chapters[zone].end;if(!d.active&&p.x>end-650){d.active=true;speak('Putnici beže kroz kapiju! Zadrži pojačanje dok svi ne pređu. Tri talasa dolaze sa obe strane.',6);toast('ODBRANA PROLAZA · tri talasa',3);}if(!d.active)return;d.t+=dt;if(d.wave<3&&d.t>=d.wave*12){const wave=d.wave++;for(let i=0;i<3;i++){const type=['sword','shield','archer'][(i+wave)%3],hp=type==='shield'?150:110;world.enemies.push({id:1000+zone*100+wave*3+i,x:end-1050+i*330,y:590,w:36,h:75,hp,maxHp:hp,type,zone,face:-1,mode:'idle',timer:1.2,stun:0,flash:0,alive:true,home:end-900,attackId:0});dust(end-1050+i*330,590,12,1.6);}world.items.push({id:1000+zone*10+wave,x:end-600,y:550,type:wave===1?'wine':'herb',taken:false});toast(`Pojačanje · talas ${d.wave}/3`,2);say('tr_alarm',{x:end-900});}if(d.wave===3&&d.t>=36&&!world.enemies.some(e=>e.alive&&e.zone===zone)){d.done=true;toast('Putnici su bezbedni. Kapija je otvorena!',3);sound('magic');}}
function updateHud(){if(!p)return;$('rage-fill').style.width=p.rage+'%';$('guard-fill').style.width=p.guard+'%';$('rage-label').textContent=p.rage>=100?'R · SPREMNO':'R · BES '+Math.floor(p.rage);$('rage-label').classList.toggle?.('ready',p.rage>=100);$('health').style.width=`${p.hp/p.maxHp*100}%`;$('energy').style.width=`${p.energy}%`;$('wine').textContent='◆ '.repeat(p.wine)+'◇ '.repeat(Math.max(0,3-p.wine));$('coins').textContent='⛁ '+bankCache;$('buff').textContent=(p.buff>0?`${Math.ceil(p.buff)}s `:'')+(p.pow?`${POWERS[p.pow.id].name.split(' ')[0].toUpperCase()} ${Math.ceil(p.pow.t)}s`:'');lettersHud();$('chapter').textContent=chapters[zone].name;$('objective').textContent=defenses[zone]?.active&&!defenses[zone].done?`Zaštiti putnike · talas ${defenses[zone].wave}/3`:zone===2?`Probudi vilinske kamenove · ${world.runes.filter(r=>r.active).length}/3`:zone===3&&horseMounted?'Šarčev galop · Space za skok':level?goalText():chapters[zone].goal;$('progress').firstElementChild.style.width=`${p.x/(level?level.width:29900)*100}%`;$('boss-hud').hidden=!((zone===5&&mode!=='victory')||(arena&&mode==='play'));if(arena){const c=arena.boss,h=$('boss-hud').querySelector?.('h2'),sm=$('boss-hud').querySelector?.('small');if(h?.firstChild)h.firstChild.textContent=c.name+' ';if(sm)sm.textContent='MEGDAN';$('hearts').textContent='';$('boss-health').style.width=`${Math.max(0,c.hp/c.maxHp*100)}%`;$('boss-hint').textContent=c.hp<c.maxHp/2?'Razjaren je! Svaki treći napad je poseban.':'Svaki treći napad je poseban — pazi na znak.';}else if(zone===5){const h=$('boss-hud').querySelector?.('h2'),sm=$('boss-hud').querySelector?.('small');if(h?.firstChild)h.firstChild.textContent='Musa Kesedžija ';if(sm)sm.textContent='MEGDAN U KAČANIKU';}if(zone===5){$('boss-health').style.width=`${boss.hp/boss.maxHp*100}%`;$('hearts').textContent='♥ '.repeat(4-boss.phase)+'♡ '.repeat(boss.phase-1);$('boss-hint').textContent=MUSA_OPEN.includes(boss.mode)?'OTVOREN JE — UDRI NIZOM, PET UDARACA ZA JUNAČKI NIZ':boss.mode==='leapPrep'||boss.mode==='leap'?'SKAČE NA TEBE — SKOČI ILI SE OTKOTRLJAJ':boss.mode==='chargePrep'||boss.mode==='charge'?'JURIŠ — PRESKOČI GA ILI KOLUT KROZ NJEGA':boss.mode==='windup'||boss.mode==='second'?'PRIPREMI ODBIJANJE · L':'Prati zamah. Ravijojla može otvoriti njegov gard · E';}}
function updateVisuals(dt){for(const f of floating){f.y-=30*dt;f.life-=dt;}floating=floating.filter(f=>f.life>0);for(const a of particles){a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=(a.kind==='dust'?-10:a.kind==='blood'?1400:120)*dt;if(a.kind==='blood'&&a.y>=a.gy){a.life=0;if(decals.length>420)decals.shift();decals.push({x:a.x,y:a.gy,r:a.r*(1.4+Math.random()*1.8),t:0});}a.vx*=1-dt*2;a.life-=dt;}particles=particles.filter(a=>a.life>0);for(const c of corpses){const before=c.t;if(!c.grounded)integrate(c,dt,world.platforms,world.runes);if(c.launched)flyCorpse(c,dt);if(c.y>850){if(c.launched&&!c.persist)c.t=99;else{c.x=c.launched?clamp(c.x,28060,29840):lastSafe;c.y=590;c.grounded=true;}}c.t+=dt;if(before<.7&&c.t>=.7)dust(c.x-c.face*20,c.y,10,1.6);}corpses=corpses.filter(c=>c.persist||c.t<(c.launched?4.4:3.2));if(endSequence){endSequence.age+=dt;const body=corpses.find(c=>c.type===(endSequence.kind==='death'?'marko':'musa'));if(endSequence.age>=1.55&&body?.grounded)$(endSequence.kind).hidden=false;}for(const g of ghosts)g.life-=dt;ghosts=ghosts.filter(g=>g.life>0);}
function updateCamera(dt){const lead=horseMounted?.3:.4;const desired=clamp(p.x-VIEW_W*lead,chapters[zone].start,Math.max(chapters[zone].start,chapters[zone].end-VIEW_W));camera+=(desired-camera)*Math.min(1,dt*5);const wantY=level?levelCameraY(dt):CAM_Y0+Math.min(0,p.y-470)*.55;camY+=(wantY-camY)*Math.min(1,dt*(level?4:3));}
function update(dt){if(slowMo>0&&mode==='play'){slowMo-=dt;dt*=.35;}if(mode!=='play')music(dt);if(mode==='pause'){pressed.clear();return;}if(mode==="play"||mode==="menu")time+=dt;if(mode!=='play'){if(mode==='menu'){camera=650+Math.sin(time*.045)*560;camY=CAM_Y0;}updateVisuals(dt);pressed.clear();return;}elapsed+=dt;music(dt);updateDefense(dt);if(hitstop>0){hitstop-=dt;return;}updatePlayer(dt);if(mode==='play'){updateEnemies(dt);if(mode==='play')updateBoss(dt);if(mode==='play')updateArrows(dt);}updateVisuals(dt);shake=Math.max(0,shake-dt*18);updateCamera(dt);if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('visible');}if(dialogueTime>0){dialogueTime-=dt;if(dialogueTime<=0)$('dialogue').hidden=true;}updateHud();pressed.clear();}

// ======================= drawing =======================
// how hard: Pripovedač (story) forgives, Junak (normal) bites, Epski (epic) is merciless
const DIFF={story:{dmg:.55,hp:.85,wind:1.35,heal:1.3,extra:0,invuln:1.1,parry:.6},normal:{dmg:1.3,hp:1.2,wind:.86,heal:.8,extra:.3,invuln:.85,parry:.3},epic:{dmg:1.75,hp:1.45,wind:.74,heal:.6,extra:.55,invuln:.7,parry:.24},classic:{dmg:1,hp:1,wind:1,heal:1,extra:0,invuln:1,parry:.32}};
const D=()=>DIFF[settings.difficulty]||DIFF.normal;
function hardenFoes(list){for(const e of list){if(e.hardened)continue;e.hardened=true;e.hp=e.maxHp=Math.round(e.maxHp*D().hp);}}
let pxScale=1,glowScale=.5,emitters=[];
function poly(points,fill,stroke,g=ctx){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.stroke();}}
function ellipse(x,y,rx,ry,color,g=ctx){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);g.fillStyle=color;g.fill();}
function line(x,y,x2,y2,color,width=2,g=ctx){g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function halo(x,y,r,color,alpha=1){if(r<=0||alpha<=0)return;const g=gctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');gctx.globalAlpha=alpha;gctx.fillStyle=g;gctx.fillRect(x-r,y-r,r*2,r*2);gctx.globalAlpha=1;}
function textLabel(text,x,y,{font='bold 15px Georgia',color='#fff0c8',glow=null,alpha=1}={}){text=tr(text);ctx.save();ctx.globalAlpha=alpha;ctx.font=font;if(ctx.measureText)y=placeLabel(x,y,ctx.measureText(text).width,+(font.match(/(\d+)px/)?.[1]||15));ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='rgba(12,10,8,.75)';ctx.strokeText(text,x,y);ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore();if(glow){gctx.save();gctx.globalAlpha=alpha*.55;gctx.font=font;gctx.textAlign='center';gctx.fillStyle=glow;gctx.fillText(text,x,y);gctx.restore();}}
// Draws one rig frame with its sole on (x,y). Silhouettes (flash, coloured glow rims) are built on a scratch canvas.
function silhouette(im,f,w,h,color,outline){const pad=outline?Math.ceil(outline)+2:0,w2=w+pad*2,h2=h+pad*2;if(scratch.width<w2||scratch.height<h2){scratch.width=Math.max(scratch.width,w2);scratch.height=Math.max(scratch.height,h2);}sctx.setTransform(1,0,0,1,0,0);sctx.globalAlpha=1;sctx.globalCompositeOperation='source-over';sctx.clearRect(0,0,w2,h2);if(outline){for(let i=0;i<8;i++){const a=i*Math.PI/4;sctx.drawImage(im,f[0],f[1],f[2],f[3],pad+Math.cos(a)*outline,pad+Math.sin(a)*outline,w,h);}}else sctx.drawImage(im,f[0],f[1],f[2],f[3],0,0,w,h);sctx.globalCompositeOperation='source-in';sctx.fillStyle=color;sctx.fillRect(0,0,w2,h2);if(outline){sctx.globalCompositeOperation='destination-out';sctx.drawImage(im,f[0],f[1],f[2],f[3],pad,pad,w,h);}sctx.globalCompositeOperation='source-over';return{pad,w2,h2};}
function rigDraw(name,frame,x,y,face=1,o={}){const r=rig?.[name],im=r&&rigImages[r.image];if(!im)return false;const f=r.frames[clamp(Math.floor(frame),0,r.frames.length-1)],k=r.scale*(o.scale||1),g=o.glow?gctx:ctx,dev=o.glow?glowScale:pxScale;g.save();g.translate(x+(o.dx||0),y+(o.dy||0));if(o.rot)g.rotate(o.rot);g.scale(face*(o.sx||1),o.sy||1);g.globalAlpha=o.alpha??1;const dx=-r.anchor*k,dy=-f[4]*k,dw=f[2]*k,dh=f[3]*k;if(o.color){const pw=Math.max(1,Math.round(dw*dev)),ph=Math.max(1,Math.round(dh*dev)),s=silhouette(im,f,pw,ph,o.color,o.outline?o.outline*dev:0),pad=s.pad/dev;g.drawImage(scratch,0,0,s.w2,s.h2,dx-pad,dy-pad,dw+pad*2,dh+pad*2);}else{g.drawImage(im,f[0],f[1],f[2],f[3],dx,dy,dw,dh);if(o.flash>0){const pw=Math.max(1,Math.round(dw*dev)),ph=Math.max(1,Math.round(dh*dev)),s=silhouette(im,f,pw,ph,o.flashColor||'#ffffff',0);g.globalAlpha=(o.alpha??1)*Math.min(1,o.flash);g.drawImage(scratch,0,0,s.w2,s.h2,dx,dy,dw,dh);}}g.restore();return true;}
function rimGlow(pose,x,y,face,color,alpha,width=1.6){rigDraw(pose.name,pose.frame,x,y,face,{...pose,glow:true,color,outline:width,alpha});}
function sprite(name,x,y,height=130,face=1,angle=0,alpha=1){const im=assets[name];if(!im)return;ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.rotate(angle);ctx.globalAlpha=alpha;ctx.drawImage(im,-height/2,-height*369/384,height,height);ctx.restore();}
function groundAt(x,y){let best=null;for(const q of world.platforms){if(x<q.x||x>q.x+q.w||q.y<y-2)continue;if(q.kind==='magic'&&!world.runes[q.rune]?.active)continue;if(best===null||q.y<best)best=q.y;}return best;}
function shadow(x,y,w,alpha=.5){const gy=groundAt(x,y);if(gy===null)return;const lift=clamp((gy-y)/220,0,1),s=1-lift*.6,rw=w*s;const g=ctx.createRadialGradient(x,gy+1,0,x,gy+1,rw);g.addColorStop(0,`rgba(10,16,14,${alpha*(1-lift*.7)})`);g.addColorStop(.6,`rgba(10,16,14,${alpha*.55*(1-lift*.7)})`);g.addColorStop(1,'rgba(10,16,14,0)');ctx.save();ctx.translate(x,gy+1);ctx.scale(1,.16);ctx.translate(-x,-(gy+1));ctx.fillStyle=g;ctx.fillRect(x-rw,gy+1-rw,rw*2,rw*2);ctx.restore();}

// ---------- ground: a carved stone road built from the platform tile, with a masonry wall down into the gorge ----------
let groundArt=null;
function buildGround(){if(groundArt!==null)return groundArt;const im=assets.platform;if(!im||!hasDom){groundArt=false;return false;}const tw=336,th=181,strip=makeCanvas(tw*2,th),g=strip.getContext('2d');g.drawImage(im,24,188,tw,th,0,0,tw,th);g.save();g.translate(tw*2,0);g.scale(-1,1);g.drawImage(im,24,188,tw,th,0,0,tw,th);g.restore();const wall=makeCanvas(tw*2,108),w=wall.getContext('2d');for(const [dx,dy] of [[0,0],[tw,54],[-tw,54]])w.drawImage(strip,0,58,tw*2,54,dx,dy,tw*2,54);w.globalCompositeOperation='source-atop';w.fillStyle='rgba(34,30,24,.5)';w.fillRect(0,0,tw*2,108);groundArt={S:.75,strip,wall,stripPattern:ctx.createPattern(strip,'repeat-x'),wallPattern:ctx.createPattern(wall,'repeat')};return groundArt;}
// campaign ground: the artist's seamless strip for the level's land, with a cliff cap mirrored at each end
const groundStrips={};
function levelGround(){if(!level||!hasDom)return null;const id=level.id;if(id in groundStrips)return groundStrips[id];const im=levelArt['tlo-'+id]||(level.ground&&levelArt['tlo-'+level.ground]);if(!im)return groundStrips[id]=null;
 const c=makeCanvas(im.width,im.height),g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,im.width,im.height).data;let walk=64;
 for(let y=0;y<im.height;y++){let solid=0;for(let x=0;x<im.width;x+=8)if(d[(y*im.width+x)*4+3]>200)solid++;if(solid>im.width/8*.85){walk=y;break;}}
 // earth below raised ground: a band of the strip made to tile vertically by cross-fading its ends
 const T=120,F=36,y0=walk+36,bc=makeCanvas(im.width,T-F),bg=bc.getContext('2d');bg.drawImage(im,0,y0,im.width,T-F,0,0,im.width,T-F);
 const tc=makeCanvas(im.width,F),tg=tc.getContext('2d');tg.drawImage(im,0,y0+T-F,im.width,F,0,0,im.width,F);tg.globalCompositeOperation='destination-in';const ramp=tg.createLinearGradient(0,0,0,F);ramp.addColorStop(0,'#000');ramp.addColorStop(1,'rgba(0,0,0,0)');tg.fillStyle=ramp;tg.fillRect(0,0,im.width,F);bg.drawImage(tc,0,0);
 // the strip itself, fading out where the earth body takes over
 const fc=makeCanvas(im.width,walk+150),fg=fc.getContext('2d');fg.drawImage(im,0,0,im.width,walk+150,0,0,im.width,walk+150);fg.globalCompositeOperation='destination-in';const fr=fg.createLinearGradient(0,walk+110,0,walk+150);fr.addColorStop(0,'#000');fr.addColorStop(1,'rgba(0,0,0,0)');fg.fillStyle=fr;fg.fillRect(0,0,im.width,walk+150);
 return groundStrips[id]={body:ctx.createPattern(bc,'repeat'),fade:ctx.createPattern(fc,'repeat-x'),im,cap:levelArt['tlo-'+id+'-kraj']||(level.ground&&levelArt['tlo-'+level.ground+'-kraj'])||null,walk,S:.55,pattern:ctx.createPattern(im,'repeat-x')};}
// a floor end only gets its cliff cap where the land really drops away, not where stairs or a higher block go on
function edgeCovered(q,right){if(!level)return false;if(q.cover)return q.cover[right?1:0];const ex=right?q.x+q.w:q.x;q.cover=[0,1].map(r=>{const e=r?q.x+q.w:q.x;return world.platforms.some(o=>o!==q&&o.solid&&!o.off&&o.kind!=='crate'&&o.y<=q.y+(o.kind==='step'?30:6)&&(r?(o.x<=e+2&&o.x+o.w>e+8):(o.x<e-8&&o.x+o.w>=e-2)));});return q.cover[right?1:0];}
function drawStripFloor(q,G){const ground=isFloor(q),S=G.S,top=q.y-G.walk*S,rows=ground?G.im.height:Math.min(G.im.height,G.walk+120),capW=G.cap?G.cap.width*S:0,capL=!edgeCovered(q,false),capR=!edgeCovered(q,true),inset=Math.min(capW*.6,q.w*.3),inL=capL?inset:0,inR=capR?inset:0;
 const cut=top+(G.walk+150)*S,raised=ground&&level&&q.y<560;
 if(ground){const from=raised?790:top+G.im.height*S-2;ctx.fillStyle='#0b0f10';ctx.fillRect(q.x+inL,from,q.w-inL-inR,Math.max(640,q.y+q.h-from+4));}
 if(raised){const bx=q.x+(capL?capW*.18:0),bw=q.w-(capL?capW*.18:0)-(capR?capW*.18:0),b0=Math.max(cut-44,camY-30),b1=Math.min(792,camY+VIEW_H+30);G.body.setTransform(new DOMMatrix([S,0,0,S,0,cut-44]));ctx.fillStyle=G.body;if(b1>b0)ctx.fillRect(bx,b0,bw,b1-b0);const d=ctx.createLinearGradient(0,690,0,792);d.addColorStop(0,'rgba(11,15,16,0)');d.addColorStop(1,'rgba(11,15,16,1)');ctx.fillStyle=d;ctx.fillRect(bx,Math.max(cut,690),bw,792-Math.max(cut,690));for(const [ex,sg] of[[bx,1],[bx+bw,-1]]){const e=ctx.createLinearGradient(ex,0,ex+sg*22,0);e.addColorStop(0,'rgba(8,8,8,.6)');e.addColorStop(1,'rgba(8,8,8,0)');ctx.fillStyle=e;ctx.fillRect(sg>0?ex:ex-22,cut-2,22,792-cut);}}
 const pat=raised?G.fade:G.pattern;pat.setTransform(new DOMMatrix([S,0,0,S,0,top]));ctx.fillStyle=pat;ctx.fillRect(q.x+inL,top,q.w-inL-inR,(raised?G.walk+150:rows)*S);
 if(G.cap){const w=Math.min(capW,q.w/2),cr=raised?G.walk+150:rows;if(capR)ctx.drawImage(G.cap,G.cap.width-w/S,0,w/S,cr,q.x+q.w-w,top,w,cr*S);if(capL){ctx.save();ctx.translate(q.x+w,top);ctx.scale(-1,1);ctx.drawImage(G.cap,G.cap.width-w/S,0,w/S,cr,0,0,w,cr*S);ctx.restore();}}
 if(!ground){const b=top+rows*S,sh=ctx.createLinearGradient(0,b-34,0,b);sh.addColorStop(0,'rgba(8,10,12,0)');sh.addColorStop(1,'rgba(8,10,12,.85)');ctx.fillStyle=sh;ctx.fillRect(q.x,b-34,q.w,34);}}
function drawFloor(q){if(q.x+q.w<camera-120||q.x>camera+VIEW_W+120)return;const LG=levelGround();if(LG){drawStripFloor(q,LG);return;}const G=buildGround();const ground=isFloor(q);if(!G){ellipse(q.x+q.w/2,q.y+20,q.w/2,30,'#6e6a55');return;}const S=G.S,top=q.y-11.5,rows=ground?116:181,im=assets.platform;
 if(ground){G.wallPattern.setTransform(new DOMMatrix([S,0,0,S,0,top+58*S]));ctx.fillStyle=G.wallPattern;ctx.fillRect(q.x+4,top+76,q.w-8,520);const shade=ctx.createLinearGradient(0,top+70,0,top+420);shade.addColorStop(0,'rgba(18,22,20,.55)');shade.addColorStop(.12,'rgba(14,22,22,.25)');shade.addColorStop(.5,'rgba(9,18,19,.78)');shade.addColorStop(1,'rgba(5,12,13,.98)');ctx.fillStyle=shade;ctx.fillRect(q.x+4,top+70,q.w-8,526);for(const side of[0,1]){const ex=side?q.x+q.w-4:q.x+4,eg=ctx.createLinearGradient(ex,0,ex+(side?-26:26),0);eg.addColorStop(0,'rgba(6,12,12,.85)');eg.addColorStop(1,'rgba(6,12,12,0)');ctx.fillStyle=eg;ctx.fillRect(side?ex-26:ex,top+70,26,526);}}
 G.stripPattern.setTransform(new DOMMatrix([S,0,0,S,0,top]));ctx.fillStyle=G.stripPattern;ctx.fillRect(q.x+8,top,q.w-16,rows*S);
 ctx.drawImage(im,0,188,44,rows,q.x-14,top,44*S,rows*S);ctx.drawImage(im,340,188,44,rows,q.x+q.w-19,top,44*S,rows*S);
 // a lit edge where the moss meets the light, and tufts that sway
 const lit=ctx.createLinearGradient(0,q.y-6,0,q.y+8);lit.addColorStop(0,'rgba(255,226,150,0)');lit.addColorStop(.5,'rgba(255,226,150,.16)');lit.addColorStop(1,'rgba(255,226,150,0)');ctx.fillStyle=lit;ctx.fillRect(q.x-6,q.y-6,q.w+12,14);
 const sway=Math.sin(time*1.7)*2;for(let i=Math.ceil((q.x+6)/23)*23;i<q.x+q.w-6;i+=23){if(i<camera-30||i>camera+VIEW_W+30)continue;const r=Math.sin(i*4.3)*.5+.5,h=6+r*9,s=sway*(.6+r*.6);line(i,q.y+1,i-3+s,q.y-h,'#5e6d33',2);line(i+3,q.y+1,i+6+s,q.y-h*.75,'#9c9a4a',1.5);if(r>.82){ellipse(i+s-3,q.y-h-1,2,2,r>.92?'#e9c86a':'#d98a5a');}}}
function drawBridge(q){if(q.x+q.w<camera-100||q.x>camera+VIEW_W+100)return;const active=world.runes[q.rune].active;if(!active){gctx.save();gctx.globalAlpha=.25+.12*Math.sin(time*3+q.x);gctx.setLineDash([10,14]);gctx.lineDashOffset=-time*20;line(q.x,q.y,q.x+q.w,q.y,'#7fffd0',2,gctx);gctx.restore();return;}const g=ctx.createLinearGradient(0,q.y,0,q.y+24);g.addColorStop(0,'rgba(190,255,232,.75)');g.addColorStop(1,'rgba(60,150,140,.08)');poly([[q.x,q.y],[q.x+q.w,q.y],[q.x+q.w-18,q.y+18],[q.x+20,q.y+22]],g);line(q.x,q.y,q.x+q.w,q.y,'#5fe8c2',3,gctx);for(let i=10;i<q.w;i+=30){const a=.5+.5*Math.sin(time*4+i*.3);poly([[q.x+i,q.y+3],[q.x+i+5,q.y+9],[q.x+i,q.y+15],[q.x+i-5,q.y+9]],`rgba(150,255,215,${.35+.5*a})`,null,gctx);}halo(q.x+q.w/2,q.y+4,q.w*.6,'rgba(90,255,200,.22)');emitters.push({id:'bridge'+q.rune,kind:'bridge',x:q.x,y:q.y,w:q.w,rate:14});}
function eagle(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const white='#f8e8bf';for(const side of[-1,1]){ctx.save();ctx.scale(side,1);poly([[0,-3],[12,-13],[30,-20],[27,-8],[20,-3],[29,-4],[23,5],[14,8],[6,7]],white);for(let i=0;i<4;i++)line(9+i*4,-2,13+i*4,7-i,'#bfa980',1);ellipse(5,-12,5,8,white);ellipse(8,-20,6,4,white);poly([[11,-22],[18,-18],[10,-18]],white);line(5,9,9,18,white,3);line(9,18,16,19,white,2);ctx.restore();}poly([[-6,-5],[6,-5],[8,10],[0,22],[-8,10]],white);poly([[-4,1],[4,1],[4,10],[0,14],[-4,10]],'#a33539');ctx.restore();}
function flag(x,y=590,small=false){const height=small?135:200;const pole=ctx.createLinearGradient(x-3,0,x+3,0);pole.addColorStop(0,'#3a2a1c');pole.addColorStop(.5,'#7a5a3c');pole.addColorStop(1,'#3a2a1c');ctx.fillStyle=pole;ctx.fillRect(x-3,y-height,6,height+2);ellipse(x,y-height-6,5,7,'#e4c484');halo(x,y-height-7,7,'rgba(255,220,140,.35)');const t=time*2+x;const wv=i=>Math.sin(t+i*.9)*5*(i/4);ctx.save();const cloth=ctx.createLinearGradient(x,0,x+70,0);cloth.addColorStop(0,'#6e1f27');cloth.addColorStop(.5,'#a3323c');cloth.addColorStop(1,'#7a242c');poly([[x+3,y-height+3],[x+70,y-height+10+wv(4)],[x+66,y-height+112+wv(4)],[x+36,y-height+96+wv(2)],[x+3,y-height+112]],cloth,'#ddb675');ctx.restore();ctx.save();ctx.translate(x+34,y-height+52+wv(2));eagle(0,0,.75);ctx.restore();line(x+8,y-height+8,x+8,y-height+98,'#ca9657',1);}
function tree(x,y=590){const h=330+(Math.sin(x)*.5+.5)*110;sprite('tree',x,y+6,h,Math.sin(x*1.7)>0?1:-1,Math.sin(time*.7+x)*.01);}
function drawRune(r){if(Math.abs(r.x-camera-VIEW_W/2)>VIEW_W)return;const pulse=.5+.5*Math.sin(time*3+r.x);const g=ctx.createLinearGradient(r.x-22,0,r.x+22,0);g.addColorStop(0,'#3e5d57');g.addColorStop(.45,r.active?'#6f9c90':'#7aa59a');g.addColorStop(1,'#2d4642');poly([[r.x-21,591],[r.x-25,546],[r.x,518],[r.x+22,548],[r.x+18,591]],g,'#c9e7d3');ctx.fillStyle=r.active?'#bff5dd':'#e6fff2';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText('✧',r.x,566);ctx.font='24px Georgia';gctx.font='24px Georgia';gctx.textAlign='center';gctx.fillStyle=`rgba(140,255,215,${r.active?.6:.5+.5*pulse})`;gctx.fillText('✧',r.x,566);halo(r.x,555,r.active?55:80,'rgba(120,255,210,.35)',r.active?.6:.6+.4*pulse);if(!r.active){textLabel('E · PROBUDI',r.x,500,{font:'bold 13px Georgia',color:'#dfffee',glow:'#7fffd0'});emitters.push({id:'rune'+r.id,kind:'rune',x:r.x,y:560,rate:8});}}
function drawItem(i){if(i.taken||i.x<camera-60||i.x>camera+VIEW_W+60)return;if(i.type==='cudo'){drawCudo(i);return;}if(i.type==='slovo'){drawLetter(i);return;}if(i.type==='moc'){drawPowerOrb(i);return;}if(i.type==='tovar'){drawTreasure(i);return;}if(RELIC_ART[i.type]){drawRelicItem(i);return;}const yy=i.y+Math.sin(time*3+i.id)*4;{const art=levelArt[i.type==='wine'?'predmet-cutura':i.type==='herb'?'predmet-trava':''];if(art){halo(i.x,yy,30,i.type==='wine'?'rgba(255,190,90,.45)':'rgba(170,255,140,.35)');const b=propBounds(art),k=40/Math.max(b.w,b.h);ctx.drawImage(art,b.x,b.y,b.w,b.h,i.x-b.w*k/2,yy-b.h*k/2,b.w*k,b.h*k);return;}}if(i.type==='wine'){halo(i.x,yy,30,'rgba(255,190,90,.45)');ellipse(i.x,yy+3,11,13,'#7a2832');ellipse(i.x-3,yy-1,4,6,'rgba(255,190,170,.35)');ctx.fillStyle='#c79a58';ctx.fillRect(i.x-3.5,yy-17,7,9);ellipse(i.x,yy-18,5,2.5,'#e3bf7a');line(i.x-9,yy-4,i.x+9,yy-4,'#e6bc76',2);line(i.x+9,yy-4,i.x+12,yy+9,'#b88850',1.5);}else if(i.type==='herb'){halo(i.x,yy,28,'rgba(170,255,140,.35)');line(i.x,yy-6,i.x,yy+16,'#7fae62',2);for(const [dx,dy,a] of [[-7,2,-.6],[7,0,.6],[-4,-8,-.3],[5,-10,.4]]){ctx.save();ctx.translate(i.x+dx,yy+dy);ctx.rotate(a);ellipse(0,0,4,9,'#b9dc84');line(0,-7,0,7,'#7fae62',1);ctx.restore();}ellipse(i.x,yy-14,4,4,'#f2e6a2');}else{halo(i.x,yy,46,'rgba(255,220,120,.55)',.8+.2*Math.sin(time*4));poly([[i.x,yy-18],[i.x+15,yy],[i.x,yy+18],[i.x-15,yy]],'#edd696','#fff4bb');poly([[i.x,yy-10],[i.x+8,yy],[i.x,yy+10],[i.x-8,yy]],'#b88c3c');}emitters.push({id:'item'+i.id,kind:'item',x:i.x,y:yy,rate:i.type==='relic'?8:3});}
function drawBarrier(b){if(b.x<camera-200||b.x>camera+VIEW_W+100)return;const rocks=[[-18,-12,20,14],[8,-14,22,16],[-4,-30,17,13],[20,-8,12,9],[-28,-6,11,8]];for(const [dx,dy,rx,ry] of rocks){const g=ctx.createRadialGradient(b.x+dx-rx*.3,592+dy-ry*.4,2,b.x+dx,592+dy,rx);g.addColorStop(0,'#a59a80');g.addColorStop(1,'#4c4b3e');ellipse(b.x+dx,592+dy,rx,ry,g);}line(b.x-24,560,b.x+6,580,'#5d4a32',5);line(b.x-190,586,b.x-100,586,'#f5cf7a',3,gctx);textLabel('SKOK',b.x-145,572,{font:'bold 12px Georgia',color:'#ffe6a8',glow:'#ffcf6a'});}
function drawGate(){if(zone>=5)return;const end=chapters[zone].end-60;const locked=(defenses[zone]&&!defenses[zone].done)||world.enemies.some(e=>e.alive&&e.zone===zone)||(zone===2&&world.runes.some(r=>!r.active));drawSideGate('ch'+zone,end,590,!locked,'kamen');if(locked&&Math.abs(p.x-end)<600)textLabel('OSLOBODI PROLAZ',end,230,{font:'bold 13px Georgia',color:'#f5d79f',glow:'#ffcf7a'});}

// ---------- characters ----------
function playerPose(){
 if(mode==='levelDone'&&p.victoryAt&&rig?.['marko-victory'])return{name:'marko-victory',frame:Math.min(rig['marko-victory'].frames.length-1,Math.floor((performance.now()/1000-p.victoryAt)*7))};
 if(horseMounted){if(!p.grounded||p.landing>0)return{name:'mounted-jump',frame:p.grounded?3:p.vy< -350?1:p.vy<250?2:3};if(Math.abs(p.vx)>35)return{name:'mounted-run',frame:Math.floor(p.gait)%6};return{name:'mounted-jump',frame:0,sy:1+Math.sin(time*2.2)*.008};}
 if(p.climb)return climbPose();if(p.throwT>0)return throwPose();
 {const x=pack3Pose();if(x)return x;}
 if(p.spin>0){if(rig?.['marko-vihor'])return{name:'marko-vihor',frame:Math.floor(p.spin*20)%8};const k=Math.floor(p.spin/.09);return{name:'marko-attack',frame:[2,3,4,3][k%4],faceFlip:Math.floor(p.spin/.18)%2===1,sy:1-.03*Math.abs(Math.sin(p.spin*18))};}
 if(p.attack>0){const duration=attackDuration(),phase=1-p.attack/duration;return attackFrame(phase,{name:p.attackKind==='tresak'?(rig?.['marko-air-2']?'marko-air-2':'marko-charged'):p.attackKind==='lomilac'?(rig?.['marko-combo-4']?'marko-combo-4':'marko-charged'):p.attackKind==='uvis'?(rig?.['marko-uppercut']?'marko-uppercut':'marko-combo-3'):p.attackKind==='juris'?(rig?.['marko-dash-strike']?'marko-dash-strike':'marko-combo-2'):p.attackKind==='light'&&p.airAtk&&rig?.['marko-air-1']?(p.combo===2&&rig?.['marko-air-2']?'marko-air-2':'marko-air-1'):p.attackKind==='super'?'marko-super':p.attackKind==='counter'&&rig?.['marko-counter']?'marko-counter':p.attackKind==='heavy'&&rig?.['marko-charged']?'marko-charged':p.attackKind==='light'&&p.runAtk&&rig?.['marko-run-attack']?'marko-run-attack':p.attackKind==='light'&&rig?.['marko-combo-1']?'marko-combo-'+((p.combo||0)+1):'marko-attack'});}
 if(!p.grounded){if(p.vy< -150&&p.airT<.32&&rig?.['marko-jump-rise'])return{name:'marko-jump-rise',frame:Math.min(3,Math.floor(p.airT/.32*4))};if(p.vy>160&&rig?.['marko-fall'])return{name:'marko-fall',frame:Math.floor(p.airT*9)%4};return{name:'marko-jump',frame:p.vy< -520?2:p.vy<220?3:4};}
 if(p.drink>0)return{name:'marko-drink',frame:Math.min(5,Math.floor((1-p.drink/.85)*6))};
 if(p.crouching&&p.crouch>.5&&Math.abs(p.vx)>15){if(rig?.['marko-crouch-walk'])return{name:'marko-crouch-walk',frame:Math.floor(p.gait*.75)%rig['marko-crouch-walk'].frames.length};const s=Math.sin(p.gait*Math.PI*.75);return{name:'marko-crouch',frame:2+Math.floor(p.gait*.75)%2,dy:-Math.abs(s)*3,rot:s*.025};}
 if(p.crouch>.05)return{name:'marko-crouch',frame:p.crouching?(p.crouch<.15?0:p.crouch<.85?1:2+Math.floor(p.anim*2)%2):(p.crouch>.5?4:5)};
 if(p.blocking&&!(p.hurt>0)&&p.blockTime>=.6&&Math.abs(p.vx)>12){if(rig?.['marko-block-walk'])return{name:'marko-block-walk',frame:Math.floor(p.gait*.8)%rig['marko-block-walk'].frames.length};const s=Math.sin(p.gait*Math.PI*.8);return{name:'marko-block',frame:2,dy:-Math.abs(s)*2.5,rot:s*.02,sx:1+s*.012};}
 if(p.blocking&&p.hurt>0&&rig?.['marko-block-hit'])return{name:'marko-block-hit',frame:Math.min(3,Math.floor((1-p.hurt/.22)*4))};
 if(p.blockTime>0||p.blocking)return{name:'marko-block',frame:!p.blocking?5:p.hurt>0?3:p.blockTime<.6?1:2};
 if(p.hurt>.02&&!p.blocking&&rig?.['marko-hurt'])return{name:'marko-hurt',frame:Math.min(3,Math.floor((1-p.hurt/.22)*4))};
 if(p.landing>0){if(rig?.['marko-land']&&Math.abs(p.vx)<60){const n=rig['marko-land'].frames.length;return{name:'marko-land',frame:Math.min(n-1,Math.floor((1-p.landing/.2)*n))};}const s=Math.sin(p.landing/.2*Math.PI)*.08;return{name:'marko-jump',frame:5,sx:1+s,sy:1-s};}
 if(Math.abs(p.vx)>35){if(Math.abs(p.vx)<170&&rig?.['marko-walk'])return{name:'marko-walk',frame:Math.floor(p.gait*2)%8};return{name:'marko-run',frame:Math.floor(p.gait)%6};}
 if(p.idleT>IDLE3_AT&&rig?.['marko-idle-3']){const k=Math.floor((p.idleT-IDLE3_AT)*6);if(k<12)return{name:'marko-idle-3',frame:k};p.idleT=0;}
 if(rig?.['marko-idle-2'])return{name:'marko-idle-2',frame:Math.floor(time*6)%rig['marko-idle-2'].frames.length,sy:1+Math.sin(time*2.2)*.004};if(rig?.['marko-idle'])return{name:'marko-idle',frame:IDLE_SEQ[Math.floor(time*IDLE_FPS)%IDLE_SEQ.length],sy:1+Math.sin(time*2.2)*.006,sx:1-Math.sin(time*2.2)*.003};return{name:'cast/marko',frame:0,sy:1+Math.sin(time*2.4)*.012,sx:1-Math.sin(time*2.4)*.005,rot:p.hurt>0?-.1:0};
}
function maceSmear(){const d=attackDuration(),phase=1-p.attack/d;if(p.attack<=0||phase<.4||phase>.97)return;const heavy=p.attackKind==='heavy',t=clamp((phase-.42)/.33,0,1),ease=1-Math.pow(1-t,3),head=-1.75+ease*2.6,tail=Math.max(-1.75,head-(heavy?1.05:.85)),fade=1-clamp((phase-.78)/.19,0,1),R=heavy?100:84,inner=R*(heavy?.8:.84);for(const g of[gctx,ctx]){g.save();g.translate(p.x+p.face*6,p.y-66);g.scale(p.face,1);g.beginPath();g.arc(0,0,R,tail,head);g.arc(Math.cos(head)*6,Math.sin(head)*6,inner,head,tail,true);g.closePath();const gr=g.createLinearGradient(Math.cos(tail)*R,Math.sin(tail)*R,Math.cos(head)*R,Math.sin(head)*R);const c=heavy?'255,190,100':'255,236,200';gr.addColorStop(0,`rgba(${c},0)`);gr.addColorStop(1,`rgba(${c},${(g===gctx?(heavy?.42:.34):.2)*fade})`);g.fillStyle=gr;g.fill();g.restore();}}
function drawPlayer(){if(!p||mode==='dead')return;const alpha=p.invuln>0&&Math.floor(time*14)%2?.55:1;
 for(const g of ghosts)rigDraw(g.name,g.frame,g.x,g.y,g.faceAs??g.face,{...g,glow:true,color:'#7fffe0',alpha:g.life*1.1,outline:1.5});
 shadow(p.x,p.y,horseMounted?84:38,.55);
 if(p.buff>0){halo(p.x,p.y-64,90,'rgba(255,170,60,.22)',.7+.3*Math.sin(time*6));emitters.push({id:'buff',kind:'buff',x:p.x,y:p.y,rate:38});}
 if(horseMounted&&p.mountTime>0){const a=1-p.mountTime/.55;rigDraw('cast/sarac',0,p.x,p.y,p.face,{alpha:1-a});rigDraw('cast/marko',0,p.x-p.face*(65*(1-a)),p.y-55*Math.sin(a*Math.PI),p.face,{alpha:1-a,rot:-.15*Math.sin(a*Math.PI)*p.face});rigDraw('mounted-jump',0,p.x,p.y,p.face,{alpha:a});}
 else{const pose=playerPose();if(p.buff>0)rimGlow(pose,p.x,p.y,p.face,'#ffb44a',.3+.15*Math.sin(time*8),1.6);if(p.parry>0)rimGlow(pose,p.x,p.y,p.face,'#8fffe0',.3,1.6);rigDraw(pose.name,pose.frame,p.x,p.y,pose.faceAs??(pose.faceFlip?-p.face:p.face),{...pose,alpha,flash:p.hurt>.1?(p.hurt-.1)/.12*.6:0,flashColor:'#ffb8a8'});if(p.dizzy>0)drawDizzy();}
 maceSmear();drawSpinFx();drawChargeMeter();
 if(p.parry>0){const a=(p.face<0?Math.PI:0);for(const [g,al] of [[gctx,.45],[ctx,.3]]){g.beginPath();g.arc(p.x,p.y-64,62,a-1.25,a+1.25);g.strokeStyle=`rgba(200,255,232,${al})`;g.lineWidth=4;g.stroke();}}
 drawFairy();}
// Distance-driven stride: no root bobbing or rotation, soles stay on the rig baseline.
function locomotionPose(e){const stride=e.type==='musa'?120:e.type==='shield'?76:90;return{name:e.type+'-run',frame:Math.floor((e.walk||0)/stride*6)%6};}
function drawSoldier(e){if(e.x<camera-140||e.x>camera+VIEW_W+140)return;const x=e.x+(e.knock||0);shadow(x,e.y,e.type==='shield'?36:32,.5);const atk=e.type==='archer'?(e.perch&&p.y>e.y+60&&rig?.['archer-shoot-down']?'archer-shoot-down':'archer-shoot'):e.type+'-attack';let pose={name:'cast/'+e.type,frame:0};const F=FOES[e.type];if((level||e.air)&&(e.climb||(!e.grounded&&e.air)||e.landT>0||(e.tossedT>0&&rig?.[e.type+'-launch']))&&e.mode!=='windup'&&e.mode!=='recover')pose=airPose(e);else if(e.type==='palikuca'&&e.burn>0&&rig?.['palikuca-burn'])pose={name:'palikuca-burn',frame:Math.floor(time*10)%rig['palikuca-burn'].frames.length};else if(e.reactT>0&&rig?.[e.react]){const n=rig[e.react].frames.length;pose={name:e.react,frame:Math.min(n-1,Math.floor((1-e.reactT/e.reactDur)*n))};}else if(F){pose=foePose(e,F);}else if(e.mode==='windup'){const progress=1-e.timer/(e.windupDuration||.7);pose={name:atk,frame:e.type==='archer'?Math.min(3,Math.floor(progress*4)):Math.min(2,Math.floor(progress*3))};}else if(e.mode==='recover'){const duration=e.type==='shield'?1.1:.85;pose={name:atk,frame:e.type==='archer'?4+Math.min(1,Math.floor((1-e.timer/duration)*2)):3+Math.min(2,Math.floor((1-e.timer/duration)*3))};}else if(e.moveT>0&&e.stun<=0&&rig?.[e.type+'-run']){pose=locomotionPose(e);}else if(e.hurtT>0&&rig?.[e.type+'-hurt']){pose={name:e.type+'-hurt',frame:Math.min(3,Math.floor((1-e.hurtT/.34)*4))};}else if(rig?.[e.type+'-idle']){pose={name:e.type+'-idle',frame:idleFrame(e.type,e.id),sy:1+Math.sin(time*2.4+e.id)*.008};}else{pose.sy=1+Math.sin(time*2.6+e.id)*.012;}
 if(e.stun>0){pose.rot=(pose.rot||0)-e.face*.07;rimGlow(pose,x,e.y,e.face,'#8fffd8',.22+.12*Math.sin(time*10),1.4);for(let s=0;s<3;s++){const a=time*4+s*2.1;textLabel('✦',x+Math.cos(a)*16,e.y-138+Math.sin(a)*5,{font:'15px Georgia',color:'#c8fff0',glow:'#7fffd0'});}}
 if(e.mode==='windup'){const urgency=1-e.timer/(e.windupDuration||.7);rimGlow(pose,x,e.y,e.face,'#ff4a20',.18+.42*urgency*(.65+.35*Math.sin(time*30)),1.2+urgency*1.4);}
 if(e.champion){pose.scale=e.scale;rimGlow(pose,x,e.y,e.face,e.hp<e.maxHp/2?'#ff3a1a':'#ffd27a',.28+.12*Math.sin(time*6),2);}else if(e.elite){pose.scale=1.08;rimGlow(pose,x,e.y,e.face,'#ffcf6a',.22+.08*Math.sin(time*5+e.id),1.4);}rigDraw(pose.name,pose.frame,x,e.y,e.face,{...pose,flash:e.flash>0?e.flash/.15*.5:0,flashColor:'#ffd6bf'});
 if(e.mode==='windup'){ellipse(x,e.y-152,11,11,'#b8382a');ellipse(x,e.y-152,8,8,'#d9503a');textLabel('!',x,e.y-146,{font:'bold 16px Georgia',color:'#fff3bd'});halo(x,e.y-152,26,'rgba(255,90,50,.8)');}
 if(e.hp<e.maxHp&&!e.champion){const bw=54,bx=x-bw/2,by=e.y-136;ctx.fillStyle='rgba(10,20,20,.8)';ctx.fillRect(bx-1,by-1,bw+2,6);const g=ctx.createLinearGradient(bx,0,bx+bw,0);g.addColorStop(0,'#a8352f');g.addColorStop(1,'#e8a061');ctx.fillStyle=g;ctx.fillRect(bx,by,bw*Math.max(0,e.hp/e.maxHp),4);}}
function makeCorpse(type,x,y,face,persist=false,vy=0){return{type,x,y,face,persist,t:0,vx:0,vy:Math.max(0,vy),w:34,h:40,grounded:false};}
function deathPose(c){if(c.launched){const hasDeath=typeof rig!=='undefined'&&!!rig?.[c.type+'-death'],F=typeof FOES!=='undefined'?FOES[c.type]:null,name=hasDeath?c.type+'-death':(F?F.anims.main:c.type+'-death'),alpha=c.persist?1:1-clamp((c.t-3.6)/.7,0,1);if(!c.landed)return{name,frame:hasDeath?1:0,rot:c.spinAngle||0,alpha};const lt=c.t-(c.landT||0);if(hasDeath)return{name,frame:lt<.12?3:lt<.26?4:5,alpha};return{name,frame:0,rot:-c.face*1.42,dx:-c.face*20,dy:4,alpha};}const F=typeof FOES!=='undefined'?FOES[c.type]:null;if(F&&!(typeof rig!=='undefined'&&rig?.[c.type+'-death'])){const fall=clamp(c.t/.45,0,1),ease=fall*fall,back=-c.face;return{name:F.anims.main,frame:0,rot:back*ease*1.42,dx:back*ease*20,dy:ease*4,alpha:1-clamp((c.t-2.5)/.7,0,1)};}const frame=c.t<.13?0:c.t<.30?1:c.t<.49?2:c.t<.70?3:c.t<.90?4:5;return{name:c.type+'-death',frame,alpha:c.persist?1:1-clamp((c.t-2.5)/.7,0,1)};}
function drawCorpse(c){const pose=deathPose(c);shadow(c.x,c.y,c.type==='musa'?65:45,.35*pose.alpha);if(settings.gore!==false&&c.t>.5){const k=clamp((c.t-.5)/2.2,0,1)*pose.alpha;const r=(c.type==='musa'?46:32)*Math.sqrt(k);const gr=ctx.createRadialGradient(c.x-c.face*30,c.y+1,0,c.x-c.face*30,c.y+1,r);gr.addColorStop(0,`rgba(92,8,10,${.85*pose.alpha})`);gr.addColorStop(.75,`rgba(110,12,14,${.7*pose.alpha})`);gr.addColorStop(1,'rgba(110,12,14,0)');ctx.save();ctx.translate(c.x-c.face*30,c.y+1);ctx.scale(1,.22);ctx.translate(-(c.x-c.face*30),-(c.y+1));ctx.fillStyle=gr;ctx.fillRect(c.x-c.face*30-r,c.y+1-r,r*2,r*2);ctx.restore();}rigDraw(pose.name,pose.frame,c.x,c.y,c.face,{rot:pose.rot,dx:pose.dx,dy:pose.dy,alpha:pose.alpha,flash:c.t<.1?(.1-c.t)*4:0,flashColor:'#fff2d0'});}
function drawBoss(){if(zone!==5||!boss.alive)return;const pose=musaPose();if(boss.knock)pose.dx=(pose.dx||0)+boss.knock;
 shadow(boss.x,boss.y,56,.6);
 if(boss.mode==='windup'||boss.mode==='second')rimGlow(pose,boss.x,boss.y,boss.face,'#ff3a18',.35+.25*Math.sin(time*28),2.4);
 if(MUSA_OPEN.includes(boss.mode)){rimGlow(pose,boss.x,boss.y,boss.face,'#9dffb0',.45,2);emitters.push({id:'boss-open',kind:'boss',color:'#9dffb0',x:boss.x,y:boss.y,rate:20});}
 if(boss.mode==='roar'){halo(boss.x,boss.y-90,170,'rgba(255,60,40,.45)');emitters.push({id:'boss-roar',kind:'boss',color:'#ff5a3a',x:boss.x,y:boss.y,rate:70});}
 rigDraw(pose.name,pose.frame,boss.x,boss.y,boss.face,{...pose,flash:boss.flash>0?boss.flash/.16:0});
 if(boss.mode==='swing'){for(const [g,al] of [[gctx,.9],[ctx,.35]]){g.save();g.translate(boss.x+boss.face*30,boss.y-80);g.scale(boss.face,1);g.beginPath();g.arc(0,0,125,-1.3,1.1);g.arc(10,0,90,1.1,-1.3,true);g.closePath();g.fillStyle=`rgba(255,150,110,${al*.6})`;g.fill();g.restore();}}
 if(boss.mode==='windup'||boss.mode==='second'){textLabel('!',boss.x,boss.y-205,{font:'bold 30px Georgia',color:'#ffdf9c',glow:'#ff6a3a'});halo(boss.x,boss.y-215,40,'rgba(255,90,50,.7)');}
 drawMusaWindow();}
function advanceFairy(dt){const active=fairy.age<fairy.duration;const approach=active&&fairy.age<1.65;const targetX=approach?clamp(fairy.targetX-p.face*75,p.x-220,p.x+280):p.x-p.face*60;const targetY=approach?Math.min(p.y-100,fairy.targetY-10):p.y-125;const rate=active?7:4;fairy.x+=(targetX-fairy.x)*Math.min(1,dt*rate);fairy.y+=(targetY-fairy.y)*Math.min(1,dt*rate);}
function drawFairy(){const active=fairy.age<fairy.duration,fx2=fairy.x,fy=fairy.y+Math.sin(time*3)*5;if(!active){halo(fx2,fy-22,26,'rgba(150,255,215,.45)');halo(fx2,fy-22,6,'rgba(255,255,240,.8)');ellipse(fx2,fy-22,2.5,2.5,'#f4fff8');for(let i=0;i<3;i++)ellipse(fx2+Math.sin(time*2+i*2)*9,fy-22+Math.cos(time*2+i*2)*7,1.3,1.3,'#d8ffe9',gctx);emitters.push({id:'fairy',kind:'fairy',x:fx2,y:fy-10,rate:22});return;}const enter=clamp(fairy.age/.22,0,1),leave=clamp((fairy.duration-fairy.age)/.65,0,1),a=enter*leave;const pose=fairy.age<.9?Math.min(5,Math.floor(fairy.age/.15)):5;const face=fairy.targetX>=fx2?1:-1;halo(fx2,fy-42,70,'rgba(140,255,210,.13)',a);rigDraw('fairy-cast',pose,fx2,fy,face,{alpha:a,scale:.85+.15*enter})||sprite('fairy',fx2,fy,90,face,0,a);emitters.push({id:'fairy',kind:'fairy',x:fx2,y:fy-30,rate:30*a});if(fairy.age>.42&&fairy.age<1.05){const fade=Math.sin((fairy.age-.42)/.63*Math.PI);for(const [g,w,al] of [[gctx,4,1],[ctx,2,.7]]){g.save();g.globalAlpha=fade*al;g.strokeStyle='#c8ffe8';g.lineWidth=w;g.beginPath();g.moveTo(fx2+face*30,fy-55);g.quadraticCurveTo((fx2+fairy.targetX)/2,Math.min(fy,fairy.targetY)-65,fairy.targetX,fairy.targetY);g.stroke();for(let j=0;j<3;j++){g.beginPath();g.ellipse(fairy.targetX,fairy.targetY,15+j*15+fairy.age*8,8+j*7,Math.sin(time)*.2,0,Math.PI*2);g.strokeStyle=j%2?'#e8d9a4':'#a1eac9';g.stroke();}g.restore();}}textLabel('RAVIJOJLA',fx2,fy-96,{font:'bold 10px Georgia',color:'#daffe6',glow:'#9dffd8',alpha:a*.9});}

function draw(dt=1/60){
 if(!ctx){return;}
 emitters=[];
 pxScale=layer.width/W*ZOOM;glowScale=glowLayer.width/W*ZOOM;
 const sx=!stage&&shake&&mode==='play'?(Math.random()-.5)*shake:0,sy=!stage&&shake&&mode==='play'?(Math.random()-.5)*shake:0;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,layer.width,layer.height);gctx.setTransform(1,0,0,1,0,0);gctx.clearRect(0,0,glowLayer.width,glowLayer.height);
 ctx.setTransform(pxScale,0,0,pxScale,(-camera+sx)*pxScale,(-camY+sy)*pxScale);gctx.setTransform(glowScale,0,0,glowScale,-camera*glowScale,-camY*glowScale);
 const solid=x=>world.platforms.some(q=>q.kind==='stone'&&q.y===590&&x>q.x+30&&x<q.x+q.w-30),open=x=>solid(x)&&!world.platforms.some(q=>q.y<585&&x>q.x-30&&x<q.x+q.w+100);
 drawEagles();if(level){if(p?.vault)drawVaults();else drawTerrain();}else world.platforms.forEach(q=>{if(q.kind==='stone'&&isFloor(q))drawFloor(q);});drawBraziers();
 if(!level){for(let x=Math.floor(camera/900)*900;x<camera+VIEW_W+500;x+=900){if((x<10800||x>24500)&&solid(x+210))tree(x+210,590);}}else drawLevelDecor(solid);
 if(!level&&(zone===1||zone===4||zone===5)){for(let x=Math.floor(camera/780)*780;x<camera+VIEW_W+780;x+=780){if(solid(x+430))sprite('arch',x+430,594,280,1);}}
 if(!level)for(let x=150;x<29900;x+=1450){if(x>camera-100&&x<camera+VIEW_W+100&&open(x)&&Math.abs(x-chapters[zone].start-90)>160)flag(x,590,true);}if(!level&&open(chapters[zone].start+90))flag(chapters[zone].start+90,590);
 if(level){drawPuzzles();drawLadders();drawBreakables();drawPlows();drawTraps();}else world.platforms.forEach(q=>{if(q.kind==='stone'&&!isFloor(q))drawFloor(q);else if(q.kind==='magic')drawBridge(q);});
 drawGate();
 world.runes.forEach(drawRune);
 world.items.forEach(drawItem);
 world.barriers.forEach(drawBarrier);
 if(!horseMounted&&Math.abs(horseX-camera-VIEW_W/2)<VIEW_W){shadow(horseX,590,62,.5);rigDraw('cast/sarac',0,horseX,591,1,{sy:1+Math.sin(time*1.8)*.008});if(zone===3)textLabel('E · UZJAŠI ŠARCA',horseX,430,{font:'bold 15px Georgia',color:'#fff0bd',glow:'#ffd27a'});}
 if(mode!=='menu'){drawDecals();for(const f of fires)drawFire(f);for(const c of corpses)drawCorpse(c);for(const e of world.enemies)if(e.alive)drawSoldier(e);drawBoss();if(p)drawPlayer();drawCoins();drawThrown();if(level)drawTrapsFront();drawPowers();if(vaultFade>0){vaultFade=Math.max(0,vaultFade-dt);ctx.fillStyle=`rgba(0,0,0,${Math.min(1,vaultFade*3)})`;ctx.fillRect(camera-20,camY-20,VIEW_W+40,VIEW_H+40);}}
 for(const a of arrows){if(a.torch){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot||0);ctx.fillStyle='#5a3a22';ctx.fillRect(-16,-2.5,26,5);ctx.restore();drawFlame(a.x+Math.cos(a.rot||0)*12,a.y+Math.sin(a.rot||0)*12+6,16,26,a.x);emitters.push({id:'torch'+Math.round(a.x/40),kind:'fire',x:a.x,y:a.y,w:10,rate:30});continue;}if(a.wave){halo(a.x,a.y-4,40,'rgba(255,120,80,.8)');ellipse(a.x,a.y,11,19,'#ffc29a');emitters.push({id:'wave',kind:'boss',color:'#ff7a5a',x:a.x,y:a.y+60,rate:50});}else drawArrow(a);}
 for(const a of particles){const k=clamp(a.life/(a.max||1),0,1);if(a.kind==='blood'){ctx.globalAlpha=Math.min(1,k*1.6);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-a.vx*.022,a.y-a.vy*.022);ctx.strokeStyle=a.color;ctx.lineWidth=a.r;ctx.lineCap='round';ctx.stroke();}else if(a.kind==='dust'){ctx.globalAlpha=k*.38;ellipse(a.x,a.y,a.r*(1.6-k*.6),a.r*(1.2-k*.4),a.color);}else{gctx.globalAlpha=k;ellipse(a.x,a.y,a.r,a.r,a.color,gctx);}}ctx.globalAlpha=1;gctx.globalAlpha=1;
 for(const f of floating){const pop=1+Math.max(0,f.life-.95)*3;textLabel(f.text,f.x,f.y,{font:`bold ${Math.round(17*pop)}px Georgia`,color:f.color,glow:f.color,alpha:clamp(f.life,0,1)});}
 if(stage){stage.render({dt:mode==='pause'?0:dt,camX:camera,camY,zone:mode==='menu'?0:zone,look:level?LEVEL_LOOK[level.id]??0:undefined,weather:level&&mode!=='menu'?levelVariant:null,mode,player:p?{x:p.x,y:p.y}:null,shake:mode==='play'?shake:0,hurt:p&&mode==='play'?p.hurt/.22*.6:0,lowHealth:p&&mode==='play'&&p.hp/p.maxHp<.3?1-p.hp/p.maxHp/.3:0,emitters});return;}
 if(screenCtx){screenCtx.setTransform(1,0,0,1,0,0);if(assets.gorge){const drawW=W+260,drawH=drawW*1024/1536;screenCtx.drawImage(assets.gorge,-130-Math.min(1,camera/29900)*180,-80,drawW,drawH);}else{screenCtx.fillStyle='#496f6b';screenCtx.fillRect(0,0,W,H);}screenCtx.drawImage(layer,0,0,W,H);screenCtx.globalCompositeOperation='lighter';screenCtx.drawImage(glowLayer,0,0,W,H);screenCtx.globalCompositeOperation='source-over';}
}
function pause(){if(mode==='play'){showControls();mode='pause';$('pause-menu').hidden=false;keys.clear();}else if(mode==='pause'){hideModals();mode='play';}}
document.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(document.activeElement.tagName))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code)&&mode==='play'&&e.code!=='Tab')e.preventDefault();if(e.code==='Escape'){if(!$('knjiga').hidden){closeBook();return;}if(!$('settings').hidden){closeSettings();return;}if(mode!=='play'&&mode!=='pause'&&document.querySelector('.modal:not([hidden])')){padMenu(0,0,false,true);return;}pause();return;}if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);});document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();pressed.clear();if(mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause();});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);pressed.add(b.dataset.key);});for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));});
$('start').onclick=()=>{saveState=null;try{localStorage.removeItem('marko-save');}catch{}start();save();};$('continue').onclick=()=>start(true);$('pause').onclick=pause;$('resume').onclick=pause;$('retry').onclick=retry;$('restart-checkpoint').onclick=()=>{if(level)return startLevel(levelIndex);if(saveState)start(true);else start();};$('replay').onclick=()=>{start();save();};
function mainMenu(){menuLedger();level=null;levelIndex=-1;stage?.setLevel?.(null);endSequence=null;corpses=[];mode='menu';hideModals();$('menu').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('touch').hidden=true;$('dialogue').hidden=true;$('boss-hud').hidden=true;zone=0;camera=0;keys.clear();}
$('quit').onclick=mainMenu;$('victory-menu').onclick=mainMenu;$('sound').onclick=()=>{initAudio();audioEnabled=!audioEnabled;$('sound').textContent=audioEnabled?'♫':'♪̸';$('sound').setAttribute('aria-label',audioEnabled?'Isključi zvuk':'Uključi zvuk');};
let settingsFrom='menu';function openSettings(from){settingsFrom=from;$('settings').hidden=false;}function closeSettings(){settings.difficulty=$('difficulty').value;readAudioSettings();settings.quality=$('quality').value;settings.reduced=$('reduced').checked;settings.gore=$('gore').checked;try{localStorage.setItem('marko-settings',JSON.stringify(settings));}catch{}$('settings').hidden=true;}
$('settings-open').onclick=()=>openSettings('menu');$('pause-settings').onclick=()=>openSettings('pause');$('settings-close').onclick=closeSettings;$('lore-open').onclick=()=>$('lore').hidden=false;$('lore-close').onclick=()=>$('lore').hidden=true;
p=newPlayer();boss=newBoss();
let last=performance.now(),acc=0;function frame(now){drawSerial++;let dt=Math.min((now-last)/1000,.08);last=now;pollPads();acc+=dt;while(acc>=1/120){update(1/120);acc-=1/120;}draw(dt);requestAnimationFrame(frame);}requestAnimationFrame(frame);
// Read-only QA snapshot; no cheats are exposed to players.
window.markoState=()=>({mode,zone,charge:p?.charge||0,x:p?.x,y:p?.y,hp:p?.hp,energy:p?.energy,wine:p?.wine,buff:p?.buff,horseMounted,kills,elapsed,fairyVisible:fairy.age<fairy.duration,fairyAge:fairy.age,castPending:!!pendingMagic,defense:defenses[zone],bossHp:boss?.hp,runes:world.runes.map(r=>r.active),goals:world.goals?.map(g=>({kind:g.kind,x:Math.round(g.x),y:g.y,done:g.done,label:g.label})),enemies:world.enemies.filter(e=>e.alive&&e.zone===zone).map(e=>({x:e.x,hp:e.hp,mode:e.mode,type:e.type,moving:e.moveT>0&&e.stun<=0,walk:e.walk||0,frame:locomotionPose(e).frame})),bossMode:boss?.mode,bossX:boss?.x,grounded:p?.grounded,remaining:world.enemies.filter(e=>e.alive&&e.zone===zone).length,renderer:stage?'three':'2d',rage:p.rage,guard:p.guard,blocking:p.blocking,crouching:p.crouching,playerHeight:p.h,attackKind:p.attackKind,attack:p.attack,deathSequence:endSequence,corpses:corpses.map(c=>({type:c.type,frame:deathPose(c).frame,t:c.t,grounded:c.grounded,x:Math.round(c.x),y:Math.round(c.y),launched:!!c.launched}))});

document.addEventListener('pointerdown',()=>initAudio(),{once:true});document.addEventListener('keydown',()=>initAudio(),{once:true});

// ---------- audio levels, fullscreen ----------
function applyAudioLevels(){if(!audio||!SND.master)return;const t=audio.currentTime;SND.master.gain.setTargetAtTime(audioEnabled?settings.volume*1.6:0,t,.05);const talk=t<SND.duckUntil;SND.bus.music.gain.setTargetAtTime(settings.music*.5*(talk?.28:1),t,.1);SND.bus.sfx.gain.setTargetAtTime(settings.sfx*.7*(talk?.55:1),t,.06);SND.bus.voice.gain.setTargetAtTime(settings.voice*2,t,.05);SND.bus.enemy.gain.setTargetAtTime(settings.voice*.55*(talk?.4:1),t,.06);}
function readAudioSettings(){settings.volume=Number($('volume').value)/100;settings.music=Number($('vol-music').value)/100;settings.sfx=Number($('vol-sfx').value)/100;settings.voice=Number($('vol-voice').value)/100;applyAudioLevels();}
for(const id of ['volume','vol-music','vol-sfx','vol-voice'])$(id).addEventListener?.('input',()=>{initAudio();readAudioSettings();if(id==='vol-sfx')sfx('hit_body');if(id==='vol-voice')say('kill',{priority:5});});
$('quality').addEventListener?.('change',()=>{settings.quality=$('quality').value;});
function isFullscreen(){return !!(document.fullscreenElement||document.webkitFullscreenElement);}
function toggleFullscreen(force){const el=document.documentElement;const want=force??!isFullscreen();if(want&&!isFullscreen()){const req=el.requestFullscreen||el.webkitRequestFullscreen;if(!req){toast('Na iPhone-u: Podeli → Dodaj na početni ekran za ceo ekran',4);return;}Promise.resolve(req.call(el,{navigationUI:'hide'})).then(()=>screen.orientation?.lock?.('landscape').catch(()=>{})).catch(()=>{});}else if(!want&&isFullscreen())(document.exitFullscreen||document.webkitExitFullscreen)?.call(document);}
$('fullscreen').onclick=()=>toggleFullscreen();$('fullscreen-menu').onclick=()=>toggleFullscreen();
// On phones the legend starts in fullscreen landscape.
for(const id of ['start','continue'])$(id).addEventListener?.('click',()=>{if(matchMedia('(pointer:coarse)').matches)toggleFullscreen(true);});
document.getElementById('touch').addEventListener?.('contextmenu',e=>e.preventDefault());

// ================= pack 02: new foes, fire, blood, eagles =================
// Akindžija: fast raider, slashes or leaps in. Oklopnik: armour stops light hits, hammer slam or shield rush.
// Palikuća: throws burning torches that set the ground alight, breathes fire up close.
const FOES={
 akindzija:{reach:250,speed:150,windup:.5,recover:.75,anims:{main:'akindzija-charge',charge:'akindzija-charge',jump:'akindzija-jump'},pick:d=>d>140?'jump':'charge'},
 oklopnik:{reach:220,speed:55,windup:1,recover:1.15,anims:{main:'oklopnik-slam',slam:'oklopnik-slam',rush:'oklopnik-rush'},pick:d=>d>115?'rush':'slam'},
 palikuca:{reach:420,speed:85,windup:.95,recover:.85,anims:{main:'palikuca-torch',torch:'palikuca-torch',fire:'palikuca-fire'},pick:d=>d<150?'fire':'torch'},
};
let fires=[],decals=[];
function foeAttack(e,F){const d=Math.abs(p.x-e.x);
 if(e.type==='akindzija'){const jump=e.variant==='jump';if(jump)e.exposed=1.5;e.lunge={v:e.face*(jump?Math.min(560,(d-55)/.38):380),t:jump?.38:.24,total:jump?.38:.24,hop:jump?95:0};e.pendingHit={t:jump?.36:.2,dmg:jump?15:12,range:110};sfx('whoosh',{gain:.6,x:e.x});say('tr_attack',{chance:.25,x:e.x});}
 else if(e.type==='oklopnik'){if(e.variant==='rush'){e.lunge={v:e.face*520,t:.3,total:.3,hop:0};e.pendingHit={t:.28,dmg:16,range:105,push:330};sfx('hoof',{gain:.6,x:e.x});}else{e.pendingHit={t:.05,dmg:24,range:115,slam:true};}}
 else if(e.type==='palikuca'){if(e.variant==='fire'){e.pendingHit={t:.12,dmg:12,range:170,fire:true};addFire(e.x+e.face*95,590,2.2,90);fx('burst',e.x+e.face*70,e.y-95,'#ff9a3a',30,220);sfx('boom',{gain:.4,rate:1.8,x:e.x});}else{const t=1.05,vx=clamp((p.x-e.x)/t,-430,430);arrows.push({torch:true,x:e.x+e.face*28,y:e.y-100,vx,vy:-390,life:4,enemy:true});sfx('whoosh_heavy',{gain:.5,x:e.x});}}}
function foeMotion(e,dt){if(e.lunge&&e.lunge.t>0){e.lunge.t-=dt;const nx=e.x+e.lunge.v*dt;if(world.platforms.some(q=>q.kind!=='magic'&&nx>q.x+20&&nx<q.x+q.w-20&&Math.abs(q.y-e.y)<2)&&Math.abs(p.x-nx)>40)e.x=nx;e.hop=e.lunge.hop*Math.sin(Math.PI*clamp(1-e.lunge.t/e.lunge.total,0,1));if(e.lunge.t<=0){e.hop=0;if(e.lunge.hop)dust(e.x,e.y,8,1.2);}}
 if(e.pendingHit){e.pendingHit.t-=dt;if(e.pendingHit.t<=0){const h=e.pendingHit;e.pendingHit=null;if(h.slam){dust(e.x+e.face*60,e.y,18,2.2);sfx('rock',{gain:.8,x:e.x});sfx('boom',{gain:.5,x:e.x});shake=settings.reduced?0:6;}foeStrike(e,h);}}}
function foeStrike(e,h){if(Math.abs(p.x-e.x)>h.range||Math.abs(p.y-e.y)>85||mode!=='play')return;if(p.parry>0&&(e.x-p.x)*p.face>=-15&&!h.fire){e.stun=2;e.mode='stun';e.lunge=null;p.energy=Math.min(100,p.energy+15);fx('parry',p.x+p.face*40,p.y-70);p.rage=Math.min(100,p.rage+25);sound('parry');say('block',{chance:.5,delay:.15});label('SAVRŠENO',p.x,p.y-140,'#bfffe5');startCounter(e.x);return;}const before=p.hp;damage(h.dmg,e.face);if(p.hp<before&&h.push)p.vx+=e.face*h.push;}
function addFire(x,y,life,w=70){if(fires.length>14)fires.shift();fires.push({x,y,life,max:life,w,seed:Math.random()*99});}
function updateFires(dt){for(const f of fires){f.life-=dt;if(f.life>.3&&mode==='play'&&p.grounded&&Math.abs(p.x-f.x)<f.w*.5&&Math.abs(p.y-f.y)<10&&p.invuln<=0){damage(7,0);label('GORI',p.x,p.y-140,'#ffb070');}}fires=fires.filter(f=>f.life>0);}
function blood(x,y,dir,n){if(settings.gore===false||!n)return;const gy=groundAt(x,y)??2000;for(let i=0;i<n;i++){const sp=.35+Math.random();particles.push({kind:'blood',x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*14,vx:dir*(70+Math.random()*330)*sp+(Math.random()-.5)*90,vy:-(70+Math.random()*340)*sp,life:1.3,max:1.3,r:1.6+Math.random()*3.4,gy,color:['#7a070b','#9b0d12','#b5161a','#5e0508'][i%4]});}}
function drawDecals(){if(settings.gore===false)return;for(const d of decals){d.t=(d.t||0)+1/60;const a=clamp(1-(d.t-18)/8,0,1)*.85;if(a<=0||d.x<camera-50||d.x>camera+VIEW_W+50)continue;ctx.globalAlpha=a;ellipse(d.x,d.y+1,d.r*1.6,d.r*.42,'#6a070a');}ctx.globalAlpha=1;decals=decals.filter(d=>d.t<26);}
function drawFlame(x,y,w,h,seed=0,alpha=1){const t=time*9+seed;for(const [g,cols] of [[ctx,['rgba(214,60,14,.85)','rgba(255,150,30,.92)','rgba(255,236,160,.95)']],[gctx,['rgba(255,80,10,.45)','rgba(255,150,30,.5)','rgba(255,230,150,.55)']]]){for(let i=0;i<3;i++){const s=1-i*.3,fh=h*s*(.82+.18*Math.sin(t*1.3+i*2)),fw=w*s;g.beginPath();g.moveTo(x-fw/2,y);g.quadraticCurveTo(x-fw*.6,y-fh*.45,x+Math.sin(t+i)*fw*.22,y-fh);g.quadraticCurveTo(x+fw*.6,y-fh*.45,x+fw/2,y);g.closePath();g.globalAlpha=alpha;g.fillStyle=cols[i];g.fill();}g.globalAlpha=1;}}
function drawFire(f){if(f.x<camera-120||f.x>camera+VIEW_W+120)return;const a=clamp(f.life/.6,0,1)*clamp((f.max-f.life)/.2,0,1);halo(f.x,f.y-20,f.w*1.1,'rgba(255,120,30,.55)',a);const n=Math.max(3,Math.round(f.w/18));for(let i=0;i<n;i++){const x=f.x-f.w/2+(i+.5)*f.w/n;drawFlame(x,f.y+2,20+((i*7+f.seed)%9),34+((i*13+f.seed)%22),f.seed+i*3.1,a);}emitters.push({id:'fire'+Math.round(f.seed*100),kind:'fire',x:f.x,y:f.y,w:f.w,rate:26*a});}
const BRAZIERS=[3760,4850,6420,24930,25980,27120,28420,29680];
function drawBraziers(){if(!((zone===1||zone===4||zone===5)&&!level||level?.id==='tvrdjava'))return;for(const x of BRAZIERS){if(x<camera-80||x>camera+VIEW_W+80)continue;line(x-12,590,x-5,555,'#2c2622',4);line(x+12,590,x+5,555,'#2c2622',4);poly([[x-24,548],[x+24,548],[x+16,562],[x-16,562]],'#3b332c','#86745a');drawFlame(x,550,34,48+6*Math.sin(time*3+x),x);halo(x,530,90,'rgba(255,140,50,.45)',.8+.2*Math.sin(time*7+x));emitters.push({id:'braz'+x,kind:'fire',x,y:546,w:26,rate:16});}}
function drawEagles(){if(!rig?.['orao-flight'])return;for(let i=0;i<3;i++){const span=VIEW_W+500,speed=60+i*22,par=.25+i*.08;const wx=camera+((i*610+time*speed-camera*par)%span+span)%span-250;const wy=camY+80+i*55+Math.sin(time*.6+i*2)*18;rigDraw('orao-flight',Math.floor(time*10+i*2)%6,wx,wy,1,{scale:.55-i*.1,alpha:.92});}}
const FOE_RUN={akindzija:['akindzija-run',115],oklopnik:['oklopnik-walk',80],palikuca:['palikuca-run',90]};
function foePose(e,F){if(e.hurtT>0&&e.mode!=='windup'&&e.mode!=='recover'&&rig?.[e.type+'-hurt'])return{name:e.type+'-hurt',frame:Math.min(3,Math.floor((1-e.hurtT/.34)*4))};const anim=F.anims[e.variant]||F.anims.main,nA=rig?.[anim]?.frames.length||6,cut=Math.max(3,Math.round(nA*.45));if(e.mode==='windup'){const pr=1-e.timer/(e.windupDuration||F.windup);return{name:anim,frame:Math.min(cut-1,Math.floor(pr*cut))};}
 if(e.mode==='recover'){const pr=1-e.timer/F.recover;return{name:anim,frame:cut+Math.min(nA-cut-1,Math.floor(pr*(nA-cut))),dy:-(e.hop||0)};}
 if(e.moveT>0&&rig?.[FOE_RUN[e.type]?.[0]]){const [name,stride]=FOE_RUN[e.type],n=rig[name].frames.length;return{name,frame:Math.floor((e.walk||0)/stride*n)%n};}if(e.moveT>0){const ph=(e.walk||0)/34;return{name:F.anims.main,frame:0,dy:-Math.abs(Math.sin(ph))*4,rot:e.face*(.045+Math.sin(ph)*.03)};}
 if(rig?.[e.type+'-idle'])return{name:e.type+'-idle',frame:idleFrame(e.type,e.id),sy:1+Math.sin(time*2.4+e.id)*.008};return{name:F.anims.main,frame:0,sy:1+Math.sin(time*2.6+e.id)*.012};}

// ---------- touch controls: icons and the thumb fan ----------
const TOUCH_ICONS={
 KeyA:'<path d="M15 5l-7 7 7 7"/>',KeyD:'<path d="M9 5l7 7-7 7"/>',KeyS:'<path d="M6 9l6 6 6-6"/>',
 KeyJ:'<path d="M4.5 19.5l8-8"/><circle cx="15.5" cy="8.5" r="3.6" fill="currentColor"/><path d="M15.5 2.6v1.6M15.5 12.8v1.6M9.6 8.5h1.6M19.8 8.5h1.6M11.4 4.4l1.1 1.1M18.5 11.5l1.1 1.1M19.6 4.4l-1.1 1.1M12.5 11.5l-1.1 1.1"/>',
 Space:'<path d="M6 14l6-6 6 6"/><path d="M5 20h14" opacity=".55"/>',
 KeyL:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M12 7v10" opacity=".55"/>',
 KeyK:'<path d="M3.5 20.5l7-7"/><circle cx="13.5" cy="10.5" r="4.2" fill="currentColor"/><path d="M20 4l-2 2M22 9.5h-2.6M15.5 1.8v2.4"/>',
 ShiftLeft:'<path d="M4 7l5 5-5 5M11 7l5 5-5 5"/><path d="M19.5 6v12" opacity=".6"/>',
 KeyF:'<path d="M12 12.5a1.6 1.6 0 1 1 1.6-1.6M13.6 10.9a3.6 3.6 0 1 1-3.6-3.6M10 7.3a5.6 5.6 0 1 1 7.6 5.2M17.6 12.5a7.4 7.4 0 0 1-12.9 2.5"/>',
 KeyR:'<path d="M12 2l2.4 6.2L21 9l-5 4.3L17.6 21 12 17.3 6.4 21 8 13.3 3 9l6.6-.8z" fill="currentColor" fill-opacity=".3"/>',
 KeyQ:'<path d="M7 3h10l-1 6a4 4 0 0 1-8 0z"/><path d="M12 13v6M8 21h8"/>',
 KeyE:'<path d="M12 3c.8 4 2.2 5.4 6 6.2-3.8.8-5.2 2.2-6 6.2-.8-4-2.2-5.4-6-6.2 3.8-.8 5.2-2.2 6-6.2z"/><path d="M19 15v4M17 17h4"/>',
 KeyI:'<path d="M3 15c4-6 10-8 17-6" stroke-dasharray="2 3"/><circle cx="18" cy="9" r="3.4" fill="currentColor"/><path d="M18 3.6v1.6M18 12.8v1.6M12.6 9h1.6M21.8 9h1.6"/>',
 KeyW:'<path d="M6 15l6-6 6 6"/><path d="M8 21V3M16 21V3M8 8h8M8 13h8M8 18h8" opacity=".45"/>',
};
function layoutTouch(){if(!hasDom)return;const small=innerHeight<=430,main=small?58:66;for(const b of document.querySelectorAll('#touch [data-key]')){if(TOUCH_ICONS[b.dataset.key]&&!b.firstElementChild)b.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${TOUCH_ICONS[b.dataset.key]}</svg>`;const ring=Number(b.dataset.ring||0);if(!ring)continue;const size=ring===1?(small?44:50):(small?38:42),r=ring===1?(small?66:74):(small?114:128),a=Number(b.dataset.angle)*Math.PI/180;b.style.right=(main/2+r*Math.cos(a)-size/2)+'px';b.style.bottom=(main/2+r*Math.sin(a)-size/2)+'px';}}
layoutTouch();window.addEventListener('resize',layoutTouch);

// ---------- launch on the killing blow ----------
function chargeMult(){return 1+(p.charge||0)*1.6+(p.chargeFull?.6:0);}
function launchPower(){if(!(p.attack>0))return 0;if(p.attackKind==='super')return 1;if(p.attackKind==='heavy'&&(p.charge||0)>.35)return p.chargeFull?1:.65;return 0;}
function launchCorpse(c,power,fromX){if(!power)return c;const dir=Math.sign(fromX-p.x)||p.face;c.vx=dir*(360+power*360);c.vy=-(360+power*300);c.y-=6;c.grounded=false;c.launched=true;c.spinV=dir*(8+power*6);c.spinAngle=0;c.trail=0;hitstop=Math.max(hitstop,.06);shake=settings.reduced?0:6+power*5;sfx('boom',{gain:.55+power*.3});sfx('hit_heavy',{gain:.9});fx('hit',fromX,c.y-60,true);blood(fromX,c.y-70,dir,30+power*20);if(c.type!=='musa')say('tr_death',{chance:.7,x:fromX});return c;}
function flyCorpse(c,dt){if(!c.landed){if(!c.grounded){c.spinAngle+=c.spinV*dt;c.trail-=dt;if(c.trail<=0){c.trail=.03;blood(c.x,c.y-50,-Math.sign(c.vx)||1,2);}}else{c.landed=true;c.landT=c.t;c.slideV=c.vx*.5;c.spinAngle=0;dust(c.x,c.y,16,2.2);sfx('fall',{gain:1,x:c.x});sfx('land',{gain:.8,x:c.x});blood(c.x,c.y-12,Math.sign(c.slideV)||1,10);shake=Math.max(shake,settings.reduced?0:3);}return;}
 if(Math.abs(c.slideV||0)>8){c.x+=c.slideV*dt;c.slideV*=Math.pow(.03,dt);if(c.persist)c.x=clamp(c.x,28060,29840);if(Math.random()<.4)dust(c.x,c.y,1,.6);if(groundAt(c.x,c.y-2)!==c.y){c.grounded=false;c.landed=false;c.vx=c.slideV;c.vy=0;c.slideV=0;}}}

// ================= pack 03: movement and combat =================
const ROLL_TIME=.34,DOWN_TIME=1.25,LEDGE_TIME=.72;
function pack3Pose(){
 if(p.turnT>0&&p.grounded&&p.attack<=0&&!p.crouching&&!p.blocking&&rig?.['marko-turn']){const n=rig['marko-turn'].frames.length;return{name:'marko-turn',frame:Math.min(n-1,Math.floor((1-p.turnT/TURN_TIME)*n)),faceAs:-p.face};}
 if(p.runStartT>0&&p.grounded&&p.attack<=0&&Math.abs(p.vx)>35&&!p.crouching&&!p.blocking&&rig?.['marko-run-start']){const n=rig['marko-run-start'].frames.length;return{name:'marko-run-start',frame:Math.min(n-1,Math.floor((1-p.runStartT/RUNSTART_TIME)*n))};}
 if(p.dizzy>0){if(rig?.['marko-dizzy'])return{name:'marko-dizzy',frame:Math.floor(time*8)%rig['marko-dizzy'].frames.length};const w=Math.sin(time*6.5);return{name:rig?.['marko-idle']?'marko-idle':'cast/marko',frame:0,rot:w*.1,dx:Math.sin(time*3.2)*6,sy:.97};}
 {const f=flowPose();if(f)return f;}
 if(p.attackKind==='heavy'&&p.attack>0&&p.chargeable&&!p.chargeReleased&&p.charge>.08&&rig?.['marko-charge-hold']){const moving=p.grounded&&Math.abs(p.vx)>15;if(moving&&rig?.['marko-charge-walk'])return{name:'marko-charge-walk',frame:Math.floor(p.gait*.8)%rig['marko-charge-walk'].frames.length};const s=moving?Math.sin(p.gait*Math.PI*.8):0;return{name:'marko-charge-hold',frame:Math.floor(time*9)%rig['marko-charge-hold'].frames.length,dy:-Math.abs(s)*3,rot:s*.02};}
 if(p.leverT>0&&rig?.['marko-lever']){const n=rig['marko-lever'].frames.length;return{name:'marko-lever',frame:Math.min(n-1,Math.floor((1-p.leverT/.5)*n))};}
 if(p.pushing&&p.grounded&&p.attack<=0&&rig?.['marko-push'])return{name:'marko-push',frame:Math.floor(time*8)%rig['marko-push'].frames.length};
 if(p.slide>0&&rig?.['marko-slide']){const n=rig['marko-slide'].frames.length;return{name:'marko-slide',frame:Math.min(n-1,Math.floor((1-p.slide/SLIDE_TIME)*n))};}
 if(p.kick>0&&rig?.['marko-kick']){const n=rig['marko-kick'].frames.length;return{name:'marko-kick',frame:Math.min(n-1,Math.floor((1-p.kick/KICK_TIME)*n))};}
 if(p.hang&&p.ledgeT>0&&rig?.['marko-hang'])return{name:'marko-hang',frame:Math.floor(time*5)%rig['marko-hang'].frames.length};
 if(p.down>0){const t=DOWN_TIME-p.down;if(t<.55&&rig?.['marko-knockdown'])return{name:'marko-knockdown',frame:Math.min(4,Math.floor(t/.55*5))};if(t<.75&&rig?.['marko-knockdown'])return{name:'marko-knockdown',frame:5};if(rig?.['marko-getup'])return{name:'marko-getup',frame:Math.min(5,Math.floor((t-.75)/.5*6))};}
 if(p.ledgeT>0&&rig?.['marko-ledge']){const k=1-p.ledgeT/LEDGE_TIME;return{name:'marko-ledge',frame:k<.1?0:k<.22?1:k<.34?2:Math.min(7,3+Math.floor((k-.34)/.66*5))};}
 if(p.wall&&rig?.['marko-wallslide'])return{name:'marko-wallslide',frame:Math.floor(time*8)%4,faceAs:p.wall};
 if(p.wall&&rig?.['marko-walljump'])return{name:'marko-walljump',frame:Math.floor(time*6)%2,faceAs:p.wall};
 if(p.wallJumpT>0&&rig?.['marko-walljump'])return{name:'marko-walljump',frame:3+Math.min(2,Math.floor((1-p.wallJumpT/.32)*3)),faceAs:p.wallSide};
 if(p.plunge===1&&rig?.['marko-plunge'])return{name:'marko-plunge',frame:Math.min(2,Math.floor((time-p.plungeStart)/.09))};
 if(p.plunge===2&&rig?.['marko-plunge'])return{name:'marko-plunge',frame:3+Math.min(2,Math.floor((1-p.plungeT/.4)*3))};
 if(p.dash>0&&p.grounded&&rig?.['marko-roll'])return{name:'marko-roll',frame:Math.min(5,Math.floor((1-p.dash/ROLL_TIME)*6))};
 return null;}
function startCounter(x){if(!p.grounded||horseMounted||Math.abs(x-p.x)>170||p.down>0)return;p.face=x>p.x?1:-1;p.attack=.55;p.attackKind='counter';p.attackId=++attackSerial;p.counterHit2=false;p.cooldown=.62;p.charge=0;hitstop=Math.max(hitstop,.08);fx('flash','#d8fff0',.08);sayGrunt(true);}
function updateCounter(){if(p.attackKind!=='counter'||p.attack<=0)return;const ph=1-p.attack/.55;if(ph>.72&&!p.counterHit2){p.counterHit2=true;p.attackId=++attackSerial;}}
function startPlunge(){cdStart('plunge');p.plunge=1;p.plungeStart=time;p.vy=Math.max(p.vy,260);p.attack=0;p.spin=0;sayGrunt(true);}
function plungeImpact(){if(level&&p.on?.kind==='cracked'&&breakCracked()){p.plunge=0;return;}if(level&&(world.traps||[]).some(t=>t.kind==='spikes'&&p.x+10>t.x&&p.x-10<t.x+t.w&&Math.abs(p.y-t.y)<8)){bounce(p.x,p.y-20,'#ffe6b0');return;}p.plunge=2;p.plungeT=.4;dust(p.x,p.y,24,2.6);sfx('boom',{gain:.8});sfx('rock',{gain:.9});shake=settings.reduced?0:8;fx('hit',p.x+p.face*30,p.y-10,true);const power=p.buff>0?1.3:1;
 for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;const dx=e.x-p.x;if(Math.abs(dx)>135||Math.abs(e.y-p.y)>90)continue;const amount=55*power;e.hp-=amount;e.flash=.15;e.stun=Math.max(e.stun,e.type==='akindzija'?2:.9);e.mode='stun';e.knock=Math.sign(dx||1)*20;if(e.type==='oklopnik'&&(e.armor??3)>0){e.armor=0;label('OKLOP PUKAO!',e.x,e.y-150,'#ffe39a');}e.hurtT=.34;label(Math.round(amount),e.x,e.y-110);blood(e.x,e.y-60,Math.sign(dx||1),16);if(e.hp<=0){slay(e,.8);dust(e.x,e.y,10,1.4);}}
 if(zone===5&&boss.alive&&Math.abs(boss.x-p.x)<150&&MUSA_OPEN.includes(boss.mode)){boss.hp=Math.max(0,boss.hp-70*power);boss.flash=.16;boss.hurtT=.34;blood(boss.x,boss.y-90,p.face,16);bossAfterDamage();}}
// Raised stone blocks: hands near the top while airborne and facing the edge -> grab and climb.
function ledgeCheck(){if(level)return ledgeCheckLevel();if(p.ledgeT>0||horseMounted||p.plunge||p.vy< -150||p.attack>0||p.down>0)return;for(const q of world.platforms){if(q.kind!=='stone'||isFloor(q))continue;const hands=p.y-112;if(Math.abs(hands-q.y)>28||p.y<q.y+24)continue;const left=p.face>0&&p.x+17>q.x-12&&p.x+17<q.x+20,right=p.face<0&&p.x-17<q.x+q.w+12&&p.x-17>q.x+q.w-20;if(!left&&!right)continue;
  const edge=left?q.x:q.x+q.w;p.ledge={x0:edge-p.face*18,y0:q.y+112,x1:edge+p.face*24,y1:q.y};p.ledgeT=LEDGE_TIME;p.vx=0;p.vy=0;p.wall=0;sfx('cloth',{gain:.6});sayGrunt(false);return;}}
function ledgeUpdate(dt){if(!(p.ledgeT>0))return false;if(p.hang&&hangUpdate())return true;p.ledgeT=Math.max(0,p.ledgeT-dt);const L=p.ledge,k=1-p.ledgeT/LEDGE_TIME;if(k<.34){p.x=L.x0;p.y=L.y0;}else{const t=(k-.34)/.66,e=t*t*(3-2*t);p.x=L.x0+(L.x1-L.x0)*e;p.y=L.y0+(L.y1-L.y0)*Math.min(1,e*1.25);}p.vx=0;p.vy=0;p.grounded=p.ledgeT<=0;if(p.ledgeT<=0){p.y=L.y1;p.ledge=null;}return true;}
// Pressing into the side of a raised block while airborne -> slide down it; Space jumps off.
function wallCheck(){if(level)return wallCheckLevel();p.wall=0;if(horseMounted||p.ledgeT>0||p.plunge||p.down>0)return;const axis=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);if(!axis)return;for(const q of world.platforms){if(q.kind!=='stone'||isFloor(q))continue;if(p.y<q.y+40||p.y-90>q.y+118)continue;const side=axis>0?q.x:q.x+q.w,edge=p.x+axis*17;if(Math.abs(edge-side)<12&&(axis>0?p.x<q.x:p.x>q.x+q.w)){p.x=side-axis*17;p.wall=axis;p.face=axis;if(p.vy>130)p.vy=130;if(Math.random()<.08)dust(side,p.y-30,1,.4);break;}}}

// ================= campaigns ("pohodi"): levels designed by the artist =================
let level=null,levelIndex=-1;const levelArt={},LEVEL_LOOK={selo:0,klisura:3,suma:2,manastir:4,tvrdjava:5,prevoj:6,pecina:7,podrum:8,mocvara:9,rudnik:10,rusevine:11,reka:12};
const LEVEL_INTRO={selo:'Selo je pod opsadom. Oteraj odred i stigni do barjaka na kraju puta.',klisura:'Ibar huči ispod nas. Pazi na provalije i palikuće sa bakljama.',suma:'Ovo je moja šuma, Marko. Strelci se kriju među bukvama.',manastir:'Manastir traži zaštitu. Oklopnici čuvaju prilaz.',tvrdjava:'Tvrđava gori. Probij se kroz opsadu do barjaka.',prevoj:'Prevoj je zaleđen. Poslednji odred čeka na vrhu.',pecina:'Ovo je moja pećina, Marko. Kristali pokazuju prolaz, a Turci su se zavukli i ovde.',podrum:'Podrum tvrđave. Vino je blizu, ali i palikuće sa bakljama.',mocvara:'Prati svetiljke i ne gazi u crnu vodu. Strelci vrebaju iz trske.',rudnik:'Stari rudnik. Oklopnici čuvaju izlaz, pazi na grede.',rusevine:'Ruševine na brdu. Gore čeka poslednji sačuvani barjak.',reka:'Zora je blizu. Stigni do vodenice pre nego što odred pređe reku.'};
// Each level comes in three lights painted by the artist: day, night and storm.
const VARIANTS={day:{label:'Dan',icon:'☀',intro:''},night:{label:'Noć',icon:'☾',intro:'Noć je pala. '},storm:{label:'Oluja',icon:'⚡',intro:'Oluja bije, više ih je. '}};
let levelVariant='day';try{levelVariant=VARIANTS[localStorage.getItem('marko-variant')]?localStorage.getItem('marko-variant'):'day';}catch{}
const levelLayers=(L,v)=>(v==='night'&&L.nightLayers?.length?L.nightLayers:v==='storm'&&L.stormLayers?.length?L.stormLayers:L.layers);
const vistaId=(L,v)=>v==='day'?L.id+'-vista':`${L.id}-vista-${v}`;
const doneKey=(L,v)=>v==='day'?L.id:`${L.id}@${v}`;
function levelsDone(){try{return JSON.parse(localStorage.getItem('marko-levels')||'[]');}catch{return[];}}
function loadImage(src){return new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src;});}
let worldFiles=null,worldCatalog=null;const PACK04_ART=['razbi-sanduk','razbi-cup','razbi-bure','razbi-korpa','razbi-kovceg','razbi-kovceg-otvoren','prop-sanduci','prop-bure','prop-krcag','lestve','lestve-vrh','kula-strazara','predmet-topuz','predmet-dukat','plug-slomljen','cilj-tovar-blaga','volovi-plug-static','prop-balvan','prop-lanac','prop-stena-mala','cilj-poluga','cilj-poluga-povucena','cilj-kapija-zatvorena','cilj-kapija-otvorena','zid-stena','zid-drvo','ploca-pritisak','ploca-pritisak-stisnuta','teret-sanduk','splav','vrata-zakljucana','vrata-otkljucana','prolaz-kamen-zatvoren','prolaz-kamen-otvoren','prolaz-drvo-zatvoren','prolaz-drvo-otvoren','prolaz-rudnik-zatvoren','prolaz-rudnik-otvoren','lift-platforma','kotur','kolje','siljci','zid-kamen','predmet-slovo-m','predmet-slovo-a','predmet-slovo-r','predmet-slovo-k','predmet-slovo-o','predmet-moc-oganj','predmet-moc-grom','predmet-moc-vila','predmet-trava','predmet-cutura','razbi-kosnica','razbi-plast','razbi-tikve','razbi-stena-napukla','razbi-panj','razbi-crkveni-sanduk','razbi-bure-baruta','razbi-tobolac','razbi-santa','razbi-vagon','resetka','predmet-srce-deo','predmet-zapis','predmet-kljuc','pod-napukao','zid-napukao','ulaz-riznica','ulaz-riznica-otvoren','prop-turski-sator'];async function loadLevelArt(L,v='day'){worldFiles??=new Set(await fetch('assets/world/files.json').then(r=>r.json()).catch(()=>[]));const has=f=>!worldFiles.size||worldFiles.has(f);worldCatalog??=await fetch('assets/world/catalog-03.json').then(r=>r.json()).then(c=>Array.isArray(c)?c:c.items||c.assets||Object.values(c)).catch(()=>[]);const ids=[...new Set([...levelLayers(L,v).map(l=>l.id),...(L.fallbackLayers||[]).map(l=>l.id),vistaId(L,v),...L.props.map(p=>p.id),...goalArt(L),'tlo-'+L.id,'tlo-'+L.id+'-kraj',...(L.ground?['tlo-'+L.ground,'tlo-'+L.ground+'-kraj']:[]),...PACK04_ART,...decorIds(L),'zid-'+(WALL_OF[L.id]||'kamen'),...CUDA.filter(c=>c.land===L.id).map(c=>'cudo-'+c.id)])];await Promise.all(ids.filter(id=>!(id in levelArt)).map(async id=>{levelArt[id]=(has(id+'.webp')?await loadImage(`assets/world/${id}.webp`):null)||(has(id+'-variant.webp')?await loadImage(`assets/world/${id}-variant.webp`):null);}));}
// Transparent margins around props: find the drawn area once so props stand on the ground.
// ---------- campaign goals: gates, levers, fairy stones, lanterns, the relic ----------
let goalHintT=0;const GOAL_VERB={poluga:'POVUCI',kamen:'PROBUDI',sprava:'SLOMI',kristal:'PROBUDI',svetiljka:'UPALI'};
function pendingGoal(){return world.goals?.find(g=>!g.done)||null;}
function goalText(){const g=pendingGoal();if(!g)return chapters[zone].goal;const same=world.goals.filter(o=>o.label===g.label);return same.length>1?`${g.label} · ${same.filter(o=>o.done).length}/${same.length}`:g.label;}
function goalHint(text){if(goalHintT>0)return;toast(text,2.6);goalHintT=3;}
function finishGoal(g){g.done=true;g.t=0;burst(g.x,g.y-g.h*.55,g.glow||'#ffe6a8',g.smash?30:44,g.smash?240:160);if(g.smash){dust(g.x,g.y-20,16,1.4);sfx('whoosh',{gain:.8,x:g.x});shake=Math.max(shake,settings.reduced?0:6);}else fx('pillar',g.x,g.y-10);sound('magic');if(g.doneText)toast(g.doneText,2.6);openGates();updateHud();}
function guardsAt(g){return world.enemies.filter(e=>e.alive&&e.x>g.x-1100&&e.x<g.x+220).length;}
function openGates(){for(const g of world.goals){if(g.kind!=='gate'||g.done)continue;if(world.goals.some(o=>o.id<g.id&&!o.done)||(g.guarded&&guardsAt(g)))return;g.done=true;g.t=0;if(Math.abs(p.x-g.x)>900)continue;burst(g.x,g.y-150,'#ffe6a8',36,180);dust(g.x,g.y-10,12,1.2);sound('magic');toast(g.off.includes('rudarski')?'Rudarski izlaz je otvoren.':'Kapija se otvorila.',2.6);updateHud();}}
function updateGoals(dt){if(!world.goals)return;goalHintT-=dt;for(const g of world.goals){g.t+=dt;if(g.done)continue;
 if(g.kind==='plow'){g.x=g.plow.x;if(g.plow.treasureTaken)finishGoal(g);continue;}
 if(g.kind==='take'&&Math.abs(p.x-g.x)<60&&Math.abs(p.y-g.y)<130)finishGoal(g);
 if(g.kind==='gate'){openGates();if(!g.done&&p.x>g.x-GATE_STOP&&p.x<g.x+40){p.x=g.x-GATE_STOP;const before=world.goals.find(o=>o.id<g.id&&!o.done);goalHint(before?`Zatvoreno. ${before.label}.`:g.guarded?`Kapija je zatvorena. Preostalo čuvara: ${guardsAt(g)}.`:'Zatvoreno.');}}}}
function useGoal(){const g=world.goals?.find(g=>!g.done&&g.kind==='use'&&Math.abs(p.x-g.x)<120&&Math.abs(p.y-g.y)<160);if(!g)return false;p.castLock=.5;finishGoal(g);return true;}
function drawGoals(){if(!world.goals)return;for(const g of world.goals){if(g.kind==='plow'||(g.kind==='take'&&g.done)||g.x<camera-500||g.x>camera+VIEW_W+500)continue;
 if(g.kind==='gate'){drawSideGate('goal'+g.id,g.x,g.y,g.done,g.off.includes('rudarski')?'rudnik':gateStyle());continue;}
 const base=levelArt[g.off],im=levelArt[g.done&&g.on?g.on:g.off];let gw=g.h*.6;if(base&&im){const k=g.h/propBounds(base).h,b=propBounds(im),w=b.w*k,h=b.h*k;gw=w;ctx.drawImage(im,b.x,b.y,b.w,b.h,g.x-w/2,g.y-h+6,w,h);}else drawGoalFallback(g);
 // a soft light on the lit part only: the bloom pass multiplies it, so it stays faint here
 if(g.glow&&(g.done||g.kind==='take')){const pulse=.8+.2*Math.sin(time*2.4+g.x);halo(g.x+g.gx*gw,g.y-g.h*g.gy,g.h*.42,g.glow,(g.done?Math.min(.32,g.t*.8):.22)*pulse);}
 if(!g.done&&g.kind==='use'&&Math.abs(p.x-g.x)<300){const verb=Object.entries(GOAL_VERB).find(([k])=>g.off.includes(k))?.[1]||'UPOTREBI';textLabel(`E · ${verb}`,g.x,g.y-g.h-16,{font:'bold 13px Georgia',color:'#fff0c8',glow:g.glow||'#ffd27a'});}}}
// simple stand-ins until the artist's drawing for a goal arrives
function drawGoalFallback(g){const x=g.x,y=g.y;if(g.kind==='gate'){if(g.done){line(x-70,y,x-70,y-g.h,'#5a4330',10);line(x+70,y,x+70,y-g.h,'#5a4330',10);return;}for(let j=0;j<7;j++)line(x-66+j*22,y-g.h+30,x-66+j*22,y,'#5a4330',9);line(x-80,y-g.h*.6,x+80,y-g.h*.6,'#3e2d20',8);line(x-90,y-g.h+30,x+90,y-g.h+30,'#3e2d20',10);return;}
 if(g.kind==='finish')return;const lit=g.done||g.kind==='take';poly([[x-g.h*.18,y],[x-g.h*.22,y-g.h*.6],[x,y-g.h],[x+g.h*.2,y-g.h*.62],[x+g.h*.17,y]],lit?'#7d8f86':'#59625d','#2c3330');if(lit)halo(x,y-g.h*.6,g.h*.6,g.glow||'#ffe6a8',.6);}
const propBox=new Map();function propBounds(im){let b=propBox.get(im);if(b)return b;const c=makeCanvas(256,Math.max(1,Math.round(256*im.height/im.width))),g=c.getContext('2d');g.drawImage(im,0,0,c.width,c.height);const d=g.getImageData(0,0,c.width,c.height).data;let x0=c.width,y0=c.height,x1=0,y1=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>60){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}const k=im.width/c.width;b=x1>=x0?{x:x0*k,y:y0*k,w:(x1-x0+1)*k,h:(y1-y0+1)*k}:{x:0,y:0,w:im.width,h:im.height};propBox.set(im,b);return b;}
function drawLevelDecor(solid){
 if(['selo','klisura','suma','manastir'].includes(level.id))for(let x=Math.floor(camera/1300)*1300;x<camera+VIEW_W+500;x+=1300){if(solid(x+520))tree(x+520,590);}
 for(const pr of level.props){const im=levelArt[pr.id];if(!im)continue;const b=propBounds(im),h=pr.height,w=b.w*h/b.h;if(pr.x+w<camera-60||pr.x-w>camera+VIEW_W+60)continue;ctx.drawImage(im,b.x,b.y,b.w,b.h,pr.x-w/2,pr.y-h+6,w,h);}
 drawGoals();
 const banner=x=>level.props.some(pr=>pr.id.startsWith('prop-barjak')&&Math.abs(pr.x-x)<140);if(!banner(level.spawn.x+80))flag(level.spawn.x+80,level.spawn.y);if(!banner(level.goal.x))flag(level.goal.x,level.goal.y);}
async function startLevel(i,v=levelVariant){const L=LEVELS[i];if(!L)return;if(!VARIANTS[v])v='day';levelVariant=v;initAudio();$('loading').hidden=false;await loadLevelArt(L,v);$('loading').hidden=true;
 world=makeLevel(L,i,v,{extraFoes:['kopljanik','pas','tufekdzija'].filter(t=>rig?.[t+'-run']&&FOES[t])});level=world.level;levelIndex=i;zone=LEVEL_ZONE+i;checkpoint=zone;defenses={};p=newPlayer(level.spawn.x);p.y=level.spawn.y;applyPerks();applyHearts();setupBreakables();setupTowers();setupPlows();clearProps();decorate();setupTraps();arena=null;bolts=[];p.vault=null;p.letters=0;p.pow=null;skillCache=null;streak={n:0,t:0,best:0};slowMo=0;hitstop=0;addPartners();hardenFoes(world.enemies);makeElites();coins=[];chunks=[];thrown=null;camFocus=p.y;lastSafeY=p.y;boss=newBoss();boss.alive=false;horseMounted=false;horseCompleted=true;horseX=-99999;
 particles=[];arrows=[];floating=[];corpses=[];ghosts=[];fires=[];decals=[];endSequence=null;camera=0;camY=CAM_Y0;lastSafe=p.x;elapsed=0;kills=0;relics=0;
 hideModals();mode='play';$('hud').hidden=false;$('controls').hidden=false;$('touch').hidden=!matchMedia('(pointer:coarse)').matches;$('boss-hud').hidden=true;keys.clear();pressed.clear();pendingMagic=null;
 fairy={x:p.x-55,y:p.y-125,age:99,duration:3.2,targetX:p.x,targetY:p.y-80,kind:'hover'};
 let plan=levelLayers(L,v);if(!levelArt[plan[0]?.id]&&L.fallbackLayers)plan=L.fallbackLayers;const layers=plan.map(l=>({image:levelArt[l.id],speed:l.speed})).filter(l=>l.image);if(layers.length&&!levelArt[plan[0].id]&&levelArt[vistaId(L,v)])layers.unshift({image:levelArt[vistaId(L,v)],speed:.06});
 showControls();stage?.setLevel?.(layers.length?layers:null);{const k=SKILLS.find(k=>k.land===L.id);showTitle(`POHOD ${i+1}${v==='night'?' · NOĆ':v==='storm'?' · OLUJA':''}`,L.name,k&&!ownedSkills().has(k.id)?`Na kraju te čeka nova veština: ${k.name}`:'');}speak(`${L.name}. ${VARIANTS[v].intro}${LEVEL_INTRO[L.id]||L.design?.goal||'Prati put do barjaka.'}`,7);say('chapter',{chance:.8,delay:.6});updateHud();}
function completeLevel(){if(mode!=='play')return;mode='levelDone';const done=new Set(levelsDone());done.add(doneKey(level,levelVariant));try{localStorage.setItem('marko-levels',JSON.stringify([...done]));}catch{}
 sound('magic');sfx('horn_call',{gain:.7});say('chapter',{priority:3});keys.clear();$('level-done-title').textContent=level.name+(levelVariant==='day'?'':' · '+VARIANTS[levelVariant].label);
 if(p.letters===31){try{const d=new Set(JSON.parse(localStorage.getItem('marko-slova')||'[]'));d.add(level.id);localStorage.setItem('marko-slova',JSON.stringify([...d]));}catch{}}const learned=SKILLS.find(k=>k.land===level.id),fresh=learned&&grantSkill(learned.id);$('level-skill').innerHTML=fresh?`<p class="eyebrow">NOVA VEŠTINA</p><h3>${fresh.name}</h3><p><kbd>${fresh.key}</kbd> ${fresh.text}</p>`:learned?`<p class="eyebrow">VEŠTINA IZ OVOG POHODA</p><h3>${learned.name}</h3>`:'';$('level-skill').hidden=!learned;{const st=levelStars(level);$('level-stars').innerHTML=[st.done,st.slova,st.cudo].filter(v=>v!==null).map((on,k)=>`<i class="${on?'':'off'}" style="animation-delay:${.25+k*.3}s">★</i>`).join('');}
 $('level-stats').innerHTML=`<div><b>${[...SLOVA].map((c,i)=>(p.letters||0)&(1<<i)?c:'·').join(' ')}</b>Slova</div><div><b>${formatTime(elapsed)}</b>Vreme</div><div><b>×${streak.best}</b>Najduži niz</div><div><b>${starText(level)}</b>Zvezde</div><div><b>${kills}</b>Poraženi</div><div><b>${p.coins||0}</b>Dukati</div><div><b>${p.cudoFound?'✦':'—'}</b>${p.cudoFound?CUDA.find(c=>c.id===p.cudoFound)?.name:'Čudo nije nađeno'}</div>`;
 const next=LEVELS[levelIndex+1];$('level-next').hidden=!next;if(next)$('level-next').textContent=`Sledeći pohod: ${next.name} →`;p.victoryAt=performance.now()/1000;if(hasDom&&rig?.['marko-victory']&&!settings.reduced)setTimeout(()=>{if(mode==='levelDone')$('level-done').hidden=false;},1150);else $('level-done').hidden=false;}
$('levels-open')&&($('levels-open').onclick=openLevels);$('menu-pohodi')&&($('menu-pohodi').onclick=openLevels);$('levels-close').onclick=()=>$('levels').hidden=true;$('victory-next').onclick=()=>startLevel(0);
$('level-next').onclick=()=>startLevel(levelIndex+1);$('level-replay').onclick=()=>startLevel(levelIndex);$('level-menu').onclick=mainMenu;
if($('levels-open'))$('levels-open').hidden=!LEVELS.length;$('victory-next').hidden=!LEVELS.length;

function isFloor(q){return level?!!q.ground:q.y>=585;}

// ---------- weather ambience: rain on storm levels, crickets and frogs at night ----------
function ambience(){if(!audio||!SND.bus.sfx)return;const want=level&&mode!=='menu'?(levelVariant==='storm'?'rain':levelVariant==='night'||level.id==='mocvara'?'night':null):null;if(SND.ambName===want)return;const buf=want&&SND.buf['music/'+want];if(want&&!buf)return;
 if(SND.amb){const old=SND.amb;old.g.gain.setTargetAtTime(0,audio.currentTime,.5);setTimeout(()=>{try{old.s.stop();}catch{}},2500);SND.amb=null;}SND.ambName=want;if(!buf)return;
 const s=audio.createBufferSource();s.buffer=buf;s.loop=true;const g=audio.createGain();g.gain.value=0;g.gain.setTargetAtTime(want==='rain'?.75:.55,audio.currentTime,.7);s.connect(g);g.connect(SND.bus.sfx);s.start();SND.amb={s,g};}

// ================= pack 04: climbing, crates and jars, ducats, marvels, the thrown mace, foes that jump =================
// ---------- marvels (čuda) and the smith: kept between runs in localStorage ----------
let perks=new Set();
function ownedCuda(){try{return new Set(JSON.parse(localStorage.getItem('marko-cuda')||'[]'));}catch{return new Set();}}
function bank(){return bankCache;}
function setBank(n){bankCache=Math.max(0,Math.round(n));try{localStorage.setItem('marko-dukati',String(bankCache));}catch{}}
function smithLevels(){try{return JSON.parse(localStorage.getItem('marko-kovac')||'{}');}catch{return{};}}
const SMITH=[{id:'hp',name:'Pancirna košulja',text:'+10 zdravlja',cost:[60,90,130,180,240]},{id:'mace',name:'Okovan topuz',text:'+8% snage udaraca',cost:[80,120,170,230,300]},{id:'flask',name:'Veća čutura',text:'+1 vino na polasku',cost:[120,200]}];
function applyPerks(){perks=ownedCuda();const s=smithLevels();p.maxHp+=(s.hp||0)*10+(perks.has('carska-knjiga')?15:0);p.hp=p.maxHp;p.wineMax=3+(s.flask||0)+(perks.has('pehar-vina')?1:0);p.wine=Math.min(5,p.wine+(s.flask||0)+(perks.has('pehar-vina')?1:0));p.power=1+(s.mace||0)*.08;p.coins=0;p.cudoFound=null;}
function collectCudo(i){const c=CUDA.find(c=>c.id===i.cudo);if(!c)return;const had=ownedCuda();burst(i.x,i.y,'#ffe39a',50,220);fx('pillar',i.x,i.y+40);sfx('magic_big',{gain:.9});sfx('coins',{gain:.7});shake=settings.reduced?0:4;
 if(had.has(c.id)){addCoins(15,i.x,i.y);toast(`${c.name} je već u riznici · +15 dukata`,3);return;}
 had.add(c.id);try{localStorage.setItem('marko-cuda',JSON.stringify([...had]));}catch{}perks=had;p.cudoFound=c.id;
 if(c.id==='carska-knjiga'){p.maxHp+=15;p.hp+=15;}if(c.id==='pehar-vina')p.wine=Math.min(5,p.wine+1);
 reachDown();label('ČUDO IZ PESME',i.x,i.y-20,'#ffe6a0');speak(`${c.name} — iz pesme „${c.song}”. ${c.perk}.`,6);say('relic',{priority:3});toast(`Riznica: ${had.size}/${CUDA.length} čuda`,3);}
// ---------- ducats ----------
let coins=[];
function addCoins(n,x,y){if(perks.has('tri-kese-dukata'))n=Math.ceil(n*1.25);for(let k=0;k<n;k++)coins.push({x:x+(Math.random()-.5)*16,y:y-10,vx:(Math.random()-.5)*300,vy:-260-Math.random()*260,t:0,w:10,h:8,grounded:false});}
function updateCoins(dt){for(const c of coins){c.t+=dt;const dx=p.x-c.x,dy=p.y-50-c.y,d=Math.hypot(dx,dy);if(c.t>.45&&d<150){c.x+=dx/d*Math.min(d,700*dt);c.y+=dy/d*Math.min(d,700*dt);}else if(!c.grounded){integrate(c,dt,world.platforms,world.runes);if(c.grounded){c.vx*=.4;if(Math.abs(c.vy)<1&&c.bounce!==1){c.bounce=1;c.vy=-120;c.grounded=false;}}else c.vx*=1-dt*1.5;}
  if(d<34&&c.t>.25){c.t=99;p.coins=(p.coins||0)+1;setBank(bank()+1);if(Math.random()<.5)sfx('coins',{gain:.35,rate:1.1+Math.random()*.3});}}coins=coins.filter(c=>c.t<40);}
function drawCoins(){const im=levelArt['predmet-dukat'];for(const c of coins){if(c.x<camera-30||c.x>camera+VIEW_W+30)continue;const s=Math.abs(Math.cos(time*6+c.x));if(im){ctx.drawImage(im,c.x-9*s,c.y-18,18*s+.5,18);}else{ellipse(c.x,c.y-9,7*s+.6,7,'#d9a53a');ellipse(c.x,c.y-10,4*s+.3,4,'#ffe08a');}halo(c.x,c.y-9,12,'rgba(255,210,120,.5)',.5);}}
// ---------- breakable crates, jars, barrels, baskets and chests ----------
const BREAK_ART={sanduk:['razbi-sanduk','prop-sanduci'],bure:['razbi-bure','prop-bure'],cup:['razbi-cup','prop-krcag'],korpa:['razbi-korpa'],kovceg:['razbi-kovceg'],kosnica:['razbi-kosnica'],plast:['razbi-plast'],tikve:['razbi-tikve'],stena:['razbi-stena-napukla'],panj:['razbi-panj'],crkva:['razbi-crkveni-sanduk'],barut:['razbi-bure-baruta'],tobolac:['razbi-tobolac'],santa:['razbi-santa'],vagon:['razbi-vagon']};
const crateArt=b=>(BREAK_ART[b.kind]||[]).map(id=>levelArt[id]).find(Boolean)||null;
let chunks=[];
function setupBreakables(){for(const b of world.breakables||[]){b.flash=0;b.hp0??=b.hp;if(b.solid){b.plat={x:b.x-b.w/2,y:b.y-b.h,w:b.w,h:b.h,kind:'crate',solid:true};world.platforms.push(b.plat);}}}
function hitCrate(b,power=1){if(b.broken||b.opened)return;b.hp-=power;b.flash=.12;b.shake=.18;dust(b.x,b.y-b.h/2,4,.8);
 if(b.kind==='kovceg'){openChest(b);return;}
 if(b.hp>0){sfx(b.kind==='cup'?'ring':'hit_heavy',{gain:.5,rate:b.kind==='cup'?1.9:1.4,x:b.x});return;}
 b.broken=true;if(b.plat){b.plat.off=true;world.platforms=world.platforms.filter(q=>q!==b.plat);}
 const wood=b.kind!=='cup';sfx(wood?'hit_heavy':'ring',{gain:.7,rate:wood?1.25:2.1,x:b.x});sfx('rock',{gain:wood?.5:.7,rate:wood?1.5:2.2,x:b.x});
 const im=crateArt(b);if(im&&hasDom){const bb=propBounds(im),cols=3,rows=3;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const sw=bb.w/cols,sh=bb.h/rows,k=b.h/bb.h;chunks.push({im,sx:bb.x+i*sw,sy:bb.y+j*sh,sw,sh,w:sw*k,h:sh*k,x:b.x-b.w/2+(i+.5)*sw*k,y:b.y-b.h+(j+.5)*sh*k,vx:(i-1)*120+(Math.random()-.5)*160+p.face*90,vy:-200-Math.random()*320+j*60,rot:0,vr:(Math.random()-.5)*14,t:0});}}
 else burst(b.x,b.y-b.h/2,wood?'#a07a4a':'#c98a5a',18,200,'dust');
 dust(b.x,b.y,10,1.4);dropLoot(b);if(b.kind==='barut')blowKeg(b);if(b.kind==='zid')wallFalls(b);}
function openChest(b){b.opened=true;b.hp=0;b.openT=0;sfx('gate',{gain:.6,x:b.x});sfx('coins',{gain:.9});burst(b.x,b.y-40,'#ffd27a',30,180);label('KOVČEG',b.x,b.y-70,'#ffe6a0');if(perks.has('kljuc-kule'))b.loot={...b.loot,coins:(b.loot.coins||0)*2};dropLoot(b);}
function dropLoot(b){const L=b.loot||{};if(L.coins)addCoins(L.coins,b.x,b.y-b.h/2);if(L.herb||L.wine)world.items.push({id:9000+b.id+(b.kind==='kovceg'?500:0),x:b.x,y:b.y-35,type:L.herb?'herb':'wine',taken:false});}
// any attack that is live this frame also smashes what stands in front of Marko
function strikeCrates(){if(!world.breakables)return;const active=attackActive(),range=p.attackKind==='super'?190:p.attackKind==='heavy'?135:110;
 for(const b of world.breakables){if(b.broken||b.opened)continue;if(Math.abs(b.y-p.y)>90)continue;const dx=b.x-p.x;
  if(active&&b.hitId!==p.attackId&&Math.abs(dx)<range+b.w/2&&dx*p.face>-20){b.hitId=p.attackId;if(b.kind==='zid'&&(p.attackKind==='light'||p.attackKind==='uvis'))wallClang(b);else hitCrate(b,p.attackKind==='light'?1:2);}
  else if(p.spin>0&&b.kind!=='zid'&&Math.abs(dx)<120&&b.spinT!==Math.floor(p.spin/.18)){b.spinT=Math.floor(p.spin/.18);hitCrate(b,1);}}}
function updateChunks(dt){for(const c of chunks){c.t+=dt;c.vy+=1500*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=c.vr*dt;const gy=groundAt(c.x,c.y-12);if(gy!==null&&c.y>gy-4&&c.vy>0){c.y=gy-4;c.vy*=-.3;c.vx*=.6;c.vr*=.5;}}chunks=chunks.filter(c=>c.t<2.4);for(const b of world.breakables||[]){b.flash=Math.max(0,b.flash-dt);b.shake=Math.max(0,(b.shake||0)-dt);if(b.opened)b.openT+=dt;}}
function drawBreakables(){for(const b of world.breakables||[]){if(b.broken||b.x<camera-90||b.x>camera+VIEW_W+90)continue;const wob=b.shake>0?Math.sin(b.shake*90)*3:0;if(b.kind==='zid'){drawCrackWall(b,wob);continue;}
  const art=b.kind==='kovceg'&&b.opened?(levelArt['razbi-kovceg-otvoren']||crateArt(b)):crateArt(b);
  shadow(b.x,b.y,b.w*.6,.45);
  if(art){const bb=propBounds(art),k=b.h/bb.h,w=bb.w*k;ctx.save();ctx.translate(b.x+wob,b.y);ctx.drawImage(art,bb.x,bb.y,bb.w,bb.h,-w/2,-b.h+4,w,b.h);if(b.flash>0){ctx.globalAlpha=b.flash*4;ctx.globalCompositeOperation='lighter';ctx.drawImage(art,bb.x,bb.y,bb.w,bb.h,-w/2,-b.h+4,w,b.h);}ctx.restore();}
  else drawCrateFallback(b,wob);
  if(b.kind==='kovceg'){if(!b.opened){halo(b.x,b.y-30,40,'rgba(255,215,120,.5)',.5+.2*Math.sin(time*3));if(Math.abs(p.x-b.x)<150&&Math.abs(p.y-b.y)<90)textLabel('J · OTVORI',b.x,b.y-b.h-14,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}else if(b.openT<1.5)halo(b.x,b.y-40,60,'rgba(255,215,120,.8)',1-b.openT/1.5);}}
 for(const c of chunks){ctx.save();ctx.globalAlpha=clamp((2.4-c.t)/.6,0,1);ctx.translate(c.x,c.y);ctx.rotate(c.rot);ctx.drawImage(c.im,c.sx,c.sy,c.sw,c.sh,-c.w/2,-c.h/2,c.w,c.h);ctx.restore();}}
function drawCrateFallback(b,wob){const x=b.x-b.w/2+wob,y=b.y-b.h,k=b.kind;
 if(k==='cup'){const g=ctx.createLinearGradient(x,0,x+b.w,0);g.addColorStop(0,'#7a3f22');g.addColorStop(.5,'#c0703e');g.addColorStop(1,'#6b3520');ellipse(b.x+wob,b.y-b.h*.42,b.w/2,b.h*.42,g);ctx.fillStyle='#8d4a28';ctx.fillRect(b.x+wob-b.w*.18,y,b.w*.36,b.h*.2);line(x+5,b.y-b.h*.45,x+b.w-5,b.y-b.h*.45,'#e8c48a',2);return;}
 if(k==='bure'){const g=ctx.createLinearGradient(x,0,x+b.w,0);g.addColorStop(0,'#4a2e18');g.addColorStop(.5,'#8a5a32');g.addColorStop(1,'#4a2e18');ctx.fillStyle=g;ctx.fillRect(x,y,b.w,b.h);for(const t of[.18,.5,.82])line(x,y+b.h*t,x+b.w,y+b.h*t,'#2c2c2c',4);return;}
 if(k==='korpa'){ctx.fillStyle='#a87a3a';ctx.fillRect(x,y+8,b.w,b.h-8);for(let i=0;i<5;i++)line(x,y+12+i*7,x+b.w,y+12+i*7,'#7a5428',1.5);for(const dx of[10,22,34,44])ellipse(x+dx,y+8,7,7,'#b8332a');return;}
 const g=ctx.createLinearGradient(0,y,0,y+b.h);g.addColorStop(0,k==='kovceg'?'#7a4a22':'#9a6e3e');g.addColorStop(1,k==='kovceg'?'#4a2a12':'#6a4824');ctx.fillStyle=g;ctx.fillRect(x,y,b.w,b.h);ctx.strokeStyle='#3a2614';ctx.lineWidth=3;ctx.strokeRect(x+1.5,y+1.5,b.w-3,b.h-3);
 if(k==='kovceg'){line(x,y+b.h*.35,x+b.w,y+b.h*.35,'#c9a24a',4);ellipse(b.x+wob,y+b.h*.5,5,6,'#e3c06a');}else{line(x,y,x+b.w,y+b.h,'#5a3c1e',3);line(x+b.w,y,x,y+b.h,'#5a3c1e',3);}}
// ---------- ladders: W/S climb, Space jumps off ----------
function ladderNear(){for(const l of world.ladders||[]){if(Math.abs(p.x-l.x)<24&&p.y>l.top+3&&p.y<=l.bottom+4)return l;}return null;}
function ladderBelow(){for(const l of world.ladders||[]){if(Math.abs(p.x-l.x-(l.side||0)*20)<34&&Math.abs(p.y-l.top)<6)return l;}return null;}
function climbInput(){if(horseMounted||p.down>0||p.ledgeT>0||p.attack>0||p.climb)return false;if(level&&p.grounded&&tap('KeyW','ArrowUp')&&vaultDoor())return true;
 if(isDown('KeyW','ArrowUp')){const l=ladderNear();if(l){startClimb(l);return true;}}
 if(p.grounded&&isDown('KeyS','ArrowDown')){const l=ladderBelow();if(l){startClimb(l);p.y=l.top+6;return true;}}
 // S + Space drops through a plank or the deck of a watchtower
 if(p.grounded&&p.on&&!p.on.solid&&p.on.kind!=='magic'&&(level||!isFloor(p.on))&&isDown('KeyS','ArrowDown')&&tap('Space')){p.drop=.35;p.dropFrom=p.on;p.grounded=false;p.y+=3;p.vy=80;p.crouching=false;p.crouch=0;p.h=112;sfx('cloth',{gain:.4});return true;}
 return false;}
function startClimb(l){p.climb=l;p.x=l.x;p.vx=0;p.vy=0;p.grounded=false;p.crouching=false;p.crouch=0;p.h=112;p.wall=0;sfx('cloth',{gain:.5});}
function updateClimb(dt){const l=p.climb;if(!l)return false;const dir=(isDown('KeyS','ArrowDown')?1:0)-(isDown('KeyW','ArrowUp')?1:0);
 if(tap('Space')){p.climb=null;p.vy=-430;const axis=(isDown('KeyD','ArrowRight')?1:0)-(isDown('KeyA','ArrowLeft')?1:0);p.vx=axis*230;if(axis)p.face=axis;sound('jump');return true;}
 p.y+=dir*200*dt;p.climbDist=(p.climbDist||0)+Math.abs(dir)*200*dt;p.vx=0;p.vy=0;
 if(dir&&Math.floor(p.climbDist/44)!==p.climbStep){p.climbStep=Math.floor(p.climbDist/44);sfx('cloth',{gain:.25,rate:1.2});}
 if(p.y<=l.top){p.y=l.top;p.x+=(l.side||0)*36;p.climb=null;p.grounded=true;p.vy=0;dust(p.x,p.y,3,.6);}
 else if(p.y>=l.bottom){p.y=l.bottom;p.climb=null;p.grounded=true;}
 return true;}
// ---------- terrain drawing: towers, hanging walls, steps, planks and watchtowers ----------
const WALL_OF={selo:'kamen',tvrdjava:'kamen',manastir:'kamen',rusevine:'kamen',klisura:'stena',prevoj:'stena',pecina:'stena',rudnik:'stena',suma:'drvo',mocvara:'drvo',reka:'drvo',oranje:'drvo',podrum:'cigla'};
const wallPats={};
function drawPlank(q){if(q.x+q.w<camera-60||q.x>camera+VIEW_W+60)return;const g=ctx.createLinearGradient(0,q.y,0,q.y+16);g.addColorStop(0,'#9a7246');g.addColorStop(1,'#5a3e22');ctx.fillStyle=g;ctx.fillRect(q.x,q.y,q.w,14);for(let x=q.x+20;x<q.x+q.w;x+=34)line(x,q.y+1,x,q.y+13,'rgba(40,26,12,.6)',2);line(q.x,q.y+1,q.x+q.w,q.y+1,'rgba(255,226,170,.45)',1.5);
 if(q.bridge){for(const x of[q.x+6,q.x+q.w-6]){line(x,q.y+10,x,q.y-46,'#4a3220',6);}ctx.strokeStyle='#c8a66a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x+6,q.y-42);ctx.quadraticCurveTo(q.x+q.w/2,q.y-10,q.x+q.w-6,q.y-42);ctx.stroke();}
 else{for(const x of[q.x+14,q.x+q.w-14]){line(x,q.y+14,x-10,q.y+40,'#4a3220',4);}}}
let towerArt=null;function towerInfoUnused(){if(towerArt!==null)return towerArt;const im=levelArt['kula-strazara'];if(!im)return null;const c=(worldCatalog||[]).find(e=>e.id==='kula-strazara');towerArt=c&&c.deckY?{im,deckY:c.deckY,x0:c.deckX0,x1:c.deckX1}:{im,deckY:im.height*.3,x0:im.width*.25,x1:im.width*.75};return towerArt;}
// ---------- the thrown mace (I): flies out, comes back to Marko's hand ----------
let thrown=null;
function throwMace(){if(!has('bacanje')){locked('bacanje');return;}if(!cdReady('throw')){cdDenied('throw');return;}if(thrown||p.throwT>0||p.attack>0||p.climb||horseMounted||p.down>0||p.drink>0||p.dash>0||p.ledgeT>0||p.blocking||p.spin>0)return;
 if(p.energy<15){toast('Za bacanje topuza treba 15 snage · obnavlja se sama',1.6);return;}p.energy-=15;p.throwT=.5;p.throwFired=false;cdStart('throw');sayGrunt(true);sfx('whoosh_heavy',{gain:.5});}
function updateThrow(dt){if(p.throwT>0){p.throwT=Math.max(0,p.throwT-dt);if(!p.throwFired&&p.throwT<.25){p.throwFired=true;thrown={x:p.x+p.face*36,y:p.y-80,vx:p.face*820,dir:p.face,back:false,t:0,rot:0,hit:new Set()};sfx('whoosh',{gain:.7});}}
 const m=thrown;if(!m)return;m.t+=dt;m.rot+=dt*22*m.dir;
 if(!m.back){m.vx-=m.dir*1500*dt;m.x+=m.vx*dt;if(m.vx*m.dir<=0||m.t>.9)turnBack(m);for(const q of world.platforms)if(q.solid&&!q.off&&m.x>q.x&&m.x<q.x+q.w&&m.y>q.y&&m.y<q.y+q.h){m.x-=m.vx*dt;turnBack(m);sfx('clang',{gain:.5,x:m.x});dust(m.x,m.y,5,.8);break;}}
 else{const tx=p.x,ty=p.y-70,dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy),v=Math.min(1050,380+m.t*600);if(d<38||m.t>3){thrown=null;sfx('leather',{gain:.6});label('✓',p.x,p.y-130,'#ffe6a8');return;}m.x+=dx/d*v*dt;m.y+=dy/d*v*dt;}
 const dmg=34*(p.power||1)*(perks.has('buzdovan')?1.25:1)*(p.buff>0?1.3:1);
 for(const e of world.enemies){if(!e.alive||e.zone!==zone||m.hit.has(e))continue;if(Math.abs(e.x-m.x)<40&&m.y>e.y-125&&m.y<e.y+10){m.hit.add(e);e.hp-=dmg;e.flash=.15;e.stun=Math.max(e.stun,.55);e.mode='stun';e.hurtT=.34;e.knock=m.dir*14;fx('hit',m.x,m.y,false);blood(e.x,e.y-66,Math.sign(m.vx||m.dir),12);sound('hit');label(Math.round(dmg),e.x,e.y-110);if(e.hp<=0)slay(e);}}
 if(zone===5&&boss.alive&&Math.abs(boss.x-m.x)<50&&!m.hit.has(boss)){m.hit.add(boss);if(MUSA_OPEN.includes(boss.mode)){boss.hp=Math.max(0,boss.hp-dmg);boss.flash=.12;bossAfterDamage();}else{sfx('clang',{gain:.6});turnBack(m);}}
 for(const b of world.breakables||[]){if(b.broken||b.opened||m.hit.has(b))continue;if(Math.abs(b.x-m.x)<b.w/2+16&&m.y>b.y-b.h-10&&m.y<b.y+4){m.hit.add(b);hitCrate(b,2);}}
 for(const pl of world.plowTeams||[]){if(pl.broken||m.hit.has(pl))continue;if(Math.abs(pl.x-m.x)<110&&m.y>pl.y-150){m.hit.add(pl);hitPlow(pl,dmg*.8);}}}
function turnBack(m){if(m.back)return;m.back=true;m.t=0;m.hit=new Set();}
function drawThrown(){const m=thrown;if(!m)return;const im=levelArt['predmet-topuz'];ctx.save();ctx.translate(m.x,m.y);ctx.rotate(m.rot);if(im){const bb=propBounds(im),k=74/bb.w;ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,-bb.w*k/2,-bb.h*k/2,bb.w*k,bb.h*k);}else{line(-30,0,14,0,'#5a3c22',6);ellipse(22,0,13,13,'#6d6a64');for(let a=0;a<8;a++)line(22+Math.cos(a*.785)*11,Math.sin(a*.785)*11,22+Math.cos(a*.785)*19,Math.sin(a*.785)*19,'#9b968a',3);}ctx.restore();for(let i=1;i<5;i++)halo(m.x-m.dir*i*14*(m.back?-1:1),m.y,14-i*2,'rgba(255,230,180,.35)',.4);}
// ---------- camera: in a pohod it follows Marko up towers and shafts ----------
let camFocus=590;
function levelCameraY(dt){if(p.grounded||p.climb||p.wall||p.ledgeT>0)camFocus+=(p.y-camFocus)*Math.min(1,dt*6);else if(p.y>camFocus+30||p.y<camFocus-240)camFocus+=(p.y-camFocus)*Math.min(1,dt*3);return Math.min(CAM_Y0+90,camFocus-532+60);}
// ---------- foes in a pohod walk, jump gaps and steps, climb ladders and shoot down from towers ----------
const FOE_JUMP=170;
function solidAhead(e,dir){let best=null;for(const q of world.platforms){if(!q.solid||q.off)continue;const face=dir>0?q.x:q.x+q.w,edge=e.x+dir*18;if(dir>0?(face<edge-2||face>edge+28):(face>edge+2||face<edge-28))continue;if(q.y>=e.y-STEP_UP||q.y+q.h<=e.y-60)continue;if(!best||q.y<best.y)best=q;}return best;}
function supportAt(x,y,below){let best=null;for(const q of world.platforms){if(q.off||(q.kind==='magic'&&!world.runes[q.rune]?.active))continue;if(x>q.x+4&&x<q.x+q.w-4&&q.y>=y-STEP_UP&&q.y<=y+below&&(!best||q.y<best.y))best=q;}return best;}
function landingAhead(e,dir){for(let dx=70;dx<=330;dx+=20){const x=e.x+dir*dx;for(const q of world.platforms){if(q.off||q.kind==='crate')continue;if(x>q.x+14&&x<q.x+q.w-14&&q.y>=e.y-FOE_JUMP+20&&q.y<=e.y+300&&!supportAt(e.x+dir*30,e.y,STEP_UP))return{x,q};}}return null;}
function foeJump(e,tx,ty){const up=e.y-ty,h=Math.max(0,up)+42,v=Math.sqrt(2*1750*h),t=v/1750+Math.sqrt(2*Math.max(1,h-up)/1750);e.vy=-v;e.vx=clamp((tx-e.x)/t,-430,430);e.air=true;e.grounded=false;e.jumpT=0;sfx('cloth',{gain:.4,x:e.x});dust(e.x,e.y,5,1);}
function foeWalk(e,dir,speed,dt){
 if(e.climb){const l=e.climb;e.y-=115*dt;e.x=l.x;e.vx=0;e.vy=0;e.climbDist=(e.climbDist||0)+115*dt;if(e.y<=l.top){e.y=l.top;e.x+=(l.side||0)*36;e.climb=null;e.grounded=true;}return;}
 if(!e.grounded)return;
 // Marko is above: a ladder close by, or a plank right overhead
 if(p.y<e.y-110&&!e.perch){const l=(world.ladders||[]).find(l=>Math.abs(l.bottom-e.y)<12&&l.top<e.y-90&&Math.abs(l.x-e.x)<320&&Math.abs(l.top-p.y)<140);
  if(l){if(Math.abs(l.x-e.x)<30){e.climb=l;e.x=l.x;e.vx=0;return;}dir=Math.sign(l.x-e.x);if(supportAt(e.x+dir*30,e.y,STEP_UP)){e.vx=dir*speed;return;}}
  else if(p.on&&!p.on.solid&&p.on.y>=e.y-FOE_JUMP&&Math.abs(p.x-e.x)<200){foeJump(e,clamp(p.x,p.on.x+20,p.on.x+p.on.w-20),p.on.y);return;}}
 const wall=solidAhead(e,dir);
 if(wall){const rise=e.y-wall.y;if(rise<=FOE_JUMP){foeJump(e,e.x+dir*80,wall.y);return;}e.vx=0;return;}
 if(!supportAt(e.x+dir*30,e.y,STEP_UP)){const below=supportAt(e.x+dir*40,e.y,560),land=landingAhead(e,dir);
  if(land&&(!below||land.q.y<below.y-40||p.y<e.y+40)){foeJump(e,land.x+dir*20,land.q.y);return;}
  if(below&&below.y-e.y<=300&&p.y>e.y-40){e.vx=dir*speed;return;}
  e.vx=0;return;}
 e.vx=dir*speed;}
function foeBody(e,dt){const x0=e.x;if(!e.climb){integrate(e,dt,world.platforms,world.runes);if(e.grounded){if(e.air){e.air=false;e.landT=.16;dust(e.x,e.y,6,1.1);sfx('land',{gain:.3,x:e.x});if(e.spiked)foeSlam(e);}}else e.jumpT=(e.jumpT||0)+dt;}
 e.landT=Math.max(0,(e.landT||0)-dt);const moved=Math.abs(e.x-x0);if(e.grounded&&moved>.2){e.walk=(e.walk||0)+moved;e.moveT=.12;}
 if(e.y>(world.pitY||900)){e.alive=false;kills++;say('tr_death',{chance:.6,x:e.x});toast('Turčin je pao u ponor',1.2);}}
function airPose(e){const n=e.type+'-jump',L=rig?.[e.type+'-launch'];if(L&&e.tossedT>0&&!e.climb){const last=L.frames.length-1;const f=e.grounded?last:e.spiked||e.vy>480?Math.min(4,last):e.vy< -480?0:e.vy< -140?1:e.vy<140?2:Math.min(3,last);return{name:e.type+'-launch',frame:f};}if(e.climb&&rig?.[e.type+'-climb'])return{name:e.type+'-climb',frame:Math.floor((e.climbDist||0)/24)%rig[e.type+'-climb'].frames.length};if(e.climb){const run=FOE_RUN[e.type]?.[0]||e.type+'-run';return{name:rig?.[run]?run:'cast/'+e.type,frame:Math.floor((e.climbDist||0)/30)%6,rot:-e.face*.05};}
 if(rig?.[n]){const f=e.landT>0?5:(e.jumpT||0)<.07?1:e.vy<-90?2:e.vy<90?3:4;return{name:n,frame:Math.min(rig[n].frames.length-1,f)};}
 const F=FOES[e.type],run=FOE_RUN[e.type]?.[0]||e.type+'-run',name=F?.anims.jump||(rig?.[run]?run:'cast/'+e.type);return{name,frame:F?.anims.jump?(e.vy<0?1:3):2,rot:-e.face*.08*Math.sign(e.vy)};}
// aimed arrows from towers (and from below)
function aimArrow(e,speed=440){const sx=e.x+e.face*28,sy=e.y-82,tx=p.x,ty=p.y-58,dx=tx-sx,dy=ty-sy,d=Math.hypot(dx,dy)||1;return{x:sx,y:sy,vx:dx/d*speed,vy:dy/d*speed};}
// ---------- the plowing level: janissaries plow the tsar's road with oxen ----------
function setupPlows(){world.plowTeams=(world.plows||[]).map((q,i)=>({id:i,x:q.x,y:q.y,hp:280,maxHp:280,broken:false,flash:0,walk:0,hitT:0,furrow:[],treasure:null,fleeT:0}));
 if(level.id==='oranje'){world.goals=world.plowTeams.map((pl,i)=>({id:i,kind:'plow',plow:pl,x:pl.x,y:pl.y,label:'Zaustavi turska rala',doneText:'Tovar blaga je tvoj.',done:false,t:9,h:120,off:'cilj-tovar-blaga'}));}}
function hitPlow(pl,amount){if(pl.broken)return;pl.hp-=amount;pl.flash=.15;sfx('hit_heavy',{gain:.7,rate:1.2,x:pl.x});dust(pl.x-30,pl.y,6,1);label(Math.round(amount),pl.x,pl.y-150);if(pl.hp<=0)breakPlow(pl);}
function breakPlow(pl){pl.broken=true;pl.fleeT=0;shake=settings.reduced?0:7;sfx('boom',{gain:.6,x:pl.x});sfx('rock',{gain:.8,rate:1.3,x:pl.x});burst(pl.x-60,pl.y-50,'#c8a070',30,240,'dust');toast('Ralo je slomljeno! Volovi beže, a orač poteže sablju.',3);
 const hp=90;world.enemies.push({id:8800+pl.id,x:pl.x-90,y:pl.y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type:'sword',zone,face:-1,mode:'idle',timer:.6,stun:0,flash:0,alive:true,home:pl.x,attackId:0,grounded:true});
 pl.treasure={x:pl.x-40,y:pl.y};world.items.push({id:8900+pl.id,x:pl.x-40,y:pl.y-30,type:'tovar',plow:pl,taken:false});}
function updatePlows(dt){for(const pl of world.plowTeams||[]){pl.flash=Math.max(0,pl.flash-dt);pl.hitT=Math.max(0,pl.hitT-dt);
 if(pl.broken){pl.fleeT+=dt;continue;}
 const d=p.x-pl.x;if(Math.abs(d)<1300){const nx=pl.x-38*dt;if(supportAt(nx-120,pl.y,STEP_UP)){pl.x=nx;pl.walk+=38*dt;if(!pl.furrow.length||pl.furrow[pl.furrow.length-1]-pl.x>26){pl.furrow.push(pl.x+70);if(pl.furrow.length>160)pl.furrow.shift();}}}
 // the team is a wall of oxen and timber: it shoves Marko back down the road; the oxen trample whoever stands in front
 if(Math.abs(p.y-pl.y)<80&&p.x>pl.x-150&&p.x<pl.x+170){if(p.x<pl.x+10)p.x=pl.x-150;else p.x=pl.x+170;}
 if(pl.hitT<=0&&d<-40&&d>-170&&Math.abs(p.y-pl.y)<70){pl.hitT=1.2;const hp=p.hp;damage(14,-1);if(p.hp<hp)p.vx-=260;sfx('hoof',{gain:.8,x:pl.x});}
 if(attackActive()&&pl.hitId!==p.attackId&&Math.abs(d)<170&&Math.abs(p.y-pl.y)<90&&(pl.x-p.x)*p.face>-30){pl.hitId=p.attackId;hitPlow(pl,(p.attackKind==='super'?160:p.attackKind==='light'?24:48)*(p.power||1));}}}
function drawPlows(){for(const pl of world.plowTeams||[]){if(pl.x<camera-400||pl.x>camera+VIEW_W+400)continue;
 for(const fx2 of pl.furrow){if(fx2<camera-40||fx2>camera+VIEW_W+40)continue;line(fx2-16,pl.y+2,fx2+16,pl.y+2,'rgba(50,32,18,.75)',4);line(fx2-14,pl.y,fx2+12,pl.y,'rgba(150,110,70,.5)',1.5);}
 if(pl.broken){const im=levelArt['plug-slomljen'];if(im){const bb=propBounds(im),k=80/bb.h;ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,pl.x-bb.w*k/2,pl.y-80+4,bb.w*k,80);}else{line(pl.x-50,pl.y-10,pl.x+30,pl.y-40,'#5a3c22',7);line(pl.x-20,pl.y,pl.x+10,pl.y-30,'#3e2a18',6);}
  const a=1-clamp(pl.fleeT/2.4,0,1);if(a>0){const ox=pl.x-80+pl.fleeT*260,st=levelArt['volovi-plug-static'];if(rig?.['volovi-beg'])rigDraw('volovi-beg',Math.floor(pl.fleeT*12)%8,ox,pl.y,1,{alpha:a});else if(st){const k=150/st.height,sx=390,bob=Math.abs(Math.sin(pl.fleeT*14))*4;ctx.save();ctx.globalAlpha=a;ctx.drawImage(st,sx,0,st.width-sx,st.height,ox-60,pl.y-150-bob+6,(st.width-sx)*k,150);ctx.restore();}else drawOxen(ox,pl.y,1,pl.fleeT*14,a);}continue;}
 shadow(pl.x,pl.y,120,.45);
 const st=levelArt['volovi-plug-static'];if(rig?.['volovi-plug'])rigDraw('volovi-plug',Math.floor(pl.walk/14)%8,pl.x,pl.y,-1,{flash:pl.flash>0?pl.flash/.15*.5:0});
 else if(st){const k=150/st.height,w=st.width*k,bob=Math.abs(Math.sin(pl.walk/9))*3;ctx.save();ctx.translate(pl.x+10,pl.y+6-bob);ctx.scale(-1,1);ctx.drawImage(st,-w/2,-150,w,150);if(pl.flash>0){ctx.globalAlpha=pl.flash*3;ctx.globalCompositeOperation='lighter';ctx.drawImage(st,-w/2,-150,w,150);}ctx.restore();if(Math.random()<.25)dust(pl.x+60,pl.y,1,.5);}
 else{drawOxen(pl.x-70,pl.y,-1,pl.walk/9,1);line(pl.x-20,pl.y-46,pl.x+70,pl.y-40,'#5a3c22',6);line(pl.x+70,pl.y-40,pl.x+92,pl.y+2,'#3e2a18',7);line(pl.x+86,pl.y-70,pl.x+70,pl.y-40,'#5a3c22',4);rigDraw('sword-idle',Math.floor(time*8)%6,pl.x+120,pl.y,-1,{flash:pl.flash>0?.5:0})||rigDraw('cast/sword',0,pl.x+120,pl.y,-1);}
 if(pl.hp<pl.maxHp){const bw=90,bx=pl.x-bw/2,by=pl.y-170;ctx.fillStyle='rgba(10,20,20,.8)';ctx.fillRect(bx-1,by-1,bw+2,6);ctx.fillStyle='#d98a4a';ctx.fillRect(bx,by,bw*Math.max(0,pl.hp/pl.maxHp),4);}
 if(Math.abs(p.x-pl.x)<500)textLabel('SLOMI RALO',pl.x,pl.y-186,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ff9a5a'});}}
function drawOxen(x,y,face,ph,alpha){ctx.save();ctx.globalAlpha=alpha;for(const [dx,c] of[[18,'#5a4632'],[0,'#7a624a']]){const bx=x+dx*face;ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(bx,y-58,58,26,0,0,Math.PI*2);ctx.fill();ellipse(bx+face*58,y-66,15,13,c);line(bx+face*64,y-78,bx+face*76,y-90,'#e8dcc0',3);for(const lx of[-40,-24,30,44]){const s=Math.sin(ph+lx)*8;line(bx+lx,y-40,bx+lx+s,y,c,7);}}ctx.restore();}
function drawTreasure(i){const im=levelArt['cilj-tovar-blaga'];const yy=i.y+30;if(im){const bb=propBounds(im),k=96/bb.h;ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,i.x-bb.w*k/2,yy-96+4,bb.w*k,96);}else{drawCrateFallback({x:i.x,y:yy,w:72,h:52,kind:'kovceg'},0);}halo(i.x,yy-40,60,'rgba(255,215,120,.6)',.6+.2*Math.sin(time*3));textLabel('TOVAR BLAGA',i.x,yy-112,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
// ---------- the treasury and the smith ----------
function openRiznica(){const have=ownedCuda(),s=smithLevels();
 $('cuda-grid').innerHTML=CUDA.map(c=>`<div class="cudo ${have.has(c.id)?'have':''}"><img src="assets/world/cudo-${c.id}.webp" alt="" onerror="this.style.visibility='hidden'"><b>${have.has(c.id)?c.name:'???'}</b><small>${have.has(c.id)?`„${c.song}” · ${c.perk}`:`Skriveno: ${c.land==='kacanik'?'pobedi Musu Kesedžiju':'pohod '+(LEVELS.find(L=>L.id===c.land)?.name||c.land)}`}</small></div>`).join('');
 {const hs=storedSet('marko-srca'),zs=storedSet('marko-zapisi'),nm=id=>LEVELS.find(L=>L.id===id)?.name||id;$('srca').textContent=`Delovi srca: ${hs.size}/${Object.keys(ZAPISI).length} · cela srca: ${Math.floor(hs.size/4)} (+${Math.floor(hs.size/4)*20} zdravlja u pohodima)`;$('zapisi').innerHTML=Object.entries(ZAPISI).map(([id,t])=>`<div class="${zs.has(id)?'have':''}"><b>${zs.has(id)?'Zapis · '+nm(id):'🔒 Zapis'}</b><small>${zs.has(id)?t:'Skriven u pohodu „'+nm(id)+'”'}</small></div>`).join('');}
 skillCache=null;const sk=ownedSkills();$('vestine').innerHTML=SKILLS.map(k=>`<div class="${sk.has(k.id)?'have':''}"><b>${sk.has(k.id)?k.name:'🔒 '+k.name}</b><small>${sk.has(k.id)?`<kbd>${k.key}</kbd> ${k.text}`:'Posle pohoda „'+(LEVELS.find(L=>L.id===k.land)?.name||k.land)+'”'}</small></div>`).join('');
 {const b=book(),n=Object.keys(FOE_BOOK).filter(t=>b[t]).length;$('dusmani').innerHTML=`<p>Dušmani koje je Marko sreo na drumu: snaga, slabost i broj savladanih.</p><button class="secondary" id="riznica-knjiga">Otvori knjigu dušmana · ${n}/${Object.keys(FOE_BOOK).length}</button>`;$('riznica-knjiga').onclick=()=>openBook();}
 $('kombinacije').innerHTML=[['J J J','Junački niz','treći udarac obara'],['J J K','Lomilac','razbija štit i oklop, odbacuje'],['S+K, Space','Aperkat i skok za njim','jak udarac odozdo diže Turčina u vazduh, Marko skače za njim'],['S+J','Šut nogom','obija štit u stranu, odguruje (i sa ivice)'],['S u trku','Klizanje','podseca neprijatelje'],['u skoku J J J','Žongliranje','drži ga gore; treći ga zakuca o zemlju'],['u skoku K','Tresak','iz vazduha u zemlju, udarni talas'],['skok, J J J','Vazdušni niz','držiš se u vazduhu dok udaraš'],['SHIFT → J','Juriš','kroz red neprijatelja'],['S+J u skoku','Udar nadole','odskok od kolja i neprijatelja'],['drži K','Pun zamah','tri stepena, ★ kad je pun']].map(([k,n,t])=>`<div><kbd>${k}</kbd><b>${n}</b><small>${t}</small></div>`).join('');
 $('purse').textContent=`Dukati: ${bank()}`;
 $('smith').innerHTML=SMITH.map(u=>{const lv=s[u.id]||0,cost=u.cost[lv];return`<button data-up="${u.id}" ${cost===undefined||bank()<cost?'disabled':''}><span>${u.name} · ${u.text}<small>${'■'.repeat(lv)}${'□'.repeat(u.cost.length-lv)}</small></span><b>${cost===undefined?'NAJBOLJE':cost+' ⛁'}</b></button>`;}).join('');
 $('smith').querySelectorAll?.('[data-up]').forEach(b=>b.onclick=()=>{const u=SMITH.find(u=>u.id===b.dataset.up),lv=s[u.id]||0,cost=u.cost[lv];if(cost===undefined||bank()<cost)return;setBank(bank()-cost);s[u.id]=lv+1;try{localStorage.setItem('marko-kovac',JSON.stringify(s));}catch{}sound('magic');openRiznica();});
 $('riznica').hidden=false;}
let bankCache=0;try{bankCache=Number(localStorage.getItem('marko-dukati')||0);}catch{}
function grantCudo(id){const have=ownedCuda();if(have.has(id))return;have.add(id);try{localStorage.setItem('marko-cuda',JSON.stringify([...have]));}catch{}const c=CUDA.find(c=>c.id===id);if(c)toast(`Novo čudo u riznici: ${c.name}`,4);}
function startWindup(e,F,d){if(e.type!=='archer')sfx('draw',{gain:.3,x:e.x});else sfx('cloth',{gain:.35,x:e.x});say('tr_attack',{chance:.12,x:e.x});e.mode='windup';e.timer=(F?.windup??(e.type==='archer'?1.05:.7))*D().wind;if(F)e.variant=F.pick(d);if(e.champion)e.timer*=e.hp<e.maxHp/2?.62:.85;else if(e.elite)e.timer*=.8;e.windupDuration=e.timer;}
// a pohod foe: archers on towers keep shooting, the rest close in by walking, jumping and climbing
function levelFoe(e,F,dx,d,dt){const dy=p.y-e.y,ranged=e.type==='archer'||e.type==='tufekdzija',reach=(F?.reach??(ranged?480:84))*(e.champion?1.3:1),speed=F?.speed??(e.type==='shield'?65:95);
 if(e.perch){if(d<820&&Math.abs(dy)<600&&e.timer<=0)startWindup(e,F,d);return false;}
 if(d>760&&!e.alert)return false;e.alert=d<760;
 if(ranged?(d<=reach&&Math.abs(dy)<320):(d<=reach&&Math.abs(dy)<80)){if(e.timer<=0&&!e.climb&&e.grounded)startWindup(e,F,d);return false;}
 foeWalk(e,dx>0?1:-1,speed,dt);return false;}
// hands find the top of a wall, a cliff, a tower or a plank: grab it and climb up
function ledgeCheckLevel(){if(p.ledgeCool>0)return;if(p.ledgeT>0||horseMounted||p.plunge||p.vy< -150||p.attack>0||p.down>0||p.climb)return;const hands=p.y-112;
 for(const q of world.platforms){if(q.off||q.kind==='crate'||q.kind==='step'||q.kind==='magic')continue;if(Math.abs(hands-q.y)>28||p.y<q.y+24)continue;
  const left=p.face>0&&p.x+17>q.x-12&&p.x+17<q.x+20,right=p.face<0&&p.x-17<q.x+q.w+12&&p.x-17>q.x+q.w-20;if(!left&&!right)continue;
  const edge=left?q.x:q.x+q.w;if(blockedAt(edge+(left?14:-14),q.y-40)||blockedAt(edge-(left?14:-14),q.y+8,q))continue;
  p.ledge={x0:edge-p.face*18,y0:q.y+112,x1:edge+p.face*24,y1:q.y};p.ledgeT=LEDGE_TIME;p.vx=0;p.vy=0;p.wall=0;sfx('cloth',{gain:.6});p.hang=true;sayGrunt(false);return;}}
function blockedAt(x,y,skip){return world.platforms.some(q=>q!==skip&&q.solid&&!q.off&&x>q.x&&x<q.x+q.w&&y>q.y&&y<q.y+q.h);}
// pressing into a tall wall while in the air: slide down it; Space jumps off to the other side
function wallCheckLevel(){p.wall=0;if(!has('zid'))return;if(horseMounted||p.ledgeT>0||p.plunge||p.down>0||p.climb)return;const axis=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);if(!axis||(p.wallJumpT>.08&&axis===p.wallSide))return;
 for(const q of world.platforms){if(!q.solid||q.off||q.kind==='crate'||q.kind==='step'||q.pillar||q.h<100)continue;if(p.y<q.y+50||p.y-90>q.y+q.h)continue;const side=axis>0?q.x:q.x+q.w,edge=p.x+axis*17;
  if(Math.abs(edge-side)<12&&(axis>0?p.x<q.x:p.x>q.x+q.w)){p.x=side-axis*17;p.wall=axis;p.face=axis;if(p.vy>120)p.vy=120;if(Math.random()<.1)dust(side,p.y-30,1,.4);break;}}}
function climbPose(){if(rig?.['marko-climb'])return{name:'marko-climb',frame:Math.floor((p.climbDist||0)/22)%rig['marko-climb'].frames.length};const k=Math.floor((p.climbDist||0)/26)%2;return{name:'marko-jump',frame:3,faceAs:k?1:-1,sy:1+(k?.02:-.02)};}
function throwPose(){const t=1-p.throwT/.5;if(rig?.['marko-throw'])return{name:'marko-throw',frame:Math.min(rig['marko-throw'].frames.length-1,Math.floor(t*rig['marko-throw'].frames.length))};return{name:'marko-attack',frame:Math.min(5,Math.floor(t*6))};}
function drawArrow(a){if(a.bullet){const ang=Math.atan2(a.vy,a.vx);line(a.x-Math.cos(ang)*26,a.y-Math.sin(ang)*26,a.x,a.y,'rgba(255,230,170,.9)',2.5,gctx);ellipse(a.x,a.y,2.5,2.5,'#2a2a2a');return;}const ang=Math.atan2(a.vy||0,a.vx);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(ang);line(-30,0,0,0,'#c9a46a',2.5);poly([[4,0],[-6,-4],[-6,4]],'#e7e3cd');poly([[-30,0],[-38,-5],[-34,0]],'#d9d2c0');poly([[-30,0],[-38,5],[-34,0]],'#b9b2a0');ctx.restore();if(!a.enemy)line(a.x-Math.cos(ang)*40,a.y-Math.sin(ang)*40,a.x,a.y,'rgba(200,255,232,.9)',3,gctx);}
function drawCudo(i){const yy=i.y+Math.sin(time*2.4+i.id)*5,im=levelArt['cudo-'+i.cudo],have=ownedCuda().has(i.cudo);halo(i.x,yy,56,'rgba(255,220,130,.6)',(have?.4:.85)+.15*Math.sin(time*4));
 if(im){const bb=propBounds(im),k=58/Math.max(bb.w,bb.h);ctx.save();ctx.globalAlpha=have?.55:1;ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,i.x-bb.w*k/2,yy-bb.h*k/2,bb.w*k,bb.h*k);ctx.restore();}
 else{poly([[i.x,yy-22],[i.x+18,yy],[i.x,yy+22],[i.x-18,yy]],'#edd696','#fff4bb');poly([[i.x,yy-12],[i.x+9,yy],[i.x,yy+12],[i.x-9,yy]],'#b88c3c');}
 for(let s=0;s<3;s++){const a=time*2+s*2.1;textLabel('✦',i.x+Math.cos(a)*34,yy+Math.sin(a)*14,{font:'12px Georgia',color:'#fff3c0',glow:'#ffd27a'});}
 if(Math.abs(p.x-i.x)<420)textLabel(have?'ČUDO (već u riznici)':'ČUDO IZ PESME',i.x,yy-44,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});emitters.push({id:'cudo'+i.id,kind:'item',x:i.x,y:yy,rate:10});}
// ---------- new foes once their drawings arrive: spearman, war hound, musketeer ----------
FOES.kopljanik={reach:150,speed:85,windup:.62,recover:.9,anims:{main:'kopljanik-attack'},pick:()=>'thrust'};
FOES.pas={reach:190,speed:215,windup:.32,recover:.7,anims:{main:'pas-attack'},pick:()=>'bite'};
FOES.tufekdzija={reach:640,speed:70,windup:1.25,recover:1.5,anims:{main:'tufekdzija-shoot'},pick:()=>'shot'};
Object.assign(FOE_RUN,{kopljanik:['kopljanik-run',100],pas:['pas-run',120],tufekdzija:['tufekdzija-run',95]});
const baseFoeAttack=foeAttack;
foeAttack=function(e,F){const d=Math.abs(p.x-e.x);
 if(e.type==='kopljanik'){e.lunge={v:e.face*240,t:.18,total:.18,hop:0};e.pendingHit={t:.2,dmg:16,range:175};sfx('whoosh',{gain:.6,x:e.x});return;}
 if(e.type==='pas'){e.lunge={v:e.face*Math.min(520,(d-30)/.3),t:.3,total:.3,hop:60};e.pendingHit={t:.26,dmg:9,range:85};sfx('leather',{gain:.6,x:e.x});return;}
 if(e.type==='tufekdzija'){const a=aimArrow(e,1300);arrows.push({...a,life:1.2,enemy:true,bullet:true});sfx('boom',{gain:.75,rate:1.5,x:e.x});for(let i=0;i<14;i++)particles.push({x:e.x+e.face*60,y:e.y-88,vx:e.face*(40+Math.random()*90),vy:-20-Math.random()*40,r:5+Math.random()*7,life:1.4,max:1.4,kind:'dust',color:'#d8d2c4'});fx('burst',e.x+e.face*60,e.y-88,'#ffcf7a',10,160);return;}
 return baseFoeAttack(e,F);};
$('riznica-open')&&($('riznica-open').onclick=openRiznica);$('riznica-close')&&($('riznica-close').onclick=()=>$('riznica').hidden=true);
function wallKind(){return WALL_OF[level?.id]||'kamen';}
function wallPattern(dark=false){const id='zid-'+wallKind(),key=id+(dark?'#d':'');if(key in wallPats)return wallPats[key];const im=levelArt[id];if(!im||!hasDom)return null;
 let src=im;if(dark){src=makeCanvas(im.width,im.height);const g=src.getContext('2d');g.drawImage(im,0,0);g.fillStyle='rgba(12,14,18,.62)';g.fillRect(0,0,im.width,im.height);}return wallPats[key]=ctx.createPattern(src,'repeat');}
const WALL_SCALE=.44;
function fillWall(x,y,w,h,dark=false){const P=wallPattern(dark);if(P){P.setTransform(new DOMMatrix([WALL_SCALE,0,0,WALL_SCALE,0,0]));ctx.fillStyle=P;}else ctx.fillStyle=dark?'#2c2a26':'#8a7a62';ctx.fillRect(x,y,w,h);}
// light comes from the upper left: a lit top, a shaded right side, darkness near the ground
function shadeBlock(x,y,w,h,ground){const v=ctx.createLinearGradient(0,y,0,y+h);v.addColorStop(0,'rgba(255,238,200,.16)');v.addColorStop(.18,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,10,14,.5)');ctx.fillStyle=v;ctx.fillRect(x,y,w,h);
 const s=ctx.createLinearGradient(x,0,x+w,0);s.addColorStop(0,'rgba(255,230,190,.10)');s.addColorStop(.25,'rgba(0,0,0,0)');s.addColorStop(.8,'rgba(0,0,0,.12)');s.addColorStop(1,'rgba(0,0,0,.42)');ctx.fillStyle=s;ctx.fillRect(x,y,w,h);
 line(x+1,y,x+1,y+h,'rgba(20,16,12,.7)',2);line(x+w-1,y,x+w-1,y+h,'rgba(20,16,12,.85)',2);
 if(ground!==undefined){const g=ctx.createLinearGradient(0,ground-60,0,ground+4);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,8,6,.55)');ctx.fillStyle=g;ctx.fillRect(x,ground-60,w,64);}}
// the top of a tower: the land's own ground (grass, snow, moss) or a crenellated stone parapet
function drawTop(x,y,w){const k=wallKind();
 if(k==='kamen'||k==='cigla'){fillWall(x-6,y-2,w+12,12);ctx.fillStyle='rgba(255,236,196,.28)';ctx.fillRect(x-6,y-2,w+12,3);line(x-6,y+10,x+w+6,y+10,'rgba(20,16,12,.6)',2);
  for(const mx of[x-6,x+w-16]){fillWall(mx,y-20,22,20);ctx.fillStyle='rgba(255,236,196,.22)';ctx.fillRect(mx,y-20,22,3);line(mx,y-20,mx,y,'rgba(20,16,12,.6)',2);line(mx+22,y-20,mx+22,y,'rgba(20,16,12,.7)',2);}return;}
 if(k==='drvo'){for(let px=x;px<x+w;px+=13){const tip=y-8-((px*7)%5);poly([[px,y+2],[px+6.5,tip],[px+13,y+2]],'#8a6238','#3e2a16');}line(x,y+3,x+w,y+3,'#5a3c20',4);return;}
 const G=levelGround();if(G){const S=G.S,rows=G.walk+30;ctx.save();ctx.beginPath();ctx.rect(x-3,y-G.walk*S,w+6,rows*S);ctx.clip();G.pattern.setTransform(new DOMMatrix([S,0,0,S,0,y-G.walk*S]));ctx.fillStyle=G.pattern;ctx.fillRect(x-3,y-G.walk*S,w+6,rows*S);ctx.restore();}}
// grass and earth in front of a tower's foot, so it stands in the ground instead of on it
function plantFoot(x,w,gy){const G=levelGround();if(!G)return;const S=G.S;ctx.save();ctx.beginPath();ctx.rect(x-4,gy-G.walk*S,w+8,(G.walk+16)*S);ctx.clip();G.pattern.setTransform(new DOMMatrix([S,0,0,S,0,gy-G.walk*S]));ctx.fillStyle=G.pattern;ctx.fillRect(x-4,gy-G.walk*S,w+8,(G.walk+16)*S);ctx.restore();}
function groundBelow(x,y){let best=null;for(const q of world.platforms)if(q.ground&&!q.tower&&x>q.x&&x<q.x+q.w&&q.y>=y-2&&(best===null||q.y<best))best=q.y;return best??y+300;}
function drawBlock(q){if(q.x+q.w<camera-120||q.x>camera+VIEW_W+120||q.y>camY+VIEW_H+80||q.y+q.h<camY-80)return;
 if(q.kind==='step')return;
 const gy=q.hang?groundBelow(q.x+q.w/2,q.y+q.h):Math.min(q.y+q.h,groundBelow(q.x+q.w/2,q.y+4)),bottom=q.hang?gy:Math.min(q.y+q.h,camY+VIEW_H+60);
 if(q.pillar){fillWall(q.x,q.y,q.w,gy-q.y+4);shadeBlock(q.x,q.y,q.w,gy-q.y+4,gy);drawTop(q.x,q.y,q.w);plantFoot(q.x,q.w,gy);return;}
 if(q.hang){// a wall with an archway through it: the road passes under the arch
  fillWall(q.x,q.y,q.w,gy-q.y);const ay=q.y+q.h,r=Math.min(q.w/2-8,60),ax0=q.x+8,ax1=q.x+q.w-8;
  ctx.save();ctx.beginPath();ctx.moveTo(ax0,gy+2);ctx.lineTo(ax0,ay);ctx.quadraticCurveTo(ax0,ay-r*.9,(ax0+ax1)/2,ay-r*.9);ctx.quadraticCurveTo(ax1,ay-r*.9,ax1,ay);ctx.lineTo(ax1,gy+2);ctx.closePath();ctx.clip();
  fillWall(ax0,ay-r,ax1-ax0,gy-ay+r+4,true);const d=ctx.createLinearGradient(0,ay-r,0,gy);d.addColorStop(0,'rgba(4,6,8,.75)');d.addColorStop(1,'rgba(4,6,8,.35)');ctx.fillStyle=d;ctx.fillRect(ax0,ay-r,ax1-ax0,gy-ay+r+4);ctx.restore();
  ctx.strokeStyle='rgba(255,236,196,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ax0,gy);ctx.lineTo(ax0,ay);ctx.quadraticCurveTo(ax0,ay-r*.9,(ax0+ax1)/2,ay-r*.9);ctx.quadraticCurveTo(ax1,ay-r*.9,ax1,ay);ctx.lineTo(ax1,gy);ctx.stroke();
  shadeBlock(q.x,q.y,q.w,gy-q.y,gy);drawTop(q.x,q.y,q.w);plantFoot(q.x,q.w,gy);return;}
 const foot=Math.min(bottom,gy+4);fillWall(q.x,q.y,q.w,foot-q.y);shadeBlock(q.x,q.y,q.w,foot-q.y,gy);drawTop(q.x,q.y,q.w);
 // arrow slits on stone towers
 if(wallKind()==='kamen'&&q.tower&&gy-q.y>160){for(const fy of[q.y+60,q.y+(gy-q.y)*.55]){ctx.fillStyle='rgba(8,8,10,.85)';ctx.fillRect(q.x+q.w/2-4,fy,8,30);ctx.fillStyle='rgba(255,236,196,.3)';ctx.fillRect(q.x+q.w/2-6,fy+30,12,3);}}
 plantFoot(q.x,q.w,gy);}
// a shaft between two walls reads as the inside of a ruined tower: a dark back wall fills the gap
function drawShafts(){const hang=world.platforms.filter(q=>q.hang);for(const a of hang){const b=world.platforms.find(o=>o!==a&&o.solid&&(o.hang||o.tower)&&o.x>a.x+a.w&&o.x-(a.x+a.w)<200);if(!b||a.x>camera+VIEW_W+100||b.x+b.w<camera-100)continue;
 const x0=a.x+a.w,x1=b.x,top=Math.max(a.y,b.y)+30,gy=groundBelow((x0+x1)/2,Math.max(a.y+a.h,b.y)-10);fillWall(x0,top,x1-x0,gy-top,true);const g=ctx.createLinearGradient(x0,0,x1,0);g.addColorStop(0,'rgba(0,0,0,.45)');g.addColorStop(.5,'rgba(0,0,0,.1)');g.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=g;ctx.fillRect(x0,top,x1-x0,gy-top);
 // a broken top edge and a beam across: it was a tower once
 for(let x=x0;x<x1;x+=16)poly([[x,top+2],[x+8,top-10-((x*13)%9)],[x+16,top+2]],'rgba(30,28,26,.85)');line(x0,top+70,x1,top+64,'#4a3420',7);line(x0,top+67,x1,top+61,'#8a6238',2);}}
// stairs: stone (or plank) treads with dark risers, one continuous texture
function drawStairs(){const steps=world.platforms.filter(q=>q.kind==='step'&&q.x<camera+VIEW_W+100&&q.x+q.w>camera-100);if(!steps.length)return;
 const wood=wallKind()==='drvo';
 for(const q of steps){const gy=groundBelow(q.x+q.w/2,q.y+2)+6;fillWall(q.x,q.y,q.w,gy-q.y);const v=ctx.createLinearGradient(0,q.y,0,gy);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(10,8,8,.5)');ctx.fillStyle=v;ctx.fillRect(q.x,q.y,q.w,gy-q.y);plantFoot(q.x,q.w,gy-6);}
 for(const q of steps){// the tread: a slab with a lit nose and a shadow under it
  const slab=wood?'#9a6e3e':'#d9c8a2',edge=wood?'#5a3c1e':'#7a6a52';ctx.fillStyle=slab;ctx.fillRect(q.x-3,q.y-2,q.w+3,8);ctx.fillStyle='rgba(255,246,220,.45)';ctx.fillRect(q.x-3,q.y-2,q.w+3,2);line(q.x-3,q.y+6,q.x+q.w,q.y+6,edge,2);
  const sh=ctx.createLinearGradient(0,q.y+6,0,q.y+20);sh.addColorStop(0,'rgba(0,0,0,.35)');sh.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sh;ctx.fillRect(q.x,q.y+6,q.w,14);
  line(q.x,q.y+6,q.x,q.y+40,'rgba(10,8,6,.55)',3);}}
function drawLadders(){for(const l of world.ladders||[]){if(l.x<camera-80||l.x>camera+VIEW_W+80)continue;const y0=l.top-40,y1=l.bottom+4,hw=22;
 // sturdy wooden ladder: dark outline, warm wood, a lit edge, rungs lashed with rope
 for(let y=y1-16;y>y0+10;y-=28){line(l.x-hw,y,l.x+hw,y,'#24170b',8);line(l.x-hw,y,l.x+hw,y,'#8a5e30',4.5);line(l.x-hw,y-1.5,l.x+hw,y-1.5,'#d8a86a',1.2);}
 for(const sx of[-1,1]){const x=l.x+sx*hw;line(x,y0,x,y1,'#24170b',10);const g=ctx.createLinearGradient(x-4,0,x+4,0);g.addColorStop(0,'#c08850');g.addColorStop(.5,'#9a6a36');g.addColorStop(1,'#6a4422');ctx.fillStyle=g;ctx.fillRect(x-3.5,y0,7,y1-y0);line(x-2,y0,x-2,y1,'rgba(255,220,160,.5)',1.2);poly([[x-4,y0],[x,y0-7],[x+4,y0]],'#9a6a36','#24170b');
  for(let y=y1-16;y>y0+10;y-=28){ctx.fillStyle='#d9c08a';ctx.fillRect(x-4.5,y-4,9,3);ctx.fillRect(x-4.5,y+1,9,2);}}
 if(!p.climb&&Math.abs(p.x-l.x)<80&&Math.abs(p.y-l.bottom)<10)textLabel('W · PENJI SE',l.x,l.bottom-140,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}}
// the artist's watchtower: its flat front floor is the deck Marko and the archer stand on
const TOWER_DECK={y:341,x0:270,x1:684,base:1023};
function setupTowers(){for(const t of world.towers||[]){const deck=world.platforms.find(q=>q.kind==='deck'&&Math.abs(q.y-t.top)<2&&Math.abs(q.x+q.w/2-t.x)<4);t.k=(t.base+6-t.top)/(TOWER_DECK.base-TOWER_DECK.y);
 if(levelArt['kula-strazara']&&deck){deck.x=t.x-((TOWER_DECK.x1-TOWER_DECK.x0)/2)*t.k;deck.w=(TOWER_DECK.x1-TOWER_DECK.x0)*t.k;deck.art=true;const l=(world.ladders||[]).find(l=>l.top===t.top&&Math.abs(l.x-t.x)<120);if(l)l.x=Math.round(deck.x+14);}}}
function drawWatchtowers(){const im=levelArt['kula-strazara'];for(const t of world.towers||[]){if(t.x<camera-260||t.x>camera+VIEW_W+260)continue;
 if(im&&t.k){const k=t.k,cx=(TOWER_DECK.x0+TOWER_DECK.x1)/2;shadow(t.x,t.base,150*k*3,.35);ctx.drawImage(im,t.x-cx*k,t.top-TOWER_DECK.y*k,im.width*k,im.height*k);continue;}
 const H=t.base-t.top;for(const dx of[-78,78])line(t.x+dx,t.top,t.x+dx*1.12,t.base+4,'#3e2b18',9);for(const dx of[-40,40])line(t.x+dx,t.top,t.x+dx*1.05,t.base+4,'#2e2012',6);
 for(let y=t.top+40;y<t.base-20;y+=H/3){line(t.x-80,y,t.x+80,y+H/3-14,'#4a3420',4);line(t.x+80,y,t.x-80,y+H/3-14,'#4a3420',4);}
 ctx.fillStyle='#6e4c2a';ctx.fillRect(t.x-90,t.top,180,16);line(t.x-90,t.top+1,t.x+90,t.top+1,'#c9a06a',2);}}
function drawTerrain(){const plats=world.platforms;
 plats.filter(q=>q.ground&&!q.tower).sort((a,b)=>b.y-a.y).forEach(drawFloor);
 drawShafts();drawWatchtowers();
 for(const q of plats){if(q.kind!=='step'&&q.solid&&q.kind==='stone'&&!q.vault&&(!q.ground||q.tower))drawBlock(q);}
 drawStairs();
 for(const q of plats)if(q.kind==='plank')drawPlank(q);}

// props are painted scenery: one that would cover a tower, a ladder, stairs or a shaft is left out
function clearProps(){if(!level?.props||!world.busy)return;level.props=level.props.filter(pr=>{if(pr.id.startsWith('prop-barjak'))return true;const im=levelArt[pr.id];if(!im||!hasDom)return true;const b=propBounds(im),w=b.w*pr.height/b.h;if(world.busy.some(([a,c])=>pr.x+w/2>a&&pr.x-w/2<c))return false;const q=world.platforms.find(o=>o.ground&&Math.abs(o.y-pr.y)<2&&pr.x>=o.x&&pr.x<=o.x+o.w);return!!q&&pr.x-w/2>=q.x-10&&pr.x+w/2<=q.x+q.w+10&&clearAbove(pr.x-w/2,pr.x+w/2,pr.height,q)&&!(world.traps||[]).some(t=>{const tx=t.x??t.gate?.x??t.lever?.x??0;return tx+(t.w||0)>pr.x-w/2-60&&tx<pr.x+w/2+60;});});}

// ================= pack 05: a journey that grows — skills, letters, enchanted maces, traps, chases, champions =================
// ---------- skills: each finished pohod teaches Marko something new (the Kačanik story has them all) ----------
const SKILLS=[
 {id:'niz',land:'selo',name:'Junački niz',key:'J J J',text:'Tri udarca zaredom; treći obara protivnika.'},
 {id:'zid',land:'klisura',name:'Odskok od zida',key:'skok + zid + SPACE',text:'Uhvati se za zid u skoku i odbij se ka drugom. Vrati se po čuda iz dimnjaka!'},
 {id:'bacanje',land:'suma',name:'Bačeni topuz',key:'I',text:'Topuz leti napred, obara i vraća se u ruku.'},
 {id:'kontra',land:'manastir',name:'Savršeno odbijanje',key:'L u pravom trenutku',text:'Odbij udarac tačno kad stigne i uzvrati kontrom.'},
 {id:'zamah',land:'tvrdjava',name:'Pun zamah',key:'drži K',text:'Teški udarac se puni dok držiš K i razbija oklop.'},
 {id:'nadole',land:'prevoj',name:'Udar nadole',key:'u skoku S + J',text:'Topuz pada u zemlju i razbacuje sve oko Marka.'},
 {id:'kolut',land:'pecina',name:'Kolut',key:'SHIFT',text:'Prokotrljaj se kroz napad, strelu i oganj.'},
 {id:'vihor',land:'podrum',name:'Vihor',key:'drži F',text:'Topuz se vrti oko Marka dok traje bes.'},
 {id:'uzlet',land:'mocvara',name:'Vilinski uzlet',key:'u skoku E',text:'Ravijojla te u vazduhu podigne još jednom.'},
 {id:'tresak',land:'rudnik',name:'Tresak',key:'u skoku K',text:'Zakucaj Turčina iz vazduha o zemlju — udarni talas obara one oko njega.'},
 {id:'juris',land:'rusevine',name:'Juriš',key:'SHIFT pa J',text:'Iz koluta jurni napred kroz red neprijatelja.'},
 {id:'junacki',land:'reka',name:'Junački udar',key:'R kad je bes pun',text:'Udar od kog se tlo trese.'},
];
let skillCache=null;
function ownedSkills(){if(skillCache)return skillCache;try{skillCache=new Set(JSON.parse(localStorage.getItem('marko-skills')||'[]'));}catch{skillCache=new Set();}return skillCache;}
function has(id){return !level||ownedSkills().has(id);}
function grantSkill(id){const s=ownedSkills();if(s.has(id))return null;s.add(id);try{localStorage.setItem('marko-skills',JSON.stringify([...s]));}catch{}return SKILLS.find(k=>k.id===id);}
let lockedT=0;function locked(id){if(lockedT>0)return;lockedT=2.5;const k=SKILLS.find(k=>k.id===id);const L=k&&LEVELS.find(L=>L.id===k.land);toast(`${k?.name||'Veština'} se otključava posle pohoda „${L?.name||'—'}”.`,2.4);}
// ---------- the letters М-А-Р-К-О (like HERCULES): find all five in a pohod ----------
const SLOVA='МАРКО';
function collectLetter(i){p.letters=(p.letters||0)|(1<<i.i);sfx('ring',{gain:.8,rate:1+i.i*.12});burst(i.x,i.y,'#ffe39a',26,170);label(SLOVA[i.i],i.x,i.y-30,'#ffe6a0');
 if(p.letters===31){p.hp=p.maxHp;addCoins(40,p.x,p.y-80);fx('pillar',p.x,p.y);sfx('magic_big',{gain:1});shake=settings.reduced?0:5;toast('М · А · Р · К · О — sva slova! Puno zdravlje i 40 dukata.',3.6);say('relic',{priority:3});
  try{const d=new Set(JSON.parse(localStorage.getItem('marko-slova')||'[]'));d.add(level.id);localStorage.setItem('marko-slova',JSON.stringify([...d]));}catch{}}}
function drawLetter(i){const yy=i.y+Math.sin(time*3+i.i)*5,ch=SLOVA[i.i];halo(i.x,yy,34,'rgba(255,215,120,.55)',.7+.2*Math.sin(time*4+i.i));const art=levelArt['predmet-slovo-'+['m','a','r','k','o'][i.i]];if(art){const b=propBounds(art),k=50/Math.max(b.w,b.h);ctx.drawImage(art,b.x,b.y,b.w,b.h,i.x-b.w*k/2,yy-b.h*k/2,b.w*k,b.h*k);emitters.push({id:'slovo'+i.id,kind:'item',x:i.x,y:yy,rate:6});return;}
 ellipse(i.x,yy,19,19,'#7a5214');ellipse(i.x,yy,16,16,'#e7bd5a');ellipse(i.x,yy,13,13,'#b8862e');textLabel(ch,i.x,yy+7,{font:'bold 19px Georgia',color:'#fff3c8',glow:'#ffcf6a'});emitters.push({id:'slovo'+i.id,kind:'item',x:i.x,y:yy,rate:6});}
function lettersHud(){const el=$('slova');if(!el)return;if(!level){el.hidden=true;return;}el.hidden=false;const m=p.letters||0,key=String(m);if(el.dataset?.m===key)return;if(el.dataset)el.dataset.m=key;el.innerHTML=[...SLOVA].map((c,i)=>`<i class="${m&(1<<i)?'on':''}">${c}</i>`).join('');}
// ---------- enchanted maces (like Hercules' swords): fire, thunder, the fairy's light ----------
function takePower(i){const P=POWERS[i.power];p.pow={id:i.power,t:22};sfx('magic_big',{gain:.9});burst(i.x,i.y,P.color,40,220);fx('pillar',p.x,p.y);toast(`${P.name} · 22 sekunde`,2.6);say('relic',{priority:2});}
function drawPowerOrb(i){const P=POWERS[i.power],yy=i.y+Math.sin(time*2.5+i.id)*6;halo(i.x,yy,48,P.color,.75);const art=levelArt['predmet-moc-'+i.power];if(art){const b=propBounds(art),k=48/Math.max(b.w,b.h);ctx.drawImage(art,b.x,b.y,b.w,b.h,i.x-b.w*k/2,yy-b.h*k/2,b.w*k,b.h*k);textLabel(P.name.toUpperCase(),i.x,yy-36,{font:'bold 11px Georgia',color:'#fff0c8',glow:P.color});emitters.push({id:'moc'+i.id,kind:'item',x:i.x,y:yy,rate:14});return;}ellipse(i.x,yy,15,15,P.color);ellipse(i.x-4,yy-4,5,5,'#ffffff');
 for(let s=0;s<4;s++){const a=time*3+s*1.57;ellipse(i.x+Math.cos(a)*24,yy+Math.sin(a)*10,2.5,2.5,'#fff8e0',gctx);}textLabel(P.name.toUpperCase(),i.x,yy-34,{font:'bold 11px Georgia',color:'#fff0c8',glow:P.color});emitters.push({id:'moc'+i.id,kind:'item',x:i.x,y:yy,rate:14});}
let bolts=[];
function powerHit(e){if(!p.pow)return;const id=p.pow.id;
 if(id==='oganj'){e.burn=3;e.burnBy=1;}
 if(id==='grom'){let n=0;for(const o of world.enemies){if(n>=2||o===e||!o.alive||Math.hypot(o.x-e.x,o.y-e.y)>260)continue;n++;o.hp-=22;o.flash=.15;o.stun=Math.max(o.stun,.5);o.mode='stun';bolts.push({x0:e.x,y0:e.y-70,x1:o.x,y1:o.y-70,t:.22});label(22,o.x,o.y-110,'#bfe6ff');if(o.hp<=0)slay(o);}if(n)sfx('thunder',{gain:.35,rate:1.8});}}
function powerSwing(){if(p.pow?.id!=='vila')return;arrows.push({x:p.x+p.face*40,y:p.y-70,vx:p.face*640,life:.55,enemy:false,fairyWave:true});sfx('magic',{gain:.4,rate:1.4});}
function updatePowers(dt){if(p.pow){p.pow.t-=dt;if(p.pow.t<=0){toast(`${POWERS[p.pow.id].name} se ugasio.`,1.6);p.pow=null;}else if(Math.random()<dt*20)burst(p.x+p.face*30,p.y-70,POWERS[p.pow.id].color,1,60);}
 for(const e of world.enemies){if(!e.alive||!(e.burn>0))continue;e.burn-=dt;e.hp-=10*dt;if(Math.random()<dt*14)burst(e.x,e.y-60,'#ff8a3a',2,80);if(e.hp<=0)slay(e);}
 for(const b of bolts)b.t-=dt;bolts=bolts.filter(b=>b.t>0);lockedT=Math.max(0,lockedT-dt);}
function drawPowers(){for(const b of bolts){for(const [g,w,c] of[[gctx,5,'#bfe6ff'],[ctx,2,'#ffffff']]){g.save();g.globalAlpha=b.t/.22;g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(b.x0,b.y0);for(let k=1;k<6;k++){const t=k/6;g.lineTo(b.x0+(b.x1-b.x0)*t+(Math.random()-.5)*26,b.y0+(b.y1-b.y0)*t+(Math.random()-.5)*26);}g.lineTo(b.x1,b.y1);g.stroke();g.restore();}}
 if(p?.pow){const P=POWERS[p.pow.id];halo(p.x+p.face*30,p.y-74,40,P.color,.35+.15*Math.sin(time*9));}
 for(const e of world.enemies)if(e.alive&&e.burn>0&&e.x>camera-60&&e.x<camera+VIEW_W+60)drawFlame(e.x,e.y-30,30,60,e.id,.7);}
// ---------- traps ----------
function setupTraps(){for(const t of world.traps||[]){t.t=0;if(t.kind==='tent')Object.assign(t,{hp:7,hp0:7,wave:0,cool:1.2,out:[],down:false,flap:0,shake:0});if(t.kind==='timed'){t.open=0;}if(t.kind==='boulder'){t.state='wait';}if(t.kind==='rocks'){t.falling=[];t.clock=0;}if(t.kind==='barrels'){t.list=[];t.clock=1;}}}
function hurtBy(amount,dir,vy=-380){if(p.invuln>0||p.dash>0)return false;const before=p.hp;damage(amount,dir);if(p.hp<before){p.vy=Math.min(p.vy,vy);p.grounded=false;return true;}return false;}
function updateTraps(dt){for(const t of world.traps||[]){t.t+=dt;
 if(t.kind==='spikes'){spikeFoes(t);if(p.y>=t.y-6&&p.y<=t.y+4&&p.x+12>t.x&&p.x-12<t.x+t.w&&!p.climb&&!(p.pogoT>0)&&p.plunge!==1)hurtBy(18,p.x<t.x+t.w/2?-1:1,-520);
  for(const e of world.enemies)if(e.alive&&!e.champion&&Math.abs(e.y-t.y)<4&&e.x>t.x&&e.x<t.x+t.w&&e.grounded){e.hp-=90*dt*4;e.flash=.1;if(e.hp<=0){slay(e);blood(e.x,e.y-20,1,20);}}}
 else if(t.kind==='log'){const w=Math.sqrt(1750/t.arm)*.55,a=t.amp*Math.sin(t.t*w+t.phase),va=t.amp*w*Math.cos(t.t*w+t.phase);t.lx=t.x+Math.sin(a)*t.arm;t.ly=t.pivot+Math.cos(a)*t.arm;t.vx=Math.cos(a)*t.arm*va;
  if(Math.abs(p.x-t.lx)<90&&p.y>t.ly-14&&p.y-p.h<t.ly+20){if(hurtBy(22,Math.sign(t.vx)||1,-300))p.vx=Math.sign(t.vx||1)*520;}
  for(const e of world.enemies)if(e.alive&&!e.champion&&Math.abs(e.x-t.lx)<90&&e.y>t.ly-14&&e.y-110<t.ly+20&&!(e.logT>0)){e.logT=1;e.hp-=60;e.flash=.15;e.stun=1.2;e.mode='stun';e.vx=Math.sign(t.vx||1)*400;e.vy=-320;e.grounded=false;e.air=true;sfx('hit_heavy',{gain:.7,x:e.x});if(e.hp<=0)slay(e,.6);}
  for(const e of world.enemies)if(e.logT>0)e.logT-=dt;}
 else if(t.kind==='rocks'){const near=p.x>t.x0-500&&p.x<t.x1+300;t.clock-=dt;if(near&&t.clock<=0){t.clock=t.every*(.7+Math.random()*.6);const x=clamp(p.x+(Math.random()-.35)*320,t.x0,t.x1);t.falling.push({x,y:camY-60,vy:0,warn:.75,rot:Math.random()*6,gy:groundAt(x,t.y-40)??t.y});}
  for(const r of t.falling){if(r.warn>0){r.warn-=dt;continue;}r.vy+=1900*dt;r.y+=r.vy*dt;r.rot+=dt*6;if(r.y>=r.gy-16){r.done=true;dust(r.x,r.gy,12,1.6);sfx('rock',{gain:.7,x:r.x});shake=Math.max(shake,settings.reduced?0:3);if(Math.abs(p.x-r.x)<52&&p.y>r.gy-130)hurtBy(16,Math.sign(p.x-r.x)||1);for(const e of world.enemies)if(e.alive&&!e.champion&&Math.abs(e.x-r.x)<50&&Math.abs(e.y-r.gy)<20){e.hp-=70;e.stun=1;e.mode='stun';if(e.hp<=0)slay(e);}}}
  t.falling=t.falling.filter(r=>!r.done);}
 else if(t.kind==='barrels'){t.clock-=dt;if(t.clock<=0&&Math.abs(p.x-t.x)<1200){t.clock=t.every;t.list.push({x:t.x,y:t.y-30,vx:-235,vy:0,w:40,h:40,rot:0,grounded:false,life:12});sfx('hit_heavy',{gain:.4,rate:.7,x:t.x});}
  for(const b of t.list){b.life-=dt;b.vx=-235;integrate(b,dt,world.platforms,world.runes);b.rot-=dt*6;if(b.grounded&&Math.random()<.2)dust(b.x,b.y,1,.5);if(b.y>(world.pitY||900))b.life=0;
   if(Math.abs(p.x-b.x)<34&&p.y>b.y-46&&p.y-p.h<b.y){if(hurtBy(14,-1,-320)){b.life=0;smashBarrel(b);}}
   if(attackActive()&&b.hitId!==p.attackId&&Math.abs(b.x-p.x)<120&&(b.x-p.x)*p.face>-20&&Math.abs(b.y-p.y)<70){b.hitId=p.attackId;b.life=0;smashBarrel(b);addCoins(2,b.x,b.y-20);}
   if(thrown&&Math.abs(thrown.x-b.x)<40&&Math.abs(thrown.y-(b.y-25))<50){b.life=0;smashBarrel(b);}
   for(const e of world.enemies)if(e.alive&&!e.champion&&Math.abs(e.x-b.x)<30&&Math.abs(e.y-b.y)<20){e.hp-=45;e.stun=.8;e.mode='stun';b.life=0;smashBarrel(b);if(e.hp<=0)slay(e);}}
  t.list=t.list.filter(b=>b.life>0);}
 else if(t.kind==='timed'){if(t.open>0){t.open-=dt;if(Math.floor(t.open*2)!==Math.floor((t.open+dt)*2))sfx('ring',{gain:.25,rate:t.open<2?1.6:1.2});if(t.open<=0)sfx('gate',{gain:.7,x:t.gate.x});}
  if(!(t.open>0)){if(p.x>t.gate.x-GATE_STOP&&p.x<t.gate.x+30&&Math.abs(p.y-t.gate.y)<200){p.x=t.gate.x-GATE_STOP;goalHint('Kapija je zatvorena. Povuci polugu (E), pa trči!');}for(const e of world.enemies)if(e.alive&&e.x>t.gate.x-50&&e.x<t.gate.x+30)e.x=e.x<t.gate.x?t.gate.x-50:t.gate.x+30;}}
 else if(t.kind==='boulder'){if(t.state==='wait'&&p.x>t.trigger&&Math.abs(p.y-t.y)<200){t.state='roll';t.bx=t.x0-460;t.v=190;t.rot=0;speak(t.snow?'Lavina! Trči, Marko, ne zastaj!':'Odron! Trči, Marko, ne zastaj!',3);sfx('boom',{gain:.9,rate:.6});sfx('rock',{gain:1});shake=settings.reduced?0:8;}
  if(t.state==='roll'){t.v=Math.min(292,t.v+dt*26);t.bx+=t.v*dt;t.rot+=t.v*dt/95;if(Math.random()<dt*10)dust(t.bx-60,t.y,4,2);shake=Math.max(shake,settings.reduced?0:2.5);if(Math.random()<dt*3)sfx('rock',{gain:.5,rate:.6+Math.random()*.3,x:t.bx});
   if(Math.abs(p.x-t.bx)<100&&p.y>t.y-200){if(hurtBy(30,1,-420))p.vx=560;}
   for(const e of world.enemies)if(e.alive&&!e.champion&&Math.abs(e.x-t.bx)<100&&Math.abs(e.y-t.y)<60){slay(e,.9);}
   for(const b of world.breakables||[])if(!b.broken&&!b.opened&&Math.abs(b.x-t.bx)<100&&Math.abs(b.y-t.y)<40)hitCrate(b,9);
   if(t.bx>t.end+30){t.state='fall';t.fy=0;}}
  if(t.state==='fall'){t.fy+=dt*900;t.bx+=t.v*dt*.5;t.rot+=dt*3;if(t.fy>500){t.state='done';dust(t.end+80,t.y,30,3);sfx('boom',{gain:1,rate:.5});shake=settings.reduced?0:12;toast(t.snow?'Lavina je pala u provaliju.':'Stena je pala u provaliju.',2);}}}
 }
 // crumbling planks: they shake when stepped on, then fall; they come back after a while
 for(const q of world.platforms){if(!q.crumble)continue;if(q.shakeT===undefined){q.shakeT=0;q.fall=0;}
  const on=(p.on===q&&p.grounded)||world.enemies.some(e=>e.alive&&e.on===q&&e.grounded);
  if(!q.off&&on&&!(q.shakeT>0)){q.shakeT=.5;sfx('cloth',{gain:.5,rate:.7,x:q.x});}
  if(q.shakeT>0&&!q.off){q.shakeT-=dt;if(q.shakeT<=0){q.off=true;q.fall=0;q.back=4.5;sfx('hit_heavy',{gain:.5,rate:1.5,x:q.x});dust(q.x+q.w/2,q.y,8,1.2);}}
  if(q.off){q.fall+=dt;q.back-=dt;if(q.back<=0&&!(Math.abs(p.x-(q.x+q.w/2))<q.w/2+20&&Math.abs(p.y-q.y)<120)){q.off=false;q.shakeT=0;}}}}
function smashBarrel(b){sfx('hit_heavy',{gain:.7,rate:1.3,x:b.x});dust(b.x,b.y,10,1.4);burst(b.x,b.y-20,'#8a5a32',16,200,'dust');}
function pullLever(){for(const t of world.traps||[]){if(t.kind!=='timed'||Math.abs(p.x-t.lever.x)>110||Math.abs(p.y-t.lever.y)>120)continue;t.open=t.time;t.pulled=.6;p.castLock=.4;p.leverT=.5;sfx('gate',{gain:.8,x:t.gate.x});sfx('ring',{gain:.6});toast(`Kapija je otvorena! ${t.time.toFixed(0)} sekundi — trči!`,2.2);return true;}return false;}
function drawSpikes(t){if(t.x+t.w<camera-40||t.x>camera+VIEW_W+40)return;const iron=['tvrdjava','podrum','rudnik','manastir'].includes(level?.id);{const art=levelArt[iron?'siljci':'kolje'];if(art){const b=propBounds(art),h=50,tw=b.w*h/b.h;ctx.save();ctx.beginPath();ctx.rect(t.x-4,t.y-h-4,t.w+8,h+8);ctx.clip();for(let xx=t.x-4;xx<t.x+t.w+4;xx+=tw-1)ctx.drawImage(art,b.x,b.y,b.w,b.h,xx,t.y-h+4,tw,h);ctx.restore();if(Math.abs(p.x-t.x)<500)textLabel('⚠',t.x+t.w/2,t.y-58,{font:'bold 14px Georgia',color:'#ffd27a',glow:'#ff7a3a'});return;}}ctx.fillStyle='rgba(20,14,10,.5)';ctx.fillRect(t.x-4,t.y-4,t.w+8,8);
 line(t.x,t.y-12,t.x+t.w,t.y-16,iron?'#3a3c40':'#5a3c20',5);for(let x=t.x+7,k=0;x<t.x+t.w-4;x+=15,k++){const h=40+((k*7)%3)*8,lean=((k*5)%3-1)*3;poly([[x-7,t.y+3],[x+lean,t.y-h],[x+7,t.y+3]],iron?'#9a9ea4':'#b07a40',iron?'#24272b':'#3a2412');line(x-1.5,t.y-h+6,x-3.5,t.y,'rgba(255,240,210,.45)',1.4);if(k%3===1&&settings.gore!==false)ellipse(x,t.y-h+10,2.2,3,'#7a1010');}
 if(Math.abs(p.x-t.x)<500)textLabel('⚠',t.x+t.w/2,t.y-48,{font:'bold 14px Georgia',color:'#ffd27a',glow:'#ff7a3a'});}
function drawLog(t){if(t.lx===undefined||t.x<camera-500||t.x>camera+VIEW_W+500)return;const im=levelArt['prop-balvan'],ch=levelArt['prop-lanac'],[b0,b1]=t.beam||[t.x-140,t.x+140];
 if(!t.first){// the frame: posts and a beam, drawn once per room by the first log
 }else{const wood=levelArt['zid-drvo'];const P=wood?ctx.createPattern(wood,'repeat'):null;const fillWood=(x,y,w,h)=>{if(P){P.setTransform(new DOMMatrix([.3,0,0,.3,0,0]));ctx.fillStyle=P;}else ctx.fillStyle='#6a4426';ctx.fillRect(x,y,w,h);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(x+w-4,y,4,h);};
  for(const px of[b0,b1-18]){fillWood(px,t.pivot-14,18,t.y-t.pivot+18);line(px-30,t.y,px+9,t.y-70,'#3a2614',7);line(px+48,t.y,px+9,t.y-70,'#3a2614',7);}
  fillWood(b0-14,t.pivot-24,b1-b0+28,22);line(b0-14,t.pivot-24,b1+14,t.pivot-24,'rgba(255,226,170,.5)',2);}
 for(const dx of[-60,60]){const x0=t.x+dx*.3,x1=t.lx+dx;if(ch){const len=Math.hypot(x1-x0,t.ly-t.pivot),a=Math.atan2(t.ly-t.pivot,x1-x0)-Math.PI/2;ctx.save();ctx.translate(x0,t.pivot);ctx.rotate(a);const b=propBounds(ch),seg=b.h*.45,k=12/b.w;for(let y=0;y<len;y+=seg*k)ctx.drawImage(ch,b.x,b.y,b.w,seg,-6,y,12,seg*k);ctx.restore();}else line(x0,t.pivot,x1,t.ly,'#5a5a5a',4);}
 const tilt=Math.atan2(t.ly-t.pivot,t.lx-t.x)-Math.PI/2;ctx.save();ctx.translate(t.lx,t.ly);ctx.rotate(tilt*.6);if(im){const b=propBounds(im),w=200,h=b.h*w/b.w;ctx.drawImage(im,b.x,b.y,b.w,b.h,-w/2,-h/2,w,h);}else{ctx.fillStyle='#6a4426';ctx.fillRect(-95,-16,190,32);}ctx.restore();
 if(Math.abs(t.vx)>300)for(let k=1;k<4;k++)halo(t.lx-Math.sign(t.vx)*k*34,t.ly,30,'rgba(255,240,210,.14)',.4);}
function drawRocks(t){const im=levelArt['prop-stena-mala'];for(const r of t.falling){if(r.warn>0){const a=1-r.warn/.75;ctx.globalAlpha=.25+.5*a;ellipse(r.x,r.gy+2,30*a+10,7,'#140c08');ctx.globalAlpha=1;continue;}shadow(r.x,r.gy,40,.5);ctx.save();ctx.translate(r.x,r.y);ctx.rotate(r.rot);if(im){const b=propBounds(im),w=70,h=b.h*w/b.w;ctx.drawImage(im,b.x,b.y,b.w,b.h,-w/2,-h/2,w,h);}else ellipse(0,0,26,22,'#8a8270');ctx.restore();}}
function drawBarrels(t){const im=levelArt['razbi-bure']||levelArt['prop-bure'];for(const b of t.list){ctx.save();ctx.translate(b.x,b.y-24);ctx.rotate(b.rot);if(im){const bb=propBounds(im),k=48/bb.h;ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,-bb.w*k/2,-24,bb.w*k,48);}else{ellipse(0,0,22,22,'#7a4a24');line(-20,0,20,0,'#2c2c2c',3);}ctx.restore();}}
function drawTimed(t){const lv=levelArt[t.open>0||t.pulled>0?'cilj-poluga-povucena':'cilj-poluga'],gt=levelArt[t.open>0?'cilj-kapija-otvorena':'cilj-kapija-zatvorena'];
 const draw=(im,x,y,h)=>{if(!im)return false;const b=propBounds(im),w=b.w*h/b.h;ctx.drawImage(im,b.x,b.y,b.w,b.h,x-w/2,y-h+6,w,h);return true;};
 draw(lv,t.lever.x,t.lever.y,110)||line(t.lever.x,t.lever.y,t.lever.x+(t.open>0?20:-20),t.lever.y-70,'#5a3c22',7);
 drawSideGate('timed'+t.lever.x,t.gate.x,t.gate.y,t.open>0);
 if(t.open>0)textLabel(Math.ceil(t.open)+'',t.gate.x,t.gate.y-290,{font:'bold 30px Georgia',color:t.open<2?'#ff9a7a':'#fff0c8',glow:t.open<2?'#ff4a2a':'#ffd27a'});
 else if(Math.abs(p.x-t.lever.x)<260)textLabel('E · POVUCI POLUGU',t.lever.x,t.lever.y-130,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
function drawBoulder(t){if(t.state!=='roll'&&t.state!=='fall')return;const r=96,x=t.bx,y=t.y-r+8+(t.fy||0);shadow(x,t.y,110,.6);ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();ctx.rotate(t.rot);
 if(t.snow){ctx.fillStyle='#e8eef4';ctx.fillRect(-r,-r,r*2,r*2);for(let k=0;k<9;k++){ctx.fillStyle='rgba(150,170,190,.5)';ctx.beginPath();ctx.arc(Math.cos(k*2.3)*r*.6,Math.sin(k*1.7)*r*.6,16,0,7);ctx.fill();}}
 else{const P=levelArt['zid-stena']?ctx.createPattern(levelArt['zid-stena'],'repeat'):null;if(P){P.setTransform(new DOMMatrix([.5,0,0,.5,0,0]));ctx.fillStyle=P;}else ctx.fillStyle='#8a8270';ctx.fillRect(-r,-r,r*2,r*2);for(let k=0;k<5;k++)line(-r,-r+k*44,r,-r+k*44+30,'rgba(30,24,18,.35)',4);}
 ctx.restore();const g=ctx.createRadialGradient(x-30,y-30,10,x,y,r);g.addColorStop(0,'rgba(255,240,210,.18)');g.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(20,16,12,.8)';ctx.lineWidth=3;ctx.stroke();
 if(t.state==='roll'&&t.bx<p.x-200)textLabel('▶ TRČI!',p.x,p.y-160,{font:'bold 16px Georgia',color:'#fff0c8',glow:'#ff7a3a',alpha:.6+.4*Math.sin(time*10)});}
function drawTraps(){let firstLog=null;for(const t of world.traps||[]){if(t.kind==='log'){t.first=!firstLog||firstLog.beam?.[0]!==t.beam?.[0];if(t.first)firstLog=t;}if(t.kind==='spikes')drawSpikes(t);else if(t.kind==='log')drawLog(t);else if(t.kind==='rocks')drawRocks(t);else if(t.kind==='barrels')drawBarrels(t);else if(t.kind==='timed')drawTimed(t);}}
function drawTrapsFront(){for(const t of world.traps||[])if(t.kind==='boulder')drawBoulder(t);drawGateFronts();}
// ---------- champions: an arena that locks until the aga falls ----------
let arena=null;
function updateArena(){const c=world.enemies.find(e=>e.champion);if(!c)return;
 if(c.alive&&!arena&&p.x>c.arena.x0+90){arena={...c.arena,boss:c};c.engaged=true;speak(`${c.name} ti preči put. Pazi na njegov poseban napad, Marko!`,4);sfx('horn_call',{gain:.8});toast(`MEGDAN · ${c.name}`,2.4);$('boss-hud').hidden=false;}
 if(arena){if(c.alive)p.x=clamp(p.x,arena.x0+30,arena.x1-30);else{arena=null;$('boss-hud').hidden=true;addCoins(45,c.x,c.y-60);world.items.push({id:8990,x:c.x,y:c.y-60,type:'moc',power:Object.keys(POWERS)[(levelIndex+1)%3],taken:false});toast(`Pobedio si! ${c.name} je pao.`,3);sfx('magic_big',{gain:1});say('victory',{priority:3});}}}
function championAttack(e,F){e.count=(e.count||0)+1;const special=e.count%3===0;if(!special)return false;
 const t=e.type;sfx('horn_call',{gain:.5,rate:1.3});
 if(t==='oklopnik'||t==='shield'){for(const d of[-1,1])arrows.push({x:e.x+d*40,y:e.y-16,vx:d*360,life:2.6,enemy:true,wave:true});dust(e.x,e.y,22,2.6);shake=settings.reduced?0:8;sfx('boom',{gain:.9});label('TALAS · SKOČI',e.x,e.y-170,'#ffcf9a');return true;}
 if(t==='palikuca'){for(const k of[-1,0,1]){const tt=1+k*.15,vx=clamp((p.x+k*110-e.x)/tt,-480,480);arrows.push({torch:true,x:e.x+e.face*28,y:e.y-110,vx,vy:-420,life:4,enemy:true});}sfx('whoosh_heavy',{gain:.7});return true;}
 if(t==='akindzija'){for(const d of[-1,1]){const hp=FOE_HP_L.akindzija;world.enemies.push({id:9100+e.count*2+(d>0?1:0),x:e.x+d*160,y:e.y,vx:0,vy:-300,w:36,h:75,hp,maxHp:hp,type:'akindzija',zone,face:-d,mode:'idle',timer:.8,stun:0,flash:0,alive:true,home:e.x,attackId:0,grounded:false,air:true});}toast('Beg zove akindžije!',1.6);sfx('horn_call',{gain:.7});return true;}
 if(t==='sword'){e.lunge={v:e.face*620,t:.32,total:.32,hop:30};e.pendingHit={t:.3,dmg:26,range:150};sfx('whoosh_heavy',{gain:.8});return true;}
 return false;}
const FOE_HP_L={akindzija:80};
// ---------- new blows: uppercut (S+K, also W+J) and the charge out of a roll (Shift, then J) ----------
function specialStrike(){if(p.attack>0||p.cooldown>0||p.climb||horseMounted||p.down>0||thrown||p.throwT>0)return false;
 if(p.grounded&&((isDown('KeyS','ArrowDown')&&tap('KeyK'))||(isDown('KeyW','ArrowUp')&&tap('KeyJ')&&!ladderNear()))){p.crouching=false;p.crouch=0;if(!cdReady('uvis')){cdDenied('uvis');return false;}cdStart('uvis');p.launchT=.6;p.attack=.42;p.attackKind='uvis';p.cooldown=.3;p.attackId=++attackSerial;sound('swing');sayGrunt(true);return true;}
 if((p.dash>0||p.rollEnd>0)&&tap('KeyJ')){if(!has('juris')){locked('juris');return false;}if(!cdReady('juris')){cdDenied('juris');return false;}cdStart('juris');p.dash=0;p.attack=.42;p.attackKind='juris';p.cooldown=.5;p.attackId=++attackSerial;p.jurisT=.26;p.invuln=Math.max(p.invuln,.3);sfx('whoosh_heavy',{gain:.8});sayGrunt(true);return true;}
 return false;}
function updateSpecial(dt){p.rollEnd=Math.max(0,(p.rollEnd||0)-dt);if(p.dash>0&&p.dash<dt*2)p.rollEnd=.18;if(p.jurisT>0){p.jurisT-=dt;p.vx=p.face*640;if(Math.random()<.5)ghosts.push({...playerPose(),x:p.x,y:p.y,face:p.face,life:.18});}}
// ---------- the level list opens one pohod at a time ----------
function levelOpen(i){if(i===0)return kacanikWon();const done=levelsDone(),prev=LEVELS[i-1];return done.some(k=>k===prev.id||k.startsWith(prev.id+'@'));}

// ================= gamepad: Xbox controller and Logitech F310 (XInput, the "standard" layout) =================
// A skok · X topuz · Y teški udarac · B kolut · LB blok/odbij · RB baci topuz · LT vino · RT vila/upotrebi
// L3 vihor · R3 junački udar · Start pauza · stick ili krstić: kretanje, gore = lestve/uvis, dole = čučanj
const PAD_MAP={0:'Space',1:'ShiftLeft',2:'KeyJ',3:'KeyK',4:'KeyL',5:'KeyI',6:'KeyQ',7:'KeyE',10:'KeyF',11:'KeyR'};
const padHeld=new Set(),padRest=new Set();let padPrev={},padIndex=null,padNav={},controlsKeyboard=null;
const PAD_LEGEND='<span><kbd>A</kbd> Skok</span><span><kbd>X</kbd> Topuz</span><span><kbd>Y</kbd> Teški</span><span><kbd>B</kbd> Kolut</span><span><kbd>LB</kbd> Blok</span><span><kbd>RB</kbd> Baci topuz</span><span><kbd>RT</kbd> Vila / poluga</span><span><kbd>LT</kbd> Vino</span><span><kbd>L3</kbd> Vihor</span><span><kbd>R3</kbd> Super</span><span><kbd>↑</kbd> Lestve · <kbd>↑</kbd>+<kbd>X</kbd> Uvis</span><span><kbd>↓</kbd>+<kbd>A</kbd> Siđi</span>';
function padSet(code,on){if(on){if(!padHeld.has(code)){padHeld.add(code);if(!keys.has(code))pressed.add(code);keys.add(code);}}else if(padHeld.has(code)){padHeld.delete(code);keys.delete(code);}}
function rumble(strength=.5,ms=160){try{const g=padIndex!==null&&navigator.getGamepads?.()[padIndex];g?.vibrationActuator?.playEffect?.('dual-rumble',{duration:ms,strongMagnitude:strength,weakMagnitude:Math.min(1,strength*1.2)});}catch{}}
function padConnected(g){padIndex=g.index;padRest.clear();g.buttons.forEach((b,i)=>{if(b.pressed||b.value>.5)padRest.add(i);});if(/dual action/i.test(g.id)){setTimeout(()=>toast('Logitech F310 je u D režimu: prebaci prekidač na poleđini na X za pune kontrole.',5),3200);}const c=$('controls');if(c&&controlsKeyboard===null){controlsKeyboard=c.innerHTML;c.innerHTML=PAD_LEGEND;}toast('Džojstik je povezan · A skok, X topuz, Y teški udarac',3);}
function padGone(){padIndex=null;for(const c of[...padHeld])padSet(c,false);const c=$('controls');if(c&&controlsKeyboard!==null){c.innerHTML=controlsKeyboard;controlsKeyboard=null;}toast('Džojstik je isključen',2);}
if(hasDom){window.addEventListener('gamepadconnected',e=>padConnected(e.gamepad));window.addEventListener('gamepaddisconnected',e=>{if(e.gamepad.index===padIndex)padGone();});}
// menus: the stick or the cross moves between buttons, A presses, B goes back
function padMenu(dirX,dirY,a,b){const open=[...document.querySelectorAll('.modal:not([hidden]),#menu:not([hidden])')];const box=open[open.length-1];if(!box)return;
 const items=[...box.querySelectorAll('button,select,input')].filter(el=>!el.disabled&&el.offsetParent!==null);if(!items.length)return;let cur=items.indexOf(document.activeElement);
 if(dirX||dirY){cur=cur<0?0:(cur+(dirY||dirX)+items.length)%items.length;items[cur].focus();document.querySelectorAll('.pad-focus').forEach(el=>el.classList.remove('pad-focus'));items[cur].classList.add('pad-focus');items[cur].scrollIntoView?.({block:'nearest'});sfx('cloth',{gain:.25,rate:1.6});}
 if(a){const el=cur>=0?items[cur]:items[0];el.click();sfx('ring',{gain:.3,rate:1.5});}
 if(b){if(!$('settings').hidden){closeSettings();return;}const back=box.querySelector('#levels-close,#riznica-close,#resume,#lore-close,.text-button');if(back)back.click();}}
function pollPads(){if(!hasDom||!navigator.getGamepads)return;const pads=navigator.getGamepads();const g=pads&&(pads[padIndex??-1]||[...pads].find(Boolean));if(!g){return;}if(padIndex===null)padConnected(g);
 const raw=i=>!!g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>.5),btn=i=>{const v=raw(i);if(padRest.has(i)){if(!v)padRest.delete(i);return false;}return v;},ax=g.axes[0]||0,ay=g.axes[1]||0;
 const left=btn(14)||ax<-.45,right=btn(15)||ax>.45,up=btn(12)||ay<-.55,down=btn(13)||ay>.55;
 const edge=(k,v)=>{const was=padPrev[k];padPrev[k]=v;return v&&!was;};
 const start=edge('start',btn(9));
 if(mode==='play'){padSet('KeyA',left);padSet('KeyD',right);padSet('KeyW',up);padSet('KeyS',down);for(const [i,code] of Object.entries(PAD_MAP))padSet(code,btn(+i));if(start)pause();return;}
 for(const c of[...padHeld])padSet(c,false);
 const t=performance.now(),rep=k=>{const v=k==='u'?up:k==='d'?down:k==='l'?left:right;if(!v){padNav[k]=0;return false;}if(!padNav[k]||t>padNav[k]){padNav[k]=t+(padNav[k]?140:380);return true;}return false;};
 const dy=rep('d')?1:rep('u')?-1:0,dx=rep('r')?1:rep('l')?-1:0,a=edge('a',btn(0)),b=edge('b',btn(1));
 if(start&&mode==='pause'){pause();return;}if(start&&mode==='menu'&&$('menu')&&!$('menu').hidden){$('start').click();return;}
 padMenu(dx,dy,a,b);}

// ================= pack 06: juice and reasons to come back — hit streaks, elites, stars, slow motion, Ravijojla's hints =================
// ---------- the hit streak: keep hitting within 2.5 s; every ten blows pay ducats ----------
let streak={n:0,t:0,best:0};
function streakHit(e){if(!level)return;streak.n++;streak.t=2.5;streak.best=Math.max(streak.best,streak.n);if(streak.n%10===0){const bonus=streak.n/2;addCoins(bonus,e.x,e.y-80);label(`NIZ ×${streak.n} · +${bonus}`,p.x,p.y-170,'#ffe39a');sfx('coins',{gain:.8});rumble(.4,120);}}
function updateStreak(dt){if(streak.t>0){streak.t-=dt;if(streak.t<=0)streak.n=0;}const el=$('niz');if(!el)return;const show=level&&streak.n>=3;el.hidden=!show;if(show){const key=streak.n+'|'+Math.ceil(streak.t*4);if(el.dataset?.k!==key){if(el.dataset)el.dataset.k=key;el.innerHTML=`<b>×${streak.n}</b><span>NIZ</span><i style="width:${Math.max(0,streak.t/2.5*100)}%"></i>`;}}}
// ---------- slow motion when a champion falls ----------
let slowMo=0;
// ---------- stars for each pohod: finished · all five letters · the marvel found ----------
function levelStars(L){const done=levelsDone().some(k=>k===L.id||k.startsWith(L.id+'@'));let slova=false;try{slova=JSON.parse(localStorage.getItem('marko-slova')||'[]').includes(L.id);}catch{}const c=CUDA.find(c=>c.land===L.id),cudo=c?ownedCuda().has(c.id):null;return{done,slova,cudo};}
function starText(L){const s=levelStars(L);return(s.done?'★':'☆')+(s.slova?'★':'☆')+(s.cudo===null?'':s.cudo?'★':'☆');}
// ---------- Ravijojla explains each new danger the first time Marko meets it ----------
const HINTS={ladder:'Lestve! Priđi i drži W (ili gore na džojstiku).',spikes:'Kolje! Preskoči ga — a Turčina možeš baciti na njega.',crumble:'Ove daske popuštaju. Ne zastaj na njima!',log:'Balvan se njiše. Sačekaj da prođe, pa protrči ispod.',rocks:'Kamenje pada sa litice. Prati senke na zemlji!',barrels:'Burad se kotrljaju niz stepenice! Preskoči ih ili razbij teškim udarcem.',timed:'Povuci polugu, pa trči — kapija se brzo zatvara.',plate:'Iza ove kapije je riznica. Ploča u zemlji otvara kapiju dok je nešto pritiska: dogurni teški sanduk na ploču (samo hodaj u njega), pa uđi sa W.',slovo:'Zlatno slovo! Skupi sva slova М-А-Р-К-О u ovom pohodu.',moc:'Vilinska moć! Uzmi je i topuz će ti zasijati.',chest:'Kovčeg! Udari ga topuzom da ga otvoriš.',shaft:'Između ova dva zida možeš da se penješ odskakanjem.',boss:'Megdan! Pazi na svaki njegov treći napad.',drop:'Sa daske ili poda kule siđeš sa S + Space (na džojstiku dole + A).',launch:'S + K je aperkat: diže Turčina u vazduh! Odmah Space za njim, pa J J J u skoku — treći udarac ga zakuca o zemlju.'};
let hintsSeen=null,hintT=0;
function hintOnce(key,any=false){if(!level&&!any)return;hintsSeen??=(()=>{try{return new Set(JSON.parse(localStorage.getItem('marko-hints')||'[]'));}catch{return new Set();}})();if(hintsSeen.has(key)||hintT>0)return;hintsSeen.add(key);hintT=6;try{localStorage.setItem('marko-hints',JSON.stringify([...hintsSeen]));}catch{}speak(HINTS[key],5);}
function updateHints(dt){hintT=Math.max(0,hintT-dt);if(hintT<=0&&world.enemies.some(e=>e.alive&&!e.perch&&Math.abs(e.x-p.x)<240&&Math.abs(e.y-p.y)<60))hintOnce('launch',true);if(!level||hintT>0)return;const near=(x,y,r=420)=>Math.abs(x-p.x)<r&&Math.abs(y-p.y)<260;
 for(const l of world.ladders||[])if(near(l.x,l.bottom,300))return hintOnce('ladder');
 for(const t of world.traps||[]){if(t.kind==='spikes'&&near(t.x,t.y))return hintOnce('spikes');if(t.kind==='log'&&near(t.x,t.y,520))return hintOnce('log');if(t.kind==='rocks'&&near(t.x0,t.y))return hintOnce('rocks');if(t.kind==='barrels'&&near(t.x-400,t.y,700))return hintOnce('barrels');if(t.kind==='timed'&&near(t.lever.x,t.lever.y))return hintOnce('timed');if(t.kind==='plate'&&near(t.x,t.y,600))return hintOnce('plate');}
 for(const q of world.platforms)if(q.crumble&&near(q.x,q.y,380))return hintOnce('crumble');
 for(const q of world.platforms)if(q.hang&&has('zid')&&near(q.x,q.y+q.h,360))return hintOnce('shaft');
 for(const i of world.items){if(i.taken)continue;if(i.type==='slovo'&&near(i.x,i.y,360))return hintOnce('slovo');if(i.type==='moc'&&near(i.x,i.y,360))return hintOnce('moc');}
 for(const b of world.breakables||[])if(b.kind==='kovceg'&&!b.opened&&near(b.x,b.y,300))return hintOnce('chest');
 if(arena)hintOnce('boss');if(p.grounded&&p.on&&!p.on.solid&&(p.on.kind==='plank'||p.on.kind==='deck'))hintOnce('drop');}
// ---------- elites: a few janissaries in every pohod are veterans — tougher, quicker, richer ----------
function makeElites(){let k=0;for(const e of world.enemies){if(e.champion||e.perch)continue;if((e.id*7+levelIndex*3)%7===0){e.elite=true;e.hp=e.maxHp=Math.round(e.maxHp*1.7);k++;}}return k;}

// ---------- Musa Kesedžija: a duel with clear tells and real openings ----------
// Every attack ends in an opening: after a swing he pants (2 s), a perfect parry staggers him (2.6 s), a leap buries his
// mace in the ground (2.6 s), a charge slams him into the rock (3 s). A ring over his head shows how long the opening lasts.
// Hits inside one opening build a streak: each adds damage, and the fifth is a hero's blow that keeps the opening longer.
const MUSA_OPEN=['open','staggered','stuck','dazed'],MUSA_X0=28320,MUSA_X1=29680;
function musaWindow(mode,t,text,color){boss.mode=mode;boss.hop=0;boss.timer=t*(settings.difficulty==='story'?1.35:1);boss.windowMax=boss.timer;boss.combo=0;boss.comboBonus=false;if(text)label(text,boss.x,boss.y-235,color||'#d9f6c0');}
function bossAfterDamage(){const phase=boss.hp<=1000?3:boss.hp<=2000?2:1;
 if(phase>boss.phase){boss.phase=phase;boss.mode='kneel';boss.timer=1.5;boss.combo=0;slowMo=.9;hitstop=Math.max(hitstop,.12);fx('flash','#ffe0d0',.14);sfx('boom',{gain:1});shake=settings.reduced?0:10;rumble(.9,400);
  label('SRCE JE PUKLO!',boss.x,boss.y-240,'#ffb0a0');burst(boss.x,boss.y-90,'#cf798e',70,320);say(phase===2?'musa_phase2':'musa_phase3',{priority:3,x:boss.x,delay:.8});say('phase',{chance:.8,delay:3.2,priority:2});
  toast(phase===2?'Drugo srce · sad skače i zabija topuz u zemlju':'Treće srce · juriša kroz megdan i pušta talas',4);p.energy=100;}
 if(boss.hp<=0){slowMo=1.2;fx('flash','#fff2d0',.2);win();}}
function bossDamage(){if(!attackActive()||boss.hitIds.has(p.attackId)||Math.abs(p.x-boss.x)>150||Math.abs(p.y-(boss.y-(boss.hop||0)))>110||(boss.x-p.x)*p.face< -20)return;boss.hitIds.add(p.attackId);
 const open=MUSA_OPEN.includes(boss.mode);if(!open&&p.attackKind!=='super'){label('ČELIČNI GARD',boss.x,boss.y-170,'#c1ced4');sound('parry');fx('burst',boss.x-boss.face*-40,boss.y-80,'#dfe8ff',12,180);return;}
 boss.combo=(boss.combo||0)+1;const k=p.attackKind,base=k==='super'?240:k==='counter'?60:k==='uvis'||k==='juris'?62:k==='heavy'?58*chargeMult():35*(p.combo===2?1.8:1);
 let amount=base*(1+Math.min(boss.combo,6)*.07)*(p.buff>0?1.3:1)*(p.pow?.id==='oganj'?1.2:1);
 if(boss.combo===5&&!boss.comboBonus&&open){boss.comboBonus=true;amount+=70;boss.timer+=.7;label('JUNAČKI NIZ!',p.x,p.y-190,'#ffe39a');fx('flash','#ffd890',.08);sfx('ring',{gain:.9});rumble(.6,200);}
 boss.hp=Math.max(0,boss.hp-amount);boss.hurtT=.34;boss.knock=p.face*(k==='light'?5:12);blood(boss.x-p.face*10,boss.y-90,p.face,k==='heavy'?26:16);if(k!=='super')p.rage=Math.min(100,p.rage+18);
 boss.flash=.16;fx('hit',boss.x-p.face*10,boss.y-80,k!=='light');label(Math.round(amount)+(boss.combo>1?` ×${boss.combo}`:''),boss.x,boss.y-160,boss.combo>=5?'#ffe39a':'#fff0c8');sound('hit');shake=settings.reduced?0:5;hitstop=.05;rumble(.35,90);streakHit(boss);bossAfterDamage();}
function bossSwing(){if(Math.abs(p.x-boss.x)<165&&Math.abs(p.y-boss.y)<90){if(p.parry>0&&(boss.x-p.x)*p.face>=-15){musaWindow('staggered',2.6,'ZATETURAO SE!');fx('parry',p.x+p.face*40,p.y-75);burst(p.x,p.y-75,'#d3ffe5',40);p.rage=Math.min(100,p.rage+25);sound('parry');label('ODBIJENO',p.x,p.y-145,'#beffe3');startCounter(boss.x);p.energy=Math.min(100,p.energy+15);rumble(.5,150);return true;}damage(22,boss.face);}return false;}
function musaPick(){const n=boss.count=(boss.count||0)+1,d=Math.abs(p.x-boss.x),ph=boss.phase,story=settings.difficulty==='story';
 if(ph>=3&&n%3===0){boss.mode='chargePrep';boss.timer=story?1.1:.85;sfx('hoof',{gain:.9,x:boss.x});label('!! JURIŠ',boss.x,boss.y-235,'#ffb09a');return;}
 if(ph>=2&&(n%3===1||d>300)){boss.mode='leapPrep';boss.timer=story?.95:.7;sfx('cloth',{gain:.8,x:boss.x});label('!! SKOK',boss.x,boss.y-235,'#ffb09a');return;}
 boss.mode='windup';boss.timer=story?1.3:.95;boss.double=ph>=2;sound('swing');}
function updateBoss(dt){if(zone!==5||!boss.alive)return;boss.hurtT=Math.max(0,(boss.hurtT||0)-dt);boss.moveT=Math.max(0,(boss.moveT||0)-dt);boss.flash=Math.max(0,boss.flash-dt);boss.knock=(boss.knock||0)*Math.pow(.001,dt);
 if(!['leap','charge','chargePrep'].includes(boss.mode))boss.face=p.x>boss.x?1:-1;bossDamage();if(!boss.alive)return;boss.timer-=dt;const m=boss.mode;
 if(m==='idle'){if(Math.abs(p.x-boss.x)>130){const v=95+boss.phase*15;boss.x+=boss.face*v*dt;boss.walk=(boss.walk||0)+v*dt;boss.moveT=.12;}if(boss.timer<=0)musaPick();}
 else if(m==='windup'&&boss.timer<=0){boss.mode='swing';boss.timer=.28;if(!bossSwing()&&boss.double){boss.mode='second';boss.timer=.5;boss.double=false;}}
 else if(m==='second'&&boss.timer<=0){boss.mode='swing';boss.timer=.3;bossSwing();}
 else if(m==='swing'&&boss.timer<=0){if(boss.phase===3)arrows.push({x:boss.x,y:574,vx:boss.face*340,life:4,enemy:true,wave:true});if(boss.mode==='swing')musaWindow('open',2,'OTVOREN GARD');}
 else if(MUSA_OPEN.includes(m)&&boss.timer<=0){boss.mode='idle';boss.timer=.9;boss.combo=0;}
 else if(m==='leapPrep'&&boss.timer<=0){boss.mode='leap';boss.timer=.75;boss.lx0=boss.x;boss.lx1=clamp(p.x,MUSA_X0,MUSA_X1);sfx('whoosh_heavy',{gain:.9});}
 else if(m==='leap'){const t=clamp(1-boss.timer/.75,0,1);boss.x=boss.lx0+(boss.lx1-boss.lx0)*t;boss.hop=Math.sin(Math.PI*t)*230;
  if(boss.timer<=0){boss.hop=0;dust(boss.x,boss.y,26,3);sfx('boom',{gain:1});sfx('rock',{gain:.9});shake=settings.reduced?0:11;rumble(.9,300);
   if(Math.abs(p.x-boss.x)<135&&p.grounded&&p.dash<=0)damage(26,Math.sign(p.x-boss.x)||1);if(boss.phase>=3)for(const d of[-1,1])arrows.push({x:boss.x+d*50,y:574,vx:d*330,life:3,enemy:true,wave:true});
   musaWindow('stuck',2.6,'TOPUZ SE ZAGLAVIO!');}}
 else if(m==='chargePrep'&&boss.timer<=0){boss.mode='charge';boss.timer=2;boss.cdir=p.x>boss.x?1:-1;boss.face=boss.cdir;sfx('horn_call',{gain:.6,rate:1.4});}
 else if(m==='charge'){boss.x+=boss.cdir*560*dt;boss.walk=(boss.walk||0)+560*dt;boss.moveT=.12;if(Math.random()<.5)dust(boss.x-boss.cdir*40,boss.y,2,1.5);
  if(Math.abs(p.x-boss.x)<75&&p.y>boss.y-105&&p.dash<=0&&p.invuln<=0){damage(26,boss.cdir);p.vx=boss.cdir*520;}
  if(boss.x<=MUSA_X0+10||boss.x>=MUSA_X1-10||boss.timer<=0){boss.x=clamp(boss.x,MUSA_X0,MUSA_X1);dust(boss.x+boss.cdir*50,boss.y-40,30,3);sfx('boom',{gain:1,rate:.7});sfx('rock',{gain:1});shake=settings.reduced?0:12;rumble(1,350);musaWindow('dazed',3,'OŠAMUĆEN!');}}
 else if(m==='kneel'&&boss.timer<=0){boss.mode='roar';boss.timer=1.5;fx('roar',boss.x,boss.y);burst(boss.x,boss.y-75,'#cf798e',60,300);}
 else if(m==='roar'&&boss.timer<=0){boss.mode='idle';boss.timer=.8;}
 boss.x=clamp(boss.x,MUSA_X0-20,MUSA_X1+20);}
function musaPose(){const m=boss.mode,story=settings.difficulty==='story';
 if(m==='windup')return{name:'musa-attack',frame:Math.min(2,Math.floor((1-boss.timer/(story?1.3:.95))*3))};
 if(m==='second')return{name:'musa-attack',frame:2};if(m==='swing')return{name:'musa-attack',frame:3};
 if(m==='open')return{name:'musa-attack',frame:4,sy:1+Math.sin(time*7)*.015};
 if(m==='stuck')return{name:'musa-attack',frame:4,dx:Math.sin(time*40)*2,sy:.97};
 if(m==='leapPrep')return{name:'musa-attack',frame:0,sy:.9,sx:1.06};
 if(m==='leap')return{name:'musa-attack',frame:boss.timer>.3?2:3,dy:-(boss.hop||0)};
 if((m==='staggered'||m==='dazed'||m==='kneel')&&rig?.['musa-hurt'])return{name:'musa-hurt',frame:m==='kneel'?3:1+Math.floor(time*3)%2,dy:m==='kneel'?12:0,rot:m==='dazed'?Math.sin(time*3)*.05:0};
 if((m==='charge'||m==='chargePrep')&&rig?.['musa-run'])return{...locomotionPose({...boss,type:'musa'}),rot:boss.face*(m==='charge'?.12:.05),dx:m==='chargePrep'?Math.sin(time*30)*2:0};
 if(boss.hurtT>0&&rig?.['musa-hurt'])return{name:'musa-hurt',frame:Math.min(3,Math.floor((1-boss.hurtT/.34)*4))};
 if(boss.moveT>0&&rig?.['musa-run'])return locomotionPose({...boss,type:'musa'});
 if(rig?.['musa-idle'])return{name:'musa-idle',frame:idleFrame('musa',0),...(m==='roar'?{dx:(Math.random()-.5)*5,sy:1.03}:{})};
 return{name:'cast/musa',frame:0,sy:1+Math.sin(time*2)*.014};}
function drawMusaWindow(){if(!MUSA_OPEN.includes(boss.mode)||!boss.windowMax)return;const k=clamp(boss.timer/boss.windowMax,0,1),x=boss.x,y=boss.y-232,col=k<.3?'#ff8a6a':'#8dffa8';
 ellipse(x,y,31,31,'rgba(6,14,12,.82)');ctx.beginPath();ctx.arc(x,y,27,0,Math.PI*2);ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=6;ctx.stroke();
 ctx.beginPath();ctx.arc(x,y,27,-Math.PI/2,-Math.PI/2+Math.PI*2*k);ctx.strokeStyle=col;ctx.lineWidth=6;ctx.lineCap='round';ctx.stroke();ctx.lineCap='butt';
 gctx.save();gctx.globalAlpha=.3;gctx.beginPath();gctx.arc(x,y,27,-Math.PI/2,-Math.PI/2+Math.PI*2*k);gctx.strokeStyle=col;gctx.lineWidth=5;gctx.stroke();gctx.restore();
 textLabel(boss.timer.toFixed(1),x,y+6,{font:'bold 16px Georgia',color:'#ffffff'});textLabel('UDRI!',x,y+50,{font:'bold 13px Georgia',color:'#e9ffe0',glow:'#4a9a5a'});
 if(boss.combo>1)textLabel(`NIZ ×${boss.combo}`,x,y-44,{font:'bold 15px Georgia',color:boss.combo>=5?'#ffe39a':'#e9ffe0',glow:'#ffcf6a'});
 if(boss.mode==='dazed'||boss.mode==='staggered')for(let s=0;s<3;s++){const a=time*5+s*2.1;textLabel('✦',x+Math.cos(a)*30,boss.y-195+Math.sin(a)*8,{font:'16px Georgia',color:'#fff3c0',glow:'#ffd27a'});}}

// ================= interface: the map of pohodi, title cards, stars, the ledger, embers, sounds =================
const MAP_POS=[[8,84],[18,67],[30,80],[40,62],[34,44],[21,33],[32,19],[46,27],[56,46],[66,31],[77,46],[86,27],[93,52]];
function mapPath(pts){let d=`M${pts[0][0]} ${pts[0][1]}`;for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;d+=` C${p1[0]+(p2[0]-p0[0])/6} ${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6} ${p2[1]-(p3[1]-p1[1])/6} ${p2[0]} ${p2[1]}`;}return d;}
const vistaFile=L=>`assets/world/${L.id}-vista.webp`;
function mapDetail(i){const L=LEVELS[i];if(!L||!$('map-detail'))return;const k=SKILLS.find(k=>k.land===L.id),open=levelOpen(i);
 document.querySelectorAll?.('.map-node.sel').forEach(n=>n.classList.remove('sel'));document.querySelector?.(`.map-node[data-level="${i}"]`)?.classList.add('sel');
 $('map-detail').innerHTML=`<div class="vista" style="background-image:url(${vistaFile(L)})"></div><div class="info"><p class="eyebrow">POHOD ${i+1}${L.id==='rusevine'?' · PENJANJE':''}${CUDA.some(c=>c.land===L.id)?' · ČUDO':''}</p><h3>${L.name}</h3><div class="stars">${starText(L)}<small>pređen · slova МАРКО · čudo iz pesme</small></div>${i===0?'<p><i>Posle megdana Musa ostavi Marka ranjenog. Ravijojla ga vida, a snaga mu se vraća pohod po pohod.</i></p>':''}<p>${LEVEL_INTRO[L.id]||L.design?.goal||''}</p>${k?`<p class="reward">Nagrada: ${k.name} — ${k.text}</p>`:''}${open?`<button class="primary" data-start="${i}">Kreni u pohod <span>→</span></button>`:'<p>🔒 Prvo pređi prethodni pohod.</p>'}</div>`;
 const b=$('map-detail').querySelector?.('[data-start]');if(b)b.onclick=()=>startLevel(i);}
// a title over the road when a pohod or a chapter begins
let titleTimer=null;function showTitle(small,big,line=''){const el=$('title-card');if(!el||!hasDom)return;el.innerHTML=`<small>${small}</small><h1>${big}</h1><i></i>${line?`<p>${line}</p>`:''}`;el.hidden=false;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');clearTimeout(titleTimer);titleTimer=setTimeout(()=>{el.hidden=true;},3300);sfx('horn_call',{gain:.45});}
// the ledger under the menu: how far the journey has gone
function menuLedger(){const el=$('menu-ledger');if(!el)return;const done=LEVELS.filter(L=>levelStars(L).done).length;el.innerHTML=`<button data-go="map"><b>${done}/${LEVELS.length}</b><small>POHODI</small></button><button data-go="riznica"><b>${ownedCuda().size}/${CUDA.length}</b><small>ČUDA</small></button><button data-go="riznica"><b>${(skillCache=null,ownedSkills().size)}/${SKILLS.length}</b><small>VEŠTINE</small></button><button data-go="riznica"><b>${bank()}</b><small>DUKATI</small></button>`;
 el.querySelectorAll?.('[data-go]').forEach(b=>b.onclick=()=>b.dataset.go==='map'?openLevels():openRiznica());menuButtons();menuMarkoStart();}
// embers rising over the menu
function menuEmbers(){fairyDust();const box=document.querySelector?.('#menu .embers');if(!box||box.childElementCount)return;let html='';for(let i=0;i<28;i++){const left=Math.random()*100,dur=7+Math.random()*9,delay=-Math.random()*dur,dx=(Math.random()-.3)*160;html+=`<i style="left:${left}%;animation-duration:${dur}s;animation-delay:${delay}s;--dx:${dx}px"></i>`;}box.innerHTML=html;}
// every button answers with a soft sound
if(hasDom){document.addEventListener('pointerover',e=>{const b=e.target.closest?.('button');if(b&&!b.disabled&&b!==document.__lastHover){document.__lastHover=b;sfx('cloth',{gain:.12,rate:1.9});}});document.addEventListener('click',e=>{const b=e.target.closest?.('button');if(b&&!b.disabled)sfx('ring',{gain:.18,rate:1.7});});}
menuLedger();menuEmbers();

let controlsT=null;function showControls(){const c=$('controls');if(!c?.classList)return;c.classList.remove('faded');clearTimeout(controlsT);controlsT=setTimeout(()=>c.classList.add('faded'),15000);}

// ================= the journey in order: the Kačanik story first, then the pohodi one by one =================
// The story (six chapters) is Marko at full strength. After the duel Musa leaves him wounded; Ravijojla heals him and
// every pohod gives back one skill. The first pohod opens once Musa falls.
const STORY=[
 {img:'sword',what:'Prvi okršaj na drumu. Uči skok, topuz i kretanje uz barjake.'},
 {img:'shield',what:'Kapija i zarobljeni putnici. Odbrana prolaza: tri talasa janičara.'},
 {img:'fairy',what:'Ravijojla budi tri vilinska kamena i gradi mostove preko provalije.'},
 {img:'sarac',what:'Šarac! Galop kroz klisuru i skokovi preko srušenog druma.'},
 {img:'archer',what:'Obruč oko poslednjeg barjaka: opet tri talasa, strelci i oklopnici.'},
 {img:'musa',what:'Megdan sa Musom Kesedžijom i njegova tri srca.'},
];
function storyReached(){try{return Math.max(0,Math.min(5,Number(localStorage.getItem('marko-chapter')||0)));}catch{return 0;}}
function kacanikWon(){try{return localStorage.getItem('marko-kacanik')==='won'||levelsDone().length>0;}catch{return false;}}
function markChapter(n){try{if(n>storyReached())localStorage.setItem('marko-chapter',String(n));}catch{}}
function startChapter(n){start(false);if(n>=4)enterChapter(4);if(n>0&&n!==4)enterChapter(n);if(n===0){const [num,name]=chapters[0].name.split(' · ');showTitle(`POGLAVLJE ${num}`,name.charAt(0)+name.slice(1).toLowerCase(),chapters[0].goal);}}
const STORY_POS=[[9,80],[24,60],[39,74],[54,50],[70,64],[87,38]];
let mapTab=null;
function openLevels(tab){if(typeof tab!=='string')tab=null;mapTab=tab||mapTab||(kacanikWon()?'pohodi':'prica');const v=levelVariant,story=mapTab==='prica';
 const tabs=`<button data-tab="prica" class="${story?'on':''}">Ⅰ · Tri srca Kačanika <small>priča, 6 poglavlja</small></button><button data-tab="pohodi" class="${story?'':'on'}">Ⅱ · Markovi pohodi <small>${kacanikWon()?'13 pohoda':'🔒 posle Muse'}</small></button>`;
 $('level-variants').innerHTML=tabs+(story?'':`<span class="variants">${Object.entries(VARIANTS).map(([k,o])=>`<button data-variant="${k}" class="${k===v?'on':''}">${o.icon} ${o.label}</button>`).join('')}</span>`);
 $('level-variants').querySelectorAll?.('[data-tab]').forEach(b=>b.onclick=()=>openLevels(b.dataset.tab));
 $('level-variants').querySelectorAll?.('[data-variant]').forEach(b=>b.onclick=()=>{levelVariant=b.dataset.variant;try{localStorage.setItem('marko-variant',levelVariant);}catch{}openLevels();});
 $('levels-order').innerHTML=story?'Redosled: <b>poglavlja priče idu jedno za drugim</b> — konj je u IV, talasi u II i V, Musa u VI. Pobeda nad Musom otvara pohode.':'Redosled: <b>pohodi se otvaraju jedan po jedan</b>. Ranjeni Marko posle svakog pređenog pohoda vraća jednu veštinu (piše „Nagrada”).';
 $('level-list').className='pohod-map';
 if(story){const reached=storyReached(),pts=STORY_POS;
  $('level-list').innerHTML=`<div class="map-field story"><div class="map-title">Tri srca Kačanika · drum kroz klisuru</div><svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${mapPath(pts)}" fill="none" stroke="#6a2a1a" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".75"/></svg>`+
   chapters.slice(0,6).map((c,i)=>{const open=i<=reached;return`<button class="map-node chapter ${i<reached||(i===5&&kacanikWon())?'done':''} ${i===reached&&!kacanikWon()?'next':''}" data-chapter="${i}" ${open?'':'disabled'} style="left:${pts[i][0]}%;top:${pts[i][1]}%;background-image:url(assets/cast/${STORY[i].img}.png)" aria-label="${c.name}"><span>${c.name.split(' · ')[0]}</span></button>`;}).join('')+`</div><div class="map-detail" id="map-detail"></div>`;
  $('level-list').querySelectorAll?.('[data-chapter]').forEach(b=>{const i=Number(b.dataset.chapter);b.onclick=()=>startChapter(i);b.onmouseenter=b.onfocus=()=>chapterDetail(i);});
  chapterDetail(Math.min(reached,5));$('levels').hidden=false;return;}
 const pts=LEVELS.map((L,i)=>MAP_POS[i]||[50,50]),next=LEVELS.findIndex((L,i)=>levelOpen(i)&&!levelStars(L).done);
 $('level-list').innerHTML=`<div class="map-field"><div class="map-title">Markovi pohodi · od Kosova do Prilepa</div><svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${mapPath(pts)}" fill="none" stroke="#6a4a1a" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round" vector-effect="non-scaling-stroke" opacity=".75"/></svg>`+
  LEVELS.map((L,i)=>{const open=levelOpen(i),s=levelStars(L);return`<button class="map-node ${s.done?'done':''} ${i===next?'next':''}" data-level="${i}" ${open?'':'disabled'} style="left:${pts[i][0]}%;top:${pts[i][1]}%;background-image:url(${vistaFile(L)})" aria-label="${i+1}. ${L.name}"><span>${i+1}</span>${open?`<em>${starText(L)}</em>`:''}</button>`;}).join('')+`</div><div class="map-detail" id="map-detail"></div>`;
 $('level-list').querySelectorAll?.('[data-level]').forEach(b=>{const i=Number(b.dataset.level);b.onclick=()=>startLevel(i);b.onmouseenter=b.onfocus=()=>mapDetail(i);});
 mapDetail(next>=0?next:0);$('levels').hidden=false;}
function chapterDetail(i){const c=chapters[i],open=i<=storyReached();if(!$('map-detail'))return;
 document.querySelectorAll?.('.map-node.sel').forEach(n=>n.classList.remove('sel'));document.querySelector?.(`.map-node[data-chapter="${i}"]`)?.classList.add('sel');
 $('map-detail').innerHTML=`<div class="vista portrait" style="background-image:url(assets/cast/${STORY[i].img}.png)"></div><div class="info"><p class="eyebrow">PRIČA · POGLAVLJE ${c.name.split(' · ')[0]}</p><h3>${c.name.split(' · ')[1].charAt(0)+c.name.split(' · ')[1].slice(1).toLowerCase()}</h3><p>${STORY[i].what}</p><p class="reward">Cilj: ${c.goal}</p>${open?`<button class="primary" data-play="${i}">${i===storyReached()&&saveState&&!kacanikWon()?'Nastavi priču':'Igraj poglavlje'} <span>→</span></button>`:'<p>🔒 Stigni do ovog poglavlja u priči.</p>'}</div>`;
 const b=$('map-detail').querySelector?.('[data-play]');if(b)b.onclick=()=>{if(i===storyReached()&&saveState&&!kacanikWon())start(true);else startChapter(i);};}

// ================= pack 07: depth — cooldowns and a charge meter, weak points, puzzles, pogo, combos, a fuller land =================
// ---------- abilities on cooldown, shown in a bar at the bottom ----------
const CD={throw:2.5,uvis:1.2,juris:3,plunge:1.1};
const ABILITIES=[
 {id:'bacanje',key:'I',pad:'RB',name:'Bačeni topuz',cd:'throw',icon:'KeyI'},
 {id:'uvis',key:'S+K',pad:'↓+Y',name:'Aperkat',cd:'uvis',icon:'up'},
 {id:'juris',key:'⇧→J',pad:'B→X',name:'Juriš',cd:'juris',icon:'dash'},
 {id:'nadole',key:'S+J',pad:'↓+X',name:'Udar nadole',cd:'plunge',icon:'down'},
 {id:'kolut',key:'⇧',pad:'B',name:'Kolut',cdv:()=>p.dashCooldown/.85,icon:'ShiftLeft'},
 {id:'vihor',key:'F',pad:'L3',name:'Vihor',res:()=>p.rage/SPIN_MIN,icon:'KeyF'},
 {id:'junacki',key:'R',pad:'R3',name:'Junački udar',res:()=>p.rage/100,icon:'KeyR'},
 {id:'vila',key:'E',pad:'RT',name:'Ravijojla',res:()=>p.energy/35,icon:'KeyE'}];
const AB_ICON={up:'<path d="M12 20V6M6 11l6-6 6 6"/><circle cx="12" cy="20" r="2.4" fill="currentColor"/>',dash:'<path d="M3 12h13M12 7l5 5-5 5"/><path d="M4 7h5M4 17h5" opacity=".5"/>',down:'<path d="M12 3v13M6 11l6 6 6-6"/><path d="M5 21h14"/>'};
function cdReady(k){return!(p.cd?.[k]>0);}
function cdStart(k){p.cd??={};p.cd[k]=CD[k]*(k==='juris'&&perks.has('prelomljeno-koplje')?.6:1);}
function cdDenied(k){p.cdFlash=k;p.cdFlashT=.35;sfx('cloth',{gain:.3,rate:.6});}
let abBuilt=false,abTick=0;
function abilityBar(dt){const el=$('abilities');if(!el||!p)return;if(mode!=='play'){el.hidden=true;return;}el.hidden=false;
 if(!abBuilt&&hasDom){abBuilt=true;el.innerHTML=ABILITIES.map(a=>`<div class="ab" data-ab="${a.id}" title="${a.name}"><svg viewBox="0 0 24 24">${AB_ICON[a.icon]||TOUCH_ICONS[a.icon]||''}</svg><i class="cd"></i><b class="key"></b></div>`).join('');}
 if((abTick-=dt)>0)return;abTick=.08;const pad=padIndex!==null;
 for(const a of ABILITIES){const d=el.querySelector?.(`[data-ab="${a.id}"]`);if(!d)continue;const owned=a.id==='uvis'||has(a.id);d.hidden=!owned;if(!owned)continue;
  let left=0,full=true;if(a.cd){left=(p.cd?.[a.cd]||0)/CD[a.cd];}else if(a.cdv){left=clamp(a.cdv(),0,1);}else if(a.res){const r=clamp(a.res(),0,1);left=1-r;full=r>=1;}
  d.style.setProperty('--p',left.toFixed(3));d.classList.toggle('ready',left<=.001&&full);d.classList.toggle('denied',p.cdFlash===(a.cd||a.id)&&p.cdFlashT>0);d.querySelector('.key').textContent=pad?a.pad:a.key;}}
// ---------- the charge meter: three notches over Marko's head while K is held ----------
function drawChargeMeter(){if(!(p.attackKind==='heavy'&&p.attack>0&&p.chargeable&&!p.chargeReleased))return;const k=clamp((p.charge||0)/1.1,0,1),x=p.x,y=p.y-158,full=p.chargeFull;
 ctx.beginPath();ctx.arc(x,y,22,0,Math.PI*2);ctx.fillStyle='rgba(8,10,10,.7)';ctx.fill();
 for(let s=0;s<3;s++){const a0=-Math.PI/2+s*Math.PI*2/3+.08,a1=a0+Math.PI*2/3-.16,fill=clamp(k*3-s,0,1);ctx.beginPath();ctx.arc(x,y,18,a0,a1);ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=6;ctx.stroke();
  if(fill>0){ctx.beginPath();ctx.arc(x,y,18,a0,a0+(a1-a0)*fill);ctx.strokeStyle=full?'#fff2c0':s===0?'#ffd27a':s===1?'#ffa040':'#ff6a2a';ctx.lineWidth=6;ctx.stroke();}}
 textLabel(full?'★':String(Math.min(3,Math.floor(k*3+.0001))),x,y+6,{font:'bold 15px Georgia',color:'#fff3c8'});if(full){halo(x,y,40,'rgba(255,220,140,.7)',.5+.3*Math.sin(time*16));textLabel('PUN ZAMAH · PUSTI K',x,y-34,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ff9a3a'});}}
// ---------- enemies: each has a strength and a weak point (the book of foes, like a hunter's journal) ----------
const FOE_BOOK={
 sword:{name:'Janičar',strong:'Brz, napada u paru i ne štedi.',weak:'Savršeno odbijanje (L): kontra mu nanosi dvostruku štetu.'},
 shield:{name:'Štitonoša',strong:'Štit spreda odbija svaki laki udarac.',weak:'Sporo se okreće: kolutom iza leđa pa udri. Teški udarac, uvis, juriš i Lomilac izbijaju štit.'},
 archer:{name:'Strelac',strong:'Gađa izdaleka, sa kula i stražarnica.',weak:'Odbij strelu (L): sopstvena strela ga obara odmah. Izbliza je slab.'},
 akindzija:{name:'Akindžija',strong:'Brz; izmiče prvom lakom udarcu i skače na tebe izdaleka.',weak:'Posle skoka je zanet: tada su udarci jači za pola. Udar nadole ga obara.'},
 oklopnik:{name:'Oklopnik',strong:'Oklop odbija lake udarce; udar o zemlju lomi gard.',weak:'Teški udarci lome oklop (tri puta). Pun zamah, udar nadole i Lomilac ga skidaju odjednom.'},
 palikuca:{name:'Palikuća',strong:'Baklje pale zemlju; izbliza bljuje vatru.',weak:'Udari ga dok podiže baklju: ispusti je i zapali sebe.'},
 kopljanik:{name:'Kopljanik',strong:'Dugo koplje drži te na odstojanju.',weak:'Uđi mu pod koplje ili ga napadni odozgo — izbliza je spor.'},
 pas:{name:'Ratni pas',strong:'Brz, skače i ujeda.',weak:'Malo izdrži: aperkat (S+K) ga baca u vazduh.'},
 tufekdzija:{name:'Tufekdžija',strong:'Pucanj iz tufeka razbija gard.',weak:'Posle pucnja dugo puni pušku: tada je bez odbrane.'}};
let foeBook=null;function book(){if(foeBook)return foeBook;try{foeBook=JSON.parse(localStorage.getItem('marko-dusmani')||'{}');}catch{foeBook={};}return foeBook;}
function saveBook(){try{localStorage.setItem('marko-dusmani',JSON.stringify(foeBook));}catch{}}
function bookSee(e){const b=book(),t=e.type;if(!FOE_BOOK[t]||e.champion)return;if(!b[t]){b[t]={seen:1,kills:0};saveBook();toast(`Nova stranica u knjizi dušmana: ${FOE_BOOK[t].name}`,3);if(hintT<=0){hintT=7;speak(`${FOE_BOOK[t].name}: ${FOE_BOOK[t].weak}`,6);}}}
function bookKill(e){const b=book();if(!FOE_BOOK[e.type])return;b[e.type]??={seen:1,kills:0};b[e.type].kills++;saveBook();}
function weakHit(text){label(text,p.x+p.face*60,p.y-175,'#ffe39a');sfx('ring',{gain:.6,rate:1.3});hitstop=Math.max(hitstop,.06);}
// called from hitEnemy before damage: returns a damage multiplier, or 0 when the blow is turned aside
function foeDefense(e,heavy){const k=p.attackKind,front=(e.x-p.x)*p.face>0&&e.face!==p.face,breaker=heavy||k==='lomilac'||k==='uvis'||k==='juris';
 if(e.type==='shield'){if(e.guardBroken>0)return 1.35;if(!front){weakHit('S LEĐA!');return 1.6;}if(breaker){e.guardBroken=1.6;e.stun=Math.max(e.stun,1);weakHit('ŠTIT IZBIJEN!');sfx('shield',{gain:1,rate:.7,x:e.x});return .6;}return 1;}
 if(e.type==='oklopnik'){e.armor??=e.champion?5:3;if(e.armor>0){if(k==='light'&&!(e.guardBroken>0))return 0;const smash=(k==='heavy'&&p.chargeFull)||k==='lomilac'||k==='plunge';e.armor=smash?0:e.armor-1;burst(e.x,e.y-80,'#c8ccd2',smash?30:14,220);sfx('clang',{gain:.9,rate:.8,x:e.x});if(e.armor<=0){weakHit('OKLOP PUKAO!');return 1;}label(`OKLOP ${e.armor}`,e.x,e.y-150,'#d8d2c0');return .55;}return 1.25;}
 if(e.type==='akindzija'){if(e.exposed>0){weakHit('ZANET!');return 1.5;}if(k==='light'&&e.grounded&&!e.champion&&(e.dodgeReady??true)&&e.mode!=='windup'&&e.mode!=='recover'&&!(e.stun>0)){e.dodgeReady=false;e.dodgeT=3;e.vx=-e.face*320;e.vy=-220;e.grounded=false;e.air=true;label('IZMAKAO',e.x,e.y-140,'#e8e0c8');sfx('whoosh',{gain:.5,x:e.x});return 0;}return 1;}
 if(e.type==='palikuca'&&e.mode==='windup'&&e.variant==='torch'){e.mode='stun';e.stun=1.4;e.burn=3;addFire(e.x,e.y,2.2,70);weakHit('BAKLJA PALA!');return 1.3;}
 if(e.type==='sword'&&k==='counter'){weakHit('KONTRA!');return 1.6;}
 if(e.type==='tufekdzija'&&e.mode==='recover'){weakHit('PUNI PUŠKU!');return 1.5;}
 if(e.type==='kopljanik'&&(Math.abs(e.x-p.x)<70||!p.grounded)){weakHit('POD KOPLJE!');return 1.4;}
 return 1;}
function updateFoeStates(dt){for(const e of world.enemies){if(!e.alive)continue;if(!e.grounded&&(e.juggle>0||e.spiked||(e.air&&e.stun>0&&!e.climb)))e.tossedT=.45;else if(e.tossedT>0)e.tossedT-=dt;if(e.reactT>0)e.reactT-=dt;if(e.spikeT>0)e.spikeT-=dt;if(e.type==='shield'){if(e.guardBroken>0&&!(e.gbPrev>0))react(e,'shield-guardbreak',.5);e.gbPrev=e.guardBroken;}if(e.type==='oklopnik'){const a=e.armor??(e.champion?5:3);if(e.armorPrev>0&&a<=0)react(e,'oklopnik-armorbreak',.6);e.armorPrev=a;}if(e.type==='akindzija'){if(e.dodgeT>0&&!(e.dodgePrev>0))react(e,'akindzija-backstep',.4);e.dodgePrev=e.dodgeT;}if(e.guardBroken>0)e.guardBroken-=dt;if(e.exposed>0)e.exposed-=dt;if(e.dodgeT>0){e.dodgeT-=dt;if(e.dodgeT<=0)e.dodgeReady=true;}if(e.juggle>0){e.juggle-=dt;if(!e.grounded)e.vy-=1750*.5*dt;}
  if(!e.seenBook&&Math.abs(e.x-p.x)<520&&Math.abs(e.y-p.y)<300){e.seenBook=true;bookSee(e);}}}
// ---------- puzzles ----------
function updatePuzzles(dt){updateKeyDoors();updateTents(dt);
 // a crate that Marko pushes by walking into it
 p.pushing=false;if(p.grounded&&p.wallQ?.push){const q=p.wallQ,dir=p.wallHit,axis=(isDown('KeyD','ArrowRight')?1:0)-(isDown('KeyA','ArrowLeft')?1:0);if(axis===dir){const nx=q.x+dir*115*dt,cx=nx+q.w/2;const blocked=world.platforms.some(o=>o!==q&&o.solid&&!o.off&&nx<o.x+o.w&&nx+q.w>o.x&&q.y<o.y+o.h&&q.y+q.h>o.y+2)||(world.traps||[]).some(t=>t.kind==='plate'&&!(t.open>0)&&nx+q.w>t.gate.x-60&&nx<t.gate.x+40);const under=supportAt(cx,q.y+q.h,4);if(!blocked&&under){q.x=nx;const pl=(world.traps||[]).find(t=>t.kind==='plate'&&Math.abs(cx-(t.x+t.w/2))<12&&Math.abs(q.y+q.h-t.y)<6);if(pl){q.x=pl.x+pl.w/2-q.w/2;q.push=false;q.locked=true;sfx('clang',{gain:.8,rate:.8});sfx('gate',{gain:.7,x:pl.gate.x});dust(q.x+q.w/2,q.y+q.h,14,1.6);shake=settings.reduced?0:4;label('SANDUK JE NA PLOČI',q.x+q.w/2,q.y-30,'#ffe39a');hintT=0;speak('Kapija riznice je otvorena! Stani u nju i pritisni W (gore) da uđeš.',5);}p.x+=dir*115*dt;p.pushing=true;if(Math.random()<.3)dust(q.x+(dir>0?0:q.w),q.y+q.h,1,.6);if((p.pushT=(p.pushT||0)-dt)<=0){p.pushT=.45;sfx('rock',{gain:.25,rate:1.6});}}}}
 for(const t of world.traps||[]){
  if(t.kind==='plate'){const crate=world.platforms.find(q=>(q.push||q.locked)&&q.x+q.w>t.x+10&&q.x<t.x+t.w-10&&Math.abs(q.y+q.h-t.y)<6),man=p.grounded&&Math.abs(p.y-t.y)<4&&p.x>t.x-8&&p.x<t.x+t.w+8,foe=world.enemies.some(e=>e.alive&&e.grounded&&Math.abs(e.y-t.y)<4&&e.x>t.x&&e.x<t.x+t.w);
   const pressed=!!(crate||man||foe);if(pressed&&!t.pressed){sfx('gate',{gain:.6,x:t.gate.x});sfx('rock',{gain:.4,rate:1.4,x:t.x});}t.pressed=pressed;t.open=pressed?1:Math.max(0,(t.open||0)-dt/.35);
   }
  if(t.kind==='lift'){const q=world.platforms.find(q=>q.kind==='lift'&&Math.abs(q.x+q.w/2-t.x)<2);if(!q)continue;t.q=q;q.t+=dt;
   if(q.state==='wait'&&q.t>1){q.state='up';q.t=0;sfx('gate',{gain:.6,x:t.x});}
   if(q.state==='up'){const k=clamp(q.t/2.6,0,1);q.y=Math.round(q.base+(q.top-q.base)*k*k*(3-2*k));if(k>=1){q.state='top';q.t=0;}}
   if(q.state==='top'&&q.t>3.5){q.state='down';q.t=0;}
   if(q.state==='down'){const k=clamp(q.t/2.6,0,1);q.y=Math.round(q.top+(q.base-q.top)*k*k*(3-2*k));if(k>=1){q.state='down-idle';q.t=0;}}
   if(p.on===q&&p.grounded)p.y=q.y;for(const e of world.enemies)if(e.on===q&&e.grounded)e.y=q.y;}}
 for(const q of world.platforms){if(q.kind!=='raft')continue;q.t+=dt;const k=(1-Math.cos(q.t*Math.PI*2/9))/2,nx=q.a+(q.b-q.a)*k,dx=nx-q.x;q.x=nx;if(p.on===q&&p.grounded)p.x+=dx;for(const e of world.enemies)if(e.on===q&&e.grounded)e.x+=dx;}}
function pullLift(){for(const t of world.traps||[]){if(t.kind!=='lift'||!t.q||Math.abs(p.x-t.lever.x)>110||Math.abs(p.y-t.lever.y)>120)continue;const q=t.q;if(q.state==='down'||q.state==='down-idle'){q.state='wait';q.t=0;t.pulled=.6;p.castLock=.4;p.leverT=.5;sfx('ring',{gain:.6});toast('Lift kreće za trenutak — stani na njega!',2);return true;}}return false;}
// the cracked slab gives way under a blow from above
function breakCracked(){const q=p.on;if(!q||q.kind!=='cracked'||q.off)return false;q.off=true;world.platforms=world.platforms.filter(o=>o!==q);sfx('rock',{gain:1,rate:.8});sfx('boom',{gain:.6,rate:1.2});dust(q.x+q.w/2,q.y,24,2.4);burst(q.x+q.w/2,q.y,'#a59a80',30,260,'dust');shake=settings.reduced?0:8;toast('Pod se probio! Ispod je skriven podrum.',2.4);return true;}
// pogo: a blow from above bounces off stakes and off foes
function pogo(){if(p.plunge!==1)return;
 for(const t of world.traps||[]){if(t.kind!=='spikes')continue;if(p.x+10>t.x&&p.x-10<t.x+t.w&&p.y>=t.y-38&&p.y<=t.y+6&&p.vy>0){bounce(t.x+t.w/2>p.x?p.x:p.x,t.y-30,'#ffe6b0');return;}}
 for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;if(Math.abs(e.x-p.x)<42&&p.y>e.y-118&&p.y<e.y-40&&p.vy>0){const amount=40*(p.power||1);e.hp-=amount;e.flash=.15;e.stun=Math.max(e.stun,.8);e.mode='stun';label(Math.round(amount),e.x,e.y-130);blood(e.x,e.y-90,p.face,10);if(e.type==='oklopnik'){e.armor=Math.max(0,(e.armor??3)-1);}if(e.type==='akindzija')weakHit('OBOREN!');if(e.hp<=0)slay(e);bounce(e.x,e.y-110,'#ffd0c0');streakHit(e);return;}}}
function bounce(x,y,color){p.plunge=0;p.vy=-680;p.grounded=false;p.attack=0;p.pogoT=.15;burst(x,y,color,16,200);sfx('clang',{gain:.7,rate:1.3});dust(x,y,6,1);label('ODSKOK',x,y-30,'#fff0c8');rumble(.3,80);}
function drawPuzzles(){if(p?.hang&&p.ledgeT>0)textLabel('W · POPNI SE     S · PUSTI',p.x,p.y-160,{font:'bold 11px Georgia',color:'#fff0c8',glow:'#ffd27a'});for(const t of world.traps||[]){if(t.kind==='keydoor'){drawKeyDoor(t);continue;}if(t.kind==='tent'){drawTent(t);continue;}
 if(t.kind==='plate'){if(t.x>camera+VIEW_W+100||t.x+t.w<camera-100)continue;const down=t.pressed?4:0,im=levelArt[t.pressed?'ploca-pritisak-stisnuta':'ploca-pritisak'];
  if(im){const b=propBounds(im),h=b.h*t.w/b.w;ctx.drawImage(im,b.x,b.y,b.w,b.h,t.x,t.y-h+10,t.w,h);}else{ctx.fillStyle='#4a4640';ctx.fillRect(t.x-4,t.y-2,t.w+8,8);ctx.fillStyle=t.pressed?'#8a7a5a':'#b8a98a';ctx.fillRect(t.x,t.y-10+down,t.w,10-down);line(t.x,t.y-10+down,t.x+t.w,t.y-10+down,'rgba(255,240,200,.6)',2);}
  textLabel('ᛟ',t.x+t.w/2,t.y-12+down,{font:'bold 12px Georgia',color:t.pressed?'#9dffb0':'#e8d6a8',glow:t.pressed?'#4aff8a':null});
  drawVaultDoor(t);
  if(Math.abs(p.x-t.gate.x)<520)textLabel(t.open>0?(t.emptied?'ISPRAŽNJENA':'W · UĐI'):'PLOČA OTVARA VRATA',t.gate.x,t.gate.y-300,{font:'bold 13px Georgia',color:t.open>0?'#d9ffe0':'#fff0c8',glow:t.open>0?'#4aff8a':'#ffd27a'});}
 if(t.kind==='lift'&&t.q){const q=t.q,cx=q.x+q.w/2;line(t.x-20,q.top-150,t.x+150,q.top-150,'#3a2614',12);{const ko=levelArt['kotur'];if(ko){const b=propBounds(ko),k=64/Math.max(b.w,b.h);ctx.drawImage(ko,b.x,b.y,b.w,b.h,cx-b.w*k/2,q.top-150-b.h*k/2,b.w*k,b.h*k);}else{ellipse(cx,q.top-150,18,18,'#6a4426');ellipse(cx,q.top-150,6,6,'#2a1a0c');}}for(const dx of[-44,44])line(cx+dx*.3,q.top-150,cx+dx,q.y,'#5a5a5a',3);
  const la=levelArt['lift-platforma'];if(la){const b=propBounds(la),h=b.h*(q.w+20)/b.w;ctx.drawImage(la,b.x,b.y,b.w,b.h,q.x-10,q.y-h*.55,q.w+20,h);}else{ctx.fillStyle='#7a5530';ctx.fillRect(q.x,q.y,q.w,16);}for(let x=q.x+16;x<q.x+q.w&&!la;x+=24)line(x,q.y+1,x,q.y+15,'rgba(30,20,10,.6)',2);line(q.x,q.y+1,q.x+q.w,q.y+1,'rgba(255,226,170,.5)',2);line(q.x,q.y+16,q.x+q.w,q.y+16,'#3a2614',3);
  const lv=levelArt[q.state==='down'||q.state==='down-idle'?'cilj-poluga':'cilj-poluga-povucena'];if(lv){const b=propBounds(lv),h=110,w=b.w*h/b.h;ctx.drawImage(lv,b.x,b.y,b.w,b.h,t.lever.x-w/2,t.lever.y-h+6,w,h);}
  if((q.state==='down-idle'||q.state==='down')&&Math.abs(p.x-t.lever.x)<260&&q.y===q.base)textLabel('E · POKRENI LIFT',t.lever.x,t.lever.y-130,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
 if(t.kind==='water'){if(t.x>camera+VIEW_W+60||t.x+t.w<camera-60)continue;const y=t.y+46,g=ctx.createLinearGradient(0,y,0,y+200);g.addColorStop(0,'rgba(40,80,90,.92)');g.addColorStop(1,'rgba(6,16,20,1)');ctx.fillStyle=g;ctx.fillRect(t.x,y,t.w,240);for(let k=0;k<3;k++){ctx.beginPath();for(let x=t.x;x<=t.x+t.w;x+=12)ctx.lineTo(x,y+k*14+Math.sin(time*2+x*.05+k)*3);ctx.strokeStyle=`rgba(180,230,230,${.35-k*.1})`;ctx.lineWidth=2;ctx.stroke();}}}
 for(const q of world.platforms){
  if(q.kind==='teret'){const im=levelArt['teret-sanduk']||levelArt['razbi-sanduk']||levelArt['prop-sanduci'];if(im){const b=propBounds(im);ctx.drawImage(im,b.x,b.y,b.w,b.h,q.x-4,q.y-4,q.w+8,q.h+8);if(!levelArt['teret-sanduk']){ctx.fillStyle='rgba(40,44,50,.35)';ctx.fillRect(q.x,q.y,q.w,q.h);for(const y of[q.y+12,q.y+q.h-16])line(q.x,y,q.x+q.w,y,'#3a3c40',5);}}else{ctx.fillStyle='#6a4a2a';ctx.fillRect(q.x,q.y,q.w,q.h);}
   if(!q.locked&&Math.abs(p.x-(q.x+q.w/2))<220&&Math.abs(p.y-(q.y+q.h))<20&&!p.pushing)textLabel('GURAJ →',q.x+q.w/2,q.y-18,{font:'bold 11px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
  if(q.kind==='cracked'&&!q.off){const G=levelGround();if(G){const S=G.S;ctx.save();ctx.beginPath();ctx.rect(q.x,q.y-G.walk*S,q.w,(G.walk+60)*S);ctx.clip();G.pattern.setTransform(new DOMMatrix([S,0,0,S,0,q.y-G.walk*S]));ctx.fillStyle=G.pattern;ctx.fillRect(q.x,q.y-G.walk*S,q.w,(G.walk+60)*S);ctx.restore();}else{ctx.fillStyle='#8a8070';ctx.fillRect(q.x,q.y,q.w,q.h);}
   ctx.strokeStyle='rgba(20,14,10,.85)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(q.x+20,q.y+2);ctx.lineTo(q.x+44,q.y+14);ctx.lineTo(q.x+38,q.y+28);ctx.moveTo(q.x+44,q.y+14);ctx.lineTo(q.x+76,q.y+8);ctx.lineTo(q.x+98,q.y+22);ctx.moveTo(q.x+76,q.y+8);ctx.lineTo(q.x+84,q.y+30);ctx.stroke();{const pa=levelArt['pod-napukao'];if(pa){const b=propBounds(pa),h=b.h*(q.w+16)/b.w;ctx.drawImage(pa,b.x,b.y,b.w,b.h,q.x-8,q.y-h*.6,q.w+16,h);}}}
  if(q.lintel)drawLintel(q);if(q.kind==='raft'){const im=levelArt['splav']||levelArt['prop-balvan'];const bob=Math.sin(time*2+q.x*.01)*2;if(im){const b=propBounds(im);ctx.drawImage(im,b.x,b.y,b.w,b.h,q.x-8,q.y-6+bob,q.w+16,Math.max(26,b.h*(q.w+16)/b.w*.6));}else{ctx.fillStyle='#7a5530';ctx.fillRect(q.x,q.y+bob,q.w,18);}}}}
// ---------- combos ----------
function comboName(text){label(text,p.x,p.y-200,'#ffe39a');sfx('ring',{gain:.7,rate:1.5});}
// J, J, K inside the combo window: the Lomilac — a crushing finisher
function tryLomilac(){if(!has('niz')||!(p.comboWindow>0)||p.combo!==1)return false;p.attack=.56;p.attackKind='lomilac';p.cooldown=.7;p.attackId=++attackSerial;p.charge=0;p.chargeable=false;sound('swing');sayGrunt(true);comboName('LOMILAC!');p.comboWindow=0;return true;}
function airHit(e){if(p.grounded)return;p.vy=Math.min(p.vy,perks.has('sokolovo-pero')?-215:-140);p.airHits=(p.airHits||0)+1;if(e.champion||e.grounded)return;
 if(p.attackKind==='tresak'){e.vy=1150;e.spiked=true;e.tresak=true;e.juggle=0;p.vy=880;comboName('TRESAK!');return;}
 if(p.attackKind==='light'&&p.combo===2){e.vy=850;e.spiked=true;e.juggle=0;label('ZAKUCAN!',e.x,e.y-140,'#ffe39a');return;}
 e.vy=Math.min(e.vy,-170);e.juggle=.9;if(p.airHits===3)comboName('VAZDUŠNI NIZ!');}
function foeSlam(e){e.spiked=false;const dmg=(e.tresak?60:24)*(p.power||1);e.hp-=dmg;e.flash=.15;e.stun=Math.max(e.stun,1);e.mode='stun';label(Math.round(dmg),e.x,e.y-120,'#ffe39a');dust(e.x,e.y,e.tresak?26:14,e.tresak?3:1.8);sfx('boom',{gain:e.tresak?.9:.5,x:e.x});sfx('rock',{gain:.7,x:e.x});shake=settings.reduced?0:e.tresak?9:4;rumble(e.tresak?.8:.4,e.tresak?220:120);
 if(e.tresak){e.tresak=false;for(const o of world.enemies){if(o===e||!o.alive||o.champion||Math.abs(o.x-e.x)>170||Math.abs(o.y-e.y)>60)continue;o.hp-=30;o.stun=Math.max(o.stun,1.2);o.mode='stun';o.vy=-320;o.grounded=false;o.air=true;o.juggle=.5;label(30,o.x,o.y-120);if(o.hp<=0)slay(o);}}
 else if(e.hp>0){e.vy=-260;e.grounded=false;e.air=true;e.juggle=.6;}
 if(e.hp<=0)slay(e,.5);}
// ---------- a fuller land: the artist's props spread along the road, dense like the first six pohodi ----------
const DECOR={selo:['prop-kuca','prop-taraba-ravna','prop-seno','prop-krcag','prop-ambar','prop-cvece','prop-bunar','prop-snopovi','prop-drvo-hrast','prop-ograda-pleter','prop-kola','prop-zbun','prop-susara','prop-taraba-slomljena','prop-bure','prop-dzakovi'],
 klisura:['prop-stena-visoka','prop-trska','prop-stena-luk','prop-zbun','prop-drvo-bukva','prop-stena-mala','prop-paprat','prop-kamen-putokaz','prop-trava'],
 suma:['prop-drvo-hrast','prop-panj','prop-paprat','prop-run-kamen','prop-drvo-bukva','prop-cvece','prop-pecurke','prop-svetiliste','prop-korenje','prop-zbun','prop-drvo-jela'],
 manastir:['prop-ograda-manastir','prop-barjak-manastir','prop-krcag','prop-stub-kameni','prop-cvece','prop-luk-kameni','prop-klupa','prop-svetiljka','prop-zbun'],
 tvrdjava:['prop-palisada','prop-sator','prop-sanduci','prop-katapult','prop-bure','prop-strassarnica','prop-dzakovi','prop-nakovanj','prop-baklja-drzac','prop-ognjiste'],
 prevoj:['prop-drvo-sneg','prop-stena-mala','prop-balvan','prop-drvo-jela','prop-led','prop-stena-visoka','prop-zbun'],
 pecina:['prop-kristal','prop-stena-mala','prop-pecurke','prop-run-kamen','prop-stena-luk','prop-led'],
 podrum:['prop-bure','prop-krcag','prop-sanduci','prop-stol','prop-baklja-drzac','prop-dzakovi','prop-klupa','prop-luk-kameni'],
 mocvara:['prop-trska','prop-korenje','prop-balvan','prop-pecurke','prop-svetiljka','prop-paprat','prop-panj'],
 rudnik:['prop-potpora-rudnik','prop-vagon','prop-sanduci','prop-svetiljka','prop-stena-mala','prop-dzakovi','prop-sine'],
 rusevine:['prop-luk-kameni','prop-ograda-kamen-rusevina','prop-stub-kameni','prop-zbun','prop-vrata-slomljena','prop-paprat'],
 reka:['prop-mlin','prop-trska','prop-dzakovi','prop-tocak-vodeni','prop-cvece','prop-balvan','prop-zbun','prop-kola'],
 oranje:['prop-plast-sena','prop-snopovi','prop-seno','prop-kola-seno','prop-taraba-ravna','prop-kola','prop-zbun','prop-susara']};
const DECOR_H={'prop-kuca':240,'prop-ambar':170,'prop-bunar':170,'prop-kola':120,'prop-taraba-ravna':110,'prop-taraba-slomljena':100,'prop-ograda-pleter':90,'prop-seno':120,'prop-snopovi':90,'prop-krcag':55,'prop-bure':70,'prop-sanduci':80,'prop-dzakovi':60,'prop-drvo-hrast':330,'prop-drvo-bukva':340,'prop-drvo-jela':330,'prop-drvo-sneg':300,'prop-panj':60,'prop-svetiliste':170,'prop-run-kamen':120,'prop-cvece':50,'prop-paprat':60,'prop-pecurke':40,'prop-korenje':130,'prop-zbun':70,'prop-stena-visoka':260,'prop-stena-luk':200,'prop-stena-mala':70,'prop-trska':110,'prop-trava':40,'prop-kamen-putokaz':110,'prop-stub-kameni':220,'prop-luk-kameni':240,'prop-svetiljka':150,'prop-klupa':50,'prop-stol':60,'prop-palisada':150,'prop-sator':190,'prop-strassarnica':260,'prop-kapija-tvrdjava':300,'prop-katapult':150,'prop-nakovanj':50,'prop-baklja-drzac':110,'prop-ognjiste':60,'prop-led':90,'prop-kristal':90,'prop-potpora-rudnik':220,'prop-vagon':90,'prop-sine':40,'prop-mlin':260,'prop-tocak-vodeni':220,'prop-susara':140,'prop-ograda-manastir':110,'prop-barjak-manastir':175,'prop-ograda-kamen-rusevina':110,'prop-vrata-slomljena':150,'prop-balvan':60,'prop-plast-sena':150,'prop-kola-seno':170};
const decorIds=L=>DECOR[L.id]||[];
function decorate(){if(!level||!hasDom)return;const pal=decorIds(level).filter(id=>levelArt[id]);if(!pal.length)return;
 const spans=(world.busy||[]).map(([a,b])=>[a-40,b+40]),trapAt=([a,b])=>(world.traps||[]).some(t=>{const tx=t.x??t.gate?.x??t.lever?.x??0;return tx>=a&&tx<=b;}),rooms=spans.filter(r=>!trapAt(r)),blocked=[...spans.filter(trapAt),...(world.breakables||[]).map(b=>[b.x-b.w,b.x+b.w]),...(world.ladders||[]).map(l=>[l.x-50,l.x+50]),...(world.goals||[]).map(g=>[g.x-130,g.x+130]),...(world.traps||[]).map(t=>{const tx=t.x??t.gate?.x??t.lever?.x??0;return[tx-90,tx+(t.w||0)+90];}),...(world.towers||[]).map(t=>[t.x-130,t.x+130]),[level.goal.x-120,level.goal.x+120],[level.spawn.x-40,level.spawn.x+140]];
 const free=(a,b,h=999)=>!blocked.some(([c,d])=>b>c&&a<d)&&(h<=120||!rooms.some(([c,d])=>b>c&&a<d))&&!placed.some(([c,d])=>b>c-18&&a<d+18);
 const placed=level.props.filter(pr=>levelArt[pr.id]).map(pr=>{const bb=propBounds(levelArt[pr.id]),w=bb.w*pr.height/bb.h;return[pr.x-w/2,pr.x+w/2];});
 let k=0,seed=[...level.id].reduce((a,c)=>a+c.charCodeAt(0),0);const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(const q of world.platforms.filter(q=>q.ground&&!q.tower).sort((a,b)=>a.x-b.x)){let x=q.x+60;while(x<q.x+q.w-60){let put=false;const r=.88+rnd()*.24;for(let j=0;j<pal.length&&!put;j++){const id=pal[(k+j)%pal.length],h=(DECOR_H[id]||120)*r,bb=propBounds(levelArt[id]),w=bb.w*h/bb.h;
   if(x+w>q.x+q.w-30||!free(x,x+w,h)||!clearAbove(x,x+w,h,q))continue;level.props.push({id,x:x+w/2,y:q.y,height:h});placed.push([x,x+w]);k+=j+1;x+=w+70+rnd()*150;put=true;}if(!put)x+=60;}}
 level.props.sort((a,b)=>(DECOR_H[b.id]||120)-(DECOR_H[a.id]||120));}

// ---------- vaults: a plate opens a gate, the gate leads into a vaulted room of treasure ----------
let vaultFade=0;
function vaultDoor(){if(p.vault){const v=p.vault;if(Math.abs(p.x-(v.x0+70))<70&&Math.abs(p.y-v.y)<10){goVault(null);return true;}return false;}
 for(const t of world.traps||[]){if((t.kind!=='plate'&&t.kind!=='keydoor')||Math.abs(p.x-t.gate.x)>70||Math.abs(p.y-t.gate.y)>10)continue;if(t.kind==='keydoor'&&!(t.open>0)){if(!p.key){goalHint('Okovana vrata riznice. Ključ nosi ključar: pobedi ga i uzmi ključ.');return true;}p.key=false;t.open=1;sfx('gate',{gain:.9});sfx('ring',{gain:.6,rate:.8});toast('Vrata riznice su otključana!',2);}if(!(t.open>0))continue;const v=world.vaults?.[t.vault];if(!v)continue;v.from=t;goVault(v);return true;}return false;}
function goVault(v){vaultFade=.5;sfx('gate',{gain:.8});sfx('cloth',{gain:.5});
 if(v){p.vault=v;p.x=v.x0+110;p.y=v.y;p.vx=0;p.vy=0;p.face=1;camFocus=p.y;camY=v.y-532+60;toast('Riznica',1.6);}
 else{const t=p.vault.from,box=p.vault;p.vault=null;p.x=t.gate.x;p.y=t.gate.y;p.vx=0;p.vy=0;camFocus=p.y;camY=Math.min(CAM_Y0+90,p.y-532+60);t.emptied=(world.breakables||[]).every(b=>b.y!==box.y||b.broken||b.opened);}
 p.grounded=true;lastSafe=p.x;lastSafeY=p.y;}
function drawVaults(){for(const v of world.vaults||[]){if(v.x0>camera+VIEW_W+200||v.x0+v.w<camera-200||v.y<camY-200||v.y-500>camY+VIEW_H)continue;
 // the whole view becomes the vault: dark masonry, a vaulted ceiling, torches, the way out
 const P=wallPattern(true),x0=camera-40,y0=camY-40,W2=VIEW_W+80,H2=VIEW_H+80;if(P){P.setTransform(new DOMMatrix([WALL_SCALE,0,0,WALL_SCALE,0,0]));ctx.fillStyle=P;}else ctx.fillStyle='#1c1814';ctx.fillRect(x0,y0,W2,H2);
 const g=ctx.createRadialGradient(v.x0+v.w/2,v.y-160,40,v.x0+v.w/2,v.y-160,v.w*.9);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=g;ctx.fillRect(x0,y0,W2,H2);
 ctx.strokeStyle='rgba(255,226,170,.25)';ctx.lineWidth=5;for(let a=0;a<3;a++){const cx=v.x0+v.w*(a+.5)/3;ctx.beginPath();ctx.arc(cx,v.y-250,v.w/6,Math.PI,0);ctx.stroke();line(cx-v.w/6,v.y-250,cx-v.w/6,v.y,'rgba(0,0,0,.35)',10);}
 const torch=levelArt['prop-baklja-drzac'];for(const tx of[v.x0+40,v.x0+v.w-40]){if(torch){const b=propBounds(torch),h=110,w=b.w*h/b.h;ctx.drawImage(torch,b.x,b.y,b.w,b.h,tx-w/2,v.y-260,w,h);}drawFlame(tx,v.y-240,22,40,tx,.9);halo(tx,v.y-230,140,'rgba(255,170,80,.35)',.6+.15*Math.sin(time*7+tx));}
 const door=v.x0+70;ctx.fillStyle='#0a0806';ctx.beginPath();ctx.moveTo(door-38,v.y);ctx.lineTo(door-38,v.y-110);ctx.quadraticCurveTo(door,v.y-150,door+38,v.y-110);ctx.lineTo(door+38,v.y);ctx.fill();ctx.strokeStyle='#c9a46a';ctx.lineWidth=3;ctx.stroke();
 if(p.vault===v&&Math.abs(p.x-door)<90)textLabel('W · IZAĐI',door,v.y-165,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});
 ctx.fillStyle='#3a2e22';ctx.fillRect(v.x0-90,v.y,v.w+180,18);line(v.x0-90,v.y+1,v.x0+v.w+90,v.y+1,'rgba(255,226,170,.4)',2);}}

// ================= gates seen from the side: the road runs left to right through a gatehouse =================
// A tower block stands over the road with a passage through its foot; a narrow iron (or timber) grate hangs in the middle of
// the passage and slides up into the wall when the gate opens. Codex's profile drawings replace it once they exist.
const GATE_STYLE={rudnik:'rudnik',selo:'drvo',suma:'drvo',mocvara:'drvo',reka:'drvo',oranje:'drvo'};
const gateStyle=()=>GATE_STYLE[level?.id]||'kamen';
const gateOpenK=new Map();
function drawSideGate(key,x,y,open,style=gateStyle()){const k0=gateOpenK.get(key)??(open?1:0),k=k0+((open?1:0)-k0)*.12;gateOpenK.set(key,k);if(x<camera-260||x>camera+VIEW_W+260)return;
 const art=levelArt[`prolaz-${style}-otvoren`]||levelArt['prolaz-kamen-otvoren'];
 if(art){gateBack(x,y);gateFronts.push({art,x,y,k});return;}
 const W2=150,top=y-330,pass=y-176,x0=x-W2/2,wood=style==='drvo',mine=style==='rudnik';
 // the passage: the far wall of the tunnel, dark
 fillWall(x0,pass,W2,176,true);const d=ctx.createLinearGradient(0,pass,0,y);d.addColorStop(0,'rgba(0,0,0,.65)');d.addColorStop(1,'rgba(0,0,0,.3)');ctx.fillStyle=d;ctx.fillRect(x0,pass,W2,176);
 if(mine){for(const px of[x0+6,x0+W2-22])line(px+8,pass,px+8,y,'#4a3020',16);line(x0,pass+6,x0+W2,pass+6,'#4a3020',14);line(x0,pass+3,x0+W2,pass+3,'#8a6238',3);}
 else{// the gatehouse above the passage
  if(wood){for(let lx=x0;lx<x0+W2;lx+=19){const g=ctx.createLinearGradient(lx,0,lx+19,0);g.addColorStop(0,'#5a3c20');g.addColorStop(.5,'#9a6c3a');g.addColorStop(1,'#4a3018');ctx.fillStyle=g;ctx.fillRect(lx,top,19,pass-top);poly([[lx,top],[lx+9.5,top-14],[lx+19,top]],'#8a6238','#3a2412');}line(x0,pass-10,x0+W2,pass-10,'#3a2412',10);line(x0,top+30,x0+W2,top+30,'#3a2412',8);}
  else{fillWall(x0,top,W2,pass-top);shadeBlock(x0,top,W2,pass-top);for(let mx=x0;mx<x0+W2;mx+=30){fillWall(mx,top-18,18,18);}line(x0,pass,x0+W2,pass,'rgba(255,236,196,.35)',3);ctx.fillStyle='rgba(8,8,10,.8)';ctx.fillRect(x-4,top+40,8,30);}}
 // the grate: a narrow lattice of bars with spikes, lifting into the wall
 const gh=176,lift=k*(gh-14),gy0=pass-lift,iron=!wood;ctx.save();ctx.beginPath();ctx.rect(x-20,pass-4,40,gh+8);ctx.clip();
 for(const bx of[-12,0,12]){line(x+bx,gy0-20,x+bx,gy0+gh-6,iron?'#2a2c30':'#3a2412',iron?5:7);line(x+bx-1,gy0-20,x+bx-1,gy0+gh-6,iron?'#8a8e96':'#9a6c3a',1.5);poly([[x+bx-4,gy0+gh-8],[x+bx,gy0+gh+2],[x+bx+4,gy0+gh-8]],iron?'#8a8e96':'#9a6c3a');}
 for(let yy=gy0+18;yy<gy0+gh-10;yy+=34)line(x-16,yy,x+16,yy,iron?'#2a2c30':'#3a2412',iron?4:6);ctx.restore();
 // the posts at either end of the passage, in front of the tunnel
 if(!mine)for(const px of[x0,x0+W2-14]){fillWall(px,pass,14,176);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(px,pass,14,176);}
 plantFoot(x0,W2,y);}
// the vault: a stone facade facing us, with a heavy door — here one really goes in
function drawVaultDoor(t){const x=t.gate.x,y=t.gate.y;if(x<camera-260||x>camera+VIEW_W+260)return;{const UA=levelArt['ulaz-riznica'];if(UA){drawRiznicaFacade(t,UA);return;}}const W2=210,H2=250,x0=x-W2/2,top=y-H2,open=t.open>0;
 fillWall(x0,top,W2,H2+4);shadeBlock(x0,top,W2,H2+4,y);for(let mx=x0-6;mx<x0+W2;mx+=30){fillWall(mx,top-20,20,20);}line(x0-6,top,x0+W2+6,top,'rgba(255,236,196,.35)',3);
 const dw=78,dh=128,dx=x-dw/2,dy=y-dh,door=levelArt[open?'vrata-otkljucana':'vrata-zakljucana'];
 ctx.fillStyle=open?'#2a1608':'#0e0806';ctx.beginPath();ctx.moveTo(dx,y);ctx.lineTo(dx,dy+22);ctx.quadraticCurveTo(x,dy-14,dx+dw,dy+22);ctx.lineTo(dx+dw,y);ctx.fill();
 if(open)halo(x,y-60,90,'rgba(255,170,80,.55)',.6+.15*Math.sin(time*6));
 if(door){const b=propBounds(door),s=(dh+16)/b.h,w=b.w*s;ctx.drawImage(door,b.x,b.y,b.w,b.h,x-w/2,y-dh-14,w,dh+16);}
 else if(!open){ctx.fillStyle='#5a3a20';ctx.fillRect(dx+4,dy+20,dw-8,dh-20);for(const yy of[dy+44,dy+92])line(dx+4,yy,dx+dw-4,yy,'#2a2c30',5);}
 ctx.strokeStyle='#c9a46a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(dx,y);ctx.lineTo(dx,dy+22);ctx.quadraticCurveTo(x,dy-14,dx+dw,dy+22);ctx.lineTo(dx+dw,y);ctx.stroke();
 textLabel('РИЗНИЦА',x,top+28,{font:'bold 14px Georgia',color:'#f3dca0',glow:'#8a6a2c'});plantFoot(x0,W2,y);}

if(hasDom)for(const id of['zid-kamen','vrata-zakljucana','vrata-otkljucana'])if(!levelArt[id])loadImage(`assets/world/${id}.webp`).then(im=>{if(im&&!levelArt[id])levelArt[id]=im;});

// on Junak and Epski a share of the janissaries come in pairs
function addPartners(){const ex=D().extra;if(!ex)return;const add=[];for(const e of world.enemies){if(e.perch||e.champion||e.partner)continue;if(((e.id*37)%100)/100<ex){const t=['sword','shield','archer','akindzija'][(e.id*7)%4],hp=({shield:125,archer:65,akindzija:80})[t]||90;add.push({...e,id:e.id+30000,type:t,x:e.x+(e.id%2?95:-95),hp,maxHp:hp,partner:true,timer:e.timer+.5,hardened:false,elite:false});}}world.enemies.push(...add);}

// a powder keg goes up: it hurts everyone near, Marko too
function blowKeg(b){sfx('boom',{gain:1,rate:.8,x:b.x});shake=settings.reduced?0:12;rumble(.9,300);fx('flash','#ffcf8a',.12);burst(b.x,b.y-30,'#ff9a3a',50,320);addFire(b.x,b.y,2,120);
 for(const e of world.enemies){if(!e.alive||Math.abs(e.x-b.x)>170||Math.abs(e.y-b.y)>110)continue;const d=e.champion?60:90;e.hp-=d;e.stun=Math.max(e.stun,1.2);e.mode='stun';if(!e.champion){e.vx=Math.sign(e.x-b.x||1)*380;e.vy=-360;e.grounded=false;e.air=true;}label(d,e.x,e.y-120,'#ffb06a');if(e.hp<=0)slay(e,.8);}
 if(Math.abs(p.x-b.x)<150&&Math.abs(p.y-b.y)<110)hurtBy(22,Math.sign(p.x-b.x)||1,-420);
 for(const o of world.breakables||[])if(o!==b&&!o.broken&&!o.opened&&Math.abs(o.x-b.x)<170&&Math.abs(o.y-b.y)<60)hitCrate(o,9);}

// ---------- heart pieces, lore scrolls, treasury keys ----------
const ZAPISI={
 selo:'Pod Prilepom pričaju: mladi Marko napojio je vilu u žegi, a vila mu za uzvrat dade snagu kakvu niko nema.',
 klisura:'Šarac je pio vino iz istog kabla s Markom; zato ga, kažu, nijedan konj nije stizao kroz klisuru.',
 suma:'Orao je Marku čuvao san u gori, raširenih krila nad njim, jer ga je Marko nekad spasao od žeđi.',
 manastir:'Marko je krunu presudio Urošu po pravdi, iako je znao da će se otac Vukašin razgneviti.',
 tvrdjava:'Po zlatnim balčacima Marko je prepoznao očevu sablju na tuđem pojasu i tražio račun za oca.',
 prevoj:'Musa Kesedžija je zatvorio drumove i primorje; samo je Marko smeo da izađe pred njega.',
 pecina:'Vila Ravijojla bila je Markova posestrima; kad ga savlada muka, dozove je i ona doleti.',
 podrum:'Marko je za ramazan pio vino javno; kad su ga tužili caru, reče da mu stare rane traže vina.',
 mocvara:'Dok je Marko ležao ranjen kraj druma, soko mu je doneo vode u kljunu i krilom mu pravio hlad.',
 rudnik:'Pred smrt Marko ostavi tri kese dukata: za onoga ko ga sahrani, za crkve i za sirotinju.',
 rusevine:'Arapin je od svake svadbe uzimao danak, dok nije došao Marko i ukinuo svadbarinu.',
 reka:'Na Urvini, kažu, Marko prelomi koplje na sedam komada, da ne padne u turske ruke.',
 oranje:'Majka reče Marku da ostavi boj i ore; Marko zaora drumove, a turske rale vrati odakle su došle.',
};
const RELIC_ART={srce:'predmet-srce-deo',zapis:'predmet-zapis',kljuc:'predmet-kljuc'};
const SLIDE_TIME=.5,KICK_TIME=.36;
function storedSet(k){try{return new Set(JSON.parse(localStorage.getItem(k)||'[]'));}catch{return new Set();}}
function keepSet(k,set){try{localStorage.setItem(k,JSON.stringify([...set]));}catch{}}
// every four heart pieces make a whole heart: +20 health in the pohodi
function applyHearts(){const hs=storedSet('marko-srca'),zs=storedSet('marko-zapisi');p.maxHp+=Math.floor(hs.size/4)*20;p.hp=p.maxHp;
 for(const it of world.items){if(it.type==='srce'&&hs.has(it.land))it.taken=true;if(it.type==='zapis'&&zs.has(it.land))it.taken=true;}}
function takeHeart(i){reachDown();const hs=storedSet('marko-srca');hs.add(i.land);keepSet('marko-srca',hs);const n=hs.size;burst(i.x,i.y,'#ff9a8a',40,220);sfx('magic_big',{gain:.8});sfx('ring',{gain:.6,rate:1.3});fx('pillar',i.x,i.y+40);
 if(n%4===0){p.maxHp+=20;p.hp=p.maxHp;label('CELO SRCE!',i.x,i.y-30,'#ffb0a0');toast(`Celo srce! Maksimalno zdravlje +20 (srca: ${n/4})`,4);}
 else{label(`DEO SRCA ${n%4}/4`,i.x,i.y-30,'#ffb0a0');toast(`Deo srca ${n%4}/4 · četiri dela daju celo srce`,3.5);}}
function takeZapis(i){reachDown();const zs=storedSet('marko-zapisi');zs.add(i.land);keepSet('marko-zapisi',zs);sfx('cloth',{gain:.7});sfx('ring',{gain:.5,rate:.9});burst(i.x,i.y,'#f3dca0',24,160);label('ZAPIS',i.x,i.y-30,'#fff0c8');
 const t=ZAPISI[i.land];if(t)speak(t,9);toast(`Zapisi: ${zs.size}/${Object.keys(ZAPISI).length} · čitaju se u riznici`,3);}
function takeKey(i){reachDown();p.key=true;sfx('ring',{gain:.8,rate:1.5});sfx('coins',{gain:.4});burst(i.x,i.y,'#ffe39a',20,160);label('KLJUČ',i.x,i.y-30,'#ffe6a0');toast('Ključ riznice! Kod okovanih vrata pritisni W.',3);}
function drawRelicItem(i){const yy=i.y+Math.sin(time*2.6+i.id)*5,art=levelArt[RELIC_ART[i.type]];
 halo(i.x,yy,i.type==='srce'?48:38,i.type==='srce'?'rgba(255,130,110,.6)':'rgba(255,220,140,.55)',.7+.2*Math.sin(time*4+i.id));
 if(art){const b=propBounds(art),k=(i.type==='zapis'?62:i.type==='kljuc'?58:46)/Math.max(b.w,b.h);ctx.drawImage(art,b.x,b.y,b.w,b.h,i.x-b.w*k/2,yy-b.h*k/2,b.w*k,b.h*k);}
 else ellipse(i.x,yy,12,12,i.type==='srce'?'#d94a3a':'#d8b46a');
 if(Math.abs(p.x-i.x)<300)textLabel(i.type==='srce'?'DEO SRCA':i.type==='zapis'?'ZAPIS':'KLJUČ',i.x,yy-36,{font:'bold 11px Georgia',color:'#fff0c8',glow:i.type==='srce'?'#ff7a6a':'#ffd27a'});
 emitters.push({id:'rel'+i.id,kind:'item',x:i.x,y:yy,rate:8});}
// the keeper carries the key; it falls where he falls (or by the door if he fell into the dark)
function dropKey(e){const t=(world.traps||[]).find(t=>t.kind==='keydoor'&&t.holder===e.id);if(!t||t.keyOut)return;t.keyOut=true;const lost=e.y>t.y+120||Math.abs(e.x-t.x)>900;
 world.items.push({id:9800+t.x%97,x:lost?t.keeper.x:e.x,y:(lost?t.y:e.y)-40,type:'kljuc',taken:false});if(!lost)label('KLJUČ!',e.x,e.y-150,'#ffe39a');}
function updateKeyDoors(){for(const t of world.traps||[]){if(t.kind!=='keydoor'||t.keyOut)continue;const h=world.enemies.find(e=>e.id===t.holder);if(!h||!h.alive)dropKey(h||{id:t.holder,x:t.keeper.x,y:t.y});}}
function drawKeyDoor(t){const h=world.enemies.find(e=>e.id===t.holder&&e.alive);
 if(h&&h.x>camera-100&&h.x<camera+VIEW_W+100){const im=levelArt['predmet-kljuc'],yy=h.y-150*(h.scale||1)+Math.sin(time*4)*4;halo(h.x,yy,26,'rgba(255,215,120,.5)');
  if(im){const b=propBounds(im),k=46/Math.max(b.w,b.h);ctx.drawImage(im,b.x,b.y,b.w,b.h,h.x-b.w*k/2,yy-b.h*k/2,b.w*k,b.h*k);}textLabel('KLJUČAR',h.x,yy-22,{font:'bold 10px Georgia',color:'#ffe6a0',glow:'#8a6a2c'});}
 if(t.x<camera-320||t.x>camera+VIEW_W+320)return;drawVaultDoor(t);
 if(Math.abs(p.x-t.x)<520)textLabel(t.open>0?(t.emptied?'ISPRAŽNJENA':'W · UĐI'):p.key?'W · OTKLJUČAJ':'OKOVANA VRATA · KLJUČ NOSI KLJUČAR',t.x,t.y-330,{font:'bold 13px Georgia',color:t.open>0||p.key?'#d9ffe0':'#fff0c8',glow:t.open>0||p.key?'#4aff8a':'#ffd27a'});}
// the treasury tower seen from the front: one really goes in through its door
function drawRiznicaFacade(t,im){const OPEN=t.open>0&&levelArt['ulaz-riznica-otvoren'];if(OPEN){const x=t.gate.x,y=t.gate.y,b=propBounds(OPEN),H=300,s=H/b.h,w=b.w*s;ctx.drawImage(OPEN,b.x,b.y,b.w,b.h,x-w/2,y-H+6,w,H);halo(x,y-70,90,'rgba(255,170,80,.45)',.55+.15*Math.sin(time*6));plantFoot(x-w/2+20,w-40,y);return;}const x=t.gate.x,y=t.gate.y,b=propBounds(im),H=300,s=H/b.h,w=b.w*s,x0=x-w/2,y0=y-H+6;ctx.drawImage(im,b.x,b.y,b.w,b.h,x0,y0,w,H);
 if(t.open>0){const dx0=x0+(390-b.x)*s,dx1=x0+(636-b.x)*s,top=y0+(612-b.y)*s,bot=y0+(1012-b.y)*s,cx=(dx0+dx1)/2,r=(dx1-dx0)/2;ctx.save();ctx.beginPath();ctx.moveTo(dx0,bot);ctx.lineTo(dx0,top+r);ctx.arc(cx,top+r,r,Math.PI,0);ctx.lineTo(dx1,bot);ctx.closePath();
  const g=ctx.createLinearGradient(0,top,0,bot);g.addColorStop(0,'#120a05');g.addColorStop(1,'#4a260c');ctx.fillStyle=g;ctx.fill();ctx.restore();halo(cx,bot-50,80,'rgba(255,170,80,.55)',.6+.15*Math.sin(time*6));
  const door=levelArt['vrata-otkljucana'];if(door){const db=propBounds(door);ctx.save();ctx.globalAlpha=.9;ctx.drawImage(door,db.x,db.y,db.w,db.h,dx0-r*.35,top-r*.25,(dx1-dx0)+r*.7,bot-top+r*.25);ctx.restore();}}
 plantFoot(x0+20,w-40,y);}
// the cracked wall
function drawCrackWall(b,wob){const x0=b.x-b.w/2+wob,y0=b.y-b.h;fillWall(x0,y0,b.w,b.h);shadeBlock(x0,y0,b.w,b.h,b.y);line(x0,y0+1,x0+b.w,y0+1,'rgba(255,236,196,.35)',3);
 const im=levelArt['zid-napukao'],dmg=1-b.hp/(b.hp0||4);if(im){const bb=propBounds(im);ctx.save();ctx.beginPath();ctx.rect(x0,y0,b.w,b.h);ctx.clip();ctx.globalAlpha=.75+.25*dmg;ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,x0-16,y0+10,b.w+32,b.h-20);
  if(dmg>0){ctx.translate(b.x+wob,y0+b.h*.55);ctx.rotate(Math.PI);ctx.drawImage(im,bb.x,bb.y,bb.w,bb.h,-b.w/2-10,-b.h*.4,b.w+20,b.h*.8);}ctx.restore();}
 else{ctx.strokeStyle='rgba(20,14,10,.85)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0+18,y0+30);ctx.lineTo(x0+40,y0+80);ctx.lineTo(x0+26,y0+130);ctx.moveTo(x0+40,y0+80);ctx.lineTo(x0+60,y0+110);ctx.stroke();}
 if(b.flash>0){ctx.fillStyle=`rgba(255,240,200,${Math.min(.5,b.flash*3)})`;ctx.fillRect(x0,y0,b.w,b.h);}
 if(Math.abs(p.x-b.x)<420&&Math.abs(p.y-b.y)<170)textLabel('NAPUKAO ZID · K',b.x,y0-16,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
function wallClang(b){b.shake=.12;b.flash=.06;sfx('clang',{gain:.7,x:b.x});dust(b.x-p.face*b.w/2,p.y-60,4,.8);label('SAMO TEŠKI UDARAC (K)',b.x,b.y-b.h-40,'#d8d2c0');}
function wallFalls(b){sfx('rock',{gain:1,rate:.7,x:b.x});sfx('boom',{gain:.6,rate:1.1,x:b.x});dust(b.x,b.y,22,2.6);burst(b.x,b.y-b.h/2,'#a59a80',40,280,'dust');shake=settings.reduced?0:7;rumble(.6,160);label('ZID JE PAO!',b.x,b.y-b.h-20,'#ffe39a');}
// ---------- Marko's new moves: slide (S while running), kick (S+K), hanging from a ledge ----------
function moveExtras(dt){if(p.ledgeCool>0)p.ledgeCool-=dt;markoFlow(dt);if(p.leverT>0)p.leverT-=dt;if(p.turnT>0)p.turnT-=dt;if(p.runStartT>0)p.runStartT-=dt;if(p.lastFace&&p.face!==p.lastFace&&p.grounded&&p.attack<=0&&!horseMounted&&!(p.slide>0)&&!p.blocking)p.turnT=TURN_TIME;p.lastFace=p.face;{const mv=p.grounded&&Math.abs(p.vx)>35;if(mv&&!p.wasMoving&&p.attack<=0&&!(p.turnT>0)&&!p.crouching&&!p.blocking)p.runStartT=RUNSTART_TIME;p.wasMoving=mv;}if(p.kickCd>0)p.kickCd-=dt;if(!level||horseMounted)return;
 if(!(p.slide>0)&&p.grounded&&p.attack<=0&&p.dash<=0&&!(p.down>0)&&!p.climb&&!(p.kick>0)&&Math.abs(p.vx)>200&&tap('KeyS','ArrowDown')&&!isDown('Space')){
  p.slide=SLIDE_TIME;p.slideDir=Math.sign(p.vx);p.slideHit=new Set();p.invuln=Math.max(p.invuln,.22);sfx('whoosh',{gain:.5,rate:.7});sfx('cloth',{gain:.5});dust(p.x,p.y,10,1.6);}
 if(p.slide>0){p.slide-=dt;if(!p.grounded||p.down>0)p.slide=0;else{p.vx=p.slideDir*(250+330*p.slide/SLIDE_TIME);p.face=p.slideDir;p.crouching=false;p.h=60;if(lowCeiling())p.crouch=1;if(Math.random()<.4)dust(p.x-p.slideDir*20,p.y,1,.8);
  for(const e of world.enemies){if(!e.alive||e.zone!==zone||e.champion||p.slideHit.has(e)||Math.abs(e.x-p.x)>48||Math.abs(e.y-p.y)>30)continue;p.slideHit.add(e);
   if(e.type==='oklopnik'&&(e.armor??3)>0){label('PRETEŽAK',e.x,e.y-130,'#d8d2c0');p.slide=Math.min(p.slide,.05);continue;}
   e.hp-=10;e.stun=Math.max(e.stun,1.1);e.mode='stun';e.vy=-300;e.vx=p.slideDir*60;e.grounded=false;e.air=true;e.climb=null;e.juggle=.35;e.flash=.12;label('PODSEČEN!',e.x,e.y-130,'#ffe39a');sfx('hit',{gain:.6,x:e.x});dust(e.x,e.y,8,1.2);if(e.hp<=0)slay(e);}}}
 if(p.grounded&&!(p.kick>0)&&!(p.kickCd>0)&&p.attack<=0&&p.dash<=0&&!(p.slide>0)&&!(p.down>0)&&isDown('KeyS','ArrowDown')&&tap('KeyJ')){p.kick=KICK_TIME;p.kickCd=.75;p.kickDone=false;sound('swing');sayGrunt(true);}
 if(p.kick>0){p.kick-=dt;p.vx*=.6;if(!p.kickDone&&p.kick<KICK_TIME*.55){p.kickDone=true;kickHit();}if(p.kick<=0)p.kick=0;}}
// the kick: knocks a shield aside, shoves a foe back (off a ledge, if one is there), breaks crates
function kickHit(){const reach=105;let any=false;
 for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;const dx=e.x-p.x;if(dx*p.face< -10||Math.abs(dx)>reach||Math.abs(e.y-p.y)>80)continue;any=true;e.flash=.12;
  if(e.champion){const d=14*(p.power||1);e.hp-=d;e.stun=Math.max(e.stun,.3);label(Math.round(d),e.x,e.y-120);if(e.hp<=0)slay(e);continue;}
  if(e.type==='shield'){e.guardBroken=1.8;label('ŠTIT ODBIJEN!',e.x,e.y-140,'#ffe39a');sfx('shield',{gain:.9,x:e.x});}else label('ŠUT!',e.x,e.y-130,'#ffe39a');
  e.hp-=12*(p.power||1);e.stun=Math.max(e.stun,.9);e.mode='stun';e.hurtT=.3;
  if(!(e.type==='oklopnik'&&(e.armor??3)>0)){e.vx=p.face*340;e.vy=-200;e.grounded=false;e.air=true;e.climb=null;e.knock=p.face*10;}
  if(e.hp<=0)slay(e,.6);}
 for(const b of world.breakables||[]){if(b.broken||b.opened||b.kind==='zid'||Math.abs(b.y-p.y)>60)continue;const dx=b.x-p.x;if(dx*p.face>-10&&Math.abs(dx)<reach+b.w/2){hitCrate(b,1);any=true;}}
 if(any){sfx('hit_heavy',{gain:.7});hitstop=.03;shake=settings.reduced?0:3;rumble(.35,90);}}
// hanging from a ledge (Prince of Persia): toward the wall, W or Space climbs; S or away lets go
function hangUpdate(){const L=p.ledge;if(!L){p.hang=false;return false;}p.x=L.x0;p.y=L.y0;p.vx=0;p.vy=0;p.grounded=false;p.ledgeT=LEDGE_TIME;
 const down=(...c)=>c.some(k=>keys.has(k)),hit=(...c)=>c.some(k=>pressed.has(k));
 if(down(p.face>0?'KeyD':'KeyA',p.face>0?'ArrowRight':'ArrowLeft','KeyW','ArrowUp')||hit('Space')){p.hang=false;sfx('cloth',{gain:.5});return false;}
 if(down('KeyS','ArrowDown',p.face>0?'KeyA':'KeyD',p.face>0?'ArrowLeft':'ArrowRight')){p.hang=false;p.ledgeT=0;p.ledge=null;p.vy=40;p.x=L.x0-p.face*8;p.ledgeCool=.45;return true;}
 return true;}

function attackFrame(phase,o){const n=rig?.[o.name]?.frames.length||6;o.frame=Math.min(n-1,Math.floor(phase*n));return o;}
// dev only: open the game with ?dev to reach the pohodi from the console
if(typeof location!=='undefined'&&/[?&]dev\b/.test(location.search))window.markoDev={startLevel,LEVELS,layoutAudit,get p(){return p;},get world(){return world;}};

// ---------- idle, dizziness, voice ----------
const IDLE_SEQ=[0,6,5,7,5,6,0,1],IDLE_FPS=4,DIZZY_TIME=.9;
let lastGrunt=-99,gruntCount=0;
function spinDizzy(){if(p.spin<.4||horseMounted)return;p.dizzy=DIZZY_TIME;p.attack=0;p.blocking=false;p.crouching=false;sfx('whoosh',{gain:.3,rate:.55});label('VRTI MU SE U GLAVI',p.x,p.y-165,'#ffe39a');}
function fallDizzy(){p.down=DOWN_TIME;p.vx=0;p.attack=0;dust(p.x,p.y,12,1.8);sfx('fall',{gain:.7});sfx('cloth',{gain:.5});shake=settings.reduced?0:3;}
function drawDizzy(){for(let k=0;k<3;k++){const a=time*5+k*2.094,x=p.x+Math.cos(a)*24,y=p.y-146+Math.sin(a)*6;if(Math.sin(a)<-.2)continue;textLabel('★',x,y,{font:'bold 13px Georgia',color:'#ffe39a',glow:'#ffb030'});}}

// ---------- turning, first step, reactions ----------
const TURN_TIME=.16,RUNSTART_TIME=.18;
function react(e,name,d){if(!rig?.[name])return;e.react=name;e.reactT=e.reactDur=d;}

// ---------- Turkish tents: Ottomans come out while Marko is near; blows tear the tent down ----------
const TENT_WAVES=3;let tentSerial=0;
function updateTents(dt){for(const t of world.traps||[]){if(t.kind!=='tent'||t.down)continue;t.flap=Math.max(0,t.flap-dt);t.shake=Math.max(0,t.shake-dt);const dx=t.x-p.x;
 if(attackActive()&&t.hitId!==p.attackId&&Math.abs(dx)<135&&dx*p.face>-30&&Math.abs(p.y-t.y)<90){t.hitId=p.attackId;t.hp-=p.attackKind==='light'?1:2;t.shake=.2;sfx('cloth',{gain:.8,x:t.x});dust(t.x-p.face*30,t.y-70,6,1);if(t.hp<=0){tentDown(t);continue;}}
 if(Math.abs(dx)>720||Math.abs(p.y-t.y)>260||t.wave>=TENT_WAVES)continue;t.out=t.out.filter(e=>e.alive);if(t.out.length>=2)continue;t.cool-=dt;if(t.cool>0)continue;
 t.cool=3.2;t.wave++;t.flap=.7;const n=t.wave===TENT_WAVES?2:1;for(let k=0;k<n;k++)t.out.push(tentFoe(t,k));sfx('cloth',{gain:.9,x:t.x});say('tr_attack',{chance:.6,x:t.x});}}
function tentFoe(t,k){const pool=[...new Set(world.enemies.filter(e=>!e.champion&&!e.perch&&!['pas','archer','tufekdzija'].includes(e.type)).map(e=>e.type))],ty=pool.length?pool[(t.wave+k)%pool.length]:'sword',hp=({shield:125,oklopnik:200,kopljanik:100,akindzija:80,palikuca:90})[ty]||90;
 const e={id:70000+(++tentSerial),x:t.x+(k?22:-8),y:t.y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type:ty,zone,face:p.x<t.x?-1:1,mode:'idle',timer:.9+k*.5,stun:0,flash:0,alive:true,home:t.x,attackId:0,grounded:true,alert:true,fromTent:true};
 world.enemies.push(e);hardenFoes([e]);dust(e.x,e.y,8,1.2);return e;}
function tentDown(t){t.down=true;t.flap=0;sfx('cloth',{gain:1,rate:.7,x:t.x});sfx('rock',{gain:.6,rate:1.3,x:t.x});dust(t.x,t.y,22,2.4);burst(t.x,t.y-60,'#c84a32',30,240);addCoins(12,t.x,t.y-60);label('ŠATOR JE PAO!',t.x,t.y-150,'#ffe39a');shake=settings.reduced?0:4;rumble(.4,120);}
function drawTent(t){if(t.x<camera-320||t.x>camera+VIEW_W+320)return;const im=levelArt['prop-turski-sator'],H=210,wob=t.shake>0?Math.sin(t.shake*80)*3:0;
 if(im){const b=propBounds(im),k=H/b.h,w=b.w*k;ctx.save();ctx.translate(t.x+wob,t.y+4);if(t.down){ctx.scale(1.08,.3);ctx.filter='brightness(.5) saturate(.6)';}ctx.drawImage(im,b.x,b.y,b.w,b.h,-w/2,-H,w,H);ctx.restore();}
 else poly([[t.x-110,t.y],[t.x,t.y-(t.down?50:170)],[t.x+110,t.y]],t.down?'#5a3020':'#b8382a','#3a1a10');
 if(t.down){if(Math.random()<.25)dust(t.x+(Math.random()-.5)*140,t.y-8,1,.6);return;}
 if(t.flap>0)halo(t.x,t.y-60,80,'rgba(255,160,80,.5)',t.flap);
 if(Math.abs(p.x-t.x)<560)textLabel(t.wave>=TENT_WAVES&&!t.out.some(e=>e.alive)?'ŠATOR · PRAZAN':'ŠATOR · SRUŠI GA',t.x,t.y-H-16,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ff7a3a'});}

// ---------- props stand whole: on their own ground, nothing drawn across them ----------
function clearAbove(a,b,h,q){for(const o of world.platforms){if(o===q||o.off)continue;if(o.x<b&&o.x+o.w>a&&o.y<q.y-4&&o.y+(o.h||20)>q.y-h)return false;}
 for(const l of world.ladders||[])if(l.x>a-30&&l.x<b+30)return false;for(const t of world.towers||[])if(t.x>a-130&&t.x<b+130)return false;return true;}
// dev: every placed prop checked against the level (?dev, then markoDev.layoutAudit())
function layoutAudit(){const out=[];for(const pr of level?.props||[]){const im=levelArt[pr.id];if(!im||pr.id.startsWith('prop-barjak'))continue;const b=propBounds(im),w=b.w*pr.height/b.h,a=pr.x-w/2,c=pr.x+w/2;
 const q=world.platforms.find(o=>o.ground&&Math.abs(o.y-pr.y)<2&&pr.x>=o.x&&pr.x<=o.x+o.w);if(!q){out.push(`${pr.id}@${Math.round(pr.x)} floats`);continue;}
 if(a<q.x-10||c>q.x+q.w+10)out.push(`${pr.id}@${Math.round(pr.x)} hangs over the edge`);if(!clearAbove(a,c,pr.height,q))out.push(`${pr.id}@${Math.round(pr.x)} is cut by a platform, ladder or tower`);
 for(const t of world.traps||[]){const tx=t.x??t.gate?.x??0;if(tx+(t.w||0)>a-20&&tx<c+20&&Math.abs((t.y??q.y)-q.y)<10)out.push(`${pr.id}@${Math.round(pr.x)} stands on a ${t.kind}`);}}return out;}

// ---------- low walls and stakes ----------
function lowCeiling(){return world.platforms?.some(q=>q.lintel&&!q.off&&p.x+16>q.x&&p.x-16<q.x+q.w&&q.y+q.h>p.y-114&&q.y+q.h<=p.y-50);}
function drawLintel(q){if(q.x>camera+VIEW_W+60||q.x+q.w<camera-60)return;const b=q.y+q.h;fillWall(q.x,q.y,q.w,q.h);shadeBlock(q.x,q.y,q.w,q.h,b);
 const g=ctx.createLinearGradient(0,b,0,b+72);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(q.x,b,q.w,72);
 line(q.x,b,q.x+q.w,b,'#2a2420',5);line(q.x,b-3,q.x+q.w,b-3,'rgba(255,236,196,.25)',2);
 if(Math.abs(p.x-(q.x+q.w/2))<480)textLabel('S · PROVUCI SE ISPOD',q.x+q.w/2,b-26,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
function spikeFoes(t){for(const e of world.enemies){if(!e.alive||e.champion||e.spikeT>0||!(e.tossedT>0||e.stun>0))continue;if(!e.grounded||Math.abs(e.y-t.y)>6||e.x<t.x||e.x>t.x+t.w)continue;
 e.spikeT=.9;const d=60;e.hp-=d;e.stun=Math.max(e.stun,1);e.mode='stun';e.vy=-380;e.grounded=false;e.air=true;e.juggle=.3;e.flash=.15;label('NA KOLJE! '+d,e.x,e.y-130,'#ff9a7a');blood(e.x,e.y-30,1,14);sfx('hit',{gain:.7,x:e.x});if(e.hp<=0)slay(e,.5);}}

// ---------- gates Marko walks THROUGH: the gatehouse is drawn in front of him, the tunnel behind ----------
// Codex's side-view gatehouse: the passage between the pillars spans x 380–640 of the 1024 drawing, its arch at y 600.
const GATE_ART={x0:380,x1:640,arch:600,img:1024},GATE_PASS=210,GATE_STOP=80,gateFronts=[];
const gateScale=()=>GATE_PASS/(GATE_ART.img-GATE_ART.arch);
function gateBack(x,y){const s=gateScale(),w=(GATE_ART.x1-GATE_ART.x0)*s,top=y-GATE_PASS;const g=ctx.createLinearGradient(0,top,0,y);g.addColorStop(0,'rgba(8,6,4,.72)');g.addColorStop(1,'rgba(8,6,4,.35)');ctx.fillStyle=g;ctx.fillRect(x-w/2,top,w,GATE_PASS);
 const side=ctx.createLinearGradient(x-w/2,0,x+w/2,0);side.addColorStop(0,'rgba(0,0,0,.35)');side.addColorStop(.5,'rgba(0,0,0,0)');side.addColorStop(1,'rgba(0,0,0,.35)');ctx.fillStyle=side;ctx.fillRect(x-w/2,top,w,GATE_PASS);}
function drawGateFronts(){for(const G of gateFronts){const {art,x,y,k}=G,b=propBounds(art),s=gateScale(),w=(GATE_ART.x1-GATE_ART.x0)*s,left=x-((GATE_ART.x0+GATE_ART.x1)/2-b.x)*s,top=y-(GATE_ART.img-b.y)*s+4;
  const grate=levelArt['resetka'];if(k<.98){ctx.save();ctx.beginPath();ctx.rect(x-w/2,y-GATE_PASS-4,w,GATE_PASS+8);ctx.clip();const lift=k*GATE_PASS*.98;
   if(grate){const gb=propBounds(grate),gh=GATE_PASS+24;ctx.drawImage(grate,gb.x,gb.y,gb.w,gb.h,x-w/2-4,y-gh+4-lift,w+8,gh);}
   else for(let bx=x-w/2+8;bx<x+w/2;bx+=14)line(bx,y-GATE_PASS-lift,bx,y-lift,'#2a2c30',5);ctx.restore();}
  ctx.drawImage(art,b.x,b.y,b.w,b.h,left,top,b.w*s,b.h*s);}
 gateFronts.length=0;}

// labels drawn in the same frame never print over each other: a later one steps up above the earlier
let drawSerial=0,labelSerial=-1;const labelRects=[];
function placeLabel(x,y,w,h){if(labelSerial!==drawSerial){labelSerial=drawSerial;labelRects.length=0;}if(w<40)return y;
 for(let k=0;k<4;k++){const hit=labelRects.find(r=>Math.abs(r.x-x)<(r.w+w)/2+6&&Math.abs(r.y-y)<h+3);if(!hit)break;y=hit.y-h-5;}labelRects.push({x,y,w});return y;}

// ---------- calm foe idles: the frames that follow each other smoothly, to and fro, at 5 fps ----------
const FOE_IDLE={sword:[0,3,5,4,5,3],shield:[0,5,4,3,1,3,4,5],archer:[0,1,3,4,5,4,3,1],akindzija:[3,1,0,4,5,4,0,1],oklopnik:[0,5,4,1,4,5],palikuca:[2,1,0,5,3,4,3,5,0,1],kopljanik:[0,5,4,1,3,2,3,1,4,5],tufekdzija:[3,1,4,5,4,1],musa:[0,3,4,5,4,3]};
function idleFrame(type,id){const seq=FOE_IDLE[type];if(seq)return seq[Math.floor(time*5+id*1.7)%seq.length];const n=rig?.[type+'-idle']?.frames.length||6;return Math.floor(time*6+id*1.7)%n;}

// ================= the main menu: what to play next, keys and the stick, fairy dust =================
// Returning players get "continue" as the main button: the story where they stopped, or the next pohod.
function menuButtons(){const c=$('continue'),s=$('start');if(!c||!s||!hasDom)return;const won=kacanikWon(),story=!!saveState&&!won;let i=-1;if(won)i=LEVELS.findIndex((L,k)=>levelOpen(k)&&!levelStars(L).done);
 c.hidden=!(story||i>=0);
 if(story){c.innerHTML='Nastavi legendu <span>→</span>';c.onclick=()=>start(true);}
 else if(i>=0){c.innerHTML=`Nastavi pohod <span>→</span><small>Pohod ${i+1} · ${LEVELS[i].name}</small>`;c.onclick=()=>startLevel(i);}
 c.className=c.hidden?'secondary':'primary';s.className=c.hidden?'primary':'secondary';
 s.innerHTML=c.hidden?(won?'Ponovo ispevaj legendu <span>→</span>':'Započni legendu <span>→</span>'):(story?'Nova legenda':'Ponovo ispevaj legendu');}
function fairyDust(){const box=document.querySelector?.('#menu .fairy-dust');if(!box||box.childElementCount)return;let html='';for(let i=0;i<18;i++){const d=3+Math.random()*4;html+=`<i style="left:${Math.random()*100}%;top:${Math.random()*40}%;animation-duration:${d}s;animation-delay:${-Math.random()*d}s;--dx:${-20-Math.random()*60}px"></i>`;}box.innerHTML=html;}
if(hasDom){
 $('menu-riznica')&&($('menu-riznica').onclick=openRiznica);$('menu-knjiga')&&($('menu-knjiga').onclick=()=>openBook());$('pause-knjiga')&&($('pause-knjiga').onclick=()=>openBook());
 // arrows (or W/S) move between buttons in any menu, Enter presses; in the book, left and right turn the page
 document.addEventListener('keydown',e=>{if(mode==='play')return;const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='SELECT')return;
  if(!$('knjiga').hidden&&['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){e.preventDefault();bookGo(bookAt+(e.code==='ArrowLeft'||e.code==='KeyA'?-1:1));return;}
  if(['ArrowUp','ArrowDown','KeyW','KeyS'].includes(e.code)){e.preventDefault();padMenu(0,e.code==='ArrowUp'||e.code==='KeyW'?-1:1,false,false);return;}
  if(e.code==='Enter'&&document.activeElement?.tagName!=='BUTTON'){e.preventDefault();padMenu(0,0,true,false);}});
 globalThis.markoI18n?.onLang?.(()=>{if(!$('knjiga').hidden)bookRender();});
}

// ================= the book of foes: an open book, each foe alive on its page =================
// Left page: the foe moves through his clips (rest, walk, attack, special, hit, in the air, fall); right page: who he is,
// his strength and weakness, and a tally of how many Marko has put down. Unmet foes are ink silhouettes.
const BOOK_PAGES=[
 {t:'sword',role:'Pešak',about:'Pešadija carske vojske. Ide u paru, sabljom seče brzo i nisko.',poses:[['U miru','idle'],['U pokretu','run'],['Napad','attack'],['Pogođen','hurt'],['U vazduhu','launch'],['Pada','death']]},
 {t:'shield',role:'Pešak sa štitom',about:'Drži veliki štit kao zid i iza njega čeka da pogrešiš.',poses:[['U miru','idle'],['U pokretu','run'],['Napad','attack'],['Štit izbijen','guardbreak'],['U vazduhu','launch'],['Pada','death']]},
 {t:'archer',role:'Strelac sa kule',about:'Krije se na kulama i stražarnicama; strela mu stiže pre nego što ga vidiš.',poses:[['U miru','idle'],['U pokretu','run'],['Gađa','shoot'],['Gađa nadole','shoot-down'],['U vazduhu','launch'],['Pada','death']]},
 {t:'akindzija',role:'Laki konjanik',about:'Laki konjanik i pljačkaš pograničja. Ne stoji u mestu ni trenutka.',poses:[['U miru','idle'],['U pokretu','run'],['Juriša','charge'],['Izmiče','backstep'],['U vazduhu','launch'],['Pada','death']]},
 {t:'oklopnik',role:'Teški pešak',about:'Okovan u gvožđe od glave do pete. Spor je, ali udarac mu ruši gard.',poses:[['U miru','idle'],['U pokretu','walk'],['Juriša','rush'],['Udar o zemlju','slam'],['Oklop puca','armorbreak'],['U vazduhu','launch'],['Pada','death']]},
 {t:'palikuca',role:'Paljevina',about:'Nosi baklju i lonac sa uljem. Gde prođe, ostaje garište.',poses:[['U miru','idle'],['U pokretu','run'],['Baklja','torch'],['Bljuje vatru','fire'],['Gori','burn'],['U vazduhu','launch'],['Pada','death']]},
 {t:'kopljanik',role:'Kopljanik iz prve linije',about:'Koplje mu je duže od tvog topuza; drži te tamo gde on hoće.',poses:[['U miru','idle'],['U pokretu','run'],['Napad','attack'],['Pogođen','hurt'],['U vazduhu','launch'],['Pada','death']]},
 {t:'pas',role:'Zver',about:'Pušten sa lanca ispred odreda. Laje, pa skače pravo za grlo.',poses:[['U miru','idle'],['U pokretu','run'],['Napad','attack'],['Pogođen','hurt'],['U vazduhu','launch'],['Pada','death']]},
 {t:'tufekdzija',role:'Puškar',about:'Nosi dugi tufek; pucanj čuješ pre nego što ga osetiš.',poses:[['U miru','idle'],['U pokretu','run'],['Gađa','shoot'],['Pogođen','hurt'],['U vazduhu','launch'],['Pada','death']]},
 {t:'musa',boss:true,name:'Musa Kesedžija',role:'Gospodar prolaza',about:'Odmetnik koji je zatvorio drumove i primorje. U grudima mu kucaju tri srca.',strong:'Težak udarac, skok i juriš; svaki treći napad je poseban.',weak:'Posle napada ostaje otvoren. Odbij (L) i udri nizom; Ravijojlin bljesak (E) otvara gard.',poses:[['U miru','idle'],['U pokretu','run'],['Napad','attack'],['Pogođen','hurt'],['Pada','death']]},
].map(pg=>({...pg,poses:pg.poses.filter(([,c])=>rig?.[`${pg.t}-${c}`])})).filter(pg=>pg.poses.length);
const BOOK_ONCE=new Set(['death','launch','armorbreak','guardbreak','backstep','hurt']),BOOK_POSE_TIME=2.8;
// Two books share one binding: the Book of Foes (a spread per foe) and the Book of Legends (a spread per legend,
// then the song of Marko and Musa — in Serbian it runs on across both pages, in English it faces its translation).
let bookKind='dusmani',bookSpreads=[],bookAt=0,bookPose=0,bookAuto=true,bookPoseT=0,bookRaf=0,bookLast=0,bookBusy=null;
const uiLang=()=>globalThis.markoI18n?.getLang?.()||'sr';
const ZASTAVICA='<div class="zastavica" aria-hidden="true"></div>';
const BOOK_COVER={dusmani:'КЊИГА<br>ДУШМАНА',legende:'КЊИГА<br>ЛЕГЕНДИ'};
function bookKnown(pg){return pg.boss?kacanikWon():!!book()[pg.t];}
function bookInfo(pg){const f=FOE_BOOK[pg.t]||{};return{name:pg.name||f.name||pg.t,strong:pg.strong||f.strong||'',weak:pg.weak||f.weak||'',kills:pg.boss?(kacanikWon()?1:0):(book()[pg.t]?.kills||0)};}
function tallyMarks(n){const shown=Math.min(n,50),groups=Math.ceil(shown/5);let html='';
 for(let g=0;g<groups;g++){const k=Math.min(5,shown-g*5);let lines='';for(let j=0;j<Math.min(k,4);j++)lines+=`<line x1="${4+j*6.5}" y1="3" x2="${3+j*6.5}" y2="25" style="animation-delay:${.35+(g*5+j)*.05}s"/>`;
  if(k===5)lines+=`<line x1="-1" y1="21" x2="28" y2="7" style="animation-delay:${.35+(g*5+4)*.05}s"/>`;html+=`<svg viewBox="-3 0 34 28" class="mark" aria-hidden="true">${lines}</svg>`;}
 return html+(n>50?`<b class="more">+${n-50}</b>`:'');}
function foeSpread(i){const pg=BOOK_PAGES[i],known=bookKnown(pg),f=bookInfo(pg),N=BOOK_PAGES.length;
 const chips=pg.poses.map(([lbl],k)=>`<button class="pose${k===bookPose?' on':''}" data-pose="${k}" ${known?'':'disabled'}>${lbl}</button>`).join('');
 const left=`${ZASTAVICA}<p class="book-eyebrow">KNJIGA DUŠMANA</p><div class="foe-stage${known?'':' unknown'}"><canvas class="foe-canvas" width="640" height="440" data-page="${i}" data-pose="${bookPose}"></canvas></div>
  <div class="pose-chips">${chips}</div><h3 class="foe-name">${known?f.name:'???'}</h3><p class="foe-role">${known?pg.role:'???'}</p>`;
 const right=known?`${ZASTAVICA}<p class="book-eyebrow">Stranica ${i+1} od ${N}</p><h4>Ko je on</h4><p class="drop">${pg.about}</p><h4>Snaga</h4><p>${f.strong}</p><h4>Slabost</h4><p class="weak">${f.weak}</p>
  <div class="tally"><h4>Savladano</h4><div class="marks">${f.kills?tallyMarks(f.kills):'<span class="none">Nijedan</span>'}</div><b class="count">${f.kills}</b></div>${f.kills?'<div class="seal" aria-hidden="true"><span>✦</span></div>':''}`
  :`${ZASTAVICA}<p class="book-eyebrow">Stranica ${i+1} od ${N}</p><div class="blank"><p>${pg.boss?'Pobedi Musu da otvoriš ovu stranicu.':'Stranica je prazna. Ovog dušmana još nisi sreo na drumu.'}</p><span class="blot" aria-hidden="true"></span></div>`;
 return{left,right};}
const VERSES=16;
function legendSpreads(){const D=globalThis.markoLegende;if(!D)return[];const en=uiLang()==='en',out=[];
 for(const c of D.CHAPTERS){const t=c[en?'en':'sr'],pic=c.mini||c.img;out.push({group:c.id,tab:{img:c.tab||pic,label:t.title},
  left:`${ZASTAVICA}<p class="book-eyebrow">KNJIGA LEGENDI</p><figure class="miniature${c.mini?' painted':''}"><img src="${pic}" alt=""></figure><div data-notr class="ms-head"><p class="ms-cy">${c.cy}</p><h3 class="foe-name">${t.title}</h3><p class="foe-role">${t.sub}</p></div>`,
  right:(i,N)=>`${ZASTAVICA}<p class="book-eyebrow">Stranica ${i+1} od ${N}</p><div data-notr class="ms-body"><p class="drop ms-text">${t.text}</p><div class="ms-birds" aria-hidden="true"><img src="assets/ui/rukopis-ptica-2.webp" alt=""><img src="assets/ui/rukopis-ptica-1.webp" alt=""></div></div>`});}
 const S=D.SONG,T=S[en?'en':'sr'],sr=S.lines.sr,tr2=S.lines.en,n=sr.length;
 const verses=(arr,a,b)=>`<ol class="verses" data-notr>${arr.slice(a,b).map((l,k)=>`<li data-n="${a+k}"${reader?.line===a+k?' class="now"':''}><i>${(a+k+1)%5===0?a+k+1:''}</i>${l}</li>`).join('')}</ol>`;
 const readBar='<div class="read-bar"><button data-read="sr"><b>▶</b>Čitaj na srpskom</button><button data-read="en"><b>▶</b>Čitaj na engleskom</button></div>';
 out.push({group:'pesma',tab:{img:S.tab||S.img,label:T.title,song:true},
  left:`${ZASTAVICA}<p class="book-eyebrow">KNJIGA LEGENDI · PESMA</p><figure class="miniature${S.mini?' painted':''}"><img src="${S.mini||S.img}" alt=""></figure><div data-notr class="ms-head"><p class="ms-cy">${S.cy}</p><h3 class="foe-name">${T.title}</h3></div>`,
  right:(i,N)=>`${ZASTAVICA}<p class="book-eyebrow">Stranica ${i+1} od ${N}</p><div data-notr class="ms-body"><p class="ms-text drop">${T.sub}.</p><p class="ms-note">${T.note}</p><p class="ms-note">${n} ${en?'lines':'stihova'}</p><blockquote class="ms-epi">${(en?tr2:sr).slice(251,256).map(l=>`<span>${l}</span>`).join('')}<cite>${en?'lines':'stihovi'} 252–256</cite></blockquote></div>${readBar}`,range:[0,0]});
 const per=en?VERSES:VERSES*2;
 for(let a=0;a<n;a+=per){const b=Math.min(n,a+per),mid=Math.min(n,a+VERSES);
  out.push({group:'pesma',range:[a,b],left:`${ZASTAVICA}<p class="book-eyebrow">${en?'SRPSKI':'PESMA'}</p>${verses(sr,a,mid)}`,
   right:(i,N)=>`${ZASTAVICA}<p class="book-eyebrow">${en?'ENGLISH':`Stranica ${i+1} od ${N}`}</p>${en?verses(tr2,a,b):verses(sr,mid,b)}${b>=n?'<div class="ms-birds" aria-hidden="true"><img src="assets/ui/rukopis-ptica-2.webp" alt=""><img src="assets/ui/rukopis-ptica-1.webp" alt=""></div>':''}${a===0?readBar:''}`});}
 return out;}
function bookList(){return bookKind==='legende'?legendSpreads():BOOK_PAGES.map((pg,i)=>({group:'f'+i,foe:i,tab:{foe:i}}));}
function spreadHTML(i){const s=bookSpreads[i];if(!s)return{left:'',right:''};if(s.foe!=null)return foeSpread(s.foe);return{left:s.left,right:typeof s.right==='function'?s.right(i,bookSpreads.length):s.right};}
function copyCanvases(from,to){const a=from.querySelectorAll?.('canvas')||[],b=to.querySelectorAll?.('canvas')||[];a.forEach((c,k)=>{const d=b[k];if(!d)return;d.classList.remove('foe-canvas');d.getContext('2d')?.drawImage(c,0,0);});}
function bookWire(){const L=$('book-left');L.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{bookPose=Number(b.dataset.pose);bookAuto=false;bookPoseT=0;bookSetPose();});readWire();}
function bookSetPose(){const c=$('book-left')?.querySelector('canvas.foe-canvas');if(c){c.dataset.pose=bookPose;c._t=0;}$('book-left')?.querySelectorAll('[data-pose]').forEach(b=>b.classList.toggle('on',Number(b.dataset.pose)===bookPose));}
function bookTabs(){const box=$('book-tabs');if(!box)return;const cur=bookSpreads[bookAt]?.group;
 box.innerHTML=bookSpreads.map((s,i)=>{if(!s.tab)return'';const on=s.group===cur?' on':'';
  if(s.tab.foe!=null){const pg=BOOK_PAGES[s.tab.foe],k=bookKnown(pg);return`<button class="tab${on}${k?'':' unknown'}" data-tab="${i}" aria-label="${k?bookInfo(pg).name:'???'}"><canvas width="96" height="96"></canvas></button>`;}
  return`<button class="tab pic${on}${s.tab.song?' song':''}${s.tab.img.includes('/cast/')?' cast':''}" data-tab="${i}" aria-label="${s.tab.label}" data-notr><img src="${s.tab.img}" alt=""></button>`;}).join('');
 box.querySelectorAll('[data-tab]').forEach(b=>{const i=Number(b.dataset.tab),s=bookSpreads[i];b.onclick=()=>bookGo(i);if(s.tab.foe!=null)drawFoe(b.querySelector('canvas'),BOOK_PAGES[s.tab.foe],'idle',0,{portrait:true});});
 box.querySelector('.tab.on')?.scrollIntoView?.({block:'nearest',inline:'center'});}
function bookRender(){const g=bookSpreads[bookAt]?.group;bookSpreads=bookList();if(g){const k=bookSpreads.findIndex(s=>s.group===g);if(k>=0&&bookSpreads[bookAt]?.group!==g)bookAt=k;}bookAt=clamp(bookAt,0,Math.max(0,bookSpreads.length-1));
 const {left,right}=spreadHTML(bookAt);$('book-left').innerHTML=left;$('book-right').innerHTML=right;bookWire();bookTabs();}
function openBook(at,kind='dusmani'){if(!hasDom)return;if(kind!==bookKind){stopReading();bookKind=kind;bookAt=0;}bookSpreads=bookList();if(!bookSpreads.length)return;
 if(typeof at==='number')bookAt=at;else if(kind==='dusmani'){const first=BOOK_PAGES.findIndex(pg=>bookKnown(pg));if(!bookKnown(BOOK_PAGES[bookSpreads[bookAt]?.foe??0])&&first>=0)bookAt=first;}
 bookPose=0;bookAuto=true;bookPoseT=0;bookRender();const el=$('knjiga');el.hidden=false;const bk=$('book');bk.dataset.kind=kind;bk.classList.remove('opening');void bk.offsetWidth;
 if(!settings.reduced&&!matchMedia('(max-width:760px)').matches){bk.classList.add('opening');const cover=document.createElement('div');cover.className='leaf cover';cover.innerHTML=`<div class="leaf-face front"><span>${BOOK_COVER[kind]}</span></div><div class="leaf-face back"></div>`;bk.append(cover);cover.addEventListener('animationend',e=>{if(e.target===cover)cover.remove();});setTimeout(()=>cover.remove(),2600);}
 sfx('cloth',{gain:.5,rate:.8});setTimeout(()=>sfx('cloth',{gain:.35,rate:1.3}),380);bookLast=performance.now();if(!bookRaf)bookRaf=requestAnimationFrame(bookTick);$('book-next')?.focus?.();}
function closeBook(){$('knjiga').hidden=true;stopReading();sfx('cloth',{gain:.4,rate:.7});}
function bookGo(i,dir){const N=bookSpreads.length;if(!N||bookBusy)return;i=((i%N)+N)%N;if(i===bookAt)return;dir=dir||(i>bookAt?1:-1);
 const L=$('book-left'),R=$('book-right'),bk=$('book');bookAt=i;bookPose=0;bookAuto=true;bookPoseT=0;const {left,right}=spreadHTML(i);
 sfx('cloth',{gain:.45,rate:1.5+Math.random()*.3});
 if(settings.reduced||matchMedia('(max-width:760px)').matches){L.innerHTML=left;R.innerHTML=right;bookWire();bookTabs();bk.classList.remove('fade');void bk.offsetWidth;bk.classList.add('fade');return;}
 const leaf=document.createElement('div');leaf.className='leaf '+(dir>0?'fwd':'back');
 const front=(dir>0?R:L).cloneNode(true);copyCanvases(dir>0?R:L,front);front.removeAttribute('id');front.className=`leaf-face front page ${dir>0?'right':'left'}`;
 const back=document.createElement('div');back.className=`leaf-face back page ${dir>0?'left':'right'}`;back.innerHTML=dir>0?left:right;
 leaf.append(front,back);if(dir>0){R.innerHTML=right;readWire();}else{L.innerHTML=left;bookWire();}bk.append(leaf);bookTabs();
 bookBusy=leaf;const done=()=>{if(bookBusy!==leaf)return;bookBusy=null;if(dir>0){L.innerHTML=left;bookWire();}else{R.innerHTML=right;readWire();}leaf.remove();if(reader)readMark(reader.line);};
 leaf.addEventListener('animationend',e=>{if(e.target===leaf)done();});setTimeout(done,2000);}
// draws one frame of a foe clip into a canvas: feet on a painted ground, unknown foes as ink silhouettes
function drawFoe(c,pg,clip,t,o={}){const g=c?.getContext?.('2d');if(!g)return;const W2=c.width,H2=c.height,name=`${pg.t}-${clip}`,r=rig?.[name]||rig?.[`${pg.t}-idle`],im=r&&rigImages[r.image];g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,W2,H2);if(!im)return;
 const n=r.frames.length,fps=clip==='idle'?7:11,once=BOOK_ONCE.has(clip),hold=Math.round(fps*.9),k=Math.floor(t*fps)%(n+(once?hold:0)),fi=Math.min(n-1,k),f=r.frames[fi];
 // one size per foe, fitted from his idle: the stage shows him whole, a tab shows head and shoulders
 const ri=rig[`${pg.t}-idle`]||r,fi0=ri.frames[0],bodyH=Math.max(1,(fi0[4]-fi0[5])*ri.scale),dog=pg.t==='pas';
 const unit=o.portrait?(dog?H2*.62:H2*1.5)/bodyH:(dog?H2*.4:H2*.62)/bodyH,s=r.scale*unit,ground=o.portrait?(dog?H2*.86:H2*.1+bodyH*unit):H2*.86;
 let y=ground,x=W2*(o.portrait&&!dog?.52:.5);if(clip==='launch'){y=ground-H2*.16-Math.sin(Math.min(1,fi/(n-1))*Math.PI)*H2*.12;}
 if(!o.portrait){g.save();g.globalAlpha=.32;g.fillStyle='#3a2414';g.beginPath();g.ellipse(x,ground+4,W2*.16*(clip==='launch'?.6:1),H2*.03,0,0,Math.PI*2);g.fill();g.restore();}
 g.save();g.translate(x,y);g.drawImage(im,f[0],f[1],f[2],f[3],-r.anchor*s,-f[4]*s,f[2]*s,f[3]*s);g.restore();
 if(!bookKnown(pg)){g.save();g.globalCompositeOperation='source-atop';g.fillStyle=o.portrait?'#3b2a1c':'rgba(46,30,18,.94)';g.fillRect(0,0,W2,H2);g.restore();}}
function bookTick(now){if($('knjiga').hidden){bookRaf=0;stopReading();return;}bookRaf=requestAnimationFrame(bookTick);const dt=Math.min(.05,Math.max(0,(now-bookLast)/1000));bookLast=now;readerTick();
 const cur=bookSpreads[bookAt],pg=cur?.foe!=null&&BOOK_PAGES[cur.foe];if(pg&&bookAuto&&bookKnown(pg)){bookPoseT+=dt;if(bookPoseT>BOOK_POSE_TIME){bookPoseT=0;bookPose=(bookPose+1)%pg.poses.length;bookSetPose();}}
 document.querySelectorAll('#knjiga canvas.foe-canvas').forEach(c=>{const p2=BOOK_PAGES[Number(c.dataset.page)];if(!p2)return;c._t=(c._t||0)+dt;const pose=p2.poses[Number(c.dataset.pose)||0]||p2.poses[0];drawFoe(c,p2,bookKnown(p2)?pose[1]:'idle',bookKnown(p2)?c._t:0);});}
if(hasDom){$('book-prev').onclick=()=>bookGo(bookAt-1,-1);$('book-next').onclick=()=>bookGo(bookAt+1,1);$('book-close').onclick=closeBook;
 $('knjiga').addEventListener('click',e=>{if(e.target===$('knjiga'))closeBook();});
 $('menu-legende')&&($('menu-legende').onclick=()=>openBook(undefined,'legende'));$('pause-legende')&&($('pause-legende').onclick=()=>openBook(undefined,'legende'));}

// ---------- the song read aloud (local Serbian voice model; English with the same voice) ----------
// assets/voice/pesma-<sr|en>.mp3 plus .json with the start of every verse; the verse being read lights up on both
// facing pages, and the book turns its own pages to follow.
let reader=null;
async function readSong(lang,from=0){stopReading();let t=null;try{t=await fetch(`assets/voice/pesma-${lang}.json`).then(r=>r.ok?r.json():null);}catch{}
 if(!t){toast('Čitanje pesme još nije spremno.',2.5);return;}const a=new Audio(`assets/voice/pesma-${lang}.mp3`);a.preload='auto';a.volume=audioEnabled?Math.min(1,(settings.voice??.9)*1.05):0;
 reader={lang,a,t,line:-1};readButtons();a.addEventListener('loadedmetadata',()=>{if(reader?.a!==a)return;a.currentTime=Math.max(0,(t.starts[from]??0)-.05);a.play().catch(()=>stopReading());},{once:true});a.onended=()=>{if(reader?.a===a)stopReading();};a.load();}
function stopReading(){if(!reader)return;reader.a.pause();reader=null;readMark(-1);readButtons();}
function readerTick(){if(!reader||reader.a.paused)return;const {a,t}=reader,now=a.currentTime;let i=-1;for(let k=0;k<t.starts.length;k++){if(t.starts[k]<=now+.05)i=k;else break;}
 if(audio&&SND)SND.duckUntil=Math.max(SND.duckUntil||0,audio.currentTime+.4);if(i===reader.line)return;reader.line=i;readMark(i);
 const cur=bookSpreads[bookAt];if(i>=0&&cur?.group==='pesma'&&cur.range&&(i>=cur.range[1]||i<cur.range[0])&&!bookBusy){const k=bookSpreads.findIndex(s=>s.range&&i>=s.range[0]&&i<s.range[1]);if(k>=0)bookGo(k,k>bookAt?1:-1);}}
function readMark(i){document.querySelectorAll('#knjiga .verses li.now').forEach(li=>li.classList.remove('now'));if(i>=0)document.querySelectorAll(`#knjiga .verses li[data-n="${i}"]`).forEach(li=>li.classList.add('now'));}
function readButtons(){document.querySelectorAll('#knjiga [data-read]').forEach(b=>b.classList.toggle('on',reader?.lang===b.dataset.read));}
function readWire(){document.querySelectorAll('#knjiga [data-read]').forEach(b=>b.onclick=()=>{if(reader?.lang===b.dataset.read){stopReading();return;}const r=bookSpreads[bookAt]?.range;readSong(b.dataset.read,r?r[0]:0);});readButtons();}

// ================= Marko on the menu: his own clips, large, turned toward the panel =================
// He breathes in place; every few seconds (or when clicked) he swings the mace, spins it or raises it, then settles.
const MM_IDLE=rig?.['marko-idle-2']?'marko-idle-2':'marko-idle';
const MM_MOVES=[['marko-charged',8,1],['marko-super',10,1],['marko-combo-1',11,1],['marko-combo-3',10,1],['marko-vihor',14,2],['marko-throw',11,1],['marko-counter',11,1],['marko-uppercut',11,1]].filter(([n])=>rig?.[n]);
let mmCanvas=null,mmClip=MM_IDLE,mmT=0,mmNext=4,mmLoops=1,mmLast=0,mmRaf=0;mmReady=true;
function menuMarkoStart(){if(!mmReady||!hasDom||!rig?.[MM_IDLE]||!rigImages[rig[MM_IDLE].image])return;
 if(!mmCanvas){const img=document.querySelector('#menu img.menu-marko');if(!img)return;mmCanvas=document.createElement('canvas');mmCanvas.className='menu-marko live';mmCanvas.width=900;mmCanvas.height=900;mmCanvas.setAttribute('role','img');mmCanvas.setAttribute('aria-label','Kraljević Marko sa bodljikavim topuzom');mmCanvas.title='';img.replaceWith(mmCanvas);mmCanvas.addEventListener('click',()=>{if(mmClip===MM_IDLE)menuMarkoMove(true);});}
 if(!mmRaf){mmLast=performance.now();mmRaf=requestAnimationFrame(menuMarkoTick);}}
function menuMarkoMove(loud){if(!MM_MOVES.length)return;let m;do m=MM_MOVES[Math.floor(Math.random()*MM_MOVES.length)];while(MM_MOVES.length>1&&m[0]===menuMarkoMove.last);menuMarkoMove.last=m[0];
 mmClip=m[0];mmT=0;mmLoops=m[2];mmNext=6+Math.random()*5;sfx('whoosh_heavy',{gain:loud?.4:.18});}
function menuMarkoTick(t){if($('menu').hidden||!mmCanvas){mmRaf=0;return;}mmRaf=requestAnimationFrame(menuMarkoTick);const dt=Math.min(.05,Math.max(0,(t-mmLast)/1000));mmLast=t;mmT+=dt;
 const mv=MM_MOVES.find(m=>m[0]===mmClip),fps=mv?mv[1]:6,n=rig[mmClip].frames.length;let fi=Math.floor(mmT*fps);
 if(mv&&fi>=n*mmLoops){mmClip=MM_IDLE;mmT=0;fi=0;}
 if(!mv){mmNext-=dt;if(mmNext<=0&&!settings.reduced)menuMarkoMove(false);}
 drawMenuMarko(mmClip,fi%rig[mmClip].frames.length,mmT);}
function drawMenuMarko(name,fi,t){const c=mmCanvas,g=c.getContext('2d'),r=rig[name],im=rigImages[r.image];g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);if(!im)return;
 const ri=rig[MM_IDLE],f0=ri.frames[0],body=(f0[4]-f0[5])*ri.scale,unit=c.height*.78/body,s=r.scale*unit,f=r.frames[fi],x=c.width*.6,y=c.height*.96,breath=name===MM_IDLE?1+Math.sin(t*1.7)*.006:1;
 g.save();g.globalAlpha=.4;const sh=g.createRadialGradient(x,y,0,x,y,c.width*.24);sh.addColorStop(0,'#000c');sh.addColorStop(1,'#0000');g.fillStyle=sh;g.scale(1,.12);g.fillRect(0,(y-c.width*.24)/.12,c.width,c.width*.48/.12);g.restore();
 g.save();g.translate(x,y);g.scale(-1,breath);g.drawImage(im,f[0],f[1],f[2],f[3],-r.anchor*s,-f[4]*s,f[2]*s,f[3]*s);g.restore();}
menuLedger();

// ---------- Marko's in-between clips (Codex, DOPUNA-8): walk, braking, rise and fall, a longer rest, recovery, rolls ----------
const IDLE3_AT=9,STOP_TIME=.26,RECOVER_TIME=.24,ROLL_LAND_TIME=.42,OPEN_TIME=.42;
function markoFlow(dt){for(const k of['stopT','recoverT','rollLandT','openT'])if(p[k]>0)p[k]-=dt;
 p.airT=p.grounded?0:(p.airT||0)+dt;
 // letting go of the arrows at full run: he digs his heels in
 const held=keys.has('KeyA')||keys.has('KeyD')||keys.has('ArrowLeft')||keys.has('ArrowRight');
 if(p.grounded&&!held&&Math.abs(p.prevVx||0)>200&&p.attack<=0&&!p.blocking&&!p.crouching&&!(p.slide>0)&&!horseMounted&&rig?.['marko-run-stop'])p.stopT=STOP_TIME;p.prevVx=p.vx;
 // standing still a long while: the mace goes on his shoulder, he looks about
 const busy=!p.grounded||Math.abs(p.vx)>5||p.attack>0||p.blocking||p.crouching||p.drink>0||p.hurt>0||p.down>0||horseMounted||p.dizzy>0||keys.size>0;p.idleT=busy?0:(p.idleT||0)+dt;
 // the third blow of the hero's combo: he draws the mace back and settles
 if(p.prevAtk>0&&p.attack<=0&&p.prevKind==='light'&&p.prevCombo===2&&p.grounded&&rig?.['marko-combo-recover'])p.recoverT=RECOVER_TIME;p.prevAtk=p.attack;p.prevKind=p.attackKind;p.prevCombo=p.combo;}
function reachDown(){if(p&&p.grounded&&Math.abs(p.vx)<90&&p.attack<=0&&rig?.['marko-open'])p.openT=OPEN_TIME;}
function flowPose(){const once=(name,t,T)=>{const n=rig[name].frames.length;return{name,frame:Math.min(n-1,Math.floor((1-t/T)*n))};};
 if(!p.grounded&&p.hurt>.02&&rig?.['marko-hurt-air'])return{name:'marko-hurt-air',frame:Math.min(3,Math.floor((1-p.hurt/.22)*4))};
 if(!p.grounded||p.attack>0)return null;
 if(p.rollLandT>0&&rig?.['marko-roll-land'])return once('marko-roll-land',p.rollLandT,ROLL_LAND_TIME);
 if(p.openT>0&&rig?.['marko-open'])return once('marko-open',p.openT,OPEN_TIME);
 if(p.recoverT>0&&Math.abs(p.vx)<80&&rig?.['marko-combo-recover'])return once('marko-combo-recover',p.recoverT,RECOVER_TIME);
 if(p.stopT>0&&Math.abs(p.vx)<150&&!p.blocking&&!p.crouching&&rig?.['marko-run-stop'])return once('marko-run-stop',p.stopT,STOP_TIME);
 return null;}
