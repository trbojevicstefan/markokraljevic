// headless scout (needs the preview server on :$SCOUT_PORT, default 4174, and Edge): node tools/scout.mjs <level> [step] [from] [to] [day|night|storm]
// -> .scout/<level>-<x>.png (day) or .scout/<level>.<variant>-<x>.png; sheet: python tools/sheet.py <level>[.<variant>]
import {spawn} from 'node:child_process';
import {mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const [level, stepArg, fromArg, toArg, varArg] = process.argv.slice(2);
const VAR = varArg || process.env.SCOUT_V || 'day', TAG = VAR === 'day' ? level : level + '.' + VAR, HTTP = +(process.env.SCOUT_PORT || 4174);
const STEP = +(stepArg || 1150), PORT = 9333 + Math.floor(Math.random() * 500);
const out = join(here, '..', '.scout'); mkdirSync(out, {recursive: true});
const prof = join(here, '..', '.scout', 'edge-prof-' + PORT);
const exe = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const br = spawn(exe, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, '--window-size=1280,720', '--hide-scrollbars', '--mute-audio', '--no-first-run', '--disable-extensions', '--force-device-scale-factor=1', 'about:blank'], {stdio: 'ignore'});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (tabs.find(t => t.type === 'page')) break; } catch {} await sleep(250); }
const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const wait = new Map();
ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && wait.has(m.id)) { wait.get(m.id)(m); wait.delete(m.id); } });
const cdp = (method, params = {}) => new Promise(r => { const i = ++id; wait.set(i, r); ws.send(JSON.stringify({id: i, method, params})); });
const ev = async expr => { const r = await cdp('Runtime.evaluate', {expression: expr, awaitPromise: true, returnByValue: true}); if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result?.result?.value; };
try {
  await cdp('Emulation.setDeviceMetricsOverride', {width: 1280, height: 720, deviceScaleFactor: 1, mobile: false});
  await cdp('Page.navigate', {url: `http://localhost:${HTTP}/index.html?scout&novo=${level}`});
  for (let i = 0; i < 60; i++) { await sleep(500); if (await ev(`!!(window.markoDev&&markoDev.world&&markoDev.world.platforms&&markoDev.mode==='play')`).catch(() => false)) break; }
  await sleep(3500); // art
  if (VAR !== 'day') { await ev(`markoDev.startLevel(markoDev.LEVELS.findIndex(L=>L.id==='${level}'),'${VAR}')`); for (let i = 0; i < 40; i++) { await sleep(500); if (await ev(`markoDev.mode==='play'`).catch(() => false)) break; } await sleep(3000); await ev(`(()=>{const d=document.getElementById('dialogue');if(d)d.hidden=true;})()`); }
  await ev(`(()=>{const s=document.createElement('style');s.textContent='#hud,.hud,#dialogue,#toast,#quest,.quest,#controls,.controls,header,footer{visibility:hidden!important}';document.head.appendChild(s);
   window.__go=(x)=>{const d=markoDev,p=d.p,w=d.world;d.keys.clear();d.pressed.clear();let g=null;for(const pl of w.platforms){if(pl.ground&&x>=pl.x&&x<=pl.x+pl.w&&(g===null||pl.y<g))g=pl.y;}
    if(g===null){let best=1e9;for(const pl of w.platforms){if(!pl.ground)continue;const c=Math.max(pl.x,Math.min(x,pl.x+pl.w));if(Math.abs(c-x)<best){best=Math.abs(c-x);g=pl.y;}}}
    p.x=x;p.y=g-112;p.vx=0;p.vy=0;d.step(160);d.keys.clear();return Math.round(p.x)+','+Math.round(p.y)+','+d.mode;};})()`);
  const W = await ev(`Math.max(...markoDev.world.platforms.map(p=>p.x+p.w))`);
  const info = await ev(`markoDev.world.traps.map(t=>t.kind+'@'+Math.round(t.x)).join(' ')`);
  console.log(level, 'width', W, '|', info);
  const from = +(fromArg || 500), to = +(toArg || W - 300);
  for (let x = from; x <= to + STEP - 1; x += STEP) {
    const xx = Math.min(x, to);
    const r = await ev(`__go(${xx})`); await sleep(350);
    if (!/play$/.test(r)) console.log('  mode!', r);
    const shot = await cdp('Page.captureScreenshot', {format: 'png'});
    writeFileSync(join(out, `${TAG}-${String(xx).padStart(5, '0')}.png`), Buffer.from(shot.result.data, 'base64'));
    if (xx >= to) break;
  }
  console.log('done');
} finally { try { await cdp('Browser.close'); } catch {} await sleep(500); try { br.kill(); } catch {} await sleep(500); try { rmSync(prof, {recursive: true, force: true}); } catch {} process.exit(0); }
