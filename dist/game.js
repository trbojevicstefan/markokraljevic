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
const JOURNEY=['selo','manastir','oranje','tvrdjava','podrum','mocvara','suma','pecina','prevoj','klisura','rusevine','rudnik','reka'],MUSA_AFTER=9;
LEVELS.sort((a,b)=>(JOURNEY.indexOf(a.id)+1||99)-(JOURNEY.indexOf(b.id)+1||99));
if(rig)await Promise.all([...new Set(Object.values(rig).map(r=>r.image))].map(src=>new Promise(resolve=>{const im=new Image();im.onload=()=>{rigImages[src]=im;resolve();};im.onerror=()=>resolve();im.src=`assets/${src}`;})));
let lastSafeY=590,defenses={},world=makeWorld(),p,mode='menu',camera=0,camY=CAM_Y0,time=0,elapsed=0,zone=0,checkpoint=0,boss,particles=[],arrows=[],floating=[],corpses=[],ghosts=[],attackSerial=0,shake=0,hitstop=0,dialogueTime=0,toastTime=0,saveState=null,deaths=0,kills=0,relics=0,horseX=10960,horseMounted=false,horseCompleted=false,lastSafe=150,audioEnabled=true,settings={difficulty:'normal',volume:.4,music:.35,sfx:.55,voice:.9,quality:'auto',gore:true,reduced:false};
let training=null,endSequence=null,bones=[],heads=[],limbs=[],fountains=[],finisher=null,grapple=null,grappleCool=0;const ROT_AT=10;
const keys=new Set(),pressed=new Set();let audio=null,musicClock=0;
let fairy={x:100,y:440,age:99,duration:3.2,targetX:100,targetY:440,kind:'hover'},pendingMagic=null;
try{settings={...settings,...JSON.parse(localStorage.getItem('marko-settings')||'{}')};saveState=JSON.parse(localStorage.getItem('marko-save')||'null');}catch{}
let stage=null;
if(hasDom&&assets.gorge){try{const m=await import('./stage3d.js');stage=await m.createStage({canvas,layer,glow:glowLayer,gorge:assets.gorge,W,H,zoom:ZOOM,settings:{get reduced(){return settings.reduced;},get quality(){return settings.quality;},onThunder:()=>sfx('thunder',{gain:.8,delay:.25,vary:.3})}});document.body.classList.add('webgl');}catch(err){console.warn('Three.js scena nije dostupna, koristi se 2D prikaz.',err);stage=null;}}
const screenCtx=stage?null:canvas.getContext?.('2d');
const fx=(name,...args)=>stage?.[name]?.(...args);
// ?dev and the test hub's ?go= scenarios: the test build (markoDev handle; Marko knows every move and has his father's sabre: G draws it)
const DEV=typeof location!=='undefined'&&/[?&](dev\b|go=)/.test(location.search);
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
const VOICE_SPEAKER={musa:'musa',vila:'vila',tr:'turk',ak:'akindzija',ok:'oklopnik',pl:'palikuca',ar:'strelac',aga:'aga',pt:'putnik'};
const ENEMY_VOICE=new Set(['turk','akindzija','oklopnik','palikuca','strelac']);
// each kind of Ottoman has his own voice (raiders, the armoured, fire-raisers, archers); janissaries speak for the rest
const FOE_VOICE={akindzija:'ak',oklopnik:'ok',palikuca:'pl',archer:'ar',tufekdzija:'ar'};
function foeSay(e,kind,o={}){if(Math.random()>(o.chance??1))return false;const v=FOE_VOICE[e?.type],q={...o,chance:1,x:o.x??e?.x};return(v&&say(v+'_'+kind,q))||say('tr_'+kind,q);}
// say('kill') plays a random line whose id is 'kill' or starts with 'kill_'. One line per speaker at a time; higher priority interrupts.
function say(group,{chance=1,priority=1,delay=0,x=null,gap=.6}={}){if(!audio||!SND.ready||Math.random()>chance)return false;const ids=SND.voices.filter(v=>(v===group||v.startsWith(group+'_'))&&SND.buf['voice/'+v]);if(!ids.length)return false;const speaker=VOICE_SPEAKER[group.split('_')[0]]||'marko';const now=audio.currentTime+delay,cur=SND.speaking[speaker];if(cur&&now<cur.until){if(priority<=cur.priority)return false;try{cur.src.stop();}catch{}}let id=ids[Math.floor(Math.random()*ids.length)];if(ids.length>1&&id===SND.last[group])id=ids[(ids.indexOf(id)+1)%ids.length];SND.last[group]=id;const b=SND.buf['voice/'+id];const src=playBuf(b,{bus:ENEMY_VOICE.has(speaker)?'enemy':'voice',gain:SND.norm[id]||1,pan:speaker==='marko'?0:panAt(x)*.5,delay});SND.speaking[speaker]={src,until:now+b.duration+gap,priority};if(!ENEMY_VOICE.has(speaker))SND.duckUntil=Math.max(SND.duckUntil,now+b.duration);return true;}
function sound(type){const lt=()=>{if(type==='hit'){tone(110,.13,'triangle',.5,30);tone(480,.06,'sawtooth',.1,90);}else if(type==='parry'){tone(740,.4,'triangle',.3,1400);tone(1110,.5,'sine',.15);}else if(type==='jump')tone(180,.18,'sine',.14,340);else if(type==='magic'){[440,660,880].forEach((f,i)=>setTimeout(()=>tone(f,.6,'sine',.16),i*80));}else if(type==='hurt')tone(130,.22,'sawtooth',.18,45);else if(type==='wine')tone(300,.35,'sine',.22,600);else tone(220,.1,'triangle',.1,150);};
 if(!SND.ready)return lt();
 if(type==='hit'){sfx('hit_body');sfx('hit_armor',{gain:.55});}else if(type==='parry'){sfx('clang',{gain:.9});sfx('ring',{gain:.45});}else if(type==='jump')sfx('cloth',{gain:.6});else if(type==='magic')sfx('magic',{gain:.75});else if(type==='hurt')sfx('hit_body',{gain:.8,rate:.85});else if(type==='wine')sfx('gulp',{gain:.8});else if(type==='swing'){if(p&&p.attack>0)sayGrunt(p.attackKind!=='light');else sfx('whoosh_heavy',{gain:.45});}else lt();}
function music(dt){pesmaTick();if(!audio)return;ambience();const want=musicWant();const buf=SND.buf['music/'+want];const vol=audioEnabled?settings.volume:0;applyAudioLevels();
 if(buf){if(SND.trackName!==want){if(SND.track){const old=SND.track;old.g.gain.setTargetAtTime(0,audio.currentTime,.6);setTimeout(()=>{try{old.s.stop();}catch{}},3000);}const s=audio.createBufferSource();s.buffer=buf;s.loop=true;const g=audio.createGain();g.gain.value=0;g.gain.setTargetAtTime(1,audio.currentTime,.8);s.connect(g);g.connect(SND.bus.music);s.start();SND.track={s,g};SND.trackName=want;}return;}
 musicClock-=dt;if(musicClock<=0){const notes=[146.83,220,261.63,293.66,329.63,293.66,220,164.81];tone(notes[Math.floor(time/1.7)%notes.length],1.8,'triangle',.025);tone(73.4,2,'sine',.035);musicClock=1.7;}}
// each champion has his own theme, loaded when his arena opens; Musa's lances have theirs
function musicWant(){if(mode==='menu')return'drum';if(!level&&zone===5&&boss?.alive)return boss.stage==='joust'?trackOr('koplja','megdan'):'megdan';
 if(arena&&arena.boss?.alive)return trackOr('boss-'+(arena.boss.kit||''),'megdan');return level?.id==='tvrdjava'?'megdan':'drum';}
function trackOr(name,fallback){const k='music/'+name;if(SND.buf[k])return name;if(SND.buf[k]===undefined&&audio){SND.buf[k]=null;fetch(`assets/music/${name}.ogg`).then(r=>r.ok?r.arrayBuffer():null).then(a=>a&&audio.decodeAudioData(a)).then(b=>{SND.buf[k]=b||null;}).catch(()=>{});}return fallback;}
function toast(text,duration=3){$('toast').textContent=text;$('toast').classList.add('visible');toastTime=duration;}
function speak(text,duration=7,who=null){$('dialogue-text').textContent=text;{const box=$('dialogue'),n=box.querySelector?.('small'),im=box.querySelector?.('img');if(n)n.textContent=tr(who||'RAVIJOJLA');if(im)im.style.visibility=who?'hidden':'visible';}$('dialogue').hidden=false;dialogueTime=duration;}
// kind 'dust' stays in the painted layer; everything else becomes glowing 3D sparks.
function burst(x,y,color,count=14,speed=150,kind='glow'){if(kind!=='dust'&&stage){stage.burst(x,y,color,count,speed);return;}for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=Math.random()*speed;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(kind==='dust'?speed*.35:0),life:.4+Math.random()*.5,max:1,color,r:(kind==='dust'?3:1)+Math.random()*3,kind});}}
function dust(x,y,count=6,spread=1){for(let i=0;i<count;i++)particles.push({x:x+(Math.random()-.5)*20*spread,y:y-2,vx:(Math.random()-.5)*90*spread,vy:-20-Math.random()*45,life:.45+Math.random()*.4,max:.85,color:'#cdb68a',r:4+Math.random()*6,kind:'dust'});}
function label(text,x,y,color='#f6d895'){floating.push({text:tr(text),x,y,life:1.1,color});}
function hideModals(){['menu','pause-menu','settings','lore','death','victory','levels','level-done','knjiga','riznica'].forEach(id=>$(id).hidden=true);}
function newPlayer(x=150){return{x,y:590,w:34,h:112,vx:0,vy:0,face:1,hp:120,maxHp:120,energy:100,wine:3,buff:0,invuln:0,attack:0,attackKind:'light',attackId:0,cooldown:0,parry:0,parryCooldown:0,dash:0,dashCooldown:0,grounded:true,coyote:.12,jumpBuffer:0,airLift:false,anim:0,gait:0,landing:0,mountTime:0,hurt:0,drink:0,castLock:0,crouch:0,crouching:false,blocking:false,blockTime:0,guard:100,guardBreak:0,rage:0,superImpact:false,spin:0,spinTick:0,spinTurns:0,climb:null,drop:0,throwT:0,wineMax:3,power:1,coins:0,down:0,comboWindow:0,wallJumpT:0,plungeT:0,hurtLock:0,wall:0,wallSide:0,cd:{throw:0,uvis:0,juris:0,plunge:0}};}
function newBoss(){return{x:29100,y:590,w:50,h:100,hp:3120,maxHp:3120,phase:1,mode:'idle',timer:1.5,face:-1,flash:0,stun:0,alive:true,hitIds:new Set(),attack:0,attackDone:false};}
function start(resume=false){showControls();level=null;perks=new Set(DEV?['oceva-sablja']:[]);coins=[];chunks=[];thrown=null;levelIndex=-1;stage?.setLevel?.(null);endSequence=null;initAudio();world=makeWorld();defenses={0:{active:false,t:0,wave:0,done:false},1:{active:false,t:0,wave:0,done:false},4:{active:false,t:0,wave:0,done:false}};p=newPlayer();boss=newBoss();boss.hp=boss.maxHp=Math.round(4400*Math.max(1,D().hp*.92));hardenFoes(world.enemies);zone=0;checkpoint=0;camera=0;camY=CAM_Y0;elapsed=0;deaths=0;kills=0;relics=0;horseMounted=false;horseCompleted=false;horseX=10960;particles=[];arrows=[];floating=[];corpses=[];bones=[];heads=[];limbs=[];gibs=[];booms=[];fountains=[];finisher=null;grapple=null;finGlobal=0;grappleCool=0;training=null;ghosts=[];if(resume&&saveState)restore(saveState);hideModals();mode='play';$('hud').hidden=false;$('controls').hidden=false;$('touch').hidden=!matchMedia('(pointer:coarse)').matches;$('boss-hud').hidden=true;speak(chapters[zone].message);keys.clear();pressed.clear();pendingMagic=null;fairy={x:p.x-55,y:p.y-125,age:99,duration:3.2,targetX:p.x,targetY:p.y-80,kind:"hover"};updateHud();}
function snapshot(){return{version:1,zone,checkpoint,elapsed,deaths,kills,relics,maxHp:p.maxHp,wine:p.wine,dead:world.enemies.filter(e=>!e.alive).map(e=>e.id),taken:world.items.filter(i=>i.taken).map(i=>i.id),runes:world.runes.map(r=>r.active),horseCompleted};}
function save(){saveState=snapshot();try{localStorage.setItem('marko-save',JSON.stringify(saveState));}catch{}$('continue').hidden=false;}
function restore(s){zone=clamp(s.zone||0,0,5);checkpoint=zone;p=newPlayer(chapters[zone].start+130);p.maxHp=s.maxHp||120;p.hp=p.maxHp;p.wine=Math.max(2,s.wine||0);elapsed=s.elapsed||0;deaths=s.deaths||0;kills=s.kills||0;relics=s.relics||0;world.enemies.forEach(e=>{if(s.dead?.includes(e.id))e.alive=false;});world.items.forEach(i=>i.taken=s.taken?.includes(i.id)||false);world.runes.forEach((r,i)=>r.active=!!s.runes?.[i]);horseCompleted=!!s.horseCompleted;horseMounted=false;camera=Math.max(chapters[zone].start,p.x-VIEW_W*.4);lastSafe=p.x;}
function retry(){if(level&&ckpt){ckptRespawn();return;}if(level){const d=deaths;startLevel(levelIndex).then(()=>{deaths=d;});toast('Ravijojla: Još tvoja pesma nije završena.');return;}const d=deaths;start(!!saveState);deaths=d;toast('Ravijojla: Još tvoja pesma nije završena.');}
function die(){if(mode!=='play')return;say('death',{priority:6});deaths++;mode='dead';p.hp=0;p.attack=0;p.drink=0;p.dash=0;pendingMagic=null;arrows=[];keys.clear();pressed.clear();if(horseMounted){horseMounted=false;horseX=p.x+85;}const y=p.y>800?590:p.y,x=p.y>800?lastSafe:p.x;corpses.push(makeCorpse('marko',x,y,p.face,true,p.vy));endSequence={kind:'death',age:0};$('dialogue').hidden=true;$('death').hidden=true;updateHud();sound('hurt');}
function damage(amount,dir=0){if(p.invuln>0||p.dash>0)return;let blocked=false;if(p.blocking&&dir===-p.face){const cost=amount*2.3;if(p.guard>=cost){p.guard-=cost;amount*=.2;blocked=true;fx('parry',p.x+p.face*30,p.y-65);sound('parry');label('BLOK',p.x,p.y-135,'#bce5db');sfx('shield',{gain:.8});say('block',{chance:.65});}else{p.guard=0;p.guardBreak=.85;p.blocking=false;toast('Gard je slomljen',1);sfx('clang',{rate:.7});say('hurt',{priority:2});}}rumble(amount>=20?.8:.45,amount>=20?260:140);p.rage=Math.min(100,p.rage+amount*.7);const factor=D().dmg*(p.buff>0?.8:1)*(perks.has('musina-sablja')?.9:1);p.hp-=amount*factor;p.hurt=blocked?.06:.22;p.invuln=blocked?.2:D().invuln;p.vx+=dir*120;if(!blocked&&amount>=20&&!horseMounted&&p.hp-amount*factor>0&&p.grounded){p.down=DOWN_TIME;p.attack=0;p.spin=0;p.dash=0;p.vx=dir*300;p.invuln=Math.max(p.invuln,DOWN_TIME+.2);dust(p.x,p.y,10,1.6);}shake=settings.reduced?0:7;burst(p.x,p.y-60,'#ff6a50',12);fx('flash','#ff3020',.06);sound('hurt');if(p.hp>0)say('hurt',{chance:.8});if(p.hp<=0){p.hp=0;die();}}
function strike(heavy=false){if(p.plunge||p.down>0||p.ledgeT>0||p.wall||p.climb||thrown||p.throwT>0)return;if((p.attack>0&&p.chargeable&&!p.chargeReleased)||p.spin>0||p.cooldown>0||p.dash>0||p.drink>0||p.blocking||p.crouching||p.guardBreak>0||p.slide>0||p.kick>0)return;if(heavy&&tryLomilac())return;if(heavy&&!p.grounded&&has('tresak')&&level!==undefined){p.attack=.34;p.attackKind='tresak';p.cooldown=.3;p.attackId=++attackSerial;p.charge=0;p.chargeable=false;p.airAtk=false;sound('swing');sayGrunt(true);return;}if(!heavy){p.combo=p.comboWindow>0?((p.combo||0)+1)%3:0;if(!has('niz'))p.combo=0;p.comboImpact=false;}p.airAtk=!heavy&&!p.grounded;p.attack=heavy?.52:p.airAtk?.3:COMBO_TIME[p.combo];p.attackKind=heavy?'heavy':'light';p.runAtk=!heavy&&!p.airAtk&&p.grounded&&Math.abs(p.vx)>180&&(p.combo||0)===0;p.cooldown=heavy?.78:p.airAtk?.17:COMBO_CD[p.combo];if(!heavy)p.comboWindow=p.attack+.35;p.attackId=++attackSerial;p.charge=0;p.chargeable=heavy&&tap('KeyK')&&has('zamah');p.chargeFull=false;p.chargeReleased=false;sound('swing');powerSwing();if(heavy)say('atk',{chance:.4});}
const COMBO_TIME=[.36,.36,.5],COMBO_CD=[.3,.3,.56];function updateCooldowns(dt){if(p.cd)for(const k in p.cd)p.cd[k]=Math.max(0,p.cd[k]-dt);p.cdFlashT=Math.max(0,(p.cdFlashT||0)-dt);p.pogoT=Math.max(0,(p.pogoT||0)-dt);p.launchT=Math.max(0,(p.launchT||0)-dt);if(!p.grounded&&p.airAtk&&p.attack>0&&p.airHits>0&&!p.plunge)p.vy-=1750*.5*dt;if(p.grounded)p.airHits=0;if(p.attackKind==='heavy'&&p.attack>0&&p.chargeable&&!p.chargeReleased){const lvl=Math.floor(clamp((p.charge||0)/1.1,0,1)*3+.0001);if(lvl!==p.chargeLvl){p.chargeLvl=lvl;if(lvl>0)sfx('ring',{gain:.45,rate:1+lvl*.25});}}else p.chargeLvl=0;}
function attackDuration(){return p.attackKind==='tresak'?.34:p.attackKind==='light'&&p.airAtk?.3:p.attackKind==='lomilac'?.56:p.attackKind==='uvis'?.42:p.attackKind==='juris'?.42:p.attackKind==='super'?.95:p.attackKind==='counter'?.55:p.attackKind==='heavy'?.52:COMBO_TIME[p.combo||0];}
function superStrike(){if(!has('junacki')){locked('junacki');return;}if(p.rage<100){toast('Junački bes puni se pogocima i odbijanjem.',2);return;}if(p.cooldown>0||p.dash>0||p.drink>0||horseMounted||!p.grounded||p.guardBreak>0)return;p.rage=0;p.attack=.95;p.attackKind='super';p.cooldown=1.4;p.superImpact=false;p.blocking=false;p.crouching=false;p.crouch=0;p.invuln=Math.max(p.invuln,.7);sound('swing');toast('JUNAČKI UDAR',1.2);say('super',{priority:4,gap:0});say('tr_fear',{chance:.5,delay:1.2,x:p.x+p.face*200});say('vila_super',{chance:.3,delay:2.6});}
function isDown(...codes){if(p&&(p.down>0||p.ledgeT>0||p.plunge===2||p.dizzy>0))return false;return codes.some(c=>keys.has(c));}function tap(...codes){if(p&&(p.down>0||p.ledgeT>0||p.plunge===2||p.dizzy>0))return false;return codes.some(c=>pressed.has(c));}
// Ravijojla flies at the viewer: small and far, then big as she passes the screen. The first call in each
// chapter and a heal when Marko is nearly done for. A CSS sprite over the game: one image, no cost to the frame.
let flybyZones=new Set(),flybyAt=-99;
function fairyFlyby(){if(!hasDom||settings.reduced||time-flybyAt<30)return;flybyAt=time;let el=$('vila-flyby');if(!el){el=document.createElement('div');el.id='vila-flyby';document.body.appendChild(el);}
 el.classList.remove('go');void el.offsetWidth;el.classList.add('go');sfx('magic',{gain:.5,rate:.8});}
function callFairy(kind,x,y){if(!flybyZones.has(zone)||(kind==='heal'&&p&&p.hp<p.maxHp*.25)){flybyZones.add(zone);fairyFlyby();}if(p&&p.grounded&&!horseMounted&&p.attack<=0&&rig?.['marko-call'])p.callT=CALL_TIME;say('vila_'+(kind==='stun'||kind==='bridge'||kind==='lift'?kind:'heal'),{priority:2,x:fairy.x,delay:.2});say('fairy',{chance:.3});fairy.age=0;fairy.duration=3.2;fairy.kind=kind;fairy.targetX=x;fairy.targetY=y;p.castLock=.8;burst(fairy.x,fairy.y-25,'#caffdf',24,95);sound('magic');}
function useFairy(){
 if(p.castLock>0)return;
 if(level&&(useGoal()||pullLever()||pullLift()||useBacva()||useSoko()||useSirotinja()))return;
 if(zone===3&&!horseCompleted&&!horseMounted&&Math.abs(p.x-horseX)<180){horseMounted=true;p.mountTime=.55;p.x=horseX;say('horse',{priority:2});sfx('hoof',{gain:.8});sfx('hoof',{gain:.6,delay:.12});toast('Šarac · D za galop, Space za skok',4);sound('magic');fx('spell',horseX,520);return;}
 const rune=world.runes.find(r=>!r.active&&Math.abs(p.x-r.x)<120);
 if(rune){if(p.energy<30){toast('Sačekaj da se obnovi vilinska energija.');return;}p.energy-=30;callFairy('bridge',rune.x+200,530);pendingMagic={delay:.55,apply:()=>{rune.active=true;rune.awakeT=time;burst(rune.x+200,560,'#a7ffe0',50);fx('pillar',rune.x,565);toast('Ravijojla je probudila vilinski most');}};return;}
 if(p.energy<35){toast('Potrebno je 35 vilinske energije.');return;}
 p.energy-=35;
 if(!p.grounded&&!p.airLift&&has('uzlet')){callFairy('lift',p.x,p.y-120);p.vy=-620;p.airLift=true;burst(p.x,p.y,'#a6ffe1',35,220);fx('spell',p.x,p.y-20);toast('Vilinski uzlet',1.5);return;}
 const target=zone===5&&Math.abs(boss.x-p.x)<350?boss:world.enemies.find(e=>e.alive&&Math.abs(e.x-p.x)<330);
 callFairy(target?'stun':'heal',target?.x??p.x,target?target.y-70:p.y-45);
 pendingMagic={delay:.55,apply:()=>{world.enemies.filter(e=>e.alive&&Math.abs(e.x-p.x)<330).forEach(e=>{e.stun=2;e.mode='stun';});if(zone===5&&Math.abs(boss.x-p.x)<350){musaWindow('dazed',2.2,'RAVIJOJLIN BLJESAK');toast('Ravijojlin bljesak — napadni!',2);}else{{const h=Math.round(12*D().heal);p.hp=Math.min(p.maxHp,p.hp+h);toast(`Ravijojlin blagoslov · +${h} zdravlja`,2);}}burst(fairy.targetX,fairy.targetY,'#d0ffe2',35,200);fx('spell',fairy.targetX,fairy.targetY);}};
}
function updatePlayer(dt){
 if(p.pinned){p.vx=0;p.vy=0;p.attack=0;p.blocking=false;p.spin=0;p.dash=0;p.parry=0;return;}
 for(const key of ['invuln','attack','cooldown','parry','parryCooldown','dash','dashCooldown','buff','landing','mountTime','hurt','drink','vida','castLock','guardBreak','down','comboWindow','wallJumpT','plungeT','hurtLock','drop'])p[key]=Math.max(0,p[key]-dt);if(p.attackKind==='heavy'&&p.attack>0&&p.chargeable){const ph=1-p.attack/attackDuration();if(ph>=.36&&isDown('KeyK')&&!p.chargeReleased){p.attack+=dt;p.cooldown+=dt;p.charge=Math.min(1.1,p.charge+dt);if(p.charge>=1.1&&!p.chargeFull){p.chargeFull=true;fx('flash','#ffd27a',.06);sfx('ring',{gain:.6});label('PUN ZAMAH',p.x,p.y-150,'#ffd890');}}else if(ph>=.36&&p.charge>.15&&!p.chargeReleased){p.chargeReleased=true;sayGrunt(true);}}p.energy=Math.min(100,p.energy+dt*(perks.has('vilino-pero')?7.5:5.5));if(p.drink>0&&p.drink<.38&&!p.drinkApplied){p.drinkApplied=true;p.buff=12;p.hp=Math.min(p.maxHp,p.hp+Math.round(18*D().heal));sound("wine");say('wine',{priority:2,delay:.5});say('vila_wine',{chance:.5,delay:3.4});toast("Junačko vino · +30% snage · 12 sekundi",3);burst(p.x,p.y-65,"#e0a95a",20);fx('flash','#ffb040',.08);}p.anim+=dt;p.gait+=Math.abs(p.vx)*dt/(horseMounted?42:25);fairy.age+=dt;if(pendingMagic){pendingMagic.delay-=dt;if(pendingMagic.delay<=0){const effect=pendingMagic;pendingMagic=null;effect.apply();}}
 if(p.grounded){p.coyote=.12;p.airLift=false;}else p.coyote-=dt;
 if(climbInput())p.jumpBuffer=0;else if(tap('Space')&&!p.climb)p.jumpBuffer=.14; // Space alone jumps: up (W, ↑) is for the blows upward, ladders and doorselse p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);
 p.crouching=p.grounded&&!horseMounted&&p.attack<=0&&p.drink<=0&&(isDown('KeyS','ArrowDown')||lowCeiling());p.crouch=clamp(p.crouch+(p.crouching?1:-1)*dt*7,0,1);p.h=112-48*p.crouch;
 p.blocking=isDown('KeyL')&&p.grounded&&!horseMounted&&!p.crouching&&p.attack<=0&&p.drink<=0&&p.dash<=0&&p.guardBreak<=0&&p.guard>0;
 p.blockTime=clamp(p.blockTime+(p.blocking?1:-1)*dt*8,0,1);p.guard=clamp(p.guard+dt*(p.blocking?-12:p.guardBreak>0?0:26),0,100);if(p.guard<=0&&p.blocking){p.guardBreak=.85;p.blocking=false;toast('Gard je slomljen',1);sfx('clang',{rate:.7});say('hurt',{priority:2});}
 if(tap('KeyR'))superStrike();updateCounter();if(p.plunge===1){p.vy=Math.max(p.vy,950);p.vx*=.9;}if(p.plunge===2&&p.plungeT<=0)p.plunge=0;updateSpin(dt);ambientVoices();
 if(p.attackKind==='super'&&p.attack>0&&p.attack<.45&&!p.superImpact){p.superImpact=true;sfx('boom',{gain:1});sfx('rock',{gain:.8});fx('hit',p.x+p.face*70,p.y-12,true);burst(p.x+p.face*70,p.y-12,'#ffcc72',24,240);dust(p.x,p.y,20,2.5);shake=settings.reduced?0:9;sound('hit');}
 const axis=(isDown('KeyD','ArrowRight')?1:0)-(isDown('KeyA','ArrowLeft')?1:0);if(axis)p.face=axis;
 const speed=horseMounted?480:265*(perks.has('sarceva-potkova')?1.07:1)*(stickMag<.7?.42:1);const target=p.wallJumpT>.12?p.vx:axis*speed*(p.spin>0?.5:p.attackKind==='super'&&p.attack>0?.12:p.blocking?.22:p.crouching?.3:p.attack>0?(p.runAtk&&p.attackKind==='light'?.85:.5):p.drink>0?.45:1);p.vx+= (target-p.vx)*Math.min(1,dt*(p.grounded?20:9));
 if(p.jumpBuffer>0&&p.wall&&!p.grounded){p.vy=-650;p.vx=-p.wall*440;p.wallSide=p.wall;p.face=-p.wall;p.wall=0;p.wallJumpT=.32;p.jumpBuffer=0;p.runJump=false;sound('jump');sayGrunt(false);dust(p.x+p.wallSide*16,p.y-40,6,1);}if(p.jumpBuffer>0&&p.coyote>0&&!p.climb){p.vy=horseMounted?-780:p.launchT>0?-820:-665;if(p.launchT>0&&!horseMounted){p.launchT=0;label('ZA NJIM!',p.x,p.y-150,'#ffe39a');}p.grounded=false;p.coyote=0;p.jumpBuffer=0;p.crouching=false;p.crouch=0;p.h=112;p.blocking=false;p.runJump=!horseMounted&&Math.abs(p.vx)>240;sound('jump');dust(p.x,p.y,horseMounted?10:6);}
 if(tap('ShiftLeft','ShiftRight')&&p.dashCooldown<=0&&!horseMounted&&(has('kolut')||(locked('kolut'),false))){p.dash=ROLL_TIME;p.dashCooldown=.85;sfx('whoosh',{gain:.6,rate:.8});dust(p.x,p.y,8,1.5);}
 if(p.dash>0){p.vx=p.face*470;if(!p.grounded)p.vy=Math.min(p.vy,0);}moveExtras(dt);
 if(!p.grounded&&!horseMounted&&!p.plunge&&p.attack<=0&&isDown('KeyS','ArrowDown')&&tap('KeyJ')&&(has('nadole')||(locked('nadole'),false))&&(cdReady('plunge')||(cdDenied('plunge'),false)))startPlunge();else if(specialStrike()){}else if(isDown('KeyJ'))strike(false);if(isDown('KeyK'))strike(true);
 if(tap('KeyL')&&p.parryCooldown<=0&&p.guardBreak<=0&&!p.attack&&!p.drink&&!horseMounted&&has('kontra')){p.parry=D().parry;p.parryCooldown=.65;sound('swing');}
 if(tap('KeyQ')){if(p.wine>0&&p.buff<=0&&p.drink<=0){p.wine--;p.drink=.85;p.drinkApplied=false;p.attack=0;}else toast(p.buff>0?'Vino već daje snagu.':'Čutura je prazna. Potraži vino uz drum.',2);}
 if(tap('KeyE'))useFairy();if(tap('KeyI'))throwMace();if(tap('KeyG'))toggleSablja();
 if(p.mountTime>0)p.vx=0;const wasGrounded=p.grounded,fallSpeed=p.vy;if(!p.grounded&&p.vy>150&&perks.has('orlovo-pero')&&isDown('Space')&&!horseMounted&&!p.climb){p.vy=150;if(Math.random()<.3)burst(p.x,p.y-60,'#e8e0c8',1,40);}if(!ledgeUpdate(dt)&&!(level&&updateClimb(dt))){const bp=bodyBlock(dt);p.vx+=bp;integrate(p,dt,world.platforms,world.runes);p.vx-=bp;}if(!p.grounded&&!p.climb){ledgeCheck();wallCheck();}else{p.wall=0;}if(p.plunge===1&&p.grounded)plungeImpact();if(!wasGrounded&&p.grounded&&fallSpeed>220){const lk=clamp((fallSpeed-220)/700,0,1);p.landing=.2;if(fallSpeed>930&&!horseMounted&&p.attack<=0&&rig?.['marko-roll-land'])p.rollLandT=ROLL_LAND_TIME;sfx(horseMounted?'hoof':'land',{gain:horseMounted?.9:.3+.45*lk});dust(p.x,p.y,horseMounted?16:Math.round(5+12*lk),horseMounted?2:1+1.3*lk);if(lk>.75&&!horseMounted){shake=Math.max(shake,settings.reduced?0:2+3*lk);rumble(.25+.3*lk,90);}tone(horseMounted?72:100,.1,"triangle",.12,45);if(horseMounted)shake=Math.max(shake,settings.reduced?0:3);}advanceFairy(dt);p.x=Math.max(chapters[zone].start+35,p.x);
 if(p.grounded&&p.on?.kind!=='crate'){lastSafe=p.x;lastSafeY=p.y;}if(p.y>(world.pitY||850)){damage(20);if(mode==='play'){p.x=Math.max(chapters[zone].start+80,lastSafe-(level?0:80));p.y=level?lastSafeY-160:420;p.climb=null;p.vy=0;p.vx=0;p.invuln=1.2;say('pit',{priority:3});toast('Ravijojla te izvukla iz ponora · −20 zdravlja',2);}}
 if(horseMounted){for(const b of world.barriers){if(Math.abs(p.x-b.x)<38&&p.y>b.y-b.h+10){damage(12,-1);dust(b.x,b.y,14,2);b.x=-1000;}}}
 for(const i of world.items){if(!i.taken&&Math.abs(p.x-i.x)<40&&Math.abs(p.y-38-i.y)<75){i.taken=true;if(i.type==='cudo'){collectCudo(i);continue;}if(i.type==='slovo'){collectLetter(i);continue;}if(i.type==='moc'){takePower(i);continue;}if(i.type==='srce'){takeHeart(i);continue;}if(i.type==='zapis'){takeZapis(i);continue;}if(i.type==='kljuc'){takeKey(i);continue;}if(i.type==='tovar'){i.plow.treasureTaken=true;sfx('coins',{gain:1});addCoins(20,i.x,i.y);label('TOVAR BLAGA',i.x,i.y-30,'#ffe6a0');continue;}if(i.type==='wine'){p.wine=Math.min(5,p.wine+1);label('+ VINO',i.x,i.y);}else if(i.type==='herb'){{const h=Math.round(25*D().heal);p.hp=Math.min(p.maxHp,p.hp+h);label('+'+h,i.x,i.y,'#c0edb0');}}else{relics++;p.maxHp+=10;p.hp=Math.min(p.maxHp,p.hp+25);label('ZAPIS LEGENDE',i.x,i.y);say('relic',{priority:2});sfx('coins');toast('Pronađen zapis · maksimalno zdravlje +10');}sound('wine');burst(i.x,i.y,'#e7c982',12);}}
 if(level){strikeCrates();updatePlows(dt);updateTraps(dt);updateArena();updatePuzzles(dt);pogo();}updateSpecial(dt);updateHints(dt);updateStreak(dt);updateCooldowns(dt);sabljaTick(dt);champTick(dt);updateFoeStates(dt);abilityBar(dt);updatePowers(dt);updateThrow(dt);updateCoins(dt);updateChunks(dt);
 const z=chapters[zone];if(p.x>z.end-130&&zone<5){const remaining=world.enemies.filter(e=>e.zone===zone&&e.alive&&!e.road).length;const locked=(defenses[zone]&&!defenses[zone].done)||remaining>0||(zone===2&&zoneRunes().some(r=>!r.active))||(zone===3&&!horseMounted);if(locked){p.x=Math.min(p.x,z.end-95);if(tap('KeyE')||time%3<dt)toast(remaining?`Preostalo čuvara: ${remaining}. Oslobodi drum.`:zone===2?'Probudi sva tri vilinska kamena.':zone===3?'Za ovaj prolaz potreban je Šarac.':'Zaštiti putnike dok prolaze kroz kapiju.',2);}else enterChapter(zone+1);}
 if(zone===5){p.x=clamp(p.x,28060,29830);}if(level){p.x=Math.min(p.x,level.width-30);updateGoals(dt);if(p.x>=level.goal.x-50){if(!pendingGoal())completeLevel();else{p.x=level.goal.x-52;goalHint(`Još nije kraj: ${goalText()}.`);}}}
 // visual only: footstep dust and dash afterimages
 const step=Math.floor(p.gait/3);if(p.grounded&&Math.abs(p.vx)>120&&step!==p.lastStep&&!p.dash){dust(p.x-p.face*14,p.y,horseMounted?5:2,horseMounted?1.4:.6);if(horseMounted){sfx('hoof',{gain:.55});sfx('hoof',{gain:.4,delay:.07});sfx('hoof',{gain:.45,delay:.15});}else sfx('step',{gain:.28});}p.lastStep=step;if(p.rage>=100&&!p.rageSaid){p.rageSaid=true;say('rage',{priority:2});}else if(p.rage<100)p.rageSaid=false;if(p.hp>0&&p.hp/p.maxHp<.3&&audio&&audio.currentTime-SND.lowAt>25){SND.lowAt=audio.currentTime;say('low',{priority:2});}
 if(p.dash>0&&(p.ghostClock=(p.ghostClock||0)-dt)<=0){p.ghostClock=.075;ghosts.push({...playerPose(),x:p.x,y:p.y,face:p.face,life:.2});}
}
function enterChapter(next){markChapter(next);sfx('horn_call',{gain:.6});{const [num,name]=chapters[next].name.split(' · ');showTitle(`POGLAVLJE ${num}`,name.charAt(0)+name.slice(1).toLowerCase(),chapters[next].goal);}if(next===5){say('musa_intro',{priority:3,delay:1.4});say('boss',{priority:3,delay:6.4});}else say('chapter',{chance:.75,delay:.4});zone=next;checkpoint=next;p.x=Math.max(p.x,chapters[next].start+100);if(next===4){horseMounted=false;horseCompleted=true;horseX=24580;p.x=24630;}p.hp=p.maxHp;p.energy=100;p.wine=Math.max(2,p.wine);p.invuln=2;lastSafe=p.x;arrows=[];save();toast('Kontrolna tačka · napredak sačuvan',3);speak(chapters[zone].message);sound('magic');fx('flash','#ffd890',.1);}
function attackActive(){const d=attackDuration();if(p.attackKind==='super')return p.attack>0&&p.attack<d*.5&&p.attack>d*.18;return p.attack>0&&p.attack<d*.58&&p.attack>d*.12;}
function slay(e,launch=0){if(!e.alive)return;if(e.keyHolder)dropKey(e);bookKill(e);blood(e.x,e.y-60,p.x<e.x?1:-1,22);e.alive=false;kills++;if(level){addCoins(e.champion?0:e.elite?6:2,e.x,e.y-60);if(e.champion){slowMo=1;hitstop=Math.max(hitstop,.12);fx('flash','#fff2d0',.12);p.celebrate=CELEBRATE_TIME;}}if(!e.kit&&!e.tiho)foeSay(e,'death',{chance:.6});sfx('fall',{gain:.7,delay:.45,x:e.x});sfx('leather',{gain:.4,delay:.5,x:e.x});say('kill',{chance:.8,delay:.35});corpses.push(launchCorpse(makeCorpse(e.type,e.x,e.y,e.face),launch,e.x));fx('kill',e.x,e.y);if(e.look&&rig?.[e.look+'-death'])corpses[corpses.length-1].type=e.look;if(e.sablja)dropSablja(e);}
// the song: Marko knows his father's sabre by its three golden hilts, and takes it back
function dropSablja(e){const have=ownedCuda().has('oceva-sablja');if(!have&&!world.items.some(i=>i.cudo==='oceva-sablja'))world.items.push({id:7049,x:e.x,y:e.y-50,type:'cudo',cudo:'oceva-sablja',taken:false});else addCoins(30,e.x,e.y-60);
 speak('Pozna Marko očinu sablju: tri balčaka, tri zlatna. Ne nosi je Turčin više.',5);label('OČEVA SABLJA',e.x,e.y-170,'#ffe2a8');}
function drawSabljaTag(){for(const e of world.enemies)if(e.alive&&e.sablja&&Math.abs(p.x-e.x)<620)textLabel('MLADI TURČIN · OČEVA SABLJA',e.x,e.y-150,{font:'bold 12px Georgia',color:'#ffe2a8'});}
// ================= harder champions =================
// A champion shrugs off blows: only the third light blow (or a heavy one) in a short while staggers him, and during his own
// swing it takes more. He has 15% more health. And Marko cannot hang over his head: a moment there and he is thrown off.
const CHAMP_HP=1.15,CHAMP_POISE=3;
function champStagger(e,heavy){if(!e.champion)return true;if(time-(e.poiseAt||0)>1.8)e.poise=0;e.poiseAt=time;e.poise=(e.poise||0)+(heavy?2:1);
 if(e.poise>=(e.mode==='windup'?CHAMP_POISE+2:CHAMP_POISE)){e.poise=0;return true;}
 sfx('clang',{gain:.35,rate:.8,x:e.x});fx('burst',e.x-p.face*10,e.y-80,'#ffe9c0',6,120);return false;}
function champTick(dt){if(!world?.enemies||mode!=='play')return;champMegdanTick(dt);updateDrops(dt);ckptTick();
 for(const e of world.enemies){if(!e.champion||!e.alive)continue;e.antiAirT=Math.max(0,(e.antiAirT||0)-dt);
  const over=!p.grounded&&!p.climb&&Math.abs(p.x-e.x)<80&&p.y<e.y-80&&p.y>e.y-340;e.overT=over?(e.overT||0)+dt:Math.max(0,(e.overT||0)-dt*2);
  if(e.overT<.22||e.antiAirT>0||e.stun>0||finisher)continue;
  // he swings up at Marko and throws him away
  e.overT=0;e.antiAirT=2;const side=Math.sign(p.x-e.x)||p.face;e.face=side;damage(12,0);p.plunge=0;p.attack=0;p.vy=-420;p.vx=side*500;p.grounded=false;
  label('ZBACIO TE!',p.x,p.y-150,'#ff9a7a');sfx('whoosh_heavy',{gain:.8,x:e.x});sfx('hit_body',{gain:.6});fx('burst',p.x,p.y-60,'#ffb08a',12,200);shake=settings.reduced?0:6;rumble(.5,140);}}
function hitEnemy(e){if(e.hitId===p.attackId||!attackActive())return;const range=p.attackKind==='tresak'?135:p.attackKind==='lomilac'?150:p.attackKind==='juris'?150:p.attackKind==='uvis'?125:p.attackKind==='super'?210:p.attackKind==='heavy'?145+((p.charge||0)>.35?30:0):p.attackKind==='counter'||p.combo===2?130:115;if(Math.abs(e.x-p.x)>range||Math.abs(e.y-p.y)>85||(e.x-p.x)*p.face< -25)return;e.hitId=p.attackId;const heavy=p.attackKind!=='light';if(e.type==='shield'&&!heavy&&e.stun<=0&&e.face!==p.face&&!(e.guardBroken>0)&&(e.x-p.x)*p.face>0){if(!say('guard',{chance:.5}))foeSay(e,'block',{chance:.5});sfx('shield',{gain:.8,x:e.x});label('GARD',e.x,e.y-120,'#c4dbd2');sound('parry');fx('burst',e.x-e.face*-30,e.y-60,'#dfe8ff',10,160);return;}if(e.type==='oklopnik'&&p.attackKind==='light'&&(e.armor??(e.champion?5:3))>0&&!(e.guardBroken>0)){label('OKLOP',e.x,e.y-130,'#d8d2c0');sfx('clang',{gain:.8,x:e.x});fx('burst',e.x-p.face*20,e.y-70,'#ffe9c0',10,170);say('guard',{chance:.4});return;}const defMul=champGuard(e,heavy,foeDefense(e,heavy));if(defMul===0)return;const amount=defMul*(p.attackKind==='lomilac'?1.5:1)*(p.attackKind==='super'?200:p.attackKind==='counter'?44:heavy?48*chargeMult():29*(p.combo===2?1.8:1))*(p.buff>0?1.3:1)*(p.power||1)*(p.attackKind==='light'&&p.sablja?SABLJA_HIT:p.attackKind==='light'&&perks.has('oceva-sablja')?1.12:1)*(heavy&&perks.has('zlatno-ralo')?1.12:1)*(p.pow?.id==='oganj'?1.2:1);e.hp-=amount;powerHit(e);streakHit(e);if(p.attackKind==='lomilac'&&!e.champion){e.vx=p.face*420;e.vy=-260;e.grounded=false;e.air=true;e.stun=Math.max(e.stun,1.2);}if(!p.grounded)airHit(e);if(p.attackKind==='uvis'&&!e.champion&&e.type==='oklopnik'&&(e.armor??3)>0)label('PRETEŽAK',e.x,e.y-150,'#d8d2c0');else if(p.attackKind==='uvis'&&!e.champion){e.air=true;e.vx=0;label('U VAZDUH!',e.x,e.y-150,'#ffe39a');e.juggle=1.2;e.vy=-660;e.grounded=false;e.air=true;e.climb=null;e.stun=Math.max(e.stun,1.3);}if(p.attackKind!=='super')p.rage=Math.min(100,p.rage+(heavy?18:12)*(perks.has('gusle')?1.25:1));e.flash=.15;const staggered=!e.guarded&&champStagger(e,heavy);if(staggered){e.stun=heavy?1:.32;e.mode='stun';}e.knock=p.face*(heavy?16+(p.charge||0)*30:p.combo===2?18:8)*(staggered?1:.3);e.hurtT=.34;if(e.hp>0)foeSay(e,'hurt',{chance:heavy?.35:.15});if(!e.guarded){fx('hit',e.x-p.face*8,e.y-62,heavy);blood(e.x-p.face*6,e.y-66,p.face,p.attackKind==='super'?40:heavy?24:13);}sound('hit');shake=settings.reduced?0:heavy?5:2;hitstop=.035;label(Math.round(amount),e.x,e.y-110);if(e.hp<=0){slay(e,launchPower());dust(e.x,e.y,10,1.4);p.energy=Math.min(100,p.energy+7);}}
function enemyAttack(e){const distance=Math.abs(p.x-e.x);if(e.type==='archer'){sfx('bow',{gain:.7,x:e.x});arrows.push(level?{...aimArrow(e),life:3,enemy:true}:{x:e.x+e.face*30,y:e.y-80,vx:e.face*390,life:3,enemy:true});sound('swing');return;}if(distance<(e.champion?140:105)&&Math.abs(p.y-e.y)<80){if(p.parry>0&&(e.x-p.x)*p.face>=-15){e.stun=2;e.mode='stun';p.energy=Math.min(100,p.energy+15);fx('parry',p.x+p.face*40,p.y-70);burst(p.x+p.face*40,p.y-70,'#dcfff0',30);p.rage=Math.min(100,p.rage+25);sound('parry');say('block',{chance:.5,delay:.15});label('SAVRŠENO',p.x,p.y-140,'#bfffe5');startCounter(e.x);}else damage((e.type==='shield'?18:14)*(e.champion?1.5:e.elite?1.25:1),e.face);}}
function updateEnemies(dt){updateFires(dt);for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;if(e.held||e.grappling){e.flash=0;continue;}const F=FOES[e.type];if(level){foeBody(e,dt);if(!e.alive)continue;if(e.grounded&&!e.climb)e.vx=0;}else if(e.air){e.vx=e.vx||0;e.vy=e.vy||0;e.h=e.h||75;e.floorOnly=true;foeBody(e,dt);if(!e.alive)continue;if(e.grounded)e.vx=0;}foeMotion(e,dt);e.flash=Math.max(0,e.flash-dt);e.moveCool=Math.max(0,(e.moveCool||0)-dt);e.hurtT=Math.max(0,(e.hurtT||0)-dt);e.stun=Math.max(0,e.stun-dt);e.knock=(e.knock||0)*Math.pow(.0008,dt);if(!level)e.moveT=0;hitEnemy(e);if(!e.alive)continue;if(e.enter&&enterStep(e,dt))continue;if(e.kit&&e.engaged&&e.alive&&kitRun(e,dt))continue;if(e.stun>0||(e.air&&!e.grounded&&e.juggle>0))continue;if(e.mode==='stun'){e.mode='idle';e.timer=.5;}const dx=p.x-e.x,d=Math.abs(dx);if(e.type==='shield'&&level){const want=dx>0?1:-1;if(want!==e.face){e.turnT=(e.turnT||0)+dt;if(e.turnT>.55){e.face=want;e.turnT=0;}}else e.turnT=0;}else e.face=(e.preyHit&&e.prey?e.prey.x-e.x:dx)>0?1:-1;e.timer-=dt;if(e.mode==='windup'){if(e.timer<=0){e.mode='recover';e.timer=F?.recover??(e.type==='shield'?1.1:.85);if(e.move){e.recMove=e.move;e.move.go(e,Math.abs(p.x-e.x));e.move=null;e.moveCool=3+Math.random()*2.5;}else if(e.champion&&championAttack(e,F)){}else if(F)foeAttack(e,F);else enemyAttack(e);}}else if(e.mode==='recover'){if(e.timer<=0){e.mode='idle';e.timer=.3;e.recMove=null;}}else if(level?levelFoe(e,F,dx,d,dt):d<650){const reach=F?.reach??(e.type==='archer'?480:84);if(d>reach&&tryMove(e,d)){}else if(d>reach){const nx=e.x+e.face*(F?.speed??(e.type==='shield'?65:95))*dt;const ground=world.platforms.some(q=>q.kind!=='magic'&&nx>q.x+25&&nx<q.x+q.w-25&&Math.abs(q.y-e.y)<2);if(ground){e.walk=(e.walk||0)+Math.abs(nx-e.x);e.moveT=.12;e.x=nx;}}else if(e.timer<=0){if(e.type!=='archer')sfx('draw',{gain:.3,x:e.x});else sfx('cloth',{gain:.35,x:e.x});foeSay(e,'attack',{chance:.14});e.mode='windup';e.timer=(F?.windup??(e.type==='archer'?1.05:.7))*D().wind;if(F)e.variant=F.pick(d);else closeMove(e,d);e.windupDuration=e.timer;}}}}
function updateArrows(dt){for(const a of arrows){a.x+=a.vx*dt;if(!a.torch&&a.vy)a.y+=a.vy*dt;a.life-=dt;if(level&&!a.torch&&world.platforms.some(q=>q.solid&&!q.off&&a.x>q.x&&a.x<q.x+q.w&&a.y>q.y+4&&a.y<q.y+q.h)){a.life=0;dust(a.x,a.y,2,.5);continue;}if(a.torch){a.vy+=900*dt;a.y+=a.vy*dt;a.rot=(a.rot||0)+dt*12*Math.sign(a.vx);const gy=groundAt(a.x,a.y-40);if(gy!==null&&a.y>=gy){addFire(a.x,gy,a.bomb?3.6:a.enemy?2.8:1.5,a.bomb?170:80);sfx('boom',{gain:.35,rate:1.6,x:a.x});a.life=0;continue;}if(a.y>900){a.life=0;continue;}}if(a.life>0&&Math.abs(a.x-p.x)<27&&a.y>p.y-p.h&&a.y<p.y){if(p.parry>0&&!a.flame){a.enemy=false;a.vx=-a.vx;if(a.vy)a.vy=-a.vy;p.rage=Math.min(100,p.rage+20);sound('parry');fx('parry',a.x,a.y);burst(a.x,a.y,'#e6fff3',10);}else if(a.enemy){damage(a.wave?20:a.flame?8:a.spear?26:a.bullet?24:11,Math.sign(a.vx));a.life=0;}}if(a.torch&&a.enemy&&!a.coal&&a.life>0&&attackActive()&&Math.abs(a.x-(p.x+p.face*40))<60&&a.y>p.y-p.h-30&&a.y<p.y&&(a.x-p.x)*p.face>-20){a.enemy=false;a.vx=p.face*Math.max(360,Math.abs(a.vx)*1.2);a.vy=-380;sfx('clang',{gain:.6,rate:1.3,x:a.x});burst(a.x,a.y,'#ffb050',10);p.rage=Math.min(100,p.rage+10);}
 if(!a.enemy){for(const e of world.enemies){if(e.alive&&Math.abs(a.x-e.x)<30&&a.y>e.y-135&&a.y<e.y+12){if(a.torch&&!e.champion){ignite(e);a.life=0;break;}e.hp-=e.type==='archer'&&!e.champion?999:a.spear?90:40;if(e.type==='archer')weakHit('SOPSTVENA STRELA!');if(a.spear){weakHit('SOPSTVENO KOPLJE!');e.kitOpen=2.4;}e.stun=a.spear?2.4:1;e.flash=.15;a.life=0;fx('hit',e.x,e.y-70,false);if(e.hp<=0)slay(e);break;}}}}arrows=arrows.filter(a=>a.life>0);}
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
function spinHit(){const power=p.buff>0?1.3:1,reach=p.sablja?160:125;let hits=0; // the sabre held out at arm's length reaches further than the mace
 for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;const dx=e.x-p.x;if(Math.abs(dx)>reach||Math.abs(e.y-p.y)>90)continue;const amount=16*power;e.hp-=amount;e.flash=.12;e.stun=Math.max(e.stun,.3);e.mode='stun';e.knock=Math.sign(dx||1)*12;hits++;fx('hit',e.x-Math.sign(dx||1)*8,e.y-62,false);label(Math.round(amount),e.x,e.y-110);if(e.hp<=0){slay(e,launchPower());dust(e.x,e.y,10,1.4);p.energy=Math.min(100,p.energy+5);}}
 if(zone===5&&boss.alive&&Math.abs(boss.x-p.x)<reach+25){if(MUSA_OPEN.includes(boss.mode)){const amount=22*power;boss.hp=Math.max(0,boss.hp-amount);boss.flash=.12;fx('hit',boss.x,boss.y-80,false);label(Math.round(amount),boss.x,boss.y-160);hits++;bossAfterDamage();}else if(p.spinTurns%3===0){label('ČELIČNI GARD',boss.x,boss.y-170,'#c1ced4');sfx('clang',{gain:.6});}}
 if(hits){sound('hit');shake=settings.reduced?0:3;}dust(p.x,p.y,4,1.6);}
function sayGrunt(heavy){if(time-lastGrunt<(heavy?1.6:2.4)||Math.random()>(heavy?.6:.3))return sfx(heavy?'whoosh_heavy':'whoosh',{gain:.5});lastGrunt=time;gruntCount++;if(!audio||!SND.ready)return sfx(heavy?'whoosh_heavy':'whoosh',{gain:.6});if(p.attackKind==='super'&&p.attack>0)return;const m=SND.speaking.marko;if(m&&audio.currentTime<m.until-.4)return;const ids=SND.voices.filter(v=>v.startsWith(heavy?'gruntheavy_':'grunt_')&&SND.buf['voice/'+v]);if(!ids.length)return sfx('whoosh',{gain:.6});let id=ids[Math.floor(Math.random()*ids.length)];if(ids.length>1&&id===SND.lastGrunt)id=ids[(ids.indexOf(id)+1)%ids.length];SND.lastGrunt=id;playBuf(SND.buf['voice/'+id],{bus:'voice',gain:(heavy?.8:.65)*(SND.norm[id]||1),rate:.95+Math.random()*.1});}
// Trash talk while enemies are close, Musa's taunts, Ravijojla worrying about Marko.
function ambientVoices(){if(!audio||!SND.ready)return;const t=audio.currentTime;if(zone===5&&boss.alive){if(t-(SND.musaAt||0)>16&&Math.abs(boss.x-p.x)<500){SND.musaAt=t;say('musa_taunt',{chance:.7,x:boss.x});}}else if(t-(SND.tauntAt||0)>13&&world.enemies.some(e=>e.alive&&e.zone===zone&&Math.abs(e.x-p.x)<420)){SND.tauntAt=t;if(Math.random()<.4){const e=world.enemies.find(e=>e.alive&&e.zone===zone&&Math.abs(e.x-p.x)<420);foeSay(e,'taunt');}else say('taunt',{chance:.65});}
 if(p.hp>0&&p.hp/p.maxHp<.25&&t-(SND.worryAt||0)>30){SND.worryAt=t;say('vila_worry',{delay:1.8,priority:2});}}
function drawSpinFx(){if(!(p.spin>0))return;const a0=p.spin*17,cx=p.x,cy=p.y-60;for(const [g,al] of [[gctx,.55],[ctx,.22]]){g.save();g.translate(cx,cy);g.scale(1,.38);for(let k=0;k<3;k++){const a=a0+k*2.09;g.beginPath();g.arc(0,0,98,a,a+1.25);g.arc(0,0,74,a+1.25,a,true);g.closePath();const gr=g.createRadialGradient(0,0,70,0,0,100);gr.addColorStop(0,'rgba(255,220,150,0)');gr.addColorStop(1,`rgba(255,226,170,${al})`);g.fillStyle=gr;g.fill();}g.restore();}emitters.push({id:'spin',kind:'buff',x:p.x,y:p.y+40,rate:34});}

function win(){try{localStorage.setItem('marko-kacanik','won');}catch{}const finalLaunch=launchPower();grantCudo('musina-sablja');say('musa_death',{priority:5,x:boss.x});say('victory',{priority:5,delay:3.2});say('pt_end_1',{priority:3,delay:8.5});sfx('boom',{gain:.7});boss.alive=false;mode='victory';corpses.push(launchCorpse(makeCorpse('musa',boss.x,boss.y,boss.face,true),finalLaunch*.6,boss.x));endSequence={kind:'victory',age:0};p.attack=0;p.dash=0;pendingMagic=null;arrows=[];keys.clear();pressed.clear();fx('roar',boss.x,boss.y);$('victory').hidden=true;$('boss-hud').hidden=true;$('dialogue').hidden=true;$('stats').innerHTML=`<div><b>${formatTime(elapsed)}</b>Vreme prolaska</div><div><b>${kills}</b>Poraženi čuvari</div><div><b>${relics}/3</b>Zapisi legende</div>`;try{localStorage.removeItem('marko-save');}catch{}saveState=null;$('continue').hidden=true;sound('magic');}
function formatTime(t){return`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;}
// ---------- reinforcements come from somewhere: they run in from beyond the edge of the screen or leap down from the rocks ----------
const WAVE_PLAN=[[['run',1],['run',1],['run',1]],[['run',-1],['drop',1],['drop',-1]],[['drop',1],['run',-1],['run',1]]];
function arrive(e,how,side,k=0){e.home=e.x;
 if(how==='drop'){const top=(level?camY:CAM_Y0)-90-k*70;e.x=clamp(e.x+side*40,camera+80,camera+VIEW_W-80);e.y=top;e.vx=-side*70;e.vy=60;e.air=true;e.grounded=false;e.h=e.h||75;e.enter={drop:true,t:0};e.timer=Math.max(e.timer,.6);return e;}
 const tx=e.x;e.x=side>0?camera+VIEW_W+110+k*150:camera-110-k*150;e.face=-side;e.enter={tx,t:0,v:250};return e;}
function enterStep(e,dt){const n=e.enter;n.t+=dt;
 if(n.drop){if(e.grounded||n.t>3){e.enter=null;if(e.grounded){dust(e.x,e.y,14,1.8);sfx('land',{gain:.6,x:e.x});}return false;}e.face=p.x>e.x?1:-1;return true;}
 const dir=Math.sign(n.tx-e.x),step=Math.min(Math.abs(n.tx-e.x),n.v*dt);e.face=dir||e.face;
 if(level)e.vx=dir*n.v;else e.x+=dir*step;e.walk=(e.walk||0)+step;e.moveT=.12;if(Math.random()<.12)dust(e.x-dir*16,e.y,1,.6);
 if(Math.abs(n.tx-e.x)<8||Math.abs(p.x-e.x)<170||n.t>6){e.enter=null;e.timer=Math.max(e.timer,.35);if(level)e.vx=0;}return true;}
// a horn, a shout and a sign at the edge where they come from
function incoming(plan,who='JANIČARI',rocks='JANIČARI SA STENA',cry='tr_alarm'){const sides=new Set(plan.map(([how,s])=>how==='drop'?0:s));say(cry,{priority:2,x:p.x+300});
 for(const s of sides){const x=s>0?camera+VIEW_W-150:s<0?camera+150:p.x,text=s>0?tr(who)+' ⟶':s<0?'⟵ '+tr(who):'⇩ '+tr(rocks);floating.push({text,x,y:p.y-210,life:2.2,color:'#ffb09a'});}}
const DEF_TEXT={0:'Musina straža zove pojačanje! Tri talasa dolaze, a putnici čekaju iza tebe.',1:'Putnici beže kroz kapiju! Zadrži pojačanje dok svi ne pređu. Tri talasa dolaze sa obe strane.',4:'Obruč se steže oko poslednjeg barjaka! Odbij tri talasa.'};
// ---------- the travellers: Musa has kept them off the road for three years; they follow Marko at a distance ----------
const PUTNIK_ART={starac:'putnik-starac',trgovac:'putnik-trgovac',putnica:'putnica',kaluder:'putnik-kaluder'};
const PUTNIK_LOOK={starac:['#6b5a44','#e8e2d6',1],trgovac:['#5a3a22','#3a2414',0],putnica:['#8a2a22','#efe6d8',0],kaluder:['#1c1a1c','#1c1a1c',2]};
function travelersAt(){return world.travelers||[];}
function travelersSafe(){return zone!==1||travelersAt().every(t=>t.state==='safe'||t.state==='gone');}
function travelersFlee(){travelersAt().forEach((t,i)=>{if(t.state!=='safe'&&t.state!=='gone'){t.state='flee';t.wait=.6+i*2.2;}});}
function updateTravelers(dt){const list=travelersAt();if(!list.length)return;
 // a game resumed further along: they have already gone on, or wait at the gate of the second chapter
 if(!list.placed){list.placed=true;if(zone>=2)list.forEach(t=>t.state='gone');else if(zone===1)list.forEach((t,i)=>{t.x=chapters[1].start+40+i*36;t.state='follow';});}
 if(!list.told&&zone===0&&mode==='play'){list.told=true;say('pt_starac_1',{priority:3,delay:1.2});say('putnici',{priority:3,delay:9.5});speak('Tri godine niko ne prođe ovim drumom. Musa Kesedžija zatvorio je drumove i primorje.',8,'STARAC');}
 list.forEach((t,i)=>{t.scared=Math.max(0,(t.scared||0)-dt);let goal=null,v=72;
  if(t.state==='camp'){t.face=p.x>t.x?1:-1;if(p.x-t.x>520)t.state='follow';}
  if(t.state==='follow'){const z=chapterAt(t.x),open=!((defenses[z]&&!defenses[z].done)||world.enemies.some(e=>e.alive&&e.zone===z)||(z===2));
   goal=Math.min(p.x-300-i*62,open?1e9:chapters[z].end-170-i*48);if(z>=2){t.state='gone';return;}
   if(world.enemies.some(e=>e.alive&&e.x>t.x&&e.x-t.x<330&&!e.enter)){goal=null;t.scared=.4;}}
  if(t.state==='flee'){t.wait-=dt;if(t.wait<=0){goal=chapters[1].end+260;v=95;}if(t.x>chapters[1].end+200){t.state='safe';say('pt_free',{chance:.5,priority:2});}}
  // a gap in the road: they wait at the edge until Ravijojla lays a bridge of light across it
  // they keep a little apart: nobody walks into the one in front of him
  if(goal!=null&&list.some(u=>u!==t&&u.state===t.state&&u.x-t.x>=0&&u.x-t.x<44&&(u.x>t.x||u.id>t.id)))goal=null;
  if(goal!=null&&goal-t.x>24&&!roadUnder(t.x+22)){goal=null;t.waitGap=true;if(!list.gapTold&&Math.abs(p.x-t.x)<900){list.gapTold=true;speak('Putnici ne mogu preko provalije. Probudi vilinski kamen kraj nje (E) i podići će kameni most.',6);}}else if(goal!=null)t.waitGap=false;
  // left behind when Marko goes on to the second chapter, they catch up by another way
  if(zone>=1&&t.state==='follow'&&t.x<chapters[1].start){t.x=chapters[1].start+40+i*36;t.waitGap=false;}
  if(goal!=null&&goal-t.x>24){const step=Math.min(goal-t.x,v*dt);t.x+=step;t.walk+=step;t.face=1;t.moving=.15;}else t.moving=Math.max(0,(t.moving||0)-dt);});
}
function roadUnder(x){return world.platforms.some(q=>q.y===590&&(q.kind!=='magic'||world.runes[q.rune]?.active)&&x>=q.x&&x<=q.x+q.w);}
function zoneRunes(){return world.runes.filter(r=>chapterAt(r.x)===zone);}
function drawTravelers(){drawTravelers.told=false;for(const t of travelersAt()){if(t.state==='safe'||t.state==='gone'||t.x<camera-80||t.x>camera+VIEW_W+80)continue;const art=PUTNIK_ART[t.who],walking=t.moving>0,clip=rig?.[art+(walking?'-walk':'-idle')],y=590;shadow(t.x,y,26,.45);
  if(clip){const n=clip.frames.length;rigDraw(art+(walking?'-walk':'-idle'),walking?Math.floor(t.walk/11)%n:Math.floor(time*5+t.id*2)%n,t.x,y,t.face,{dx:t.scared>0?Math.sin(time*40)*1.5:0});}
  else drawTravelerFallback(t,y,walking);
  if(t.waitGap&&!drawTravelers.told){drawTravelers.told=true;const r=world.runes.find(r=>r.road&&!r.active&&Math.abs(r.x-t.x)<260);if(r)textLabel('PUTNICI ČEKAJU MOST · PROBUDI KAMEN (E)',r.x,452,{font:'bold 12px Georgia',color:'#dfffee',glow:'#7fffd0'});}
  if(t.state==='camp'&&t.id===3&&Math.abs(p.x-t.x)<420)textLabel('PUTNICI · MUSA IM NE DA DA PROĐU',t.x-75,y-150,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffcf7a'});}}
// until the painter's pictures arrive: a cloaked figure with the colours of each traveller
function drawTravelerFallback(t,y,walking){const [coat,head,kind]=PUTNIK_LOOK[t.who],b=walking?Math.sin(t.walk/9)*2:Math.sin(time*2+t.id)*1,f=t.face,s=t.who==='putnica'?.92:1;
 ctx.save();ctx.translate(t.x,y);ctx.scale(f*s,s);
 poly([[-16,0],[16,0],[11,-62+b],[-11,-62+b]],coat);ellipse(0,-74+b,10,12,'#d9b48c');ellipse(0,-83+b,11,6,head);
 if(kind===1)line(16,0,20,-80+b,'#7a5a3a',3);if(kind===2)poly([[-9,-86+b],[9,-86+b],[8,-96+b],[-8,-96+b]],'#111');
 if(t.who==='trgovac')ellipse(-12,-50+b,11,15,'#8a6a40');if(t.who==='putnica'){ellipse(18,-30,7,8,'#d9b48c');poly([[12,0],[24,0],[22,-24],[14,-24]],'#c8b090');}
 ctx.restore();}
function updateGallop(){if(!horseMounted||zone!==3)return;
 for(const e of world.enemies){if(!e.alive||!e.road||Math.abs(e.x-p.x)>58||p.y<e.y-60)continue;
  if(e.type==='shield'&&!(e.guardBroken>0)){if(e.bumpT>0)continue;e.bumpT=1;damage(10,e.x>p.x?-1:1);p.vx=-Math.sign(e.x-p.x)*340;sfx('shield',{gain:1,x:e.x});label('ŠTIT! UDRI SA ŠARCA · J',e.x,e.y-150,'#ffe39a');continue;}
  if(Math.abs(p.vx)<260)continue;slay(e,.85);sfx('hoof',{gain:1,x:e.x});sfx('hit_body',{gain:.9,x:e.x});shake=settings.reduced?0:5;rumble(.5,120);label('PREGAŽEN!',e.x,e.y-140,'#ffcf9a');say('mounted',{chance:.5,priority:2});}
 for(const e of world.enemies)if(e.bumpT>0)e.bumpT-=1/120;}
const BONE_V={oklopnik:1,archer:2,tufekdzija:2};
function addBone(c){if(!rig?.kosturi||c.type==='pas'||c.type==='musa'||c.type==='marko'||c.y>850)return;bones.push({x:c.x,y:c.y,face:c.face,v:c.headless||c.crushed?3:BONE_V[c.type]??0,t:0,scale:c.scale||1});if(bones.length>90)bones.shift();}
function drawBones(){if(!rig?.kosturi)return;for(const b of bones){if(b.x<camera-140||b.x>camera+VIEW_W+140)continue;rigDraw('kosturi',b.v,b.x,b.y,b.face,{alpha:Math.min(1,b.t/1.4),scale:b.scale});}}
// ================= the finish: a stunned, broken or dying Turk, a prompt over his head, one blow — and the head flies =================
const FIN_WINDOW=1.15;let finGlobal=0;
// the four face buttons: X (J) takes the head, Y (K) smashes him into the ground, B (Shift) lifts and hurls him, A (Space) leaps on him
const SABLJA_FIN={odsecanje:'glava',smrskaj:'proburazi',noge:'preseci'};
const FIN_KEYS={KeyJ:'odsecanje',KeyU:'odsecanje',KeyK:'smrskaj',ShiftLeft:'noge',ShiftRight:'noge',Space:'gazi'};
// the beating: three blows strip him (one every ODERI_STEP seconds, landing 60% into it), the fourth and heaviest leaves the skeleton.
// marko-brutal holds him by the collar and has two blows in its 8 frames: raise 0, swing 1, impact 2, recoil 3; raise 4 (and 7), impact 5, recoil 6.
const ODERI_STEP=.24,ODERI_CLIPS=['marko-combo-1','marko-combo-2','marko-combo-3','marko-combo-4'],ODERI_FRAMES=[[0,1,2,2],[7,4,5,5]];
const FIN_INFO={oderi:{dur:1.15,hit:.75,clip:'marko-brutal',fb:'marko-combo-1'},odsecanje:{dur:1.05,hit:.47,clip:'marko-finisher',fb:'marko-finisher'},smrskaj:{dur:1.2,hit:.53,clip:'marko-finisher-skull',fb:'marko-finisher-smash'},
 bacanje:{dur:1.15,hit:.55,clip:'marko-finisher-throw',fb:'marko-throw'},noge:{dur:1.05,hit:.48,clip:'marko-finisher-legs',fb:'marko-finisher'},gazi:{dur:1.15,hit:.66,clip:'marko-finisher-stomp',fb:'marko-plunge'},
 // with the father's sabre out: J cuts the head off, K runs him through, lifts him on the blade and throws him off, Shift cuts him in half
 glava:{dur:1.15,hit:.34,clip:'marko-sablja-glava',fb:'marko-finisher',gap:50},proburazi:{dur:1.6,hit:.8,clip:'marko-sablja-proburazi',fb:'marko-sablja-ubod',gap:58},
 preseci:{dur:1.15,hit:.42,clip:'marko-sablja-preseci',fb:'marko-sablja-udarac-2',gap:40},
 tiho:{dur:1.3,hit:.45,clip:'marko-tiho',fb:'marko-finisher-skull'},tihoS:{dur:1.25,hit:.45,clip:'marko-sablja-tiho',fb:'marko-sablja-udarac-3'}};
// ================= stealth: sleepers, sentries and camps, killed silently from behind =================
// In each pohod some foes doze where they stand, some walk a short beat, and two camps of sleepers lie by a fire.
// A sleeper wakes at a noise: Marko running close, a fight beside him, a blow. A sentry sees only ahead of him (and hears
// a run close by). Unseen and behind him, J kills him silently with the finisher's blow, and the others do not hear it.
// BUDI_FIX: the first frames of sword-budi came out a sixth larger than the sleeping clip, so each is brought back to it.
// SAN_DY: in a few of the shield-bearer's frames his spear lies on the ground below his boots, so those frames sit that much lower.
const TIHO_R=95,TIHO_GAP=40,BUDI_T=.7,BUDI_FIX={sword:[.85,.85,.87,.95,1]},SAN_DY={shield:{spava:[6,0,0,0],budi:[0,0,0,0,6]}},sanDy=(e,clip,f)=>SAN_DY[e.type]?.[clip]?.[f]||0,TIHO_TYPES=['sword','shield','kopljanik','akindzija','palikuca','oklopnik'];
function stealthSetup(){world.logori=[];if(!level||!hasDom)return;let n=0;const sleeps=t=>!rig?.['sword-spava']||!!rig[t+'-spava'];
 const groundAt=x=>world.platforms.find(q=>q.ground&&!q.tower&&x>=q.x&&x<=q.x+q.w);
 for(const e of world.enemies){if(e.champion||e.perch||e.kit||e.skriven||e.prey||e.caus||!TIHO_TYPES.includes(e.type))continue;const q=groundAt(e.x);if(!q||Math.abs(q.y-e.y)>4)continue;
  const r=(e.id*13+levelIndex*7)%9;if(r<2&&sleeps(e.type)){e.spava=true;e.face=e.id%2?1:-1;}else if(r<4&&q.w>380){e.patrola={x0:Math.max(q.x+40,e.x-210),x1:Math.min(q.x+q.w-40,e.x+210),wait:0};e.face=e.id%2?1:-1;}}
 // two camps of sleepers by a fire, on quiet ground away from the start, the goal, traps and other foes
 const camper=o=>!o.champion&&!o.elite&&!o.perch&&!o.kit&&TIHO_TYPES.includes(o.type)&&o.type!=='oklopnik',tpl=world.enemies.find(o=>camper(o)&&o.type==='sword')||world.enemies.find(o=>camper(o)&&sleeps(o.type))||world.enemies.find(camper);if(!tpl)return;
 const span=level.goal.x-level.spawn.x,busy=x=>Math.abs(x-level.spawn.x)<700||Math.abs(x-level.goal.x)<500||(world.traps||[]).some(t=>Math.abs((t.x??t.gate?.x??t.lever?.x??0)-x)<240)||(world.busy||[]).some(([a,b])=>x>a-90&&x<b+90)||world.enemies.some(o=>Math.abs(o.x-x)<200)||(world.goals||[]).some(g=>Math.abs(g.x-x)<260)||(world.ladders||[]).some(l=>Math.abs(l.x-x)<140);
 for(const f of[.33,.68]){const want=level.spawn.x+span*f;let best=null;
  for(const q of world.platforms){if(!q.ground||q.tower||q.w<380)continue;for(let x=q.x+150;x<=q.x+q.w-150;x+=50){const d=Math.abs(x-want);if(d>2600||busy(x)||world.logori.some(L=>Math.abs(L.x-x)<1200)||(best&&d>=best.d))continue;best={x,y:q.y,d};}}
  if(!best)continue;world.logori.push({x:best.x,y:best.y});
  // the ground around a camp is quiet: the foes near it doze too, or walk a sentry's beat
  for(const e of world.enemies){if(e.spava||e.patrola||e.champion||e.perch||e.kit||e.skriven||e.prey||e.caus||!TIHO_TYPES.includes(e.type)||Math.abs(e.x-best.x)>650)continue;const q=groundAt(e.x);if(!q||Math.abs(q.y-e.y)>4)continue;
   if((q.w>380&&e.id%2)||!sleeps(e.type)){e.patrola={x0:Math.max(q.x+40,e.x-210),x1:Math.min(q.x+q.w-40,e.x+210),wait:0};e.face=Math.sign(e.x-best.x)||1;}else{e.spava=true;e.face=e.id%2?1:-1;}}
  for(const side of[-1,1]){const x=best.x+side*58;world.enemies.push({...tpl,id:9000+levelIndex*10+n++,x,home:x,y:best.y,hp:tpl.maxHp,vx:0,vy:0,stun:0,flash:0,alive:true,mode:'idle',timer:.6,alert:false,finT:0,finCool:0,hitId:0,face:-side,spava:true,logor:true,elite:false,patrola:null});}}}
function stealthFoe(e,d,dt){const run=p.grounded&&Math.abs(p.vx)>170,walk=!p.crouching&&Math.abs(p.vx)>60,ady=Math.abs(p.y-e.y);
 if(e.spava){const why=run&&d<300?'run':walk&&d<110&&!e.logor?'walk':d<40?'touch':e.hurtT>0||e.stun>0?'hit':fightNear(e)?'fight':'';if(why){e.wakeWhy=why;wake(e);}return !!e.spava;}
 const P=e.patrola,ahead=Math.sign(p.x-e.x)===e.face;
 if((ahead&&d<420&&ady<90)||d<60||(run&&d<230)||e.hurtT>0||e.stun>0||fightNear(e)){wake(e);return false;}
 if(P.wait>0){P.wait-=dt;e.vx=0;}else if((e.x<=P.x0&&e.face<0)||(e.x>=P.x1&&e.face>0)){P.wait=1.4;e.face=-e.face;e.vx=0;}else foeWalk(e,e.face,40,dt);
 return true;}
function wake(e){const was=e.spava;e.spava=false;e.patrola=null;e.alert=true;e.timer=Math.max(e.timer||0,was?.9:.4);if(was&&rig?.[e.type+'-budi']){e.budiAt=time;e.timer=Math.max(e.timer,BUDI_T+.2);}e.face=Math.sign(p.x-e.x)||e.face;label('!',e.x,e.y-150,'#ffd27a');sfx('cloth',{gain:.4,x:e.x});
 if(e.logor)for(const o of world.enemies)if(o!==e&&o.logor&&o.spava&&Math.abs(o.x-e.x)<200)wake(o);}
function fightNear(e){return world.enemies.some(o=>o!==e&&o.alive&&!o.tiho&&!o.spava&&!o.patrola&&Math.abs(o.x-e.x)<380&&(o.mode==='windup'||o.mode==='stun'||o.hurtT>0));}
function tihoTarget(){if(!level||!p.grounded||finisher||p.attack>0||horseMounted||p.climb||p.down>0)return null;let best=null;
 for(const e of world.enemies){if(!e.alive||!(e.spava||e.patrola)||e.zone!==zone)continue;const dx=e.x-p.x;if(Math.abs(dx)>TIHO_R||Math.abs(e.y-p.y)>30)continue;
  if(e.patrola&&Math.sign(dx)!==e.face)continue; // only from behind him
  if(!best||Math.abs(dx)<Math.abs(best.x-p.x))best=e;}return best;}
function beginTiho(e){const own=!!rig?.['marko-tiho'],kind=own?(p.sablja&&rig['marko-sablja-tiho']?'tihoS':'tiho'):e.spava?'smrskaj':'odsecanje',I=FIN_INFO[kind];finisher={e,t:0,dur:I.dur,hitAt:I.hit,kind,hit:false};p.face=e.x>p.x?1:-1;if(own)e.face=p.face;p.x=e.x-p.face*(own?TIHO_GAP:kind==='smrskaj'?67:74);p.attack=0;p.blocking=false;p.spin=0;
 Object.assign(e,{stun:5,mode:'stun',vx:0,finT:0,lunge:null,pendingHit:null,sanjao:!!e.spava,spava:false,patrola:null,tiho:true});sfx('cloth',{gain:.6});label('TIHO!',e.x,e.y-170,'#d8e8ff');}
function drawStealth(){if(!level||!world.enemies)return;
 for(const L of world.logori||[]){if(L.x<camera-80||L.x>camera+VIEW_W+80)continue;const im=levelArt['prop-ognjiste'];if(im){const b=propBounds(im),h=34,w=b.w*h/b.h;ctx.drawImage(im,b.x,b.y,b.w,b.h,L.x-w/2,L.y-h+4,w,h);}
  drawFlame(L.x,L.y-10,13,26,L.x,.95);halo(L.x,L.y-20,110,'rgba(255,170,80,.32)',.7+.2*Math.sin(time*7+L.x));}
 for(const e of world.enemies){if(!e.alive||!e.spava||e.x<camera-40||e.x>camera+VIEW_W+40)continue;
  for(let i=0;i<3;i++){const k=(time*.45+i/3+e.id*.17)%1;ctx.save();ctx.globalAlpha=Math.sin(k*Math.PI)*.85;ctx.font=`bold ${12+i*3}px Georgia`;ctx.fillStyle='#e8f0ff';ctx.strokeStyle='rgba(10,16,30,.8)';ctx.lineWidth=3;const zx=e.x+e.face*14+k*18,zy=e.y-(rig?.[e.type+'-spava']?92:70)-k*46;ctx.strokeText('z',zx,zy);ctx.fillText('z',zx,zy);ctx.restore();}}
 const t=tihoTarget();if(t)textLabel(padIndex!=null?'X · TIHO':'J · TIHO',t.x,t.y-(t.spava?110:150),{font:'bold 12px Georgia',color:'#e8f0ff',glow:'#9fc4ff'});}

// ================= brutality: Marko beats a foe down to the bone (↑+K on a foe ready to be finished, blood on) =================
// Eight blows of the mace: each throws blood and flesh, the foe soaks darker red, and at the last one only his bones are left
// standing in their rags, then they fall. Codex will draw Marko's beating and a standing skeleton; until then the combo
// blows and the rotted skeleton the corpses already turn into stand in.
function beginOderi(e){const I=FIN_INFO.oderi;finisher={e,t:0,dur:I.dur,hitAt:I.hit,kind:'oderi',hit:false,n:0};finGlobal=training?0:7;p.face=e.x>p.x?1:-1;p.x=e.x-p.face*70;p.attack=0;p.blocking=false;p.spin=0;
 Object.assign(e,{stun:5,mode:'stun',vx:0,finT:0,lunge:null,pendingHit:null,brutal:0});sfx('whoosh_heavy',{gain:1});sayGrunt(true);label('ODERI GA!',e.x,e.y-175,'#ff8a7a');}
function oderiHit(e,n){e.brutal=Math.min(1,n/3.5);e.flash=.12;hitstop=.05+n*.01;shake=settings.reduced?0:4+n*1.2;rumble(.4+n*.1,100);
 sfx('hit_heavy',{gain:.85,rate:.85+Math.random()*.3,x:e.x});if(n%2)sfx('hit_body',{gain:.7,x:e.x});fx('hit',e.x-p.face*10,e.y-60-((n%3)-1)*22,true);
 blood(e.x-p.face*4,e.y-75+((n%3)-1)*22,p.face,20);
 // bits of flesh and cloth
 for(let i=0;i<16;i++){const a=-Math.PI*(.15+Math.random()*.7),sp=180+Math.random()*420;particles.push({kind:'blood',x:e.x+(Math.random()-.5)*26,y:e.y-50-Math.random()*70,vx:Math.cos(a)*sp*(Math.random()<.75?p.face:-p.face),vy:Math.sin(a)*sp,life:2.4,max:2.4,r:3+Math.random()*4.5,color:['#5e0508','#7a1a12','#8a2a1c','#3a0204'][i%4]});}
 if(n===1)foeSay(e,'hurt',{chance:1});}
function oderiEnd(e){if(!e.alive)return;const x=e.x,y=e.y,face=e.face,scale=e.scale||1,type=e.type;e.hp=0;slay(e,0);const c=corpses[corpses.length-1],mine=c&&Math.abs(c.x-x)<2;
 // the skeleton stands dazed for a moment in his rags, then falls apart into a heap (the armoured one keeps his mail shirt)
 const fall=type==='oklopnik'&&rig?.['oklopnik-kostur-pada']?'oklopnik-kostur-pada':'kostur-pada';
 if(mine&&rig?.['kostur-stoji']&&rig?.[fall]){c.skel={fall,stand:1.1};c.persist=true;}else{if(mine)corpses.pop();bones.push({x,y,face,v:BONE_V[type]??0,t:1.4,scale});}
 for(let i=0;i<60;i++){const a=-Math.PI*Math.random(),sp=200+Math.random()*560;particles.push({kind:'blood',x:x+(Math.random()-.5)*30,y:y-70+(Math.random()-.5)*60,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:3,max:3,r:2+Math.random()*4.5,color:['#7a070b','#9b0d12','#5e0508','#8a2a1c'][i%4]});}
 sfx('bones',{gain:.9,x});sfx('boom',{gain:.5});shake=settings.reduced?0:9;rumble(.8,260);hitstop=.09;comboName('DO KOSTIJU!');} // no blood on the screen here: it would hide the skeleton

function finishable(e){return e.alive&&!e.champion&&!e.kit&&e.type!=='pas'&&e.zone===zone&&!e.enter&&!e.climb&&!e.held&&e.grounded!==false&&e.hp>0&&(training||e.hp<=e.maxHp*.25)&&Math.abs(e.x-p.x)<125&&Math.abs(e.y-p.y)<40;}
function finishTarget(){let best=null;for(const e of world.enemies)if(e.finT>0&&finishable(e)&&(!best||Math.abs(e.x-p.x)<Math.abs(best.x-p.x)))best=e;return best;}
function updateFinisher(dt){
 finGlobal=Math.max(0,finGlobal-dt);
 if(finisher){const F=finisher,e=F.e;F.t+=dt;p.vx=0;p.attack=0;p.invuln=Math.max(p.invuln,.25);
  if(F.kind==='bacanje'&&!F.hit&&e.alive&&F.t>F.dur*.18){e.held=true;const k=clamp((F.t-F.dur*.18)/(F.dur*.2),0,1);e.liftK=k;e.x=p.x+p.face*(58-93*k);e.y=p.y-148*k;}
  if(F.kind==='proburazi'&&!F.hit&&e.alive){if(!F.stab&&F.t>F.dur*.28){F.stab=true;blood(e.x,e.y-70,p.face,30);burst(e.x,e.y-70,'#b5161a',14,200);sfx('hit_body',{gain:1,x:e.x});sfx('hit_heavy',{gain:.7,rate:1.3,x:e.x});hitstop=Math.max(hitstop,.08);foeSay(e,'hurt',{chance:1});}
   if(F.stab){e.held=true;const k=clamp((F.t-F.dur*.36)/(F.dur*.3),0,1);e.liftK=k*.35;e.x=p.x+p.face*FIN_INFO.proburazi.gap;e.y=p.y-45*k;}}
  if(F.kind==='oderi'&&!F.hit&&e.alive){const n=Math.floor(F.t/ODERI_STEP+.4);if(n>0&&n<4&&n!==F.n){F.n=n;oderiHit(e,n);}}
  if(F.kind==='gazi'&&!F.hit&&e.alive){e.prone=clamp(F.t/.38,0,1);F.x0??=p.x;p.x=F.x0+(e.x-p.face*38-F.x0)*clamp(F.t/(F.dur*F.hitAt),0,1);}
  if(!F.hit&&F.t>=F.dur*F.hitAt){F.hit=true;finishBlow(F);}if(F.t>=F.dur){finisher=null;p.cooldown=.2;}return true;}
 for(const e of world.enemies){if(!e.alive)continue;e.finCool=Math.max(0,(e.finCool||0)-dt);
  if(e.finT>0){if(!training)e.finT-=dt;if(e.finT<=0||!finishable(e)){e.finT=0;e.finCool=training?0:3.5;}}
  else if(e.finCool<=0&&finishable(e)&&mode==='play'&&p.grounded&&!horseMounted&&!p.pinned){if(training||(finGlobal<=0&&Math.random()<.45)){e.finT=FIN_WINDOW;sfx('ring',{gain:.35,rate:1.6,x:e.x});}else e.finCool=4;}}
 {const t=tihoTarget();if(t&&tap('KeyJ','KeyU')){beginTiho(t);return true;}}
 const e=finishTarget();if(!e||p.down>0||p.climb||horseMounted||p.pinned||!p.grounded)return false;
 if(settings.gore!==false&&isDown('KeyW','ArrowUp')&&tap('KeyK')){beginOderi(e);return true;}
 const key=Object.keys(FIN_KEYS).find(k=>tap(k));if(key){let kind=FIN_KEYS[key];const sk=p.sablja&&SABLJA_FIN[kind];if(sk&&rig?.[FIN_INFO[sk].clip])kind=sk;const I=FIN_INFO[kind];finisher={e,t:0,dur:I.dur,hitAt:I.hit,kind,hit:false};finGlobal=training?0:7;p.face=e.x>p.x?1:-1;p.x=e.x-p.face*(I.gap??(kind==='bacanje'?60:kind==='gazi'?90:kind==='noge'?80:kind==='smrskaj'?67:74));p.attack=0;p.blocking=false;p.spin=0;
  Object.assign(e,{stun:5,mode:'stun',vx:0,finT:0,lunge:null,pendingHit:null});sfx('whoosh_heavy',{gain:1});sayGrunt(true);return true;}
 return false;}
// the silent kill: no cry and no fountain; the sentry sags to his knees and falls on his face (his own drawing, when he has one)
function tihoKill(e){if(!e.alive)return;const before=corpses.length;slay(e,0);const c=corpses[corpses.length-1];if(corpses.length>before&&c&&rig?.[e.type+'-tiho-pada']){c.clip=e.type+'-tiho-pada';c.clipFrom=2;c.clipDur=.9;}sfx('hit_body',{gain:.35,rate:.8,x:e.x});hitstop=Math.max(hitstop,.06);}
// run through on the sabre: he is drawn over Marko, so the blade disappears into him
function impaled(){const F=finisher;return F&&F.kind==='proburazi'&&F.stab&&!F.hit&&F.e.alive?F.e:null;}
// thrown off the sabre: he flies forward off the blade and falls
function throwOffBlade(e){e.held=false;if(!e.alive)return;e.x=p.x+p.face*70;e.y=p.y-60;const before=corpses.length;slay(e,1.4);const c=corpses[corpses.length-1];if(corpses.length>before&&c){c.vx=p.face*620;c.vy=-280;c.face=-p.face;}
 blood(e.x,e.y-40,p.face,40);sfx('whoosh_heavy',{gain:1});sfx('fall',{gain:1,delay:.5});label('NA SABLJI!',e.x,e.y-150,'#ff9a8a');shake=settings.reduced?0:9;rumble(.8,220);hitstop=Math.max(hitstop,.08);}
// the drawing the finishers cut: a champion with his own look is cut from his own drawing, at its own size
function cutArt(e){if(e.look&&rig?.[e.look+'-hurt'])return{name:e.look+'-hurt',sc:1};return{name:rig?.[e.type+'-hurt']?e.type+'-hurt':rig?.[e.type+'-idle']?e.type+'-idle':'cast/'+e.type,sc:e.scale||(e.elite?1.08:1)};}
function finishBlow(F){const e=F.e;if(F.kind==='tiho'||F.kind==='tihoS')return tihoKill(e);if(F.kind==='glava')return behead(e);if(F.kind==='preseci')return legsOff(e,.5,'NAPOLA!');if(F.kind==='proburazi')return throwOffBlade(e);if(F.kind==='oderi')return oderiEnd(e);if(F.kind==='odsecanje')return behead(e);if(F.kind==='noge')return legsOff(e);if(!e.alive){e.held=false;return;}const {name,sc}=cutArt(e);
 if(F.kind==='bacanje'){e.held=false;e.x=p.x+p.face*30;e.y=p.y-110;const before=corpses.length;slay(e,1.7);const c=corpses[corpses.length-1];if(corpses.length>before&&c){c.vx=p.face*Math.max(780,Math.abs(c.vx||0));c.vy=Math.min(c.vy||0,-360);c.face=-p.face;}
  for(const o of world.enemies)if(o.alive&&o!==e&&(o.x-p.x)*p.face>0&&Math.abs(o.x-p.x)<360&&Math.abs(o.y-p.y)<60){o.hp-=30;o.stun=Math.max(o.stun,1.6);o.mode='stun';o.knock=p.face*20;label('OBOREN',o.x,o.y-140,'#ffcf9a');if(o.hp<=0)slay(o,.8);}
  sfx('whoosh_heavy',{gain:1});sfx('fall',{gain:1,delay:.5});label('BAČEN!',e.x,e.y-170,'#ff9a8a');shake=settings.reduced?0:8;rumble(.8,200);}
 else if(F.kind==='smrskaj'){const r=rig?.[name],f=r?.frames[0],H=f?(f[4]-f[5])*r.scale*sc:110,neck=H*.78,hx=e.x,hy=e.y-H*.88;const before=corpses.length;slay(e,0);const c=corpses[corpses.length-1];
  if(corpses.length>before&&c){c.headless={name,neck,H,scale:sc,fast:true};fountains.push({c,t:.8});}
  for(let i=0;i<70;i++){const a=-Math.PI*Math.random(),sp=180+Math.random()*560;particles.push({kind:'blood',x:hx+(Math.random()-.5)*16,y:hy+(Math.random()-.5)*16,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp*.9,life:3,max:3,r:1.6+Math.random()*3.6,color:['#7a070b','#9b0d12','#b5161a','#5e0508'][i%4]});}
  for(let i=0;i<18;i++)particles.push({kind:'dust',x:hx,y:hy,vx:(Math.random()-.5)*420,vy:-150-Math.random()*360,life:.8,max:.8,r:1.8+Math.random()*2.2,color:i%3?'#efe6d4':'#c9b9a0'});
  burst(hx,hy,'#b5161a',30,320);dust(e.x,e.y,22,2.6);label('SMRSKAN!',hx,hy-60,'#ff9a8a');sfx('boom',{gain:.9,x:e.x});sfx('hit_heavy',{gain:1,rate:.7,x:e.x});sfx('hit_body',{gain:1,rate:.6,x:e.x});shake=settings.reduced?0:15;rumble(1,320);hitstop=Math.max(hitstop,.11);}
 else{const before=corpses.length;slay(e,0);const c=corpses[corpses.length-1];if(corpses.length>before&&c){c.t=.95;c.grounded=true;c.x=e.x;}
  const gy=e.y;for(let i=0;i<56;i++){const a=-Math.PI*Math.random(),sp=150+Math.random()*480;particles.push({kind:'blood',x:e.x+(Math.random()-.5)*60,y:gy-14,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:3,max:3,r:1.6+Math.random()*3.2,color:['#7a070b','#9b0d12','#b5161a'][i%3]});}
  for(let i=0;i<14;i++)particles.push({kind:'dust',x:e.x+(Math.random()-.5)*30,y:gy-16,vx:(Math.random()-.5)*360,vy:-120-Math.random()*300,life:.9,max:.9,r:2+Math.random()*2,color:'#e8e0d0'});
  dust(e.x,gy,30,3);sfx('boom',{gain:.9,x:e.x});sfx('hit_heavy',{gain:1,rate:.7,x:e.x});shake=settings.reduced?0:15;rumble(1,320);hitstop=Math.max(hitstop,.11);
  if(F.kind==='gazi')for(const o of world.enemies)if(o.alive&&o!==e&&Math.abs(o.x-e.x)<180&&Math.abs(o.y-gy)<60){o.stun=Math.max(o.stun,1.6);o.mode='stun';o.knock=Math.sign(o.x-e.x)*18;label('OŠAMUĆEN',o.x,o.y-140,'#ffcf9a');}
  label('ZGAŽEN!',e.x,e.y-150,'#ff9a8a');}
 fx('flash','#ff2a18',.08);slowMo=.35;p.rage=Math.min(100,p.rage+15);say('kill',{priority:3,delay:.4});}
function behead(e){if(!e.alive)return;const {name,sc}=cutArt(e),r=rig?.[name];
 const f=r?.frames[0],H=f?(f[4]-f[5])*r.scale*sc:110,neck=H*.78;
 heads.push({name,face:e.face,ex:e.x,ey:e.y,scale:sc,cx:e.x,cy:e.y-H*.89,top:e.y-H-6,neck:e.y-neck,x:e.x,y:e.y-H*.89,vx:p.face*(360+Math.random()*160),vy:-(540+Math.random()*160),rot:0,vr:p.face*(9+Math.random()*7),t:0,bounces:0});
 if(heads.length>30)heads.shift();
 const before=corpses.length;slay(e,0);const c=corpses[corpses.length-1];if(corpses.length>before&&c){c.headless={name,neck,H,scale:sc};fountains.push({c,t:1.9});}
 blood(e.x,e.y-neck,p.face,46);burst(e.x,e.y-neck,'#b5161a',22,260);hitstop=Math.max(hitstop,.16);slowMo=.55;fx('flash','#ff2a18',.1);shake=settings.reduced?0:13;rumble(1,260);
 sfx('hit_heavy',{gain:1,x:e.x});sfx('hit_body',{gain:1,rate:.75,x:e.x});sfx('fall',{gain:.9,delay:.7,x:e.x});label('DOKRAJČEN!',e.x,e.y-H-40,'#ff9a8a');p.rage=Math.min(100,p.rage+15);say('kill',{priority:3,delay:.45});}
function updateGore(dt){
 for(const f of fountains){f.t-=dt;const c=f.c,H=c.headless;if(f.t<=0||!(H||c.legless))continue;let rot,nx,ny;const pw=Math.min(1,f.t/1.2);
  if(c.legless){const L=c.legless;if(L.lie&&c.t>=LIE_AT){const D=L.lie;nx=c.x;ny=c.y+((D.y0+D.y1)/2-D.f[4])*D.r.scale*L.scale;rot=c.face*(1.25+(Math.random()-.5)*.5);}else{const s=legStump(c);nx=s.x;ny=s.y-4;rot=s.rot+Math.PI+(Math.random()<.5?-.9:.9);}
   if(L.lie&&!L.landed&&c.t>=LIE_AT){L.landed=true;dust(c.x-c.face*30,c.y,10,1.6);sfx('fall',{gain:.7,rate:.9,x:c.x});}}else{rot=headlessRot(c);nx=c.x+Math.sin(rot)*H.neck;ny=c.y-Math.cos(rot)*H.neck;}
  for(let i=0;i<2;i++){const sp=(260+Math.random()*380)*pw,ang=rot+(Math.random()-.5)*.5;particles.push({kind:'blood',x:nx,y:ny,vx:Math.sin(ang)*sp+(Math.random()-.5)*40,vy:-Math.cos(ang)*sp,life:3,max:3,r:1.6+Math.random()*2.6,color:['#7a070b','#9b0d12','#b5161a'][i%3]});}}
 fountains=fountains.filter(f=>f.t>0);
 for(const h of heads){h.t+=dt;if(h.rest)continue;h.vy+=1600*dt;const py=h.y;h.x+=h.vx*dt;h.y+=h.vy*dt;h.rot+=h.vr*dt;if(Math.random()<.5)particles.push({kind:'blood',x:h.x,y:h.y+6,vx:-h.vx*.1,vy:40,life:3,max:3,r:1.6+Math.random()*1.5,color:'#9b0d12'});
  const q=surfaceBelow(h,py-12);if(q&&h.y+10>=q.y&&h.vy>0){h.y=q.y-10;decals.push({x:h.x,y:q.y,r:4+Math.random()*3,t:0});if(h.bounces<2&&h.vy>260){h.bounces++;h.vy*=-.32;h.vx*=.55;h.vr*=.5;sfx('fall',{gain:.45,rate:1.4,x:h.x});}else{h.rest=true;h.vx=0;h.vy=0;h.rot=Math.round(h.rot/(Math.PI/2))*(Math.PI/2)+.25*Math.sign(h.vr||1);}}
  else if(h.y>(world.pitY||900)+300)h.t=99;}
 heads=heads.filter(h=>h.t<ROT_AT+2);
 for(const l of limbs){l.t+=dt;if(l.rest)continue;l.vy+=1600*dt;const py=l.y;l.x+=l.vx*dt;l.y+=l.vy*dt;l.rot+=l.vr*dt;if(Math.random()<.5)particles.push({kind:'blood',x:l.x,y:l.y-6,vx:-l.vx*.1,vy:40,life:3,max:3,r:1.6+Math.random()*1.5,color:'#9b0d12'});
  const q=surfaceBelow(l,py-20);if(q&&l.y+16>=q.y&&l.vy>0){l.y=q.y-16;decals.push({x:l.x,y:q.y,r:5+Math.random()*3,t:0});if(l.bounces<2&&l.vy>240){l.bounces++;l.vy*=-.3;l.vx*=.5;l.vr*=.5;sfx('fall',{gain:.5,rate:1.2,x:l.x});}else{l.rest=true;l.restT=l.t;l.vx=0;l.vy=0;l.rot=Math.sign(l.rot||1)*Math.PI/2;dust(l.x,q.y,6,1.2);}}
  else if(l.y>(world.pitY||900)+300)l.t=99;}
 limbs=limbs.filter(l=>l.t<ROT_AT+2);}
// where a lying body is cut, in cell px of the last death frame: head end, feet end, the cut, body top and bottom at the cut
const LIE={sword:[91,462,314,392,486],shield:[77,478,318,383,493],archer:[92,475,322,393,492],akindzija:[99,437,302,378,486],oklopnik:[82,440,297,318,482],palikuca:[74,463,307,388,466],kopljanik:[423,30,187,380,484],tufekdzija:[40,483,306,389,485]};
function lieOf(type){const r=rig?.[type+'-death'],L=LIE[type];if(!r||!L)return null;const n=r.frames.length-1,f=r.frames[n];return{name:type+'-death',n,r,f,head:L[0],feet:L[1],cut:L[2],y0:Math.max(L[3],f[4]-80),y1:L[4]};}
// one half of a lying body. legs=false: the head half, its cut at x, the head toward dir. legs=true: the legs half centred on x, the feet toward dir
function drawLieHalf(D,legs,x,gy,dir,scale,alpha){const k=D.r.scale*scale,end=legs?D.feet:D.head,F=dir*Math.sign(end-D.cut)||1,m=legs?(D.cut+D.feet)/2:D.cut,X0=x-F*(m-D.r.anchor)*k,xc=X0+F*(D.cut-D.r.anchor)*k;
 ctx.save();ctx.beginPath();ctx.rect(dir>0?xc:xc-500,gy-260,500,300);ctx.clip();rigDraw(D.name,D.n,X0,gy,F,{scale,alpha});ctx.restore();
 const sy=gy+((D.y0+D.y1)/2-D.f[4])*k,ry=(D.y1-D.y0)/2*k*.8;ctx.save();ctx.globalAlpha=alpha;ellipse(xc,sy,3.6,ry,'#7a0a0a');ellipse(xc+dir*.5,sy-ry*.35,1.8,2.6,'#e8d8c0');ellipse(xc+dir*.5,sy+ry*.3,1.8,2.6,'#e8d8c0');ctx.restore();return{x:xc,y:sy};}
const LIE_AT=.74;
// the torso drops onto its stumps, then tips over backward
function legStump(c){const L=c.legless,k=clamp(c.t/.24,0,1),r=clamp((c.t-.32)/.45,0,1);return{x:c.x,y:c.y-L.cut*(1-k*k),rot:-c.face*1.45*r*r};}
function drawLegless(c){const L=c.legless,a=c.persist?1:1-clamp((c.t-ROT_AT)/1.4,0,1);if(a<=0)return;const s=legStump(c);shadow(c.x,c.y,42,.35*a);
 ctx.save();ctx.globalAlpha=.8*a;ellipse(c.x-c.face*24,c.y+1,8+42*Math.min(1,c.t/1.6),8,'#64080a');ctx.restore();
 const m=L.lie?clamp((c.t-LIE_AT)/.1,0,1):0;if(m>0)drawLieHalf(L.lie,false,c.x,c.y,-c.face,L.scale,a*m);if(m>=1)return;const b=a*(1-m);
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.rot);ctx.beginPath();ctx.rect(-110,-(L.H-L.cut)-40,220,L.H-L.cut+40);ctx.clip();rigDraw(L.name,0,0,L.cut,c.face,{scale:L.scale,alpha:b});ctx.restore();
 ctx.save();ctx.globalAlpha=b;ctx.translate(s.x,s.y);ctx.rotate(s.rot);ellipse(0,0,14,4.5,'#7a0a0a');ellipse(-5,-1,4,2,'#e8d8c0');ellipse(5,-1,4,2,'#e8d8c0');ctx.restore();}
function drawLimbs(){for(const l of limbs){const a=1-clamp((l.t-ROT_AT)/2,0,1);if(a<=0||l.x<camera-80||l.x>camera+VIEW_W+80)continue;const cy=l.ey-l.cut/2,m=l.lie&&l.rest?clamp((l.t-l.restT)/.1,0,1):0;
 if(m>0)drawLieHalf(l.lie,true,l.x,l.y+16,l.dir,l.scale,a*m);if(m>=1)continue;const b=a*(1-m);
 ctx.save();ctx.translate(l.x,l.y);ctx.rotate(l.rot);ctx.translate(-l.ex,-cy);ctx.beginPath();ctx.rect(l.ex-100,l.ey-l.cut,200,l.cut+10);ctx.clip();rigDraw(l.name,0,l.ex,l.ey,l.face,{scale:l.scale,alpha:b});ctx.restore();
 ctx.save();ctx.globalAlpha=b;ctx.translate(l.x,l.y);ctx.rotate(l.rot);ellipse(0,-l.cut/2,14,4.5,'#7a0a0a');ctx.restore();}}
// B / Shift: a low sweep of the mace takes both legs at the knee; the man drops onto his stumps and falls
// Y / K: a high leap, the mace goes back behind his head and comes down like an axe splitting wood, square on the skull.
// The mace head is 49 px above his soles at the blow, so the leap at that moment puts it at the man's head.
function skullLeap(k,F){const e=F.e,r=rig?.[e.type+'-idle'],f=r?.frames[0],H=f?(f[4]-f[5])*r.scale*(e.scale||1):110,at=clamp(H*.88-49,30,120),P=Math.max(150,at+50),h=F.hitAt;
 if(k<.12)return 0;if(k<.3)return P*Math.sin(Math.PI/2*(k-.12)/.18);if(k<h){const s=(k-.3)/(h-.3);return P+(at-P)*s*s;}if(k<h+.1){const s=(k-h)/.1;return at*(1-s*s);}return 0;}
function legsOff(e,at=.42,text='BEZ NOGU!'){if(!e.alive)return;const {name,sc}=cutArt(e),r=rig?.[name],f=r?.frames[0],H=f?(f[4]-f[5])*r.scale*sc:110,cut=H*at;
 const lie=lieOf(e.type);limbs.push({name,lie,dir:p.face,face:e.face,ex:e.x,ey:e.y,scale:sc,cut,x:e.x,y:e.y-cut/2,vx:p.face*(230+Math.random()*120),vy:-(240+Math.random()*140),rot:0,vr:p.face*(5+Math.random()*4),t:0,bounces:0});if(limbs.length>20)limbs.shift();
 const before=corpses.length;slay(e,0);const c=corpses[corpses.length-1];if(corpses.length>before&&c){c.legless={name,cut,H,scale:sc,lie};fountains.push({c,t:2.2});}
 blood(e.x,e.y-cut,p.face,44);blood(e.x,e.y-cut,-p.face,26);burst(e.x,e.y-cut,'#b5161a',24,260);hitstop=Math.max(hitstop,.11);slowMo=.35;fx('flash','#ff2a18',.08);shake=settings.reduced?0:13;rumble(1,280);
 sfx('hit_heavy',{gain:1,x:e.x});sfx('hit_body',{gain:1,rate:.7,x:e.x});sfx('fall',{gain:.9,delay:.3,x:e.x});label(text,e.x,e.y-H-30,'#ff9a8a');p.rage=Math.min(100,p.rage+15);say('kill',{priority:3,delay:.4});}
function headlessRot(c){const f=c.headless?.fast,k=clamp((c.t-(f?.1:.55))/(f?.32:.45),0,1);return -c.face*1.45*k*k;}
function drawHeadless(c){const H=c.headless,a=c.persist?1:1-clamp((c.t-ROT_AT)/1.4,0,1),rot=headlessRot(c);if(a<=0)return;shadow(c.x,c.y,45,.35*a);
 ctx.save();ctx.translate(c.x,c.y);ctx.rotate(rot);ctx.translate(-c.x,-c.y);ctx.beginPath();ctx.rect(c.x-90,c.y-H.neck,180,H.neck+12);ctx.clip();rigDraw(H.name,0,c.x,c.y,c.face,{scale:H.scale,alpha:a});ctx.restore();
 const nx=c.x+Math.sin(rot)*H.neck,ny=c.y-Math.cos(rot)*H.neck;ctx.save();ctx.globalAlpha=a;ctx.translate(nx,ny);ctx.rotate(rot);ellipse(0,0,9,4,'#7a0a0a');ellipse(0,-1,5,2,'#d8c8b0');ctx.restore();}
function drawHeads(){for(const h of heads){const a=1-clamp((h.t-ROT_AT)/2,0,1);if(a<=0||h.x<camera-80||h.x>camera+VIEW_W+80)continue;
 ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.rot);ctx.translate(-h.cx,-h.cy);ctx.beginPath();ctx.rect(h.cx-70,h.top-14,140,h.neck-h.top+14);ctx.clip();rigDraw(h.name,0,h.ex,h.ey,h.face,{scale:h.scale,alpha:a});ctx.restore();
 ctx.save();ctx.globalAlpha=a;ctx.translate(h.x,h.y);ctx.rotate(h.rot);ellipse(0,h.neck-h.cy,8,3.5,'#7a0a0a');ctx.restore();}}
function drawFinishPrompt(){const e=finishTarget();if(!e||finisher)return;const k=clamp(e.finT/FIN_WINDOW,0,1),x=e.x,y=e.y-195,pad=padIndex!=null;
 halo(x,y,62,'rgba(255,60,30,.45)');ctx.beginPath();ctx.arc(x,y,44,-Math.PI/2,-Math.PI/2+Math.PI*2*k);ctx.strokeStyle='#ff4a2a';ctx.lineWidth=4;ctx.stroke();
 for(const [dx,dy,kb,pb,col] of[[0,-24,'K','Y','#e8c040'],[-24,0,'J','X','#4a8ae8'],[24,0,'⇧','B','#e04a3a'],[0,24,'␣','A','#4ac060']]){ellipse(x+dx,y+dy,12,12,'rgba(16,6,6,.92)');ctx.beginPath();ctx.arc(x+dx,y+dy,12,0,Math.PI*2);ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();textLabel(pad?pb:kb,x+dx,y+dy+5,{font:'bold 13px Georgia',color:'#fff3e0'});}
 textLabel('DOKRAJČI',x,y+58,{font:'bold 13px Georgia',color:'#ffd0c0',glow:'#c0301a'});if(settings.gore!==false)textLabel(pad?'↑+Y · ODERI':'↑+K · ODERI',x,y+76,{font:'bold 11px Georgia',color:'#ff9a8a',glow:'#7a0a06'});}
// ================= puzzles made by hand: bells, mirrors, the scale, the fairy ring, the powder keg =================
// a struck object: Marko's blow reaches it once per swing
function hitObj(o,x,y,r=80){if(!attackActive()||o.hitId===p.attackId)return false;if(Math.abs(p.x+p.face*35-x)>r||Math.abs(p.y-75-y)>85)return false;o.hitId=p.attackId;return true;}
function puzzleGate(t,open,hint){if(open)return;const gx=t.gate.x;if(p.x>gx-GATE_STOP&&p.x<gx+30&&Math.abs(p.y-t.gate.y)<200){p.x=gx-GATE_STOP;goalHint(hint);}for(const e of world.enemies)if(e.alive&&e.x>gx-50&&e.x<gx+30)e.x=e.x<gx?gx-50:gx+30;}
function puzzleGuard(x,y){const hp=110,a={id:9800+(puzzleGuard.n=(puzzleGuard.n||0)+1),x,y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type:'sword',zone,face:-1,mode:'idle',timer:.8,stun:0,flash:0,alive:true,home:x,attackId:0,grounded:false,air:true};world.enemies.push(a);arrive(a,'drop',1,0);}
function beamPath(t){const pts=[[t.src.x,t.src.y]];let x=t.src.x,y=t.src.y,dx=1,dy=0,hit=false;
 for(let n=0;n<6;n++){let best=null,bd=1e9;for(const m of t.m){const ox=m.x-x,oy=m.y-y;if(dx&&Math.abs(oy)<2&&Math.sign(ox)===dx&&Math.abs(ox)>2&&Math.abs(ox)<bd){best=m;bd=Math.abs(ox);}if(dy&&Math.abs(ox)<2&&Math.sign(oy)===dy&&Math.abs(oy)>2&&Math.abs(oy)<bd){best=m;bd=Math.abs(oy);}}
  if(!best){if(dy>0&&Math.abs(t.target.x-x)<4){pts.push([x,t.target.y-50]);hit=true;}else pts.push([x+dx*700,dy>0?t.target.y:y+dy*700]);break;}
  pts.push([best.x,best.y]);x=best.x;y=best.y;if(best.s)[dx,dy]=[-dy,-dx];else[dx,dy]=[dy,dx];}
 return{pts,hit};}
function updateMindPuzzles(dt){for(const t of world.traps||[]){
 if(t.kind==='bells'){for(const [i,b] of t.bells.entries()){b.swing=(b.swing||0)*Math.pow(.25,dt);if(!hitObj(b,b.x,b.y-60,85))continue;b.swing=1;sfx('ring',{gain:1,rate:[.75,1,1.3][i],x:b.x});if(t.done)continue;t.prog??=0;
   if(t.order[t.prog]===i){t.prog++;label(['I','II','III'][i],b.x,b.y-170,'#ffe39a');if(t.prog>=3){t.done=true;sfx('gate',{gain:.9,x:t.gate.x});sfx('magic_big',{gain:.8});toast('Zvona su zazvonila pravim redom. Kapija se otvara!',3);}}
   else{t.prog=0;label('POGREŠAN RED',b.x,b.y-170,'#ff9a8a');sfx('horn_call',{gain:.7});puzzleGuard(t.gate.x-160,t.gate.y);}}
  puzzleGate(t,t.done,'Udari zvona redom koji pokazuje freska.');}
 if(t.kind==='mirrors'){for(const m of t.m)if(!t.done&&hitObj(m,m.x,m.y,80)){m.s^=1;m.turn=.3;sfx('ring',{gain:.6,rate:1.7,x:m.x});}for(const m of t.m)m.turn=Math.max(0,(m.turn||0)-dt);
  t.beam=beamPath(t);if(t.beam.hit&&!t.done){t.done=true;sfx('magic_big',{gain:1});sfx('gate',{gain:.9,x:t.gate.x});toast('Zrak je stigao do kristala. Prolaz se otvara!',3);}
  puzzleGate(t,t.done,'Okreni ogledala (udari ih) da zrak stigne do kristala.');}
 if(t.kind==='scale'){const w=q=>{let s=0;if(p.grounded&&p.on===q)s+=1;for(const c of world.platforms)if(c.kind==='teret'&&c.x+c.w>q.x+8&&c.x<q.x+q.w-8&&Math.abs(c.y+c.h-q.y)<6)s+=3;for(const e of world.enemies)if(e.alive&&e.grounded&&e.on===q)s+=e.type==='oklopnik'?3:1;return s;};
  const [L,P2]=t.pans,d=clamp((w(L)-w(P2))*45,-100,100);
  for(const q of t.pans){const want=q.base+(q.side<0?d:-d),old=q.y;q.y+=(want-q.y)*Math.min(1,dt*2.5);const dy=q.y-old;if(Math.abs(dy)<.005)continue;
   if(p.on===q&&p.grounded)p.y+=dy;for(const c of world.platforms)if(c.kind==='teret'&&c.x+c.w>q.x+8&&c.x<q.x+q.w-8&&Math.abs(c.y+c.h-old)<6)c.y+=dy;for(const e of world.enemies)if(e.alive&&e.on===q)e.y+=dy;}
  if(!t.told&&Math.abs(p.x-t.pulley.x)<500){t.told=true;speak('Dve tasove drži jedan konopac. Šta je teže, to tone.',6);}}
 if(t.kind==='kolo'){const S=t.stones;t.prog??=0;if(!t.done&&!t.shown&&p.x>S[0].x-260&&p.x<t.gap.x1){t.shown=true;t.show=.01;speak('Svici pokazuju put. Stani na kamenove istim redom.',6);}
  if(t.show>0){t.show+=dt;if(t.show>t.order.length*.9+.5)t.show=0;}
  if(!t.done&&!(t.show>0)){const on=S.findIndex(s=>p.grounded&&Math.abs(p.x-s.x)<34&&Math.abs(p.y-s.y)<4);
   if(on>=0&&on!==t.last){t.last=on;if(t.order[t.prog]===on){t.prog++;S[on].lit=1;sfx('magic',{gain:.6,x:S[on].x});
     if(t.prog>=t.order.length){t.done=true;t.bridge.off=false;sfx('magic_big',{gain:1});toast('Vilinsko kolo je zatvoreno. Most od svetla prelazi provaliju!',3);say('vila_bridge_1',{priority:2});}}
    else{t.prog=0;for(const s of S)s.lit=0;sfx('horn_call',{gain:.5,rate:1.6});label('POGREŠNO · GLEDAJ SVICE',p.x,p.y-160,'#ff9a8a');t.show=.01;}}
   if(on<0)t.last=-1;}
  for(const s of S)s.lit=Math.max(0,(s.lit||0)-dt*.4);}
 if(t.kind==='powder'){const keg=world.platforms.find(q=>q.keg&&!q.off),B=t.brazier;t.relight=Math.max(0,(t.relight||0)-dt);t.kegHome??=keg?{x:keg.x,y:keg.y}:null;
  if(!t.done&&!B.down&&hitObj(B,B.x,B.y-30,80)){B.down=true;t.relight=6;for(const k of[0,1,2])arrows.push({torch:true,coal:true,x:B.x+p.face*(20+k*10),y:B.y-30,vx:p.face*(70+k*45),vy:-160-k*40,life:4,enemy:true});sfx('clang',{gain:.9,x:B.x});label('MANGAL JE PAO',B.x,B.y-120,'#ffcf7a');}
  if(B.down&&t.relight<=0&&!t.done)B.down=false;
  if(!t.done&&keg){const cx=keg.x+keg.w/2,by=keg.y+keg.h;if(fires.some(f=>f.life>.2&&Math.abs(f.x-cx)<85&&Math.abs(f.y-by)<30)||(p.pow?.id==='oganj'&&hitObj(keg,cx,by-30,70)))blowKegPuzzle(t,keg);}
  if(!keg&&!t.done&&t.kegHome){t.respawn=(t.respawn||0)+dt;if(t.respawn>3){t.respawn=0;const k=world.platforms.find(q=>q.keg);if(k){Object.assign(k,{x:t.kegHome.x,y:t.kegHome.y,off:false,push:true,locked:false});dust(k.x+28,k.y+62,14,1.6);}}}
  puzzleGate(t,t.done,'Gvozdena vrata ne popuštaju pred topuzom. Možda bure baruta...');}}}
function blowKegPuzzle(t,keg){const cx=keg.x+keg.w/2,cy=keg.y+keg.h;keg.off=true;keg.push=false;
 burst(cx,cy-40,'#ff9a3a',70,420);burst(cx,cy-30,'#5a4a3a',40,300,'dust');fx('flash','#ffd080',.18);shake=settings.reduced?0:16;rumble(1,500);hitstop=.12;sfx('boom',{gain:1,x:cx});sfx('boom',{gain:.9,rate:.7,delay:.12,x:cx});sfx('rock',{gain:1,x:cx});
 for(let k=-2;k<=2;k++)addFire(cx+k*60,cy,2.6,80);if(Math.abs(p.x-cx)<130&&Math.abs(p.y-cy)<90)damage(30,Math.sign(p.x-cx)||1);
 for(const e of world.enemies)if(e.alive&&!e.champion&&Math.abs(e.x-cx)<170&&Math.abs(e.y-cy)<100){e.hp=0;slay(e,1);}
 if(Math.abs(t.gate.x-cx)<230){t.done=true;sfx('gate',{gain:1,x:t.gate.x});toast('Barut je razneo gvozdena vrata!',3);label('VRATA SU PALA',t.gate.x,t.gate.y-200,'#ffe39a');}
 else{label('PREDALEKO OD VRATA',cx,cy-160,'#ff9a8a');toast('Bure je bilo predaleko od vrata. Doneće novo.',3);}}
function drawMindPuzzles(){const art=id=>levelArt[id];
 for(const t of world.traps||[]){const tx=t.gate?.x??t.pulley?.x??0;if(tx<camera-1300||tx>camera+VIEW_W+1300)continue;
  if(t.gate)drawSideGate('mind'+Math.round(t.gate.x),t.gate.x,t.gate.y,!!t.done);
  if(t.kind==='bells'){const T=t.tablet;poly([[T.x-50,T.y],[T.x+50,T.y],[T.x+46,T.y-120],[T.x-46,T.y-120]],'#5a5048','#a89a80');textLabel('FRESKA',T.x,T.y-96,{font:'bold 11px Georgia',color:'#e8dcc0'});textLabel(t.order.map(i=>['I','II','III'][i]).join(' · '),T.x,T.y-60,{font:'bold 18px Georgia',color:'#ffe39a',glow:'#a07020'});
   for(const [i,b] of t.bells.entries()){const sw=Math.sin(time*14)*.35*(b.swing||0),im=art('zag-zvono');if(im){const B=propBounds(im),h=165,w=B.w*h/B.h;ctx.save();ctx.translate(b.x,b.y-h);ctx.rotate(sw*.12);ctx.drawImage(im,B.x,B.y,B.w,B.h,-w/2,0,w,h);ctx.restore();textLabel(['I','II','III'][i],b.x,b.y-h-12,{font:'bold 14px Georgia',color:t.done?'#bfffe5':'#f5e6c0'});continue;}line(b.x-34,b.y,b.x-34,b.y-150,'#4a3420',5);line(b.x+34,b.y,b.x+34,b.y-150,'#4a3420',5);line(b.x-40,b.y-150,b.x+40,b.y-150,'#4a3420',6);
    ctx.save();ctx.translate(b.x,b.y-148);ctx.rotate(sw);if(im){const B=propBounds(im),h=96,w=B.w*h/B.h;ctx.drawImage(im,B.x,B.y,B.w,B.h,-w/2,0,w,h);}else{poly([[-10,4],[10,4],[22,62],[-22,62]],'#b8863a','#6a4a1a');ellipse(0,64,24,6,'#8a6020');ellipse(0,70,5,5,'#5a3a10');}ctx.restore();
    textLabel(['I','II','III'][i],b.x,b.y-160,{font:'bold 14px Georgia',color:t.done?'#bfffe5':'#f5e6c0'});}}
  if(t.kind==='mirrors'){const P=t.beam?.pts;halo(t.src.x,t.src.y,60,'rgba(255,240,180,.7)');
   if(P){for(const [gc,w,col] of[[gctx,9,'rgba(255,230,150,.55)'],[ctx,3,'rgba(255,250,220,.95)']]){gc.beginPath();gc.moveTo(P[0][0],P[0][1]);for(const q of P.slice(1))gc.lineTo(q[0],q[1]);gc.strokeStyle=col;gc.lineWidth=w;gc.lineCap='round';gc.stroke();}}
   for(const m of t.m){const im=art('zag-ogledalo'),rot=(m.s?-1:1)*Math.PI/4+(m.turn>0?Math.sin(m.turn*40)*.1:0);
    if(im){const B=propBounds(im),h=96,w=B.w*h/B.h,top=m.y-h*.36;ctx.save();ctx.beginPath();ctx.rect(m.x-w,top+h*.62,w*2,h);ctx.clip();ctx.drawImage(im,B.x,B.y,B.w,B.h,m.x-w/2,top,w,h);ctx.restore();
     ctx.save();ctx.translate(m.x,m.y);ctx.rotate(rot*.9);ctx.translate(-m.x,-m.y);ctx.beginPath();ctx.rect(m.x-w,top-4,w*2,h*.66);ctx.clip();ctx.drawImage(im,B.x,B.y,B.w,B.h,m.x-w/2,top,w,h);ctx.restore();
     ctx.save();ctx.translate(m.x,m.y);ctx.rotate(rot);line(0,-30,0,30,'rgba(255,250,220,.9)',3);line(0,-30,0,30,'rgba(255,230,150,.5)',8,gctx);ctx.restore();continue;}
    line(m.x,m.y+14,m.x,m.y+46,'#4a3420',5);ctx.save();ctx.translate(m.x,m.y);ctx.rotate(rot);if(im){const B=propBounds(im),h=64,w=B.w*h/B.h;ctx.drawImage(im,B.x,B.y,B.w,B.h,-w/2,-h/2,w,h);}else{poly([[-5,-30],[5,-30],[5,30],[-5,30]],'#c89a4a','#6a4a1a');}ctx.restore();}
   const cr=art(t.done?'cilj-kristal-svetli':'cilj-kristal');if(cr){const B=propBounds(cr),h=110,w=B.w*h/B.h;ctx.drawImage(cr,B.x,B.y,B.w,B.h,t.target.x-w/2,t.target.y-h,w,h);}else poly([[t.target.x,t.target.y-90],[t.target.x+22,t.target.y-40],[t.target.x,t.target.y],[t.target.x-22,t.target.y-40]],t.done?'#bff6ff':'#5a8a9a');
   if(t.done)halo(t.target.x,t.target.y-50,90,'rgba(150,240,255,.6)');}
  if(t.kind==='scale'){const P=t.pulley,im=art('kotur');for(const q of t.pans){line(q.x+8,q.y,P.x+(q.side<0?-14:14),P.y,'#7a6040',2);line(q.x+q.w-8,q.y,P.x+(q.side<0?-14:14),P.y,'#7a6040',2);drawPlank(q);}
   if(im){const B=propBounds(im),h=54,w=B.w*h/B.h;ctx.drawImage(im,B.x,B.y,B.w,B.h,P.x-w/2,P.y-h/2,w,h);}else{ellipse(P.x,P.y,22,22,'#5a4a3a');ellipse(P.x,P.y,6,6,'#2a2018');}line(P.x,P.y-24,P.x,P.y-140,'#4a3420',6);}
  if(t.kind==='kolo'){const k=t.show>0?Math.floor(t.show/.9):-1,cur=t.order[k];
   for(const [i,s] of t.stones.entries()){const lit=(cur===i&&t.show%.9<.7)||t.done||(s.lit>0),im=art(lit?'zag-kamen-kola-svetli':'zag-kamen-kola');
    if(im){const B=propBounds(im),w=92,h=B.h*w/B.w;ctx.drawImage(im,B.x,B.y,B.w,B.h,s.x-w/2,s.y-h+8,w,h);}else{ellipse(s.x,s.y+2,40,9,lit?'#9fffe0':'#4a4a44');ellipse(s.x,s.y,30,6,lit?'#dfffe8':'#6a6a60');}
    if(lit)halo(s.x,s.y-10,50,'rgba(150,255,210,.7)');}
   if(t.show>0&&cur!=null){const s=t.stones[cur];for(let f=0;f<5;f++){const a=time*3+f*1.3;ellipse(s.x+Math.cos(a)*30,s.y-40+Math.sin(a*1.3)*20,2.5,2.5,'#fff7a0',gctx);}}
   const b=t.bridge;if(!b.off){const w=b.w;for(let x=b.x;x<b.x+w;x+=22){const sh=Math.sin(time*4+x*.05)*1.5;poly([[x,b.y+sh],[x+19,b.y+sh],[x+17,b.y+10+sh],[x+2,b.y+10+sh]],'rgba(190,255,236,.85)');}halo(b.x+w/2,b.y,w*.6,'rgba(150,255,220,.35)');}}
  if(t.kind==='powder'){const B=t.brazier;if(!B.down){line(B.x-10,B.y,B.x-5,B.y-34,'#2c2622',4);line(B.x+10,B.y,B.x+5,B.y-34,'#2c2622',4);poly([[B.x-22,B.y-40],[B.x+22,B.y-40],[B.x+15,B.y-28],[B.x-15,B.y-28]],'#3b332c','#86745a');drawFlame(B.x,B.y-40,15,26,B.x);}
   else poly([[B.x-22,B.y],[B.x+22,B.y],[B.x+15,B.y-10],[B.x-15,B.y-10]],'#3b332c','#86745a');
   const keg=world.platforms.find(q=>q.keg&&!q.off);if(keg){const im=art('razbi-bure-baruta');if(im){const Bb=propBounds(im);ctx.drawImage(im,Bb.x,Bb.y,Bb.w,Bb.h,keg.x-4,keg.y-6,keg.w+8,keg.h+8);}else{ctx.fillStyle='#6a4a2a';ctx.fillRect(keg.x,keg.y,keg.w,keg.h);}
    if(Math.abs(p.x-keg.x)<500&&!t.done)textLabel('BURE BARUTA · GURAJ',keg.x+keg.w/2,keg.y-24,{font:'bold 11px Georgia',color:'#fff0c8',glow:'#ff7a3a'});}}}}
// ================= on the ground: a foe on top of Marko, as Musa was; mash a button to throw him off =================
const GRAPPLE={champ:{rate:6,clip:'kostac-megdan',text:'U KOŠTAC'},ledja:{rate:6,clip:'kostac-janicar',text:'SKOČIO TI JE NA LEĐA'},janicar:{rate:6,clip:'kostac-janicar',text:'NOŽ IZNAD GRLA'},oklopnik:{rate:7,clip:'kostac-oklopnik',text:'DAVI TE'},pas:{rate:5,clip:'kostac-pas',text:'PAS TE UJEDA'}};
function startGrapple(e,kind){if(grapple||grappleCool>0||level===undefined||horseMounted||p.pinned||!e.alive||e.champion||(!level&&zone===5))return false;
 grapple={e,kind,t:0,m:.22,end:0,s:Math.sign(e.x-p.x)||1};e.grappling=true;e.vx=0;e.lunge=null;e.pendingHit=null;Object.assign(p,{pinned:true,vx:0,vy:0,attack:0,spin:0,blocking:false,down:0,dash:0});
 e.x=p.x;sfx('fall',{gain:1});sfx('cloth',{gain:.9});dust(p.x,p.y,20,2);shake=settings.reduced?0:8;rumble(.8,250);label(GRAPPLE[kind].text,p.x,p.y-170,'#ff9a8a');say('hurt',{priority:3});return true;}
function updateGrapple(dt){grappleCool=Math.max(0,grappleCool-dt);
 // knocked down near a janissary: he may jump on Marko with his knife
 if(!grapple&&p.down>0&&!p.downRolled){p.downRolled=true;const e=world.enemies.filter(e=>e.alive&&e.zone===zone&&!e.champion&&(e.type==='sword'||e.type==='kopljanik')&&Math.abs(e.x-p.x)<150&&Math.abs(e.y-p.y)<40).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];if(e&&Math.random()<.75)startGrapple(e,'janicar');}
 if(!grapple&&grappleCool<=0&&level&&p.attack>0&&p.grounded&&p.attackId!==p.backRoll){p.backRoll=p.attackId;const e=world.enemies.find(e=>e.alive&&e.zone===zone&&!e.champion&&!e.spava&&!e.patrola&&!(e.stun>0)&&e.grounded&&(e.type==='sword'||e.type==='akindzija'||e.type==='kopljanik')&&(e.x-p.x)*p.face<-20&&Math.abs(e.x-p.x)<95&&Math.abs(e.y-p.y)<30);if(e&&world.enemies.some(o=>o!==e&&o.alive&&(o.x-p.x)*p.face>0&&Math.abs(o.x-p.x)<160)&&Math.random()<.3)startGrapple(e,'ledja');}
 if(p.down<=0)p.downRolled=false;
 const G=grapple;if(!G)return false;const e=G.e;G.t+=dt;p.vx=0;
 if(!e.alive){p.pinned=false;grapple=null;return false;}
 if(G.end>0){G.end-=dt;if(G.end<=0){p.pinned=false;p.down=.3;p.invuln=Math.max(p.invuln,.8);e.grappling=false;e.x=p.x+G.s*110;e.stun=2.4;e.mode='stun';e.knock=G.s*20;if(G.champ)champAfterGrapple(G,true);else{e.hp-=25;label('KONTRA',e.x,e.y-150,'#ffe39a');}if(e.hp<=0)slay(e,.8);grapple=null;grappleCool=7;}return true;}
 if(tap('KeyJ')||tap('KeyK')||tap('Space')||tap('KeyL')||tap('ShiftLeft')||tap('KeyU')){G.m+=G.champ?.095:.13;G.shake=.12;sfx('cloth',{gain:.5,rate:1.2});}
 G.m=clamp(G.m-dt*.22,0,1);G.shake=Math.max(0,(G.shake||0)-dt);p.hp-=GRAPPLE[G.kind].rate*dt*(D().dmg||1);if(p.hp<=0){p.pinned=false;e.grappling=false;e.x=p.x+G.s*70;grapple=null;die();return true;}
 if(G.m>=1){G.end=.6;say('atk',{priority:3});sfx('hit_heavy',{gain:.9});shake=settings.reduced?0:7;label('OSLOBODIO SE!',p.x,p.y-170,'#bfffe5');return true;}
 if(G.t>(G.champ?5.5:6.5)){p.pinned=false;e.grappling=false;e.x=p.x+G.s*90;damage(G.champ?28:22,-G.s);if(G.champ)champAfterGrapple(G,false);grapple=null;grappleCool=7;}
 return true;}
function drawGrapple(){const G=grapple;if(!G)return;const e=G.e,I=GRAPPLE[G.kind],x=p.x+(G.shake>0?(Math.random()-.5)*6:0),y=p.y;shadow(x,y,90,.55);
 const endClip=I.clip+'-kraj';
 if(G.end>0&&rig?.[endClip]){const n=rig[endClip].frames.length;rigDraw(endClip,Math.min(n-1,Math.floor((1-G.end/.6)*n)),x,y,G.s,{});}
 else if(rig?.[I.clip]){const n=rig[I.clip].frames.length;rigDraw(I.clip,Math.floor(time*(G.shake>0?14:8))%n,x,y,G.s,{});}
 else{const lie=rig?.['marko-knockdown'];if(lie)rigDraw('marko-knockdown',lie.frames.length-1,x-G.s*10,y,-G.s,{});const atk=rig?.[e.type+'-attack']?e.type+'-attack':rig?.[e.type+'-idle']?e.type+'-idle':'cast/'+e.type;rigDraw(atk,1,x+G.s*14,y,-G.s,{dy:10,rot:-G.s*.25,scale:e.scale||1});}
 if(G.end<=0){const bx=x-50,by=y-175;ctx.fillStyle='rgba(10,10,10,.75)';ctx.fillRect(bx-2,by-2,104,12);ctx.fillStyle=G.m>.7?'#8dffa8':'#ffcf6a';ctx.fillRect(bx,by,100*G.m,8);
  textLabel(padIndex!=null?'X X X · OTMI SE':'J J J · OTMI SE',x,by-14,{font:'bold 15px Georgia',color:'#fff3e0',glow:'#c0301a'});}}
// ================= the training room (…/trening.html): foes keep coming, every one of them can be finished =================
const TRENING=hasDom&&/[?&]trening\b/.test(location.search);
const TRAIN_FOES=['sword','shield','archer','akindzija','oklopnik','palikuca','kopljanik','tufekdzija','pas'];
const TRAIN_NAMES=['janičar','štitonoša','strelac','akindžija','oklopnik','palikuća','kopljanik','tufekdžija','pas'];
function startTraining(){start(false);training={type:0,fight:false,t:.5,n:0,k:0};
 world.platforms=[{x:-600,y:590,w:4800,h:150,kind:'stone'},{x:1160,y:470,w:160,h:150,kind:'stone'},{x:2060,y:470,w:160,h:150,kind:'stone'}];
 world.enemies=[];world.items=[];world.runes=[];world.barriers=[];world.travelers=[];defenses={};Object.assign(p,{x:1600,y:590});camera=p.x-VIEW_W*.4;
 $('dialogue').hidden=true;toast('TRENING',2);if(hasDom&&!$('trening-help')){const d=document.createElement('div');d.id='trening-help';
  d.innerHTML='<b>TRENING</b> · 1–9 bira neprijatelja, 0 sve redom · N: napadaju / samo stoje · T: top i horda<br>Priđi neprijatelju: J odseci glavu · K smrskaj · Shift odseci noge · Space zgazi';
  d.style.cssText='position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:30;padding:8px 16px;border-radius:6px;background:#0b1414d8;box-shadow:inset 0 0 0 1px #d9b56a88;color:#f1e3bd;font:15px/1.5 Georgia,serif;text-align:center;pointer-events:none';
  document.body.appendChild(d);}}
function updateTraining(dt){if(mode!=='play')return;Object.assign(p,{hp:p.maxHp,energy:100});
 for(let k=0;k<=9;k++)if(tap('Digit'+k)||tap('Numpad'+k)){training.type=k;for(const e of world.enemies)e.alive=false;training.t=.2;toast(k?`Neprijatelj: ${TRAIN_NAMES[k-1]}`:'Svi neprijatelji redom',1.6);}
 if(tap('KeyT')&&!(world.guns||[]).length){world.guns=[{x:p.x+60,y:590,id:9,face:1}];toast('Top · priđi i pritisni E',2);}
 if(tap('KeyN')){training.fight=!training.fight;toast(training.fight?'Neprijatelji napadaju':'Neprijatelji samo stoje',1.6);}
 const alive=world.enemies.filter(e=>e.alive);training.t-=dt;
 const horde=(world.guns||[]).some(G=>G.state==='battle');if(!horde&&alive.length<3&&training.t<=0){training.t=.9;const type=training.type?TRAIN_FOES[training.type-1]:TRAIN_FOES[training.n%TRAIN_FOES.length],side=training.n%2?1:-1;training.n++;
  const hp=({shield:125,archer:65,akindzija:80,oklopnik:240,palikuca:70,kopljanik:100,tufekdzija:90,pas:60})[type]||90;
  const e={id:20000+(training.k++),x:p.x+side*300,y:590,w:36,h:type==='pas'?50:75,hp,maxHp:hp,type,zone,face:-side,mode:'idle',timer:1,stun:0,flash:0,alive:true,home:p.x,attackId:0};
  world.enemies.push(e);arrive(e,'run',side,0);}
 if(!training.fight)for(const e of alive)if(e.mode==='idle')e.timer=Math.max(e.timer,1);
 world.enemies=world.enemies.filter(e=>e.alive||!e.dead0);for(const e of world.enemies)if(!e.alive)e.dead0=true;}
// ================= the Turkish cannon =================
// The gunner lights the fuse; the barrel stays level (a ball that bounces and rolls: jump it) or lifts (a ball at
// head height: crouch). The ball smashes Turks and crates in its way. Kill the gunner or break the gun with the mace.
const TOP_W=170,TOP_H=Math.round(TOP_W*678/1012),BALL_R=24;
function updateCannons(dt){for(const c of world.cannons||[]){c.balls??=[];c.state??='idle';c.clock??=1.4;c.hp??=5;c.lift??=0;c.shots??=0;c.recoil=Math.max(0,(c.recoil||0)-dt*3);c.flash=Math.max(0,(c.flash||0)-dt);
  const g=world.enemies.find(e=>e.gunner&&e.alive&&Math.abs(e.x-c.x)<320),aim=!c.broken&&g&&p.x<c.x-40&&p.x>c.x-1250&&Math.abs(p.y-c.y)<260;
  // the gunner keeps to his gun unless Marko is on top of him
  if(g&&!c.broken&&Math.abs(p.x-g.x)>190&&!(g.stun>0)&&g.grounded!==false){g.x+=(c.x+80-g.x)*Math.min(1,dt*5);g.face=-1;}
  c.lift+=((c.state==='fuse'&&c.next==='high'?1:0)-c.lift)*Math.min(1,dt*5);
  if(aim){c.clock-=dt;
   if(c.state==='idle'&&c.clock<=0){c.state='fuse';c.fuse=1.15;c.next=c.shots<2?['low','high'][c.shots]:Math.random()<.5?'high':'low';sfx('draw',{gain:.5,rate:1.9,x:c.x});if(!c.told){c.told=true;speak('Turci pucaju iz topa! Đule koje se kotrlja preskoči, pred visokim se sagni.',4.5);}}
   if(c.state==='fuse'){c.fuse-=dt;const hx=c.x+24,hy=c.y-TOP_H*.69;if(Math.random()<dt*40)particles.push({kind:'dust',x:hx,y:hy,vx:(Math.random()-.5)*90,vy:-40-Math.random()*90,life:.35,max:.35,r:1.4+Math.random()*1.4,color:Math.random()<.5?'#ffb040':'#ffe08a'});
    if(c.fuse<=0)fireCannon(c);}}
  else if(c.state==='fuse'){c.state='idle';c.clock=1;}
  // Marko's mace and the thrown mace break the gun
  if(!c.broken){const near=Math.abs(p.x-(c.x+10))<120&&Math.abs(p.y-c.y)<90;
   if(attackActive()&&near&&c.hitId!==p.attackId&&(c.x-p.x)*p.face>-60){c.hitId=p.attackId;hitCannon(c,p.attackKind==='heavy'||p.attackKind==='super'?2:1);}
   if(thrown&&c.thrownHit!==thrown&&Math.abs(thrown.x-c.x)<80&&Math.abs(thrown.y-(c.y-50))<70){c.thrownHit=thrown;hitCannon(c,2);}}
  for(const b of c.balls)updateBall(b,dt);c.balls=c.balls.filter(b=>b.life>0);}}
function fireCannon(c){c.state='idle';c.clock=2.1+Math.random()*.9;c.shots++;c.recoil=1;c.flash=.12;const high=c.next==='high',mx=c.x-TOP_W*.43,my=c.y-TOP_H*.83-(high?6:0);
 c.balls.push({x:mx,y:high?c.y-TOP_H*.83-8:my,vx:high?-760:-560,vy:high?0:70,high,rot:0,life:4,gy:c.y,bounces:0,ids:new Set()});
 for(let i=0;i<26;i++)particles.push({kind:'dust',x:mx-6,y:my,vx:-60-Math.random()*240,vy:(Math.random()-.6)*120,life:1.4+Math.random(),max:2.2,r:5+Math.random()*9,color:['#8c877f','#a29c92','#6e6a64'][i%3]});
 burst(mx-10,my,'#ff9a3a',18,260);(sfx('cannon',{gain:1,x:c.x})||sfx('boom',{gain:1,rate:.8,x:c.x}));sfx('hit_heavy',{gain:.6,rate:.5,x:c.x});shake=Math.max(shake,settings.reduced?0:9);rumble(.8,220);}
function updateBall(b,dt){b.life-=dt;b.rot+=b.vx*dt/BALL_R;b.x+=b.vx*dt;
 if(!b.high||b.drop){b.vy+=1500*dt;b.y+=b.vy*dt;const q=surfaceBelow({x:b.x,y:b.y},b.y-b.vy*dt-BALL_R-4);
  if(q&&b.y+BALL_R>=q.y&&b.vy>0){b.y=q.y-BALL_R;if(b.vy>260&&b.bounces<2){b.bounces++;b.vy*=-.38;dust(b.x,q.y,8,1.4);sfx('rock',{gain:.7,rate:.6,x:b.x});shake=Math.max(shake,settings.reduced?0:3);}else{b.vy=0;b.vx=Math.min(-430,b.vx*.995);if(Math.random()<dt*14)dust(b.x+BALL_R*.6,q.y,1,.6);}}}
 else if(b.life<2.6)b.drop=true;
 if(Math.random()<dt*22)particles.push({kind:'dust',x:b.x+BALL_R,y:b.y,vx:30,vy:-10,life:.5,max:.5,r:3+Math.random()*3,color:'#9a958c'});
 if(b.y>(world.pitY||900)+200)b.life=0;
 // Marko: the ball must not touch his box
 const top=p.y-p.h,hit=b.x+BALL_R*.8>p.x-16&&b.x-BALL_R*.8<p.x+16&&b.y+BALL_R*.8>top&&b.y-BALL_R*.8<p.y;
 if(hit&&!b.hitP){b.hitP=true;if(hurtBy(28,-1,-460)){p.vx=-520;p.blastT=BLAST_TIME;p.runJump=false;shake=Math.max(shake,settings.reduced?0:12);sfx('hit_heavy',{gain:1,rate:.7,x:p.x});label('ĐULE!',p.x,p.y-150,'#ffb09a');}}
 // Turks in its way are thrown aside, crates burst, a wall stops it
 for(const e of world.enemies)if(e.alive&&!e.champion&&!e.gunner&&!b.ids.has(e.id)&&Math.abs(e.x-b.x)<BALL_R+16&&b.y+BALL_R>e.y-110&&b.y-BALL_R<e.y){b.ids.add(e.id);gib(e,Math.sign(b.vx)||-1);sfx('hit_heavy',{gain:.9,x:e.x});}
 for(const k of world.breakables||[])if(!k.broken&&!k.opened&&Math.abs(k.x-b.x)<BALL_R+30&&Math.abs(k.y-b.y)<60)hitCrate(k,9);
 for(const q of world.platforms)if(q.solid&&!q.off&&b.x-BALL_R<q.x+q.w&&b.x+BALL_R>q.x&&b.y+BALL_R>q.y+4&&b.y-BALL_R<q.y+q.h){b.life=0;dust(b.x,b.y,16,2);burst(b.x,b.y,'#6e6a64',14,200);sfx('rock',{gain:1,rate:.8,x:b.x});shake=Math.max(shake,settings.reduced?0:5);break;}}
function hitCannon(c,power){c.hp-=power;c.hitFlash=.12;sfx('clang',{gain:.9,rate:.7,x:c.x});sfx('hit_armor',{gain:.6,x:c.x});burst(c.x,c.y-50,'#d8b070',8,160);shake=Math.max(shake,settings.reduced?0:4);
 if(c.hp>0){label(`TOP · ${c.hp}`,c.x,c.y-TOP_H-30,'#ffd2a0');return;}
 c.broken=true;c.state='idle';for(let i=0;i<40;i++)particles.push({kind:'dust',x:c.x+(Math.random()-.5)*TOP_W*.8,y:c.y-40,vx:(Math.random()-.5)*300,vy:-80-Math.random()*260,life:1.6+Math.random(),max:2.6,r:6+Math.random()*10,color:['#8c877f','#5e5a54','#a29c92'][i%3]});
 burst(c.x,c.y-50,'#ff8a2a',36,340);c.flash=.3;sfx('boom',{gain:1,rate:.6,x:c.x});shake=settings.reduced?0:15;rumble(1,400);label('TOP JE UTIHNUO!',c.x,c.y-TOP_H-40,'#ffd2a0');addCoins(8,c.x,c.y-60);
 const g=world.enemies.find(e=>e.gunner&&e.alive&&Math.abs(e.x-c.x)<200);if(g){g.hp=0;slay(g,.9);}}
function drawCannons(){const im=worldImg('zag-top');for(const c of world.cannons||[]){if(c.x<camera-300||c.x>camera+VIEW_W+300)continue;const rec=(c.recoil||0)**2*14,f=c.face||-1;
  ctx.save();ctx.translate(c.x-f*rec,c.y+2);if(c.broken)ctx.rotate(f*.16);else ctx.rotate(-f*.1*(c.lift||0));ctx.scale(f,1);shadow(0,0,TOP_W*.42,.4);
  if(im){if(c.broken)ctx.filter='brightness(.55) saturate(.6)';ctx.drawImage(im,0,175,1012,678,-TOP_W/2,-TOP_H,TOP_W,TOP_H);ctx.filter='none';}
  else{ctx.fillStyle='#6a5a3a';ctx.fillRect(-TOP_W/2,-TOP_H*.85,TOP_W,TOP_H*.32);ellipse(-TOP_W*.25,-18,18,18,'#4a3424');ellipse(TOP_W*.2,-22,22,22,'#4a3424');}
  ctx.restore();
  if(c.broken&&Math.random()<.25)particles.push({kind:'dust',x:c.x+(Math.random()-.5)*60,y:c.y-60,vx:(Math.random()-.5)*20,vy:-30-Math.random()*30,life:1.4,max:1.4,r:4+Math.random()*5,color:'#6e6a64'});
  if(c.flash>0){const mx=c.broken?c.x:c.x+f*TOP_W*.47,my=c.broken?c.y-50:c.y-TOP_H*.83;halo(mx,my,c.broken?140:90,'rgba(255,165,80,.6)',Math.min(1,c.flash/.12));if(!c.broken){ctx.save();ctx.globalAlpha=Math.min(1,c.flash/.12);ellipse(mx,my,22,13,'#ffcf7a');ctx.restore();}}
  if(c.state==='fuse'&&c.shots<4)textLabel(c.next==='high'?'SAGNI SE!':'SKOČI!',c.x-40,c.y-TOP_H-26,{font:'bold 15px Georgia',color:'#ffd2a0'});}}
function drawCannonBalls(){for(const c of world.cannons||[])for(const b of c.balls){if(b.x<camera-60||b.x>camera+VIEW_W+60)continue;const gy=groundAt(b.x,b.y)??b.gy,hgt=Math.max(0,gy-b.y-BALL_R);
  shadow(b.x,gy,BALL_R*(1.1-Math.min(.6,hgt/240)),.45*(1-Math.min(.7,hgt/260)));
  ctx.save();ctx.globalAlpha=.22;ellipse(b.x+BALL_R*1.3,b.y,BALL_R*1.4,BALL_R*.8,'#4a4640');ctx.restore();
  const im=worldImg('djule');
  if(im){const d=BALL_R*2*512/440;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);ctx.drawImage(im,-d/2,-d/2,d,d);ctx.restore();
   // the painted light turns with the ball; this keeps the dark side below and away from the sky
   const sh=ctx.createRadialGradient(b.x-BALL_R*.4,b.y-BALL_R*.45,BALL_R*.15,b.x,b.y,BALL_R);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.42)');ctx.beginPath();ctx.arc(b.x,b.y,BALL_R,0,Math.PI*2);ctx.fillStyle=sh;ctx.fill();}
  else{const gr=ctx.createRadialGradient(b.x-BALL_R*.35,b.y-BALL_R*.4,2,b.x,b.y,BALL_R);gr.addColorStop(0,'#5c5850');gr.addColorStop(.55,'#34312d');gr.addColorStop(1,'#1a1816');ctx.beginPath();ctx.arc(b.x,b.y,BALL_R,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();}}}
// ================= Marko at the gun: a Turkish horde crosses the field =================
// W/S lift or lower the barrel, A/D give less or more powder, J or Space fires, E leaves the gun. The dotted arc
// shows where the ball falls; it bursts there and throws every Turk near it into the air.
let gunner=null;const GUN_G=1500,GUN_V=[560,1240],GUN_WAVES=[7,9,12];
const GUN_PIVOT={x:57,y:418},GUN_MUZZLE={x:435,y:-145},GUN_ART_ANGLE=.19; // art px from the bbox centre-bottom: trunnion, and muzzle from the trunnion
function gunGeo(G){const k=TOP_W/1012,tx=G.x+GUN_PIVOT.x*k,ty=G.y-GUN_PIVOT.y*k,r=-(G.angle-GUN_ART_ANGLE),mx=GUN_MUZZLE.x*k,my=GUN_MUZZLE.y*k;
 return{tx,ty,r,mx:tx+mx*Math.cos(r)-my*Math.sin(r),my:ty+mx*Math.sin(r)+my*Math.cos(r)};}
function gunVel(G){const v=GUN_V[0]+(GUN_V[1]-GUN_V[0])*G.power;return{vx:Math.cos(G.angle)*v,vy:-Math.sin(G.angle)*v};}
function updateGuns(dt){for(const G of world.guns||[]){G.angle??=.38;G.power??=.55;G.reload=Math.max(0,(G.reload||0)-dt);G.balls??=[];G.recoil=Math.max(0,(G.recoil||0)-dt*3);G.flash=Math.max(0,(G.flash||0)-dt);
  if(G.state==='battle')gunWaves(G,dt);for(const b of G.balls)gunBall(G,b,dt);G.balls=G.balls.filter(b=>b.life>0);}}
function gunWaves(G,dt){G.clock-=dt;const alive=world.enemies.filter(e=>e.alive&&e.horde===G.id);
 if(G.queue?.length){G.spawnT=(G.spawnT||0)-dt;if(G.spawnT<=0){G.spawnT=.42;const type=G.queue.shift(),hp=FOE_HP_G[type]||90,x=G.x+1180+Math.random()*90,y=groundAt(x,G.y-40)??G.y;
   world.enemies.push({id:30000+(G.n=(G.n||0)+1)+G.id*1000,x,y,vx:0,vy:0,w:36,h:type==='pas'?50:75,hp,maxHp:hp,type,zone,face:-1,mode:'idle',timer:1,stun:0,flash:0,alive:true,home:G.x,attackId:0,grounded:true,horde:G.id,enter:{tx:G.x+90,t:-30,v:95+Math.random()*60}});}}
 else if(G.wave<GUN_WAVES.length&&(G.clock<=0||!alive.length)&&alive.length<=2){const n=GUN_WAVES[G.wave],pool=G.wave===2?['sword','shield','akindzija','sword','oklopnik']:['sword','sword','shield','akindzija'];
  G.queue=Array.from({length:n},(_,i)=>pool[i%pool.length]);G.wave++;G.clock=16;toast(G.wave===GUN_WAVES.length?'Poslednji talas horde!':`Horda · talas ${G.wave}`,2);sfx('horn_call',{gain:.7});}
 else if(G.wave>=GUN_WAVES.length&&!G.queue?.length&&!alive.length&&G.state==='battle'){G.state='done';toast('Horda je razbijena!',3);addCoins(20,p.x,p.y-80);say('kill',{priority:3});}}
const FOE_HP_G={sword:90,shield:125,akindzija:80,oklopnik:240};
function fireGun(G){const g=gunGeo(G),v=gunVel(G);G.balls.push({x:g.mx,y:g.my,vx:v.vx,vy:v.vy,life:5,rot:0});G.reload=1.05;G.recoil=1;G.flash=.12;G.shots=(G.shots||0)+1;
 for(let i=0;i<22;i++)particles.push({kind:'dust',x:g.mx+6,y:g.my,vx:60+Math.random()*220,vy:(Math.random()-.6)*120,life:1.3+Math.random(),max:2.2,r:5+Math.random()*9,color:['#8c877f','#a29c92','#6e6a64'][i%3]});
 burst(g.mx+8,g.my,'#ff9a3a',16,240);(sfx('cannon',{gain:1,rate:1.05,x:G.x})||sfx('boom',{gain:1,rate:.85,x:G.x}));shake=Math.max(shake,settings.reduced?0:7);rumble(.7,200);}
function gunBall(G,b,dt){b.life-=dt;const py=b.y;b.vy+=GUN_G*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.vx*dt/BALL_R;if(Math.random()<dt*20)particles.push({kind:'dust',x:b.x,y:b.y,vx:-20,vy:-10,life:.5,max:.5,r:3+Math.random()*3,color:'#9a958c'});
 // the ball goes on through whoever it meets and tears him apart; it bursts only where it strikes the ground
 for(const e of world.enemies){if(!e.alive||Math.abs(e.x-b.x)>=BALL_R+14||b.y<=e.y-118||b.y>=e.y)continue;b.ids??=new Set();if(b.ids.has(e.id))continue;b.ids.add(e.id);sfx('hit_heavy',{gain:.8,x:e.x});
  if(e.champion){e.hp-=140;e.flash=.2;e.stun=Math.max(e.stun||0,1);e.mode='stun';e.knock=(Math.sign(b.vx)||1)*24;label('ĐULE!',e.x,e.y-170,'#ffd2a0');if(e.hp<=0)slay(e,1);}
  else{gib(e,Math.sign(b.vx)||1);b.kills=(b.kills||0)+1;b.vx*=.92;}}
 for(const k of world.breakables||[])if(!k.broken&&!k.opened&&Math.abs(k.x-b.x)<BALL_R+30&&Math.abs(k.y-30-b.y)<50)hitCrate(k,9);
 const q=b.vy>0?surfaceBelow({x:b.x,y:b.y},py-BALL_R):null;
 if(q&&b.y+BALL_R>=q.y){gunBurst(G,b.x,q.y,b.kills||0);b.life=0;}else if(b.y>(world.pitY||900)+200){G.kills=(G.kills||0)+(b.kills||0);b.life=0;}}
// the blast throws everything away from where the ball struck: left, right and up, harder the nearer it was
const BLAST_R=200;
function blastAway(o,x,y,k,vxKey='vx',vyKey='vy'){const dx=o.x-x,s=Math.sign(dx)||(Math.random()<.5?-1:1);o[vxKey]=s*(220+560*k)*(.35+.65*Math.min(1,Math.abs(dx)/60))+(o[vxKey]||0)*.2;o[vyKey]=-(320+640*k);}
function gunBurst(G,x,y,pre=0){let n=pre;booms.push({x,y,t:0});for(const e of world.enemies){if(!e.alive)continue;const dx=e.x-x,dy=(e.y-50)-y,d=Math.hypot(dx,dy*.8);if(d>BLAST_R)continue;const k=1-d/BLAST_R;
  if(e.champion){e.hp-=Math.round(170*k);e.flash=.2;e.stun=Math.max(e.stun||0,.6+k);e.mode='stun';e.knock=(Math.sign(dx)||1)*50*k;if(e.hp<=0)slay(e,1);continue;}
  if(d<60){gib(e,Math.sign(dx)||1);n++;continue;}e.hp=0;slay(e,1.2);const c=corpses[corpses.length-1];if(c){blastAway(c,x,y,k);c.spinV=(Math.sign(dx)||1)*(8+10*k);}n++;}
 for(const c of corpses){if(c.headless||c.legless||c.crushed||c.type==='marko'||c.type==='musa'||Math.hypot(c.x-x,(c.y-30-y)*.8)>BLAST_R||c.t<.05)continue;const k=1-Math.hypot(c.x-x,(c.y-30-y)*.8)/BLAST_R;blastAway(c,x,y,k);c.y-=6;c.grounded=false;c.launched=true;c.landed=false;c.spinV=(Math.sign(c.x-x)||1)*(6+8*k);c.spinAngle=c.spinAngle||0;c.trail=0;}
 for(const h of [...heads,...gibs]){const d=Math.hypot(h.x-x,(h.y-y)*.8);if(d>BLAST_R)continue;const k=1-d/BLAST_R;blastAway(h,x,y,k);h.rest=false;h.y-=4;h.vr=(Math.sign(h.x-x)||1)*(10+14*k);}
 for(const k of world.breakables||[])if(!k.broken&&!k.opened&&Math.abs(k.x-x)<120&&Math.abs(k.y-y)<120)hitCrate(k,9);
 for(let i=0;i<30;i++)particles.push({kind:'dust',x:x+(Math.random()-.5)*60,y:y-10,vx:(Math.random()-.5)*360,vy:-90-Math.random()*300,life:1.2+Math.random(),max:2.2,r:5+Math.random()*10,color:['#8c877f','#5e5a54','#7a6a50'][i%3]});
 burst(x,y-20,'#ff8a2a',30,380);dust(x,y,20,3);decals.push({x,y,r:26,t:0});sfx('boom',{gain:1,rate:.7,x});sfx('rock',{gain:.8,x});shake=Math.max(shake,settings.reduced?0:12);hitstop=Math.max(hitstop,n?.06:0);
 if(Math.abs(p.x-x)<130&&Math.abs(p.y-y)<130){const k=1-Math.abs(p.x-x)/130;if(hurtBy(Math.round(12+12*k),Math.sign(p.x-x)||-1,-(320+300*k)))p.vx=(Math.sign(p.x-x)||-1)*(260+340*k);}
 if(n>=2)label(`${n} ODJEDNOM!`,x,y-140,'#ffd2a0');G.kills=(G.kills||0)+n;}
// E at the gun takes it; true while Marko serves it (the gun has the keys then)
function updateGunner(dt){
 if(!gunner){if(mode!=='play'||!p.grounded||horseMounted||finisher)return false;const G=(world.guns||[]).find(G=>Math.abs(p.x-(G.x-74))<80&&Math.abs(p.y-G.y)<40);if(!G||!pressed.has('KeyE'))return false;
  pressed.delete('KeyE');gunner=G;Object.assign(p,{face:1,vx:0,vy:0,attack:0,blocking:false,crouching:false});sfx('leather',{gain:.6});
  if(!G.state){G.state='battle';G.wave=0;G.clock=1.4;speak('Turska horda ide preko polja! W i S dižu i spuštaju cev, A i D daju manje ili više baruta, J ili Space puca. E ostavlja top.',7);}return true;}
 const G=gunner;if(p.hurt>.05||p.hp<=0||mode!=='play'||pressed.has('KeyE')){pressed.delete('KeyE');gunner=null;return false;}
 p.x+=(G.x-74-p.x)*Math.min(1,dt*10);p.vx=0;p.vy=0;p.face=1;p.grounded=true;p.attack=0;p.idleT=0;
 const held=(...c)=>c.some(k=>keys.has(k));
 if(held('KeyW','ArrowUp'))G.angle=Math.min(1.1,G.angle+dt*.65);if(held('KeyS','ArrowDown'))G.angle=Math.max(.04,G.angle-dt*.65);
 if(held('KeyD','ArrowRight'))G.power=Math.min(1,G.power+dt*.5);if(held('KeyA','ArrowLeft'))G.power=Math.max(0,G.power-dt*.5);
 if((pressed.has('KeyJ')||pressed.has('Space'))&&G.reload<=0)fireGun(G);pressed.delete('KeyJ');pressed.delete('Space');
 return true;}
function drawGuns(){const im=worldImg('zag-top');for(const G of world.guns||[]){if(G.x<camera-300||G.x>camera+VIEW_W+300)continue;const g=gunGeo(G),rec=(G.recoil||0)**2*10,draw=()=>im?ctx.drawImage(im,0,175,1012,678,G.x-TOP_W/2,G.y+2-TOP_H,TOP_W,TOP_H):null;
  ctx.save();ctx.translate(-rec,0);shadow(G.x,G.y+2,TOP_W*.42,.4);
  // the carriage stands; the barrel above the trunnion line turns
  ctx.save();ctx.beginPath();ctx.rect(G.x-TOP_W,g.ty,TOP_W*2,TOP_H*2);ctx.clip();draw();ctx.restore();
  ctx.save();ctx.translate(g.tx,g.ty);ctx.rotate(g.r);ctx.translate(-g.tx,-g.ty);ctx.beginPath();ctx.rect(G.x-TOP_W,g.ty-TOP_H*1.2,TOP_W*2,TOP_H*1.2);ctx.clip();draw();ctx.restore();ctx.restore();
  if(G.flash>0){halo(g.mx,g.my,90,'rgba(255,165,80,.6)',Math.min(1,G.flash/.12));ctx.save();ctx.globalAlpha=Math.min(1,G.flash/.12);ellipse(g.mx+10,g.my,22,13,'#ffcf7a');ctx.restore();}
  if(gunner===G)drawGunAim(G,g);
  else if(Math.abs(p.x-(G.x-74))<160&&G.state!=='done')textLabel(G.state?'E · NAZAD NA TOP':'E · TOP',G.x,G.y-TOP_H-30,{font:'bold 14px Georgia',color:'#ffe2a8'});
  for(const b of G.balls)drawBall(b);}}
// the arc, dot by dot, to where the ball will fall; a ring marks the spot
function drawGunAim(G,g){const v=gunVel(G);let x=g.mx,y=g.my,vx=v.vx,vy=v.vy,land=null;ctx.save();
 for(let i=0;i<90;i++){const st=1/40;vy+=GUN_G*st;x+=vx*st;y+=vy*st;const q=vy>0?surfaceBelow({x,y},y-vy*st-4):null;if(q&&y>=q.y){land={x,y:q.y};break;}if(y>(world.pitY||900))break;
  if(i%2===0){ctx.globalAlpha=Math.max(.15,.85-i/110);ellipse(x,y,2.6,2.6,'#f3e7c8');}}
 if(land){ctx.globalAlpha=.8;ctx.strokeStyle='#ffb070';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(land.x,land.y,46,11,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.35;ctx.beginPath();ctx.ellipse(land.x,land.y,140,26,0,0,Math.PI*2);ctx.stroke();}
 ctx.restore();
 // powder and elevation, beside the gun
 const bx=G.x-TOP_W*.55,by=G.y-TOP_H-46;ctx.save();ctx.globalAlpha=.9;ctx.fillStyle='rgba(12,10,8,.7)';ctx.fillRect(bx,by,108,30);ctx.fillStyle='#3a2a1a';ctx.fillRect(bx+6,by+18,96,6);ctx.fillStyle=G.reload>0?'#8a7a60':'#e0a050';ctx.fillRect(bx+6,by+18,96*G.power,6);
 ctx.font='bold 11px Georgia';ctx.fillStyle='#eadbb4';ctx.textAlign='left';ctx.fillText(`${tr('Ugao')} ${Math.round(G.angle*57.3)}°  ${tr('Barut')}`,bx+6,by+13);ctx.restore();}
function drawBall(b){if(b.x<camera-60||b.x>camera+VIEW_W+60)return;const im=worldImg('djule');if(im){const d=BALL_R*2*512/440;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);ctx.drawImage(im,-d/2,-d/2,d,d);ctx.restore();}else ellipse(b.x,b.y,BALL_R,BALL_R,'#2a2724');
 const sh=ctx.createRadialGradient(b.x-BALL_R*.4,b.y-BALL_R*.45,BALL_R*.15,b.x,b.y,BALL_R);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.42)');ctx.beginPath();ctx.arc(b.x,b.y,BALL_R,0,Math.PI*2);ctx.fillStyle=sh;ctx.fill();}
// fire turned back on the fire-throwers: the man burns, his health runs out, the palikuća plays his burning clip
function ignite(e){if(!e.alive)return;const was=e.burn>0;e.burn=4.2;e.flash=.2;if(!was){label('ZAPALJEN!',e.x,e.y-150,'#ffb070');sfx('boom',{gain:.4,rate:1.7,x:e.x});foeSay(e,'hurt',{chance:1});burst(e.x,e.y-60,'#ff9a3a',16,200);}}
function updateBurning(dt){for(const e of world.enemies){if(!e.alive||!(e.burn>0))continue;e.burn-=dt;e.hp-=26*dt;e.timer=Math.max(e.timer||0,.3);e.x+=Math.sin(time*7+e.id)*70*dt;
  if(Math.random()<dt*28)particles.push({kind:'dust',x:e.x+(Math.random()-.5)*26,y:e.y-30-Math.random()*70,vx:(Math.random()-.5)*40,vy:-80-Math.random()*90,life:.6,max:.6,r:2+Math.random()*3,color:Math.random()<.5?'#ff8a2a':'#ffc860'});
  if(e.hp<=0){e.burn=0;slay(e);}}}
function drawBurning(){for(const e of world.enemies)if(e.alive&&e.burn>0){halo(e.x,e.y-60,60,'rgba(255,140,60,.5)',Math.min(1,e.burn));emitters.push({id:'burn'+e.id,kind:'fire',x:e.x,y:e.y-40,w:30,rate:26});}}
// bones that fly: skull, jaw, ribs, thigh, arm, pelvis (Codex's kosti-delovi, or drawn here until it comes)
let gibs=[],booms=[];
function gib(e,dir){if(!e.alive)return;e.hp=0;const y0=e.y;slay(e,0);const c=corpses[corpses.length-1];if(c&&c.x===e.x)corpses.pop();
 for(let k=0;k<6;k++)gibs.push({x:e.x+(Math.random()-.5)*24,y:y0-34-k*13,vx:dir*(140+Math.random()*380)+(Math.random()-.5)*220,vy:-(420+Math.random()*560),rot:Math.random()*6,vr:(Math.random()-.5)*20,kind:k,t:0,bounces:0});
 if(gibs.length>90)gibs.splice(0,gibs.length-90);sfx('bones',{gain:.75,delay:.35,x:e.x});
 for(let i=0;i<46;i++){const a=-Math.PI*Math.random(),sp=200+Math.random()*620;particles.push({kind:'blood',x:e.x+(Math.random()-.5)*30,y:y0-60+(Math.random()-.5)*50,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:3,max:3,r:1.8+Math.random()*3.8,color:['#7a070b','#9b0d12','#b5161a','#5e0508'][i%4]});}
 burst(e.x,y0-60,'#9b0d12',26,340);if(e.x>camera-40&&e.x<camera+VIEW_W+40&&time-lastLensT>.25){lastLensT=time;screenBlood(Math.abs(e.x-p.x)<320?3:2);}}
let lastLensT=-9;
function updateGibs(dt){for(const b of gibs){b.t+=dt;if(b.rest)continue;b.vy+=1600*dt;const py=b.y;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.vr*dt;if(Math.random()<.3)particles.push({kind:'blood',x:b.x,y:b.y,vx:-b.vx*.1,vy:30,life:2,max:2,r:1.3+Math.random(),color:'#9b0d12'});
  const q=surfaceBelow(b,py-10);if(q&&b.y+6>=q.y&&b.vy>0){b.y=q.y-6;if(b.bounces<2&&b.vy>260){b.bounces++;b.vy*=-.35;b.vx*=.55;b.vr*=.6;sfx('rock',{gain:.3,rate:1.8,x:b.x});}else{b.rest=true;b.vx=b.vy=0;}}else if(b.y>(world.pitY||900)+300)b.t=99;}
 gibs=gibs.filter(b=>b.t<ROT_AT+2);for(const B of booms)B.t+=dt;booms=booms.filter(B=>B.t<1);}
const GIB_SIZE=[24,15,28,30,24,26];
function drawGibs(){const im=worldImg('kosti-delovi');for(const b of gibs){if(b.x<camera-60||b.x>camera+VIEW_W+60)continue;const a=1-clamp((b.t-ROT_AT)/2,0,1),s=GIB_SIZE[b.kind];ctx.save();ctx.globalAlpha=a;ctx.translate(b.x,b.y);ctx.rotate(b.rot);
  if(im)ctx.drawImage(im,b.kind*256,0,256,256,-s/2,-s/2,s,s);
  else if(b.kind===0){ellipse(0,0,10,9,'#e6dcc4');ellipse(-3,-1,2.4,2.8,'#2a1a14');ellipse(3,-1,2.4,2.8,'#2a1a14');ellipse(0,6,5,3,'#d8ccb0');}
  else if(b.kind===2){for(const r of[0,5,10])line(-10,r-6,10,r-6,'#e2d6bc',3);line(-12,-8,-12,8,'#d4c6aa',3);}
  else{const L=s/2;line(-L,0,L,0,'#e2d6bc',b.kind===4?3.4:4.6);for(const q of[-L,L]){ellipse(q,-2.5,3.2,3.2,'#ece2cc');ellipse(q,2.5,3.2,3.2,'#ece2cc');}}
  ctx.restore();}
 for(const B of booms){const R=rig?.['eksplozija'];if(!R)continue;rigDraw('eksplozija',Math.min(R.frames.length-1,Math.floor(B.t/.8*R.frames.length)),B.x,B.y+4,1,{});}}
// blood on the lens: a few splashes over the screen that run and fade
function screenBlood(n=2){if(!hasDom||settings.gore===false||settings.reduced)return;let box=$('krv-ekran');if(!box){box=document.createElement('div');box.id='krv-ekran';document.body.appendChild(box);}
 const art=!!worldImg('krv-ekran-1');for(let i=0;i<n;i++){const s=document.createElement('i'),w=150+Math.random()*230;s.style.cssText=`left:${8+Math.random()*78}%;top:${4+Math.random()*58}%;width:${w}px;height:${w}px;rotate:${Math.random()*360}deg`;
  if(art)s.style.backgroundImage=`url(assets/world/krv-ekran-${1+Math.floor(Math.random()*4)}.webp)`;else s.className='blob';box.appendChild(s);setTimeout(()=>s.remove(),3400);}}
function updateDefense(dt){const d=defenses[zone];if(!d||d.done)return;const end=chapters[zone].end;if(!d.active&&p.x>end-650){d.active=true;speak(DEF_TEXT[zone],6);toast('ODBRANA PROLAZA · tri talasa',3);if(zone===1){travelersFlee();say('pt_free_2',{priority:3,delay:1.2});}else if(zone===0)say('pt_fear_1',{priority:2,delay:2});}if(!d.active)return;d.t+=dt;if(d.wave<3&&d.t>=d.wave*12){const wave=d.wave++,plan=WAVE_PLAN[wave];sfx('horn_call',{gain:.75});for(let i=0;i<3;i++){const type=['sword','shield','archer'][(i+wave)%3],hp=type==='shield'?150:110,[how,side]=plan[i],tx=end-1050+i*330;const e={id:1000+zone*100+wave*3+i,x:tx,y:590,w:36,h:75,hp,maxHp:hp,type,zone,face:-side,mode:'idle',timer:1.2,stun:0,flash:0,alive:true,home:end-900,attackId:0};world.enemies.push(e);arrive(e,how,side,i);}incoming(plan);world.items.push({id:1000+zone*10+wave,x:end-600,y:550,type:wave===1?'wine':'herb',taken:false});toast(`Pojačanje · talas ${d.wave}/3`,2);say('tr_alarm',{x:end-900});}if(d.wave===3&&d.t>=36&&!world.enemies.some(e=>e.alive&&e.zone===zone&&!e.road)&&travelersSafe()){d.done=true;toast(zone===1?'Putnici su bezbedni. Kapija je otvorena!':'Pojačanje je odbijeno. Kapija je otvorena!',3);sound('magic');if(zone===1)say('pt_free',{priority:3,delay:.6});}}
let wineKey='';
function updateHud(){if(!p)return;$('rage-fill').style.width=p.rage+'%';$('guard-fill').style.width=p.guard+'%';$('rage-label').textContent=p.rage>=100?'R · SPREMNO':'R · BES '+Math.floor(p.rage);$('rage-label').classList.toggle?.('ready',p.rage>=100);$('health').style.width=`${p.hp/p.maxHp*100}%`;$('energy').style.width=`${p.energy}%`;{const w=$('wine'),key=p.wine+'/'+Math.max(3,p.wine);if(wineKey!==key){wineKey=key;w.innerHTML=Array.from({length:Math.max(3,p.wine)},(_,i)=>`<img src="assets/world/ikona-vino.webp" alt="" class="cutura${i<p.wine?'':' prazna'}">`).join('');w.title=tr('Vino')+' '+p.wine;}}if($('hp-text'))$('hp-text').textContent=`${Math.max(0,Math.ceil(p.hp))} / ${p.maxHp}`;$('coins').textContent='⛁ '+bankCache;$('buff').textContent=(p.buff>0?`${Math.ceil(p.buff)}s `:'')+(p.pow?`${POWERS[p.pow.id].name.split(' ')[0].toUpperCase()} ${Math.ceil(p.pow.t)}s`:'');lettersHud();$('chapter').textContent=training?'TRENING':chapters[zone].name;$('objective').textContent=training?'Dokrajčivanja: priđi neprijatelju':defenses[zone]?.active&&!defenses[zone].done?(zone===1?`Zaštiti putnike · talas ${defenses[zone].wave}/3`:`Odbij pojačanje · talas ${defenses[zone].wave}/3`):zone===2?`Probudi vilinske kamenove · ${zoneRunes().filter(r=>r.active).length}/3`:zone===3&&horseMounted?'Šarčev galop · Space za skok':level?goalText():chapters[zone].goal;$('progress').firstElementChild.style.width=`${p.x/(level?level.width:29900)*100}%`;$('boss-hud').hidden=!((zone===5&&mode!=='victory')||(arena&&mode==='play'));if(arena){const c=arena.boss,h=$('boss-hud').querySelector?.('h2'),sm=$('boss-hud').querySelector?.('small');if(h?.firstChild)h.firstChild.textContent=c.name+' ';if(sm)sm.textContent='MEGDAN';$('hearts').textContent=c.kit==='trio'?'':['◆ ◇ ◇','◆ ◆ ◇','◆ ◆ ◆'][(c.act||1)-1];{const row=$('boss-guard-row'),g=$('boss-guard'),on=!NO_GUARD[c.kit]&&!(c.kit==='beg'&&c.mounted);if(row)row.hidden=!on;if(on&&g?.style){g.style.width=(c.guardBroken>0?100:Math.max(0,c.guard??GUARD_MAX))+'%';row.classList?.toggle?.('broken',c.guardBroken>0);}}$('boss-health').style.width=`${Math.max(0,c.hp/c.maxHp*100)}%`;$('boss-hint').textContent=KIT_HINT[c.kit]||(c.hp<c.maxHp/2?'Razjaren je! Svaki treći napad je poseban.':'Svaki treći napad je poseban — pazi na znak.');}else if(zone===5){{const row=$('boss-guard-row');if(row)row.hidden=true;}const h=$('boss-hud').querySelector?.('h2'),sm=$('boss-hud').querySelector?.('small');if(h?.firstChild)h.firstChild.textContent='Musa Kesedžija ';if(sm)sm.textContent=boss.stage==='joust'?'MEGDAN KOPLJIMA':boss.stage==='kostac'?'U KOŠTAC':boss.phase===1?'MEGDAN SABLJAMA':'MEGDAN TOPUZIMA';}if(zone===5){$('boss-health').style.width=`${boss.hp/boss.maxHp*100}%`;$('hearts').textContent='♥ '.repeat(4-boss.phase)+'♡ '.repeat(boss.phase-1);$('boss-hint').textContent=boss.stage==='joust'?'J KAD PROLAZI · SPACE PRESKAČE KOPLJE · UDRI DOK OKREĆE KONJA':boss.stage==='kostac'?(boss.look?'E · NOŽ ZATAJAC':'OTIMAJ SE · J'):boss.mode==='slashPrep'||boss.mode==='slash'?'SABLJA — SKOČI, OTKOTRLJAJ SE ILI ODBIJ (L)':MUSA_OPEN.includes(boss.mode)?'OTVOREN JE — UDRI NIZOM, PET UDARACA ZA JUNAČKI NIZ':boss.mode==='leapPrep'||boss.mode==='leap'?'SKAČE NA TEBE — SKOČI ILI SE OTKOTRLJAJ':boss.mode==='chargePrep'||boss.mode==='charge'?'JURIŠ — PRESKOČI GA ILI KOLUT KROZ NJEGA':boss.mode==='windup'||boss.mode==='second'?'PRIPREMI ODBIJANJE · L':'Prati zamah. Ravijojla može otvoriti njegov gard · E';}}
function updateVisuals(dt){for(const f of floating){f.y-=30*dt;f.life-=dt;}floating=floating.filter(f=>f.life>0);for(const a of particles){if(a.delay>0){a.delay-=dt;continue;}const py=a.y;a.x+=a.vx*dt;a.y+=a.vy*dt;a.vy+=(a.kind==='dust'?-10:a.kind==='blood'?1400:120)*dt;if(a.kind==='blood'&&a.vy>0){const q=surfaceBelow(a,py);if(q&&a.y>=q.y){a.life=0;bloodLand(a,q);}else if(a.y>(world.pitY||900)+300)a.life=0;}a.vx*=1-dt*2;a.life-=dt;}particles=particles.filter(a=>a.life>0);for(const c of corpses){const before=c.t;if(!c.grounded)integrate(c,dt,world.platforms,world.runes);if(c.launched)flyCorpse(c,dt);if(c.y>850){if(c.launched&&!c.persist)c.t=99;else{c.x=c.launched?clamp(c.x,28060,29840):lastSafe;c.y=590;c.grounded=true;}}c.t+=dt;if(before<.7&&c.t>=.7)dust(c.x-c.face*20,c.y,10,1.6);if(!c.persist&&before<ROT_AT&&c.t>=ROT_AT&&c.grounded)addBone(c);}corpses=corpses.filter(c=>c.persist||c.t<ROT_AT+1.5);for(const b of bones)b.t+=dt;updateGore(dt);if(endSequence){endSequence.age+=dt;const body=corpses.find(c=>c.type===(endSequence.kind==='death'?'marko':'musa')),a=endSequence.age,won=endSequence.kind==='victory';
  if(won&&a>=3.4&&a<9){p.x=Math.min(29850,p.x+42*dt);p.face=1;}
  if(a>=(won&&rig?.['marko-wounded-walk']?9:1.55)&&body?.grounded){if(won&&!endSequence.story){endSequence.story=true;playStory('end',()=>{$('victory').hidden=false;});}else if(!won||endSequence.storyDone)$(endSequence.kind).hidden=false;}}for(const g of ghosts)g.life-=dt;ghosts=ghosts.filter(g=>g.life>0);}
function updateCamera(dt){const lead=gunner?.1:horseMounted?.3:.4;const desired=clamp(p.x-VIEW_W*lead,chapters[zone].start,Math.max(chapters[zone].start,chapters[zone].end-VIEW_W));camera+=(desired-camera)*Math.min(1,dt*5);const wantY=level?levelCameraY(dt):CAM_Y0+Math.min(0,p.y-470)*.55;camY+=(wantY-camY)*Math.min(1,dt*(level?4:3));}
function update(dt){if(slowMo>0&&mode==='play'){slowMo-=dt;dt*=.35;}if(mode!=='play')music(dt);if(mode==='pause'){pressed.clear();return;}if(mode==="play"||mode==="menu")time+=dt;if(mode!=='play'){if(mode==='menu'){camera=650+Math.sin(time*.045)*560;camY=CAM_Y0;}updateVisuals(dt);pressed.clear();return;}elapsed+=dt;music(dt);updateDefense(dt);if(hitstop>0){hitstop-=dt;return;}if(!level&&!training&&!storySeen.has(String(zone))&&elapsed>1.2&&!endSequence){playStory(String(zone));if(mode!=='play')return;}
 if(training)updateTraining(dt);if(!updateFinisher(dt)&&!updateGrapple(dt)&&!updateGunner(dt)&&!updateCelebrate(dt))updatePlayer(dt);updateCannons(dt);updateGuns(dt);updateBurning(dt);updateGibs(dt);if(level){updateKavezi(dt);updateGuslari(dt);updateGnezda(dt);updateOrao(dt);updateSokoli(dt);updateSoko(dt);updateBacve(dt);}if(mode==='play'){updateEnemies(dt);if(!level){updateTravelers(dt);updateGallop();}if(mode==='play')updateBoss(dt);if(mode==='play')updateArrows(dt);}updateVisuals(dt);shake=Math.max(0,shake-dt*18);updateCamera(dt);if(toastTime>0){toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('visible');}if(dialogueTime>0){dialogueTime-=dt;if(dialogueTime<=0)$('dialogue').hidden=true;}updateHud();pressed.clear();}

// ======================= drawing =======================
// how hard: Pripovedač (story) forgives, Junak (normal) bites, Epski (epic) is merciless
const DIFF={story:{dmg:.55,hp:.85,wind:1.35,heal:1.3,extra:0,invuln:1.1,parry:.6},normal:{dmg:1.3,hp:1.2,wind:.86,heal:.8,extra:.3,invuln:.85,parry:.3},epic:{dmg:1.75,hp:1.45,wind:.74,heal:.6,extra:.55,invuln:.7,parry:.24},classic:{dmg:1,hp:1,wind:1,heal:1,extra:0,invuln:1,parry:.32}};
const D=()=>DIFF[settings.difficulty]||DIFF.normal;
function hardenFoes(list){for(const e of list){if(e.hardened)continue;e.hardened=true;e.hp=e.maxHp=Math.round(e.maxHp*D().hp*(e.champion?CHAMP_HP:1));}}
let pxScale=1,glowScale=.5,emitters=[];
function poly(points,fill,stroke,g=ctx){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.stroke();}}
function ellipse(x,y,rx,ry,color,g=ctx){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);g.fillStyle=color;g.fill();}
function line(x,y,x2,y2,color,width=2,g=ctx){g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=width;g.stroke();}
function halo(x,y,r,color,alpha=1){if(r<=0||alpha<=0)return;const g=gctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');gctx.globalAlpha=alpha*.5;gctx.fillStyle=g;gctx.fillRect(x-r,y-r,r*2,r*2);gctx.globalAlpha=1;}
function textLabel(text,x,y,{font='bold 15px Georgia',color='#fff0c8',glow=null,alpha=1}={}){text=tr(text);ctx.save();ctx.globalAlpha=alpha;ctx.font=font;if(ctx.measureText)y=placeLabel(x,y,ctx.measureText(text).width,+(font.match(/(\d+)px/)?.[1]||15));ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle='rgba(12,10,8,.82)';ctx.strokeText(text,x,y);ctx.fillStyle=color==='#fff0c8'?'#eadbb4':color;ctx.fillText(text,x,y);ctx.restore();}
// Draws one rig frame with its sole on (x,y). Silhouettes (flash, coloured glow rims) are built on a scratch canvas.
// Half-size copies of the sprite sheets (drawing only). A frame that lands on screen at half its size or smaller is taken
// from a copy made at half size, decoded off the main thread: same size and place on screen, but the browser keeps a
// quarter of the pixels, so a machine with less memory stops unpacking the full 4096-8192 px sheet again mid-fight.
// Until a copy is ready (and anywhere a frame is drawn larger) the original sheet is used, as before.
const rigHalf=new WeakMap();
function rigPick(im,s){
 if(!(s>0&&s<=.5)||!hasDom||typeof createImageBitmap!=='function'||!im?.naturalWidth)return null;
 const h=rigHalf.get(im);if(h!==undefined)return h;
 rigHalf.set(im,null);const w=Math.max(1,Math.round(im.naturalWidth/2)),hh=Math.max(1,Math.round(im.naturalHeight/2));
 fetch(im.currentSrc||im.src).then(r=>r.ok?r.blob():Promise.reject(r.status)).then(b=>createImageBitmap(b,{resizeWidth:w,resizeHeight:hh,resizeQuality:'high'})).then(bm=>rigHalf.set(im,{bm,kx:w/im.naturalWidth,ky:hh/im.naturalHeight})).catch(()=>{});
 return null;
}
function blitFrame(g,im,f,x,y,w,h,s){const c=rigPick(im,s);if(c)g.drawImage(c.bm,f[0]*c.kx,f[1]*c.ky,f[2]*c.kx,f[3]*c.ky,x,y,w,h);else g.drawImage(im,f[0],f[1],f[2],f[3],x,y,w,h);}
function silhouette(im,f,w,h,color,outline){const pad=outline?Math.ceil(outline)+2:0,w2=w+pad*2,h2=h+pad*2,sc=Math.max(w/f[2],h/f[3]);if(scratch.width<w2||scratch.height<h2){scratch.width=Math.max(scratch.width,w2);scratch.height=Math.max(scratch.height,h2);}sctx.setTransform(1,0,0,1,0,0);sctx.globalAlpha=1;sctx.globalCompositeOperation='source-over';sctx.clearRect(0,0,w2,h2);if(outline){for(let i=0;i<8;i++){const a=i*Math.PI/4;blitFrame(sctx,im,f,pad+Math.cos(a)*outline,pad+Math.sin(a)*outline,w,h,sc);}}else blitFrame(sctx,im,f,0,0,w,h,sc);sctx.globalCompositeOperation='source-in';sctx.fillStyle=color;sctx.fillRect(0,0,w2,h2);if(outline){sctx.globalCompositeOperation='destination-out';blitFrame(sctx,im,f,pad,pad,w,h,sc);}sctx.globalCompositeOperation='source-over';return{pad,w2,h2};}
function rigDraw(name,frame,x,y,face=1,o={}){const r=rig?.[name],im=r&&rigImages[r.image];if(!im)return false;const f=r.frames[clamp(Math.floor(frame),0,r.frames.length-1)],k=r.scale*(o.scale||1),g=o.glow?gctx:ctx,dev=o.glow?glowScale:pxScale;g.save();g.translate(x+(o.dx||0),y+(o.dy||0));if(o.rot)g.rotate(o.rot);g.scale(face*(o.sx||1),o.sy||1);g.globalAlpha=o.alpha??1;const dx=-r.anchor*k,dy=-f[4]*k,dw=f[2]*k,dh=f[3]*k;let sc=0;if(hasDom&&g.getTransform){const m=g.getTransform();sc=k*Math.max(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d));}if(o.color){const pw=Math.max(1,Math.round(dw*dev)),ph=Math.max(1,Math.round(dh*dev)),s=silhouette(im,f,pw,ph,o.color,o.outline?o.outline*dev:0),pad=s.pad/dev;g.drawImage(scratch,0,0,s.w2,s.h2,dx-pad,dy-pad,dw+pad*2,dh+pad*2);}else{blitFrame(g,im,f,dx,dy,dw,dh,sc);if(o.flash>0){const pw=Math.max(1,Math.round(dw*dev)),ph=Math.max(1,Math.round(dh*dev)),s=silhouette(im,f,pw,ph,o.flashColor||'#ffffff',0);g.globalAlpha=(o.alpha??1)*Math.min(1,o.flash);g.drawImage(scratch,0,0,s.w2,s.h2,dx,dy,dw,dh);}}g.restore();return true;}
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
function drawBridge(q){if(q.x+q.w<camera-100||q.x>camera+VIEW_W+100)return;const R=world.runes[q.rune],active=R.active,seg=worldImg('most-vila-segment'),cap=worldImg('most-vila-kraj');
 // stone slabs bound by fairy light: grown from the stone's side when it wakes, a faint outline while it sleeps
 if(seg){const B=propBounds(seg),h=36,sw=B.w*h/B.h,grow=active?clamp((time-(R.awakeT??-9))/.9,0,1):1,end=q.x+q.w*grow;ctx.save();ctx.globalAlpha=active?1:.16+.06*Math.sin(time*3+q.x);
  for(let x=q.x;x<end-1;x+=sw-2){const dw=Math.min(sw,end-x);ctx.drawImage(seg,B.x,B.y,B.w*dw/sw,B.h,x,q.y-3,dw,h);}
  if(cap&&grow>=1){const C=propBounds(cap),cw=C.w*h/C.h;ctx.drawImage(cap,C.x,C.y,C.w,C.h,q.x-cw*.6,q.y-3,cw,h);ctx.save();ctx.translate(q.x+q.w+cw*.6,0);ctx.scale(-1,1);ctx.drawImage(cap,C.x,C.y,C.w,C.h,0,q.y-3,cw,h);ctx.restore();}
  ctx.restore();return;}if(!active){ctx.save();ctx.globalAlpha=.3+.1*Math.sin(time*3+q.x);ctx.setLineDash([10,14]);ctx.lineDashOffset=-time*20;line(q.x,q.y,q.x+q.w,q.y,'#9fd8c4',2);ctx.restore();return;}const g=ctx.createLinearGradient(0,q.y,0,q.y+24);g.addColorStop(0,'rgba(190,255,232,.75)');g.addColorStop(1,'rgba(60,150,140,.08)');poly([[q.x,q.y],[q.x+q.w,q.y],[q.x+q.w-18,q.y+18],[q.x+20,q.y+22]],g);line(q.x,q.y,q.x+q.w,q.y,'#8fc8b4',3);}
function eagle(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const white='#f8e8bf';for(const side of[-1,1]){ctx.save();ctx.scale(side,1);poly([[0,-3],[12,-13],[30,-20],[27,-8],[20,-3],[29,-4],[23,5],[14,8],[6,7]],white);for(let i=0;i<4;i++)line(9+i*4,-2,13+i*4,7-i,'#bfa980',1);ellipse(5,-12,5,8,white);ellipse(8,-20,6,4,white);poly([[11,-22],[18,-18],[10,-18]],white);line(5,9,9,18,white,3);line(9,18,16,19,white,2);ctx.restore();}poly([[-6,-5],[6,-5],[8,10],[0,22],[-8,10]],white);poly([[-4,1],[4,1],[4,10],[0,14],[-4,10]],'#a33539');ctx.restore();}
// ================= cloth banners that wave in the wind =================
// The artist paints the cloth flat; here it is cut into narrow strips that ripple, fold and catch the light.
const CLOTH={};
function clothTex(id){if(CLOTH[id])return CLOTH[id];const im=worldImg(id);if(!im)return null;const w=512,h=Math.round(w*im.naturalHeight/im.naturalWidth),base=makeCanvas(w,h),dark=makeCanvas(w,h),lite=makeCanvas(w,h);
 base.getContext('2d').drawImage(im,0,0,w,h);for(const [cv,col] of [[dark,'#120705'],[lite,'#fff1d6']]){const q=cv.getContext('2d');q.drawImage(im,0,0,w,h);q.globalCompositeOperation='source-in';q.fillStyle=col;q.fillRect(0,0,w,h);}
 return CLOTH[id]={id,base,dark,lite,w,h};}
function windAt(x){return clamp(.74+.18*Math.sin(time*.55+x*.004)+.1*Math.sin(time*1.7+x*.011),.3,1);}
// x,y: where the cloth's top meets the pole; dir: which way the wind blows it
function paintCloth(ctx,c,x,y,W,H,dir,wind,time){const seed=0,N=Math.max(16,Math.round(W/2.3)),k=Math.PI*2*1.25,om=4.6+3.2*wind,sw=c.w/N;let X=0;const a0=ctx.globalAlpha;
 for(let i=0;i<N;i++){const u=(i+.5)/N,ph=u*k-time*om+seed,az=H*(.035+.19*u)*wind,s=az*k*Math.cos(ph)/W,ss=s*dir,cw=W/N/Math.sqrt(1+s*s),
  dy=H*(.03+.1*u)*wind*Math.sin(ph-.9)+H*.2*u*u*(1-wind*.85),sy=1-.07*u*(.5+.5*Math.sin(ph))*wind,y0=y+dy+H*(1-sy)*.3,
  lam=(.55*ss+.83)/Math.sqrt(1+ss*ss)-.83,dark=clamp(-lam*2.6+(1-Math.sin(ph))*.1*u*wind,0,.62),lite=clamp(lam*.7,0,.12),X0=dir>0?x+X:x-X-cw;
  ctx.drawImage(c.base,i*sw,0,sw+.5,c.h,X0,y0,cw+.8,H*sy);
  if(dark>.01){ctx.globalAlpha=a0*dark;ctx.drawImage(c.dark,i*sw,0,sw+.5,c.h,X0,y0,cw+.8,H*sy);ctx.globalAlpha=a0;}
  if(lite>.01){ctx.globalAlpha=a0*lite;ctx.drawImage(c.lite,i*sw,0,sw+.5,c.h,X0,y0,cw+.8,H*sy);ctx.globalAlpha=a0;}
  X+=cw;}
 for(const f of [.06,.5,.92]){ctx.fillStyle='#2e2116';ctx.fillRect(x-4.2,y+H*f-1,8.4,2.6);}}
// Painting the strips every frame is slow, so one wave cycle is baked once per cloth and size (20 frames, twice the
// resolution) and each banner then costs a single drawImage.
const CLOTH_FRAMES=20,CLOTH_WIND=.8,CLOTH_PERIOD=Math.PI*2/(4.6+3.2*CLOTH_WIND);
function clothSheet(c,W,H){c.sheets??={};const key=W+'x'+H;if(key in c.sheets)return c.sheets[key];const S=2,pad=6,fw=Math.ceil((W+pad*2)*S),fh=Math.ceil(H*1.5*S),top=H*.18,cv=makeCanvas(fw*CLOTH_FRAMES,fh),g=cv.getContext('2d');
 if(!g)return c.sheets[key]=null;g.scale(S,S);for(let i=0;i<CLOTH_FRAMES;i++)paintCloth(g,c,pad+i*fw/S,top,W,H,1,CLOTH_WIND,i*CLOTH_PERIOD/CLOTH_FRAMES);
 return c.sheets[key]={cv,fw,fh,top,pad,S};}
// Codex's painted loops come first: 8 cells of 512 in a row, the edge at the pole a fixed line at x=40 from y=150 to y=330.
const BANNER_LOOP={'tkanina-barjak-srpski':'barjak-srpski-vijori','tkanina-barjak-turski':'barjak-turski-vijori'};
function drawCloth(c,x,y,W,H,dir,wind,seed){const L=BANNER_LOOP[c.id],im=L&&worldImg(L);
 if(im){const k=W*1.15/418,i=((Math.floor(time*10+seed*8/(Math.PI*2))%8)+8)%8;if(dir>0)ctx.drawImage(im,i*512,0,512,512,x-40*k,y-150*k,512*k,512*k);else{ctx.save();ctx.translate(x,y);ctx.scale(-1,1);ctx.drawImage(im,i*512,0,512,512,-40*k,-150*k,512*k,512*k);ctx.restore();}return;}
 const s=clothSheet(c,Math.round(W),Math.round(H));if(!s)return;const n=CLOTH_FRAMES,i=((Math.floor(time/CLOTH_PERIOD*n+seed*n/(Math.PI*2))%n)+n)%n;
 if(dir>0)ctx.drawImage(s.cv,i*s.fw,0,s.fw,s.fh,x-s.pad,y-s.top,s.fw/s.S,s.fh/s.S);else{ctx.save();ctx.translate(x,y);ctx.scale(-1,1);ctx.drawImage(s.cv,i*s.fw,0,s.fw,s.fh,-s.pad,-s.top,s.fw/s.S,s.fh/s.S);ctx.restore();}}
// a wooden shaft; on top a small cross, an Ottoman alem, or a plain spear point
function drawPole(x,y,top,finial){ctx.fillStyle='#2e1f13';ctx.fillRect(x-3,top,6,y-top+2);ctx.fillStyle='#6a4a2c';ctx.fillRect(x-1.6,top,1.8,y-top+2);
 if(finial==='krst'){ctx.fillStyle='#8f7038';ctx.fillRect(x-1.4,top-20,2.8,21);ctx.fillRect(x-6.5,top-14,13,2.6);ctx.fillRect(x-4.2,top-19,8.4,2.2);ellipse(x,top-1,4,3,'#7a5d2c');}
 else if(finial==='alem'){ellipse(x,top-4,4,4,'#8f7038');ctx.beginPath();ctx.arc(x,top-15,7,0,Math.PI,false);ctx.arc(x,top-16.6,5.2,Math.PI,0,true);ctx.closePath();ctx.fillStyle='#9a7a3c';ctx.fill();}
 else poly([[x-3.5,top],[x,top-16],[x+3.5,top]],'#878a8f');}
// the painted banner props keep their stone foot; pole and cloth above it are the real thing
const PEDESTAL={'prop-barjak-srpski':[1229,1515,359,666,513],'prop-barjak-manastir':[1429,1510,427,596,512]};
function drawPropBanner(pr,im,b,h){const c=clothTex('tkanina-barjak-srpski'),P=PEDESTAL[pr.id];if(!c||!P)return false;const k=h/b.h,w=b.w*k,left=pr.x-w/2,ground=pr.y+6,px=left+(P[4]-b.x)*k,top=ground-h*.94,W=h*.6,Hc=W*.625;
 drawPole(px,ground-(b.y+b.h-P[0])*k+4,top,'krst');ctx.drawImage(im,P[2],P[0],P[3]-P[2],P[1]-P[0],left+(P[2]-b.x)*k,ground-h+(P[0]-b.y)*k,(P[3]-P[2])*k,(P[1]-P[0])*k);
 drawCloth(c,px+2,top+4,W,Hc,1,windAt(px),px*.013);return true;}
function flag(x,y=590,small=false){const c=clothTex('tkanina-barjak-srpski');if(!c)return flagPainted(x,y,small);const height=small?150:215;drawPole(x,y,y-height,'krst');drawCloth(c,x+2,y-height+4,small?92:122,small?57:76,1,windAt(x),x*.013);}
function flagPainted(x,y=590,small=false){const height=small?135:200;const pole=ctx.createLinearGradient(x-3,0,x+3,0);pole.addColorStop(0,'#3a2a1c');pole.addColorStop(.5,'#7a5a3c');pole.addColorStop(1,'#3a2a1c');ctx.fillStyle=pole;ctx.fillRect(x-3,y-height,6,height+2);ellipse(x,y-height-6,5,7,'#e4c484');halo(x,y-height-7,7,'rgba(255,220,140,.35)');const t=time*2+x;const wv=i=>Math.sin(t+i*.9)*5*(i/4);ctx.save();const cloth=ctx.createLinearGradient(x,0,x+70,0);cloth.addColorStop(0,'#6e1f27');cloth.addColorStop(.5,'#a3323c');cloth.addColorStop(1,'#7a242c');poly([[x+3,y-height+3],[x+70,y-height+10+wv(4)],[x+66,y-height+112+wv(4)],[x+36,y-height+96+wv(2)],[x+3,y-height+112]],cloth,'#ddb675');ctx.restore();ctx.save();ctx.translate(x+34,y-height+52+wv(2));eagle(0,0,.75);ctx.restore();line(x+8,y-height+8,x+8,y-height+98,'#ca9657',1);}
function tree(x,y=590){const h=330+(Math.sin(x)*.5+.5)*110;sprite('tree',x,y+6,h,Math.sin(x*1.7)>0?1:-1,Math.sin(time*.7+x)*.01);}
const worldImgs={};function worldImg(id){if(!hasDom)return null;let im=worldImgs[id];if(!im){im=worldImgs[id]=new Image();im.src=`assets/world/${id}.webp`;}return im.complete&&im.naturalWidth?im:null;}
function drawImgOn(im,x,y,h,flip=false,alpha=1){const B=propBounds(im),w=B.w*h/B.h;ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.drawImage(im,B.x,B.y,B.w,B.h,-w/2,-h,w,h);ctx.restore();return w;}
// the fairy stone: asleep, waking, awake (Codex's three clips), or the world pack's picture until they come
function drawRune(r){if(Math.abs(r.x-camera-VIEW_W/2)>VIEW_W)return;const aw=r.awakeT!=null?time-r.awakeT:99,waking=r.active&&aw<.7&&rig?.['vilinski-kamen-budi'],clip=waking?'vilinski-kamen-budi':r.active?'vilinski-kamen-budan':'vilinski-kamen-spava';
 const pulse=.5+.5*Math.sin(time*3+r.x),prompt=()=>{halo(r.x,540,r.active?70:90,'rgba(120,255,210,.35)',r.active?.7:.5+.4*pulse);if(!r.active){textLabel('E · PROBUDI',r.x,r.road?420:430,{font:'bold 13px Georgia',color:'#dfffee',glow:'#7fffd0'});emitters.push({id:'rune'+r.id,kind:'rune',x:r.x,y:560,rate:8});}};
 if(rig?.[clip]){const n=rig[clip].frames.length;rigDraw(clip,waking?Math.min(n-1,Math.floor(aw/.7*n)):Math.floor(time*7+r.x*.01)%n,r.x,591,1,{});prompt();return;}
 const im=worldImg(r.active?'cilj-vilinski-kamen-budan':'cilj-vilinski-kamen');if(im){drawImgOn(im,r.x,594,150);prompt();return;}const g=ctx.createLinearGradient(r.x-22,0,r.x+22,0);g.addColorStop(0,'#3e5d57');g.addColorStop(.45,r.active?'#6f9c90':'#7aa59a');g.addColorStop(1,'#2d4642');poly([[r.x-21,591],[r.x-25,546],[r.x,518],[r.x+22,548],[r.x+18,591]],g,'#c9e7d3');ctx.fillStyle=r.active?'#bff5dd':'#e6fff2';ctx.font='24px Georgia';ctx.textAlign='center';ctx.fillText('✧',r.x,566);ctx.font='24px Georgia';gctx.font='24px Georgia';gctx.textAlign='center';gctx.fillStyle=`rgba(140,255,215,${r.active?.6:.5+.5*pulse})`;gctx.fillText('✧',r.x,566);halo(r.x,555,r.active?55:80,'rgba(120,255,210,.35)',r.active?.6:.6+.4*pulse);if(!r.active){textLabel('E · PROBUDI',r.x,500,{font:'bold 13px Georgia',color:'#dfffee',glow:'#7fffd0'});emitters.push({id:'rune'+r.id,kind:'rune',x:r.x,y:560,rate:8});}}
function drawItem(i){if(i.taken||i.x<camera-60||i.x>camera+VIEW_W+60)return;if(i.type==='cudo'){drawCudo(i);return;}if(i.type==='slovo'){drawLetter(i);return;}if(i.type==='moc'){drawPowerOrb(i);return;}if(i.type==='tovar'){drawTreasure(i);return;}if(RELIC_ART[i.type]){drawRelicItem(i);return;}const yy=i.y+Math.sin(time*3+i.id)*4;{const art=levelArt[i.type==='wine'?'predmet-cutura':i.type==='herb'?'predmet-trava':''];if(art){halo(i.x,yy,30,i.type==='wine'?'rgba(255,190,90,.45)':'rgba(170,255,140,.35)');const b=propBounds(art),k=40/Math.max(b.w,b.h);ctx.drawImage(art,b.x,b.y,b.w,b.h,i.x-b.w*k/2,yy-b.h*k/2,b.w*k,b.h*k);return;}}if(i.type==='wine'){halo(i.x,yy,30,'rgba(255,190,90,.45)');ellipse(i.x,yy+3,11,13,'#7a2832');ellipse(i.x-3,yy-1,4,6,'rgba(255,190,170,.35)');ctx.fillStyle='#c79a58';ctx.fillRect(i.x-3.5,yy-17,7,9);ellipse(i.x,yy-18,5,2.5,'#e3bf7a');line(i.x-9,yy-4,i.x+9,yy-4,'#e6bc76',2);line(i.x+9,yy-4,i.x+12,yy+9,'#b88850',1.5);}else if(i.type==='herb'){halo(i.x,yy,28,'rgba(170,255,140,.35)');line(i.x,yy-6,i.x,yy+16,'#7fae62',2);for(const [dx,dy,a] of [[-7,2,-.6],[7,0,.6],[-4,-8,-.3],[5,-10,.4]]){ctx.save();ctx.translate(i.x+dx,yy+dy);ctx.rotate(a);ellipse(0,0,4,9,'#b9dc84');line(0,-7,0,7,'#7fae62',1);ctx.restore();}ellipse(i.x,yy-14,4,4,'#f2e6a2');}else{halo(i.x,yy,46,'rgba(255,220,120,.55)',.8+.2*Math.sin(time*4));poly([[i.x,yy-18],[i.x+15,yy],[i.x,yy+18],[i.x-15,yy]],'#edd696','#fff4bb');poly([[i.x,yy-10],[i.x+8,yy],[i.x,yy+10],[i.x-8,yy]],'#b88c3c');}emitters.push({id:'item'+i.id,kind:'item',x:i.x,y:yy,rate:i.type==='relic'?8:3});}
const PREPREKE=['prepreka-kola','prepreka-balvani','prepreka-kolje','prepreka-kamenje','prepreka-bure'];
function drawBarrier(b){if(b.x<camera-200||b.x>camera+VIEW_W+100)return;const im=worldImg(PREPREKE[Math.floor(b.x/97)%PREPREKE.length]);
 if(im){shadow(b.x,592,60,.45);drawImgOn(im,b.x,595,78,Math.floor(b.x/131)%2===1);line(b.x-190,586,b.x-100,586,'#f5cf7a',3,gctx);textLabel('SKOK',b.x-145,572,{font:'bold 12px Georgia',color:'#ffe6a8',glow:'#ffcf6a'});return;}const rocks=[[-18,-12,20,14],[8,-14,22,16],[-4,-30,17,13],[20,-8,12,9],[-28,-6,11,8]];for(const [dx,dy,rx,ry] of rocks){const g=ctx.createRadialGradient(b.x+dx-rx*.3,592+dy-ry*.4,2,b.x+dx,592+dy,rx);g.addColorStop(0,'#a59a80');g.addColorStop(1,'#4c4b3e');ellipse(b.x+dx,592+dy,rx,ry,g);}line(b.x-24,560,b.x+6,580,'#5d4a32',5);line(b.x-190,586,b.x-100,586,'#f5cf7a',3,gctx);textLabel('SKOK',b.x-145,572,{font:'bold 12px Georgia',color:'#ffe6a8',glow:'#ffcf6a'});}
function drawGate(){if(zone>=5)return;const end=chapters[zone].end-60;const locked=(defenses[zone]&&!defenses[zone].done)||world.enemies.some(e=>e.alive&&e.zone===zone&&!e.road)||(zone===2&&zoneRunes().some(r=>!r.active));drawSideGate('ch'+zone,end,590,!locked,'kamen');if(locked&&Math.abs(p.x-end)<600)textLabel('OSLOBODI PROLAZ',end,230,{font:'bold 13px Georgia',color:'#f5d79f',glow:'#ffcf7a'});}

// ---------- characters ----------
// The mace on the shoulder (idle-3): up in frames 0-2, then the shoulder frames 3-9 go back and forth for a good
// while, ending on 9 so it comes down (10-11) without a jump.
const SHOULDER_SEQ=[3,4,5,6,7,8,9,8,7,6,5,4],SHOULDER_FPS=4,SHOULDER_HOLD=(6+SHOULDER_SEQ.length+1)/SHOULDER_FPS;
function shoulderFrame(t){if(t<.5)return Math.floor(t*6);t-=.5;if(t<SHOULDER_HOLD)return SHOULDER_SEQ[Math.floor(t*SHOULDER_FPS)%SHOULDER_SEQ.length];t-=SHOULDER_HOLD;return t<2/6?10+Math.floor(t*6):-1;}
// Marko celebrates a fallen champion: the mace goes up (0-4), stays up while the cape flies (3-5), then rests on his shoulder (6-7)
const CELEBRATE_TIME=2.7;
function celebrateFrame(t){if(t<.55)return Math.min(4,Math.floor(t/.11));t-=.55;if(t<1.8)return[3,4,5,4][Math.floor(t*6)%4];return t<2.1?6:7;}
function updateCelebrate(dt){if(!(p.celebrate>0)||!p.grounded)return false;if(p.celebrate>CELEBRATE_TIME-.02)say('victory',{priority:3});p.celebrate-=dt;
 // the world goes on (the arena opens, the aga drops his mace); only Marko's keys rest, and come back held as they were
 const held=[...keys];keys.clear();pressed.clear();p.vx=0;updatePlayer(dt);for(const k of held)keys.add(k);p.vx=0;p.attack=0;p.idleT=0;return true;}
function playerPose(){return sabljaPose(basePose());}
function basePose(){
 if(finisher?.kind==='oderi'&&rig?.['marko-brutal']){const k=finisher.t/ODERI_STEP,i=Math.floor(k);return{name:'marko-brutal',frame:i>=4?6:ODERI_FRAMES[i%2][Math.min(3,Math.floor((k-i)*4))]};}
 if(finisher?.kind==='oderi'&&!rig?.['marko-brutal']){const k=finisher.t/ODERI_STEP,i=Math.min(3,Math.floor(k)),nm=ODERI_CLIPS[i],n=rig?.[nm]?.frames.length||6;return{name:nm,frame:Math.min(n-1,Math.floor(Math.min(1,k-i)*n))};}
 if(finisher){const I=FIN_INFO[finisher.kind],name=rig?.[I.clip]?I.clip:rig?.[I.fb]?I.fb:'marko-combo-3',n=rig?.[name]?.frames.length||6,k=finisher.t/finisher.dur;
  const leap=finisher.kind==='gazi'?-Math.sin(Math.PI*clamp((k-.12)/(finisher.hitAt-.12),0,1))*120:finisher.kind==='smrskaj'?-skullLeap(k,finisher):0;return{name,frame:Math.min(n-1,Math.floor(k*n)),dy:leap};}
 if(gunner&&rig?.['marko-push'])return{name:'marko-push',frame:gunner.recoil>.3?3:0};
 if(p.blastT>0&&!horseMounted&&rig?.['marko-blasted']){const n=rig['marko-blasted'].frames.length;return{name:'marko-blasted',frame:Math.min(n-1,Math.floor((1-p.blastT/BLAST_TIME)*n)),faceAs:-Math.sign(p.vx)||p.face};}
 if(mode==='levelDone'&&p.victoryAt&&rig?.['marko-victory'])return{name:'marko-victory',frame:celebrateFrame(performance.now()/1000-p.victoryAt)};
 if(p.celebrate>0&&p.grounded&&rig?.['marko-victory'])return{name:'marko-victory',frame:celebrateFrame(CELEBRATE_TIME-p.celebrate)};
 if(endSequence?.kind==='victory'){const a=endSequence.age;if(a>=1.4&&a<3.4&&rig?.['marko-victory'])return{name:'marko-victory',frame:celebrateFrame((a-1.4)*1.3)};if(a>=3.4&&rig?.['marko-wounded-walk'])return{name:'marko-wounded-walk',frame:Math.floor((a-3.4)*7)%rig['marko-wounded-walk'].frames.length,faceAs:1};}
 if(horseMounted&&p.attack>0&&rig?.['marko-mounted-attack']){const n=rig['marko-mounted-attack'].frames.length;return{name:'marko-mounted-attack',frame:Math.min(n-1,Math.floor((1-p.attack/attackDuration())*n))};}
 if(horseMounted){if(!p.grounded||p.landing>0)return{name:'mounted-jump',frame:p.grounded?3:p.vy< -350?1:p.vy<250?2:3};if(Math.abs(p.vx)>35)return{name:'mounted-run',frame:Math.floor(p.gait)%6};return{name:'mounted-jump',frame:0,sy:1+Math.sin(time*2.2)*.008};}
 if(p.climb)return climbPose();if(p.throwT>0)return throwPose();
 {const x=pack3Pose();if(x)return x;}
 if(p.spin>0){if(rig?.['marko-vihor'])return{name:'marko-vihor',frame:Math.floor(p.spin*20)%8};const k=Math.floor(p.spin/.09);return{name:'marko-attack',frame:[2,3,4,3][k%4],faceFlip:Math.floor(p.spin/.18)%2===1,sy:1-.03*Math.abs(Math.sin(p.spin*18))};}
 if(p.attack>0){const duration=attackDuration(),phase=1-p.attack/duration;return attackFrame(phase,{name:p.attackKind==='tresak'?(rig?.['marko-air-2']?'marko-air-2':'marko-charged'):p.attackKind==='lomilac'?(rig?.['marko-combo-4']?'marko-combo-4':'marko-charged'):p.attackKind==='uvis'?(rig?.['marko-uppercut']?'marko-uppercut':'marko-combo-3'):p.attackKind==='juris'?(rig?.['marko-dash-strike']?'marko-dash-strike':'marko-combo-2'):p.attackKind==='light'&&p.airAtk&&rig?.['marko-air-1']?(p.combo===2&&rig?.['marko-air-2']?'marko-air-2':'marko-air-1'):p.attackKind==='super'?'marko-super':p.attackKind==='counter'&&rig?.['marko-counter']?'marko-counter':p.attackKind==='heavy'&&rig?.['marko-charged']?'marko-charged':p.attackKind==='light'&&p.runAtk&&rig?.['marko-run-attack']?'marko-run-attack':p.attackKind==='light'&&rig?.['marko-combo-1']?'marko-combo-'+((p.combo||0)+1):'marko-attack'});}
 if(!p.grounded&&p.runJump&&p.airT<1.1&&!(p.hurt>.02)&&rig?.['marko-run-jump']){const n=rig['marko-run-jump'].frames.length;return{name:'marko-run-jump',frame:Math.min(n-1,Math.floor(p.airT/.7*n))};}
 if(!p.grounded){if(p.vy< -150&&p.airT<.32&&rig?.['marko-jump-rise'])return{name:'marko-jump-rise',frame:Math.min(3,Math.floor(p.airT/.32*4))};if(p.vy>160&&rig?.['marko-fall'])return{name:'marko-fall',frame:Math.floor(p.airT*9)%4};return{name:'marko-jump',frame:p.vy< -520?2:p.vy<220?3:4};}
 if(p.vida>0&&rig?.['marko-pickup'])return{name:'marko-pickup',frame:p.vidaK<.2?Math.floor(p.vidaK*12):2+Math.floor(time*4)%2};
 if(p.drink>0){const W=rig?.['marko-drink-walk'];if(W&&p.grounded&&Math.abs(p.vx)>25)return{name:'marko-drink-walk',frame:Math.floor(p.gait*2)%W.frames.length};return{name:'marko-drink',frame:Math.min(5,Math.floor((1-p.drink/.85)*6))};}
 if(p.crouching&&p.crouch>.5&&Math.abs(p.vx)>15){if(rig?.['marko-crouch-walk'])return{name:'marko-crouch-walk',frame:Math.floor(p.gait*.75)%rig['marko-crouch-walk'].frames.length};const s=Math.sin(p.gait*Math.PI*.75);return{name:'marko-crouch',frame:2+Math.floor(p.gait*.75)%2,dy:-Math.abs(s)*3,rot:s*.025};}
 if(p.crouch>.05)return{name:'marko-crouch',frame:p.crouching?(p.crouch<.15?0:p.crouch<.85?1:2+Math.floor(p.anim*2)%2):(p.crouch>.5?4:5)};
 if(p.blocking&&!(p.hurt>0)&&p.blockTime>=.6&&Math.abs(p.vx)>12){if(rig?.['marko-block-walk'])return{name:'marko-block-walk',frame:Math.floor(p.gait*.8)%rig['marko-block-walk'].frames.length};const s=Math.sin(p.gait*Math.PI*.8);return{name:'marko-block',frame:2,dy:-Math.abs(s)*2.5,rot:s*.02,sx:1+s*.012};}
 if(p.blocking&&p.hurt>0&&rig?.['marko-block-hit'])return{name:'marko-block-hit',frame:Math.min(3,Math.floor((1-p.hurt/.22)*4))};
 if(p.blockTime>0||p.blocking)return{name:'marko-block',frame:!p.blocking?5:p.hurt>0?3:p.blockTime<.6?1:2};
 if(p.hurt>.02&&!p.blocking&&rig?.['marko-hurt'])return{name:'marko-hurt',frame:Math.min(3,Math.floor((1-p.hurt/.22)*4))};
 if(p.landing>0){if(rig?.['marko-land']&&Math.abs(p.vx)<60){const n=rig['marko-land'].frames.length;return{name:'marko-land',frame:Math.min(n-1,Math.floor((1-p.landing/.2)*n))};}const s=Math.sin(p.landing/.2*Math.PI)*.08;return{name:'marko-jump',frame:5,sx:1+s,sy:1-s};}
 if(Math.abs(p.vx)>35){if(Math.abs(p.vx)<170&&rig?.['marko-walk'])return{name:'marko-walk',frame:Math.floor(p.gait*2)%8};return{name:'marko-run',frame:Math.floor(p.gait)%6};}
 if(rig?.['marko-teeter']&&p.grounded&&!horseMounted&&Math.abs(p.vx)<12&&!supportAt(p.x+p.face*24,p.y,60)&&supportAt(p.x-p.face*4,p.y,6))return{name:'marko-teeter',frame:Math.floor(time*8)%rig['marko-teeter'].frames.length};
 if(p.idleT>IDLE3_AT&&rig?.['marko-idle-3']){const nm=(p.idleN||0)%2&&rig?.['marko-idle-4']?'marko-idle-4':'marko-idle-3',n=rig[nm].frames.length,t=p.idleT-IDLE3_AT,k=nm==='marko-idle-3'&&n>=12?shoulderFrame(t):t*6<n?Math.floor(t*6):-1;if(k>=0)return{name:nm,frame:k};p.idleT=0;p.idleN=(p.idleN||0)+1;}
 if(rig?.['marko-idle-2'])return{name:'marko-idle-2',frame:Math.floor(time*6)%rig['marko-idle-2'].frames.length,sy:1+Math.sin(time*2.2)*.004};if(rig?.['marko-idle'])return{name:'marko-idle',frame:IDLE_SEQ[Math.floor(time*IDLE_FPS)%IDLE_SEQ.length],sy:1+Math.sin(time*2.2)*.006,sx:1-Math.sin(time*2.2)*.003};return{name:'cast/marko',frame:0,sy:1+Math.sin(time*2.4)*.012,sx:1-Math.sin(time*2.4)*.005,rot:p.hurt>0?-.1:0};
}
// ================= the father's sabre (DOPUNA-33): with the čudo 'oceva-sablja', G draws King Vukašin's sabre and puts it back =================
// While it is out, standing, running, jumping and the light blows use Codex's sabre clips, and a light blow cuts harder.
// So do the heavy blow (K, J J K, the held charge), the cut upward (↑+J), the lunge and the whirl (DOPUNA-39).
// Moves the sabre has no drawings for (block, throw, climbing) are done with the mace for that moment.
const SABLJA_IN=.6,SABLJA_OUT=.5,SABLJA_HIT=1.3;
// each frame of the sabre whirl is centred with its blade, so the body drifts while he turns: these shifts keep his boots where they stand at rest
const VIHOR_DX=[14,7,-4,-20,-21,-32,-28,-6];
function toggleSablja(){if(!rig?.['marko-sablja-idle'])return;if(!perks.has('oceva-sablja')){toast('Očevu sablju još nemaš. Mladi Turčin je nosi u Opsednutoj tvrđavi.',2.5);return;}
 if(p.sabljaT>0||horseMounted||p.climb||p.attack>0||p.drink>0||p.dash>0||p.throwT>0||!p.grounded)return;
 p.sabljaOut=!p.sablja;p.sabljaT=p.sabljaOut?SABLJA_IN:SABLJA_OUT;p.sablja=true;p.cooldown=Math.max(p.cooldown||0,p.sabljaT*.8);
 sfx(p.sabljaOut?'ring':'leather',{gain:.5,rate:p.sabljaOut?1.7:1});sfx('cloth',{gain:.35,rate:1.3});
 if(p.sabljaOut&&!p.sabljaSeen){p.sabljaSeen=true;label('OČEVA SABLJA',p.x,p.y-160,'#ffe39a');}}
function sabljaTick(dt){if(!(p.sabljaT>0))return;p.sabljaT=Math.max(0,p.sabljaT-dt);if(p.sabljaT===0&&!p.sabljaOut)p.sablja=false;}
const SABLJA_MAP={'marko-idle':'idle','marko-idle-2':'idle','marko-idle-3':'idle','marko-idle-4':'idle','marko-turn':'idle','marko-land':'idle','marko-run-stop':'idle',
 'marko-run':'trci','marko-walk':'trci','marko-run-start':'trci','marko-combo-1':'udarac-1','marko-combo-2':'udarac-2','marko-combo-3':'udarac-3','marko-run-attack':'udarac-1','marko-attack':'udarac-1',
 'marko-air-1':'skok','marko-air-2':'skok','marko-jump':'skok','marko-jump-rise':'skok','marko-fall':'skok','marko-run-jump':'skok',
 'marko-charged':'tezak','marko-combo-4':'tezak','marko-charge-hold':'tezak','marko-charge-walk':'tezak','marko-uppercut':'uvis','marko-dash-strike':'ubod','marko-vihor':'vihor'};
function sabljaPose(P){if(!p?.sablja||!P)return P;
 // drawing it from the scabbard, or wiping it on the cloak and putting it back
 if(p.sabljaT>0&&p.grounded&&!(p.attack>0)){const nm=p.sabljaOut?'marko-sablja-izvlaci':'marko-sablja-vraca',n=rig?.[nm]?.frames.length;if(n){const k=1-p.sabljaT/(p.sabljaOut?SABLJA_IN:SABLJA_OUT);return{name:nm,frame:Math.min(n-1,Math.floor(k*n))};}}
 const to=SABLJA_MAP[P.name],nm='marko-sablja-'+to,n=to&&rig?.[nm]?.frames.length;if(!n)return P;let frame;
 // the jump clip: 1 rising, 2 over the head, 3 the cut, 4 after it, 5 the landing
 if(to==='skok')frame=p.grounded?n-1:p.attack>0&&p.airAtk?Math.min(4,2+Math.floor((1-p.attack/attackDuration())*3)):p.vy< -150?1:4;
 else if(P.name==='marko-charge-hold'||P.name==='marko-charge-walk')frame=Math.min(3,n-1);
 else if(to==='idle')frame=Math.floor(time*6)%n;
 else if(to==='vihor'){frame=P.frame%n;return{...P,name:nm,frame,dx:(P.dx||0)+p.face*(VIHOR_DX[frame]||0)};}
 else if(to==='trci')frame=Math.floor(p.gait)%n;
 else{const src=rig?.[P.name]?.frames.length||n;frame=Math.min(n-1,Math.floor((P.frame+.5)*n/src));}
 return{...P,name:nm,frame};}
function maceSmear(){const d=attackDuration(),phase=1-p.attack/d;if(p.attack<=0||phase<.4||phase>.97)return;const heavy=p.attackKind==='heavy',t=clamp((phase-.42)/.33,0,1),ease=1-Math.pow(1-t,3),head=-1.75+ease*2.6,tail=Math.max(-1.75,head-(heavy?1.05:.85)),fade=1-clamp((phase-.78)/.19,0,1),R=heavy?100:84,inner=R*(heavy?.8:.84);for(const g of[gctx,ctx]){g.save();g.translate(p.x+p.face*6,p.y-66);g.scale(p.face,1);g.beginPath();g.arc(0,0,R,tail,head);g.arc(Math.cos(head)*6,Math.sin(head)*6,inner,head,tail,true);g.closePath();const gr=g.createLinearGradient(Math.cos(tail)*R,Math.sin(tail)*R,Math.cos(head)*R,Math.sin(head)*R);const c=heavy?'255,190,100':'255,236,200';gr.addColorStop(0,`rgba(${c},0)`);gr.addColorStop(1,`rgba(${c},${(g===gctx?(heavy?.42:.34):.2)*fade})`);g.fillStyle=gr;g.fill();g.restore();}}
function drawPlayer(){if(!p||mode==='dead'||p.pinned)return;const alpha=p.invuln>0&&!finisher&&!(training&&p.invuln<.6)&&Math.floor(time*14)%2?.55:1;
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
function drawSoldier(e){if(e.grappling||e.x<camera-140||e.x>camera+VIEW_W+140)return;const x=e.x+(e.knock||0);shadow(x,e.y,e.type==='shield'?36:32,.5);const atk=e.type==='archer'?(e.perch&&p.y>e.y+60&&rig?.['archer-shoot-down']?'archer-shoot-down':'archer-shoot'):e.type+'-attack';let pose={name:'cast/'+e.type,frame:0};const F=FOES[e.type];if((level||e.air)&&(e.climb||(!e.grounded&&e.air)||e.landT>0||(e.tossedT>0&&rig?.[e.type+'-launch']))&&e.mode!=='windup'&&e.mode!=='recover')pose=airPose(e);else if(e.type==='palikuca'&&e.burn>0&&rig?.['palikuca-burn'])pose={name:'palikuca-burn',frame:Math.floor(time*10)%rig['palikuca-burn'].frames.length};else if(e.reactT>0&&rig?.[e.react]){const n=rig[e.react].frames.length;pose={name:e.react,frame:Math.min(n-1,Math.floor((1-e.reactT/e.reactDur)*n))};}else if(F){pose=foePose(e,F);}else if(movePose(e)){pose=movePose(e);}else if(e.mode==='windup'){const progress=1-e.timer/(e.windupDuration||.7);pose={name:atk,frame:e.type==='archer'?Math.min(3,Math.floor(progress*4)):Math.min(2,Math.floor(progress*3))};}else if(e.mode==='recover'){const duration=e.type==='shield'?1.1:.85;pose={name:atk,frame:e.type==='archer'?4+Math.min(1,Math.floor((1-e.timer/duration)*2)):3+Math.min(2,Math.floor((1-e.timer/duration)*3))};}else if(e.moveT>0&&e.stun<=0&&rig?.[e.type+'-run']){pose=locomotionPose(e);}else if(e.hurtT>0&&rig?.[e.type+'-hurt']){pose={name:e.type+'-hurt',frame:Math.min(3,Math.floor((1-e.hurtT/.34)*4))};}else if(rig?.[e.type+'-idle']){pose={name:e.type+'-idle',frame:idleFrame(e.type,e.id),sy:1+Math.sin(time*2.4+e.id)*.008};}else{pose.sy=1+Math.sin(time*2.6+e.id)*.012;}
 // the stun and windup glows are drawn once the pose is final (a champion's own drawing, his size), or a plain soldier's outline shows inside him
 const glows=[];if(e.stun>0&&!e.tiho){pose.rot=(pose.rot||0)-e.face*.07;glows.push(['#8fffd8',.22+.12*Math.sin(time*10),1.4]);for(let s=0;s<3;s++){const a=time*4+s*2.1;textLabel('✦',x+Math.cos(a)*16,e.y-138+Math.sin(a)*5,{font:'15px Georgia',color:'#c8fff0',glow:'#7fffd0'});}}
 if(e.mode==='windup'){const urgency=1-e.timer/(e.windupDuration||.7);glows.push(['#ff4a20',.18+.42*urgency*(.65+.35*Math.sin(time*30)),1.2+urgency*1.4]);}
 if(e.kit&&e.engaged){const kp=KITS[e.kit]?.pose?.(e);if(kp)pose=kp;}if(e.held&&impaled()===e&&rig?.[e.type+'-tiho-pada'])pose={name:e.type+'-tiho-pada',frame:2,rot:p.face*.2}; // run through, he sags on the blade, his sabre hanging
 else if(e.held){const L=rig?.[e.type+'-launch'],k=e.liftK||0;pose=L?{name:e.type+'-launch',frame:1,rot:p.face*1.45*k}:{name:rig?.[e.type+'-hurt']?e.type+'-hurt':pose.name,frame:1,rot:-p.face*1.35};}
 if(e.prone>0&&rig?.[e.type+'-death']){pose={name:e.type+'-death',frame:Math.min(4,Math.floor(e.prone*5))};}else if(e.spava&&(rig?.[e.type+'-spava']||rig?.[e.type+'-death'])){const S=rig[e.type+'-spava'],f=S?Math.floor(time*2.5+e.id*.7)%S.frames.length:0;pose=S?{name:e.type+'-spava',frame:f,dy:sanDy(e,'spava',f)}:{name:e.type+'-death',frame:3};}
 else if(time-(e.budiAt??-9)<BUDI_T&&rig?.[e.type+'-budi']&&!(e.hurtT>0)&&!(e.stun>0)&&e.mode!=='windup'){const n=rig[e.type+'-budi'].frames.length,f=Math.min(n-1,Math.floor((time-e.budiAt)/BUDI_T*n));pose={name:e.type+'-budi',frame:f,scale:BUDI_FIX[e.type]?.[f]??1,dy:sanDy(e,'budi',f)};}if(e.tiho&&finisher?.e===e&&!finisher.hit&&(finisher.kind==='tiho'||finisher.kind==='tihoS')){const held=finisher.t>=finisher.dur*.28;if(e.sanjao&&!held&&rig?.[e.type+'-spava'])pose={name:e.type+'-spava',frame:0,dy:sanDy(e,'spava',0)};else if(held&&rig?.[e.type+'-tiho-pada'])pose={name:e.type+'-tiho-pada',frame:1};else if(e.sanjao&&rig?.[e.type+'-budi']){const n=rig[e.type+'-budi'].frames.length-1;pose={name:e.type+'-budi',frame:n,scale:BUDI_FIX[e.type]?.[n]??1,dy:sanDy(e,'budi',n)};}else if(rig?.[e.type+'-idle'])pose={name:e.type+'-idle',frame:0};}
 if(e.hornT>0&&e.look&&rig?.[e.look+'-rog']){const R=rig[e.look+'-rog'];pose={...pose,name:e.look+'-rog',frame:Math.min(R.frames.length-1,Math.floor((1-e.hornT/HORN_T)*R.frames.length)),fixedScale:1};}
 else if(e.look&&(pose.name.startsWith(e.type+'-')||pose.name==='cast/'+e.type)&&rig?.[e.look+'-idle']){const k=pose.name.startsWith('cast/')?'idle':pose.name.slice(e.type.length+1),near={lunge:'attack',launch:'hurt',jump:'run',climb:'run',walk:'run',run:'walk',shoot:'attack',kick:'attack',bomb:'attack',burn:'hurt',bash:'attack',guardbreak:'hurt',armorbreak:'hurt',grab:'attack'}[k],alt=[e.look+'-'+k,near&&e.look+'-'+near,e.look+'-idle'].find(n=>n&&rig?.[n]);
  // the moves are the sword-bearer's; a move the look lacks borrows its nearest drawing, so he is never drawn as someone else
  pose={...pose,name:alt,frame:alt===e.look+'-'+k?Math.min(pose.frame,rig[alt].frames.length-1):Math.floor(time*8)%rig[alt].frames.length,...(e.champion?{fixedScale:1}:{})};}
 if(e.fermanT>0&&e.look&&rig?.[e.look+'-ferman']){const R=rig[e.look+'-ferman'];pose={...pose,name:e.look+'-ferman',frame:Math.min(R.frames.length-1,Math.floor((1-e.fermanT/1.8)*R.frames.length*1.4))};}
 // Ognjeni aga pours his oil from the jug, and stands bent and panting while he is open
 if(e.look&&e.kit==='ognjeni'){const U=rig?.[e.look+'-ulje'],Z=rig?.[e.look+'-zadihan'];if(U&&(e.ks==='oil'||e.ks==='burn'))pose={...pose,name:e.look+'-ulje',frame:e.ks==='burn'?U.frames.length-1:Math.min(U.frames.length-1,Math.floor((1-e.kt/1.8)*U.frames.length)),fixedScale:1};else if(Z&&e.kitOpen>0)pose={...pose,name:e.look+'-zadihan',frame:Math.floor(time*6)%Z.frames.length,fixedScale:1};}
 // Hasan-aga charges head down and stands dazed when he has rammed the wall; the janissary aga leaps with both sabres;
 // the standard-bearer raises his sabre when he calls his men
 if(e.look&&e.kit==='hasan'){const Zl=rig?.[e.look+'-zalet'],Zg=rig?.[e.look+'-zaglavljen'];if(Zl&&(e.ks==='prep'||e.ks==='ram'))pose={...pose,name:e.look+'-zalet',frame:e.ks==='prep'?0:Math.floor(time*12)%Zl.frames.length,fixedScale:1};else if(Zg&&e.kitOpen>0)pose={...pose,name:e.look+'-zaglavljen',frame:Math.floor(time*7)%Zg.frames.length,fixedScale:1};}
 if(e.look&&e.kit==='janicar'&&e.ks==='leap'){const J=rig?.[e.look+'-skok'];if(J){const L=J.frames.length;pose={...pose,name:e.look+'-skok',frame:e.grounded?Math.min(L-2,4):e.vy<-200?1:e.vy<0?2:Math.min(L-3,3),fixedScale:1};}}
 if(e.look&&e.pozivT>0&&rig?.[e.look+'-poziv']){const P=rig[e.look+'-poziv'];pose={...pose,name:e.look+'-poziv',frame:Math.min(P.frames.length-1,Math.floor((1-e.pozivT/1.1)*P.frames.length)),fixedScale:1};}
 if(e.skriven)pose.alpha=.4;
 if(e.champion){pose.scale=pose.fixedScale??e.scale;rimGlow(pose,x,e.y,e.face,e.hp<e.maxHp/2?'#ff3a1a':'#ffd27a',.28+.12*Math.sin(time*6),2);}if(e.scale&&!pose.scale)pose.scale=e.scale;
 if(e.elite){pose.scale=(pose.scale||1)*1.08;rimGlow(pose,x,e.y,e.face,'#ffcf6a',.22+.08*Math.sin(time*5+e.id),1.4);}for(const [c,a,w] of glows)rimGlow(pose,x,e.y,e.face,c,a,w);rigDraw(pose.name,pose.frame,x,e.y,e.face,{...pose,flash:e.brutal>0?Math.max(e.brutal*.72,e.flash>0?e.flash/.15*.5:0):e.flash>0?e.flash/.15*.5:0,flashColor:e.brutal>0?'#5a0306':'#ffd6bf'});
 if(e.mode==='windup'){ellipse(x,e.y-152,11,11,'#b8382a');ellipse(x,e.y-152,8,8,'#d9503a');textLabel('!',x,e.y-146,{font:'bold 16px Georgia',color:'#fff3bd'});halo(x,e.y-152,26,'rgba(255,90,50,.8)');}
 if(e.hp<e.maxHp&&!e.champion){const bw=54,bx=x-bw/2,by=e.y-136;ctx.fillStyle='rgba(10,20,20,.8)';ctx.fillRect(bx-1,by-1,bw+2,6);const g=ctx.createLinearGradient(bx,0,bx+bw,0);g.addColorStop(0,'#a8352f');g.addColorStop(1,'#e8a061');ctx.fillStyle=g;ctx.fillRect(bx,by,bw*Math.max(0,e.hp/e.maxHp),4);}}
function makeCorpse(type,x,y,face,persist=false,vy=0){return{type,x,y,face,persist,t:0,vx:0,vy:Math.max(0,vy),w:34,h:40,grounded:false};}
function deathPose(c){if(c.skel&&typeof rig!=='undefined'){const S=c.skel,own=S.fall!=='kostur-pada';if(c.t<S.stand){if(own)return{name:S.fall,frame:Math.floor(c.t*3)%2,alpha:1};const n=rig['kostur-stoji'].frames.length;return{name:'kostur-stoji',frame:Math.floor(c.t*7)%n,alpha:1};}const n=rig[S.fall].frames.length,a=own?2:0;return{name:S.fall,frame:Math.min(n-1,a+Math.floor((c.t-S.stand)/.8*(n-a))),alpha:1};}if(c.clip&&typeof rig!=='undefined'&&rig?.[c.clip]){const n=rig[c.clip].frames.length,a=c.clipFrom||0;return{name:c.clip,frame:Math.min(n-1,a+Math.floor(c.t/(c.clipDur||1)*(n-a))),alpha:c.persist?1:1-clamp((c.t-ROT_AT)/1.4,0,1)};}if(c.launched){const hasDeath=typeof rig!=='undefined'&&!!rig?.[c.type+'-death'],F=typeof FOES!=='undefined'?FOES[c.type]:null,name=hasDeath?c.type+'-death':(F?F.anims.main:c.type+'-death'),alpha=c.persist?1:1-clamp((c.t-ROT_AT)/1.4,0,1);if(!c.landed)return{name,frame:hasDeath?1:0,rot:c.spinAngle||0,alpha};const lt=c.t-(c.landT||0);if(hasDeath)return{name,frame:lt<.12?3:lt<.26?4:5,alpha};return{name,frame:0,rot:-c.face*1.42,dx:-c.face*20,dy:4,alpha};}const F=typeof FOES!=='undefined'?FOES[c.type]:null;if(F&&!(typeof rig!=='undefined'&&rig?.[c.type+'-death'])){const fall=clamp(c.t/.45,0,1),ease=fall*fall,back=-c.face;return{name:F.anims.main,frame:0,rot:back*ease*1.42,dx:back*ease*20,dy:ease*4,alpha:1-clamp((c.t-ROT_AT)/1.4,0,1)};}const frame=c.t<.13?0:c.t<.30?1:c.t<.49?2:c.t<.70?3:c.t<.90?4:5;return{name:c.type+'-death',frame,alpha:c.persist?1:1-clamp((c.t-ROT_AT)/1.4,0,1)};}
function drawCorpse(c){if(c.headless)return drawHeadless(c);if(c.legless)return drawLegless(c);if(c.crushed){const a=c.persist?1:1-clamp((c.t-ROT_AT)/1.4,0,1),k=clamp(c.t/.2,0,1);if(a<=0)return;shadow(c.x,c.y,50,.4*a);ellipse(c.x,c.y+1,46*Math.min(1,c.t/1.5+.3),9,`rgba(100,8,10,${.8*a})`);rigDraw(c.crushed.name,0,c.x,c.y,c.face,{scale:c.crushed.scale,sy:1-.62*k,sx:1+.3*k,alpha:a});return;}const pose=deathPose(c);shadow(c.x,c.y,c.type==='musa'?65:45,.35*pose.alpha);if(settings.gore!==false&&c.t>.5){const k=clamp((c.t-.5)/2.2,0,1)*pose.alpha;const r=(c.type==='musa'?46:32)*Math.sqrt(k);const gr=ctx.createRadialGradient(c.x-c.face*30,c.y+1,0,c.x-c.face*30,c.y+1,r);gr.addColorStop(0,`rgba(92,8,10,${.85*pose.alpha})`);gr.addColorStop(.75,`rgba(110,12,14,${.7*pose.alpha})`);gr.addColorStop(1,'rgba(110,12,14,0)');ctx.save();ctx.translate(c.x-c.face*30,c.y+1);ctx.scale(1,.22);ctx.translate(-(c.x-c.face*30),-(c.y+1));ctx.fillStyle=gr;ctx.fillRect(c.x-c.face*30-r,c.y+1-r,r*2,r*2);ctx.restore();}rigDraw(pose.name,pose.frame,c.x,c.y,c.face,{rot:pose.rot,dx:pose.dx,dy:pose.dy,alpha:pose.alpha,flash:c.t<.1?(.1-c.t)*4:0,flashColor:'#fff2d0'});}
function drawBoss(){if(zone!==5||!boss.alive)return;if(boss.stage==='kostac'&&(boss.mode==='pin'||boss.mode==='noz')){drawKostac();return;}const pose=musaPose();if(boss.knock)pose.dx=(pose.dx||0)+boss.knock;
 shadow(boss.x,boss.y,boss.mounted?92:56,.6);
 if(boss.stage==='joust'&&boss.mounted&&!rig?.['musa-mounted']){const f=boss.face,y=boss.y-118;line(boss.x-f*30,y+8,boss.x+f*210,y-6,'#5a3c22',6);poly([[boss.x+f*210,y-12],[boss.x+f*244,y-6],[boss.x+f*210,y]],'#d8dde2');}
 if(boss.mode==='windup'||boss.mode==='second')rimGlow(pose,boss.x,boss.y,boss.face,'#ff3a18',.35+.25*Math.sin(time*28),2.4);
 if(MUSA_OPEN.includes(boss.mode)){rimGlow(pose,boss.x,boss.y,boss.face,'#9dffb0',.45,2);emitters.push({id:'boss-open',kind:'boss',color:'#9dffb0',x:boss.x,y:boss.y,rate:20});}
 if(boss.mode==='roar'){halo(boss.x,boss.y-90,170,'rgba(255,60,40,.45)');emitters.push({id:'boss-roar',kind:'boss',color:'#ff5a3a',x:boss.x,y:boss.y,rate:70});}
 rigDraw(pose.name,pose.frame,boss.x,boss.y,boss.face,{...pose,flash:boss.flash>0?boss.flash/.16:0});
 if(boss.mode==='slash'){for(const [g,al] of [[gctx,.9],[ctx,.35]]){g.save();g.translate(boss.x+boss.face*20,boss.y-60);g.scale(boss.face,1);g.beginPath();g.ellipse(60,0,200,46,0,-1.4,1.4);g.ellipse(50,0,150,26,0,1.4,-1.4,true);g.closePath();g.fillStyle=`rgba(255,220,180,${al*.55})`;g.fill();g.restore();}}
 if(boss.mode==='swing'){for(const [g,al] of [[gctx,.9],[ctx,.35]]){g.save();g.translate(boss.x+boss.face*30,boss.y-80);g.scale(boss.face,1);g.beginPath();g.arc(0,0,125,-1.3,1.1);g.arc(10,0,90,1.1,-1.3,true);g.closePath();g.fillStyle=`rgba(255,150,110,${al*.6})`;g.fill();g.restore();}}
 if(boss.mode==='windup'||boss.mode==='second'){textLabel('!',boss.x,boss.y-205,{font:'bold 30px Georgia',color:'#ffdf9c',glow:'#ff6a3a'});halo(boss.x,boss.y-215,40,'rgba(255,90,50,.7)');}
 drawMusaWindow();drawMaceDrop();}
function advanceFairy(dt){const active=fairy.age<fairy.duration;const approach=active&&fairy.age<1.65;const targetX=approach?clamp(fairy.targetX-p.face*75,p.x-220,p.x+280):p.x-p.face*60;const targetY=approach?Math.min(p.y-100,fairy.targetY-10):p.y-125;const rate=active?7:4;fairy.x+=(targetX-fairy.x)*Math.min(1,dt*rate);fairy.y+=(targetY-fairy.y)*Math.min(1,dt*rate);}
// Codex's Ravijojla: flying in a loop, then casting (or healing), a ribbon of light to the target and a ring of runes there
function rigDrawC(name,frame,x,y,face,o={}){const r=rig?.[name];if(!r)return false;const f=r.frames[clamp(Math.floor(frame),0,r.frames.length-1)];return rigDraw(name,frame,x,y,face,{...o,dy:(o.dy||0)+(f[4]-f[3]/2)*r.scale*(o.scale||1)});}
function drawVila(face,a,enter,fx,fy){const cast0=.28,cast1=1.15,heal=fairy.kind==='heal'&&rig?.['vila-isceljenje'],nm=heal?'vila-isceljenje':rig?.['vila-carolija']?'vila-carolija':'vila-let',k=(fairy.age-cast0)/(cast1-cast0);
 const name=k>=0&&k<1?nm:'vila-let',n=rig[name].frames.length,frame=name==='vila-let'?Math.floor(time*12)%n:Math.min(n-1,Math.floor(k*n)),sc=.85+.15*enter,y=fy-44;
 rigDrawC(name,frame,fx,y,face,{alpha:a,scale:sc});emitters.push({id:'fairy',kind:'fairy',x:fx,y:y,rate:14*a});
 // the light leaves her hands at the release and travels to the target
 const tx=fairy.targetX,ty=fairy.targetY,hx=fx+face*28,hy=y-6;
 if(!heal&&k>.45&&k<1.05&&rig?.['magija-zrak']){const dx=tx-hx,dy=ty-hy,len=Math.hypot(dx,dy),R=rig['magija-zrak'],full=512*R.scale,fade=Math.sin(clamp((k-.45)/.6,0,1)*Math.PI);
  rigDrawC('magija-zrak',Math.floor(time*14)%R.frames.length,(hx+tx)/2,(hy+ty)/2,1,{rot:Math.atan2(dy,dx),sx:len/full,sy:1.1,alpha:a*fade});}
 if(k>.55&&k<1.35&&rig?.['magija-bljesak']){const B=rig['magija-bljesak'],bn=B.frames.length,bf=Math.min(bn-1,Math.floor((k-.55)/.8*bn));rigDrawC('magija-bljesak',bf,heal?p.x:tx,heal?p.y-60:ty,1,{alpha:a,scale:heal?.8:1});}
 textLabel('RAVIJOJLA',fx,y-58,{font:'bold 10px Georgia',color:'#daffe6',alpha:a*.9});}
function drawFairy(){const active=fairy.age<fairy.duration,fx2=fairy.x,fy=fairy.y+Math.sin(time*3)*5;if(!active){halo(fx2,fy-22,26,'rgba(150,255,215,.45)');halo(fx2,fy-22,6,'rgba(255,255,240,.8)');ellipse(fx2,fy-22,2.5,2.5,'#f4fff8');for(let i=0;i<3;i++)ellipse(fx2+Math.sin(time*2+i*2)*9,fy-22+Math.cos(time*2+i*2)*7,1.3,1.3,'#d8ffe9',gctx);emitters.push({id:'fairy',kind:'fairy',x:fx2,y:fy-10,rate:22});return;}const enter=clamp(fairy.age/.22,0,1),leave=clamp((fairy.duration-fairy.age)/.65,0,1),a=enter*leave;const pose=fairy.age<.9?Math.min(5,Math.floor(fairy.age/.15)):5;const face=fairy.targetX>=fx2?1:-1;halo(fx2,fy-42,70,'rgba(140,255,210,.13)',a);
 if(rig?.['vila-let']){drawVila(face,a,enter,fx2,fy);return;}
 rigDraw('fairy-cast',pose,fx2,fy,face,{alpha:a,scale:.85+.15*enter})||sprite('fairy',fx2,fy,90,face,0,a);emitters.push({id:'fairy',kind:'fairy',x:fx2,y:fy-30,rate:30*a});if(fairy.age>.42&&fairy.age<1.05){const fade=Math.sin((fairy.age-.42)/.63*Math.PI);for(const [g,w,al] of [[gctx,4,1],[ctx,2,.7]]){g.save();g.globalAlpha=fade*al;g.strokeStyle='#c8ffe8';g.lineWidth=w;g.beginPath();g.moveTo(fx2+face*30,fy-55);g.quadraticCurveTo((fx2+fairy.targetX)/2,Math.min(fy,fairy.targetY)-65,fairy.targetX,fairy.targetY);g.stroke();for(let j=0;j<3;j++){g.beginPath();g.ellipse(fairy.targetX,fairy.targetY,15+j*15+fairy.age*8,8+j*7,Math.sin(time)*.2,0,Math.PI*2);g.strokeStyle=j%2?'#e8d9a4':'#a1eac9';g.stroke();}g.restore();}}textLabel('RAVIJOJLA',fx2,fy-96,{font:'bold 10px Georgia',color:'#daffe6',glow:'#9dffd8',alpha:a*.9});}

function draw(dt=1/60){
 if(!ctx){return;}
 emitters=[];
 pxScale=layer.width/W*ZOOM;glowScale=glowLayer.width/W*ZOOM;
 const sx=!stage&&shake&&mode==='play'?(Math.random()-.5)*shake:0,sy=!stage&&shake&&mode==='play'?(Math.random()-.5)*shake:0;
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,layer.width,layer.height);gctx.setTransform(1,0,0,1,0,0);gctx.clearRect(0,0,glowLayer.width,glowLayer.height);
 ctx.setTransform(pxScale,0,0,pxScale,(-camera+sx)*pxScale,(-camY+sy)*pxScale);gctx.setTransform(glowScale,0,0,glowScale,-camera*glowScale,-camY*glowScale);
 const solid=x=>world.platforms.some(q=>q.kind==='stone'&&q.y===590&&x>q.x+30&&x<q.x+q.w-30),open=x=>solid(x)&&!world.platforms.some(q=>q.y<585&&x>q.x-30&&x<q.x+q.w+100);
 drawEagles();if(level){if(!p?.vault)drawKolci();drawWater();if(p?.vault)drawVaults();else drawTerrain();}else world.platforms.forEach(q=>{if(q.kind==='stone'&&isFloor(q))drawFloor(q);});drawBraziers();
 if(!level){for(let x=Math.floor(camera/900)*900;x<camera+VIEW_W+500;x+=900){if((x<10800||x>24500)&&solid(x+210))tree(x+210,590);}}else drawLevelDecor(solid);
 if(!level&&(zone===1||zone===4||zone===5)){for(let x=Math.floor(camera/780)*780;x<camera+VIEW_W+780;x+=780){if(solid(x+430))sprite('arch',x+430,594,280,1);}}
 if(!level)for(let x=150;x<29900;x+=1450){if(x>camera-100&&x<camera+VIEW_W+100&&open(x)&&Math.abs(x-chapters[zone].start-90)>160)flag(x,590,true);}if(!level&&open(chapters[zone].start+90))flag(chapters[zone].start+90,590);
 if(level){drawPuzzles();drawLadders();drawBreakables();drawPlows();drawTraps();}else world.platforms.forEach(q=>{if(q.kind==='stone'&&!isFloor(q))drawFloor(q);else if(q.kind==='magic')drawBridge(q);});
 drawGate();
 world.runes.forEach(drawRune);
 world.items.forEach(drawItem);
 world.barriers.forEach(drawBarrier);
 if(!horseMounted&&Math.abs(horseX-camera-VIEW_W/2)<VIEW_W){shadow(horseX,590,62,.5);rigDraw('cast/sarac',0,horseX,591,1,{sy:1+Math.sin(time*1.8)*.008});if(zone===3)textLabel('E · UZJAŠI ŠARCA',horseX,430,{font:'bold 15px Georgia',color:'#fff0bd',glow:'#ffd27a'});}
 if(mode!=='menu'){drawCannons();drawGuns();drawDecals();drawBones();for(const f of fires)drawFire(f);for(const c of corpses)drawCorpse(c);drawHeads();drawLimbs();drawGibs();drawSabljaTag();const nabijen=impaled();for(const e of world.enemies)if(e.alive&&e!==nabijen)drawSoldier(e);drawKits();drawFinishPrompt();drawStealth();drawGrapple();drawTravelers();drawBoss();if(p)drawPlayer();if(nabijen)drawSoldier(nabijen);drawCoins();drawThrown();drawCannonBalls();drawBurning();if(level)drawTrapsFront();drawPowers();if(level){drawOrao();drawSoko();}if(vaultFade>0){vaultFade=Math.max(0,vaultFade-dt);ctx.fillStyle=`rgba(0,0,0,${Math.min(1,vaultFade*3)})`;ctx.fillRect(camera-20,camY-20,VIEW_W+40,VIEW_H+40);}}
 for(const a of arrows){if(a.torch){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot||0);ctx.fillStyle='#5a3a22';ctx.fillRect(-16,-2.5,26,5);ctx.restore();drawFlame(a.x+Math.cos(a.rot||0)*12,a.y+Math.sin(a.rot||0)*12+6,16,26,a.x);emitters.push({id:'torch'+Math.round(a.x/40),kind:'fire',x:a.x,y:a.y,w:10,rate:30});continue;}if(a.wave){halo(a.x,a.y-4,40,'rgba(255,120,80,.8)');ellipse(a.x,a.y,11,19,'#ffc29a');emitters.push({id:'wave',kind:'boss',color:'#ff7a5a',x:a.x,y:a.y+60,rate:50});}else drawArrow(a);}
 for(const a of particles){const k=clamp(a.life/(a.max||1),0,1);if(a.kind==='blood'){if(a.delay>0)continue;ctx.globalAlpha=Math.min(1,k*1.6);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x-a.vx*.022,a.y-a.vy*.022);ctx.strokeStyle=a.color;ctx.lineWidth=a.r;ctx.lineCap='round';ctx.stroke();}else if(a.kind==='dust'){ctx.globalAlpha=k*.38;ellipse(a.x,a.y,a.r*(1.6-k*.6),a.r*(1.2-k*.4),a.color);}else{gctx.globalAlpha=k;ellipse(a.x,a.y,a.r,a.r,a.color,gctx);}}ctx.globalAlpha=1;gctx.globalAlpha=1;
 for(const f of floating){const pop=1+Math.max(0,f.life-.95)*3;textLabel(f.text,f.x,f.y,{font:`bold ${Math.round(17*pop)}px Georgia`,color:f.color,glow:f.color,alpha:clamp(f.life,0,1)});}
 if(stage&&mode==='menu'&&hasDom&&!$('menu').hidden)return;
 if(stage){stage.render({dt:mode==='pause'?0:dt,camX:camera,camY,zone:mode==='menu'?0:zone,look:level?LEVEL_LOOK[level.id]??0:undefined,weather:level&&mode!=='menu'?levelVariant:null,mode,player:p?{x:p.x,y:p.y}:null,shake:mode==='play'?shake:0,hurt:p&&mode==='play'?p.hurt/.22*.6:0,lowHealth:p&&mode==='play'&&p.hp/p.maxHp<.3?1-p.hp/p.maxHp/.3:0,emitters});return;}
 if(screenCtx){screenCtx.setTransform(1,0,0,1,0,0);if(assets.gorge){const drawW=W+260,drawH=drawW*1024/1536;screenCtx.drawImage(assets.gorge,-130-Math.min(1,camera/29900)*180,-80,drawW,drawH);}else{screenCtx.fillStyle='#496f6b';screenCtx.fillRect(0,0,W,H);}screenCtx.drawImage(layer,0,0,W,H);screenCtx.globalCompositeOperation='lighter';screenCtx.globalAlpha=.55;screenCtx.drawImage(glowLayer,0,0,W,H);screenCtx.globalAlpha=1;screenCtx.globalCompositeOperation='source-over';}
}
function pause(){if(mode==='play'){showControls();mode='pause';pauseInfo();$('pause-menu').hidden=false;keys.clear();setTimeout(()=>$('resume')?.focus?.(),60);}else if(mode==='pause'){hideModals();mode='play';}}
document.addEventListener('keydown',e=>{if(['INPUT','SELECT'].includes(document.activeElement.tagName))return;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.code)&&mode==='play'&&e.code!=='Tab')e.preventDefault();if(e.code==='Escape'){if($('zoom')&&!$('zoom').hidden){closeZoom();return;}if(!$('intro').hidden){introEnd(true);return;}if(!$('knjiga').hidden){closeBook();return;}if(!$('settings').hidden){closeSettings();return;}if(mode!=='play'&&mode!=='pause'&&document.querySelector('.modal:not([hidden])')){padMenu(0,0,false,true);return;}pause();return;}if(!keys.has(e.code))pressed.add(e.code);keys.add(e.code);});document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();pressed.clear();if(mode==='play')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='play')pause();});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);pressed.add(b.dataset.key);});for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys.delete(b.dataset.key));});
$('start').onclick=startJourney;$('continue').onclick=()=>start(true);$('pause').onclick=pause;$('resume').onclick=pause;$('retry').onclick=retry;$('restart-checkpoint').onclick=()=>{if(level)return startLevel(levelIndex);if(saveState)start(true);else start();};$('replay').onclick=()=>{start();save();};
function mainMenu(){if(hasDom)document.getElementById('trening-help')?.remove();menuLedger();level=null;levelIndex=-1;stage?.setLevel?.(null);endSequence=null;corpses=[];bones=[];heads=[];limbs=[];gibs=[];booms=[];fountains=[];finisher=null;grapple=null;finGlobal=0;grappleCool=0;training=null;mode='menu';hideModals();$('menu').hidden=false;$('hud').hidden=true;$('controls').hidden=true;$('touch').hidden=true;$('dialogue').hidden=true;$('boss-hud').hidden=true;zone=0;camera=0;keys.clear();}
$('quit').onclick=mainMenu;$('victory-menu').onclick=mainMenu;$('sound').onclick=()=>{initAudio();audioEnabled=!audioEnabled;$('sound').textContent=audioEnabled?'♫':'♪̸';$('sound').setAttribute('aria-label',audioEnabled?'Isključi zvuk':'Uključi zvuk');};
let settingsFrom='menu';function openSettings(from){settingsFrom=from;$('settings').hidden=false;}function closeSettings(){settings.difficulty=$('difficulty').value;readAudioSettings();settings.quality=$('quality').value;settings.reduced=$('reduced').checked;settings.gore=$('gore').checked;try{localStorage.setItem('marko-settings',JSON.stringify(settings));}catch{}$('settings').hidden=true;}
$('settings-open').onclick=()=>openSettings('menu');$('pause-settings').onclick=()=>openSettings('pause');$('settings-close').onclick=closeSettings;$('lore-open').onclick=()=>$('lore').hidden=false;$('lore-close').onclick=()=>$('lore').hidden=true;
p=newPlayer();boss=newBoss();
// ---------- smooth frame pacing (drawing only) ----------
// The game still advances in fixed 1/120 s steps, exactly as before; nothing here touches update().
// 1. On 60/120 Hz screens the browser's frame times wobble by a fraction of a millisecond, which sometimes gave one frame
//    1 step and the next 3 (a visible hitch). Frames within 1 ms of the screen's beat now count as exactly one beat; the
//    difference is kept and handed back, so game time still follows the real clock.
// 2. On 75/144/165 Hz screens steps cannot line up with frames, so some frames repeated a step. There the camera and the
//    moving actors are drawn where they are between the last two steps, and every value is put back right after drawing.
// ?smooth=0 turns both off.
const SMOOTH=!/[?&]smooth=0\b/.test(globalThis.location?.search||'');
const beat={gaps:[],k:0,debt:0};
function frameDt(raw){
 if(!SMOOTH||!(raw>0))return raw;
 if(raw<.1){beat.gaps.push(raw);if(beat.gaps.length>=60){const s=beat.gaps.sort((a,b)=>a-b),m=s[30]*120,k=Math.round(m);beat.k=k>=1&&k<=4&&Math.abs(m-k)<.015*k?k:0;beat.gaps=[];}}
 if(!beat.k||Math.abs(raw-beat.k/120)>.001){const dt=raw+beat.debt;beat.debt=0;return dt;}
 const dt=beat.k/120;beat.debt+=raw-dt;
 if(Math.abs(beat.debt)>1/240){const back=beat.debt;beat.debt=0;return dt+back;}
 return dt;
}
const lerpPrev=new WeakMap();let lerpCam=null,lerpSerial=0;
function eachMover(fn){for(const o of [p,boss,fairy,thrown,world.orao,world.soko])if(o&&typeof o.x==='number')fn(o);for(const list of [world.enemies,world.travelers,arrows,coins])if(Array.isArray(list))for(const o of list)if(o&&typeof o.x==='number')fn(o);}
function lerpSnap(){if(!SMOOTH)return;lerpSerial++;lerpCam=[camera,camY];eachMover(o=>{let v=lerpPrev.get(o);if(!v)lerpPrev.set(o,v=[0,0,0]);v[0]=o.x;v[1]=o.y;v[2]=lerpSerial;});}
function drawFrame(dt){
 if(!SMOOTH||beat.k||!lerpCam){draw(dt);return;}
 const a=Math.min(1,Math.max(0,acc*120)),b=1-a,cam=camera,cy=camY,moved=[],seen=new Set();
 if(Math.abs(camera-lerpCam[0])<300&&Math.abs(camY-lerpCam[1])<300){camera=lerpCam[0]*b+camera*a;camY=lerpCam[1]*b+camY*a;}
 eachMover(o=>{if(seen.has(o))return;seen.add(o);const v=lerpPrev.get(o);if(!v||v[2]!==lerpSerial||typeof o.y!=='number')return;const x=o.x,y=o.y;if(Math.abs(x-v[0])>80||Math.abs(y-v[1])>80)return;moved.push(o,x,y);o.x=v[0]*b+x*a;o.y=v[1]*b+y*a;});
 try{draw(dt);}finally{camera=cam;camY=cy;for(let i=moved.length-3;i>=0;i-=3){moved[i].x=moved[i+1];moved[i].y=moved[i+2];}}
}
// Performance readout for testers: F9 or ?fps. It only reads numbers; the game never looks at it.
const perfHud={on:hasDom&&/[?&]fps\b/.test(globalThis.location?.search||''),el:null,n:0,sum:0,worst:0,work:0,since:0,slow:[]};
function perfTick(now,gap,work){
 if(!perfHud.on)return;
 if(gap>50)perfHud.slow.push(now);while(perfHud.slow.length&&now-perfHud.slow[0]>10000)perfHud.slow.shift();
 perfHud.n++;perfHud.sum+=gap;perfHud.worst=Math.max(perfHud.worst,gap);perfHud.work+=work;
 if(now-perfHud.since<500)return;
 if(!perfHud.el){perfHud.el=document.createElement('div');perfHud.el.id='perf-hud';perfHud.el.setAttribute('data-notr','');perfHud.el.setAttribute('translate','no');perfHud.el.style.cssText='position:fixed;left:8px;bottom:8px;z-index:2147483647;pointer-events:none;white-space:pre;font:12px/1.35 ui-monospace,Consolas,monospace;color:#d9f2e6;background:rgba(6,14,14,.82);padding:6px 9px;border-radius:6px;max-width:calc(100vw - 32px);overflow:hidden';document.body.appendChild(perfHud.el);}
 const n=Math.max(1,perfHud.n),avg=perfHud.sum/n,info=stage?.perf?.(),hz=beat.k?`${Math.round(120/beat.k)} Hz snap`:SMOOTH?'interpolation':'smoothing off';
 // a tester's readout in plain technical English, so it needs no translation
 perfHud.el.textContent=`${Math.round(1000/avg)} FPS · frame ${avg.toFixed(1)} ms (max ${perfHud.worst.toFixed(0)}) · work ${(perfHud.work/n).toFixed(1)} ms · hitches/10s ${perfHud.slow.length}\n`+
  (info?`GPU: ${info.gpu||'unknown'}\nquality: ${settings.quality}${info.auto?'/tier'+info.tier:''} · render ${info.size.join('×')} · layer ${info.layer.join('×')} · ${hz}`:`2D canvas (no WebGL) · ${hz}`);
 perfHud.n=0;perfHud.sum=0;perfHud.worst=0;perfHud.work=0;perfHud.since=now;
}
if(hasDom)document.addEventListener('keydown',e=>{if(e.code!=='F9')return;e.preventDefault();perfHud.on=!perfHud.on;if(!perfHud.on&&perfHud.el){perfHud.el.remove();perfHud.el=null;}});
let last=performance.now(),acc=0;function frame(now){const t0=performance.now(),gap=now-last;drawSerial++;songWatch();let dt=Math.min(frameDt((now-last)/1000),.08)*(globalThis.__slow||1);last=now;pollPads();acc+=dt;while(acc>=1/120){lerpSnap();update(1/120);acc-=1/120;}drawFrame(dt);perfTick(now,gap,performance.now()-t0);requestAnimationFrame(frame);}requestAnimationFrame(frame);
// Read-only QA snapshot; no cheats are exposed to players.
window.markoState=()=>({mode,zone,charge:p?.charge||0,x:p?.x,y:p?.y,hp:p?.hp,energy:p?.energy,wine:p?.wine,buff:p?.buff,horseMounted,kills,elapsed,fairyVisible:fairy.age<fairy.duration,fairyAge:fairy.age,castPending:!!pendingMagic,defense:defenses[zone],bossHp:boss?.hp,runes:world.runes.map(r=>r.active),goals:world.goals?.map(g=>({kind:g.kind,x:Math.round(g.x),y:g.y,done:g.done,label:g.label})),enemies:world.enemies.filter(e=>e.alive&&e.zone===zone).map(e=>({x:e.x,hp:e.hp,mode:e.mode,type:e.type,moving:e.moveT>0&&e.stun<=0,walk:e.walk||0,frame:locomotionPose(e).frame})),bossMode:boss?.mode,bossX:boss?.x,grounded:p?.grounded,remaining:world.enemies.filter(e=>e.alive&&e.zone===zone).length,renderer:stage?'three':'2d',rage:p.rage,guard:p.guard,blocking:p.blocking,crouching:p.crouching,playerHeight:p.h,attackKind:p.attackKind,attack:p.attack,deathSequence:endSequence,corpses:corpses.map(c=>({type:c.type,frame:deathPose(c).frame,t:c.t,grounded:c.grounded,x:Math.round(c.x),y:Math.round(c.y),launched:!!c.launched}))});

document.addEventListener('pointerdown',()=>initAudio(),{once:true});document.addEventListener('keydown',()=>initAudio(),{once:true});

// ---------- audio levels, fullscreen ----------
// Called every game step. Re-aiming a gain at the value it is already heading for draws the same curve, so it is only
// sent when the target changes (it used to queue 600 audio events a second).
const gainAim=new WeakMap();function aimGain(param,v,t,tau){if(gainAim.get(param)===v)return;gainAim.set(param,v);param.setTargetAtTime(v,t,tau);}
function applyAudioLevels(){if(!audio||!SND.master)return;const t=audio.currentTime;aimGain(SND.master.gain,audioEnabled?settings.volume*1.6:0,t,.05);const talk=t<SND.duckUntil;aimGain(SND.bus.music.gain,settings.music*.5*(talk?.28:1),t,.1);aimGain(SND.bus.sfx.gain,settings.sfx*.7*(talk?.55:1),t,.06);aimGain(SND.bus.voice.gain,settings.voice*2,t,.05);aimGain(SND.bus.enemy.gain,settings.voice*.55*(talk?.4:1),t,.06);}
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
// ================= more tricks: a second move for every kind of foe (Codex DOPUNA-11), used once its picture exists =================
{const A=FOES.akindzija,O=FOES.oklopnik,P=FOES.palikuca,pa=A.pick,po=O.pick,pp=P.pick;A.anims.spin='akindzija-spin';O.anims.grab='oklopnik-grab';P.anims.bomb='palikuca-bomb';
 A.pick=d=>rig?.['akindzija-spin']&&d<130&&Math.random()<.4?'spin':pa(d);
 O.pick=d=>rig?.['oklopnik-grab']&&d<105&&Math.random()<.4?'grab':po(d);
 P.pick=d=>rig?.['palikuca-bomb']&&d>=200&&Math.random()<.45?'bomb':pp(d);}
// far moves start from a distance (a lunge, a shield bash, a sweep of the spear); close ones replace the plain blow
const MOVES={
 sword:{clip:'sword-lunge',far:true,when:d=>d>125&&d<270,windup:.6,go(e,d){e.lunge={v:e.face*Math.min(620,(d-55)/.3),t:.3,total:.3,hop:0};e.pendingHit={t:.28,dmg:16,range:110};sfx('whoosh_heavy',{gain:.7,x:e.x});}},
 shield:{clip:'shield-bash',far:true,when:d=>d>100&&d<250,windup:.75,go(e){e.lunge={v:e.face*540,t:.34,total:.34,hop:0};e.pendingHit={t:.3,dmg:18,range:110,push:420};sfx('shield',{gain:.9,x:e.x});}},
 kopljanik:{clip:'kopljanik-sweep',far:true,when:d=>d>90&&d<180,windup:.55,go(e){e.pendingHit={t:.14,dmg:20,range:180,low:true};sfx('whoosh',{gain:.7,x:e.x});}},
 archer:{clip:'archer-kick',when:d=>d<95,windup:.35,go(e){e.pendingHit={t:.12,dmg:10,range:100,push:420,after:{v:-e.face*380,t:.25,total:.25,hop:34}};sfx('whoosh',{gain:.6,x:e.x});}},
 tufekdzija:{clip:'tufekdzija-butt',when:d=>d<100,windup:.4,go(e){e.pendingHit={t:.12,dmg:14,range:105,push:300};sfx('hit_heavy',{gain:.5,x:e.x});}},
};
function tryMove(e,d){const M=MOVES[e.type];if(!M?.far||e.timer>0||e.mode!=='idle'||(e.moveCool||0)>0||!rig?.[M.clip]||!M.when(d)||Math.abs(p.y-e.y)>60||(level&&!e.grounded)||e.perch||e.enter)return false;
 e.mode='windup';e.move=M;e.face=p.x>e.x?1:-1;e.timer=M.windup*D().wind*(e.elite?.8:1);e.windupDuration=e.timer;sfx('draw',{gain:.4,x:e.x});foeSay(e,'attack',{chance:.3});return true;}
function closeMove(e,d){const M=MOVES[e.type];if(M&&!M.far&&rig?.[M.clip]&&!((e.moveCool||0)>0)&&M.when(d)){e.move=M;e.timer=M.windup*D().wind;}}
function movePose(e){const M=e.mode==='windup'?e.move:e.mode==='recover'?e.recMove:null;if(!M||!rig?.[M.clip])return null;const n=rig[M.clip].frames.length,h=Math.ceil(n/2);
 return e.mode==='windup'?{name:M.clip,frame:Math.min(h-1,Math.floor((1-e.timer/(e.windupDuration||.6))*h))}:{name:M.clip,frame:Math.min(n-1,h+Math.floor((1-e.timer/.85)*(n-h)))};}
let fires=[],decals=[];
function foeAttack(e,F){const d=Math.abs(p.x-e.x);
 if(e.variant==='spin'){e.pendingHit={t:.18,dmg:17,range:150};e.lunge={v:e.face*140,t:.3,total:.3,hop:18};sfx('whoosh_heavy',{gain:.8,x:e.x});foeSay(e,'attack',{chance:.3});return;}
 if(e.variant==='grab'){e.pendingHit={t:.2,dmg:22,range:100,grab:true};sfx('cloth',{gain:.9,x:e.x});foeSay(e,'attack',{chance:.5});return;}
 if(e.variant==='bomb'){const vx=clamp((p.x-e.x)/1.42,-460,460);arrows.push({torch:true,bomb:true,x:e.x+e.face*20,y:e.y-120,vx,vy:-640,life:5,enemy:true});sfx('whoosh_heavy',{gain:.6,x:e.x});foeSay(e,'attack',{chance:.3});return;}
 if(e.type==='akindzija'){const jump=e.variant==='jump';if(jump)e.exposed=1.5;e.lunge={v:e.face*(jump?Math.min(560,(d-55)/.38):380),t:jump?.38:.24,total:jump?.38:.24,hop:jump?95:0};e.pendingHit={t:jump?.36:.2,dmg:jump?15:12,range:110};sfx('whoosh',{gain:.6,x:e.x});foeSay(e,'attack',{chance:.28});}
 else if(e.type==='oklopnik'){if(e.variant==='rush'){e.lunge={v:e.face*520,t:.3,total:.3,hop:0};e.pendingHit={t:.28,dmg:16,range:105,push:330};sfx('hoof',{gain:.6,x:e.x});}else{e.pendingHit={t:.05,dmg:24,range:115,slam:true};}}
 else if(e.type==='palikuca'){if(e.variant==='fire'){e.pendingHit={t:.12,dmg:12,range:170,fire:true};addFire(e.x+e.face*95,590,2.2,90);fx('burst',e.x+e.face*70,e.y-95,'#ff9a3a',30,220);sfx('boom',{gain:.4,rate:1.8,x:e.x});}else{const t=1.05,vx=clamp((p.x-e.x)/t,-430,430);arrows.push({torch:true,x:e.x+e.face*28,y:e.y-100,vx,vy:-390,life:4,enemy:true});sfx('whoosh_heavy',{gain:.5,x:e.x});}}}
function foeMotion(e,dt){if(e.lunge&&e.lunge.t>0){e.lunge.t-=dt;const nx=e.x+e.lunge.v*dt;if(world.platforms.some(q=>q.kind!=='magic'&&nx>q.x+20&&nx<q.x+q.w-20&&Math.abs(q.y-e.y)<2)&&Math.abs(p.x-nx)>40)e.x=nx;e.hop=e.lunge.hop*Math.sin(Math.PI*clamp(1-e.lunge.t/e.lunge.total,0,1));if(e.lunge.t<=0){e.hop=0;if(e.lunge.hop)dust(e.x,e.y,8,1.2);}}
 if(e.pendingHit){e.pendingHit.t-=dt;if(e.pendingHit.t<=0){const h=e.pendingHit;e.pendingHit=null;if(h.slam){dust(e.x+e.face*60,e.y,18,2.2);sfx('rock',{gain:.8,x:e.x});sfx('boom',{gain:.5,x:e.x});shake=settings.reduced?0:6;}foeStrike(e,h);if(h.after)e.lunge={...h.after};}}}
function foeStrike(e,h){if(Math.abs(p.x-e.x)>h.range||Math.abs(p.y-e.y)>85||mode!=='play')return;if(h.low&&!p.grounded){label('PRESKOČIO',p.x,p.y-150,'#e9ffe0');return;}if(p.parry>0&&(e.x-p.x)*p.face>=-15&&!h.fire){e.stun=2;e.mode='stun';e.lunge=null;p.energy=Math.min(100,p.energy+15);fx('parry',p.x+p.face*40,p.y-70);p.rage=Math.min(100,p.rage+25);sound('parry');say('block',{chance:.5,delay:.15});label('SAVRŠENO',p.x,p.y-140,'#bfffe5');startCounter(e.x);return;}const before=p.hp;damage(h.dmg,e.face);if(e.type==='pas'&&p.hp<before&&p.grounded&&Math.random()<.35&&startGrapple(e,'pas'))return;if(p.hp<before&&h.push)p.vx+=e.face*h.push;if(p.hp<before&&h.grab&&p.grounded&&Math.random()<.45&&startGrapple(e,'oklopnik')){}else if(p.hp<before&&h.grab){p.vx=-e.face*430;p.vy=-640;p.grounded=false;label('BAČEN PREKO RAMENA!',p.x,p.y-160,'#ffb09a');shake=settings.reduced?0:8;}if(p.hp<before&&h.low)label('PODSEČEN!',p.x,p.y-150,'#ffb09a');}
let fireSndT=-9;function addFire(x,y,life,w=70,gen=0){if(gen===0&&time-fireSndT>1.2){fireSndT=time;sfx('fire',{gain:.5,x});}if(fires.length>22)fires.shift();fires.push({x,y,life,max:life,w,seed:Math.random()*99,gen,spread:.6+Math.random()*.5});}
function updateFires(dt){const add=[];for(const f of fires){f.life-=dt;if(f.life>.3&&mode==='play'&&p.grounded&&Math.abs(p.x-f.x)<f.w*.5&&Math.abs(p.y-f.y)<10&&p.invuln<=0){damage(7,0);label('GORI',p.x,p.y-140,'#ffb070');}
  // fire walks along the ground: after a moment it catches the next stretch on either side (two steps at most, never in the storm)
  if(f.gen<2&&f.spread>0&&!(level&&levelVariant==='storm')){f.spread-=dt;if(f.spread<=0){f.spread=-1;for(const s of[-1,1]){const nx=f.x+s*f.w*.85,gy=groundAt(nx,f.y-30);if(gy!==null&&Math.abs(gy-f.y)<6&&!fires.some(o=>Math.abs(o.x-nx)<o.w*.45)&&Math.random()<.7)add.push([nx,gy,f.max*.7,Math.max(36,f.w*.78),f.gen+1]);}}}
  // and it catches the men standing in it (the fire-throwers themselves only burn from a torch sent back)
  if(f.life>.3)for(const e of world.enemies)if(e.alive&&!e.champion&&e.type!=='palikuca'&&!(e.burn>0)&&Math.abs(e.x-f.x)<f.w*.42&&Math.abs(e.y-f.y)<12)ignite(e);}
 for(const a of add)addFire(...a);fires=fires.filter(f=>f.life>0);}
function blood(x,y,dir,n){if(settings.gore===false||!n)return;const gy=groundAt(x,y)??2000;for(let i=0;i<n;i++){const sp=.35+Math.random();particles.push({kind:'blood',x:x+(Math.random()-.5)*10,y:y+(Math.random()-.5)*14,vx:dir*(70+Math.random()*330)*sp+(Math.random()-.5)*90,vy:-(70+Math.random()*340)*sp,life:3,max:3,r:1.6+Math.random()*3.4,gy,color:['#7a070b','#9b0d12','#b5161a','#5e0508'][i%4]});}}
function drawDecals(){if(settings.gore===false)return;for(const d of decals){d.t=(d.t||0)+1/60;const a=clamp(1-(d.t-34)/10,0,1)*.72;if(a<=0||d.x<camera-50||d.x>camera+VIEW_W+50)continue;ctx.globalAlpha=a;
  if(d.streak){const L=d.streak*Math.min(1,d.t/1.3);line(d.x,d.y,d.x,d.y+L,'#6a070a',d.r*2);ellipse(d.x,d.y+L,d.r*1.1,d.r*1.6,'#7a070b');}
  else{const s=1+.55*Math.min(1,d.t/1.6);ellipse(d.x,d.y+1,d.r*1.6*s,d.r*.42*Math.min(s,1.25),'#6a070a');}}
 ctx.globalAlpha=1;decals=decals.filter(d=>d.t<44);}
// the first surface under a falling drop: a plank, a ledge, the road
function surfaceBelow(a,py){const c=a.q;if(c&&a.x>=c.x&&a.x<=c.x+c.w&&c.y>=py-2&&!c.off)return c;let best=null;
 for(const q of world.platforms){if(q.off||a.x<q.x||a.x>q.x+q.w||q.y<py-2)continue;if(q.kind==='magic'&&!world.runes?.[q.rune]?.active)continue;if(!best||q.y<best.y)best=q;}a.q=best;return best;}
// a pool where it lands; at the end of a plank or a ledge it runs over the edge and drips to the ground below
function bloodLand(a,q){if(decals.length>520)decals.splice(0,20);const r=a.r*(1.4+Math.random()*1.8);
 // a drop beside a pool only widens it a little (up to a size), so a fight leaves pools, not one long red band
 const near=decals.find(d=>!d.streak&&Math.abs(d.y-q.y)<3&&Math.abs(d.x-a.x)<d.r*1.8+r);if(near){near.r=Math.min(17,near.r+r*.12);near.t=Math.min(near.t,1);}else decals.push({x:a.x,y:q.y,r,t:0});
 for(const side of[-1,1]){const edge=side<0?q.x:q.x+q.w;if(Math.abs(a.x-edge)>r*1.6+5)continue;
  if(world.platforms.some(o=>o!==q&&!o.off&&Math.abs(o.y-q.y)<5&&edge+side*6>o.x&&edge+side*6<o.x+o.w))continue;
  const fall=q.solid||q.ground?24+Math.random()*40:10+Math.random()*6;decals.push({x:edge+side*1.5,y:q.y,streak:fall,r:1.3+Math.random(),t:0});
  particles.push({kind:'blood',x:edge+side*2.5,y:q.y+fall,vx:side*6,vy:20,life:3,max:3,r:1.5+Math.random()*1.3,color:'#7a070b',delay:.5+Math.random()*.7});}}
function drawFlame(x,y,w,h,seed=0,alpha=1){const t=time*9+seed;for(const [g,cols] of [[ctx,['rgba(214,60,14,.85)','rgba(255,150,30,.92)','rgba(255,236,160,.95)']],[gctx,['rgba(255,80,10,.45)','rgba(255,150,30,.5)','rgba(255,230,150,.55)']]]){for(let i=0;i<3;i++){const s=1-i*.3,fh=h*s*(.82+.18*Math.sin(t*1.3+i*2)),fw=w*s;g.beginPath();g.moveTo(x-fw/2,y);g.quadraticCurveTo(x-fw*.6,y-fh*.45,x+Math.sin(t+i)*fw*.22,y-fh);g.quadraticCurveTo(x+fw*.6,y-fh*.45,x+fw/2,y);g.closePath();g.globalAlpha=alpha;g.fillStyle=cols[i];g.fill();}g.globalAlpha=1;}}
function drawFire(f){if(f.x<camera-120||f.x>camera+VIEW_W+120)return;const a=clamp(f.life/.6,0,1)*clamp((f.max-f.life)/.2,0,1);halo(f.x,f.y-20,f.w*1.1,'rgba(255,120,30,.55)',a);
 {const nm=f.w<52&&rig?.['plamen-mali']?'plamen-mali':'plamen',R=rig?.[nm];if(R){const grow=clamp((f.max-f.life)/.35,0,1);rigDraw(nm,Math.floor(time*12+f.seed)%R.frames.length,f.x,f.y+3,f.seed%2<1?1:-1,{scale:f.w/(nm==='plamen'?78:27)*(.55+.45*grow),alpha:a});emitters.push({id:'fire'+Math.round(f.seed*100),kind:'fire',x:f.x,y:f.y,w:f.w,rate:12*a});return;}}const n=Math.max(3,Math.round(f.w/18));for(let i=0;i<n;i++){const x=f.x-f.w/2+(i+.5)*f.w/n;drawFlame(x,f.y+2,20+((i*7+f.seed)%9),34+((i*13+f.seed)%22),f.seed+i*3.1,a);}emitters.push({id:'fire'+Math.round(f.seed*100),kind:'fire',x:f.x,y:f.y,w:f.w,rate:26*a});}
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
function launchCorpse(c,power,fromX){if(!power)return c;const dir=Math.sign(fromX-p.x)||p.face;c.vx=dir*(360+power*360);c.vy=-(360+power*300);c.y-=6;c.grounded=false;c.launched=true;c.spinV=dir*(8+power*6);c.spinAngle=0;c.trail=0;hitstop=Math.max(hitstop,.06);shake=settings.reduced?0:6+power*5;sfx('boom',{gain:.55+power*.3});sfx('hit_heavy',{gain:.9});fx('hit',fromX,c.y-60,true);blood(fromX,c.y-70,dir,30+power*20);if(c.type!=='musa')foeSay(c,'death',{chance:.7,x:fromX});return c;}
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
  const edge=left?q.x:q.x+q.w;p.ledge={x0:edge-p.face*18,y0:q.y+112,x1:edge+p.face*24,y1:q.y};p.ledgeT=LEDGE_TIME;p.vx=0;p.vy=0;p.wall=0;sfx('cloth',{gain:.6});p.hang=true;p.hangT=0;p.hangHeld=true;hangTip();sayGrunt(false);return;}}
function ledgeUpdate(dt){if(!(p.ledgeT>0))return false;if(p.hang&&hangUpdate())return true;p.ledgeT=Math.max(0,p.ledgeT-dt);const L=p.ledge,k=1-p.ledgeT/LEDGE_TIME;if(k<.34){p.x=L.x0;p.y=L.y0;}else{const t=(k-.34)/.66,e=t*t*(3-2*t);p.x=L.x0+(L.x1-L.x0)*e;p.y=L.y0+(L.y1-L.y0)*Math.min(1,e*1.25);}p.vx=0;p.vy=0;p.grounded=p.ledgeT<=0;if(p.ledgeT<=0){p.y=L.y1;p.ledge=null;}return true;}
// Pressing into the side of a raised block while airborne -> slide down it; Space jumps off.
function wallCheck(){if(level)return wallCheckLevel();p.wall=0;if(horseMounted||p.ledgeT>0||p.plunge||p.down>0)return;const axis=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);if(!axis)return;for(const q of world.platforms){if(q.kind!=='stone'||isFloor(q))continue;if(p.y<q.y+40||p.y-90>q.y+118)continue;const side=axis>0?q.x:q.x+q.w,edge=p.x+axis*17;if(Math.abs(edge-side)<12&&(axis>0?p.x<q.x:p.x>q.x+q.w)){p.x=side-axis*17;p.wall=axis;p.face=axis;if(p.vy>130)p.vy=130;if(Math.random()<.08)dust(side,p.y-30,1,.4);break;}}}

// ================= campaigns ("pohodi"): levels designed by the artist =================
let level=null,levelIndex=-1;const levelArt={},LEVEL_LOOK={selo:0,klisura:3,suma:2,manastir:4,tvrdjava:5,prevoj:6,pecina:7,podrum:8,mocvara:9,rudnik:10,rusevine:11,reka:12};
const LEVEL_INTRO={selo:'Kažu da je ovde potkovan Šarac i da je jedna potkova ostala u selu. Selo je pod opsadom: oteraj odred i stigni do barjaka na kraju puta.',klisura:'Niz Ibar sede guslari i pevaju kako si pogubio Musu, Marko. Turci hoće da im polome gusle i ućutkaju pesmu, a na kraju klisure čeka Musin brat, Đemo Brđanin. Odbrani guslare: dok se peva, bes ti raste.',suma:'Ovo je moja šuma, Marko. Palikuće pale bukvu na kojoj orlušina ima gnezdo. Spasi joj orliće, i orao ti neće zaboraviti dobro.',manastir:'Kraljevi se svađaju čije je carstvo, a carska knjiga čuva se u manastiru. Oklopnici čuvaju prilaz. Probij se, Marko, pa presudi po pravdi.',tvrdjava:'Tvrđava gori pod opsadom. U turskom taboru, kažu, mladi Turčin za pojasom nosi sablju sa tri zlatna balčaka: sablju Markovog oca. Probij se kroz opsadu i uzmi je natrag.',prevoj:'Musa Kesedžija je zatvorio drumove i primorje. Prevoj je zaleđen, a njegov poslednji odred čeka na vrhu.',pecina:'Ovo je moja pećina, Marko. Kristali pokazuju prolaz, a Turci su se zavukli i ovde.',podrum:'Car je zabranio vino uz ramazan, a ti ga piješ javno, Marko. Carevi čauši idu da ti proliju bačve. Stigni ih pre nego što izbiju slavine, pa pij.',mocvara:'Kroz ovu trsku Turci su jurili sokola i slomili mu krilo. Nađi ga i previj mu krilo: soko ne zaboravlja dobro. Strelci vrebaju iz trske.',rudnik:'Pred smrt, kažu, Marko je ostavio tri kese dukata, a jedna je zakopana u ovom rudniku. Oklopnici čuvaju izlaz, pazi na grede.',rusevine:'Arapin je kraj mora podigao kulu i uzima svadbarinu: ni jedni svatovi ne prođu dok ne plate. Zarobljene svatove drži u kavezima. Razbij kaveze, Marko, pa ukini svadbarinu.',reka:'Zora je blizu, a preko reke se vidi Urvina planina. Stigni do vodenice pre nego što odred pređe reku.'};
// Each level comes in three lights painted by the artist: day, night and storm.
const VARIANTS={day:{label:'Dan',icon:'☀',intro:''},night:{label:'Noć',icon:'☾',intro:'Noć je pala. '},storm:{label:'Oluja',icon:'⚡',intro:'Oluja bije, više ih je. '}};
let levelVariant='day';try{levelVariant=VARIANTS[localStorage.getItem('marko-variant')]?localStorage.getItem('marko-variant'):'day';}catch{}
const levelLayers=(L,v)=>(v==='night'&&L.nightLayers?.length?L.nightLayers:v==='storm'&&L.stormLayers?.length?L.stormLayers:L.layers);
const vistaId=(L,v)=>v==='day'?L.id+'-vista':`${L.id}-vista-${v}`;
const doneKey=(L,v)=>v==='day'?L.id:`${L.id}@${v}`;
function levelsDone(){try{return JSON.parse(localStorage.getItem('marko-levels')||'[]');}catch{return[];}}
function loadImage(src){return new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src;});}
let worldFiles=null,worldCatalog=null;const PACK04_ART=['zag-zvono','zag-ogledalo','zag-led','zag-led-pukao','zag-kamen-kola','zag-kamen-kola-svetli','zag-top','zag-protivteg','cilj-kristal','cilj-kristal-svetli','razbi-sanduk','razbi-cup','razbi-bure','razbi-korpa','razbi-kovceg','razbi-kovceg-otvoren','prop-sanduci','prop-bure','prop-krcag','lestve','lestve-vrh','kula-strazara','predmet-topuz','predmet-dukat','plug-slomljen','cilj-tovar-blaga','volovi-plug-static','prop-balvan','prop-lanac','prop-stena-mala','cilj-poluga','cilj-poluga-povucena','cilj-kapija-zatvorena','cilj-kapija-otvorena','zid-stena','zid-drvo','ploca-pritisak','ploca-pritisak-stisnuta','teret-sanduk','splav','vrata-zakljucana','vrata-otkljucana','prolaz-kamen-zatvoren','prolaz-kamen-otvoren','prolaz-drvo-zatvoren','prolaz-drvo-otvoren','prolaz-rudnik-zatvoren','prolaz-rudnik-otvoren','lift-platforma','kotur','kolje','siljci','zid-kamen','predmet-slovo-m','predmet-slovo-a','predmet-slovo-r','predmet-slovo-k','predmet-slovo-o','predmet-moc-oganj','predmet-moc-grom','predmet-moc-vila','predmet-trava','predmet-cutura','razbi-kosnica','razbi-plast','razbi-tikve','razbi-stena-napukla','razbi-panj','razbi-crkveni-sanduk','razbi-bure-baruta','razbi-tobolac','razbi-santa','razbi-vagon','resetka','predmet-srce-deo','predmet-zapis','predmet-kljuc','pod-napukao','zid-napukao','ulaz-riznica','ulaz-riznica-otvoren','prop-turski-sator'];async function loadLevelArt(L,v='day'){worldFiles??=new Set(await fetch('assets/world/files.json').then(r=>r.json()).catch(()=>[]));const has=f=>!worldFiles.size||worldFiles.has(f);worldCatalog??=await fetch('assets/world/catalog-03.json').then(r=>r.json()).then(c=>Array.isArray(c)?c:c.items||c.assets||Object.values(c)).catch(()=>[]);const ids=[...new Set([...levelLayers(L,v).map(l=>l.id),...(L.fallbackLayers||[]).map(l=>l.id),vistaId(L,v),...L.props.map(p=>p.id),...goalArt(L),'tlo-'+L.id,'tlo-'+L.id+'-kraj',...(L.ground?['tlo-'+L.ground,'tlo-'+L.ground+'-kraj']:[]),...PACK04_ART,...decorIds(L),...kolciIds(L),'prop-ognjiste','zid-'+(WALL_OF[L.id]||'kamen'),...CUDA.filter(c=>c.land===L.id).map(c=>'cudo-'+c.id)])];await Promise.all(ids.filter(id=>!(id in levelArt)).map(async id=>{levelArt[id]=(has(id+'.webp')?await loadImage(`assets/world/${id}.webp`):null)||(has(id+'-variant.webp')?await loadImage(`assets/world/${id}-variant.webp`):null);}));}
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
// The river under the ferry: drawn before the banks so it runs in under them, its surface at the raft, with a
// wavy top, ripples drifting with the current, glints sliding downstream and foam at the banks and round the raft.
function waterY(t,x){return t.y+12+Math.sin(time*1.6+x*.035)*2.2+Math.sin(time*2.3+x*.011)*1.4;}
function drawWater(){for(const t of world.traps||[]){if(t.kind!=='water'||t.x>camera+VIEW_W+80||t.x+t.w<camera-80)continue;const x0=t.x-70,x1=t.x+t.w+70,y=t.y+12,H=330;
  const g=ctx.createLinearGradient(0,y,0,y+H);g.addColorStop(0,'rgba(70,124,128,.88)');g.addColorStop(.22,'rgba(36,80,90,.94)');g.addColorStop(1,'rgba(8,22,28,1)');
  ctx.beginPath();ctx.moveTo(x0,y+H);for(let x=x0;x<=x1;x+=10)ctx.lineTo(x,waterY(t,x));ctx.lineTo(x1,y+H);ctx.closePath();ctx.fillStyle=g;ctx.fill();
  for(let k=0;k<5;k++){const yy=y+16+k*22;ctx.beginPath();for(let x=x0;x<=x1;x+=14)ctx.lineTo(x,yy+Math.sin(time*(1.2+k*.2)+x*.03+k*1.7)*2.5);ctx.strokeStyle=`rgba(170,215,215,${.15-k*.025})`;ctx.lineWidth=1.5;ctx.stroke();}
  ctx.save();ctx.fillStyle='#e2f4ef';for(let i=0;i<16;i++){const gx=x0+((i*97+time*36)%(x1-x0)),gy=y+5+((i*37)%46),w=5+(i*13)%14;ctx.globalAlpha=.2+.2*Math.sin(time*3+i);ctx.fillRect(gx,gy,w,1.4);}ctx.restore();
  ctx.beginPath();for(let x=x0;x<=x1;x+=10)ctx.lineTo(x,waterY(t,x));ctx.strokeStyle='rgba(205,238,232,.6)';ctx.lineWidth=2;ctx.stroke();
  for(const fx of [t.x,t.x+t.w])for(let i=0;i<4;i++)ellipse(fx+(i-1.5)*9+Math.sin(time*3+i)*3,y+2,6+Math.sin(time*4+i)*2,2.2,'rgba(235,245,240,.45)');
  for(const q of world.platforms)if(q.kind==='raft'&&q.x<x1&&q.x+q.w>x0){for(let i=0;i<5;i++)ellipse(q.x+i*q.w/4,y+3+Math.sin(time*2+i),8,2.4,'rgba(235,245,240,.42)');
   const w2=(time*.8+q.x*.001)%1;ctx.save();ctx.globalAlpha=.35*(1-w2);ctx.strokeStyle='#d8f0ea';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(q.x+q.w/2,y+4,q.w*.6+w2*60,4+w2*6,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}}
function drawLevelDecor(solid){
 if(['selo','klisura','suma','manastir'].includes(level.id))for(let x=Math.floor(camera/1300)*1300;x<camera+VIEW_W+500;x+=1300){if(solid(x+520))tree(x+520,590);}
 for(const pr of level.props){const im=levelArt[pr.id];if(!im)continue;const b=propBounds(im),h=pr.height,w=b.w*h/b.h;if(pr.x+w<camera-60||pr.x-w>camera+VIEW_W+60)continue;if(pr.id.startsWith('prop-barjak')&&drawPropBanner(pr,im,b,h))continue;ctx.drawImage(im,b.x,b.y,b.w,b.h,pr.x-w/2,pr.y-h+6,w,h);}
 drawGoals();
 const banner=x=>level.props.some(pr=>pr.id.startsWith('prop-barjak')&&Math.abs(pr.x-x)<140);if(!banner(level.spawn.x+80))flag(level.spawn.x+80,level.spawn.y);if(!banner(level.goal.x))flag(level.goal.x,level.goal.y);}
async function startLevel(i,v=levelVariant){const L=LEVELS[i];if(!L)return;if(!VARIANTS[v])v='day';levelVariant=v;initAudio();$('loading').hidden=false;await loadLevelArt(L,v);$('loading').hidden=true;
 world=makeLevel(L,i,v,{extraFoes:['kopljanik','pas','tufekdzija'].filter(t=>rig?.[t+'-run']&&FOES[t])});level=world.level;levelIndex=i;zone=LEVEL_ZONE+i;checkpoint=zone;ckpt=null;ckptFlags=[];if(i===0)say('weak',{priority:3,delay:1.5});for(const e of world.enemies){const need=e.kit==='azdaja'?['-idle','-death']:['-idle','-attack','-death'];if(e.champion&&!rig?.['cast/'+e.type]&&need.some(s=>!rig?.[e.type+s])){e.type='sword';e.scale=1.6;}}defenses={};p=newPlayer(level.spawn.x);p.y=level.spawn.y;applyPerks();applyHearts();setupBreakables();setupTowers();setupPlows();sizeProps();clearProps();decorate();setupKolci();setupTraps();arena=null;bolts=[];p.vault=null;p.letters=0;p.pow=null;skillCache=null;streak={n:0,t:0,best:0};slowMo=0;hitstop=0;addPartners();hardenFoes(world.enemies);makeElites();stealthSetup();coins=[];chunks=[];thrown=null;camFocus=p.y;lastSafeY=p.y;boss=newBoss();boss.alive=false;horseMounted=false;horseCompleted=true;horseX=-99999;
 particles=[];arrows=[];floating=[];corpses=[];bones=[];heads=[];limbs=[];gibs=[];booms=[];fountains=[];finisher=null;grapple=null;finGlobal=0;grappleCool=0;training=null;ghosts=[];fires=[];decals=[];endSequence=null;camera=0;camY=CAM_Y0;lastSafe=p.x;elapsed=0;kills=0;relics=0;
 hideModals();mode='play';$('hud').hidden=false;$('controls').hidden=false;$('touch').hidden=!matchMedia('(pointer:coarse)').matches;$('boss-hud').hidden=true;keys.clear();pressed.clear();pendingMagic=null;
 fairy={x:p.x-55,y:p.y-125,age:99,duration:3.2,targetX:p.x,targetY:p.y-80,kind:'hover'};
 let plan=levelLayers(L,v);if(!levelArt[plan[0]?.id]&&L.fallbackLayers)plan=L.fallbackLayers;const layers=plan.map(l=>({image:levelArt[l.id],speed:l.speed})).filter(l=>l.image);if(layers.length&&!levelArt[plan[0].id]&&levelArt[vistaId(L,v)])layers.unshift({image:levelArt[vistaId(L,v)],speed:.06});
 showControls();stage?.setLevel?.(layers.length?layers:null);updateHud();
 playPrelaz(L,()=>{{const k=SKILLS.find(k=>k.land===L.id);showTitle(`POHOD ${i+1}${v==='night'?' · NOĆ':v==='storm'?' · OLUJA':''}`,L.name,k&&!ownedSkills().has(k.id)?`Na kraju te čeka nova veština: ${k.name}`:'');}speak(`${L.name}. ${VARIANTS[v].intro}${LEVEL_INTRO[L.id]||L.design?.goal||'Prati put do barjaka.'}`,7);say('chapter',{chance:.8,delay:.6});});}
function completeLevel(){if(mode!=='play')return;mode='levelDone';const done=new Set(levelsDone());done.add(doneKey(level,levelVariant));try{localStorage.setItem('marko-levels',JSON.stringify([...done]));}catch{}
 sound('magic');sfx('horn_call',{gain:.7});say('chapter',{priority:3});keys.clear();$('level-done-title').textContent=level.name+(levelVariant==='day'?'':' · '+VARIANTS[levelVariant].label);
 if(p.letters===31){try{const d=new Set(JSON.parse(localStorage.getItem('marko-slova')||'[]'));d.add(level.id);localStorage.setItem('marko-slova',JSON.stringify([...d]));}catch{}}const learned=SKILLS.find(k=>k.land===level.id),fresh=learned&&grantSkill(learned.id);$('level-skill').innerHTML=fresh?`<p class="eyebrow">NOVA VEŠTINA</p><h3>${fresh.name}</h3><p><kbd>${fresh.key}</kbd> ${fresh.text}</p>`:learned?`<p class="eyebrow">VEŠTINA IZ OVOG POHODA</p><h3>${learned.name}</h3>`:'';$('level-skill').hidden=!learned;{const st=levelStars(level);$('level-stars').innerHTML=[st.done,st.slova,st.cudo].filter(v=>v!==null).map((on,k)=>`<i class="${on?'':'off'}" style="animation-delay:${.25+k*.3}s">★</i>`).join('');}
 $('level-stats').innerHTML=`<div><b>${[...SLOVA].map((c,i)=>(p.letters||0)&(1<<i)?c:'·').join(' ')}</b>Slova</div><div><b>${formatTime(elapsed)}</b>Vreme</div><div><b>×${streak.best}</b>Najduži niz</div><div><b>${starText(level)}</b>Zvezde</div><div><b>${kills}</b>Poraženi</div><div><b>${p.coins||0}</b>Dukati</div><div><b>${p.cudoFound?'✦':'—'}</b>${p.cudoFound?CUDA.find(c=>c.id===p.cudoFound)?.name:'Čudo nije nađeno'}</div>`;
 const next=LEVELS[levelIndex+1],toMusa=levelIndex+1===MUSA_AFTER&&!kacanikWon();$('level-next').hidden=!next&&!toMusa;if(toMusa)$('level-next').textContent='Sledeće: megdan na Kačaniku →';else if(next)$('level-next').textContent=`Sledeći pohod: ${next.name} →`;p.victoryAt=performance.now()/1000;if(hasDom&&rig?.['marko-victory']&&!settings.reduced)setTimeout(()=>{if(mode==='levelDone')$('level-done').hidden=false;},2700);else $('level-done').hidden=false;}
$('levels-open')&&($('levels-open').onclick=openLevels);$('menu-pohodi')&&($('menu-pohodi').onclick=openLevels);$('levels-close').onclick=()=>$('levels').hidden=true;$('victory-next').onclick=()=>startLevel(MUSA_AFTER);
$('level-next').onclick=()=>{if(levelIndex+1===MUSA_AFTER&&!kacanikWon()){$('level-done').hidden=true;startMusa();}else startLevel(levelIndex+1);};$('level-replay').onclick=()=>startLevel(levelIndex);$('level-menu').onclick=mainMenu;
if($('levels-open'))$('levels-open').hidden=!LEVELS.length;$('victory-next').hidden=!LEVELS.length;

function isFloor(q){return level?!!q.ground:q.y>=585;}

// ---------- weather ambience: rain on storm levels, crickets and frogs at night ----------
function ambience(){if(!audio||!SND.bus.sfx)return;const want=level&&mode!=='menu'?(levelVariant==='storm'?'rain':levelVariant==='night'||level.id==='mocvara'?'night':null):null;if(SND.ambName===want)return;const buf=want&&SND.buf['music/'+want];if(want&&!buf)return;
 if(SND.amb){const old=SND.amb;old.g.gain.setTargetAtTime(0,audio.currentTime,.5);setTimeout(()=>{try{old.s.stop();}catch{}},2500);SND.amb=null;}SND.ambName=want;if(!buf)return;
 const s=audio.createBufferSource();s.buffer=buf;s.loop=true;const g=audio.createGain();g.gain.value=0;g.gain.setTargetAtTime(want==='rain'?.75:.55,audio.currentTime,.7);s.connect(g);g.connect(SND.bus.sfx);s.start();SND.amb={s,g};}

// ================= pack 04: climbing, crates and jars, ducats, marvels, the thrown mace, foes that jump =================
// ---------- marvels (čuda) and the smith: kept between runs in localStorage ----------
let perks=new Set(DEV?['oceva-sablja']:[]);
function ownedCuda(){try{return new Set(JSON.parse(localStorage.getItem('marko-cuda')||'[]'));}catch{return new Set();}}
function bank(){return bankCache;}
function setBank(n){bankCache=Math.max(0,Math.round(n));try{localStorage.setItem('marko-dukati',String(bankCache));}catch{}}
function smithLevels(){try{return JSON.parse(localStorage.getItem('marko-kovac')||'{}');}catch{return{};}}
const SMITH=[{id:'hp',name:'Pancirna košulja',text:'+10 zdravlja',cost:[60,90,130,180,240]},{id:'mace',name:'Okovan topuz',text:'+8% snage udaraca',cost:[80,120,170,230,300]},{id:'flask',name:'Veća čutura',text:'+1 vino na polasku',cost:[120,200]}];
function applyPerks(){perks=ownedCuda();if(DEV)perks.add('oceva-sablja');const s=smithLevels();p.maxHp+=(s.hp||0)*10+(perks.has('carska-knjiga')?15:0);p.hp=p.maxHp;p.wineMax=3+(s.flask||0)+(perks.has('pehar-vina')?1:0);p.wine=Math.min(5,p.wine+(s.flask||0)+(perks.has('pehar-vina')?1:0));p.power=1+(s.mace||0)*.08;p.coins=0;p.cudoFound=null;}
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
// Codex's plank bridge (DOPUNA-29): a seamless segment with a rope rail between two end posts. Each bridge is painted
// once into its own small canvas: the middle rail post lands at the bridge's centre, and the posts fade out below
// the deck instead of hanging down the cliff face.
const MOST={k:.38,deck:300,top:50,fade:440,bot:520,post:136,capW:250},mostStrips=new WeakMap();
function mostStrip(q){let s=mostStrips.get(q);if(s)return s;const seg=worldImg('most-daske-segment'),cap=worldImg('most-daske-kraj');if(!seg||!cap)return null;
 const {k,top,bot,post,capW}=MOST,L=q.x+4,R=q.x+q.w-4,D=R-L,x0=L-post*k-2,x1=R+post*k+2,Z=ZOOM,H=(bot-top)*k;
 const c=makeCanvas(Math.ceil((x1-x0)*Z),Math.ceil(H*Z)),g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.imageSmoothingQuality='high';g.scale(Z,Z);
 const sh=Math.min(seg.height,bot)-top;let d=0,src=((768-D/2/k)%1536+1536)%1536;
 while(d<D-.5){const n=Math.min(1536-src,(D-d)/k);g.drawImage(seg,src,top,n,sh,L-x0+d,0,n*k,sh*k);d+=n*k;src=(src+n)%1536;}
 const cw=capW*k,ch=(bot-top)*k;g.drawImage(cap,0,top,capW,bot-top,L-x0-post*k,0,cw,ch);
 g.save();g.translate(R-x0+post*k,0);g.scale(-1,1);g.drawImage(cap,0,top,capW,bot-top,0,0,cw,ch);g.restore();
 const f=g.createLinearGradient(0,(MOST.fade-top)*k,0,ch);f.addColorStop(0,'#000');f.addColorStop(1,'rgba(0,0,0,0)');g.globalCompositeOperation='destination-in';g.fillStyle=f;g.fillRect(0,0,x1-x0,ch);
 s={c,x:x0,y:q.y-1-(MOST.deck-top)*k,w:x1-x0,h:H};mostStrips.set(q,s);return s;}
// ---------- platforms painted by Codex (DOPUNA-37): stone, earth, masonry, snow... one material per land ----------
// Three pieces (left end, a middle that repeats without a seam, right end), 192 tall with the walking surface at y=40, drawn at half size.
// Until the pieces exist the old plank stays.
const PLAT_MAT={selo:'zemlja',oranje:'zemlja',reka:'zemlja',suma:'mahovina',mocvara:'mahovina',klisura:'kamen',manastir:'zid',tvrdjava:'zid',rusevine:'zid',prevoj:'sneg',pecina:'kristal',podrum:'cigla',rudnik:'greda'},PLAT={k:.5,top:40,end:128,mid:256,h:192};
const platStrips=new WeakMap();
function platPiece(m,part){const id=`plat-${m}-${part}`;return worldFiles?.has(id+'.webp')?worldImg(id):null;}
function platStrip(q){const m=PLAT_MAT[level?.id];if(!m)return null;let s=platStrips.get(q);if(s&&s.m===m)return s;const l=platPiece(m,'levo'),mid=platPiece(m,'sredina'),r=platPiece(m,'desno');if(!l||!mid||!r)return null;
 const {k}=PLAT,H=PLAT.h*k,ew=Math.min(PLAT.end*k,q.w/2),es=ew/k,c=makeCanvas(Math.ceil(q.w*ZOOM),Math.ceil(H*ZOOM)),g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.imageSmoothingQuality='high';g.scale(ZOOM,ZOOM);
 for(let x=ew;x<q.w-ew-.5;){const n=Math.min(PLAT.mid*k,q.w-ew-x);g.drawImage(mid,0,0,n/k,PLAT.h,x,0,n,H);x+=n;}
 g.drawImage(l,0,0,es,PLAT.h,0,0,ew,H);g.drawImage(r,PLAT.end-es,0,es,PLAT.h,q.w-ew,0,ew,H);
 s={c,m,h:H};platStrips.set(q,s);return s;}
function drawPlank(q){if(q.x+q.w<camera-60||q.x>camera+VIEW_W+60)return;if(q.bridge){const s=mostStrip(q);if(s){ctx.drawImage(s.c,s.x,s.y,s.w,s.h);return;}}else{const s=platStrip(q);if(s){ctx.drawImage(s.c,q.x,q.y-PLAT.top*PLAT.k,q.w,s.h);return;}}const g=ctx.createLinearGradient(0,q.y,0,q.y+16);g.addColorStop(0,'#9a7246');g.addColorStop(1,'#5a3e22');ctx.fillStyle=g;ctx.fillRect(q.x,q.y,q.w,14);for(let x=q.x+20;x<q.x+q.w;x+=34)line(x,q.y+1,x,q.y+13,'rgba(40,26,12,.6)',2);line(q.x,q.y+1,q.x+q.w,q.y+1,'rgba(255,226,170,.45)',1.5);
 if(q.bridge){for(const x of[q.x+6,q.x+q.w-6]){line(x,q.y+10,x,q.y-46,'#4a3220',6);}ctx.strokeStyle='#c8a66a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x+6,q.y-42);ctx.quadraticCurveTo(q.x+q.w/2,q.y-10,q.x+q.w-6,q.y-42);ctx.stroke();}
 else{for(const x of[q.x+14,q.x+q.w-14]){line(x,q.y+14,x-10,q.y+40,'#4a3220',4);}}}
let towerArt=null;function towerInfoUnused(){if(towerArt!==null)return towerArt;const im=levelArt['kula-strazara'];if(!im)return null;const c=(worldCatalog||[]).find(e=>e.id==='kula-strazara');towerArt=c&&c.deckY?{im,deckY:c.deckY,x0:c.deckX0,x1:c.deckX1}:{im,deckY:im.height*.3,x0:im.width*.25,x1:im.width*.75};return towerArt;}
// ---------- the thrown mace (I): flies out, comes back to Marko's hand ----------
let thrown=null;
function throwMace(){if(!has('bacanje')){locked('bacanje');return;}if(!cdReady('throw')){cdDenied('throw');return;}if(thrown||p.throwT>0||p.attack>0||p.climb||horseMounted||p.down>0||p.drink>0||p.dash>0||p.ledgeT>0||p.blocking||p.spin>0)return;
 if(p.energy<15){toast('Za bacanje topuza treba 15 snage · obnavlja se sama',1.6);return;}p.energy-=15;p.throwT=.5;p.throwFired=false;p.lowThrow=p.grounded&&(p.crouching||isDown('KeyS','ArrowDown'));cdStart('throw');sayGrunt(true);sfx('whoosh_heavy',{gain:.5});}
function updateThrow(dt){if(p.throwT>0){p.throwT=Math.max(0,p.throwT-dt);if(!p.throwFired&&p.throwT<.25){p.throwFired=true;thrown={x:p.x+p.face*36,y:p.y-(p.lowThrow?24:80),vx:p.face*820,dir:p.face,back:false,t:0,rot:0,hit:new Set(),low:p.lowThrow};if(p.lowThrow)label('NISKO',p.x+p.face*60,p.y-110,'#ffe6a8');sfx('whoosh',{gain:.7});}}
 const m=thrown;if(!m)return;m.t+=dt;m.rot+=dt*22*m.dir;
 if(!m.back){m.vx-=m.dir*1500*dt;m.x+=m.vx*dt;if(m.vx*m.dir<=0||m.t>.9)turnBack(m);for(const q of world.platforms)if(q.solid&&!q.off&&m.x>q.x&&m.x<q.x+q.w&&m.y>q.y&&m.y<q.y+q.h){m.x-=m.vx*dt;turnBack(m);sfx('clang',{gain:.5,x:m.x});dust(m.x,m.y,5,.8);break;}}
 else{const tx=p.x,ty=p.y-(m.low?32:70),dx=tx-m.x,dy=ty-m.y,d=Math.hypot(dx,dy),v=Math.min(1050,380+m.t*600);if(d<38||m.t>3){thrown=null;sfx('leather',{gain:.6});label('✓',p.x,p.y-130,'#ffe6a8');return;}m.x+=dx/d*v*dt;m.y+=dy/d*v*dt;}
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
 skillCache=null;const sk=ownedSkills(),lvName=id=>LEVELS.find(L=>L.id===id)?.name||id;$('vestine').innerHTML=SKILLS.map((k,i)=>`<div class="riz-skill ${sk.has(k.id)?'have':'locked'}"><span class="riz-num">${i+1}</span><div><b>${k.name}</b><p class="riz-keys">${keyChips(k.key)}</p><small>${k.text}</small><em>${sk.has(k.id)?'✓ Naučeno':'🔒 Dobija se posle pohoda „'+lvName(k.land)+'”'}</em></div></div>`).join('');
 $('riz-n-vestine').textContent=`${SKILLS.filter(k=>sk.has(k.id)).length}/${SKILLS.length}`;$('riz-bar-vestine').style.width=`${SKILLS.filter(k=>sk.has(k.id)).length/SKILLS.length*100}%`;$('riz-n-cuda').textContent=`${CUDA.filter(c=>have.has(c.id)).length}/${CUDA.length}`;
 {const b=book(),n=Object.keys(FOE_BOOK).filter(t=>b[t]).length;$('dusmani').innerHTML=`<p>Dušmani koje je Marko sreo na drumu: snaga, slabost i broj savladanih.</p><button class="secondary" id="riznica-knjiga">Otvori knjigu dušmana · ${n}/${Object.keys(FOE_BOOK).length}</button>`;$('riznica-knjiga').onclick=()=>openBook();}
 $('kombinacije').innerHTML=[['J J J','Junački niz','treći udarac obara'],['J J K','Lomilac','razbija štit i oklop, odbacuje'],['S+K, Space','Aperkat i skok za njim','jak udarac odozdo diže Turčina u vazduh, Marko skače za njim'],['S+J','Šut nogom','obija štit u stranu, odguruje (i sa ivice)'],['S u trku','Klizanje','podseca neprijatelje'],['u skoku J J J','Žongliranje','drži ga gore; treći ga zakuca o zemlju'],['u skoku K','Tresak','iz vazduha u zemlju, udarni talas'],['skok, J J J','Vazdušni niz','držiš se u vazduhu dok udaraš'],['SHIFT → J','Juriš','kroz red neprijatelja'],['S+J u skoku','Udar nadole','odskok od kolja i neprijatelja'],['drži K','Pun zamah','tri stepena, ★ kad je pun']].map(([k,n,t])=>`<div class="riz-combo"><p class="riz-keys">${keyChips(k)}</p><b>${n}</b><small>${t}</small></div>`).join('');
 $('purse').textContent=`Dukati: ${bank()}`;
 $('smith').innerHTML=SMITH.map(u=>{const lv=s[u.id]||0,cost=u.cost[lv];return`<button data-up="${u.id}" ${cost===undefined||bank()<cost?'disabled':''}><span>${u.name} · ${u.text}<small>${'■'.repeat(lv)}${'□'.repeat(u.cost.length-lv)}</small></span><b>${cost===undefined?'NAJBOLJE':cost+' ⛁'}</b></button>`;}).join('');
 $('smith').querySelectorAll?.('[data-up]').forEach(b=>b.onclick=()=>{const u=SMITH.find(u=>u.id===b.dataset.up),lv=s[u.id]||0,cost=u.cost[lv];if(cost===undefined||bank()<cost)return;setBank(bank()-cost);s[u.id]=lv+1;try{localStorage.setItem('marko-kovac',JSON.stringify(s));}catch{}sound('magic');openRiznica();});
 {const hs=storedSet('marko-srca');$('riz-n-srca').textContent=`${hs.size}/${Object.keys(ZAPISI).length}`;}
 const tabs=[...document.querySelectorAll('#riznica .riz-tabs [data-tab]')],show=t=>{rizTab=t;for(const b of tabs)b.classList.toggle('on',b.dataset.tab===t);for(const el of document.querySelectorAll('#riznica .riz-panel'))el.hidden=el.dataset.panel!==t;};
 for(const b of tabs)b.onclick=()=>{show(b.dataset.tab);sfx('cloth',{gain:.3,rate:1.4});};show(rizTab);
 $('riznica').hidden=false;}
// keys as chips: "skok + zid + SPACE" -> [skok] + [zid] + [SPACE]; words that are not keys stay as words
let rizTab='vestine';
function keyChips(s){const isKey=w=>/^([A-Z]|SPACE|SHIFT|Space|Shift)$/.test(w);
 return String(s).split(/\s*(\+|,|→)\s*/).map(part=>{if(part==='+'||part===','||part==='→')return`<i>${part===','?'·':part}</i>`;
  // runs of plain words stay one phrase, so "u pravom trenutku" is translated whole
  const out=[];let words=[];const flush=()=>{if(words.length){out.push(`<span>${tr(words.join(' '))}</span>`);words=[];}};
  for(const w of part.split(' ').filter(Boolean)){if(isKey(w)){flush();out.push(`<kbd>${w.toUpperCase()}</kbd>`);}else words.push(w);}flush();return out.join(' ');}).join(' ');}
let bankCache=0;try{bankCache=Number(localStorage.getItem('marko-dukati')||0);}catch{}
function grantCudo(id){const have=ownedCuda();if(have.has(id))return;have.add(id);try{localStorage.setItem('marko-cuda',JSON.stringify([...have]));}catch{}const c=CUDA.find(c=>c.id===id);if(c)toast(`Novo čudo u riznici: ${c.name}`,4);}
function startWindup(e,F,d){if(e.type!=='archer')sfx('draw',{gain:.3,x:e.x});else sfx('cloth',{gain:.35,x:e.x});foeSay(e,'attack',{chance:.14});e.mode='windup';e.timer=(F?.windup??(e.type==='archer'?1.05:.7))*D().wind;if(F)e.variant=F.pick(d);else closeMove(e,d);if(e.champion)e.timer*=e.p3?.5:e.hp<e.maxHp/2?.62:.85;else if(e.elite)e.timer*=.8;e.windupDuration=e.timer;}
// a pohod foe: archers on towers keep shooting, the rest close in by walking, jumping and climbing
function levelFoe(e,F,dx,d,dt){if(e.caus)return causStep(e,d,dt);if(time-(e.budiAt??-9)<BUDI_T){e.vx=0;return false;}if((e.spava||e.patrola)&&stealthFoe(e,d,dt))return false;if(e.skriven&&zaseda(e,d))return false;if(e.prey&&preyFoe(e,F,d,dt))return false;const dy=p.y-e.y,ranged=e.type==='archer'||e.type==='tufekdzija',reach=(F?.reach??(ranged?480:84))*(e.champion?1.3:1),speed=F?.speed??(e.type==='shield'?65:95);
 if(e.perch){if(d<820&&Math.abs(dy)<600&&e.timer<=0)startWindup(e,F,d);return false;}
 if(d>760&&!e.alert)return false;e.alert=d<760;
 if(ranged?(d<=reach&&Math.abs(dy)<320):(d<=reach&&Math.abs(dy)<80)){if(e.timer<=0&&!e.climb&&e.grounded)startWindup(e,F,d);return false;}
 if(tryMove(e,d))return false;foeWalk(e,dx>0?1:-1,speed,dt);return false;}
// hands find the top of a wall, a cliff, a tower or a plank: grab it and climb up
function ledgeCheckLevel(){if(p.ledgeCool>0)return;if(p.ledgeT>0||horseMounted||p.plunge||p.vy< -150||p.attack>0||p.down>0||p.climb)return;const hands=p.y-112;
 for(const q of world.platforms){if(q.off||q.kind==='crate'||q.kind==='step'||q.kind==='magic')continue;if(Math.abs(hands-q.y)>28||p.y<q.y+24)continue;
  const left=p.face>0&&p.x+17>q.x-12&&p.x+17<q.x+20,right=p.face<0&&p.x-17<q.x+q.w+12&&p.x-17>q.x+q.w-20;if(!left&&!right)continue;
  const edge=left?q.x:q.x+q.w;if(blockedAt(edge+(left?14:-14),q.y-40)||blockedAt(edge-(left?14:-14),q.y+8,q))continue;
  p.ledge={x0:edge-p.face*18,y0:q.y+112,x1:edge+p.face*24,y1:q.y};p.ledgeT=LEDGE_TIME;p.vx=0;p.vy=0;p.wall=0;sfx('cloth',{gain:.6});p.hang=true;p.hangT=0;p.hangHeld=true;hangTip();sayGrunt(false);return;}}
function blockedAt(x,y,skip){return world.platforms.some(q=>q!==skip&&q.solid&&!q.off&&x>q.x&&x<q.x+q.w&&y>q.y&&y<q.y+q.h);}
// pressing into a tall wall while in the air: slide down it; Space jumps off to the other side
function wallCheckLevel(){p.wall=0;if(!has('zid'))return;if(horseMounted||p.ledgeT>0||p.plunge||p.down>0||p.climb)return;const axis=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);if(!axis||(p.wallJumpT>.08&&axis===p.wallSide))return;
 for(const q of world.platforms){if(!q.solid||q.off||q.kind==='crate'||q.kind==='step'||q.pillar||q.h<100)continue;if(p.y<q.y+50||p.y-90>q.y+q.h)continue;const side=axis>0?q.x:q.x+q.w,edge=p.x+axis*17;
  if(Math.abs(edge-side)<12&&(axis>0?p.x<q.x:p.x>q.x+q.w)){p.x=side-axis*17;p.wall=axis;p.face=axis;if(p.vy>120)p.vy=120;if(Math.random()<.1)dust(side,p.y-30,1,.4);break;}}}
function climbPose(){if(rig?.['marko-climb'])return{name:'marko-climb',frame:Math.floor((p.climbDist||0)/22)%rig['marko-climb'].frames.length};const k=Math.floor((p.climbDist||0)/26)%2;return{name:'marko-jump',frame:3,faceAs:k?1:-1,sy:1+(k?.02:-.02)};}
function throwPose(){const t=1-p.throwT/.5;if(p.lowThrow){const C=rig?.['marko-crouch-throw'];if(C)return{name:'marko-crouch-throw',frame:Math.min(C.frames.length-1,Math.floor(t*C.frames.length))};if(rig?.['marko-crouch'])return{name:'marko-crouch',frame:Math.min(rig['marko-crouch'].frames.length-1,2),rot:p.face*(t<.5?-.12:.1)};}if(rig?.['marko-throw'])return{name:'marko-throw',frame:Math.min(rig['marko-throw'].frames.length-1,Math.floor(t*rig['marko-throw'].frames.length))};return{name:'marko-attack',frame:Math.min(5,Math.floor(t*6))};}
function drawArrow(a){if(a.flame){const k=clamp(a.life/1.4,0,1);halo(a.x,a.y,26,`rgba(255,140,40,${.5*k})`);ellipse(a.x,a.y,14*k+6,9*k+4,`rgba(255,${120+Math.round(100*k)},40,${.85*k})`);ellipse(a.x,a.y,6,4,'rgba(255,240,180,.9)');return;}if(a.spear){const ang=Math.atan2(a.vy||0,a.vx);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(ang);line(-78,0,0,0,'#6a4a2a',4);poly([[14,0],[-4,-6],[-4,6]],'#dfe4e8');ctx.restore();if(!a.enemy)line(a.x-Math.cos(ang)*60,a.y-Math.sin(ang)*60,a.x,a.y,'rgba(200,255,232,.9)',4,gctx);return;}if(a.bullet){const ang=Math.atan2(a.vy,a.vx);line(a.x-Math.cos(ang)*26,a.y-Math.sin(ang)*26,a.x,a.y,'rgba(255,230,170,.9)',2.5,gctx);ellipse(a.x,a.y,2.5,2.5,'#2a2a2a');return;}const ang=Math.atan2(a.vy||0,a.vx);ctx.save();ctx.translate(a.x,a.y);ctx.rotate(ang);line(-30,0,0,0,'#c9a46a',2.5);poly([[4,0],[-6,-4],[-6,4]],'#e7e3cd');poly([[-30,0],[-38,-5],[-34,0]],'#d9d2c0');poly([[-30,0],[-38,5],[-34,0]],'#b9b2a0');ctx.restore();if(!a.enemy)line(a.x-Math.cos(ang)*40,a.y-Math.sin(ang)*40,a.x,a.y,'rgba(200,255,232,.9)',3,gctx);}
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
 for(const q of plats)if(q.kind==='plank'&&!q.kolo&&!(q.off&&q.arena)){if(q.crumble&&level?.id==='prevoj'&&levelArt['zag-led']){if(q.off)continue;const im=levelArt[q.shakeT>0&&levelArt['zag-led-pukao']?'zag-led-pukao':'zag-led'],B=propBounds(im),sh=q.shakeT>0?(Math.random()-.5)*3:0;ctx.drawImage(im,B.x,B.y,B.w,B.h,q.x-6+sh,q.y-8,q.w+12,(q.w+12)*B.h/B.w);continue;}drawPlank(q);}}

// props are painted scenery: one that would cover a tower, a ladder, stairs or a shaft is left out
// one true size per kind, against Marko (about 125 tall): a door is as tall as he is, a barrel reaches his hip.
// levels.json gives each prop one of 125/140/180/240 whatever it is, so a barrel stood as tall as Marko and an oak was smaller than him.
function sizeProps(){for(const pr of level?.props||[]){const h=DECOR_H[pr.id];if(!h||pr.id.startsWith('prop-barjak'))continue;const r=((Math.abs(Math.round(pr.x))*7919)%17)/100;pr.height=Math.round(h*(.93+r));}}
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
function has(id){return !level||DEV||ownedSkills().has(id);} // the test build knows every move
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
function splashIn(t,o,key){const s=t.y+12,inside=o.x>t.x-10&&o.x<t.x+t.w+10&&o.y>s;if(inside&&!o[key]){o[key]=true;const v=Math.min(1,Math.abs(o.vy||300)/700);for(let i=0;i<18;i++)particles.push({kind:'dust',x:o.x+(Math.random()-.5)*30,y:s,vx:(Math.random()-.5)*220,vy:-(120+Math.random()*320)*v,life:.8,max:.8,r:2+Math.random()*3,color:i%3?'#cfe8e4':'#8fbcbc'});(sfx('splash',{gain:.75,x:o.x})||sfx('fall',{gain:.6,rate:.6,x:o.x}));}if(!inside)o[key]=false;if(inside&&o.vy>140)o.vy*=Math.pow(.02,1/120);}
function updateTraps(dt){for(const t of world.traps||[]){t.t+=dt;if(t.kind==='water'){splashIn(t,p,'wet'+t.x);for(const e of world.enemies)if(e.alive)splashIn(t,e,'wet');continue;}
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
// ================= the wedding guests in the Arab's cages (Ruševine, "Marko Kraljević ukida svadbarinu") =================
function updateKavezi(dt){const cages=(world.traps||[]).filter(t=>t.kind==='kavez');if(!cages.length)return;if(!world.mladenci)world.mladenci=cages.reduce((a,b)=>b.x>a.x?b:a);
 for(const t of cages){t.shake=Math.max(0,(t.shake||0)-dt);if(t.open){t.t=(t.t||0)+dt;continue;}
  const near=Math.abs(p.x-t.x)<120&&Math.abs(p.y-t.y)<80;
  if(attackActive()&&near&&t.hitId!==p.attackId&&(t.x-p.x)*p.face>-50){t.hitId=p.attackId;hitKavez(t,p.attackKind==='light'?1:2);}
  if(thrown&&t.thrownHit!==thrown&&Math.abs(thrown.x-t.x)<70&&Math.abs(thrown.y-(t.y-60))<80){t.thrownHit=thrown;hitKavez(t,2);}}
 const freed=cages.filter(t=>t.open).length;world.svatoviFreed=freed;world.svatoviAll=cages.length;}
function hitKavez(t,power){t.hp-=power;t.shake=.2;sfx('hit_heavy',{gain:.7,rate:1.2,x:t.x});sfx('leather',{gain:.5,x:t.x});burst(t.x,t.y-70,'#b08050',10,180);dust(t.x,t.y,6,1.2);
 if(t.hp>0){label(`KAVEZ · ${t.hp}`,t.x,t.y-170,'#ffd2a0');return;}
 t.open=true;t.t=0;sfx('gate',{gain:.8,x:t.x});dust(t.x,t.y,18,2.4);for(let i=0;i<14;i++)particles.push({kind:'dust',x:t.x+(Math.random()-.5)*90,y:t.y-60,vx:(Math.random()-.5)*300,vy:-100-Math.random()*260,life:1.2,max:1.2,r:3+Math.random()*4,color:'#8a6a44'});
 const cages=(world.traps||[]).filter(c=>c.kind==='kavez'),n=cages.filter(c=>c.open).length;addCoins(10,t.x,t.y-80);
 toast(n===cages.length?'Svi svatovi su slobodni! Svadbarine više nema.':`Svatovi su slobodni · ${n}/${cages.length}`,3);say('pt_free_2',{priority:2,x:t.x});}
function drawKavez(t){if(t.x<camera-300||t.x>camera+VIEW_W+300)return;const sh=t.shake>0?Math.sin(time*80)*3:0,cage=worldImg(t.open?'kavez-razbijen':'kavez-svatovi');
 // the guests: huddled in the cage, then the kolo once they are out (a few seconds), then off home
 const dancing=t.open&&t.t<11,gone=t.open&&t.t>=11,off=t.open?Math.max(0,t.t-5)**1.4*70:0;
 if(!gone){const nm=dancing&&rig?.['svatovi-kolo']?'svatovi-kolo':rig?.['svatovi-zarobljeni']?'svatovi-zarobljeni':null,a=t.open?clamp((11-t.t)/1.2,0,1):1;
  if(nm)rigDraw(nm,Math.floor(time*(dancing?9:5))%rig[nm].frames.length,t.x+(dancing?-30+off:0),t.y,1,{alpha:a});
  else for(const [k,who] of [['putnik-putnica-idle',-28],['putnik-trgovac-idle',8],['putnik-starac-idle',40]])rigDraw(k,Math.floor(time*5)%(rig?.[k]?.frames.length||1),t.x+who+(dancing?Math.sin(time*6+who)*14:0),t.y,dancing?(Math.sin(time*3+who)>0?1:-1):-1,{alpha:a});}
 if(cage){const b=propBounds(cage),whole=worldImg('kavez-svatovi'),k=200/(whole?propBounds(whole).h:b.h),h=b.h*k,w=b.w*k;ctx.drawImage(cage,b.x,b.y,b.w,b.h,t.x-w/2+sh,t.y-h+6,w,h);}
 else if(!t.open){for(let bx=-80;bx<=80;bx+=20)line(t.x+bx+sh,t.y,t.x+bx+sh,t.y-170,'#4a3424',7);line(t.x-90+sh,t.y-170,t.x+90+sh,t.y-170,'#3a2a1c',10);line(t.x-90+sh,t.y-4,t.x+90+sh,t.y-4,'#3a2a1c',10);}
 if(t===world.mladenci&&t.open)drawMladenci(t);
 if(!t.open&&Math.abs(p.x-t.x)<320)textLabel('RAZBIJ KAVEZ',t.x,t.y-210,{font:'bold 13px Georgia',color:'#ffe2a8'});}
// the last cage held the bride and groom: they leap for joy beside the kolo, then run off down the road ahead of the guests
function drawMladenci(t){const T=t.t||0;if(T<.5||T>15||!rig?.['mlada-trci']||!rig?.['mladozenja-trci'])return;const run=T>6,k=run?T-6:0,off=k*170+k*k*22,a=clamp((15-T)/1.2,0,1)*clamp(1-(off-700)/250,0,1);if(a<=0)return;
 if(!run){const f=Math.floor((T-.5)*9);if(rig['mlada-skok'])rigDraw('mlada-skok',f%rig['mlada-skok'].frames.length,t.x+70,t.y,1,{alpha:a});if(rig['mladozenja-skok'])rigDraw('mladozenja-skok',(f+3)%rig['mladozenja-skok'].frames.length,t.x+128,t.y,-1,{alpha:a});}
 else{rigDraw('mladozenja-trci',Math.floor(T*12)%8,t.x+128+off,t.y,1,{alpha:a});rigDraw('mlada-trci',Math.floor(T*12+3)%8,t.x+70+off*.97,t.y,1,{alpha:a});}
 if(Math.random()<.25&&a>.3){const x=t.x+100+off;particles.push({kind:'dust',x:x+(Math.random()-.5)*60,y:t.y-150-Math.random()*30,vx:(Math.random()-.5)*60+(run?120:0),vy:-20-Math.random()*40,life:1.6,max:1.6,r:2+Math.random()*2,color:['#ff9db0','#fff3e0','#e8364a','#ffd36a'][Math.floor(Math.random()*4)]});}}
// ================= the guslars of the Ibar gorge ("Guslar peva o Marku") =================
// A guslar sits by the road. When Marko comes, Turks run in to break his gusle (a second band from behind).
// Defend him and he sings a part of Marko's song: rage fills and wounds close. The last one sings in peace before the champion.
const GUSLE_HP=100,GUSLE_HIT=20,STIH_T=2.6;
const STIHOVI=[['Mili Bože, čuda velikoga!','Kad se kreće Kraljeviću Marko','niz klisuru, niz Ibar vodicu.'],
 ['Pod njim Šarac kao gorska vila,','o ramenu topuz šestoperac,','pred njim beže Turci janjičari.'],
 ['Na kraj klisure Đemo Brđanine,','došao je brata da osveti:','udri, Marko, ne daj se Brđaninu!']];
let guslarN=0;
function preyFoe(e,F,d,dt){const g=e.prey;if(g.state!=='napad'&&g.state!=='odbrana'){e.prey=null;e.preyHit=false;return false;}if(d<240||e.perch||e.climb)return false;
 e.alert=true;const gd=g.x-e.x,ad=Math.abs(gd);e.face=gd>0?1:-1;
 if(ad<64){if(e.timer<=0&&e.grounded&&e.mode==='idle'){startWindup(e,F,ad);e.preyHit=true;}return true;}
 foeWalk(e,e.face,(F?.speed??95)*1.1,dt);return true;}
function guslarFoe(g,type,side,k=0){const hp=FOE_HP_G[type]||90,x=(side>0?g.x1+60:g.x0-60)+side*k*75,y=groundAt(x,g.y-60)??g.y;
 world.enemies.push({id:40000+(++guslarN),x,y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type,zone,face:-side,mode:'idle',timer:.6,stun:0,flash:0,alive:true,home:g.x,attackId:0,grounded:true,prey:g,enter:{tx:g.x+side*70,t:-4,v:125+Math.random()*45}});}
function updateGuslari(dt){const G=(world.traps||[]).filter(t=>t.kind==='guslar');if(!G.length)return;
 G.forEach((g,i)=>{g.t=(g.t||0)+dt;g.shake=Math.max(0,(g.shake||0)-dt);guslarSongTick(g);if(!g.state){g.state='ceka';g.hp=GUSLE_HP;g.stih=STIHOVI[Math.min(i,STIHOVI.length-1)];}
  const near=Math.abs(p.y-g.y)<320;
  if(g.odbrana&&(g.state==='ceka'||g.state==='odbrana')){guslarOdbrana(g,dt,near);return;}
  if(g.state==='ceka'){
   if(g.mir){if(near&&Math.abs(p.x-g.x)<330)guslarPeva(g);}
   else if(near&&p.x>g.x0+60&&p.x<g.x1){g.state='napad';g.t=0;g.wave=0;toast('Turci hoće da polome gusle! Odbrani guslara.',3);sfx('horn_call',{gain:.7});
    ['sword','shield','sword'].forEach((type,k)=>guslarFoe(g,type,1,k));}}
  if(g.state==='napad'){const foes=world.enemies.filter(e=>e.alive&&e.prey===g);
   for(const e of foes)if(e.preyHit&&e.mode==='recover'){e.preyHit=false;if(Math.abs(e.x-g.x)>90)continue;g.hp-=GUSLE_HIT;g.shake=.25;sfx('hit_body',{gain:.6,rate:1.3,x:g.x});burst(g.x,g.y-70,'#a0703a',8,160);
    if(g.hp<=0){g.state='bezi';g.t=0;sfx('rock',{gain:.6,x:g.x});for(let k=0;k<10;k++)particles.push({kind:'dust',x:g.x,y:g.y-60,vx:(Math.random()-.5)*260,vy:-80-Math.random()*200,life:1,max:1,r:2+Math.random()*3,color:'#7a4e26'});
     toast('Gusle su polomljene. Pesma ćuti.',3);break;}
    label(`GUSLE · ${g.hp}`,g.x,g.y-200,'#ffb08a');}
   // the second band comes from behind once the first is thinned out
   if(g.state==='napad'&&!g.wave&&foes.length<=1&&g.t>4){g.wave=1;guslarFoe(g,'akindzija',-1);guslarFoe(g,'akindzija',-1,1);toast('Iza tebe! Akindžije jure na guslara.',2.5);sfx('horn_call',{gain:.6,rate:1.1});}
   else if(g.state==='napad'&&g.wave&&!foes.length)guslarPeva(g);}
  if(g.state==='peva'){if(Math.abs(p.x-g.x)<620&&near){p.rage=Math.min(100,(p.rage||0)+(g.t<12?34:7)*dt);const h=Math.min(12*dt,40-(g.healed||0),p.maxHp-p.hp);if(h>0){p.hp+=h;g.healed=(g.healed||0)+h;}}
   if(!g.second&&!g.song&&g.t>5.4){g.second=true;sfx('gusle',{gain:.8,x:g.x});}if(g.t>g.stih.length*STIH_T+2.5&&PESMA.g!==g)g.state='gotov';}});}
function guslarPeva(g,quiet){g.state='peva';g.t=0;g.healed=0;if(quiet){g.second=true;if(PESMA.g!==g)guslarSong(g);return;}if(!g.mir){addCoins(12,g.x,g.y-90);toast('Guslar je odbranjen. Sluša se pesma!',2.5);}else toast('Guslar peva o Marku',2);g.second=false;guslarSong(g)||sfx('gusle',{gain:.9,x:g.x})||sfx('ring',{gain:.5,rate:.8,x:g.x});}
// a real guslar sings: 28 s of "Marko Kraljević i Musa Kesedžija" (Wikimedia Commons, VVVladimir, CC BY-SA 3.0).
// The music steps back while he sings, and his voice fades as Marko walks away from him.
function guslarSong(g){if(pesmaStart(g))return true;const b=SND.buf['sfx/guslar_pesma_0'];if(!audio||!b||!SND.bus.sfx)return false;for(const o of world.traps||[])if(o.song){try{o.song.s.stop();}catch{}o.song=null;}
 const s=audio.createBufferSource();s.buffer=b;const gn=audio.createGain();gn.gain.value=0;gn.gain.setTargetAtTime(1,audio.currentTime,.25);s.connect(gn);gn.connect(SND.bus.sfx);s.start();g.song={s,gn};songWatch.on.add(g);s.onended=()=>{if(g.song?.s===s)g.song=null;};return true;}
// the song ends with its guslar's world: a new pohod, the main menu or Marko's death
function songWatch(){for(const o of songWatch.on){if((mode==='play'||mode==='pause')&&o.song&&(world.traps||[]).includes(o))continue;if(o.song){try{o.song.gn.gain.setTargetAtTime(0,audio.currentTime,.15);o.song.s.stop(audio.currentTime+.6);}catch{}o.song=null;}songWatch.on.delete(o);}}songWatch.on=new Set();
function guslarSongTick(g){if(!g.song||!audio)return;const d=Math.abs(p.x-g.x)+Math.max(0,Math.abs(p.y-g.y)-150),v=clamp(1-(d-450)/900,0,1);
 g.song.gn.gain.setTargetAtTime(v,audio.currentTime,.2);if(v>.15)SND.duckUntil=Math.max(SND.duckUntil||0,audio.currentTime+.3);if(d>1700||g.state==='bezi'){try{g.song.s.stop(audio.currentTime+.4);}catch{}g.song=null;}}
function drawGuslar(g){if(g.x<camera-400||g.x>camera+VIEW_W+400||!g.state)return;const sh=g.shake>0?Math.sin(time*70)*3:0,face=p.x<g.x?-1:1;
 if(g.state==='bezi'){const a=clamp(1-(g.t-.4)/2.6,0,1),k=rig?.['putnik-starac-walk']?'putnik-starac-walk':'putnik-starac-idle';if(a>0)rigDraw(k,Math.floor(time*9)%(rig?.[k]?.frames.length||1),g.x+Math.max(0,g.t-.4)*150,g.y,1,{alpha:a});
  for(const [dx,r] of [[-22,.6],[14,-.4]]){ctx.save();ctx.translate(g.x+dx,g.y-4);ctx.rotate(r);ellipse(0,0,13,8,'#6b4222');line(0,0,26,0,'#4a2c14',3);ctx.restore();}return;}
 const sing=g.state==='peva'||g.state==='gotov'||g.state==='odbrana',nm=sing&&rig?.['guslar-svira']?'guslar-svira':rig?.['guslar-ceka']?'guslar-ceka':null;
 if(nm)rigDraw(nm,Math.floor(time*(sing?8:4))%rig[nm].frames.length,g.x+sh,g.y,face);
 else{ellipse(g.x,g.y-14,40,16,'#5c564c');rigDraw('putnik-starac-idle',Math.floor(time*5)%(rig?.['putnik-starac-idle']?.frames.length||1),g.x+sh,g.y-10,face);}
 if(g.state==='napad'||g.state==='odbrana'){const w=90,k=Math.max(0,g.hp)/GUSLE_HP;ctx.fillStyle='rgba(15,10,6,.75)';ctx.fillRect(g.x-w/2-2,g.y-178,w+4,10);ctx.fillStyle=k>.4?'#c9a35a':'#c0503a';ctx.fillRect(g.x-w/2,g.y-176,w*k,6);
  textLabel(g.odbrana?'GUSLAR':'GUSLE',g.x,g.y-188,{font:'bold 12px Georgia',color:'#ead9b0'});}
 if(g.state==='ceka'&&Math.abs(p.x-g.x)<520)textLabel('GUSLAR',g.x,g.y-170,{font:'bold 13px Georgia',color:'#ead9b0'});
 if(g.state==='peva'||g.state==='odbrana'){drawNote(g,face,1);drawStih(g);}else if(g.state==='gotov')drawNote(g,face,.45);}
// while the guslar sings, notes rise from the gusle and drift away, swaying like the bow
const NOTE_GLYPHS=['♪','♫','♩','♬'];
function drawNote(g,face,amt){const n=Math.round(7*amt);ctx.save();ctx.textAlign='center';
 for(let i=0;i<n;i++){const ph=(time*.42+i/n+(i*.37)%.11)%1,x=g.x+face*(18+ph*46)+Math.sin(ph*7+i*1.9)*16,y=g.y-92-ph*150,a=Math.min(1,Math.sin(ph*Math.PI)*1.6)*amt,sz=24+(i%3)*5;
  ctx.globalAlpha=a;ctx.font=`bold ${sz}px 'Segoe UI Symbol','Noto Music',Georgia,serif`;ctx.lineWidth=5;ctx.strokeStyle='rgba(30,16,4,.85)';ctx.strokeText(NOTE_GLYPHS[i%4],x,y);ctx.fillStyle=i%2?'#ffe9a8':'#ffc94a';ctx.fillText(NOTE_GLYPHS[i%4],x,y);}
 ctx.restore();}
// the verse hangs above the guslar like a line of a songbook, one line at a time
function drawStih(g){const T=g.t-(g.t0||0),n=Math.min(g.stih.length,Math.floor(T/STIH_T)+1),out=clamp((g.stih.length*STIH_T+2.5-T)/.8,0,1);if(out<=0)return;
 ctx.save();ctx.font='italic 19px Georgia';const lines=g.stih.map(s=>tr(s)),w=Math.max(...lines.map(s=>ctx.measureText?ctx.measureText(s).width:s.length*9))+44,h=lines.length*27+20,x=g.x-w/2,y=g.y-300-h/2;
 ctx.globalAlpha=.85*out;ctx.fillStyle='#160f09';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#8a7448';ctx.lineWidth=2;ctx.strokeRect(x+3,y+3,w-6,h-6);
 ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<n;i++){const a=clamp((T-i*STIH_T)/.6,0,1);ctx.globalAlpha=a*out;ctx.fillStyle='#ead9b0';ctx.fillText(lines[i],g.x,y+22+i*27);}
 ctx.restore();}
// ================= pack 09: banners inside a pohod, and the guslar who sings the whole song =================
// A pohod is long. Where the road is quiet Marko's men raise a banner behind him, and a fallen Marko comes back there with
// the land as he left it: the dead stay dead, the solved stays solved. A champion he fell to gets his strength back.
let ckpt=null,ckptFlags=[];
function ckptTick(){if(!level||mode!=='play')return;
 if(!world.champSaved){world.champSaved=true;for(const e of world.enemies)if(e.champion)e.pristine=JSON.stringify({...e,pristine:undefined});}
 if(!p.grounded||p.pinned||arena||horseMounted||!p.on?.ground||grapple||finisher)return;
 const c=world.enemies.find(e=>e.champion&&e.alive),gate=c&&p.x>c.arena.x0-520&&p.x<c.arena.x0-60&&(!ckpt||ckpt.x<c.arena.x0-900);
 if(!gate&&(ckpt?p.x<ckpt.x+1500:p.x<level.spawn.x+1100))return;
 if(world.enemies.some(e=>e.alive&&e.zone===zone&&!e.spava&&!e.champion&&Math.abs(e.x-p.x)<640&&Math.abs(e.y-p.y)<300))return;
 if((world.traps||[]).some(t=>t.kind==='guslar'&&(t.state==='napad'||t.state==='odbrana')))return;
 ckpt={x:p.x,y:p.y};ckptFlags.push({x:p.x-34,y:p.y,t:time});toast('Barjak je podignut. Ako padneš, odavde nastavljaš.',2.4);sfx('cloth',{gain:.7});sfx('ring',{gain:.4,rate:.9});}
function champReset(e){if(!e.pristine)return;const keep=e.pristine,P=JSON.parse(keep);for(const k of Object.keys(e))if(!(k in P))delete e[k];Object.assign(e,P);e.pristine=keep;}
function ckptRespawn(){mode='play';endSequence=null;corpses=corpses.filter(c=>c.type!=='marko');arrows=[];fires=[];world.drops=[];grapple=null;finisher=null;arena=null;slowMo=0;hitstop=0;
 Object.assign(p,{x:ckpt.x,y:ckpt.y,vx:0,vy:0,hp:p.maxHp,grounded:true,invuln:2.5,attack:0,dash:0,down:0,hurt:0,drink:0,spin:0,plunge:0,slide:0,kick:0,dizzy:0,charge:0,combo:0,shoveT:0,pinned:false,blocking:false,crouching:false,climb:null,wall:0,rage:Math.min(p.rage||0,50),wine:Math.max(p.wine||0,2)});
 for(const e of world.enemies){e.grappling=false;e.held=false;if(e.champion&&e.alive)champReset(e);else if(e.alive&&e.id>=9000&&!e.trioMate)e.alive=false;}
 for(const q of world.platforms)if(q.cut){q.off=false;q.cut=false;}
 for(const t of world.traps||[])if(t.kind==='guslar'&&(t.fallen||t.state==='napad'||t.state==='odbrana')){t.state=null;t.fallen=false;t.wave=0;t.t=0;}
 camera=Math.max(0,p.x-VIEW_W*.4);$('death').hidden=true;$('boss-hud').hidden=true;keys.clear();pressed.clear();toast('Ravijojla te vraća do poslednjeg barjaka.',2.6);}
function drawCkpt(){for(const f of ckptFlags)if(f.x>camera-200&&f.x<camera+VIEW_W+200)flag(f.x,f.y,true);}
// ---------- the long song: all five minutes of the guslar's recording, streamed; it goes on from guslar to guslar ----------
const PESMA={el:null,g:null};
function pesmaStart(g){if(!hasDom||typeof Audio==='undefined')return false;try{if(!PESMA.el){PESMA.el=new Audio('assets/sfx/guslar_pesma_duga.ogg');PESMA.el.loop=true;PESMA.el.preload='auto';PESMA.el.volume=0;}PESMA.g=g;PESMA.el.play()?.catch?.(()=>{});return true;}catch{return false;}}
function pesmaTick(){const el=PESMA.el;if(!el)return;const g=PESMA.g,on=g&&p&&(mode==='play'||mode==='story')&&(world.traps||[]).includes(g)&&(g.state==='peva'||g.state==='odbrana');
 let v=0;if(on){const d=Math.abs(p.x-g.x)+Math.max(0,Math.abs(p.y-g.y)-150);v=clamp(1-(d-500)/1000,0,1)*(audioEnabled?clamp(settings.volume*settings.sfx*2.2,0,1):0);}
 el.volume=clamp(el.volume+(v-el.volume)*.08,0,1);if(v>.12&&audio)SND.duckUntil=Math.max(SND.duckUntil||0,audio.currentTime+.4);
 if(el.volume<.012&&v===0){if(!el.paused)el.pause();}else if(el.paused&&mode==='play')el.play()?.catch?.(()=>{});}
// ---------- the defence of the guslar: he sings the song of Musa through, and the Turks come in five bands to silence him ----------
const ODBRANA=[[['sword',1],['shield',1],['sword',1]],[['akindzija',-1],['akindzija',-1]],[['palikuca',1],['sword',-1],['sword',-1]],[['oklopnik',1],['akindzija',-1],['akindzija',1]],[['kopljanik',1],['kopljanik',-1],['sword',1],['sword',-1]]];
const ODBRANA_HIT=12;
function songLines(){const L=globalThis.markoLegende?.SONG?.lines;if(!L)return null;return globalThis.markoI18n?.getLang?.()==='en'?L.en:L.sr;}
function guslarOdbrana(g,dt,near){
 if(g.state==='ceka'){if(near&&p.x>g.x0+60&&p.x<g.x1){g.state='odbrana';g.t=0;g.wave=0;g.waveAt=-9;g.hp=GUSLE_HP;guslarSong(g)||sfx('gusle',{gain:.9,x:g.x});
   speak('Stari guslar peva pesmu o Musi, a Turci idu da ga ućutkaju. Ne daj im do njega, Marko: dok pesma traje, bes ti ne opada.',7);toast('ODBRANA GUSLARA · pet četa',3);sfx('horn_call',{gain:.7});}return;}
 if(g.state!=='odbrana')return;
 const foes=world.enemies.filter(e=>e.alive&&e.prey===g);
 for(const e of foes)if(e.preyHit&&e.mode==='recover'){e.preyHit=false;if(Math.abs(e.x-g.x)>90)continue;g.hp-=ODBRANA_HIT;g.shake=.25;sfx('hit_body',{gain:.6,rate:1.3,x:g.x});burst(g.x,g.y-70,'#a0703a',8,160);
  if(g.hp<=0){g.fallen=true;toast('Guslar je pao. Pesma je ućutala.',3);sfx('rock',{gain:.6,x:g.x});die();return;}
  label(`GUSLAR · ${Math.max(0,Math.round(g.hp))}`,g.x,g.y-200,'#ffb08a');}
 if(Math.abs(p.x-g.x)<700&&near)p.rage=Math.min(100,(p.rage||0)+13*dt);
 {const L=songLines(),k=Math.floor(g.t/9);if(L&&k!==g.sk){g.sk=k;g.stih=L.slice((k*3)%Math.max(3,L.length-3),(k*3)%Math.max(3,L.length-3)+3);g.t0=g.t;}}
 if(g.wave<ODBRANA.length&&(foes.length<=(g.wave?1:0)&&g.t>g.waveAt+4||g.t>g.waveAt+24)){const W=ODBRANA[g.wave];g.wave++;g.waveAt=g.t;const n={};for(const [type,side] of W){guslarFoe(g,type,side,n[side]=(n[side]||0));n[side]++;}
  toast(`Četa ${g.wave} od ${ODBRANA.length}${W.some(w=>w[1]<0)&&W.some(w=>w[1]>0)?' · sa obe strane':W[0][1]<0?' · iza tebe':''}`,2.4);sfx('horn_call',{gain:.6,rate:1+g.wave*.05});}
 else if(g.wave>=ODBRANA.length&&!foes.length){g.t0=0;g.stih=STIHOVI[1];guslarPeva(g,true);addCoins(40,g.x,g.y-90);toast('Guslar je odbranjen. Pesma o Musi ide dalje niz Ibar.',3);}}
// ================= the eagle's nest and the eagle ("Marko Kraljević i orao") =================
// Fire-raisers set the eagle's beech alight; the fire climbs toward the young. Kill them all before it reaches the nest
// and the eagle stays with Marko: she swoops on the Turks, and when he is badly wounded she spreads her wings over him
// and brings him water, as in the song.
const NEST_BURN=32,NEST_H=560,ORAO_CD=5.5,ORAO_HIT=45,HLAD_CD=40;
function updateGnezda(dt){for(const t of world.traps||[]){if(t.kind!=='gnezdo')continue;t.t=(t.t||0)+dt;if(!t.state){t.state='ceka';t.burn=0;}
 if(t.state==='ceka'&&Math.abs(p.x-t.x)<820&&Math.abs(p.y-t.y)<420){t.state='gori';t.t=0;toast('Palikuće pale orlovo gnezdo! Pobij ih pre nego što plamen stigne do orlića.',3.5);sfx('boom',{gain:.45,rate:1.4,x:t.x});}
 if(t.state==='gori'){t.burn=Math.min(1,t.burn+dt/NEST_BURN);t.cryT=(t.cryT??1)-dt;if(t.cryT<=0){t.cryT=4+Math.random()*3;sfx('orao',{gain:.4,rate:.95,x:t.x});}t.fireT=(t.fireT||0)-dt;if(t.fireT<=0){t.fireT=1.3;addFire(t.x+(Math.random()-.5)*70,t.y,2.4,58,2);}
  if(Math.random()<dt*10)particles.push({kind:'dust',x:t.x+(Math.random()-.5)*40,y:t.y-60-t.burn*NEST_H*.55,vx:(Math.random()-.5)*30,vy:-50-Math.random()*60,life:2.2,max:2.2,r:8+Math.random()*10,color:'#4a4640'});
  if(!world.enemies.some(e=>e.alive&&e.gnezdo)){t.state='spaseno';t.t=0;toast('Vatra se gasi. Orlići su spaseni!',3);addCoins(10,t.x,t.y-100);orlovDolazak(t);peroOrla(t,true);}
  else if(t.burn>=1){t.state='izgorelo';t.t=0;toast('Gnezdo je izgorelo. Orlušina odleće.',3);peroOrla(t,false);}}}}
// "Orlovo pero": the grateful eagle drops a feather from her wing by the tree; if the nest burned, it stays in its hiding place
function peroOrla(t,saved){if(ownedCuda().has('orlovo-pero')||world.items.some(i=>i.cudo==='orlovo-pero')){if(saved)addCoins(20,t.x,t.y-80);return;}
 const at=saved?{x:t.x+90,y:t.y-50}:t.pero;if(!at)return;world.items.push({id:7048,x:at.x,y:at.y,type:'cudo',cudo:'orlovo-pero',taken:false});if(saved)setTimeout(()=>toast('Orao ti ostavlja pero iz svog krila.',3),2600);}
function orlovDolazak(t){world.orao={x:t.x+80,y:t.y-NEST_H-80,state:'dolazi',t:0,cd:2,hladCd:0,face:-1};sfx('orao',{gain:.8,x:t.x})||sfx('whoosh_heavy',{gain:.5,x:t.x});}
function oraoPlen(){let best=null,bd=1e9;for(const e of world.enemies){if(!e.alive||e.champion||e.zone!==zone||e.held||e.enter||e.prone>0)continue;if(e.x<camera+40||e.x>camera+VIEW_W-40||Math.abs(e.x-p.x)>700)continue;
  const d=Math.abs(e.x-p.x)-(e.perch?300:0)-(e.type==='pas'?200:0);if(d<bd){bd=d;best=e;}}return best;}
function oraoUdar(e){const dir=e.x>p.x?1:-1;e.hp-=ORAO_HIT;e.flash=.2;e.stun=Math.max(e.stun||0,1);e.hurtT=.3;blood(e.x,e.y-70,dir,10);sfx('hit_body',{gain:.7,x:e.x});label('ORAO!',e.x,e.y-150,'#ffe0a0');
 for(let i=0;i<6;i++)particles.push({kind:'dust',x:e.x,y:e.y-90,vx:(Math.random()-.5)*200,vy:-60-Math.random()*120,life:1.2,max:1.2,r:2+Math.random()*2,color:'#6a4a2a'});if(e.hp<=0)slay(e);}
function updateOrao(dt){const O=world.orao;if(!O)return;O.t+=dt;O.cd-=dt;O.hladCd-=dt;O.hitT=Math.max(0,(O.hitT||0)-dt);
 if(O.state==='dolazi'||O.state==='prati'||O.state==='vraca'){const hx=p.x-p.face*110,hy=p.y-290+Math.sin(time*1.6)*14,dx=hx-O.x,dy=hy-O.y,dist=Math.hypot(dx,dy),sp=O.state==='prati'?Math.min(560,dist*3):640;
  if(dist>3){const k=Math.min(dist,sp*dt)/dist;O.x+=dx*k;O.y+=dy*k;}if(Math.abs(dx)>8)O.face=dx>0?1:-1;
  if(O.state!=='prati'&&dist<40){if(O.state==='dolazi')toast('Orao prati Marka i obrušava se na Turke.',3);O.state='prati';}
  if(O.state==='prati'){if(p.hp<p.maxHp*.35&&O.hladCd<=0&&p.hp>0){O.state='hlad';O.t=0;O.hladCd=HLAD_CD;sfx('orao',{gain:.6,x:p.x});toast('Orao širi krila nad Markom i donosi mu vode.',3);}
   else if(O.cd<=0){const e=oraoPlen();if(e){O.state='napad';O.t=0;O.e=e;O.sx=O.x;O.sy=O.y;sfx('wings',{gain:.7,x:O.x})||sfx('whoosh_heavy',{gain:.55,x:O.x});if(Math.random()<.5)sfx('orao',{gain:.45,x:O.x});}else O.cd=.5;}}}
 else if(O.state==='napad'){const e=O.e,k=Math.min(1,O.t/.6);if(!e.alive){O.state='vraca';O.cd=1.5;}else{O.face=e.x>O.sx?1:-1;O.x=O.sx+(e.x-O.face*30-O.sx)*k;O.y=O.sy+(e.y-70-O.sy)*k*k;if(k>=1){oraoUdar(e);O.state='vraca';O.cd=ORAO_CD;O.hitT=.3;}}}
 else if(O.state==='hlad'){O.x+=(p.x-O.x)*Math.min(1,dt*5);O.y+=(p.y-235-O.y)*Math.min(1,dt*5);O.face=p.face;if(O.t>.5&&O.t<4.5&&p.hp>0)p.hp=Math.min(p.maxHp,p.hp+10*dt);if(O.t>4.8)O.state='vraca';}}
function oraoPose(O){const st=O.state,R=n=>rig?.[n]?n:null;
 // the dive: wings folded, then talons out (the 5th drawing grips); after the blow she climbs away (the 6th)
 if(st==='napad'||O.hitT>0){const n=R('orao-obrusavanje');if(n){const L=rig[n].frames.length;return{n,f:O.hitT>0?L-1:Math.min(L-2,Math.floor(Math.min(1,O.t/.6)*(L-1)))};}}
 if(st==='hlad'){const n=R('orao-hlad');if(n)return{n,f:Math.floor(time*9)%rig[n].frames.length};}
 const n=R('orao-let')||R('orao-flight');return n?{n,f:Math.floor(time*11)%rig[n].frames.length}:null;}
const ORAO_SC=.6; // Codex's eagle cell is drawn larger than the falcon's; this brings her to the falcon's size
function drawOrao(){const O=world.orao;if(!O||O.x<camera-300||O.x>camera+VIEW_W+300)return;const q=oraoPose(O);if(!q)return;
 if(q.n==='orao-flight')rigDraw(q.n,q.f,O.x,O.y+30,O.face,{scale:1.15*ORAO_SC});else oraoDraw(q.n,q.f,O.x,O.y,O.face,ORAO_SC);}
// Codex's eagle is drawn with her body (cell row 300) at the point, whatever her wings do
const ORAO_BODY=300;
function oraoDraw(n,fr,x,y,face,sc=1){const r=rig?.[n];if(!r)return;const f=r.frames[clamp(Math.floor(fr),0,r.frames.length-1)];rigDraw(n,fr,x,y,face,{scale:sc,dy:(f[4]-ORAO_BODY)*r.scale*sc});}
function drawGnezdo(t){if(t.x<camera-500||t.x>camera+VIEW_W+500||!t.state)return;const im=worldImg('prop-drvo-bukva'),H=NEST_H,burnt=t.state==='izgorelo'?1:t.burn||0;
 if(im){const b=propBounds(im),w=b.w*H/b.h;ctx.save();if(burnt>.02)ctx.filter=`brightness(${(1-.55*burnt).toFixed(2)}) saturate(${(1-.6*burnt).toFixed(2)})`;ctx.drawImage(im,b.x,b.y,b.w,b.h,t.x-w/2,t.y-H+8,w,H);ctx.restore();}
 const nx=t.x+34,ny=t.y-H*.6,nest=worldImg('orlovo-gnezdo');
 if(nest){const b=propBounds(nest),w=175,h=b.h*w/b.w;ctx.save();if(burnt>.02)ctx.filter=`brightness(${(1-.6*burnt).toFixed(2)})`;ctx.drawImage(nest,b.x,b.y,b.w,b.h,nx-w/2,ny-h*.7,w,h);ctx.restore();}
 else{ellipse(nx,ny,54,16,burnt>=1?'#2a2420':'#5a4028');ellipse(nx,ny-6,40,10,'#3a2a1a');if(burnt<1)for(const s of[-14,12]){ellipse(nx+s,ny-18,9,10,'#e8dcc0');poly([[nx+s+6,ny-20],[nx+s+14,ny-16],[nx+s+6,ny-14]],'#d8a040');}}
 if(t.state==='gori'){const n=1+Math.floor(t.burn*5),R=rig?.['plamen'];for(let i=0;i<n;i++){const fy=t.y-10-i*(H*.6/5),fx=t.x+Math.sin(i*2.3)*14;if(R)rigDraw('plamen',Math.floor(time*12+i*3)%R.frames.length,fx,fy,i%2?1:-1,{scale:.62+.12*Math.sin(i)});else drawFlame(fx,fy,26,46,i*5.1,1);}
  emitters.push({id:'gnezdo'+t.x,kind:'fire',x:t.x,y:t.y-t.burn*H*.3,w:40,rate:14});
  // the mother circles over the burning tree, crying
  const ox=t.x+Math.cos(time*1.3)*170,oy=t.y-H*.8+Math.sin(time*2.6)*22;if(rig?.['orao-let'])oraoDraw('orao-let',Math.floor(time*11)%rig['orao-let'].frames.length,ox,oy,-Math.sign(Math.sin(time*1.3))||1,ORAO_SC);else if(rig?.['orao-flight'])rigDraw('orao-flight',Math.floor(time*10)%6,ox,oy,-Math.sign(Math.sin(time*1.3))||1,{scale:1.15*ORAO_SC});
  const w=110,k=1-t.burn;ctx.fillStyle='rgba(15,10,6,.75)';ctx.fillRect(nx-w/2-2,ny-114,w+4,10);ctx.fillStyle=k>.4?'#c9a35a':'#c0503a';ctx.fillRect(nx-w/2,ny-112,w*k,6);textLabel('GNEZDO',nx,ny-124,{font:'bold 12px Georgia',color:'#ead9b0'});}}
// ================= the falcon ("Kraljević Marko i soko") =================
// In the reeds the Turks hunt a falcon whose wing they broke. Drive them off and bind his wing (E beside him):
// the falcon stays with Marko, flies at the archers' faces so they lose their shot, finds the ones hidden in the
// reeds, and when Marko is wounded he brings him water in his beak, as in the song.
const SOKO_CD=4,SOKO_HIT=15,VODA_CD=30,VIDA_T=1.4,SOKO_BODY=300;
function sokoHunters(t){return world.enemies.filter(e=>e.alive&&e.zone===zone&&Math.abs(e.x-t.x)<380&&Math.abs(e.y-t.y)<200);}
function useSoko(){const t=(world.traps||[]).find(t=>t.kind==='soko'&&t.state==='ranjen'&&Math.abs(p.x-t.x)<110&&Math.abs(p.y-t.y)<80);if(!t||!p.grounded)return false;
 if(sokoHunters(t).length){toast('Prvo oteraj Turke od sokola.',2);return true;}
 t.state='previja';t.k=0;sfx('cloth',{gain:.6,x:t.x});return true;}
function updateSokoli(dt){for(const t of world.traps||[]){if(t.kind!=='soko')continue;t.t=(t.t||0)+dt;if(!t.state)t.state='ranjen';
 if(t.state==='ranjen'){if(!t.told&&Math.abs(p.x-t.x)<640&&Math.abs(p.y-t.y)<300){t.told=true;toast('Turci jure ranjenog sokola! Oteraj ih, pa mu previj krilo (E).',3.5);sfx('orao',{gain:.45,rate:1.6,x:t.x});}
  // walked on past him: his feather stays where it was hidden
  if(t.pero&&!t.peroLeft&&p.x>t.x1+900){t.peroLeft=true;sokoPero(t.pero);}}
 else if(t.state==='previja'){if(Math.abs(p.x-t.x)>120||p.hurt>.05||!p.grounded){t.state='ranjen';p.vida=0;label('PREKINUTO',t.x,t.y-130,'#ffb08a');continue;}
  t.k=Math.min(1,t.k+dt/VIDA_T);p.vida=.2;p.vidaK=t.k;p.face=t.x>p.x?1:-1;if(t.k>=1)sokoSpasen(t);}}}
function sokoPero(at){if(ownedCuda().has('sokolovo-pero')||world.items.some(i=>i.cudo==='sokolovo-pero'))return false;world.items.push({id:7049,x:at.x,y:at.y,type:'cudo',cudo:'sokolovo-pero',taken:false});return true;}
function sokoSpasen(t){t.state='spasen';t.t=0;p.vida=0;addCoins(8,t.x,t.y-80);sfx('orao',{gain:.7,rate:1.6,x:t.x});sfx('wings',{gain:.6,rate:1.3,x:t.x});
 toast('Marko previ sokolu krilo. Soko leti s njim.',3);world.soko={x:t.x,y:t.y-40,state:'dolazi',t:0,cd:1.5,vodaCd:0,face:p.face};
 if(!t.peroLeft&&sokoPero({x:t.x+70,y:t.y-46}))setTimeout(()=>toast('Soko ti ostavlja pero iz krila.',3),2400);}
function sokoPlen(){let best=null,bd=1e9;for(const e of world.enemies){if(!e.alive||e.champion||e.caus||e.zone!==zone||e.held||e.enter||e.prone>0||e.stun>.3)continue;if(e.x<camera+30||e.x>camera+VIEW_W-30||Math.abs(e.x-p.x)>760)continue;
  const ranged=e.type==='archer'||e.type==='tufekdzija',d=Math.abs(e.x-p.x)-(e.skriven?900:0)-(ranged&&e.mode==='windup'?600:0)-(ranged?250:0);if(d<bd){bd=d;best=e;}}return best;}
function sokoUdar(e){const hidden=e.skriven,shot=e.mode==='windup';e.skriven=false;e.alert=true;e.hp-=SOKO_HIT;e.flash=.2;e.hurtT=.3;e.mode='stun';e.stun=Math.max(e.stun||0,hidden?2.2:1.6);
 label(hidden?'SOKO GA JE NAŠAO!':shot?'SOKO MU KVARI HITAC!':'SOKO!',e.x,e.y-150,'#cfe4ff');sfx('hit_body',{gain:.5,rate:1.5,x:e.x});
 for(let i=0;i<6;i++)particles.push({kind:'dust',x:e.x,y:e.y-110,vx:(Math.random()-.5)*180,vy:-40-Math.random()*100,life:1,max:1,r:2+Math.random()*2,color:'#8a96a0'});if(e.hp<=0)slay(e);}
function updateSoko(dt){const S=world.soko;if(!S)return;S.t+=dt;S.cd-=dt;S.vodaCd-=dt;S.hitT=Math.max(0,(S.hitT||0)-dt);
 if(S.state==='dolazi'||S.state==='prati'||S.state==='vraca'){const hx=p.x+p.face*70,hy=p.y-215+Math.sin(time*2.2)*12,dx=hx-S.x,dy=hy-S.y,dist=Math.hypot(dx,dy),sp=S.state==='prati'?Math.min(680,dist*3.4):760;
  if(dist>3){const k=Math.min(dist,sp*dt)/dist;S.x+=dx*k;S.y+=dy*k;}if(Math.abs(dx)>8)S.face=dx>0?1:-1;
  if(S.state!=='prati'&&dist<40){if(S.state==='dolazi')toast('Soko leti uz Marka i kvari strelcima hice.',3);S.state='prati';}
  if(S.state==='prati'){if(p.hp<p.maxHp*.5&&S.vodaCd<=0&&p.hp>0){S.state='voda';S.t=0;S.vodaCd=VODA_CD;S.healed=0;sfx('orao',{gain:.5,rate:1.6,x:p.x});toast('Soko ti donosi vode u kljunu.',2.5);}
   else if(S.cd<=0){const e=sokoPlen();if(e){S.state='napad';S.t=0;S.e=e;S.sx=S.x;S.sy=S.y;sfx('wings',{gain:.5,rate:1.35,x:S.x})||sfx('whoosh_heavy',{gain:.4,x:S.x});}else S.cd=.4;}}}
 else if(S.state==='napad'){const e=S.e,k=Math.min(1,S.t/.45);if(!e.alive){S.state='vraca';S.cd=1;}else{S.face=e.x>S.sx?1:-1;S.x=S.sx+(e.x-S.face*24-S.sx)*k;S.y=S.sy+(e.y-100-S.sy)*k*k;if(k>=1){sokoUdar(e);S.state='vraca';S.cd=SOKO_CD;S.hitT=.35;}}}
 else if(S.state==='voda'){S.x+=(p.x+p.face*12-S.x)*Math.min(1,dt*6);S.y+=(p.y-190-S.y)*Math.min(1,dt*6);S.face=p.face;
  if(S.t>.4&&S.healed<30&&p.hp>0){const h=Math.min(12*dt,30-S.healed,p.maxHp-p.hp);p.hp+=h;S.healed+=h;}
  if(Math.random()<dt*16)particles.push({kind:'dust',x:S.x+S.face*22,y:S.y+14,vx:(Math.random()-.5)*20,vy:150+Math.random()*60,life:.5,max:.5,r:2+Math.random()*1.5,color:'#9cc8e8'});if(S.t>3)S.state='vraca';}}
function sokoPose(S){const st=S.state,R=n=>rig?.[n]?n:null;
 if(st==='napad'||S.hitT>0){const n=R('soko-napad');if(n){const L=rig[n].frames.length;return{n,f:S.hitT>0?Math.min(L-1,3+Math.floor((1-S.hitT/.35)*(L-3))):Math.min(2,Math.floor(Math.min(1,S.t/.45)*3))};}
  const o=R('orao-obrusavanje');if(o){const L=rig[o].frames.length;return{n:o,f:S.hitT>0?L-1:Math.min(L-2,Math.floor(Math.min(1,S.t/.45)*(L-1))),sc:.55};}}
 if(st==='voda'){const n=R('soko-voda')||R('orao-hlad');if(n)return{n,f:Math.floor(time*10)%rig[n].frames.length,sc:n==='orao-hlad'?.55:1};}
 const n=R('soko-let')||R('orao-let');return n?{n,f:Math.floor(time*14)%rig[n].frames.length,sc:n==='orao-let'?.6:1}:null;}
function drawSoko(){const S=world.soko;if(!S||S.x<camera-300||S.x>camera+VIEW_W+300)return;const q=sokoPose(S);if(q)oraoDraw(q.n,q.f,S.x,S.y,S.face,q.sc||1);}
function drawSokoTrap(t){if(t.x<camera-400||t.x>camera+VIEW_W+400||!t.state||t.state==='spasen')return;const face=p.x<t.x?-1:1;
 if(rig?.['soko-ranjen'])rigDraw('soko-ranjen',Math.floor(time*5)%rig['soko-ranjen'].frames.length,t.x,t.y,face);
 else if(rig?.['orao-hlad'])oraoDraw('orao-hlad',2,t.x,t.y-26,face,.42);
 const art=worldImg('prop-trska');if(art){const b=propBounds(art);for(const [dx,h] of [[-70,96],[58,84]]){const w=b.w*h/b.h;ctx.drawImage(art,b.x,b.y,b.w,b.h,t.x+dx-w/2,t.y-h+6,w,h);}}
 const near=Math.abs(p.x-t.x)<520;if(t.state==='ranjen'&&near)textLabel(Math.abs(p.x-t.x)<110?'E · PREVIJ KRILO':'RANJEN SOKO',t.x,t.y-120,{font:'bold 13px Georgia',color:'#ead9b0'});
 if(t.state==='previja'){const w=90;ctx.fillStyle='rgba(15,10,6,.75)';ctx.fillRect(t.x-w/2-2,t.y-122,w+4,10);ctx.fillStyle='#c9a35a';ctx.fillRect(t.x-w/2,t.y-120,w*t.k,6);textLabel('PREVIJA KRILO',t.x,t.y-132,{font:'bold 12px Georgia',color:'#ead9b0'});}}
// the reeds: tall stems behind the archers and a row in front of them, so a hidden archer is only a shadow
// Each reed bed is painted once into two strips: the dark row behind the fighters and the light row in front.
// The world layer is drawn by the CPU, so the old way (17 overlapping stems a frame, the back ones through
// ctx.filter) painted every pixel about five times and dropped the game from 60 to about 36 frames a second.
const trskaStrips=new WeakMap();
function trskaStrip(t,front){let S=trskaStrips.get(t);if(!S)trskaStrips.set(t,S={});const k=front?'f':'b';if(S[k])return S[k];
 const art=worldImg('prop-trska');if(!art)return null;const b=propBounds(art),stems=[];
 for(let i=0,xx=t.x+30;xx<t.x+t.w-20;i++,xx+=front?92:64){const h=front?104+((i*37)%5)*7:150+((i*53)%7)*9,w=b.w*h/b.h;stems.push([xx-w/2+(front?30:0),h,w]);}
 if(!stems.length)return null;const x0=Math.floor(Math.min(...stems.map(s=>s[0]))),x1=Math.ceil(Math.max(...stems.map(s=>s[0]+s[2]))),H=Math.ceil(Math.max(...stems.map(s=>s[1]))),Z=ZOOM;
 const c=makeCanvas(Math.ceil((x1-x0)*Z),Math.ceil(H*Z)),g=c.getContext('2d',{willReadFrequently:true});if(!g)return null;g.imageSmoothingQuality='high';
 for(const [x,h,w] of stems)g.drawImage(art,b.x,b.y,b.w,b.h,(x-x0)*Z,(H-h)*Z,w*Z,h*Z);
 if(!front){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(0,0,0,.28)';g.fillRect(0,0,c.width,c.height);}
 return S[k]={c,x:x0,y:t.y+6-H,w:x1-x0,h:H};}
function drawTrska(t,front){if(t.x+t.w<camera-200||t.x>camera+VIEW_W+200)return;const s=trskaStrip(t,front);if(s)ctx.drawImage(s.c,s.x,s.y,s.w,s.h);}
// archers hidden in the reeds rise only when Marko is close, when they are hurt, or when the falcon finds them
function zaseda(e,d){if(d<380||e.hp<e.maxHp){e.skriven=false;e.alert=true;label('ZASEDA!',e.x,e.y-150,'#ffcf7a');sfx('draw',{gain:.5,x:e.x});return false;}e.vx=0;return true;}

// ================= the poor by the road ("Marko Kraljević i beg Kostadin") =================
// Marko honours the poor, as he shamed beg Kostadin for driving them from his table. An old woman and an orphan sit
// by the road; give them ducats (E) and they bless him: his wounds close and his strength rises for a while.
const SIROTINJA_DAR=10;
function useSirotinja(){const t=(world.traps||[]).find(t=>t.kind==='sirotinja'&&!t.dato&&Math.abs(p.x-t.x)<150&&Math.abs(p.y-t.y)<90);if(!t||!p.grounded)return false;
 const dar=Math.min(SIROTINJA_DAR,p.coins||0);p.coins=(p.coins||0)-dar;t.dato=true;t.datoAt=time;p.vx=0;p.face=t.x>p.x?1:-1;p.castLock=.5;if(rig?.['marko-open'])p.openT=OPEN_TIME;
 for(let i=0;i<Math.max(3,dar);i++)particles.push({kind:'dust',x:p.x+p.face*20,y:p.y-80,vx:(t.x-p.x)*(1.1+Math.random()*.5),vy:-200-Math.random()*120,life:.9,max:.9,r:3,color:'#ffd36a',delay:i*.04});
 p.hp=p.maxHp;p.buff=Math.max(p.buff||0,15);p.rage=Math.min(100,(p.rage||0)+30);sfx('coins',{gain:.6})||sfx('ring',{gain:.5,rate:1.3});sfx('ring',{gain:.45,rate:.8,delay:.6});
 label(dar?`-${dar} DUKATA`:'BLAGOSLOV',p.x,p.y-170,'#ffd36a');toast('„Bog ti dao zdravlje, Kraljeviću Marko!” Sirotinja te blagoslovi: rane zarastu, a snaga ti raste.',4);updateHud();return true;}
function drawSirotinja(t){if(t.x<camera-300||t.x>camera+VIEW_W+300)return;const B=t.dato&&rig?.['sirotinja-blagoslov'],nm=B?'sirotinja-blagoslov':rig?.['sirotinja-ceka']?'sirotinja-ceka':null,face=p.x<t.x?-1:1;
 if(nm)rigDraw(nm,Math.floor(time*(B?7:3))%rig[nm].frames.length,t.x,t.y,face);
 else{rigDraw('putnik-starac-idle',Math.floor(time*4)%(rig?.['putnik-starac-idle']?.frames.length||1),t.x,t.y,face);}
 const since=t.dato?time-t.datoAt:99;if(since<6){const a=Math.min(1,(6-since)/1.5);halo(t.x,t.y-70,90,`rgba(255,220,140,${.18*a})`,1);}
 if(!t.dato&&Math.abs(p.x-t.x)<420)textLabel(Math.abs(p.x-t.x)<150?'E · DAJ SIROTINJI DUKATE':'SIROTINJA KRAJ PUTA',t.x,t.y-130,{font:'bold 13px Georgia',color:'#ffe2a8'});}

// ================= Ramadan wine ("Marko pije uz ramazan vino") =================
// The sultan forbade wine in Ramadan; Marko drinks it anyway. In the cellar the sultan's heralds march on his barrels
// to spill them. Cut them down first, then drink (E by the barrel): the wine's strength, health, full fury and a full
// flask. At the last barrel a herald brings the sultan's hundred ducats: "Go, Marko, and drink your wine."
const CAUS_HP=60;let causN=0;
function causFoe(t,side,k){const x=(side>0?t.x1+60:t.x0-60)+side*k*95,y=groundAt(x,t.y-60)??t.y;
 world.enemies.push({id:41000+(++causN),x,y,vx:0,vy:0,w:36,h:75,hp:CAUS_HP,maxHp:CAUS_HP,type:'sword',look:'caus',caus:true,zone,face:-side,mode:'idle',timer:.6,stun:0,flash:0,alive:true,home:t.x,attackId:0,grounded:true,prey:t});}
function causStep(e,d,dt){const t=e.prey;e.fermanT=Math.max(0,(e.fermanT||0)-dt);if(e.fermanT>0){e.vx=0;return false;}
 if(t&&t.state==='napad'){const gd=t.x-e.x;e.face=gd>0?1:-1;if(Math.abs(gd)<56)prolij(t,e);else foeWalk(e,e.face,74,dt);return false;}
 // the barrel is spilled: he reads the sultan's edict once, then goes back to the sultan
 if(!e.read){e.read=true;e.fermanT=1.8;e.face=p.x>e.x?1:-1;label('CAREV JASAK!',e.x,e.y-160,'#ffe39a');return false;}
 e.face=1;foeWalk(e,1,90,dt);if(e.x>camera+VIEW_W+260){e.alive=false;e.zone=-99;}return false;}
function prolij(t,e){t.state='prolivena';t.t=0;sfx('splash',{gain:.7,x:t.x})||sfx('cloth',{gain:.6,x:t.x});sfx('rock',{gain:.4,rate:1.4,x:t.x});
 for(let i=0;i<16;i++)particles.push({kind:'dust',x:t.x+26,y:t.y-40,vx:40+Math.random()*120,vy:-60+Math.random()*80,life:.8,max:.8,r:2+Math.random()*2,color:'#5a0f18'});
 toast('Čauš je izbio slavinu. Vino se prolilo!',2.6);for(const o of world.enemies)if(o.alive&&o.caus&&o.prey===t){o.read=false;o.fermanT=0;}}
function useBacva(){const t=(world.traps||[]).find(t=>t.kind==='bacva'&&t.state==='puna'&&Math.abs(p.x-t.x)<100&&Math.abs(p.y-t.y)<70);if(!t||!p.grounded)return false;
 if(p.drink>0)return true;t.state='popijeno';t.t=0;p.drink=.85;p.drinkApplied=false;p.attack=0;p.vx=0;p.x=t.x+(p.x<t.x?-96:96);p.face=t.x>p.x?1:-1;
 p.hp=Math.min(p.maxHp,p.hp+40);p.rage=100;p.wine=Math.max(p.wine,p.wineMax);sfx('wine',{gain:.8,x:t.x})||sound('wine');
 label('MARKO PIJE UZ RAMAZAN VINO',t.x,t.y-200,'#ffcf9a');toast('Bes je pun, a čutura natočena.',2.6);
 if(t.kraj)t.glasnik={x:p.x+VIEW_W*.62,state:'ide',t:0};return true;}
function updateBacve(dt){for(const t of world.traps||[]){if(t.kind!=='bacva')continue;t.t=(t.t||0)+dt;if(!t.state)t.state='ceka';const near=Math.abs(p.y-t.y)<320;
 if(t.state==='ceka'&&near){if(t.kraj){if(Math.abs(p.x-t.x)<520){t.state='puna';toast('Bačva rujnog vina. Ovde ti niko ne brani: pij (E).',3);}}
  else if(p.x>t.x0+60&&p.x<t.x1){t.state='napad';t.t=0;causFoe(t,1,0);causFoe(t,1,1);guslarFoe({x:t.x+200,y:t.y,x0:t.x0,x1:t.x1},'sword',1,2);
   toast('Carevi čauši idu da ti proliju vino! Stigni ih pre bačve.',3.2);sfx('horn_call',{gain:.6,rate:1.15});}}
 if(t.state==='napad'&&!world.enemies.some(e=>e.alive&&e.caus&&e.prey===t)){t.state='puna';t.t=0;addCoins(8,t.x,t.y-90);toast('Vino je sačuvano. Pij uz ramazan (E kraj bačve)!',3);}
 const G=t.glasnik;if(G){G.t+=dt;const tx=Math.max(p.x+170,t.x+150);
  if(G.state==='ide'){const dx=tx-G.x;G.x+=Math.sign(dx)*Math.min(Math.abs(dx),110*dt);if(Math.abs(dx)<6){G.state='cita';G.t=0;toast('Car Sulejman ti šalje sto dukata: „Idi, Marko, te se napij vina!”',4);addCoins(30,G.x,t.y-90);sfx('coin',{gain:.6})||sfx('ring',{gain:.4});}}
  else if(G.state==='cita'&&G.t>2.6){G.state='odlazi';G.t=0;}
  else if(G.state==='odlazi'){G.x+=110*dt;if(G.x>p.x+VIEW_W)t.glasnik=null;}}}}
function drawBacva(t){if(t.x<camera-400||t.x>camera+VIEW_W+400||!t.state)return;const spilled=t.state==='prolivena',im=worldImg(spilled?'bacva-prolivena':'bacva-puna'),H=spilled?168:150;
 if(im){const b=propBounds(im),w=b.w*H/b.h;ctx.drawImage(im,b.x,b.y,b.w,b.h,t.x-w/2,t.y-H+6,w,H);}
 else{const c=spilled?'#3a2616':'#5a3a20';ellipse(t.x,t.y-58,46,56,c);for(const dy of[-92,-58,-24])line(t.x-44,t.y+dy,t.x+44,t.y+dy,'#2a1a10',4);ellipse(t.x+46,t.y-40,6,4,'#b08a40');if(spilled)ellipse(t.x+70,t.y+2,60,7,'#4a0c14');}
 if(t.state==='puna'&&Math.abs(p.x-t.x)<420)textLabel(Math.abs(p.x-t.x)<100?'E · PIJ VINO':'VINO',t.x,t.y-H-14,{font:'bold 13px Georgia',color:'#ffd6a8'});
 if(t.state==='napad')textLabel('BAČVA',t.x,t.y-H-14,{font:'bold 12px Georgia',color:'#ead9b0'});
 const G=t.glasnik;if(G){const k=G.state==='cita'?'caus-ferman':'caus-walk',alt=G.state==='cita'?'putnik-trgovac-idle':'putnik-trgovac-walk',n=rig?.[k]?k:alt,R=rig?.[n];
  if(R){const f=G.state==='cita'?Math.min(R.frames.length-1,Math.floor(G.t*5)):Math.floor(time*9)%R.frames.length;rigDraw(n,f,G.x,t.y,G.state==='odlazi'?1:-1);}
  if(G.state==='cita')textLabel('STO DUKATA OD CARA',G.x,t.y-176,{font:'bold 13px Georgia',color:'#ffe39a'});}}
function drawTraps(){for(const t of world.traps||[])if(t.kind==='gnezdo')drawGnezdo(t);else if(t.kind==='sirotinja')drawSirotinja(t);else if(t.kind==='trska')drawTrska(t,false);else if(t.kind==='soko')drawSokoTrap(t);else if(t.kind==='bacva')drawBacva(t);for(const t of world.traps||[])if(t.kind==='kavez')drawKavez(t);else if(t.kind==='guslar')drawGuslar(t);
 // every cage broken: the whole wedding dances the kolo by the banner at the end
 if(world.svatoviAll&&world.svatoviFreed===world.svatoviAll&&level?.goal&&rig?.['svatovi-kolo']&&Math.abs(level.goal.x-camera-VIEW_W/2)<VIEW_W)rigDraw('svatovi-kolo',Math.floor(time*9)%rig['svatovi-kolo'].frames.length,level.goal.x-230,level.goal.y,1,{});let firstLog=null;for(const t of world.traps||[]){if(t.kind==='log'){t.first=!firstLog||firstLog.beam?.[0]!==t.beam?.[0];if(t.first)firstLog=t;}if(t.kind==='spikes')drawSpikes(t);else if(t.kind==='log')drawLog(t);else if(t.kind==='rocks')drawRocks(t);else if(t.kind==='barrels')drawBarrels(t);else if(t.kind==='timed')drawTimed(t);}}
function drawTrapsFront(){for(const t of world.traps||[])if(t.kind==='boulder')drawBoulder(t);else if(t.kind==='trska')drawTrska(t,true);drawGateFronts();}
// ---------- champions: an arena that locks until the aga falls ----------
let arena=null;
function updateArena(){const c=world.enemies.find(e=>e.champion);if(!c)return;
 if(c.alive&&!arena&&p.x>c.arena.x0+90&&p.x<c.arena.x1-40){arena={...c.arena,boss:c};c.engaged=true;speak(KIT_INTRO[c.kit]||`${c.name} ti preči put. Pazi na njegov poseban napad, Marko!`,8);{const v=KIT_VOICE[c.kit];if(v)say(`aga_${v}_intro`,{priority:4,x:c.x,delay:.5});say('meg',{priority:3,delay:v?6.8:1});}sfx('horn_call',{gain:.8});toast(`MEGDAN · ${c.name}`,2.4);$('boss-hud').hidden=false;}
 if(arena){if(c.alive||world.enemies.some(e=>e.trioMate&&e.alive))p.x=clamp(p.x,arena.x0+30,arena.x1-30);else{arena=null;$('boss-hud').hidden=true;addCoins(45,c.x,c.y-60);world.items.push({id:8990,x:c.x,y:c.y-60,type:'moc',power:Object.keys(POWERS)[(levelIndex+1)%3],taken:false});toast(`Pobedio si! ${c.name} je pao.`,3);{const v=KIT_VOICE[c.kit];if(v)say(`aga_${v}_death`,{priority:5,x:c.x});}sfx('magic_big',{gain:1});say('victory',{priority:3});}}}
function championAttack(e,F){e.count=(e.count||0)+1;const special=e.count%(e.p3?2:3)===0;if(!special)return false;
 const t=e.type;sfx('horn_call',{gain:.5,rate:1.3});
 if(t==='oklopnik'||t==='shield'){for(const d of[-1,1])arrows.push({x:e.x+d*40,y:e.y-16,vx:d*360,life:2.6,enemy:true,wave:true});dust(e.x,e.y,22,2.6);shake=settings.reduced?0:8;sfx('boom',{gain:.9});label('TALAS · SKOČI',e.x,e.y-170,'#ffcf9a');return true;}
 if(t==='palikuca'){for(const k of[-1,0,1]){const tt=1+k*.15,vx=clamp((p.x+k*110-e.x)/tt,-480,480);arrows.push({torch:true,x:e.x+e.face*28,y:e.y-110,vx,vy:-420,life:4,enemy:true});}sfx('whoosh_heavy',{gain:.7});return true;}
 if(t==='akindzija'){for(const d of[-1,1]){const hp=FOE_HP_L.akindzija,a={id:9100+e.count*2+(d>0?1:0),x:e.x+d*220,y:e.y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type:'akindzija',zone,face:-d,mode:'idle',timer:.8,stun:0,flash:0,alive:true,home:e.x,attackId:0,grounded:false,air:true};world.enemies.push(a);arrive(a,'drop',d,d>0?1:0);}incoming([['drop',-1],['drop',1]],'AKINDŽIJE','AKINDŽIJE SA STENA','ak_alarm');toast('Beg zove akindžije!',1.6);sfx('horn_call',{gain:.7});return true;}
 if(t==='sword'){e.lunge={v:e.face*620,t:.32,total:.32,hop:30};e.pendingHit={t:.3,dmg:26,range:150};sfx('whoosh_heavy',{gain:.8});return true;}
 return false;}
const FOE_HP_L={akindzija:80};
// ================= the champions of the pohodi: each fights his own way, on his own ground =================
// Taken from Prince of Persia: Klompa rams the walls (The Two Thrones), General Uvishka must first be thrown from his horse
// (The Lost Crown), Shahdee leaps blade first (Warrior Within). The rest come from the songs and the land.
const KIT_INTRO={hasan:'Hasan-aga: nijedan topuz ne probija njegov oklop. Navuci ga da se zaleti u stub, pa udri dok je ošamućen.',
 beg:'Akindžijski beg juriša na konju. Skoči na gredu ili odbij (L) kad prolazi, udri dok okreće konja i obori ga na zemlju.',
 ognjeni:'Ognjeni aga pali ulje po podu. Kad vikne „ulje“, skači na grede, pa ga udri dok je zadihan.',
 bajraktar:'Dok barjak stoji na steni, bajraktar ne prima udarce i zove pojačanje. Popni se i obori barjak.',
 janicar:'Janičarski aga skače sa grede na gredu i napada sabljom odozgo. Dočekaj ga u vazduhu.',
 arapin:'Arapin baca koplja sa vrha kule. Odbij koplje (L) nazad u njega, pa se popni na kulu.',
 basa:'Tufekdžija-baša gađa sa kule. Kad vidiš crvenu liniju, skloni se iza kamena ili čučni, pa se popni lestvama.',
 lovac:'Lovac-aga pušta pse na tebe. Pobij čopor, pa njega.',
 azdaja:'Aždaja iz pećine. Krljušt ne puca: kad bljune vatru, sakrij se iza kamena ili čučni, a kad posle ujeda zarije glavu u zemlju, udri.',
 dzelat:'Dželat seče sekirom i cepa grede pod tobom. Kad mu se sekira zabije, udri, ali ne ostani bez greda.',
 djemo:'Đemo Brđanin, Musin brat, došao je da osveti brata. Baca buzdovan preko polja. Preskoči ga dok leti i dok se vraća. Bez buzdovana Đemo je ranjiv.',
 trio:'Tri janičara sa carskim blagom. Ne daj im da te opkole: razdvoji ih.',
 kopljanik:'Kopljanik-baša drži selo pod opsadom. Gađa kopljem izdaleka i preskoči te kad mu priđeš. Odbij koplje (L) i ne daj mu mesta.'};
const KIT_HINT={hasan:'Navuci ga na stub · udri dok je ošamućen',beg:'Skoči ili odbij (L) kad prolazi · obori ga s konja',ognjeni:'Ulje · na grede! · udri dok je zadihan',bajraktar:'Obori barjak na steni',janicar:'Skače odozgo · dočekaj ga u vazduhu',arapin:'Odbij koplje (L) · popni se na kulu',basa:'Crvena linija · zaklon ili čučanj',lovac:'Pobij pse, pa lovca',azdaja:'Vatra · zaklon ili čučanj · udri glavu posle ujeda',dzelat:'Udri kad se sekira zabije',djemo:'Preskoči buzdovan · udri dok je bez njega',trio:'Ne daj da te opkole',kopljanik:'Odbij koplje (L) · ne daj mu mesta'};
const KIT_VOICE={hasan:'hasan',beg:'beg',ognjeni:'ognjeni',bajraktar:'bajraktar',janicar:'janicar',arapin:'arapin'};
function kitRun(e,dt){const K=KITS[e.kit];if(!K)return false;
 e.kc=(e.kc??2)-dt;e.kt=(e.kt||0)-dt;e.kitOpen=Math.max(0,(e.kitOpen||0)-dt);e.tauntT=(e.tauntT??12)-dt;
 if(e.p3)e.kc-=dt*.6;
 if(!e.p3&&e.hp<e.maxHp*.3){e.p3=true;e.p2=true;const v=KIT_VOICE[e.kit];if(v)say(`aga_${v}_phase`,{priority:4,x:e.x,delay:.2});label(K.p3||'POSLEDNJI DAH!',e.x,e.y-230,'#ff8a6a');champBreak(e,3);fx('flash','#ffb0a0',.1);sfx('horn_call',{gain:.8,rate:.8});shake=settings.reduced?0:6;K.phase3?.(e);}
 if(!e.p2&&e.hp<e.maxHp*.5){e.p2=true;const v=KIT_VOICE[e.kit];if(v)say(`aga_${v}_phase`,{priority:4,x:e.x});label(K.p2||'RAZJAREN!',e.x,e.y-210,'#ffb09a');champBreak(e,2);K.phase2?.(e);}
 if(e.tauntT<=0){e.tauntT=15+Math.random()*6;const v=KIT_VOICE[e.kit];if(v)say(`aga_${v}_taunt`,{chance:.75,x:e.x});}
 K.tick?.(e,dt);if(e.stun>0||!e.alive)return false;if(champGrabStep(e,dt))return true;if(actMove(e,dt))return true;const dx=p.x-e.x;return K.step?.(e,dt,dx,Math.abs(dx))||false;}
// a leap that lands on (x,y) after t seconds
function leapTo(e,x,y,t){e.vx=(x-e.x)/t;e.vy=((y-e.y)-.5*1750*t*t)/t;e.grounded=false;e.air=true;e.y-=2;sfx('whoosh_heavy',{gain:.7,x:e.x});dust(e.x,e.y,10,1.5);}
function onPlank(){return p.grounded&&p.on&&!p.on.ground&&p.on.kind!=='stone'?p.on:null;}
function drawKits(){drawCkpt();drawChampGuard();drawDrops();for(const e of world.enemies)if(e.kit&&e.engaged&&(e.alive||e.flag))KITS[e.kit]?.draw?.(e);}
// a red banner with the crescent, on the bajraktar's rock
function drawOttomanFlag(F){const tilt=(F.fall||0)*1.45,sh=F.shake>0?Math.sin(time*60)*3:0;ctx.save();ctx.translate(F.x+sh,F.y);ctx.rotate(-tilt);const C=clothTex('tkanina-barjak-turski');if(C){drawPole(0,0,-212,'alem');drawCloth(C,2,-206,106,66,1,.12+.82*(1-(F.fall||0)),F.x*.01);}else{line(0,0,0,-210,'#5a3c22',6);ellipse(0,-214,6,6,'#e8c86a');
 const wv=t=>Math.sin(time*3+t)*6*(1-(F.fall||0));ctx.beginPath();ctx.moveTo(3,-206);for(let i=0;i<=8;i++)ctx.lineTo(3+i*14,-206+wv(i*.6));for(let i=8;i>=0;i--)ctx.lineTo(3+i*14,-130+wv(i*.6)+i*1.5);ctx.closePath();ctx.fillStyle='#b8231c';ctx.fill();
 ctx.beginPath();ctx.arc(52,-168+wv(2.4),17,0,Math.PI*2);ctx.fillStyle='#f3ead8';ctx.fill();ctx.beginPath();ctx.arc(58,-168+wv(2.4),14,0,Math.PI*2);ctx.fillStyle='#b8231c';ctx.fill();ellipse(76,-168+wv(3),4,4,'#f3ead8');}ctx.restore();
 if(F.up&&Math.abs(p.x-F.x)<520)textLabel(`OBORI BARJAK · ${F.hp}`,F.x,F.y-240,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ff7a3a'});}
function throwSpear(e,clip='arapin-throw'){const sx=e.x+e.face*30,sy=e.y-125,ang=Math.atan2(p.y-70-sy,p.x-sx),v=720;react(e,clip,.5);arrows.push({x:sx,y:sy,vx:Math.cos(ang)*v,vy:Math.sin(ang)*v,spear:true,enemy:true,life:3});sfx('whoosh_heavy',{gain:.8,x:e.x});}
const HORN_T=1.1;
const KITS={
 // Hasan-aga: armour no light blow goes through; lure him into a pillar and strike while he reels
 hasan:{p2:'OKLOP PUKAO!',phase2(e){e.armor=0;},
  def(e){if(e.kitOpen>0){weakHit('ZABIO SE!');return 1.7;}return null;},
  step(e,dt,dx,d){const A=e.arena;
   if(e.ks==='prep'){e.vx=0;if(e.kt<=0){e.ks='ram';e.rdir=e.face;e.rammed=false;sfx('whoosh_heavy',{gain:.9,x:e.x});foeSay(e,'attack');}return true;}
   if(e.ks==='ram'){const v=e.p2?600:500;e.vx=e.rdir*v;e.walk=(e.walk||0)+v*dt;e.moveT=.12;if(Math.random()<.5)dust(e.x-e.rdir*30,e.y,2,1.4);
    if(!e.rammed&&Math.abs(p.x-e.x)<75&&Math.abs(p.y-e.y)<90&&p.invuln<=0&&p.dash<=0){e.rammed=true;damage(26,e.rdir);p.vx=e.rdir*520;}
    if(e.wallHit||(e.rdir>0?e.x>A.x1-45:e.x<A.x0+45)){const pillar=!!e.wallHit;e.ks=null;e.vx=0;e.stun=e.p2?2:2.8;e.mode='stun';e.kitOpen=e.stun;e.kc=e.p2?3.5:5;
     shake=settings.reduced?0:12;rumble(1,300);sfx('boom',{gain:1,x:e.x});sfx('rock',{gain:1,x:e.x});dust(e.x+e.rdir*40,e.y-40,30,3);
     if(pillar&&(e.armor??5)>0){e.armor=Math.max(0,(e.armor??5)-2);label(e.armor?`OKLOP ${e.armor}`:'OKLOP PUKAO!',e.x,e.y-180,'#ffe39a');}label('ZABIO SE · UDRI!',e.x,e.y-210,'#d9f6c0');}
    return true;}
   if(e.mode==='idle'&&e.kc<=0&&d>210&&Math.abs(p.y-e.y)<120&&e.grounded){e.ks='prep';e.kt=e.p2?.6:.85;e.face=dx>0?1:-1;label('!! JURIŠ',e.x,e.y-200,'#ffb09a');sfx('horn_call',{gain:.5,rate:1.3});return true;}
   return false;},
  pose(e){const R=rig?.['oklopnik-rush'];if(!R||!e.ks)return null;const n=R.frames.length;return e.ks==='prep'?{name:'oklopnik-rush',frame:0,dx:Math.sin(time*40)*2}:{name:'oklopnik-rush',frame:1+Math.floor((e.walk||0)/60)%Math.max(1,n-1),rot:e.face*.08};}},
 // the akindži beg rides: jump (onto a plank) or parry as he passes, strike as he turns, bring him down — then he fights on foot
 beg:{p2:'RAZJAREN!',
  tick(e){if(e.mounted===undefined)e.mounted=!!rig?.['beg-mounted'];},
  def(e){if(e.ks==='rear'||e.ks==='down'){weakHit(e.ks==='down'?'NA ZEMLJI!':'KONJ SE PROPEO!');return 1.6;}if(e.ks==='turn'){weakHit('OKREĆE KONJA!');return 1.2;}return e.mounted?.7:null;},
  step(e,dt,dx,d){const A=e.arena;
   if(e.ks==='unhorse'){e.vx=0;if(e.kt<=0){e.ks='down';e.kt=1.5;e.mounted=false;say('aga_beg_phase',{priority:4,x:e.x});dust(e.x,e.y,24,2.6);sfx('fall',{gain:1,x:e.x});}return true;}
   if(e.ks==='down'){e.vx=0;if(e.kt<=0){e.ks=null;e.timer=.6;}return true;}
   if(!e.mounted)return false;
   if(e.hp<e.maxHp*.6){e.ks='unhorse';e.kt=.9;e.vx=0;label('OBOREN S KONJA!',e.x,e.y-230,'#ffe39a');sfx('hoof',{gain:1,x:e.x});shake=settings.reduced?0:6;return true;}
   if(e.ks==='rear'){e.vx=0;if(e.kt<=0){e.ks='turn';e.kt=.6;}return true;}
   if(e.ks==='turn'){e.vx=0;e.face=e.rdir;if(e.kt<=0){e.ks='ride';e.struck=false;}return true;}
   if(e.ks!=='ride'){e.ks='ride';e.rdir=dx>0?1:-1;e.struck=false;}
   const v=e.p2?470:420;e.vx=e.rdir*v;e.face=e.rdir;e.walk=(e.walk||0)+v*dt;e.moveT=.12;if(Math.random()<.4)dust(e.x-e.rdir*50,e.y,2,1.5);if(Math.random()<dt*6)sfx('hoof',{gain:.5,x:e.x});
   if(!e.struck&&Math.sign(p.x-e.x)===e.rdir&&Math.abs(p.x-e.x)<120&&Math.abs(p.y-e.y)<80){e.struck=true;
    if(p.parry>0&&(e.x-p.x)*p.face>0){e.ks='rear';e.kt=1.4;e.vx=0;fx('parry',p.x+p.face*40,p.y-80);sound('parry');label('ODBIJENO · KONJ SE PROPEO',e.x,e.y-230,'#bfffe5');p.rage=Math.min(100,p.rage+25);return true;}
    if(p.dash>0||p.invuln>0)label('PROMAŠIO',e.x,e.y-200,'#e9ffe0');else{damage(22,e.rdir);foeSay(e,'attack');}}
   if(e.rdir>0?e.x>A.x1-70:e.x<A.x0+70){e.ks='turn';e.kt=1.2;e.rdir=-e.rdir;e.vx=0;label('OKREĆE KONJA · UDRI',e.x,e.y-210,'#d9f6c0');}
   return true;},
  pose(e){if(e.ks==='unhorse'&&rig?.['beg-unhorsed']){const n=rig['beg-unhorsed'].frames.length;return{name:'beg-unhorsed',frame:Math.min(n-1,Math.floor((1-e.kt/.9)*n)),fixedScale:1};}
   if(e.ks==='down'&&rig?.['beg-unhorsed'])return{name:'beg-unhorsed',frame:3,fixedScale:1};
   if(!e.mounted||!rig?.['beg-mounted'])return null;const S=rig['beg-mounted-strike'];
   if(e.ks==='ride'&&S&&Math.sign(p.x-e.x)===e.rdir&&Math.abs(p.x-e.x)<240){const n=S.frames.length;return{name:'beg-mounted-strike',frame:Math.min(n-1,Math.floor((1-Math.abs(p.x-e.x)/240)*n)),fixedScale:1};}
   const n=rig['beg-mounted'].frames.length;return{name:'beg-mounted',frame:e.ks==='ride'?Math.floor((e.walk||0)/70)%n:0,fixedScale:1,rot:e.ks==='rear'?-e.face*.2:0};}},
 // the fire aga: oil over the floor, then fire; only the planks are safe; after the blaze he is out of breath
 ognjeni:{p2:'SVE NEKA GORI!',
  def(e){if(e.kitOpen>0){weakHit('ZADIHAN!');return 1.5;}return null;},
  step(e,dt,dx,d){const A=e.arena;
   if(e.ks==='oil'){e.vx=0;if(e.kt<=0){e.ks='burn';e.kt=.6;for(let x=A.x0+50;x<A.x1-30;x+=105)addFire(x,A.y,e.p2?5.2:4,112);sfx('boom',{gain:.8,x:e.x});shake=settings.reduced?0:5;foeSay(e,'attack');}return true;}
   if(e.ks==='burn'){e.vx=0;if(e.kt<=0){e.ks=null;e.stun=e.p2?1.8:2.4;e.mode='stun';e.kitOpen=e.stun;e.kc=e.p2?6.5:8.5;label('ZADIHAN · UDRI!',e.x,e.y-210,'#d9f6c0');
     for(const k of[-1,0,1]){const tt=1+k*.15,vx=clamp((p.x+k*120-e.x)/tt,-520,520);arrows.push({torch:true,x:e.x+e.face*28,y:e.y-110,vx,vy:-460,life:4,enemy:true});}}return true;}
   if(e.mode==='idle'&&e.kc<=0&&e.grounded){e.ks='oil';e.kt=1.8;label('ULJE · NA GREDE!',e.x,e.y-210,'#ffcf7a');toast('Ulje se razliva · skoči na grede',2);sfx('cloth',{gain:.8,x:e.x});return true;}
   return false;},
  draw(e){if(e.ks!=='oil'||!e.alive)return;const A=e.arena,k=clamp(1-e.kt/1.8,0,1);ctx.save();ctx.globalAlpha=.6*k;for(let x=A.x0+50;x<A.x1-30;x+=105)ellipse(x,A.y+2,50*k+6,7,'#1a120a');ctx.restore();}},
 // the standard-bearer: while his banner stands on the rock no blow reaches him and he calls his men
 bajraktar:{
  tick(e,dt){e.pozivT=Math.max(0,(e.pozivT||0)-dt);const F=e.flag||(e.flag=e.arena.flag?{...e.arena.flag,hp:3,up:true,ids:new Set(),fall:0,shake:0}:null);if(!F)return;F.shake=Math.max(0,F.shake-dt);if(!F.up){F.fall=Math.min(1,F.fall+dt*1.6);return;}
   if(attackActive()&&!F.ids.has(p.attackId)&&Math.abs(p.x-F.x)<95&&p.y<=F.y+12&&p.y>F.y-170){F.ids.add(p.attackId);F.hp--;F.shake=.3;sfx('hit_heavy',{gain:.8,x:F.x});burst(F.x,F.y-150,'#c8302a',16,180);label(F.hp>0?`BARJAK ${F.hp}`:'BARJAK JE PAO!',F.x,F.y-230,'#ffe39a');
    if(F.hp<=0){F.up=false;say('aga_bajraktar_phase',{priority:4,x:e.x});e.stun=Math.max(e.stun,2.2);e.mode='stun';e.kitOpen=2.2;toast('Barjak je pao! Bajraktar se bori bez zaštite.',3);}}
   e.rally=(e.rally??7)-dt;const men=world.enemies.filter(o=>o.alive&&!o.champion&&o.x>e.arena.x0-100&&o.x<e.arena.x1+100).length;
   if(e.rally<=0&&men<3){e.rally=13;e.pozivT=1.1;say('aga_bajraktar_taunt',{priority:3,x:e.x});for(const s of[-1,1]){const hp=110,a={id:9400+(e.rallyN=(e.rallyN||0)+1)*2+(s>0?1:0),x:e.x+s*240,y:e.y,vx:0,vy:0,w:36,h:75,hp,maxHp:hp,type:'sword',zone,face:-s,mode:'idle',timer:.8,stun:0,flash:0,alive:true,home:e.x,attackId:0,grounded:false,air:true};world.enemies.push(a);arrive(a,'drop',s,s>0?1:0);}incoming([['drop',1]]);}},
  phase3(e){const F=e.flag;if(F&&!F.up&&!F.again){F.again=true;F.up=true;F.hp=2;F.fall=0;F.ids=new Set();e.rally=1;label('BARJAK PONOVO STOJI!',F.x,F.y-240,'#ffb09a');toast('Bajraktar je ponovo podigao barjak!',2.6);}},
  def(e){if(e.kitOpen>0)return 1.5;if(e.flag?.up){label('BARJAK GA ČUVA',e.x,e.y-190,'#c4dbd2');sfx('shield',{gain:.6,x:e.x});return 0;}return null;},
  draw(e){if(e.flag)drawOttomanFlag(e.flag);}},
 // the janissary aga leaps plank to plank and comes down blade first; meet him in the air
 janicar:{p2:'DVE SABLJE!',
  step(e,dt,dx,d){
   if(e.ks==='leap'){if(!e.dived&&e.vy>0&&Math.abs(p.x-e.x)<170&&p.y>=e.y-30){e.dived=true;e.pendingHit={t:.1,dmg:24,range:150};label('SABLJA ODOZGO!',e.x,e.y-190,'#ffb09a');sfx('whoosh_heavy',{gain:.8,x:e.x});}
    if(e.grounded&&e.kt<.6){e.ks=null;e.timer=.35;e.kc=e.p2?2.4:3.6;dust(e.x,e.y,12,1.8);}else if(e.kt< -2){e.ks=null;}return true;}
   const q=onPlank(),high=q&&q.y<e.y-40;
   if(e.mode==='idle'&&e.grounded&&e.kc<=0&&(high||d>380||(e.p2&&d>200))){const side=Math.sign(e.x-p.x)||1,tx=q?clamp(p.x+side*70,q.x+20,q.x+q.w-20):p.x+side*90,ty=q?q.y:e.arena.y;
    leapTo(e,tx,ty,.8);e.ks='leap';e.kt=.8;e.dived=false;e.face=-side;label('!! SKOK',e.x,e.y-200,'#ffb09a');foeSay(e,'attack');return true;}
   return false;}},
 // the Arapin on his tower: spears from the top; turn one back with a parry; at half strength he leaps down and fights below
 arapin:{p2:'NA VRH KULE!',
  def(e){if(e.kitOpen>0){weakHit('ZANET!');return 1.6;}return null;},
  phase2(e){const A=e.arena;if(Math.abs(e.y-A.top)<10){leapTo(e,(A.x0+A.x1)/2-80,A.y,.95);e.ks='leap';e.kt=.95;e.slam=true;}},
  step(e,dt,dx,d){const A=e.arena;
   if(e.ks==='leap'){if(e.grounded&&e.kt<.6){e.ks=null;e.timer=.5;dust(e.x,e.y,26,3);sfx('boom',{gain:1,x:e.x});shake=settings.reduced?0:8;if(e.slam){e.slam=false;for(const s of[-1,1])arrows.push({x:e.x+s*50,y:e.y-16,vx:s*340,life:2.6,enemy:true,wave:true});label('TALAS · SKOČI',e.x,e.y-190,'#ffcf9a');}}else if(e.kt< -2.5)e.ks=null;return true;}
   const onTop=Math.abs(e.y-A.top)<10;
   if(onTop){e.topT=(e.topT||0)+dt;if(Math.abs(p.y-e.y)<40)return false;e.vx=0;e.face=dx>0?1:-1;
    if(e.mode==='idle'&&e.kc<=0){throwSpear(e);if(e.p3)e.volley=2;e.kc=e.p3?1.6:e.p2?1.1:2.3;}
    if(e.volley>0&&(e.vt=(e.vt||0)+dt)>.28){e.vt=0;e.volley--;throwSpear(e);}
    if(e.p2&&e.topT>5){e.topT=0;leapTo(e,clamp(p.x,A.x0+80,A.x1-300),A.y,.95);e.ks='leap';e.kt=.95;e.slam=true;}
    return true;}
   if(e.p2){e.groundT=(e.groundT||0)+dt;if(e.mode==='idle'&&e.grounded&&e.groundT>9){e.groundT=0;e.topT=0;leapTo(e,A.topX,A.top,1);e.ks='leap';e.kt=1;return true;}}
   return false;}},
 // the musketeer captain on his watchtower: a red line before each shot; stones give cover; climb up and he jumps down
 basa:{
  tick(e){const A=e.arena;e.perch=A.deck!=null&&Math.abs(e.y-A.deck)<10;},
  def(e){if(e.mode==='recover'){weakHit('PUNI PUŠKU!');return 1.6;}return null;},
  step(e,dt,dx,d){const A=e.arena;
   if(e.ks==='leap'){if(e.grounded&&e.kt<.6){e.ks=null;e.timer=.6;dust(e.x,e.y,16,2);}else if(e.kt< -2.5)e.ks=null;return true;}
   if(e.perch&&Math.abs(p.y-e.y)<30&&d<240){leapTo(e,clamp(p.x-Math.sign(dx||1)*380,A.x0+80,A.x1-80),A.y,.9);e.ks='leap';e.kt=.9;e.groundT=0;label('SKOČIO S KULE',e.x,e.y-180,'#e9ffe0');return true;}
   if(!e.perch&&A.deck!=null){e.groundT=(e.groundT||0)+dt;if(e.mode==='idle'&&e.grounded&&e.groundT>10&&d>260&&Math.abs(p.y-A.deck)>60){leapTo(e,A.deckX,A.deck,1);e.ks='leap';e.kt=1;return true;}}
   return false;},
  draw(e){if(!e.alive||e.mode!=='windup')return;const sx=e.x+e.face*42,sy=e.y-96,k=1-e.timer/(e.windupDuration||1);ctx.save();ctx.globalAlpha=.35+.5*k;line(sx,sy,p.x,p.y-60,`rgba(255,${Math.round(80-60*k)},40,.9)`,1+2*k);ctx.restore();line(sx,sy,p.x,p.y-60,'rgba(255,60,40,.5)',2,gctx);}},
 // the hunter: a horn, and the hounds come running from both sides
 // the dragon of the cave: she never walks; fire along the ground or a bite; her scales turn the mace except on the head
 azdaja:{p2:'AŽDAJA RIČE!',
  def(e){if(e.kitOpen>0){weakHit('GLAVA JE DOLE!');return 1.6;}if(p.y<e.y-140)return 1;label('KRLJUŠT',e.x,e.y-220,'#c4dbd2');sfx('clang',{gain:.5,x:e.x});return .25;},
  step(e,dt,dx,d){e.vx=0;e.face=dx>0?1:-1;
   if(e.ks==='fire'){if(e.kt<=0){e.ks=null;e.kc=e.p2?2.2:3.2;}else if(Math.random()<dt*16)arrows.push({flame:true,x:e.x+e.face*130,y:e.y-85+(Math.random()-.5)*26,vx:e.face*(520+Math.random()*90),vy:(Math.random()-.5)*24,life:1.4,enemy:true});return true;}
   if(e.ks==='bite'){if(!e.bit&&e.kt<.35){e.bit=true;dust(e.x+e.face*170,e.y,22,2.4);sfx('boom',{gain:.7,x:e.x});if(Math.abs(p.x-e.x)<240&&p.y>e.y-270)damage(26,e.face);}
    if(e.kt<=0){e.ks=null;e.stun=e.p2?1.8:2.5;e.mode='stun';e.kitOpen=e.stun;e.kc=1.5;label('GLAVA U ZEMLJI · UDRI!',e.x,e.y-240,'#d9f6c0');}return true;}
   if(e.mode==='idle'&&e.kc<=0){if(d<250){e.ks='bite';e.kt=.9;e.bit=false;react(e,'azdaja-bite',.9);label('!! UJED',e.x,e.y-240,'#ffb09a');}else{e.ks='fire';e.kt=e.p2?2:1.6;react(e,'azdaja-fire',e.kt);label('!! VATRA · ZAKLON',e.x,e.y-240,'#ffb09a');sfx('whoosh_heavy',{gain:1,rate:.6,x:e.x});}}
   return true;}},
 // the executioner: the axe comes down and sticks; each blow splits a plank near him
 dzelat:{p2:'SEKIRA JE GLADNA!',
  def(e){if(e.kitOpen>0){weakHit('SEKIRA SE ZABILA!');return 1.6;}return null;},
  step(e,dt,dx,d){
   if(e.ks==='chop'){e.vx=0;if(e.kt<=0){e.ks=null;const x=e.x+e.face*90;dust(x,e.y,24,2.4);sfx('boom',{gain:.9,x});sfx('hit_heavy',{gain:.8,x});shake=settings.reduced?0:9;if(Math.abs(p.x-x)<95&&Math.abs(p.y-e.y)<130)damage(30,e.face);
     for(const q of world.platforms)if(q.arena&&!q.off&&x>q.x-40&&x<q.x+q.w+40&&q.y<e.y-20&&q.y>e.y-300){q.off=true;q.cut=true;burst(q.x+q.w/2,q.y,'#8a6a40',24,200,'dust');label('GREDA PREPOLOVLJENA',q.x+q.w/2,q.y-30,'#ffcf9a');break;}
     e.stun=e.p2?1.5:2.1;e.mode='stun';e.kitOpen=e.stun;label('SEKIRA SE ZABILA · UDRI',e.x,e.y-210,'#d9f6c0');}return true;}
   if(e.mode==='idle'&&e.kc<=0&&d<300&&e.grounded){e.ks='chop';e.kt=e.p2?.8:1.05;e.face=dx>0?1:-1;react(e,'dzelat-attack',e.kt+.25);label('!! SEKIRA',e.x,e.y-210,'#ffb09a');sfx('draw',{gain:.8,x:e.x});e.kc=e.p2?2.4:3.4;return true;}
   return false;}},
 // Đemo the highlander: the mace flies across the field and comes back; without it he is open
 djemo:{p2:'RAZJAREN!',
  def(e){if(e.mace){weakHit('BEZ BUZDOVANA!');return 1.6;}return null;},
  tick(e,dt){const M=e.mace;if(!M)return;M.t+=dt;M.rot+=dt*14;if(!M.back&&M.t>=M.T){M.back=true;M.hit=false;}
   if(M.back){const dx=e.x-M.x;M.vx=Math.sign(dx)*Math.min(720,Math.abs(dx)*4+260);if(Math.abs(dx)<30){e.mace=null;sfx('clang',{gain:.8,x:e.x});return;}}
   M.x+=M.vx*dt;if(!M.hit&&Math.abs(p.x-M.x)<52&&M.y>p.y-p.h-10&&M.y<p.y+10&&p.invuln<=0&&p.dash<=0){M.hit=true;damage(22,Math.sign(M.vx)||1);}},
  step(e,dt,dx,d){if(e.mace){e.vx=0;e.face=Math.sign(e.mace.x-e.x)||e.face;return true;}
   if(e.mode==='idle'&&e.kc<=0&&d>190&&d<760&&e.grounded){const dir=dx>0?1:-1;react(e,'djemo-throw',.6);e.kc=e.p2?2.8:4.2;e.mace={x:e.x+dir*40,y:e.y-62,vx:dir*620,t:0,T:e.p2?1.15:.95,rot:0};label('!! BUZDOVAN · SKOČI',e.x,e.y-210,'#ffb09a');sfx('whoosh_heavy',{gain:.9,x:e.x});return true;}
   return false;},
  draw(e){const M=e.mace;if(!M||!e.alive)return;ctx.save();ctx.translate(M.x,M.y);ctx.rotate(M.rot);line(-34,0,8,0,'#4a3420',6);ellipse(18,0,15,15,'#5a5a60');for(let i=0;i<8;i++){const a=i*Math.PI/4;line(18+Math.cos(a)*13,Math.sin(a)*13,18+Math.cos(a)*23,Math.sin(a)*23,'#b0b4ba',3);}ctx.restore();}},
 // three janissaries with the Sultan's gold: when one falls the others grow fiercer
 trio:{tick(e){const mates=world.enemies.filter(o=>o.trioMate);const fallen=mates.filter(o=>!o.alive).length+(e.alive?0:1);if(fallen!==e.trioFallen){e.trioFallen=fallen;if(fallen>0){for(const o of[e,...mates])if(o.alive){o.elite=true;o.timerScale=.7;}label('RAZJARILI SU SE!',e.x,e.y-200,'#ffb09a');}}}},
 // the spear captain of the gorge: spears from afar, a vault over Marko when he comes close
 kopljanik:{p2:'RAZJAREN!',
  step(e,dt,dx,d){if(e.ks==='vault'){if(e.grounded&&e.kt<.5){e.ks=null;e.timer=.3;dust(e.x,e.y,12,1.6);}else if(e.kt< -2)e.ks=null;return true;}
   if(e.mode==='idle'&&e.kc<=0&&e.grounded){if(d>330){throwSpear(e,'kopljanik-attack');e.kc=e.p2?1.7:2.5;return true;}
    if(d<130){leapTo(e,clamp(p.x+Math.sign(p.x-e.x)*170,e.arena.x0+60,e.arena.x1-60),e.arena.y,.8);e.ks='vault';e.kt=.8;e.kc=2.2;label('PRESKOČIO TE',e.x,e.y-180,'#e9ffe0');return true;}}
   return false;}},
 lovac:{p2:'ČOPOR!',
  step(e,dt){if(!(e.hornT>0))return false;e.hornT-=dt;e.vx=0;e.face=p.x>e.x?1:-1;return true;},
  tick(e,dt){e.packT=(e.packT??1.5)-dt;const dogs=world.enemies.filter(o=>o.alive&&o.type==='pas'&&o.pack).length;
   if(e.packT<=0&&dogs<2){e.packT=e.p3?7:e.p2?9:12;e.hornT=HORN_T;sfx('horn_call',{gain:.8,rate:1.6,x:e.x});label('LOVAC ZOVE PSE',e.x,e.y-200,'#ffcf7a');const n=e.p3?4:e.p2?3:2;
    for(let k=0;k<n;k++){const s=k%2?1:-1,hp=60,a={id:9600+(e.packN=(e.packN||0)+1),x:p.x+s*300,y:e.arena.y,vx:0,vy:0,w:36,h:50,hp,maxHp:hp,type:rig?.['pas-run']?'pas':'akindzija',zone,face:-s,mode:'idle',timer:.6,stun:0,flash:0,alive:true,home:p.x,attackId:0,grounded:true,pack:true};world.enemies.push(a);arrive(a,'run',s,k>>1);}
    incoming([['run',-1],['run',1]],'PSI','PSI');}}},
};
// ================= pack 08: the rules of the megdan =================
// 1. A living foe is a body. Marko cannot stand inside him and swing left and right; a roll, a slide, a charge or a jump
//    goes through or over. 2. A champion keeps his guard up: light blows glance off it, and the third one in a row earns a
//    shove. Heavy blows wear the guard down until it breaks; a parry, his own missed swing or his kit's opening lay him open.
// 3. Each champion fights in three acts. Entering an act he throws Marko back, and from the second act on he closes in to
//    grapple, as Musa did: slip the grab and he stumbles; get caught and it is hands against hands.
const GUARD_MAX=100,NO_GUARD={azdaja:1,trio:1};
function bodyBlock(dt){let push=0;if(p.shoveT>0){push=p.shoveV*Math.min(1,p.shoveT/.18);p.shoveT-=dt;}
 if(mode!=='play'||p.dash>0||p.rollEnd>0||p.slide>0||p.pinned||p.climb||horseMounted||p.plunge>0||p.down>0||p.jurisT>0||gunner||finisher)return push;
const test=(x,y,h,min)=>{const dx=p.x-x;if(Math.abs(dx)>=min||p.y<y-h+18||p.y>y+50)return;const s=dx===0?-p.face:Math.sign(dx);if(p.vx*s<0)p.vx=0;push+=s*Math.min(260,(min-Math.abs(dx))*14+40);};
 for(const e of world.enemies){if(!e.alive||e.zone!==zone||e.held||e.grappling||e.spava||e.patrola||e.perch||e.caus||e.enter||e.climb||e.mounted||e.prey||(e.air&&!e.grounded)||e.stun>0)continue;test(e.x,e.y,e.h||75,e.champion?46:32);}
 if(!level&&zone===5&&boss?.alive&&!boss.mounted&&boss.stage!=='kostac'&&boss.stage!=='joust'&&!training)test(boss.x,boss.y-(boss.hop||0),150,56);
 return push;}
function champOpen(e,mul){const k=p.attackKind;return mul>1||e.stun>0||e.guardBroken>0||e.kitOpen>0||e.mode==='recover'||(e.air&&!e.grounded)||e.burn>0||k==='super'||k==='counter';}
// called from hitEnemy with the kit's own answer: what is left of the blow against a champion's guard
function champGuard(e,heavy,mul){e.guarded=false;if(!e.champion||!e.engaged||mul===0||NO_GUARD[e.kit]||(e.kit==='beg'&&e.mounted))return mul;
 if(e.invT>0){label('NE DA SE',e.x,e.y-190,'#c4dbd2');sfx('shield',{gain:.5,x:e.x});return 0;}
 if(e.type==='oklopnik'&&(e.armor??5)>0)return mul; // his armour is his guard
 if(champOpen(e,mul)){e.gHits=0;return mul;}
 const k=p.attackKind,drain=k==='light'?5:k==='heavy'?(p.chargeFull?70:(p.charge||0)>.35?48:30):42;
 e.guard=Math.max(0,(e.guard??GUARD_MAX)-drain);e.guardAt=time;
 if(e.guard<=0){e.guard=GUARD_MAX;e.guardBroken=2.8;e.stun=Math.max(e.stun,1.5);e.mode='stun';e.gHits=0;e.lunge=null;e.pendingHit=null;weakHit('GARD SLOMLJEN!');sfx('shield',{gain:1,rate:.6,x:e.x});fx('flash','#ffe9c0',.08);shake=settings.reduced?0:7;rumble(.6,180);return 1.2;}
 e.guarded=true;if(time-(e.gHitAt||0)>2.2)e.gHits=0;e.gHitAt=time;if(k==='light')e.gHits=(e.gHits||0)+1;
 label(k==='light'?'GARD':'GARD POPUŠTA',e.x,e.y-150,'#c4dbd2');sfx(k==='light'?'shield':'clang',{gain:.7,x:e.x});fx('burst',e.x-p.face*26,e.y-78,'#dfe8ff',k==='light'?8:14,170);
 if(k==='light'&&e.gHits>=(settings.difficulty==='story'?4:3))champRiposte(e);
 return k==='light'?.12:.4;}
function champRiposte(e){e.gHits=0;const s=Math.sign(p.x-e.x)||-e.face;e.face=s;if(settings.difficulty!=='story')damage(12,s);p.vx=s*560;p.vy=-240;p.shoveV=s*620;p.shoveT=.32;p.grounded=false;p.attack=0;p.combo=0;p.cooldown=Math.max(p.cooldown||0,.35);
 label('ODGURNUO TE!',p.x,p.y-165,'#ffb09a');sfx('hit_heavy',{gain:.7,x:e.x});shake=settings.reduced?0:6;rumble(.5,140);e.timer=Math.min(e.timer,.25);megdanHint();}
let megdanHinted=false;
function megdanHint(){if(megdanHinted)return;megdanHinted=true;speak('Njegov gard ne puca od lakih udaraca, Marko. Drži K za teški udarac, odbij (L) njegov napad, ili ga udri dok se oporavlja od svog zamaha.',7);}
// entering an act: a moment no blow reaches him, and Marko is thrown back
function champBreak(e,act){e.act=act;e.invT=1.3;e.guard=GUARD_MAX;e.gHits=0;e.guardBroken=0;const s=Math.sign(p.x-e.x)||1;
 if(Math.abs(p.x-e.x)<260&&Math.abs(p.y-e.y)<140&&!p.pinned){p.vx=s*620;p.vy=-300;p.shoveV=s*760;p.shoveT=.4;p.grounded=false;p.attack=0;}
 for(const d of[-1,1])dust(e.x+d*40,e.y,14,2.4);sfx('boom',{gain:.9,x:e.x});shake=settings.reduced?0:9;rumble(.8,260);slowMo=Math.max(slowMo,.5);
 toast(act===2?`${e.name} · drugi čin`:`${e.name} · poslednji čin`,2.2);if(GRAB[e.kit]&&e.grabCD==null)e.grabCD=2.2;}
const GRAB={hasan:'GNJEČI TE OKLOPOM',djemo:'ĐEMO TE STEŽE',dzelat:'DŽELAT TE DAVI',ognjeni:'OGNJENI AGA TE DAVI',bajraktar:'BAJRAKTAR TE DAVI',janicar:'NOŽ IZNAD GRLA',arapin:'ARAPIN TE DAVI',basa:'KUNDAK NA GRLU',lovac:'LOVAC TE DAVI REMENOM',kopljanik:'KOPLJE PREKO GRLA',beg:'BEG TE DAVI'};
// the grab: a clear warning, a short rush; out of reach or rolling and he stumbles past
function champGrabStep(e,dt){if(!GRAB[e.kit]||e.grabCD==null||(e.kit==='beg'&&e.mounted))return false;
 if(e.gs==='prep'){e.vx=0;e.gt-=dt;e.face=Math.sign(p.x-e.x)||e.face;if(e.gt<=0){e.gs='lunge';e.gt=.5;e.gdir=e.face;sfx('whoosh_heavy',{gain:.9,x:e.x});foeSay(e,'attack');}return true;}
 if(e.gs==='lunge'){e.gt-=dt;e.vx=e.gdir*540;e.walk=(e.walk||0)+540*dt;e.moveT=.12;if(Math.random()<.5)dust(e.x-e.gdir*24,e.y,2,1.3);
  if(Math.abs(p.x-e.x)<64&&Math.abs(p.y-e.y)<70&&p.dash<=0&&p.invuln<=0&&!p.pinned&&!p.climb&&!grapple&&!finisher&&champPin(e))return true;
  if(e.gt<=0||e.wallHit){e.gs=null;e.vx=0;e.stun=1.6;e.mode='stun';e.kitOpen=Math.max(e.kitOpen||0,1.6);e.grabCD=e.p3?11:15;label('PROMAŠIO · UDRI!',e.x,e.y-210,'#d9f6c0');dust(e.x,e.y,12,1.8);}
  return true;}
 e.grabCD-=dt;
 if(e.grabCD<=0&&e.mode==='idle'&&e.grounded&&!e.ks&&!e.perch&&!(e.invT>0)&&Math.abs(p.x-e.x)<430&&Math.abs(p.y-e.y)<60&&p.grounded){e.gs='prep';e.gt=settings.difficulty==='story'?1.1:.8;e.grabCD=e.p3?11:15;label('!! HVATA TE · KOLUT',e.x,e.y-215,'#ff9a7a');sfx('horn_call',{gain:.5,rate:1.5,x:e.x});return true;}
 return false;}
function champPin(e){if(horseMounted||p.pinned)return false;const s=Math.sign(e.x-p.x)||1;
 grapple={e,kind:'champ',champ:true,t:0,m:.2,end:0,s};e.gs=null;e.grappling=true;e.vx=0;e.lunge=null;e.pendingHit=null;Object.assign(p,{pinned:true,vx:0,vy:0,attack:0,spin:0,blocking:false,down:0,dash:0});
 e.x=p.x;sfx('fall',{gain:1});sfx('cloth',{gain:.9});dust(p.x,p.y,24,2.4);shake=settings.reduced?0:10;rumble(.9,300);slowMo=Math.max(slowMo,.35);label(GRAB[e.kit]||'U KOŠTAC',p.x,p.y-180,'#ff9a8a');say('hurt',{priority:3});toast('U koštac! Otimaj se: J J J',2.4);return true;}
function champAfterGrapple(G,won){const e=G.e;e.gs=null;e.grabCD=e.p3?11:15;
 if(won){e.hp=Math.max(1,e.hp-e.maxHp*.07);e.guardBroken=2.6;e.kitOpen=Math.max(e.kitOpen||0,2.6);e.stun=2.6;e.mode='stun';label('ZBACIO SI GA!',e.x,e.y-190,'#ffe39a');p.rage=Math.min(100,p.rage+30);}
 else{p.vx=-G.s*520;p.vy=-520;p.grounded=false;label('TRESNUO TE O ZEMLJU',p.x,p.y-170,'#ffb09a');shake=settings.reduced?0:10;}}
function champMegdanTick(dt){for(const e of world.enemies){if(!e.champion||!e.alive)continue;if(e.invT>0)e.invT-=dt;
  if(!(e.guardBroken>0)&&time-(e.guardAt||0)>3)e.guard=Math.min(GUARD_MAX,(e.guard??GUARD_MAX)+dt*26);}}
function drawChampGuard(){const c=arena?.boss;if(!c||!c.alive||NO_GUARD[c.kit])return;
 if(c.gs==='prep'){const k=1-c.gt/.8;ctx.save();ctx.globalAlpha=.35+.4*k;halo(c.x,c.y-80,70+30*k,'rgba(255,90,50,.55)');ctx.restore();}
 if(c.invT>0){ctx.save();ctx.globalAlpha=.5*Math.min(1,c.invT);halo(c.x,c.y-80,120,'rgba(255,230,170,.5)');ctx.restore();}}
// ================= the acts: what each champion adds in the second and in the last act =================
// rain: things fall from above, each with a shadow first. pots: the same, and they leave fire. slam: he leaps at Marko and
// the ground shakes both ways; then he needs a breath. combo: three rushes in a row; then he is spent. volley: three shots.
const ACTS={hasan:{3:['rain','!! STRELE SA BEDEMA']},beg:{3:['combo','!! TRI JURIŠA']},ognjeni:{2:['pots','!! OGNJENI LONCI'],3:['pots','!! OGNJENA KIŠA']},
 bajraktar:{2:['slam','!! BARJAK O ZEMLJU'],3:['rain','!! STRELE NA ZNAK BARJAKA']},janicar:{2:['combo','!! VRTLOG SABALJA'],3:['combo','!! VRTLOG SABALJA']},arapin:{3:['rain','!! KOPLJA S NEBA']},
 basa:{2:['pots','!! KUMBARA'],3:['pots','!! KUMBARE']},azdaja:{2:['rain','!! KAMENJE SA SVODA'],3:['rain','!! SVOD SE RUŠI']},dzelat:{2:['slam','!! SKOK SA SEKIROM'],3:['combo','!! TRI ZAMAHA']},
 djemo:{2:['slam','!! SKOK S BUZDOVANOM'],3:['combo','!! TRI NALETA']},kopljanik:{2:['volley','!! TRI KOPLJA'],3:['slam','!! UBOD U ZEMLJU']},lovac:{2:['volley','!! TRI STRELE'],3:['rain','!! STRELE IZ ŠUME']}};
function actMove(e,dt){const A=e.arena,M=ACTS[e.kit]?.[e.p3?3:e.p2?2:1];
 if(e.as==='slam'){e.at-=dt;if(e.grounded&&e.at<.55){e.as=null;e.vx=0;dust(e.x,e.y,28,3);sfx('boom',{gain:1,x:e.x});shake=settings.reduced?0:9;rumble(.8,220);
   for(const s of[-1,1])arrows.push({x:e.x+s*50,y:e.y-16,vx:s*350,life:2.4,enemy:true,wave:true});if(Math.abs(p.x-e.x)<95&&Math.abs(p.y-e.y)<80&&p.invuln<=0&&p.dash<=0)damage(22,Math.sign(p.x-e.x)||1);
   e.stun=1;e.mode='stun';e.kitOpen=Math.max(e.kitOpen||0,1);label('TALAS · SKOČI',e.x,e.y-190,'#ffcf9a');}else if(e.at< -2.5)e.as=null;return true;}
 if(e.as==='combo'){e.at-=dt;if(e.lunge?.t>0)return true;if(e.at>0){e.vx=0;return true;}
  if(e.an>0){e.an--;e.face=Math.sign(p.x-e.x)||e.face;e.lunge={v:e.face*600,t:.32,total:.32,hop:26};e.pendingHit={t:.28,dmg:20,range:135};e.at=.5;sfx('whoosh_heavy',{gain:.8,x:e.x});label('!',e.x,e.y-190,'#ffb09a');return true;}
  e.as=null;e.stun=1.3;e.mode='stun';e.kitOpen=Math.max(e.kitOpen||0,1.3);label('ZADIHAN · UDRI!',e.x,e.y-210,'#d9f6c0');return true;}
 if(e.as==='volley'){e.at-=dt;e.vx=0;e.face=Math.sign(p.x-e.x)||e.face;if(e.at<=0){if(e.an>0){e.an--;e.at=.3;if(e.kit==='kopljanik')throwSpear(e,'kopljanik-attack');else{const sx=e.x+e.face*30,sy=e.y-96,ang=Math.atan2(p.y-64-sy,p.x-sx)+(e.an-1)*.09;arrows.push({x:sx,y:sy,vx:Math.cos(ang)*640,vy:Math.sin(ang)*640,enemy:true,life:3});sfx('bow',{gain:.7,x:e.x});}}else e.as=null;}return true;}
 if(!M||e.perch||e.gs||e.ks||e.mace)return false;e.actCD=(e.actCD??3.5)-dt;
 if(e.actCD>0||e.mode!=='idle'||!e.grounded||e.invT>0)return false;e.actCD=e.p3?9:12;const [kind,text]=M;label(text,e.x,e.y-225,'#ffb09a');sfx('horn_call',{gain:.6,rate:1.2,x:e.x});
 if(kind==='rain'||kind==='pots'){const n=e.p3?7:5,W=world.drops||(world.drops=[]);for(let i=0;i<n;i++){const x=clamp(i<2?p.x+(i?70:-20):A.x0+60+Math.random()*(A.x1-A.x0-120),A.x0+40,A.x1-40);W.push({x,y:A.y,t:1+i*.28,fire:kind==='pots',art:e.kit==='azdaja'?'rock':kind==='pots'?'pot':e.kit==='arapin'?'spear':'arrow'});}return false;}
 if(kind==='slam'){leapTo(e,clamp(p.x,A.x0+70,A.x1-70),A.y,.85);e.as='slam';e.at=.85;return true;}
 if(kind==='combo'){e.as='combo';e.an=3;e.at=.45;return true;}
 if(kind==='volley'){e.as='volley';e.an=3;e.at=.4;return true;}
 return false;}
// what falls: a shadow that grows for a second, then the blow
function updateDrops(dt){const W=world.drops;if(!W?.length)return;for(const d of W){const was=d.t;d.t-=dt;if(was>0&&d.t<=0){dust(d.x,d.y,10,1.8);sfx(d.fire?'fire':'rock',{gain:.7,x:d.x});if(d.fire)addFire(d.x,d.y,2.6,60);
   if(Math.abs(p.x-d.x)<48&&p.y>d.y-150&&p.y<d.y+30&&p.invuln<=0&&p.dash<=0)damage(18,Math.sign(p.x-d.x)||1);shake=Math.max(shake,settings.reduced?0:3);}}
 world.drops=W.filter(d=>d.t>-.35);}
function drawDrops(){const W=world.drops;if(!W?.length)return;for(const d of W){if(d.t<=0){ctx.save();ctx.globalAlpha=clamp(1+d.t/.35,0,1);ellipse(d.x,d.y-4,26,7,d.fire?'#ffb060':'#d8d0c0');ctx.restore();continue;}
  const k=clamp(1-d.t/1,0,1);if(d.t>1)continue;ctx.save();ctx.globalAlpha=.25+.5*k;ellipse(d.x,d.y+2,14+30*k,4+5*k,'#160806');ctx.restore();
  if(k>.45){const y=d.y-(1-k)*(1-k)*1500;ctx.save();ctx.translate(d.x,y);
   if(d.art==='rock'){ctx.rotate(d.x*.01+k*3);poly([[-16,-10],[4,-18],[18,-4],[12,14],[-8,16],[-18,2]],'#6f6a62');poly([[-10,-6],[2,-12],[10,-2],[-2,4]],'#8d887e');}
   else if(d.art==='pot'){ellipse(0,0,13,15,'#7a4a2a');ellipse(0,-14,7,4,'#3a2414');halo(0,-18,22,'rgba(255,140,50,.7)');}
   else{line(0,-46,0,8,d.art==='spear'?'#5a3c22':'#3a2a1a',d.art==='spear'?5:3);poly([[-5,6],[5,6],[0,20]],'#c8ccd2');}
   ctx.restore();}}}
// ---------- new blows: uppercut (S+K, also W+J) and the charge out of a roll (Shift, then J) ----------
function specialStrike(){if(p.attack>0||p.cooldown>0||p.climb||horseMounted||p.down>0||thrown||p.throwT>0)return false;
 if(p.grounded&&((isDown('KeyS','ArrowDown')&&tap('KeyK'))||(isDown('KeyW','ArrowUp')&&tap('KeyJ')&&!ladderNear()))){p.crouching=false;p.crouch=0;if(!cdReady('uvis')){cdDenied('uvis');return false;}cdStart('uvis');p.launchT=.6;p.attack=.42;p.attackKind='uvis';p.cooldown=.3;p.attackId=++attackSerial;sound('swing');sayGrunt(true);return true;}
 if((p.dash>0||p.rollEnd>0)&&tap('KeyJ')){if(!has('juris')){locked('juris');return false;}if(!cdReady('juris')){cdDenied('juris');return false;}cdStart('juris');p.dash=0;p.attack=.42;p.attackKind='juris';p.cooldown=.5;p.attackId=++attackSerial;p.jurisT=.26;p.invuln=Math.max(p.invuln,.3);sfx('whoosh_heavy',{gain:.8});sayGrunt(true);return true;}
 return false;}
function updateSpecial(dt){p.rollEnd=Math.max(0,(p.rollEnd||0)-dt);if(p.dash>0&&p.dash<dt*2)p.rollEnd=.18;if(p.jurisT>0){p.jurisT-=dt;p.vx=p.face*640;if(Math.random()<.5)ghosts.push({...playerPose(),x:p.x,y:p.y,face:p.face,life:.18});}}
// ---------- the level list opens one pohod at a time ----------
function levelOpen(i){if(i===0||DEV||levelStars(LEVELS[i]).done)return true;if(i>=MUSA_AFTER&&!kacanikWon())return false;const done=levelsDone(),prev=LEVELS[i-1];return done.some(k=>k===prev.id||k.startsWith(prev.id+'@'));}

// ================= gamepad: Xbox controller and Logitech F310 (XInput, the "standard" layout) =================
// A skok · X topuz · Y teški udarac · B kolut · LB blok/odbij · RB baci topuz · LT vino · RT vila/upotrebi
// L3 vihor · R3 junački udar · Start pauza · stick ili krstić: kretanje, gore = lestve/uvis, dole = čučanj
const PAD_MAP={0:'Space',1:'ShiftLeft',2:'KeyJ',3:'KeyK',4:'KeyL',5:'KeyI',6:'KeyQ',7:'KeyE',8:'KeyG',10:'KeyF',11:'KeyR'};
const padHeld=new Set(),padRest=new Set();let padPrev={},padIndex=null,stickMag=1,padNav={},controlsKeyboard=null;
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
 if(b){if(!$('settings').hidden){closeSettings();return;}if(!$('kontrole').hidden){$('kontrole').hidden=true;return;}const back=box.querySelector('#levels-close,#riznica-close,#resume,#lore-close,.text-button');if(back)back.click();}}
// ================= the controls screen: a drawn gamepad whose buttons light up as they are pressed =================
// [button index, glyph, x, y, shape, label side, action]
const PAD_PARTS=[[6,'LT',118,40,'trig','l','Vino'],[4,'LB',132,70,'shoulder','l','Blok / odbij'],[7,'RT',402,40,'trig','r','Vila · Šarac · poluga · top'],[5,'RB',388,70,'shoulder','r','Baci topuz'],
 [3,'Y',392,118,'face','r','Teški udarac'],[2,'X',360,150,'face','l2','Topuz'],[1,'B',424,150,'face','r','Kolut'],[0,'A',392,182,'face','r','Skok'],
 [10,'L3',150,150,'stick','l','Kretanje · klik: vihor'],[11,'R3',326,222,'stick','b','Junački udar'],[9,'≡',300,128,'mini','t','Pauza'],[8,'⧉',220,128,'mini','t','Očeva sablja'],
 [12,'↑',200,198,'dpad','l','Lestve · popni se'],[13,'↓',200,246,'dpad','l','Čučanj · siđi'],[14,'←',176,222,'dpad','n',''],[15,'→',224,222,'dpad','n','']];
const KONTROLE_CARDS=[['Dokrajčivanje','kad zasija krug nad neprijateljem',[['X','Odseci glavu'],['Y','Smrskaj glavu iz skoka'],['B','Odseci noge'],['A','Zgazi ga'],['↑+Y','Oderi do kostiju'],['sa sabljom','X glava · Y proburazi · B napola']]],
 ['Top','priđi topu i pritisni RT',[['↑ ↓','Ugao cevi'],['← →','Više ili manje baruta'],['X','Pucaj'],['RT','Ostavi top']]],
 ['Na ivici','kad visiš',[['↑ / A','Popni se'],['↓','Pusti se']]],
 ['Kombinacije','',[['X X X','Niz udaraca'],['↑ + X','Uvis'],['↓','Klizanje u trku'],['↓ + A','Siđi s daske'],['LB','Odbij u pravom trenu i vrati udarac']]]];
const KONTROLE_KEYS=[['A D','Kretanje'],['G','Očeva sablja'],['Space','Skok'],['J','Topuz'],['K','Teški udarac'],['L','Blok / odbij'],['Shift','Izmakni'],['S','Čučanj'],['S + K','Aperkat'],['S + J','Šut nogom'],['I','Baci topuz'],['E','Vila · Šarac · top'],['Q','Vino'],['F','Vihor'],['R','Junački udar'],['W','Lestve · popni se'],['Esc','Pauza']];
function padSvg(){const T=s=>tr(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');let s=`<svg class="pad-svg" viewBox="-180 12 900 290" role="img" aria-label="${T('Raspored dugmadi na džojstiku')}">`;
 s+='<path class="pad-body" d="M120 82 Q260 62 400 82 Q470 92 492 170 Q512 258 452 276 Q414 286 384 246 Q350 214 260 214 Q170 214 136 246 Q106 286 68 276 Q8 258 28 170 Q50 92 120 82Z"/>';
 for(const [b,g,x,y,shape,side,act] of PAD_PARTS){
  if(shape==='trig')s+=`<rect class="pad-btn" data-b="${b}" x="${x-26}" y="${y-14}" width="52" height="26" rx="10"/>`;
  else if(shape==='shoulder')s+=`<rect class="pad-btn" data-b="${b}" x="${x-34}" y="${y-9}" width="68" height="18" rx="8"/>`;
  else if(shape==='stick')s+=`<circle class="pad-well" cx="${x}" cy="${y}" r="27"/><circle class="pad-btn pad-stick" data-b="${b}" data-stick="${b===10?0:2}" cx="${x}" cy="${y}" r="18"/>`;
  else if(shape==='dpad')s+=`<rect class="pad-btn" data-b="${b}" x="${x-11}" y="${y-11}" width="22" height="22" rx="4"/>`;
  else if(shape==='mini')s+=`<rect class="pad-btn" data-b="${b}" x="${x-12}" y="${y-7}" width="24" height="14" rx="7"/>`;
  else s+=`<circle class="pad-btn face f${g}" data-b="${b}" cx="${x}" cy="${y}" r="15"/>`;
  s+=`<text class="pad-glyph" x="${x}" y="${y+4.5}">${g}</text>`;
  if(!act)continue;
  if(side==='l')s+=`<line class="pad-line" x1="${x-30}" y1="${y}" x2="14" y2="${y}"/><text class="pad-act" x="8" y="${y+5}" text-anchor="end">${T(act)}</text>`;
  else if(side==='r')s+=`<line class="pad-line" x1="${x+30}" y1="${y}" x2="506" y2="${y}"/><text class="pad-act" x="512" y="${y+5}" text-anchor="start">${T(act)}</text>`;
  else if(side==='l2')s+=`<text class="pad-act" x="${x-22}" y="${y+5}" text-anchor="end">${T(act)}</text>`;
  else if(side==='b')s+=`<text class="pad-act" x="${x}" y="${y+50}" text-anchor="middle">${T(act)}</text>`;
  else if(side==='t')s+=`<text class="pad-act" x="${x}" y="${y-22}" text-anchor="middle">${T(act)}</text>`;}
 return s+'</svg>';}
function openKontrole(){const T=s=>tr(s);const card=$('kontrole-card');if(!card)return;
 const nas=$('kontrole-naslov');if(nas)nas.textContent=T('Kontrole');
 card.innerHTML=`<p class="eyebrow">${T('DŽOJSTIK I TASTATURA')}</p><p class="kontrole-note">${T(padIndex!==null?'Pritisni dugme na džojstiku i ono će zasvetleti.':'Poveži džojstik: dugmad će svetleti dok ih pritiskaš.')}</p>${padSvg()}
  <div class="kontrole-cards">${KONTROLE_CARDS.map(([h,sub,rows])=>`<div class="kontrole-box"><h3>${T(h)}</h3>${sub?`<small>${T(sub)}</small>`:''}${rows.map(([k,a])=>`<p><kbd>${k}</kbd><span>${T(a)}</span></p>`).join('')}</div>`).join('')}</div>
  <details class="kontrole-keys"><summary>${T('Tastatura')}</summary><div>${KONTROLE_KEYS.map(([k,a])=>`<p><kbd>${k}</kbd><span>${T(a)}</span></p>`).join('')}</div></details>
  <button id="kontrole-close" class="text-button">${T('Zatvori')}</button>`;
 $('kontrole-close').onclick=()=>{$('kontrole').hidden=true;};$('kontrole').hidden=false;}
function markPad(g){const box=$('kontrole');if(!box||box.hidden)return;for(const el of box.querySelectorAll('[data-b]')){const i=+el.dataset.b,b=g.buttons[i];el.classList.toggle('on',!!b&&(b.pressed||b.value>.5));}
 for(const el of box.querySelectorAll('[data-stick]')){const a=+el.dataset.stick,cx=+el.getAttribute('cx');el.style.transform=`translate(${(g.axes[a]||0)*9}px,${(g.axes[a+1]||0)*9}px)`;}}
if(hasDom){$('kontrole-open')&&($('kontrole-open').onclick=openKontrole);$('pause-kontrole')&&($('pause-kontrole').onclick=openKontrole);}
// the pause screen says where Marko is and how the road has gone so far
function pauseInfo(){const gde=$('pauza-gde'),st=$('pauza-stanje');if(!gde||!st)return;
 gde.textContent=level?tr(level.name):tr(chapters[zone]?.name||'');st.textContent=`${tr('Na putu')} ${formatTime(elapsed)} · ${tr('savladano')} ${kills}`;}
function pollPads(){if(!hasDom||!navigator.getGamepads)return;const pads=navigator.getGamepads();const g=pads&&(pads[padIndex??-1]||[...pads].find(Boolean));if(!g){return;}if(padIndex===null)padConnected(g);markPad(g);
 const raw=i=>!!g.buttons[i]&&(g.buttons[i].pressed||g.buttons[i].value>.5),btn=i=>{const v=raw(i);if(padRest.has(i)){if(!v)padRest.delete(i);return false;}return v;},ax=g.axes[0]||0,ay=g.axes[1]||0;
 stickMag=btn(14)||btn(15)?1:Math.abs(ax);const left=btn(14)||ax<-.22,right=btn(15)||ax>.22,up=btn(12)||ay<-.55,down=btn(13)||ay>.55;
 const edge=(k,v)=>{const was=padPrev[k];padPrev[k]=v;return v&&!was;};
 const start=edge('start',btn(9));
 if($('intro')&&!$('intro').hidden){if(edge('ia',btn(0)))introNext();if(edge('ib',btn(1)))introEnd(true);return;}
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
const MUSA_OPEN=['open','staggered','stuck','dazed','unarmed'],MUSA_X0=28320,MUSA_X1=29680;
function musaWindow(mode,t,text,color){boss.mode=mode;boss.hop=0;boss.timer=t*(settings.difficulty==='story'?1.35:1);boss.windowMax=boss.timer;boss.combo=0;boss.comboBonus=false;if(text)label(text,boss.x,boss.y-235,color||'#d9f6c0');}
function bossAfterDamage(){const phase=boss.hp<=boss.maxHp/3?3:boss.hp<=boss.maxHp*2/3?2:1;
 if(phase>boss.phase){boss.phase=phase;boss.mode='kneel';boss.timer=1.5;boss.combo=0;slowMo=.9;hitstop=Math.max(hitstop,.12);fx('flash','#ffe0d0',.14);sfx('boom',{gain:1});shake=settings.reduced?0:10;rumble(.9,400);
  label('SRCE JE PUKLO!',boss.x,boss.y-240,'#ffb0a0');burst(boss.x,boss.y-90,'#cf798e',70,320);say(phase===2?'musa_phase2':'musa_phase3',{priority:3,x:boss.x,delay:.8});say('phase',{chance:.8,delay:3.2,priority:2});
  toast(phase===2?'Drugo srce · sad skače i zabija topuz u zemlju':'Treće srce · juriša kroz megdan i pušta talas',4);p.energy=100;}
 if(boss.hp<=0){boss.hp=1;startKostac();}}
function bossDamage(){if(!attackActive()||boss.hitIds.has(p.attackId)||Math.abs(p.x-boss.x)>150||Math.abs(p.y-(boss.y-(boss.hop||0)))>110||(boss.x-p.x)*p.face< -20)return;boss.hitIds.add(p.attackId);
 const open=MUSA_OPEN.includes(boss.mode);if(!open&&p.attackKind!=='super'){label('ČELIČNI GARD',boss.x,boss.y-170,'#c1ced4');sound('parry');fx('burst',boss.x-boss.face*-40,boss.y-80,'#dfe8ff',12,180);boss.blockT=.45;boss.blocks=(boss.blocks||0)+1;if(boss.blocks%3===0){p.vx=-p.face*420;label('ODGURNUO TE',p.x,p.y-160,'#ffb09a');sfx('hit_heavy',{gain:.6});}return;}
 boss.combo=(boss.combo||0)+1;const k=p.attackKind,base=k==='super'?240:k==='counter'?60:k==='uvis'||k==='juris'?62:k==='heavy'?58*chargeMult():35*(p.combo===2?1.8:1);
 let amount=base*(1+Math.min(boss.combo,6)*.07)*(p.buff>0?1.3:1)*(p.pow?.id==='oganj'?1.2:1);
 if(boss.combo===5&&!boss.comboBonus&&open){boss.comboBonus=true;amount+=70;boss.timer+=.7;label('JUNAČKI NIZ!',p.x,p.y-190,'#ffe39a');fx('flash','#ffd890',.08);sfx('ring',{gain:.9});rumble(.6,200);}
 boss.hp=Math.max(0,boss.hp-amount);boss.hurtT=.34;boss.knock=p.face*(k==='light'?5:12);blood(boss.x-p.face*10,boss.y-90,p.face,k==='heavy'?26:16);if(k!=='super')p.rage=Math.min(100,p.rage+18);
 boss.flash=.16;fx('hit',boss.x-p.face*10,boss.y-80,k!=='light');label(Math.round(amount)+(boss.combo>1?` ×${boss.combo}`:''),boss.x,boss.y-160,boss.combo>=5?'#ffe39a':'#fff0c8');sound('hit');shake=settings.reduced?0:5;hitstop=.05;rumble(.35,90);streakHit(boss);bossAfterDamage();}
function bossSwing(){if(Math.abs(p.x-boss.x)<165&&Math.abs(p.y-boss.y)<90){if(p.parry>0&&(boss.x-p.x)*p.face>=-15){musaWindow('staggered',2.6,'ZATETURAO SE!');fx('parry',p.x+p.face*40,p.y-75);burst(p.x,p.y-75,'#d3ffe5',40);p.rage=Math.min(100,p.rage+25);sound('parry');label('ODBIJENO',p.x,p.y-145,'#beffe3');startCounter(boss.x);p.energy=Math.min(100,p.energy+15);rumble(.5,150);return true;}damage(22,boss.face);}return false;}
function musaPick(){const n=boss.count=(boss.count||0)+1,d=Math.abs(p.x-boss.x),ph=boss.phase,story=settings.difficulty==='story';
 if(ph>=2&&rig?.['musa-throw-up']&&n%4===2){boss.mode='throwUp';boss.timer=1;sfx('cloth',{gain:.8,x:boss.x});label('!! TOPUZ U OBLAKE',boss.x,boss.y-235,'#ffb09a');say('musa_taunt',{chance:.5,x:boss.x});return;}
 if(ph>=2&&rig?.['musa-stomp']&&n%5===4){boss.mode='stompPrep';boss.timer=story?1:.75;label('!! TRESAK · SKOČI',boss.x,boss.y-235,'#ffb09a');return;}
 if(ph>=3&&n%3===0){boss.mode='chargePrep';boss.timer=story?1.1:.85;sfx('hoof',{gain:.9,x:boss.x});label('!! JURIŠ',boss.x,boss.y-235,'#ffb09a');return;}
 if(ph>=2&&(n%3===1||d>300)){boss.mode='leapPrep';boss.timer=story?.95:.7;sfx('cloth',{gain:.8,x:boss.x});label('!! SKOK',boss.x,boss.y-235,'#ffb09a');return;}
 if(ph===1&&n%2===0){boss.mode='slashPrep';boss.timer=story?1.2:.9;sfx('draw',{gain:.8,x:boss.x});label('!! SABLJA · SKOČI',boss.x,boss.y-235,'#ffb09a');return;}
 boss.mode='windup';boss.timer=story?1.3:.95;boss.double=ph>=2;sound('swing');}
function updateBoss(dt){if(zone!==5||!boss.alive)return;if(!boss.stage)musaStageStart();if(boss.stage==='joust'){joustStep(dt);return;}if(boss.stage==='kostac'){kostacStep(dt);return;}boss.hurtT=Math.max(0,(boss.hurtT||0)-dt);boss.moveT=Math.max(0,(boss.moveT||0)-dt);boss.flash=Math.max(0,boss.flash-dt);boss.knock=(boss.knock||0)*Math.pow(.001,dt);
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
 else if(m==='throwUp'&&boss.timer<=0){boss.mode='unarmed';boss.timer=2.6;boss.windowMax=2.6;boss.combo=0;boss.drop={x:p.x,t:1.9};sfx('whoosh_heavy',{gain:1,rate:.7,x:boss.x});label('BEZ TOPUZA · UDRI',boss.x,boss.y-235,'#d9f6c0');}
 else if(m==='unarmed'){const D2=boss.drop;if(D2){D2.t-=dt;if(D2.t>.6)D2.x+=(p.x-D2.x)*Math.min(1,dt*4);if(D2.t<=0){boss.drop=null;dust(D2.x,590,30,3);sfx('boom',{gain:1,x:D2.x});sfx('rock',{gain:1,x:D2.x});shake=settings.reduced?0:12;rumble(1,300);
   if(Math.abs(p.x-D2.x)<85&&p.y>380&&p.dash<=0)damage(24,Math.sign(p.x-D2.x)||1);for(const s of[-1,1])arrows.push({x:D2.x+s*40,y:574,vx:s*300,life:2,enemy:true,wave:true});}}
  if(boss.timer<=0){boss.mode='catch';boss.timer=.8;}}
 else if(m==='catch'&&boss.timer<=0){boss.mode='idle';boss.timer=.6;}
 else if(m==='stompPrep'&&boss.timer<=0){boss.mode='stomp';boss.timer=.5;dust(boss.x,boss.y,34,3.4);sfx('boom',{gain:1,rate:.8,x:boss.x});shake=settings.reduced?0:11;rumble(1,320);for(const s of[-1,1])arrows.push({x:boss.x+s*50,y:574,vx:s*360,life:3,enemy:true,wave:true});
  if(p.grounded&&Math.abs(p.x-boss.x)<230&&p.dash<=0){damage(14,Math.sign(p.x-boss.x)||1);label('TLO SE TRESE',p.x,p.y-160,'#ffb09a');}}
 else if(m==='stomp'&&boss.timer<=0)musaWindow('open',1.6,'OTVOREN GARD');
 else if(m==='slashPrep'&&boss.timer<=0){boss.mode='slash';boss.timer=.3;sfx('whoosh_heavy',{gain:1,x:boss.x});
  if(Math.abs(p.x-boss.x)<235&&p.y>boss.y-75&&p.dash<=0&&p.invuln<=0){if(p.parry>0&&(boss.x-p.x)*p.face>=-15){musaWindow('staggered',2.6,'ZATETURAO SE!');fx('parry',p.x+p.face*40,p.y-75);sound('parry');startCounter(boss.x);}else damage(24,boss.face);}}
 else if(m==='slash'&&boss.timer<=0)musaWindow('open',2.2,'OTVOREN GARD');
 else if(m==='kneel'&&boss.timer<=0){boss.mode='roar';boss.timer=1.5;fx('roar',boss.x,boss.y);burst(boss.x,boss.y-75,'#cf798e',60,300);}
 else if(m==='roar'&&boss.timer<=0){boss.mode='idle';boss.timer=.8;}
 boss.x=clamp(boss.x,MUSA_X0-20,MUSA_X1+20);}
function musaPose(){const m=boss.mode,story=settings.difficulty==='story';
 if(boss.stage==='joust'){if(boss.mounted&&rig?.['musa-mounted']){const near=m==='jRide'&&Math.sign(p.x-boss.x)===boss.dir&&Math.abs(p.x-boss.x)<280,S=rig['musa-mounted-strike'];
   if(near&&S)return{name:'musa-mounted-strike',frame:Math.min(S.frames.length-1,Math.floor((1-Math.abs(p.x-boss.x)/280)*S.frames.length))};const n=rig['musa-mounted'].frames.length;return{name:'musa-mounted',frame:m==='jRide'?Math.floor((boss.walk||0)/75)%n:0};}
  if(m==='jRide'&&rig?.['musa-run'])return{...locomotionPose({...boss,type:'musa'}),rot:boss.face*.1};}
 if(m==='slashPrep'||m==='slash'){const S=rig?.['musa-sword'];if(S){const n=S.frames.length,h=Math.ceil(n/2);return m==='slashPrep'?{name:'musa-sword',frame:Math.min(h-1,Math.floor((1-boss.timer/(story?1.2:.9))*h))}:{name:'musa-sword',frame:Math.min(n-1,h+Math.floor((1-boss.timer/.3)*(n-h)))};}
  return m==='slashPrep'?{name:'musa-attack',frame:1,sx:1.05}:{name:'musa-attack',frame:3,rot:boss.face*.08};}
 if(m==='grabPrep'||m==='grab'){const S=rig?.['musa-grab'];if(S){const n=S.frames.length;return{name:'musa-grab',frame:m==='grabPrep'?Math.min(2,Math.floor((1-boss.timer)*3)):Math.min(n-1,3+Math.floor((boss.grabT||0)*8)%Math.max(1,n-3))};}
  return{...locomotionPose({...boss,type:'musa'}),rot:boss.face*.16};}
 if(m==='windup')return{name:'musa-attack',frame:Math.min(2,Math.floor((1-boss.timer/(story?1.3:.95))*3))};
 if(m==='second')return{name:'musa-attack',frame:2};if(m==='swing')return{name:'musa-attack',frame:3};
 if(m==='open')return{name:'musa-attack',frame:4,sy:1+Math.sin(time*7)*.015};
 if(m==='stuck')return{name:'musa-attack',frame:4,dx:Math.sin(time*40)*2,sy:.97};
 if(m==='leapPrep')return{name:'musa-attack',frame:0,sy:.9,sx:1.06};
 if(m==='leap')return{name:'musa-attack',frame:boss.timer>.3?2:3,dy:-(boss.hop||0)};
 const clip=(name,a,b,k)=>{const n=rig[name].frames.length;return{name,frame:Math.min(n-1,Math.floor(a+(Math.min(b,n)-a)*clamp(k,0,.999)))};};
 boss.blockT=Math.max(0,(boss.blockT||0)-1/60);
 if(m==='throwUp'&&rig?.['musa-throw-up'])return clip('musa-throw-up',0,4,1-boss.timer);
 if(m==='unarmed'&&rig?.['musa-throw-up'])return{name:'musa-throw-up',frame:3,sy:1+Math.sin(time*7)*.012};
 if(m==='catch'&&rig?.['musa-throw-up'])return clip('musa-throw-up',4,8,1-boss.timer/.8);
 if(m==='stompPrep'&&rig?.['musa-stomp'])return clip('musa-stomp',0,3,1-boss.timer/(story?1:.75));
 if(m==='stomp'&&rig?.['musa-stomp'])return clip('musa-stomp',3,6,1-boss.timer/.5);
 if(m==='roar'&&rig?.['musa-roar'])return clip('musa-roar',0,6,1-boss.timer/1.5);
 if(boss.blockT>0&&rig?.['musa-block'])return clip('musa-block',0,6,1-boss.blockT/.45);
 if((m==='staggered'||m==='dazed'||m==='kneel')&&rig?.['musa-hurt'])return{name:'musa-hurt',frame:m==='kneel'?3:1+Math.floor(time*3)%2,dy:m==='kneel'?12:0,rot:m==='dazed'?Math.sin(time*3)*.05:0};
 if((m==='charge'||m==='chargePrep')&&rig?.['musa-run'])return{...locomotionPose({...boss,type:'musa'}),rot:boss.face*(m==='charge'?.12:.05),dx:m==='chargePrep'?Math.sin(time*30)*2:0};
 if(boss.hurtT>0&&rig?.['musa-hurt'])return{name:'musa-hurt',frame:Math.min(3,Math.floor((1-boss.hurtT/.34)*4))};
 if(boss.moveT>0&&rig?.['musa-run'])return locomotionPose({...boss,type:'musa'});
 if(rig?.['musa-idle'])return{name:'musa-idle',frame:idleFrame('musa',0),...(m==='roar'?{dx:(Math.random()-.5)*5,sy:1.03}:{})};
 return{name:'cast/musa',frame:0,sy:1+Math.sin(time*2)*.014};}
// ================= Musa as in the song: lances on horseback, sabres, maces, then hand to hand and the hidden knife =================
let joustDone=false;
function musaStageStart(){boss.stage=joustDone?'duel':'joust';if(boss.stage!=='joust')return;
 Object.assign(boss,{mode:'jWait',timer:2.6,x:MUSA_X1-40,face:-1,jHits:0,jPass:0,mounted:true,walk:0});
 horseMounted=true;horseCompleted=true;p.mountTime=.55;sfx('hoof',{gain:.8});sfx('horn_call',{gain:.6,delay:.6});say('musa_joust',{priority:4,x:boss.x,delay:.8});
 toast('MEGDAN KOPLJIMA · J kad prolazi · Space preskače koplje',4);}
function joustHit(text){boss.jHits++;boss.hp=Math.max(1,boss.hp-110);boss.flash=.2;boss.hurtT=.34;boss.knock=p.face*10;fx('hit',boss.x,boss.y-150,true);blood(boss.x,boss.y-140,p.face,22);sound('hit');sfx('hit_armor',{gain:.8});label(text,boss.x,boss.y-250,'#ffe39a');hitstop=.08;shake=settings.reduced?0:7;rumble(.6,180);say('mounted',{chance:.6,delay:.2});}
function joustStep(dt){const m=boss.mode;boss.timer-=dt;boss.flash=Math.max(0,boss.flash-dt);boss.hurtT=Math.max(0,(boss.hurtT||0)-dt);boss.knock=(boss.knock||0)*Math.pow(.001,dt);
 if(!horseMounted&&boss.mounted&&mode==='play'){horseMounted=true;p.mountTime=.4;}
 p.x=clamp(p.x,MUSA_X0-140,MUSA_X1+60);   // always inside his ride, so every charge passes Marko
 if(m==='jWait'){boss.face=p.x>boss.x?1:-1;if(boss.timer<=0){boss.mode='jRide';boss.dir=boss.face;boss.passed=false;sfx('horn_call',{gain:.7});label('!! KOPLJE',boss.x,boss.y-260,'#ffb09a');}}
 else if(m==='jRide'){const v=470;boss.x+=boss.dir*v*dt;boss.walk=(boss.walk||0)+v*dt;boss.face=boss.dir;if(Math.random()<.45)dust(boss.x-boss.dir*70,boss.y,2,1.7);if(Math.random()<dt*7)sfx('hoof',{gain:.55,x:boss.x});
  const dx=p.x-boss.x;
  if(!boss.passed&&Math.abs(dx)<170&&Math.abs(p.y-boss.y)<150){
   if(attackActive()&&p.face===-boss.dir){boss.passed=true;joustHit('POGODAK!');}
   else if(!p.grounded&&p.y<boss.y-55){boss.passed=true;label('PRESKOČIO KOPLJE',p.x,p.y-170,'#e9ffe0');sfx('whoosh_heavy',{gain:.7});}
   else if(Math.abs(dx)<70){boss.passed=true;damage(20,boss.dir);label('KOPLJE!',p.x,p.y-170,'#ffb09a');sfx('hit_armor',{gain:.9});}}
  if(boss.dir>0?boss.x>=MUSA_X1+110:boss.x<=MUSA_X0-190){boss.mode='jTurn';boss.timer=1.4;boss.jPass++;boss.turnHit=false;label('OKREĆE KONJA · UDRI',boss.x,boss.y-260,'#d9f6c0');}}
 else if(m==='jTurn'){boss.face=-boss.dir;
  if(!boss.turnHit&&attackActive()&&Math.abs(p.x-boss.x)<175&&Math.abs(p.y-boss.y)<150){boss.turnHit=true;joustHit('S LEĐA!');}
  if(boss.timer<=0){if(boss.jHits>=3||boss.jPass>=5)joustEnd();else{boss.mode='jRide';boss.dir=-boss.dir;boss.passed=false;sfx('horn_call',{gain:.6,rate:1.2});label('!! KOPLJE',boss.x,boss.y-260,'#ffb09a');}}}
 else if(m==='jBreak'&&boss.timer<=0){boss.stage='duel';boss.mode='idle';boss.timer=1;}}
function joustEnd(){joustDone=true;boss.mounted=false;boss.mode='jBreak';boss.timer=2.4;boss.x=clamp(boss.x,MUSA_X0+60,MUSA_X1-60);burst(boss.x,boss.y-150,'#c8a070',34,260,'dust');dust(boss.x,boss.y,26,3);sfx('boom',{gain:.7,x:boss.x});sfx('rock',{gain:.6});
 label('KOPLJA SU POLOMLJENA',boss.x,boss.y-270,'#ffe39a');say('musa_sword',{priority:4,x:boss.x,delay:.5});horseMounted=false;horseX=clamp(p.x-p.face*150,28080,29800);p.vy=-320;p.grounded=false;dust(p.x,p.y,16,2);toast('Sjahali ste. Sad sablje, pa topuzi.',3);}
// the last heart broken, he grapples: he throws Marko down and sits on his chest, Marko's strength leaves him,
// Ravijojla calls from the cloud, Musa looks up — and Marko draws the hidden knife
function startKostac(){if(boss.stage==='kostac')return;boss.stage='kostac';boss.hp=1;boss.mode='grabPrep';boss.timer=1;boss.look=false;boss.vila=false;boss.saidPinned=false;slowMo=.6;arrows=arrows.filter(a=>!a.enemy);
 fx('flash','#fff2d0',.2);say('musa_kostac',{priority:5,x:boss.x});label('!! U KOŠTAC',boss.x,boss.y-260,'#ffb09a');toast('Polomiše se i sablje i topuzi. U koštac!',3);}
function kostacStep(dt){const m=boss.mode;boss.timer-=dt;boss.flash=Math.max(0,boss.flash-dt);boss.shakeT=Math.max(0,(boss.shakeT||0)-dt);
 if(m==='grabPrep'){boss.face=p.x>boss.x?1:-1;if(boss.timer<=0){boss.mode='grab';boss.grabT=0;sfx('whoosh_heavy',{gain:1,x:boss.x});}}
 else if(m==='grab'){boss.grabT+=dt;const dx=p.x-boss.x;boss.face=dx>0?1:-1;boss.x+=Math.sign(dx)*Math.min(Math.abs(dx),560*dt);boss.walk=(boss.walk||0)+560*dt;
  if(Math.abs(p.x-boss.x)<70||boss.grabT>2.5){boss.mode='pin';boss.pinT=0;boss.x=p.x+boss.face*12;Object.assign(p,{pinned:true,vx:0,attack:0,spin:0,rage:0,energy:0,buff:0,face:-boss.face});horseMounted=false;
   shake=settings.reduced?0:12;rumble(1,400);sfx('fall',{gain:1});sfx('hit_body',{gain:1,rate:.7});dust(p.x,p.y,30,3);say('musa_pin',{priority:6,x:boss.x,delay:.3});toast('Musa obori Marka. Snaga ga napušta.',4);}}
 else if(m==='pin'){boss.pinT+=dt;p.hp=Math.max(1,p.hp-3*dt);
  if(tap('KeyJ')||tap('KeyK')||tap('Space')){boss.shakeT=.14;sfx('cloth',{gain:.5});}
  if(boss.pinT>2.4&&!boss.saidPinned){boss.saidPinned=true;say('pinned',{priority:6});}
  if(boss.pinT>5&&!boss.vila){boss.vila=true;boss.vilaAt=boss.pinT;fairy={x:boss.x-70,y:boss.y-300,age:0,duration:16,kind:'hover',targetX:boss.x-70,targetY:boss.y-290};burst(boss.x-70,boss.y-300,'#caffdf',40,140);sound('magic');say('vila_kostac',{priority:6,x:boss.x});}
  const vilaLen=SND.buf['voice/vila_kostac']?.duration||7;
  if(boss.vila&&!boss.look&&boss.pinT>boss.vilaAt+vilaLen+.3){boss.look=true;say('musa_look',{priority:6,x:boss.x});label('MUSA SE OSVRNU KA VILI',boss.x,boss.y-250,'#d9f6c0');}
  if(boss.look&&boss.pinT>boss.vilaAt+vilaLen+.9&&(tap('KeyE')||tap('KeyJ')||tap('KeyK')||isDown('KeyE','KeyJ','KeyK'))){boss.mode='noz';boss.timer=1.7;say('noz',{priority:7});sfx('draw',{gain:1});sfx('whoosh_heavy',{gain:.8,delay:.25});}}
 else if(m==='noz'){if(boss.timer<1&&!boss.stabbed){boss.stabbed=true;blood(boss.x,boss.y-90,boss.face,60);fx('hit',boss.x,boss.y-90,true);sound('hit');hitstop=.18;slowMo=1;shake=settings.reduced?0:10;fx('flash','#ffe0d0',.16);}
  if(boss.timer<=0){p.pinned=false;p.attack=0;p.attackKind='light';p.down=1;win();}}}
function drawKostac(){const x=boss.x,y=boss.y,f=boss.face,sh=boss.shakeT>0?(Math.random()-.5)*6:0;shadow(x,y,96,.6);
 if(boss.mode==='noz'&&rig?.['megdan-noz']){const n=rig['megdan-noz'].frames.length;rigDraw('megdan-noz',Math.min(n-1,Math.floor((1-boss.timer/1.7)*n)),x,y,-f,{});}
 else if(rig?.['megdan-kostac']){const n=rig['megdan-kostac'].frames.length;rigDraw('megdan-kostac',Math.floor(time*(boss.shakeT>0?14:7))%n,x+sh,y,-f,{});}
 else{const lie=rig?.['marko-knockdown'];if(lie)rigDraw('marko-knockdown',lie.frames.length-1,p.x-f*20+sh,p.y,-f,{});
  if(boss.mode==='noz'){const k=clamp(1-boss.timer/1.7,0,1);rigDraw(rig?.['musa-hurt']?'musa-hurt':'cast/musa',rig?.['musa-hurt']?Math.min(3,Math.floor(k*4)):0,x+f*k*60,y,f,{rot:f*k*.5,dy:-8});}
  else rigDraw(rig?.['musa-hurt']?'musa-hurt':'cast/musa',rig?.['musa-hurt']?3:0,x+sh,y,f,{dy:14,rot:boss.look?-f*.12:0});}
 if(boss.mode==='pin'){ctx.save();ctx.globalAlpha=.25+.1*Math.sin(time*3);ctx.fillStyle='#200808';ctx.fillRect(camera-50,camY-50,VIEW_W+100,900);ctx.restore();
  const vilaLen=SND.buf['voice/vila_kostac']?.duration||7;
  if(boss.look&&boss.pinT>boss.vilaAt+vilaLen+.9){textLabel('E · NOŽ ZATAJAC',x,y-230,{font:'bold 22px Georgia',color:'#fff3c0',glow:'#ff6a3a'});halo(x,y-238,60,'rgba(255,120,60,.6)');}
  else textLabel('OTIMAJ SE · J',x,y-220,{font:'bold 16px Georgia',color:'#ffd8c8',glow:'#a03020'});}}
function drawMaceDrop(){const D2=boss.drop;if(!D2)return;const k=clamp(1-D2.t/1.9,0,1);ctx.save();ctx.globalAlpha=.25+.45*k;ellipse(D2.x,592,30+40*k,7+5*k,'#1a0606');ctx.restore();if(D2.t<.6)textLabel('!',D2.x,560,{font:'bold 26px Georgia',color:'#ffdf9c',glow:'#ff6a3a'});
 if(D2.t<.45){const y=590-D2.t/.45*760;line(D2.x,y-70,D2.x,y-10,'#4a3420',6);ellipse(D2.x,y,17,17,'#5a5a60');for(let i=0;i<8;i++){const a=i*Math.PI/4+time*9;line(D2.x+Math.cos(a)*15,y+Math.sin(a)*15,D2.x+Math.cos(a)*25,y+Math.sin(a)*25,'#b0b4ba',3);}}}
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
 $('map-detail').innerHTML=`<div class="vista" style="background-image:url(${vistaFile(L)})"></div><div class="info"><p class="eyebrow">POHOD ${i+1}${L.id==='rusevine'?' · PENJANJE':''}${CUDA.some(c=>c.land===L.id)?' · ČUDO':''}</p><h3>${L.name}</h3><div class="stars">${starText(L)}<small>pređen · slova МАРКО · čudo iz pesme</small></div>${i===MUSA_AFTER?'<p><i>Posle megdana Musa ostavi Marka ranjenog. Ravijojla ga vida, a pesma o megdanu već ide od usta do usta.</i></p>':i===MUSA_AFTER-1?'<p><i>Ovaj prevoj vodi na Kačanik. Posle njega čeka megdan sa Musom.</i></p>':''}<p>${LEVEL_INTRO[L.id]||L.design?.goal||''}</p>${k?`<p class="reward">Nagrada: ${k.name} — ${k.text}</p>`:''}${open?`<button class="primary" data-start="${i}">Kreni u pohod <span>→</span></button>`:'<p>🔒 Prvo pređi prethodni pohod.</p>'}</div>`;
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
function kacanikWon(){try{return localStorage.getItem('marko-kacanik')==='won';}catch{return false;}}
function markChapter(n){try{if(n>storyReached())localStorage.setItem('marko-chapter',String(n));}catch{}}
function startChapter(n){start(false);storySeen=new Set(['0','1','2','3','4','5'].filter(k=>+k<n));if(n>=4)enterChapter(4);if(n>0&&n!==4)enterChapter(n);if(n===0){const [num,name]=chapters[0].name.split(' · ');showTitle(`POGLAVLJE ${num}`,name.charAt(0)+name.slice(1).toLowerCase(),chapters[0].goal);}}
const STORY_POS=[[9,80],[24,60],[39,74],[54,50],[70,64],[87,38]];
let mapTab=null;
function openLevels(tab){if(typeof tab!=='string')tab=null;mapTab=tab||mapTab||'pohodi';if(mapTab==='prica'&&!musaOpen())mapTab='pohodi';const v=levelVariant,story=mapTab==='prica';
 const tabs=`<button data-tab="pohodi" class="${story?'':'on'}">Pesma o Marku <small>13 pohoda</small></button><button data-tab="prica" class="${story?'on':''}" ${musaOpen()?'':'disabled'}>Megdan na Kačaniku <small>${musaOpen()?'6 poglavlja':'🔒 posle Zimskog prevoja'}</small></button>`;
 $('level-variants').innerHTML=tabs+(story?'':`<span class="variants">${Object.entries(VARIANTS).map(([k,o])=>`<button data-variant="${k}" class="${k===v?'on':''}">${o.icon} ${o.label}</button>`).join('')}</span>`);
 $('level-variants').querySelectorAll?.('[data-tab]').forEach(b=>b.onclick=()=>openLevels(b.dataset.tab));
 $('level-variants').querySelectorAll?.('[data-variant]').forEach(b=>b.onclick=()=>{levelVariant=b.dataset.variant;try{localStorage.setItem('marko-variant',levelVariant);}catch{}openLevels();});
 $('levels-order').innerHTML=story?'Megdan na Kačaniku: <b>šest poglavlja jedno za drugim</b> — konj je u IV, talasi u II i V, Musa u VI. Kad Musa padne, otvaraju se poslednja četiri pohoda.':'Redosled: <b>pohodi idu kako teče Markov život</b>, i svaki donosi jednu veštinu (piše „Nagrada”). Posle devetog pohoda čeka megdan sa Musom na Kačaniku.';
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

// ================= the song in order: Marko's life from the village to the river, with Musa in the middle =================
// The pohodi follow the songs as his life goes: the horse, the judgment, the plough, his father's sabre, the wine, the
// falcon, the vila, and the frozen pass that leads to Kačanik. There the six chapters of the duel with Musa are fought.
// After Musa come the gorge (Đemo, Musa's brother, comes for revenge), the Arab's tower, the mine and the river.
function musaOpen(){return DEV||kacanikWon()||!!LEVELS[MUSA_AFTER-1]&&levelStars(LEVELS[MUSA_AFTER-1]).done;}
function journeyNext(){const i=LEVELS.findIndex(L=>!levelStars(L).done);if(!kacanikWon()&&(i<0||i>=MUSA_AFTER))return{musa:true};return i<0?null:{i};}
function journeyBegun(){return levelsDone().length>0||!!saveState||kacanikWon();}
function startJourney(){saveState=null;storySeen=new Set();try{localStorage.removeItem('marko-save');}catch{}playStory('pocetak',()=>startLevel(0));}
function startMusa(){if(saveState&&!kacanikWon()){start(true);return;}if(storyReached()>0&&!kacanikWon()){startChapter(storyReached());return;}playIntro(()=>{saveState=null;storySeen=new Set([...storySeen].filter(k=>k.startsWith('pohod-')||k==='pocetak'));try{localStorage.removeItem('marko-save');}catch{}start();save();});}
// ================= pack 07: depth — cooldowns and a charge meter, weak points, puzzles, pogo, combos, a fuller land =================
// ---------- abilities on cooldown, shown in a bar at the bottom ----------
const CD={throw:2.5,uvis:1.2,juris:3,plunge:1.1};
const ABILITIES=[
 {id:'bacanje',key:'I',pad:'RB',name:'Bačeni topuz',cd:'throw',icon:'KeyI',grp:1},
 {id:'uvis',key:'S+K',pad:'↓+Y',name:'Aperkat',cd:'uvis',icon:'up'},
 {id:'juris',key:'⇧→J',pad:'B→X',name:'Juriš',cd:'juris',icon:'dash'},
 {id:'nadole',key:'S+J',pad:'↓+X',name:'Udar nadole',cd:'plunge',icon:'down'},
 {id:'kolut',key:'⇧',pad:'B',name:'Kolut',cdv:()=>p.dashCooldown/.85,cds:()=>p.dashCooldown,icon:'ShiftLeft'},
 {id:'vihor',key:'F',pad:'L3',name:'Vihor',res:()=>p.rage/SPIN_MIN,icon:'KeyF',grp:2},
 {id:'junacki',key:'R',pad:'R3',name:'Junački udar',res:()=>p.rage/100,icon:'KeyR'},
 {id:'vila',key:'E',pad:'RT',name:'Ravijojla',res:()=>p.energy/35,icon:'KeyE',grp:3}];
const AB_ICON={up:'<path d="M12 20V6M6 11l6-6 6 6"/><circle cx="12" cy="20" r="2.4" fill="currentColor"/>',dash:'<path d="M3 12h13M12 7l5 5-5 5"/><path d="M4 7h5M4 17h5" opacity=".5"/>',down:'<path d="M12 3v13M6 11l6 6 6-6"/><path d="M5 21h14"/>'};
function cdReady(k){return!(p.cd?.[k]>0);}
function cdStart(k){p.cd??={};p.cd[k]=CD[k]*(k==='juris'&&perks.has('prelomljeno-koplje')?.6:1);}
function cdDenied(k){p.cdFlash=k;p.cdFlashT=.35;sfx('cloth',{gain:.3,rate:.6});}
let abBuilt=false,abTick=0;
function abilityBar(dt){const el=$('abilities');if(!el||!p)return;if(mode!=='play'){el.hidden=true;return;}el.hidden=false;
 if(!abBuilt&&hasDom){abBuilt=true;el.innerHTML=ABILITIES.map(a=>`${a.grp>1?'<i class="ab-sep"></i>':''}<div class="ab" data-ab="${a.id}" title="${tr(a.name)}"><svg viewBox="0 0 24 24">${AB_ICON[a.icon]||TOUCH_ICONS[a.icon]||''}</svg><img src="assets/world/ikona-${a.id}.webp" alt="" onerror="this.remove()"><i class="cd"></i><i class="ring"></i><span class="left"></span><b class="key"></b></div>`).join('');}
 if((abTick-=dt)>0)return;abTick=.08;const pad=padIndex!==null;
 for(const a of ABILITIES){const d=el.querySelector?.(`[data-ab="${a.id}"]`);if(!d)continue;const owned=a.id==='uvis'||has(a.id);d.hidden=!owned;if(!owned)continue;
  // cooldowns: a dark sweep that empties and the seconds left; rage and the fairy's strength: a ring that fills, with its percent
  let left=0,full=true,secs=0,res=null;if(a.cd){secs=p.cd?.[a.cd]||0;left=secs/CD[a.cd];}else if(a.cdv){left=clamp(a.cdv(),0,1);secs=a.cds?.()||0;}else if(a.res){res=clamp(a.res(),0,1);full=res>=1;}
  d.style.setProperty('--p',clamp(left,0,1).toFixed(3));d.style.setProperty('--r',res===null?'1':res.toFixed(3));d.classList.toggle('res',res!==null);d.classList.toggle('ready',left<=.001&&full);d.classList.toggle('cooling',left>.001);
  d.classList.toggle('denied',p.cdFlash===(a.cd||a.id)&&p.cdFlashT>0);d.querySelector('.left').textContent=left>.001?(secs<3?secs.toFixed(1):Math.ceil(secs)):res!==null&&!full?Math.floor(res*100)+'%':'';
  const k=d.querySelector('.key'),label=pad?a.pad:a.key;if(k.textContent!==label){k.textContent=label;k.dataset.pad=pad?label.replace(/[^ABXY]/g,'').slice(-1):'';}}}
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
function foeDefense(e,heavy){if(e.kit&&e.engaged){const m=KITS[e.kit]?.def?.(e,heavy);if(m!=null)return m;}const k=p.attackKind,front=(e.x-p.x)*p.face>0&&e.face!==p.face,breaker=heavy||k==='lomilac'||k==='uvis'||k==='juris';
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
function updatePuzzles(dt){updateKeyDoors();updateTents(dt);updateMindPuzzles(dt);
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
 for(const e of world.enemies){if(!e.alive||e.zone!==zone)continue;if(Math.abs(e.x-p.x)<42&&p.y>e.y-118&&p.y<e.y-40&&p.vy>0){plungeOnFoe(e);return;}}}
// S+J onto a foe: a heavy blow from above that floors him, and Marko comes down beside him. It used to bounce Marko up again,
// so he could stay on a champion's head striking him forever. A champion throws him off instead.
function plungeOnFoe(e){p.plunge=0;p.attack=0;p.grounded=false;const side=Math.sign(p.x-e.x)||-p.face;
 if(e.champion){const amount=26*(p.power||1);e.hp-=amount;e.flash=.15;champStagger(e,true);label(Math.round(amount),e.x,e.y-130);blood(e.x,e.y-90,p.face,8);p.vy=-330;p.vx=side*460;p.pogoT=.15;label('ZBACIO TE!',p.x,p.y-150,'#ff9a7a');sfx('clang',{gain:.7,rate:.9});fx('burst',e.x,e.y-110,'#ffd0c0',12,180);streakHit(e);if(e.hp<=0)slay(e);return;}
 const amount=64*(p.power||1);e.hp-=amount;e.flash=.15;e.stun=Math.max(e.stun,1.4);e.mode='stun';e.knock=-side*10;label(Math.round(amount),e.x,e.y-130);blood(e.x,e.y-90,p.face,14);if(e.type==='oklopnik'){e.armor=Math.max(0,(e.armor??3)-1);}if(e.type==='akindzija')weakHit('OBOREN!');
 p.vy=-240;p.vx=side*300;p.pogoT=.15;burst(e.x,e.y-110,'#ffd0c0',16,200);sfx('boom',{gain:.55});sfx('hit_heavy',{gain:.7,x:e.x});dust(e.x,e.y,10,1.4);shake=settings.reduced?0:6;rumble(.45,120);label('ODOZGO!',e.x,e.y-170,'#ffe39a');streakHit(e);if(e.hp<=0)slay(e);}
function bounce(x,y,color){p.plunge=0;p.vy=-680;p.grounded=false;p.attack=0;p.pogoT=.15;burst(x,y,color,16,200);sfx('clang',{gain:.7,rate:1.3});dust(x,y,6,1);label('ODSKOK',x,y-30,'#fff0c8');rumble(.3,80);}
function drawPuzzles(){drawMindPuzzles();if(p?.hang&&p.ledgeT>0)textLabel('W · POPNI SE     S · PUSTI',p.x,p.y-160,{font:'bold 11px Georgia',color:'#fff0c8',glow:'#ffd27a'});for(const t of world.traps||[]){if(t.kind==='keydoor'){drawKeyDoor(t);continue;}if(t.kind==='tent'){drawTent(t);continue;}
 if(t.kind==='plate'){if(t.x>camera+VIEW_W+100||t.x+t.w<camera-100)continue;const down=t.pressed?4:0,im=levelArt[t.pressed?'ploca-pritisak-stisnuta':'ploca-pritisak'];
  if(im){const b=propBounds(im),h=b.h*t.w/b.w;ctx.drawImage(im,b.x,b.y,b.w,b.h,t.x,t.y-h+10,t.w,h);}else{ctx.fillStyle='#4a4640';ctx.fillRect(t.x-4,t.y-2,t.w+8,8);ctx.fillStyle=t.pressed?'#8a7a5a':'#b8a98a';ctx.fillRect(t.x,t.y-10+down,t.w,10-down);line(t.x,t.y-10+down,t.x+t.w,t.y-10+down,'rgba(255,240,200,.6)',2);}
  textLabel('ᛟ',t.x+t.w/2,t.y-12+down,{font:'bold 12px Georgia',color:t.pressed?'#9dffb0':'#e8d6a8',glow:t.pressed?'#4aff8a':null});
  drawVaultDoor(t);
  if(Math.abs(p.x-t.gate.x)<520)textLabel(t.open>0?(t.emptied?'ISPRAŽNJENA':'W · UĐI'):'PLOČA OTVARA VRATA',t.gate.x,t.gate.y-300,{font:'bold 13px Georgia',color:t.open>0?'#d9ffe0':'#fff0c8',glow:t.open>0?'#4aff8a':'#ffd27a'});}
 if(t.kind==='lift'&&t.q){const q=t.q,cx=q.x+q.w/2;line(t.x-20,q.top-150,t.x+150,q.top-150,'#3a2614',12);{const ko=levelArt['kotur'];if(ko){const b=propBounds(ko),k=64/Math.max(b.w,b.h);ctx.drawImage(ko,b.x,b.y,b.w,b.h,cx-b.w*k/2,q.top-150-b.h*k/2,b.w*k,b.h*k);}else{ellipse(cx,q.top-150,18,18,'#6a4426');ellipse(cx,q.top-150,6,6,'#2a1a0c');}}for(const dx of[-44,44])line(cx+dx*.3,q.top-150,cx+dx,q.y,'#5a5a5a',3);
  const la=levelArt['lift-platforma'];if(la){const b=propBounds(la),h=b.h*(q.w+20)/b.w;ctx.drawImage(la,b.x,b.y,b.w,b.h,q.x-10,q.y-h*.55,q.w+20,h);}else{ctx.fillStyle='#7a5530';ctx.fillRect(q.x,q.y,q.w,16);}for(let x=q.x+16;x<q.x+q.w&&!la;x+=24)line(x,q.y+1,x,q.y+15,'rgba(30,20,10,.6)',2);line(q.x,q.y+1,q.x+q.w,q.y+1,'rgba(255,226,170,.5)',2);line(q.x,q.y+16,q.x+q.w,q.y+16,'#3a2614',3);
  const lv=levelArt[q.state==='down'||q.state==='down-idle'?'cilj-poluga':'cilj-poluga-povucena'];if(lv){const b=propBounds(lv),h=110,w=b.w*h/b.h;ctx.drawImage(lv,b.x,b.y,b.w,b.h,t.lever.x-w/2,t.lever.y-h+6,w,h);}
  if((q.state==='down-idle'||q.state==='down')&&Math.abs(p.x-t.lever.x)<260&&q.y===q.base)textLabel('E · POKRENI LIFT',t.lever.x,t.lever.y-130,{font:'bold 12px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
}
 for(const q of world.platforms){
  if(q.kind==='teret'&&!q.keg){const im=levelArt['teret-sanduk']||levelArt['razbi-sanduk']||levelArt['prop-sanduci'];if(im){const b=propBounds(im);ctx.drawImage(im,b.x,b.y,b.w,b.h,q.x-4,q.y-4,q.w+8,q.h+8);if(!levelArt['teret-sanduk']){ctx.fillStyle='rgba(40,44,50,.35)';ctx.fillRect(q.x,q.y,q.w,q.h);for(const y of[q.y+12,q.y+q.h-16])line(q.x,y,q.x+q.w,y,'#3a3c40',5);}}else{ctx.fillStyle='#6a4a2a';ctx.fillRect(q.x,q.y,q.w,q.h);}
   if(!q.locked&&Math.abs(p.x-(q.x+q.w/2))<220&&Math.abs(p.y-(q.y+q.h))<20&&!p.pushing)textLabel('GURAJ →',q.x+q.w/2,q.y-18,{font:'bold 11px Georgia',color:'#fff0c8',glow:'#ffd27a'});}
  if(q.kind==='cracked'&&!q.off){const G=levelGround();if(G){const S=G.S;ctx.save();ctx.beginPath();ctx.rect(q.x,q.y-G.walk*S,q.w,(G.walk+60)*S);ctx.clip();G.pattern.setTransform(new DOMMatrix([S,0,0,S,0,q.y-G.walk*S]));ctx.fillStyle=G.pattern;ctx.fillRect(q.x,q.y-G.walk*S,q.w,(G.walk+60)*S);ctx.restore();}else{ctx.fillStyle='#8a8070';ctx.fillRect(q.x,q.y,q.w,q.h);}
   ctx.strokeStyle='rgba(20,14,10,.85)';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(q.x+20,q.y+2);ctx.lineTo(q.x+44,q.y+14);ctx.lineTo(q.x+38,q.y+28);ctx.moveTo(q.x+44,q.y+14);ctx.lineTo(q.x+76,q.y+8);ctx.lineTo(q.x+98,q.y+22);ctx.moveTo(q.x+76,q.y+8);ctx.lineTo(q.x+84,q.y+30);ctx.stroke();{const pa=levelArt['pod-napukao'];if(pa){const b=propBounds(pa),h=b.h*(q.w+16)/b.w;ctx.drawImage(pa,b.x,b.y,b.w,b.h,q.x-8,q.y-h*.6,q.w+16,h);}}}
  if(q.lintel)drawLintel(q);if(q.kind==='raft'){const im=levelArt['splav']||levelArt['prop-balvan'];const bob=Math.sin(time*2+q.x*.01)*2,sk=worldImg('skela');
   // Codex's ferry: the planks (art y 363, x 124-984) at the platform top
   if(sk){const k=(q.w+10)/860;ctx.drawImage(sk,0,0,1024,512,q.x-5-124*k,q.y-363*k+4+bob,1024*k,512*k);}else if(im&&levelArt['splav']){const b=propBounds(im),k=(q.w+10)/(b.w*.852);ctx.drawImage(im,b.x,b.y,b.w,b.h,q.x-5-b.w*.016*k,q.y-b.h*.78*k+6+bob,b.w*k,b.h*k);}else if(im){const b=propBounds(im);ctx.drawImage(im,b.x,b.y,b.w,b.h,q.x-8,q.y-6+bob,q.w+16,Math.max(26,b.h*(q.w+16)/b.w*.6));}else{ctx.fillStyle='#7a5530';ctx.fillRect(q.x,q.y+bob,q.w,18);}}}}
// ---------- combos ----------
function comboName(text){label(text,p.x,p.y-200,'#ffe39a');sfx('ring',{gain:.7,rate:1.5});}
// J, J, K inside the combo window: the Lomilac — a crushing finisher
function tryLomilac(){if(!has('niz')||!(p.comboWindow>0)||p.combo!==1)return false;p.attack=.56;p.attackKind='lomilac';p.cooldown=.7;p.attackId=++attackSerial;p.charge=0;p.chargeable=false;sound('swing');sayGrunt(true);comboName('LOMILAC!');p.comboWindow=0;return true;}
function airHit(e){if(p.grounded)return;if(e.champion){p.airHits=(p.airHits||0)+1;return;}p.vy=Math.min(p.vy,perks.has('sokolovo-pero')?-215:-140);p.airHits=(p.airHits||0)+1;if(e.champion||e.grounded)return;
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
const DECOR_H={'prop-most-drveni':330,'prop-most-uzad':340,'prop-dok':240,'prop-platforma-sneg':240,'prop-lanac':140,'prop-loza':130,'prop-medjas':70,'prop-kruska':300,'prop-krst-raskrsce':190,'prop-turski-sator':240,'prop-kuca':430,'prop-ambar':230,'prop-bunar':170,'prop-kola':120,'prop-taraba-ravna':110,'prop-taraba-slomljena':100,'prop-ograda-pleter':90,'prop-seno':120,'prop-snopovi':90,'prop-krcag':55,'prop-bure':70,'prop-sanduci':80,'prop-dzakovi':60,'prop-drvo-hrast':330,'prop-drvo-bukva':340,'prop-drvo-jela':330,'prop-drvo-sneg':300,'prop-panj':60,'prop-svetiliste':200,'prop-run-kamen':120,'prop-cvece':50,'prop-paprat':60,'prop-pecurke':40,'prop-korenje':130,'prop-zbun':70,'prop-stena-visoka':260,'prop-stena-luk':260,'prop-stena-mala':70,'prop-trska':110,'prop-trava':40,'prop-kamen-putokaz':110,'prop-stub-kameni':220,'prop-luk-kameni':240,'prop-svetiljka':150,'prop-klupa':50,'prop-stol':60,'prop-palisada':150,'prop-sator':240,'prop-strassarnica':340,'prop-kapija-tvrdjava':300,'prop-katapult':150,'prop-nakovanj':50,'prop-baklja-drzac':110,'prop-ognjiste':60,'prop-led':90,'prop-kristal':90,'prop-potpora-rudnik':220,'prop-vagon':90,'prop-sine':40,'prop-mlin':440,'prop-tocak-vodeni':220,'prop-susara':140,'prop-ograda-manastir':110,'prop-barjak-manastir':175,'prop-ograda-kamen-rusevina':110,'prop-vrata-slomljena':170,'prop-balvan':60,'prop-plast-sena':150,'prop-kola-seno':170};
const decorIds=L=>DECOR[L.id]||[];
// ---------- stakes on the hill behind the road (DOPUNA-34): Serbian knights the Ottoman army left as a warning ----------
// They are drawn behind the road and drift slower than it, so they stand on a hill further back. The bottom of their own hill
// (the lowest fifth of Codex's picture) hides behind the road, so they never float. Only while blood is on in the settings.
const KOLCI_LANDS=['selo','klisura','tvrdjava','rusevine','reka','oranje','mocvara'],KOLCI=[['kolci-vitezovi-glave',245],['kolac-vitez',230],['kolci-vitezovi-red',200]],KOLCI_PAR=.8,KOLCI_EDGE=500;
const kolciIds=L=>KOLCI_LANDS.includes(L.id)&&settings.gore!==false?KOLCI.map(k=>k[0]):[];
function setupKolci(){world.kolci=[];if(!level||!hasDom||!KOLCI_LANDS.includes(level.id))return;const art=KOLCI.filter(([id])=>levelArt[id]);if(!art.length)return;
 const grounds=world.platforms.filter(q=>q.ground&&!q.tower&&q.w>KOLCI_EDGE*2+200),span=level.goal.x-level.spawn.x;let n=0;
 // not behind a tower, a gatehouse or the last banner, which would hide them
 const big=[...(world.towers||[]).map(t=>t.x),...(world.traps||[]).filter(t=>t.gate).map(t=>t.gate.x),level.goal.x,level.spawn.x],blocked=x=>big.some(b=>Math.abs(b-x)<420);
 for(const f of[.24,.52,.8]){const want=level.spawn.x+span*f;let best=null;
  for(const q of grounds)for(let x=q.x+KOLCI_EDGE;x<=q.x+q.w-KOLCI_EDGE;x+=80){const d=Math.abs(x-want);if(blocked(x)||best&&d>=best.d)continue;best={x,y:q.y,d};}
  if(!best||best.d>1600||world.kolci.some(k=>Math.abs(k.x-best.x)<1500))continue;const [id,h]=art[n++%art.length];world.kolci.push({id,x:best.x,y:best.y,h});}}
// drawn once at screen scale (and darkened for night and storm), so each frame is one small copy
const kolciCache=new Map();
function kolciStrip(k){const im=levelArt[k.id];if(!im?.width)return null;const key=k.id+'|'+k.h+'|'+levelVariant;let s=kolciCache.get(key);if(s&&s.im===im)return s;
 const w=im.width*k.h/im.height,c=document.createElement('canvas');c.width=Math.ceil(w*ZOOM);c.height=Math.ceil(k.h*ZOOM);const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(im,0,0,c.width,c.height);
 if(levelVariant!=='day'){g.globalCompositeOperation='source-atop';g.fillStyle=levelVariant==='storm'?'rgba(22,30,44,.42)':'rgba(8,14,32,.55)';g.fillRect(0,0,c.width,c.height);}
 s={im,c,w};kolciCache.set(key,s);return s;}
function drawKolci(){if(!world.kolci?.length||settings.gore===false)return;
 for(const k of world.kolci){const s=kolciStrip(k);if(!s)continue;const x=k.x+(camera+VIEW_W/2-k.x)*(1-KOLCI_PAR);if(x+s.w/2<camera-40||x-s.w/2>camera+VIEW_W+40)continue;
  ctx.drawImage(s.c,x-s.w/2,k.y+k.h*.12-k.h,s.w,k.h);}}

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
let hangTold=false;
function hangTip(){if(hangTold)return;hangTold=true;toast('Visiš na ivici · W ili Space: popni se · S: pusti se',3.2);}
function hangUpdate(){const L=p.ledge;if(!L){p.hang=false;return false;}p.x=L.x0;p.y=L.y0;p.vx=0;p.vy=0;p.grounded=false;p.ledgeT=LEDGE_TIME;p.hangT=(p.hangT||0)+1/120;
 const down=(...c)=>c.some(k=>keys.has(k)),hit=(...c)=>c.some(k=>pressed.has(k)),ready=p.hangT>.18,tw=down(p.face>0?'KeyD':'KeyA',p.face>0?'ArrowRight':'ArrowLeft');if(!tw)p.hangHeld=false;
 // the key held through the jump does not count: it must be let go and pressed again (or W / Space)
 if(ready&&((tw&&!p.hangHeld)||hit('KeyW','ArrowUp','Space')||(p.hangT>.45&&down('KeyW','ArrowUp')))){p.hang=false;sfx('cloth',{gain:.5});return false;}
 if(ready&&down('KeyS','ArrowDown',p.face>0?'KeyA':'KeyD',p.face>0?'ArrowLeft':'ArrowRight')){p.hang=false;p.ledgeT=0;p.ledge=null;p.vy=40;p.x=L.x0-p.face*8;p.ledgeCool=.45;return true;}
 return true;}

function attackFrame(phase,o){const n=rig?.[o.name]?.frames.length||6;o.frame=Math.min(n-1,Math.floor(phase*n));return o;}
// dev only: open the game with ?dev to reach the pohodi from the console
if(DEV)window.markoDev={startLevel,LEVELS,layoutAudit,startChapter,enterChapter,keys,pressed,get p(){return p;},get world(){return world;},get boss(){return boss;},get zone(){return zone;},get mode(){return mode;},get camera(){return camera;},get finisher(){return finisher;},get layer(){return layer;},get corpses(){return corpses;},get arrows(){return arrows;},get fires(){return fires;},addFire,step(n=1){for(let i=0;i<n;i++)update(1/120);draw(1/60);}};

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
// Codex's gatehouses are open arches you see through, so the passage gets no dark fill (it read as a black box);
// only a soft shadow on the road under the arch
function gateBack(x,y){const s=gateScale(),w=(GATE_ART.x1-GATE_ART.x0)*s;ctx.save();ctx.globalAlpha=.32;ellipse(x,y+3,w*.62,7,'#000');ctx.restore();}
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
function menuButtons(){const c=$('continue'),s=$('start');if(!c||!s||!hasDom)return;const won=kacanikWon(),N=journeyBegun()?journeyNext():null,story=!!N?.musa,i=N&&!N.musa?N.i:-1;
 c.hidden=!(story||i>=0);
 if(story){c.innerHTML='Nastavi legendu <span>→</span><small>Megdan na Kačaniku</small>';c.onclick=startMusa;}
 else if(i>=0){c.innerHTML=`Nastavi pohod <span>→</span><small>Pohod ${i+1} · ${LEVELS[i].name}</small>`;c.onclick=()=>startLevel(i);}
 c.className=c.hidden?'secondary':'primary';s.className=c.hidden?'primary':'ms-item';
 s.innerHTML=c.hidden?(won?'Ponovo ispevaj legendu <span>→</span>':'Započni legendu <span>→</span>'):`<span class="lbl">${won?'Ponovo ispevaj legendu':'Nova legenda'}</span><small>priča od početka</small>`;
 if(!c.hidden)$('menu-pohodi')?.before?.(s);else c.after?.(s);setTimeout(menuInitials,0);}
// each line of the menu opens with an illuminated initial: the first letter of its label, in either language
function menuInitials(){document.querySelectorAll?.('#menu .ms-item').forEach(b=>{b.dataset.ini=(b.querySelector('.lbl')?.textContent||'').trim().charAt(0);});}
// the main action's banner is a waving cloth (barjak3d.js); without WebGL the SVG banner stays
if(hasDom&&!matchMedia('(max-width:600px)').matches)import('./barjak3d.js').then(m=>{for(const id of['start','continue']){const el=$(id);if(el)m.mountBanner(el).catch(()=>{});}}).catch(()=>{});
function fairyDust(){const box=document.querySelector?.('#menu .fairy-dust');if(!box||box.childElementCount)return;let html='';for(let i=0;i<18;i++){const d=3+Math.random()*4;html+=`<i style="left:${Math.random()*100}%;top:${Math.random()*40}%;animation-duration:${d}s;animation-delay:${-Math.random()*d}s;--dx:${-20-Math.random()*60}px"></i>`;}box.innerHTML=html;}
if(hasDom){
 $('menu-riznica')&&($('menu-riznica').onclick=openRiznica);$('menu-knjiga')&&($('menu-knjiga').onclick=()=>openBook());$('pause-knjiga')&&($('pause-knjiga').onclick=()=>openBook());
 // arrows (or W/S) move between buttons in any menu, Enter presses; in the book, left and right turn the page
 document.addEventListener('keydown',e=>{if(mode==='play')return;const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='SELECT')return;
  if($('zoom')&&!$('zoom').hidden){if(['Equal','NumpadAdd'].includes(e.code))zoomBy(1.25);else if(['Minus','NumpadSubtract'].includes(e.code))zoomBy(1/1.25);else if(e.code==='Digit0')zoomReset();e.preventDefault();return;}
  if(!$('intro').hidden){if(['Enter','Space','ArrowRight','KeyD'].includes(e.code)){e.preventDefault();introNext();}return;}
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
const sc=s=>globalThis.markoI18n?.script?globalThis.markoI18n.script(s):s;   // Serbian book text in the chosen script
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
 for(const c of D.CHAPTERS){const t0=c[en?'en':'sr'],t=en?t0:{title:sc(t0.title),sub:sc(t0.sub),text:sc(t0.text)},pic=c.mini||c.img;out.push({group:c.id,tab:{img:c.tab||pic,label:t.title},
  left:`${ZASTAVICA}<p class="book-eyebrow">KNJIGA LEGENDI</p><figure class="miniature${c.mini?' painted':''}" data-zoom="${hdOf(pic)}" data-cap="${t.title}"><img src="${pic}" alt=""><span class="zoom-badge" aria-hidden="true">⤢</span></figure><div data-notr class="ms-head"><p class="ms-cy">${c.cy}</p><h3 class="foe-name">${t.title}</h3><p class="foe-role">${t.sub}</p></div>`,
  right:(i,N)=>`${ZASTAVICA}<p class="book-eyebrow">Stranica ${i+1} od ${N}</p><div data-notr class="ms-body"><p class="drop ms-text">${t.text}</p><div class="ms-birds" aria-hidden="true"><img src="assets/ui/rukopis-ptica-2.webp" alt=""><img src="assets/ui/rukopis-ptica-1.webp" alt=""></div></div>`});}
 const S=D.SONG,T0=S[en?'en':'sr'],T=en?T0:{title:sc(T0.title),sub:sc(T0.sub),note:sc(T0.note)},sr=S.lines.sr.map(sc),tr2=S.lines.en,n=sr.length;
 const verses=(arr,a,b)=>`<ol class="verses" data-notr>${arr.slice(a,b).map((l,k)=>`<li data-n="${a+k}"${reader?.line===a+k?' class="now"':''}><i>${(a+k+1)%5===0?a+k+1:''}</i>${l}</li>`).join('')}</ol>`;
 const readBar='<div class="read-bar"><button data-read="sr"><b>▶</b>Čitaj na srpskom</button><button data-read="en"><b>▶</b>Čitaj na engleskom</button></div>';
 out.push({group:'pesma',tab:{img:S.tab||S.img,label:T.title,song:true},
  left:`${ZASTAVICA}<p class="book-eyebrow">KNJIGA LEGENDI · PESMA</p><figure class="miniature${S.mini?' painted':''}" data-zoom="${hdOf(S.mini||S.img)}" data-cap="${T.title}"><img src="${S.mini||S.img}" alt=""><span class="zoom-badge" aria-hidden="true">⤢</span></figure><div data-notr class="ms-head"><p class="ms-cy">${S.cy}</p><h3 class="foe-name">${T.title}</h3></div>`,
  right:(i,N)=>`${ZASTAVICA}<p class="book-eyebrow">Stranica ${i+1} od ${N}</p><div data-notr class="ms-body"><p class="ms-text drop">${T.sub}.</p><p class="ms-note">${T.note}</p><p class="ms-note">${n} ${en?'lines':'stihova'}</p><blockquote class="ms-epi">${(en?tr2:sr).slice(251,256).map(l=>`<span>${l}</span>`).join('')}<cite>${en?'lines':'stihovi'} 252–256</cite></blockquote></div>${readBar}`,range:[0,0]});
 const per=en?VERSES:VERSES*2;
 for(let a=0;a<n;a+=per){const b=Math.min(n,a+per),mid=Math.min(n,a+VERSES);
  out.push({group:'pesma',range:[a,b],left:`${ZASTAVICA}<p class="book-eyebrow">${en?'SRPSKI':'PESMA'}</p>${verses(sr,a,mid)}`,
   right:(i,N)=>`${ZASTAVICA}<p class="book-eyebrow">${en?'ENGLISH':`Stranica ${i+1} od ${N}`}</p>${en?verses(tr2,a,b):verses(sr,mid,b)}${b>=n?'<div class="ms-birds" aria-hidden="true"><img src="assets/ui/rukopis-ptica-2.webp" alt=""><img src="assets/ui/rukopis-ptica-1.webp" alt=""></div>':''}${a===0?readBar:''}`});}
 return out;}
function bookList(){return bookKind==='legende'?legendSpreads():BOOK_PAGES.map((pg,i)=>({group:'f'+i,foe:i,tab:{foe:i}}));}
function spreadHTML(i){const s=bookSpreads[i];if(!s)return{left:'',right:''};if(s.foe!=null)return foeSpread(s.foe);return{left:s.left,right:typeof s.right==='function'?s.right(i,bookSpreads.length):s.right};}
function copyCanvases(from,to){const a=from.querySelectorAll?.('canvas')||[],b=to.querySelectorAll?.('canvas')||[];a.forEach((c,k)=>{const d=b[k];if(!d)return;d.classList.remove('foe-canvas');d.getContext('2d')?.drawImage(c,0,0);});}
function bookWire(){const L=$('book-left');L.querySelectorAll('[data-zoom]').forEach(f=>f.onclick=()=>openZoom(f.dataset.zoom,f.dataset.cap));L.querySelectorAll('[data-pose]').forEach(b=>b.onclick=()=>{bookPose=Number(b.dataset.pose);bookAuto=false;bookPoseT=0;bookSetPose();});readWire();}
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
 bookPose=0;bookAuto=true;bookPoseT=0;bookRender();bookPreload();const el=$('knjiga');el.hidden=false;const bk=$('book');bk.dataset.kind=kind;bk.classList.remove('opening','closed');bk.querySelectorAll('.leaf.cover').forEach(c=>c.remove());void bk.offsetWidth;
 bookLast=performance.now();if(!bookRaf)bookRaf=requestAnimationFrame(bookTick);
 if(!settings.reduced&&!matchMedia('(max-width:760px)').matches){bookClosed(bk,kind);sfx('cloth',{gain:.3,rate:.7});}else $('book-next')?.focus?.();}
// the book first lies closed: Codex's binding with a gilt title plate; a click, Enter or an arrow opens it
function bookClosed(bk,kind){bk.classList.add('closed');const cover=document.createElement('div');cover.className='leaf cover still';cover.tabIndex=0;cover.setAttribute('role','button');cover.setAttribute('aria-label','Otvori knjigu');
 cover.innerHTML=`<div class="leaf-face front"><div class="plate"><span>${BOOK_COVER[kind]}</span></div><p class="cover-hint"><b>▶</b> Otvori knjigu</p></div><div class="leaf-face back"></div>`;bk.append(cover);
 cover.onclick=bookOpenCover;cover.onkeydown=e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();bookOpenCover();}};setTimeout(()=>cover.focus?.(),60);}
function bookIsClosed(){return !!$('book')?.querySelector?.('.leaf.cover.still');}
function bookOpenCover(){const bk=$('book'),cover=bk.querySelector('.leaf.cover.still');if(!cover)return;cover.classList.remove('still');bk.classList.remove('closed');void bk.offsetWidth;bk.classList.add('opening');
 sfx('cloth',{gain:.5,rate:.8});setTimeout(()=>sfx('cloth',{gain:.35,rate:1.3}),380);clearTimeout(openBook.t);openBook.t=setTimeout(()=>bk.classList.remove('opening'),1600);
 cover.addEventListener('animationend',e=>{if(e.target===cover)cover.remove();});setTimeout(()=>cover.remove(),2600);$('book-next')?.focus?.();}
// every picture of the book is fetched and decoded as it opens, so no page turns onto an empty frame
const preloaded=new Map();
function preload(src){if(!src||preloaded.has(src)||!hasDom)return;const im=new Image();im.decoding='async';im.src=src;im.decode?.().catch(()=>{});preloaded.set(src,im);}
function bookPreload(){const D=globalThis.markoLegende;if(bookKind!=='legende'||!D)return;for(const c of D.CHAPTERS)preload(c.mini||c.img);preload(D.SONG.mini||D.SONG.img);preload(D.SONG.tab);}
const hdOf=src=>src&&src.includes('/minijature/')?src.replace('/minijature/','/minijature/hd/'):src;
function closeBook(){$('knjiga').hidden=true;stopReading();sfx('cloth',{gain:.4,rate:.7});}
function bookGo(i,dir){if(bookIsClosed()){bookOpenCover();return;}const N=bookSpreads.length;if(!N||bookBusy)return;i=((i%N)+N)%N;if(i===bookAt)return;dir=dir||(i>bookAt?1:-1);
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
const IDLE3_AT=9,STOP_TIME=.26,RECOVER_TIME=.24,ROLL_LAND_TIME=.42,OPEN_TIME=.42,PICK_TIME=.6,CALL_TIME=.75,BLAST_TIME=.85;
function markoFlow(dt){for(const k of['stopT','recoverT','rollLandT','openT','pickT','callT','blastT'])if(p[k]>0)p[k]-=dt;if(p.grounded)p.runJump=false;
 p.airT=p.grounded?0:(p.airT||0)+dt;
 // letting go of the arrows at full run: he digs his heels in
 const held=keys.has('KeyA')||keys.has('KeyD')||keys.has('ArrowLeft')||keys.has('ArrowRight');
 if(p.grounded&&!held&&Math.abs(p.prevVx||0)>200&&p.attack<=0&&!p.blocking&&!p.crouching&&!(p.slide>0)&&!horseMounted&&rig?.['marko-run-stop'])p.stopT=STOP_TIME;p.prevVx=p.vx;
 // standing still a long while: the mace goes on his shoulder, he looks about
 const busy=!p.grounded||Math.abs(p.vx)>5||p.attack>0||p.blocking||p.crouching||p.drink>0||p.hurt>0||p.down>0||horseMounted||p.dizzy>0||keys.size>0;p.idleT=busy?0:(p.idleT||0)+dt;
 // the third blow of the hero's combo: he draws the mace back and settles
 if(p.prevAtk>0&&p.attack<=0&&p.prevKind==='light'&&p.prevCombo===2&&p.grounded&&rig?.['marko-combo-recover'])p.recoverT=RECOVER_TIME;p.prevAtk=p.attack;p.prevKind=p.attackKind;p.prevCombo=p.combo;}
function reachDown(){if(p&&p.grounded&&Math.abs(p.vx)<90&&p.attack<=0){if(rig?.['marko-pickup'])p.pickT=PICK_TIME;else if(rig?.['marko-open'])p.openT=OPEN_TIME;}}
function flowPose(){const once=(name,t,T)=>{const n=rig[name].frames.length;return{name,frame:Math.min(n-1,Math.floor((1-t/T)*n))};};
 if(!p.grounded&&p.hurt>.02&&rig?.['marko-hurt-air'])return{name:'marko-hurt-air',frame:Math.min(3,Math.floor((1-p.hurt/.22)*4))};
 if(!p.grounded||p.attack>0)return null;
 if(p.rollLandT>0&&rig?.['marko-roll-land'])return once('marko-roll-land',p.rollLandT,ROLL_LAND_TIME);
 if(p.pickT>0&&p.attack<=0&&rig?.['marko-pickup'])return once('marko-pickup',p.pickT,PICK_TIME);
  if(p.callT>0&&p.attack<=0&&p.grounded){const mv=Math.abs(p.vx)>35;if(mv&&Math.abs(p.vx)<200&&rig?.['marko-call-walk'])return{name:'marko-call-walk',frame:Math.floor(p.gait*2)%rig['marko-call-walk'].frames.length};if(!mv&&rig?.['marko-call'])return once('marko-call',p.callT,CALL_TIME);}
  if(p.openT>0&&rig?.['marko-open'])return once('marko-open',p.openT,OPEN_TIME);
 if(p.recoverT>0&&Math.abs(p.vx)<80&&rig?.['marko-combo-recover'])return once('marko-combo-recover',p.recoverT,RECOVER_TIME);
 if(p.stopT>0&&Math.abs(p.vx)<150&&!p.blocking&&!p.crouching&&rig?.['marko-run-stop'])return once('marko-run-stop',p.stopT,STOP_TIME);
 return null;}

// ================= the intro: Codex's miniatures tell how the song of Kačanik begins =================
// Seven pictures, each with a line in the manner of the songs; Enter (or a click) turns to the next, Esc skips.
// If the local voice model has read them (assets/voice/uvod-<sr|en>-N.mp3), each picture waits for its line.
const INTRO=[
 {img:'spava',eyebrow:'Kaže pesma…',text:'Kažu da Kraljević Marko nije umro. Spava u pećini, Šarac kraj njega jede mahovinu, a sablja mu se malo-pomalo izvlači iz stene.',kb:'50% 70%'},
 {img:'pesma',eyebrow:'Klisura Kačanika',text:'U to vreme Musa Kesedžija zatvori drumove i primorje. Topuz baca u oblake i dočekuje ga u bele ruke, a klisurom niko ne sme da prođe.',kb:'30% 40%'},
 {img:'svadbarina',eyebrow:'Kula kraj mora',text:'Na obali podiže kulu sa gvozdenim čengelama. Otima carevo blago, a putnike drži u ropstvu.',kb:'70% 40%'},
 {img:'ramazan',eyebrow:'Pred sultanom',text:'Kad caru dodijaše tužbe, iz tamnice izvede jedinog junaka koga se Musa ne bi uplašio — Kraljevića Marka.',kb:'40% 50%'},
 {img:'soko',eyebrow:'Tri godine tamnice',text:'Tri godine tamnice slomile su mu snagu. Vraćala mu se polako, kao ranjeniku pod sokolovim krilom.',kb:'60% 30%'},
 {img:'sablja',eyebrow:'Bez vojske',text:'Car mu nudi vojsku i blago. Marko uzima samo Šarca, topuz i očevu sablju.',kb:'50% 40%'},
 {img:'smrt',eyebrow:'Vila Ravijojla',text:'Na izvoru pod planinom javi mu se posestrima, vila Ravijojla: „Idi, brate. Ja ću biti uz tebe.” Tako počinje pesma o tri srca Kačanika.',kb:'50% 20%'},
];
let introAt=-1,introDone=null,introTimer=0,introVoice=null,introPages=INTRO,introQuiet=false;
// ================= story panels: at the first entry into each chapter, and after the duel; the intro's stage shows them =================
const STORY_PANELS={'pocetak':[{img:'pesme',eyebrow:'Kaže guslar…',text:'Sedi, brate, da ti pevam o Kraljeviću Marku: kako je Šarca potkovao, kako je po pravdi presudio, kako je careve drumove orao i kako je s Musom megdan delio.',kb:'50% 40%'},{img:'marko',eyebrow:'Prilep',text:'Beše sin kralja Vukašina i majke Jevrosime. Majka ga je učila: „Nemoj, sine, govoriti krivo, ni po babu, ni po stričevima, već po pravdi Boga istinoga.”',kb:'50% 30%'},{img:'sarac',eyebrow:'Šarac',text:'Konje je birao tako što ih je hvatao za rep i okretao oko sebe. Samo jedno šareno, bolesno ždrebe nije mogao da pomeri. Njega je vinom othranio, i s njim počinje pesma.',kb:'45% 45%'}],'0':[{img:'drum',eyebrow:"Klisura Kačanika",text:"Musa Kesedžija zatvorio je drum kroz Kačanik. Tri godine niko ne prođe: ni kaluđer, ni trgovac, ni majka sa detetom. Marko ide da ga otvori.",kb:'50% 45%'}],'1':[{img:'kapija',eyebrow:"Zatočena kapija",text:"Na kapiji Musini ljudi drže putnike kao roblje. Hrastova vrata čekaju Markov topuz.",kb:'40% 50%'}],'2':[{img:'trag',eyebrow:"Vilinski trag",text:"Gde drum propade u provaliju, Ravijojla budi stare kamenove. Preko ponora niče most od svetlosti.",kb:'50% 30%'}],'3':[{img:'zalet',eyebrow:"Šarčev zalet",text:"Šarac je čekao svog gospodara. Gde drum pukne pod nogama, šareni konj ga preskače u jednom skoku.",kb:'55% 40%'}],'4':[{img:'opsada',eyebrow:"Poslednji barjak",text:"Pod zidinama juriša turska horda, a s bedema grmi top. Još jedan barjak deli Marka od Muse.",kb:'45% 45%'}],'5':[{img:'musa',eyebrow:"Tri srca Kačanika",text:"U klisuri čeka Musa, div sa tri srca. Na trećem mu spava zmija. Megdan se bije dok jedan ne padne.",kb:'45% 50%'}],'end':[{img:'ranjen',eyebrow:"Posle megdana",text:"Ranjen, ali živ, Marko ide niz klisuru. Šarac korača pored njega, a drum kroz Kačanik ponovo je slobodan. Tako se peva i danas.",kb:'50% 50%'}]};
// ================= scenes before each pohod (DOPUNA-36): two of Codex's miniatures in the manner of the songs, then a living scene =================
// They play on the intro's stage the first time a pohod is started in a session (Esc skips). A pohod without its pictures yet simply starts.
const PRELAZ={"selo":[{"eyebrow":"Kosovsko selo","text":"U kosovskom selu kovač potkiva Šarca. Jedna potkova ostade na nakovnju, i po njoj se selo i danas pamti."},{"eyebrow":"Opsada","text":"Ali turski odred opkoli selo. Žene sklanjaju decu, a Marko izjahuje kroz kapiju sa topuzom u ruci."},{"eyebrow":"Na drumu","text":"Šarac korača drumom u zoru. Iza Marka se vije barjak, a pred njim je selo koje treba osloboditi."}],"klisura":[{"eyebrow":"Klisura Ibra","text":"Niz Ibar, pod starim hrastom, sede guslari i pevaju o Kraljeviću Marku. Narod sluša i ne diše."},{"eyebrow":"Polomljene gusle","text":"Turci dođoše da polome gusle i ućutkaju pesmu. Stari guslar ih zakloni svojim telom."},{"eyebrow":"Pesma","text":"Dok se gusle čuju, pesma živi. Marko ide da je odbrani."}],"suma":[{"eyebrow":"Ravijojlina šuma","text":"Među bukvama javi se vila Ravijojla, sva u svetlosti: „Ovo je moja šuma, brate.”"},{"eyebrow":"Palikuće","text":"Palikuće potpališe bukvu na kojoj orlušina ima gnezdo. Orlići pište, a plamen se penje uz stablo."},{"eyebrow":"Orlušina","text":"Orlušina kruži nad šumom i čeka junaka koji će joj spasti decu."}],"manastir":[{"eyebrow":"Manastirski vis","text":"Pred manastirom se svađaju carevići čije je carstvo. Niko ne sme da presudi, sem Marka."},{"eyebrow":"Pravda","text":"Marko pred carskom knjigom presudi po pravdi: carstvo je Uroševo. Ni ocu za ljubav ne reče krivo."},{"eyebrow":"Zvona","text":"Zazvoniše zvona manastirska. Oklopnici čuvaju prilaz, a Marko se penje stazom."}],"tvrdjava":[{"eyebrow":"Opsednuta tvrđava","text":"Tvrđava gori pod turskom opsadom, a katapulti bacaju vatru preko bedema."},{"eyebrow":"Očeva sablja","text":"U turskom taboru mladi Turčin nosi sablju sa tri zlatna balčaka. To je sablja kralja Vukašina, Markovog oca."},{"eyebrow":"Pred bedemima","text":"Marko sa brda gleda kako tvrđava gori. Sablju će uzeti natrag."}],"prevoj":[{"eyebrow":"Musa Kesedžija","text":"Musa Kesedžija baca topuz u oblake i dočekuje ga u bele ruke. Drumove i primorje zatvorio je."},{"eyebrow":"Zimski prevoj","text":"Prevoj je zaleđen, a na vrhu, kraj kule, čeka Musin poslednji odred."},{"eyebrow":"Mećava","text":"Marko vodi Šarca kroz mećavu. Sneg veje, ali junak ne staje."}],"pecina":[{"eyebrow":"Vilinska pećina","text":"Ravijojla vodi Marka u pećinu, gde kristali svetle plavim plamenom."},{"eyebrow":"Uljezi","text":"I tu su se zavukli Turci, sa bakljama, da pljačkaju vilinsko blago."},{"eyebrow":"Kristali","text":"Kristali trepere, a kapi padaju u jezerce. Prolaz pokazuje vila."}],"podrum":[{"eyebrow":"Ramazan","text":"Car zabrani vino uz ramazan, a Marko ga pije javno, pred carevim čaušima."},{"eyebrow":"Pred carem","text":"Car pozva Marka na odgovor. Marko dođe pred cara sa topuzom, a car mu umesto kazne dade sto dukata da se napije vina."},{"eyebrow":"Podrum","text":"U podrumu baklje trepere, a bačve su pune rujnog vina."}],"mocvara":[{"eyebrow":"Ranjeni soko","text":"Turci strelama gađaju sokola nad trskom i slomiše mu krilo."},{"eyebrow":"Dobro se pamti","text":"Marko pronađe sokola i previ mu krilo. Soko ne zaboravlja dobro."},{"eyebrow":"Noćna močvara","text":"Soko leti nad močvarom pod mesecom, a strelci vrebaju iz trske."}],"rudnik":[{"eyebrow":"Tri kese dukata","text":"Pred smrt, kaže pesma, Marko ostavi tri kese dukata: jednu crkvi, drugu sirotinji, a treću onome ko ga sahrani."},{"eyebrow":"Stari rudnik","text":"Jedna kesa je, kažu, zakopana u starom rudniku. Oklopnici čuvaju izlaz."},{"eyebrow":"Okna","text":"U rudniku se ljuljaju fenjeri, a kolica škripe po šinama."}],"rusevine":[{"eyebrow":"Svadbarina","text":"Arapin je kraj mora podigao kulu i uzima svadbarinu: nijedni svatovi ne prođu dok ne plate."},{"eyebrow":"Svatovi u kavezima","text":"Zarobljene svatove drži u kavezima na ruševinama. Mlada plače, a mladoženja ćuti."},{"eyebrow":"Kolo","text":"Kad Marko razbije kaveze, svatovi će zaigrati kolo."}],"reka":[{"eyebrow":"Obala pred zoru","text":"Marko i Šarac stoje pred rekom u zoru. Preko vode se vidi Urvina planina."},{"eyebrow":"Odred na gazu","text":"Turski odred gazi reku. Treba stići do vodenice pre njih."},{"eyebrow":"Vodenica","text":"Vodenica se okreće, a reka teče pod zorom."}],"oranje":[{"eyebrow":"Oranje Markovo","text":"Majka moli Marka da ostavi četovanje i da ore, jer je dosta krvi prolio."},{"eyebrow":"Ore drumove","text":"Marko posluša majku, ali ne ore ni brda ni doline, nego ore careve drumove."},{"eyebrow":"Brazda","text":"Volovi vuku plug, a ptice slede brazdu po drumu."}]};
function prelazPages(id){const T=PRELAZ[id],has=f=>worldFiles?.has(f);if(!T||!has(`prelaz-${id}-1.webp`)||!has(`prelaz-${id}-2.webp`))return null;
 const pages=[{src:`assets/world/prelaz-${id}-1.webp`,...T[0],kb:'50% 40%'},{src:`assets/world/prelaz-${id}-2.webp`,...T[1],kb:'50% 45%'}];
 if(has(`prelaz-${id}-anim.webp`))pages.push({anim:`assets/world/prelaz-${id}-anim.webp`,...T[2]});return pages;}
function playPrelaz(L,then){const key='pohod-'+L.id,pages=hasDom&&(!GO||String(GO).startsWith('prelaz'))&&prelazPages(L.id);if(!pages||storySeen.has(key)){then();return;}STORY_PANELS[key]=pages;playStory(key,then);}
let storySeen=new Set();
function playStory(key,done){const pages=STORY_PANELS[key];if(!pages||storySeen.has(key)){done?.();return;}storySeen.add(key);if(!hasDom){done?.();return;}
 const back=mode==='play';if(back)mode='story';keys.clear();pressed.clear();introPages=pages;introQuiet=true;$('intro-skip').textContent=tr('Preskoči · Esc');
 playIntro(()=>{introPages=INTRO;introQuiet=false;$('intro-skip').textContent=tr('Preskoči uvod · Esc');if(back&&mode==='story')mode='play';done?.();},true);}
function playIntro(done,story=false){if(!hasDom||(settings.introOff&&!story)){done?.();return;}for(const s of introPages)preload(s.anim||s.src||`assets/ui/minijature/minijatura-${s.img}.webp`);introDone=done||null;introAt=-1;const el=$('intro');el.hidden=false;el.classList.remove('out');
 $('intro').querySelector('.intro-dots').innerHTML=introPages.map(()=>'<i></i>').join('');sfx('horn_call',{gain:.5});introNext();$('intro-next')?.focus?.();}
function introNext(){clearTimeout(introTimer);introVoice?.pause();introAt++;if(introAt>=introPages.length){introEnd(false);return;}
 const s=introPages[introAt],el=$('intro'),img=el.querySelector('.intro-pic img'),src=s.anim||s.src||`assets/ui/minijature/minijatura-${s.img}.webp`;
 el.querySelector('.intro-pic').classList.toggle('anim',!!s.anim);const an=el.querySelector('.intro-anim');if(an)an.style.backgroundImage=s.anim?`url(${s.anim})`:'none';
 el.querySelector('.intro-bg').style.backgroundImage=`url(${src})`;img.style.transformOrigin=s.kb;img.src=src;
 el.querySelector('.intro-eyebrow').textContent=tr(s.eyebrow);el.querySelector('.intro-text').textContent=tr(s.text);
 el.querySelectorAll('.intro-dots i').forEach((d,k)=>d.classList.toggle('on',k===introAt));
 const stage=el.querySelector('.intro-stage');stage.classList.remove('show');void stage.offsetWidth;stage.classList.add('show');
 if(introAt)sfx('cloth',{gain:.4,rate:1.4});
 // with a recorded line the picture waits for it; otherwise it waits as long as reading takes
 const lang=uiLang()==='en'?'en':'sr',wait=Math.max(6,s.text.split(/\s+/).length*.42);introVoice=null;if(introQuiet){introTimer=setTimeout(introNext,wait*1000+1500);return;}
 const a=new Audio(`assets/voice/uvod-${lang}-${introAt+1}.mp3`);a.volume=audioEnabled?Math.min(1,(settings.voice??.9)*1.05):0;
 a.addEventListener('canplaythrough',()=>{if(introVoice!==a)return;clearTimeout(introTimer);a.play().catch(()=>{});a.onended=()=>{if(introVoice===a)introTimer=setTimeout(introNext,1300);};},{once:true});
 a.addEventListener('error',()=>{},{once:true});introVoice=a;a.load();
 introTimer=setTimeout(()=>{if(introVoice===a&&!a.paused)return;introNext();},wait*1000+(a.readyState?0:600));}
function introEnd(skipped){clearTimeout(introTimer);introVoice?.pause();introVoice=null;const el=$('intro');el.classList.add('out');setTimeout(()=>{el.hidden=true;el.classList.remove('out');},450);
 const d=introDone;introDone=null;introAt=-1;if(d)d();else $('start')?.focus?.();}
if(hasDom){$('intro-next')&&($('intro-next').onclick=introNext);$('intro-skip')&&($('intro-skip').onclick=()=>introEnd(true));
 $('intro').addEventListener('click',e=>{if(e.target.closest('button'))return;if(e.target.closest('.intro-pic')&&introAt>=0&&!introPages[introAt].anim){const s=introPages[introAt];clearTimeout(introTimer);introVoice?.pause();openZoom(s.src||`assets/ui/minijature/hd/minijatura-${s.img}.webp`,s.eyebrow,()=>{introTimer=setTimeout(introNext,1800);});return;}introNext();});
 $('intro-open')&&($('intro-open').onclick=()=>playIntro(null));
 globalThis.markoI18n?.onLang?.(()=>setTimeout(menuInitials,0));}

// ================= the magnifier: a miniature in full size; the wheel zooms toward the pointer, a drag pans =================
let zoom={s:1,x:0,y:0,onClose:null,ptrs:new Map(),pinch:0,moved:0};
function openZoom(src,cap,onClose){const z=$('zoom');if(!z||!src)return;const img=z.querySelector('img');img.src=src;z.querySelector('.zoom-cap').textContent=cap||'';zoom={s:1,x:0,y:0,onClose:onClose||null,ptrs:new Map(),pinch:0,moved:0};zoomApply();z.hidden=false;sfx('cloth',{gain:.3,rate:1.6});z.querySelector('[data-z="close"]')?.focus?.();}
function closeZoom(){const z=$('zoom');if(!z||z.hidden)return;z.hidden=true;const f=zoom.onClose;zoom.onClose=null;f?.();}
function zoomApply(){const z=$('zoom'),img=z.querySelector('img');img.style.transform=`translate(${zoom.x}px,${zoom.y}px) scale(${zoom.s})`;z.classList.toggle('zoomed',zoom.s>1.01);}
function zoomClamp(){const img=$('zoom').querySelector('img'),w=img.offsetWidth,h=img.offsetHeight,mx=Math.max(0,(zoom.s-1)*w/2),my=Math.max(0,(zoom.s-1)*h/2);zoom.x=clamp(zoom.x,-mx,mx);zoom.y=clamp(zoom.y,-my,my);}
function zoomBy(f,cx,cy){const v=$('zoom').querySelector('.zoom-view').getBoundingClientRect();cx??=v.left+v.width/2;cy??=v.top+v.height/2;
 const s2=clamp(zoom.s*f,1,6),k=s2/zoom.s,ox=cx-(v.left+v.width/2),oy=cy-(v.top+v.height/2);zoom.x=ox-(ox-zoom.x)*k;zoom.y=oy-(oy-zoom.y)*k;zoom.s=s2;if(s2<=1.001){zoom.x=0;zoom.y=0;}zoomClamp();zoomApply();}
function zoomReset(){zoom.s=1;zoom.x=0;zoom.y=0;zoomApply();}
if(hasDom&&$('zoom')){const z=$('zoom'),view=z.querySelector('.zoom-view');
 view.addEventListener('wheel',e=>{e.preventDefault();zoomBy(e.deltaY<0?1.18:1/1.18,e.clientX,e.clientY);},{passive:false});
 view.addEventListener('dblclick',e=>{if(zoom.s>1.01)zoomReset();else zoomBy(2.6,e.clientX,e.clientY);});
 view.addEventListener('pointerdown',e=>{view.setPointerCapture(e.pointerId);zoom.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});zoom.moved=0;if(zoom.ptrs.size===2){const [a,b]=[...zoom.ptrs.values()];zoom.pinch=Math.hypot(a.x-b.x,a.y-b.y);}z.classList.add('dragging');});
 view.addEventListener('pointermove',e=>{const q=zoom.ptrs.get(e.pointerId);if(!q)return;const dx=e.clientX-q.x,dy=e.clientY-q.y;q.x=e.clientX;q.y=e.clientY;zoom.moved+=Math.abs(dx)+Math.abs(dy);
  if(zoom.ptrs.size===2){const [a,b]=[...zoom.ptrs.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(zoom.pinch)zoomBy(d/zoom.pinch,(a.x+b.x)/2,(a.y+b.y)/2);zoom.pinch=d;return;}
  if(zoom.s>1.01){zoom.x+=dx;zoom.y+=dy;zoomClamp();zoomApply();}});
 for(const ev of['pointerup','pointercancel'])view.addEventListener(ev,e=>{zoom.ptrs.delete(e.pointerId);if(zoom.ptrs.size<2)zoom.pinch=0;if(!zoom.ptrs.size)z.classList.remove('dragging');});
 view.addEventListener('click',e=>{if(zoom.moved>6)return;if(e.target===view&&zoom.s<=1.01)closeZoom();});
 z.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{const k=b.dataset.z;if(k==='in')zoomBy(1.3);else if(k==='out')zoomBy(1/1.3);else if(k==='fit')zoomReset();else closeZoom();});}
if(TRENING)setTimeout(()=>{try{startTraining();}catch(e){console.error(e);}},400);
// ================= quick test links (test.html): ?go=<scene> drops Marko straight into a new feature =================
const GO=hasDom&&new URLSearchParams(location.search).get('go');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function devGo(g){const lv=id=>LEVELS.findIndex(L=>L.id===id),hush=()=>{storySeen=new Set(['0','1','2','3','4','5']);$('dialogue').hidden=true;},
 at=(x,y=590)=>{Object.assign(p,{x,y,vx:0,vy:0,grounded:true,energy:100,hp:p.maxHp,rage:100});camera=Math.max(0,x-VIEW_W*.4);};
 if(g==='top'){startTraining();await wait(300);world.guns=[{x:p.x+60,y:590,id:9,face:1}];toast('Priđi topu i pritisni E',4);return;}
 if(g==='palikuca'){startTraining();await wait(300);training.type=6;training.fight=true;for(const e of world.enemies)e.alive=false;training.t=.2;toast('Vrati baklju: L u pravom trenutku ili udarac topuzom',5);return;}
 if(g==='dokrajci'){startTraining();return;}
 if(g==='turski-top'){startChapter(1);hush();at(4560);toast('Top puca: preskoči niske đulad, sagni se pred visokim',5);return;}
 if(g==='reka'){await startLevel(lv('reka'));await wait(200);const t=world.traps.find(t=>t.kind==='water');if(t)at(t.x-90,t.y);toast('Skela i voda: stani na skelu',4);return;}
 if(g==='most'){startChapter(2);hush();at(7470);toast('Pritisni E kod kamena: Ravijojla doleti i napravi most',5);return;}
 if(g==='ivica'){startChapter(0);hush();at(556);p.face=1;toast('Skoči ka kamenu ispred sebe: Marko visi. W ili Space popni se, S pusti se',6);return;}
 if(g==='ognjeni'){await startLevel(lv('podrum'));await wait(200);const c=world.enemies.find(e=>e.champion);if(c)at(c.arena.x0+120,c.y);toast('Ognjeni aga pali ulje po podu. Kad vikne „ulje“, skači na grede, pa ga udri dok je zadihan.',5);return;}
 if(g==='hasan'){await startLevel(lv('tvrdjava'));await wait(200);const c=world.enemies.find(e=>e.champion);if(c)at(c.arena.x0+120,c.y);toast('Hasan-aga: nijedan topuz ne probija njegov oklop. Navuci ga da se zaleti u stub, pa udri dok je ošamućen.',5);return;}
 if(g==='bajraktar'){await startLevel(lv('rudnik'));await wait(200);const c=world.enemies.find(e=>e.champion);if(c)at(c.arena.x0+120,c.y);toast('Dok barjak stoji na steni, bajraktar ne prima udarce i zove pojačanje. Popni se i obori barjak.',5);return;}
 if(g==='janicar'){await startLevel(lv('reka'));await wait(200);const c=world.enemies.find(e=>e.champion);if(c)at(c.arena.x0+120,c.y);toast('Janičarski aga skače sa grede na gredu i napada sabljom odozgo. Dočekaj ga u vazduhu.',5);return;}
 if(g==='lovac'){await startLevel(lv('suma'));await wait(200);const c=world.enemies.find(e=>e.champion);if(c)at(c.arena.x0+120,c.y);toast('Lovac-aga duva u rog i pušta pse',5);return;}
 if(g==='bos'){await startLevel(lv('tvrdjava'));await wait(200);const c=world.enemies.find(e=>e.champion);if(c){at(c.arena.x0+120,c.y);c.hp=Math.min(c.hp,40);}toast('Dokrajči bosa i gledaj kako Marko slavi',5);return;}
 if(g==='musa'){startChapter(5);hush();toast('Megdan sa Musom',3);return;}
 if(g==='kraj'){startChapter(5);hush();await wait(1500);if(boss){boss.x=p.x+170;
  // a real win clears the save and grants Musa's sabre; a test puts everything back as it was
  let kept=[];try{kept=Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]);}catch{}win();setTimeout(()=>{try{localStorage.clear();for(const [k,v] of kept)localStorage.setItem(k,v);}catch{}},2500);}return;}
 if(g==='prica'){startChapter(1);return;}
 if(g==='pauza'){startChapter(1);hush();await wait(900);if(mode==='play')pause();return;}
 if(g==='orao'){await startLevel(lv('suma'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='gnezdo');if(t)at(t.x0-60,t.y);toast('Spasi orliće od vatre',5);return;}
 if(g==='guslar'){await startLevel(lv('klisura'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='guslar');if(t)at(t.x0-40,t.y);toast('Turci jure na guslara: odbrani ga',5);return;}
 if(g==='soko'){await startLevel(lv('mocvara'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='soko');if(t)at(t.x-420,t.y);toast('Turci jure ranjenog sokola! Oteraj ih, pa mu previj krilo (E).',5);return;}
 if(g==='daske'){await startLevel(lv('mocvara'));await wait(200);const q=world.platforms.filter(q=>q.bridge).sort((a,b)=>a.x-b.x)[0];if(q)at(q.x-120,q.y);toast('Novi drveni most preko provalije.',4);return;}
 if(g==='trska'){await startLevel(lv('mocvara'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='trska');if(t)at(t.x-140,t.y);toast('Strelci vrebaju iz trske.',5);return;}
 if(g==='vino'){await startLevel(lv('podrum'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='bacva');if(t)at(t.x0-40,t.y);toast('Carevi čauši idu da ti proliju vino! Stigni ih pre bačve.',5);return;}
 if(g==='sultan'){await startLevel(lv('podrum'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='bacva'&&t.kraj);if(t)at(t.x-300,t.y);toast('Bačva rujnog vina. Ovde ti niko ne brani: pij (E).',5);return;}
 if(g==='sirotinja'){await startLevel(lv('selo'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='sirotinja');if(t){at(t.x-260,t.y);p.coins=Math.max(p.coins||0,14);}toast('Sirotinja kraj puta. Priđi i daj im dukate (E).',5);return;}
 if(g==='svatovi'){await startLevel(lv('rusevine'));await wait(200);const t=(world.traps||[]).find(t=>t.kind==='kavez');if(t)at(t.x-260,t.y);toast('Razbij kavez topuzom i oslobodi svatove',5);return;}
 if(String(g).startsWith('prelaz')){const id=String(g).split('-')[1]||'selo';storySeen.delete('pohod-'+id);await startLevel(lv(id));return;}
 if(g==='sablja-kraj'){await startLevel(lv('klisura'));await wait(300);const e=world.enemies.find(e=>!e.champion&&!e.perch&&TIHO_TYPES.includes(e.type)&&e.x>level.spawn.x+400);if(e){e.spava=false;e.patrola=null;e.hp=e.maxHp*.2;at(e.x-110,e.y);}await wait(200);toggleSablja();toast('Sablja je isukana. Ošamuti ga, pa kad zasija krug: J odseca glavu, K ga proburazi i zbaci, Shift ga preseca napola.',7);return;}
 if(g==='oderi'){await startLevel(lv('klisura'));await wait(300);const e=world.enemies.find(e=>!e.champion&&!e.perch&&TIHO_TYPES.includes(e.type)&&e.x>level.spawn.x+400);if(e){e.spava=false;e.patrola=null;e.hp=e.maxHp*.2;at(e.x-110,e.y);}toast('Ošamuti ga, pa kad zasija krug: ↑ i K. Oderi ga do kostiju.',6);return;}
 if(g==='tiho'){await startLevel(lv('klisura'));await wait(300);const L=world.logori?.[0];if(L)at(L.x-300,L.y);toast('Logor spava. Prikradi se čučeći (S), pa J s leđa.',6);return;}
 if(g==='platforme'){await startLevel(lv('pecina'));await wait(300);const q=world.platforms.filter(q=>q.kind==='plank'&&!q.bridge&&!q.crumble).sort((a,b)=>a.x-b.x)[1];if(q)at(q.x+q.w/2,q.y);return;}
 if(g==='kolci'){await startLevel(lv('tvrdjava'));await wait(300);const k=world.kolci?.[1]||world.kolci?.[0];if(k)at(k.x-160,k.y);return;}
 if(g==='isukaj'){await startLevel(lv('tvrdjava'));await wait(200);perks.add('oceva-sablja');const e=world.enemies.find(e=>!e.champion&&e.x>level.spawn.x+500);if(e)at(e.x-420,e.y);await wait(400);toggleSablja();toast('G isuče očevu sablju i vraća je u korice. Dok je isukana, J seče sabljom.',6);return;}
 if(g==='sablja'){await startLevel(lv('tvrdjava'));await wait(200);const e=world.enemies.find(e=>e.sablja);if(e)at(e.x-380,e.y);toast('Mladi Turčin nosi očevu sablju. Savladaj ga.',5);return;}
 if(g==='kontrole'){openKontrole();return;}
 if(g==='riznica'){openRiznica();return;}}
if(GO)setTimeout(()=>{devGo(GO).catch(e=>console.error(e));},700);
