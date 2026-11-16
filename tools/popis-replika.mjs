// Popis svih tekstova u igri koji mogu da se izgovore: dijalozi (speak), tabele razgovora, uvodi nivoa,
// prelazi između pesama, priče posle megdana, zapisi i zagonetke. Svaka replika dobija stabilan id (heš teksta),
// govornika i kategoriju, pa se iz popisa kasnije prave glasovi.
//   node tools/popis-replika.mjs            -> art/glasovi/replike.json + ispis zbira
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const GAME = read('dist/game.js'), WORLD = read('dist/world.js');

// ---------- a small JS-aware scanner ----------
// end of one expression that starts at i (stops at a top-level , or a closing bracket)
function exprEnd(s, i) {
  let depth = 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === "'" || c === '"') { i = strEnd(s, i); continue; }
    if (c === '`') { i = tmplEnd(s, i); continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { if (depth === 0) return i; depth--; }
    else if ((c === ',' || c === ';') && depth === 0) return i;
  }
  return i;
}
function strEnd(s, i) { const q = s[i]; for (i++; i < s.length; i++) { if (s[i] === '\\') { i++; continue; } if (s[i] === q) return i; } return i; }
function tmplEnd(s, i) {
  for (i++; i < s.length; i++) {
    if (s[i] === '\\') { i++; continue; }
    if (s[i] === '`') return i;
    if (s[i] === '$' && s[i + 1] === '{') { i = exprEnd(s, i + 2); }
  }
  return i;
}
// the balanced literal that starts at i ( [ or { )
function literalEnd(s, i) {
  let depth = 0;
  for (; i < s.length; i++) {
    const c = s[i];
    if (c === "'" || c === '"') { i = strEnd(s, i); continue; }
    if (c === '`') { i = tmplEnd(s, i); continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { depth--; if (depth === 0) return i + 1; }
  }
  return i;
}
const evalLit = src => { try { return vm.runInNewContext('(' + src + ')', {}, { timeout: 200 }); } catch { return undefined; } };
const lineOf = (s, i) => s.slice(0, i).split('\n').length;
// nearest enclosing named function (good enough to group lines by scene)
function fnAt(s, i) {
  const re = /function\s+([A-Za-z_$][\w$]*)\s*\(/g; let m, last = null;
  while ((m = re.exec(s)) && m.index < i) last = m[1];
  return last;
}
function tableAt(s, i) {
  const before = s.slice(Math.max(0, i - 4000), i);
  const m = [...before.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=/g)].pop();
  return m ? m[1] : null;
}

// ---------- collect ----------
const out = [];
const seen = new Map();
function add(rec) {
  const text = String(rec.text || '').trim();
  if (text.length < 2) return;
  rec.who = NORM[rec.who] || rec.who;
  // a line that tells the story around a quote, given to a character, reads oddly in that character's voice
  if (rec.who !== 'GUSLAR' && /„/.test(text) && !/^[„"]/.test(text)) rec.napomena = (rec.napomena ? rec.napomena + '; ' : '') + 'mešovito: priča + citat';
  const key = rec.who + '|' + text;
  if (seen.has(key)) { seen.get(key).mesta.push(rec.mesto); return; }
  const id = 'd' + crypto.createHash('sha1').update(text).digest('hex').slice(0, 10);
  const r = { id, who: rec.who, text, kat: rec.kat, izvor: rec.izvor, mesta: [rec.mesto] };
  if (rec.napomena) r.napomena = rec.napomena;
  seen.set(key, r); out.push(r);
}

// 1) named tables
function constLiteral(src, name) {
  const m = new RegExp('(?:const|let)\\s+' + name + '\\s*=\\s*').exec(src);
  if (!m) return undefined;
  const st = m.index + m[0].length; return { val: evalLit(src.slice(st, literalEnd(src, st))), at: st };
}
const tables = {};
for (const name of ['INTRO', 'STORY_PANELS', 'PRELAZ', 'LEVEL_INTRO', 'VARIANTS', 'VRH_REC', 'VRH_VILA', 'PV_VILA', 'PV_MILOS', 'DEF_TEXT', 'HINTS', 'KIT_INTRO', 'ZAPISI', 'MOCI2', 'FOE_BOOK']) {
  const r = constLiteral(GAME, name); if (r?.val !== undefined) tables[name] = r;
}
// dialogue tables [[t,'WHO','text',dur],...] anywhere in the game
for (const m of GAME.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*\[\s*\[\s*[\d.]+\s*,\s*'/g)) {
  const st = m.index + m[0].indexOf('['); const val = evalLit(GAME.slice(st, literalEnd(GAME, st)));
  if (Array.isArray(val) && val.length && val.reduce((a, r) => a + String(r[2] || '').length, 0) / val.length >= 30) tables[m[1]] = { val, at: st, razgovor: true };
}
// tables of defended people (selo/kaluderi/putnici ... uvod/kraj)
for (const m of GAME.matchAll(/const\s+([A-Z_][A-Z0-9_]*)\s*=\s*\{\s*[a-z]+\s*:\s*\{\s*ljudi\s*:/g)) {
  const st = m.index + m[0].indexOf('{'); const val = evalLit(GAME.slice(st, literalEnd(GAME, st)));
  if (val) tables[m[1]] = { val, at: st, odbrana: true };
}

const NAR = 'GUSLAR';
const NORM = { VILA: 'RAVIJOJLA', 'PRIPOVEDAČ': 'GUSLAR' };
const isHint = t => /\((?:E|J|K|L|U|Q|R|F|I|P|O|H|Shift|Space|W|S|A|D)\)|\b(?:pritisni|Shift|Space|J i K|W i S|A i D)\b|\b[JKLEU] (?:razbija|odbija|ostavlja|puca)/.test(t);

if (tables.INTRO) tables.INTRO.val.forEach((p, i) => add({ who: NAR, text: p.text, kat: 'uvod igre', izvor: 'INTRO', mesto: `INTRO ${i + 1} · ${p.eyebrow}`, napomena: 'već ima glas lokalnog modela (uvod-sr-*)' }));
if (tables.PRELAZ) for (const [id, pages] of Object.entries(tables.PRELAZ.val)) pages.forEach((p, i) => add({ who: NAR, text: p.text, kat: 'prelaz između pesama', izvor: 'PRELAZ', mesto: `${id} ${i + 1} · ${p.eyebrow || ''}` }));
{ // prelazPages('san') has its pages written inline
  const m = /function prelazPages\(id\)\{if\(id==='san'\)return/.exec(GAME);
  if (m) { const st = m.index + m[0].length; const v = evalLit(GAME.slice(st, literalEnd(GAME, st))); (v || []).forEach((p, i) => add({ who: NAR, text: p.text, kat: 'prelaz između pesama', izvor: 'prelazPages', mesto: `san ${i + 1} · ${p.eyebrow || ''}` })); }
}
if (tables.STORY_PANELS) for (const [id, pages] of Object.entries(tables.STORY_PANELS.val)) (pages || []).forEach((p, i) => add({ who: NAR, text: p.text, kat: 'priča u sceni', izvor: 'STORY_PANELS', mesto: `${id} ${i + 1} · ${p.eyebrow || ''}` }));
if (tables.LEVEL_INTRO) for (const [id, t] of Object.entries(tables.LEVEL_INTRO.val)) add({ who: NAR, text: t, kat: 'uvod nivoa', izvor: 'LEVEL_INTRO', mesto: id });
if (tables.VARIANTS) for (const [id, v] of Object.entries(tables.VARIANTS.val)) if (v.intro) add({ who: NAR, text: v.intro, kat: 'uvod nivoa', izvor: 'VARIANTS', mesto: id, napomena: 'deo koji se dodaje uvodu nivoa' });
for (const [name, t] of Object.entries(tables)) {
  if (t.razgovor) t.val.forEach((row, i) => { const [, who, text] = row; add({ who: String(who || NAR), text, kat: 'razgovor u sceni', izvor: name, mesto: `${name} ${i + 1}` }); });
  if (t.odbrana) for (const [id, o] of Object.entries(t.val)) {
    if (o.uvod) add({ who: NAR, text: o.uvod, kat: 'odbrana: uvod', izvor: name, mesto: `${id} (${o.ime || ''})` });
    if (o.kraj) add({ who: NAR, text: o.kraj, kat: 'odbrana: kraj', izvor: name, mesto: `${id} (${o.ime || ''})` });
  }
}
const plain = { VRH_REC: NAR, VRH_VILA: 'RAVIJOJLA', PV_VILA: 'VILA', PV_MILOS: 'MILOŠ' };
const objStr = { DEF_TEXT: ['RAVIJOJLA', 'vodič'], HINTS: ['RAVIJOJLA', 'uputstvo'], KIT_INTRO: ['RAVIJOJLA', 'vodič'], ZAPISI: [NAR, 'zapis'] };
for (const [name, [who, kat]] of Object.entries(objStr)) if (tables[name]) for (const [id, t] of Object.entries(tables[name].val)) if (typeof t === 'string') add({ who, text: t, kat: kat === 'vodič' && isHint(t) ? 'uputstvo' : kat, izvor: name, mesto: `${name}.${id}` });
if (tables.MOCI2) for (const [id, m] of Object.entries(tables.MOCI2.val)) add({ who: 'RAVIJOJLA', text: `${m.name}. ${m.text}`, kat: 'uputstvo', izvor: 'MOCI2', mesto: `moć ${id}` });
if (tables.FOE_BOOK) for (const [id, f] of Object.entries(tables.FOE_BOOK.val)) if (f.weak) add({ who: 'RAVIJOJLA', text: `${f.name}: ${f.weak}`, kat: 'uputstvo', izvor: 'FOE_BOOK', mesto: `knjiga dušmana ${id}` });
for (const [name, who] of Object.entries(plain)) if (tables[name]) tables[name].val.forEach((t, i) => add({ who, text: t, kat: 'razgovor u sceni', izvor: name, mesto: `${name} ${i + 1}` }));

// 2) every speak(...) call
const dynamic = [];
for (const m of GAME.matchAll(/(?<![\w$.])speak\(/g)) {
  if (GAME.slice(m.index - 9, m.index) === 'function ') continue;
  let i = m.index + m[0].length; const args = [];
  while (i < GAME.length && GAME[i] !== ')') { const e = exprEnd(GAME, i); args.push(GAME.slice(i, e).trim()); i = GAME[e] === ',' ? e + 1 : e; if (GAME[e] !== ',') break; }
  const [a0, , a2] = args; const fn = fnAt(GAME, m.index), ln = lineOf(GAME, m.index);
  let who = a2 ? (evalLit(a2) ?? `(${a2})`) : null;
  if (who != null && typeof who !== 'string') who = String(who);
  const whoSrc = who && who.startsWith('(') ? who : null;
  const mesto = `${fn || '?'} · game.js:${ln}`;
  if (!a0) continue;
  let texts;
  if (/^'[\s\S]*'$|^"[\s\S]*"$/.test(a0)) texts = [evalLit(a0)];
  else if (a0.startsWith('[')) { const e = literalEnd(a0, 0); const arr = evalLit(a0.slice(0, e)); texts = Array.isArray(arr) ? arr : null; }
  else if (/^[\s\S]+\?\s*'[\s\S]*'\s*:\s*'[\s\S]*'$/.test(a0)) { texts = [...a0.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(x => evalLit(`'${x[1]}'`)).filter(t => t && t.length > 8); }
  if (!texts) { dynamic.push({ src: a0.slice(0, 160), who, mesto }); continue; }
  for (const t of texts) {
    if (typeof t !== 'string') continue;
    let w = who || (isHint(t) ? 'RAVIJOJLA' : NAR);
    if (whoSrc) { // speaker chosen in code: a quote goes to the named hero, the rest to the guslar; the three lords of the towns share one line
      const names = [...whoSrc.matchAll(/'([A-ZČĆŠŽĐ ]+)'/g)].map(x => x[1]);
      w = names.length ? (/^[„"]/.test(t.trim()) ? names.find(n => n !== 'GUSLAR') || names[0] : 'GUSLAR') : /OKOVI_STANICE/.test(whoSrc) ? 'GOSPODA (Orid, Vučitrn, Zvečan)' : NAR;
    }
    add({ who: w, text: t, kat: isHint(t) ? 'uputstvo' : (who ? 'dijalog' : 'pripovedanje'), izvor: 'speak', mesto });
  }
}

// 3) world.js: messages of the guide, puzzle clues
for (const m of WORLD.matchAll(/\b(message|clue|win|hint|wrong):'((?:[^'\\]|\\.)*)'/g)) {
  const t = evalLit(`'${m[2]}'`); if (!t || t.length < 12) continue;
  const kat = m[1] === 'message' ? (isHint(t) ? 'uputstvo' : 'vodič') : 'zagonetka';
  add({ who: m[1] === 'message' ? 'RAVIJOJLA' : NAR, text: t, kat, izvor: 'world.js ' + m[1], mesto: 'world.js:' + lineOf(WORLD, m.index) });
}

// 4) greybox levels (separate mode): their chapter intros
for (const f of ['dist/greybox-nivoi.js', 'dist/greybox-nivoi-pohodi.js']) {
  const S = read(f);
  for (const m of S.matchAll(/\buvod:'((?:[^'\\]|\\.)*)'/g)) { const t = evalLit(`'${m[1]}'`); if (t) add({ who: NAR, text: t, kat: 'greybox (probni nivoi)', izvor: f.replace('dist/', ''), mesto: f.replace('dist/', '') + ':' + lineOf(S, m.index) }); }
}

// ---------- where each line is heard: level and scene ----------
const JOURNEY = (/const JOURNEY=\[([^\]]*)\]/.exec(GAME)?.[1] || '').match(/'(\w+)'/g).map(s => s.slice(1, -1));
const LEVEL_NAME = {};
for (const id of [...JOURNEY, 'azak']) {
  const m = new RegExp("id:'" + id + "'[^{}]{0,300}?name:'([^']+)'").exec(WORLD + GAME);
  const song = tables.PRELAZ?.val?.[id]?.[0]?.eyebrow;
  LEVEL_NAME[id] = [m?.[1], song].filter(Boolean).join(' · ') || id;
}
LEVEL_NAME.san ||= 'San Kraljevića Marka';
// scene functions and tables -> [level, scene]
const SCENA = {
  updateVasar: ['selo', 'Vašar konja'], useVasar: ['selo', 'Vašar konja'],
  updateOkovi: ['klisura', 'Marko i Đemo Brđanin: okovi i mehana'], guslarOdbrana: ['klisura', 'Guslari u klisuri'],
  PV_STIH: ['suma', 'Marko i vila (Miroč)'], PV_MILOS: ['suma', 'Marko i vila (Miroč)'], PV_VILA: ['suma', 'Marko i vila (Miroč)'],
  pesmaPeva: ['suma', 'Marko i vila (Miroč)'], pvTick: ['suma', 'Marko i vila (Miroč)'], pvPesmaKraj: ['suma', 'Marko i vila (Miroč)'],
  pvStreleTick: ['suma', 'Marko i vila (Miroč)'], pvBiljeTick: ['suma', 'Marko i vila (Miroč)'], pvLeciTick: ['suma', 'Marko i vila (Miroč)'],
  pvBije: ['suma', 'Marko i vila (Miroč)'], pvTrka: ['suma', 'Marko i vila (Miroč)'], updatePotera: ['suma', 'Marko i vila (Miroč)'],
  usePotera: ['suma', 'Marko i vila (Miroč)'], updateJahanje: ['suma', 'Marko i vila (Miroč)'],
  updateCrkva: ['manastir', 'Uroš i Mrnjavčevići (Samodreža)'], crkvaBeg: ['manastir', 'Uroš i Mrnjavčevići (Samodreža)'], presudaBlagoslov: ['manastir', 'Uroš i Mrnjavčevići (Samodreža)'],
  updateSabljaPesma: ['tvrdjava', 'Marko poznaje očinu sablju'], SABLJA_RAZGOVOR: ['tvrdjava', 'Marko poznaje očinu sablju'], dropSablja: ['tvrdjava', 'Marko poznaje očinu sablju'], collectCudo: ['tvrdjava', 'Marko poznaje očinu sablju'],
  updateBacve: ['podrum', 'Marko pije uz ramazan vino'], useBacva: ['podrum', 'Marko pije uz ramazan vino'],
  updateVaradin: ['prevoj', 'Marko i Vuča dženeral (Varadin)'],
  KOSOVKA_RAZGOVOR: ['rusevine', 'Kosovka devojka i svadbarina'], updateKosovka: ['rusevine', 'Kosovka devojka i svadbarina'], kosovkaArap: ['rusevine', 'Kosovka devojka i svadbarina'],
  updateMehana: ['reka', 'Marko i Filip Madžarin'], filipPao: ['reka', 'Marko i Filip Madžarin'], updatePogled: ['reka', 'Pogled popreko'], usePogled: ['reka', 'Pogled popreko'],
  updateStrela: ['oranje', 'Oranje Markovo i strela'], useStrela: ['oranje', 'Oranje Markovo i strela'], updatePlows: ['oranje', 'Oranje Markovo i strela'],
  VRH_REC: ['urvina', 'Smrt Marka Kraljevića'], VRH_VILA: ['urvina', 'Smrt Marka Kraljevića'], useVrh: ['urvina', 'Smrt Marka Kraljevića'], updateUrvina: ['urvina', 'Smrt Marka Kraljevića'],
  updateSan: ['san', 'Četiri odaje sna'], updateMindPuzzles: ['sve', 'Zagonetke (vaga, vilinsko kolo)'],
  updateLov: ['mocvara', 'Ranjeni soko'], lovStart: ['mocvara', 'Ranjeni soko'],
  end: ['musa', 'Megdan sa Musom'], slay: ['musa', 'Megdan sa Musom'], pocetak: ['musa', 'Kačanik: početak'],
  updateTravelers: ['musa', 'Kačanik: putnici'], DEF_TEXT: ['musa', 'Kačanik: odbrana kapije'],
};
const TIP_FN = /^(updateTraps|akindzijaTick|kopljanikTick|kisaStrela|varkaKraj|updateCannons|megdanHint|throwSpear|drawSoldier|updateGunner|updatePuzzles|updateArena|hintOnce|bookSee|uzmiMoc|updateDefense|updateCannon\w*)$/;
for (const r of out) {
  const m0 = r.mesta[0], head = m0.split(' · ')[0], key = head.replace(/[ .]\S*$/, '').replace(/ \d+$/, '');
  let lv = null, sc = null;
  if (/^novoGo$/.test(key)) { r.kat = 'samo za razvoj'; lv = 'razvoj'; sc = 'prečice ?novo='; }
  else if (r.izvor === 'PRELAZ' || r.izvor === 'prelazPages') { lv = head.split(' ')[0]; sc = 'Prelaz pred pesmu'; }
  else if (r.izvor === 'LEVEL_INTRO') { lv = head; sc = 'Uvod nivoa'; }
  else if (r.izvor === 'VARIANTS') { lv = 'sve'; sc = 'Uvod nivoa (noć, oluja)'; }
  else if (r.izvor === 'ZAPISI') { lv = head.split('.')[1]; sc = 'Zapis legende'; }
  else if (r.izvor === 'INTRO') { lv = 'musa'; sc = 'Uvod igre'; }
  else if (r.izvor === 'STORY_PANELS') { const k = head.split(' ')[0]; const base = k.split('-')[0]; lv = JOURNEY.includes(base) ? base : 'musa'; sc = /^\d$/.test(k) ? 'Kačanik: poglavlja' : k === 'pocetak' ? 'Kačanik: početak' : k === 'end' ? 'Megdan sa Musom' : 'Priča posle scene'; }
  else if (/^greybox/.test(r.izvor)) { lv = 'greybox'; sc = 'Probni nivoi'; }
  else if (r.izvor.startsWith('world.js')) { lv = r.kat === 'zagonetka' ? 'san' : 'musa'; sc = r.kat === 'zagonetka' ? 'Četiri odaje sna' : 'Kačanik: Ravijojla vodi'; }
  else if (SCENA[key]) [lv, sc] = SCENA[key];
  else if (SCENA[r.izvor]) [lv, sc] = SCENA[r.izvor];
  else if (/^(HINTS|KIT_INTRO|FOE_BOOK|MOCI2|moć|knjiga)/.test(head) || TIP_FN.test(key)) { lv = 'sve'; sc = 'Saveti i uputstva'; }
  else if (/^\w+ \(/.test(head)) { lv = 'sve'; sc = 'Odbrana (branik)'; }
  // tips said without a speaker: Ravijojla is the guide
  if (sc === 'Saveti i uputstva' && r.kat !== 'uputstvo') { r.kat = 'savet'; r.who = 'RAVIJOJLA'; }
  r.nivo = lv || 'sve'; r.scena = sc || 'Ostalo';
}

// ---------- write + totals ----------
const dest = path.join(ROOT, 'art', 'glasovi'); fs.mkdirSync(dest, { recursive: true });
fs.writeFileSync(path.join(dest, 'replike.json'), JSON.stringify({ napravljeno: new Date().toISOString().slice(0, 10), replike: out, dinamicki: dynamic }, null, 1));
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
const groupBy = (arr, k) => { const g = {}; for (const r of arr) { const x = (g[typeof k === 'function' ? k(r) : r[k]] ??= { n: 0, z: 0, list: [] }); x.n++; x.z += r.text.length; x.list.push(r); } return g; };
const sorted = g => Object.entries(g).sort((a, b) => b[1].z - a[1].z);
console.log(`replika ${out.length}, znakova ${sum(out, r => r.text.length)}, dinamičkih speak() ${dynamic.length}`);
console.log('\npo kategoriji:'); for (const [k, v] of sorted(groupBy(out, 'kat'))) console.log(`  ${k.padEnd(24)} ${String(v.n).padStart(4)} ${String(v.z).padStart(7)}`);
console.log('\npo govorniku:'); for (const [k, v] of sorted(groupBy(out, 'who'))) console.log(`  ${k.padEnd(24)} ${String(v.n).padStart(4)} ${String(v.z).padStart(7)}`);
console.log('\npo nivou:'); for (const [k, v] of sorted(groupBy(out, 'nivo'))) console.log(`  ${k.padEnd(24)} ${String(v.n).padStart(4)} ${String(v.z).padStart(7)}`);
console.log('\nOstalo:'); for (const r of out.filter(r => r.scena === 'Ostalo')) console.log('  ', r.mesta[0], '|', r.who, '|', r.text.slice(0, 80));

// ---------- the document ----------
if (process.argv.includes('--md')) {
  const CAST = JSON.parse(read('art/glasovi/glasovi.json'));
  const LINES_SRC = read('make-voice-lines.py');
  const existing = [...LINES_SRC.matchAll(/'([a-z0-9_]+)': \('([a-z]+)', ['"](.+?)['"], '(sr|tr)'\)/g)];
  const RATE = 11, TAG = 12; // characters per second of ElevenLabs Serbian speech (measured on our files), tag characters per line
  const SKIP = new Set(['uputstvo', 'greybox (probni nivoi)', 'samo za razvoj', 'uvod igre']);
  const voice = out.filter(r => !SKIP.has(r.kat));
  const min = z => (z / RATE / 60).toFixed(0);
  const fmt = n => n.toLocaleString('sr-RS');
  const order = ['musa', ...JOURNEY, 'azak', 'sve'];
  const lvTitle = id => id === 'musa' ? 'Kačanik · Musa Kesedžija (prvi pohod)' : id === 'sve' ? 'Kroz celu igru' : LEVEL_NAME[id] ? `${id} · ${LEVEL_NAME[id]}` : id;
  const L = [];
  L.push('# Glasovi: popis svih replika', '');
  L.push(`Napravljeno ${new Date().toISOString().slice(0, 10)} alatom \`node tools/popis-replika.mjs --md\`, iz \`dist/game.js\`, \`dist/world.js\` i greybox nivoa. Isti popis za mašinu je u \`art/glasovi/replike.json\` (svaka replika ima stalni id, iz njega se prave glasovi), a ko kojim glasom govori je u \`art/glasovi/glasovi.json\`.`, '');
  L.push('## Ukratko', '');
  L.push(`- U igri ima **${out.length} tekstova** koji se pojavljuju u okviru za razgovor ili na pričama između pesama: **${fmt(sum(out, r => r.text.length))} znakova**.`);
  L.push(`- Za ozvučavanje predlažem **${voice.length} replika, ${fmt(sum(voice, r => r.text.length))} znakova**: oko **${min(sum(voice, r => r.text.length))} minuta** govora. Sa oznakama za ton ([tiho], [ljutito]…) to je oko **${fmt(sum(voice, r => r.text.length + TAG))} kredita** (eleven_v4 = 1 kredit po znaku).`);
  L.push(`- Ne predlažem ozvučavanje: uputstava sa tasterima (${groupBy(out, 'kat').uputstvo?.n || 0}; na džojstiku tasteri imaju druga imena), greybox probnih nivoa, prečica za razvoj i uvoda igre (već ga čita lokalni model).`);
  L.push(`- Već postoji ${existing.length} kratkih replika u borbi (\`make-voice-lines.py\`, \`dist/assets/voice/\`): Marko, Musa, Ravijojla, age, Turci, putnici. One ostaju.`);
  L.push(`- Novi nalog ima 40.000 kredita mesečno (vraćaju se 16. 12.). Stari nalog dobija 121.215 kredita 27. 11.`, '');
  const A = sum(voice, r => r.text.length + TAG), NEW_N = 17 * 10, NEW_Z = NEW_N * (45 + TAG);
  L.push('## Plan i cena', '');
  L.push('| Tura | Šta | Replika | Kredita (najviše) | Gde |', '|---|---|---:|---:|---|');
  L.push(`| 1 | Svi postojeći dijalozi, uvodi nivoa i prelazi između pesama (sve iz ovog popisa što se ozvučava) | ${voice.length} | ${fmt(A)} | novi nalog, odmah |`);
  L.push(`| 2 | Miloš peva: 3 stiha Miloša i 3 vilina, po 3–4 pokušaja dok pesma ne legne | 6 | oko 1.500 | novi nalog |`);
  L.push(`| 3 | Nove replike za sve nivoe: oko 10 po nivou (Marko 5, Ravijojla 2, ljudi sa nivoa 3) | ${NEW_N} | ${fmt(NEW_Z)} | ostatak novog naloga, pa stari od 27. 11. |`);
  L.push(`| | Ukupno | ${voice.length + 6 + NEW_N} | ${fmt(A + 1500 + NEW_Z)} | |`, '');
  L.push('Ovo je gornja granica: računa 1 kredit po znaku i oznake za ton. Proba od 16. 11. (64 znaka) potrošila je samo 26 kredita, pa je stvarna cena možda i upola manja. Proverava se na prvih dvadesetak replika ture 1, pre nego što se pusti ostatak.', '');
  L.push('Pevanje: ElevenLabs govor ume da „zapeva“ uz oznaku [sings], ali to nije prava pesma. Zato tura 2 počinje jednim stihom za probu; ako ne valja, Miloševa pesma ostaje uz gusle iz igre, a govori se samo ono što Miloš kaže.', '');
  L.push('### Nove replike po nivoima (predlog, tekstovi se pišu posle dogovora)', '');
  L.push('| Nivo | Ko bi još govorio |', '|---|---|');
  for (const [id, who] of [['musa', 'putnici (starac, trgovac, majka sa detetom), Musa'], ['selo', 'seljanke i starci iz crkve, konjušar, sirotinja'], ['suma', 'Miloš na putu i dok peva'], ['manastir', 'kaluđeri, kralj Vukašin, carević Uroš'], ['oranje', 'majka Jevrosima, janičari na drumu'], ['tvrdjava', 'branioci na bedemu, Mustaf-aga'], ['podrum', 'čauši, sultan'], ['mocvara', 'vezir, lovci'], ['pecina', 'odjek pećine, duhovi starih junaka'], ['prevoj', 'Velimir, Vuča dženeral, tri vojvode'], ['klisura', 'guslari, Đemo Brđanin, krčmarica Janja'], ['rusevine', 'Kosovka devojka, svatovi, Arapin'], ['rudnik', 'rudari'], ['reka', 'Filip Madžarin, putnici na skeli'], ['vracara', 'Crni vrač, ljudi od senki'], ['urvina', 'Šarac, vila sa vrha'], ['san', 'vila sa guslama, glasovi iz odaja']]) L.push(`| ${lvTitle(id)} | Marko i Ravijojla, plus ${who} |`);
  L.push('');
  L.push('## Po vrsti', '', '| Vrsta | Replika | Znakova | Minuta | Ozvučiti |', '|---|---:|---:|---:|---|');
  for (const [k, v] of sorted(groupBy(out, 'kat'))) L.push(`| ${k} | ${v.n} | ${fmt(v.z)} | ${min(v.z)} | ${SKIP.has(k) ? 'ne' : 'da'} |`);
  L.push('', '## Ko govori i kojim glasom', '', 'Samo replike predložene za ozvučavanje. „Predlog“ znači da glas još nije potvrđen: lako se menja u `art/glasovi/glasovi.json`.', '', '| Lik | Replika | Znakova | Minuta | Glas | Stanje |', '|---|---:|---:|---:|---|---|');
  for (const [k, v] of sorted(groupBy(voice, 'who'))) { const c = CAST[k] || {}; L.push(`| ${k} | ${v.n} | ${fmt(v.z)} | ${(v.z / RATE / 60).toFixed(1)} | ${c.glas || '—'} | ${c.stanje || 'treba izabrati'} |`); }
  const mixed = voice.filter(r => r.who === 'GUSLAR' && /„/.test(r.text));
  L.push('', `Guslar nosi najviše teksta. Od toga je ${mixed.length} replika (${fmt(sum(mixed, r => r.text.length))} znakova) priča sa citatom u kojoj neko drugi govori („…“). Te replike mogu da se podele: guslar čita priču, a citat izgovara lik čiji je (Arapin, Filip, Vuča, Đemo, Šarac…). Tako se u igri čuje više ljudi, a cena ostaje ista.`);
  L.push('', '## Po nivou', '', '| Nivo | Replika | Znakova | Minuta |', '|---|---:|---:|---:|');
  const byLv = groupBy(voice, 'nivo');
  for (const id of order) if (byLv[id]) L.push(`| ${lvTitle(id)} | ${byLv[id].n} | ${fmt(byLv[id].z)} | ${(byLv[id].z / RATE / 60).toFixed(1)} |`);
  L.push('', '## Sve replike, nivo po nivo', '', 'Svaka stavka: **lik** · broj znakova · tekst. Iza teksta je mesto u kodu. Replike koje se ne ozvučavaju su na kraju.');
  for (const id of order) {
    if (!byLv[id]) continue;
    L.push('', `### ${lvTitle(id)}`);
    const bySc = groupBy(byLv[id].list, 'scena');
    for (const [sc, v] of Object.entries(bySc)) {
      L.push('', `**${sc}** · ${v.n} replika · ${fmt(v.z)} znakova`, '');
      for (const r of v.list) L.push(`- **${r.who}** · ${r.text.length} · ${r.text}  \n  <sub>\`${r.id}\` · ${r.kat} · ${r.mesta[0]}${r.mesta.length > 1 ? ` (+${r.mesta.length - 1})` : ''}${r.napomena ? ' · ' + r.napomena : ''}</sub>`);
    }
  }
  L.push('', '## Ne ozvučava se (predlog)');
  for (const [k, v] of Object.entries(groupBy(out.filter(r => SKIP.has(r.kat)), 'kat'))) {
    L.push('', `**${k}** · ${v.n} · ${fmt(v.z)} znakova`, '');
    for (const r of v.list) L.push(`- **${r.who}** · ${r.text}  \n  <sub>\`${r.id}\` · ${r.mesta[0]}</sub>`);
  }
  L.push('', '## Tekstovi koji se sklapaju u hodu', '', 'Ovi `speak(...)` pozivi sklapaju rečenicu od delova (ime nivoa + uvod, ime moći + opis…). Delovi su gore u popisu; ovde je samo mesto.', '');
  for (const d of dynamic) L.push(`- ${d.mesto} · \`${d.src.replace(/`/g, "'").slice(0, 120)}\``);
  fs.writeFileSync(path.join(ROOT, 'docs', 'GLASOVI-POPIS.md'), L.join('\n') + '\n');
  console.log('\nnapisan docs/GLASOVI-POPIS.md');
}
