// Measures what a page downloads before its first picture, in a headless Chrome/Edge driven over the DevTools protocol.
//   node tools/meri-ucitavanje.mjs [url] [telefon|desktop] [seconds after the first played frame]
// env: PLAY=1 fights a little with real keys right after the start; SHOT=file.png a picture at the end; EVAL='expr' read the page
// default: http://127.0.0.1:4181/index.html?greybox=1 telefon 15  (start the server first: PORT=4181 node server.mjs)
// 'telefon' is 375×812 at 3x with touch and an Android user agent, so the game picks its phone path by itself.
// It reads performance.getEntriesByType('resource') against the game's marks 'marko-prvi-kadar' and 'marko-prva-igra'.
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:4181/index.html?greybox=1';
const kind = process.argv[3] || 'telefon';
const after = +(process.argv[4] || 15);
const exe = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(p => p && existsSync(p));
if (!exe) { console.error('no Chrome/Edge found (set CHROME)'); process.exit(2); }
const port = 9300 + Math.floor(Math.random() * 500);
const browser = spawn(exe, ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'meri-'))}`,
  '--no-first-run', '--no-default-browser-check', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], {stdio: 'ignore'});
const quit = code => { try { browser.kill(); } catch {} process.exit(code); };
let target;
for (let i = 0; i < 60 && !target; i++) {
  await new Promise(r => setTimeout(r, 250));
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find(t => t.type === 'page'); } catch {}
}
if (!target) { console.error('browser did not start'); quit(2); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r, {once: true}));
let id = 0; const wait = new Map();
const errors = [];   // uncaught exceptions and console.error of the page
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' ')); });
const send = (method, params = {}) => new Promise(r => { const n = ++id; wait.set(n, r); ws.send(JSON.stringify({id: n, method, params})); });
const evalJs = async expr => { const m = await send('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); return m.result?.result?.value ?? m.result?.exceptionDetails?.exception?.description; };

await send('Network.enable');
await send('Network.setCacheDisabled', {cacheDisabled: true});
if (kind === 'telefon') {
  await send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 3, mobile: true});
  await send('Emulation.setTouchEmulationEnabled', {enabled: true, maxTouchPoints: 5});
  await send('Network.setUserAgentOverride', {userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'});
  await send('Emulation.setEmulatedMedia', {features: [{name: 'pointer', value: 'coarse'}, {name: 'hover', value: 'none'}]});
} else {
  await send('Emulation.setDeviceMetricsOverride', {width: 1600, height: 900, deviceScaleFactor: 1, mobile: false});
}
await send('Page.enable');
await send('Runtime.enable');
await send('Page.navigate', {url});
const t0 = Date.now();
const sleep = ms => new Promise(r => setTimeout(r, ms));
// wait for the first played frame, then read what came before it
const before = await evalJs(`(async()=>{const t0=performance.now();
  while(!performance.getEntriesByName('marko-prva-igra').length&&performance.now()-t0<120000)await new Promise(r=>setTimeout(r,50));
  return performance.getEntriesByName('marko-prva-igra').length>0;})()`);
// PLAY=1: a short fight with real keys, straight away, so moves are drawn before their sheets have come
if (process.env.PLAY) {
  const key = async (code, down) => send('Input.dispatchKeyEvent', {type: down ? 'rawKeyDown' : 'keyUp', code, key: code, windowsVirtualKeyCode: 0});
  const tap = async (codes, ms = 90) => { for (const c of codes) await key(c, true); await sleep(ms); for (const c of codes.slice().reverse()) await key(c, false); await sleep(140); };
  await key('KeyD', true); await sleep(500);
  for (const c of [['KeyJ'], ['KeyJ'], ['KeyK'], ['Space'], ['KeyJ'], ['KeyW', 'KeyK'], ['KeyS', 'ShiftLeft'], ['KeyC'], ['KeyV'], ['KeyL'], ['KeyI'], ['Space'], ['Space'], ['KeyQ']]) await tap(c);
  await key('KeyD', false); await key('KeyO', true); await sleep(700); await key('KeyO', false);
}
const res = await evalJs(`(async()=>{
  const sz=e=>e.encodedBodySize||e.transferSize||0,key=e=>{const m=e.name.replace(location.origin,'').match(new RegExp('^/(assets/[^/]+/|assets/|[^/?]+)'));return m?m[1]:'(drugo)';};
  const mark=n=>performance.getEntriesByName(n)[0]?.startTime;
  const sum=a=>({n:a.length,MB:+(a.reduce((s,e)=>s+sz(e),0)/1e6).toFixed(1)});
  const groups=a=>{const g={};for(const e of a){const k=key(e);(g[k]??=[0,0]);g[k][0]++;g[k][1]+=sz(e);}return Object.fromEntries(Object.entries(g).sort((x,y)=>y[1][1]-x[1][1]).map(([k,[n,s]])=>[k,n+' / '+(s/1e6).toFixed(2)+' MB']));};
  const first=mark('marko-prvi-kadar'),play=mark('marko-prva-igra'),es=()=>performance.getEntriesByType('resource');
  const out={coarse:matchMedia('(pointer:coarse)').matches,prviKadarMs:Math.round(first??-1),prvaIgraMs:Math.round(play??-1),
    preKadra:sum(es().filter(e=>e.startTime<first)),preIgre:sum(es().filter(e=>e.startTime<play)),preIgreGrupe:groups(es().filter(e=>e.startTime<play))};
  await new Promise(r=>setTimeout(r,${after * 1000}));
  out.posle=sum(es());out.posleGrupe=groups(es());out.mode=document.getElementById('hud')?.hidden===false?'igra':'meni';
  out.ucitavanje=globalThis.markoUcitavanje?JSON.parse(JSON.stringify(globalThis.markoUcitavanje)):null;
  return out;})()`);
if (process.env.SHOT) {   // SHOT=file.png: a picture of the page at the end
  const m = await send('Page.captureScreenshot', {format: 'png'});
  (await import('node:fs')).writeFileSync(process.env.SHOT, Buffer.from(m.result.data, 'base64'));
}
if (process.env.EVAL) res.eval = await evalJs(process.env.EVAL);   // EVAL='expression': read something from the page at the end
console.log(JSON.stringify({url, kind, played: before, wallSeconds: Math.round((Date.now() - t0) / 1000), errors, ...res}, null, 1));
quit(errors.length ? 1 : 0);
