// Miroč episode: 300 seconds of playable story, based on pesme/05-Kraljevic Marko i vila Ravijojla.
// Times refer to the in-game song clock. Gameplay runs with the original world.js physics.
export const EPISODE_SECONDS = 300;
export const MIROC_PHASES = Object.freeze([
  {id:'ride',    from:0,   to:32,  title:'I · DVA POBRATIMA', objective:'Jaši kroz Miroč. D / → ubrzava, A / ← usporava.', focus:'horse'},
  {id:'sing',    from:32,  to:85,  title:'II · MILOŠEVA PESMA', objective:'Miloš peva. Marko drema na Šarcu. Posmatraj šumu.', focus:'song'},
  {id:'arrows',  from:85,  to:105, title:'III · DVE BELE STRELE', objective:'Vila napada. Marko se budi na pobratimov poziv.', focus:'scene'},
  {id:'chase',   from:105, to:174, title:'IV · ŠARČEV ZALET', objective:'D / → galop, SPACE skok. Pređi šumske provalije i sustigni vilu.', focus:'horse'},
  {id:'battle',  from:174, to:226, title:'V · MARKOV TOPUZ', objective:'A/D kretanje, SPACE skok, J udar, K teški udar. Pogodi vilu tri puta.', focus:'combat'},
  {id:'herbs',   from:226, to:273, title:'VI · MIROČKO BILJE', objective:'Upravljaj vilom: WASD ili strelice. E skuplja bilje. Pronađi 3 biljke.', focus:'fairy'},
  {id:'healing', from:273, to:300, title:'VII · ISCELJENJE', objective:'Drži E pored Miloša da vila zaleči obe rane.', focus:'heal'}
]);
export const MIROC_LINES = Object.freeze([
  [0, 'Dva pobratima jezde preko krasna Miroča planine.'],
  [10,'Marko: „Teško me je sanak obrvao. Pevaj, brate, te me razgovaraj.“'],
  [25,'Miloš: „Vila Ravijojla zapretila mi je da ne pevam.“'],
  [34,'Marko: „Pevaj, brate, ti se ne boj vile!“'],
  [44,'Miloš zapeva o našim starijim junacima i njihovim zadužbinama.'],
  [58,'Marku je pesma omilila: nasloni se sedlu i zaspa.'],
  [72,'Vila Ravijojla ču pesmu i poče da otpeva.'],
  [84,'Miloševo grlo peva lepše nego vilino — Ravijojla se razgnevi.'],
  [91,'Dve bele strele! Jedna u grlo, druga u grudi Miloša.'],
  [99,'Miloš: „Jao Marko, Bogom pobratime! Vila me ustreli!“'],
  [109,'Marko: „Jao Šaro, moje desno krilo! Dostigni mi vilu Ravijojlu!“'],
  [148,'Vila leti vrhom planine, Šarac juri sredinom.'],
  [179,'Marko: „Zašto, vilo, ustreli pobratima moga?“'],
  [211,'Vila: „Pusti me da po Miroču naberem lekovito bilje!“'],
  [231,'Vila bere bilje i odaziva se: „Sad ću doći, Bogom pobratime!“'],
  [270,'Ravijojla donosi lek za Miloševe rane.'],
  [289,'Zagasiše se rane. Miloševo grlo ponovo peva!']
]);
export const MIROC_HERBS = Object.freeze([{x:220,y:438},{x:640,y:375},{x:1070,y:485}]);
export const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
export function phaseAt(second){
  const t=clamp(second,0,EPISODE_SECONDS);
  return MIROC_PHASES.find(p=>t<p.to)||MIROC_PHASES[MIROC_PHASES.length-1];
}
export function lyricAt(second){
  let line=MIROC_LINES[0][1];
  for(const [start,value] of MIROC_LINES){if(second>=start)line=value;else break;}
  return line;
}
export function pct(second){return clamp(second/EPISODE_SECONDS,0,1);}
export function prettyTime(second){const s=Math.max(0,Math.ceil(EPISODE_SECONDS-second));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
export function scoreEpisode({jumps=0,hits=0,herbs=0,heal=0}={}){
  return (jumps>=2?1:0)+(hits>=3?1:0)+(herbs>=3?1:0)+(heal>=1?1:0);
}
