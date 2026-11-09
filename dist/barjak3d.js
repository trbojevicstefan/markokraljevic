// The main menu's banner: a cloth barjak on a pole, waving in the wind (Three.js).
// The button keeps its text for screen readers and keyboards; the same words are embroidered on the cloth,
// so they ripple with it. Hover: the wind rises. Press: the cloth snaps. Without WebGL the SVG banner stays.
import * as THREE from 'three';

const W = 4.0, H = 0.66;                 // cloth size in world units (≈ the button's 8:1)
const VS = `
uniform float uTime, uWind, uSnap;
varying vec2 vUv; varying float vShade; varying float vGlint;
void main(){
  vUv = uv; vec3 p = position; float x = uv.x;            // x: 0 at the pole, 1 at the swallowtail
  float amp = uWind * (0.03 + 0.34 * x * x) + uSnap * 0.2 * x;
  float a1 = x * 10.0 - uTime * 4.2, a2 = x * 5.6 + uv.y * 2.4 - uTime * 2.7, a3 = x * 17.0 - uTime * 6.3 + uv.y * 3.0;
  float z = amp * (0.62 * sin(a1) + 0.30 * sin(a2) + 0.08 * sin(a3));
  float dz = amp * (0.62 * 10.0 * cos(a1) + 0.30 * 5.6 * cos(a2) + 0.08 * 17.0 * cos(a3)) / ${W.toFixed(1)};
  p.z += z;
  p.y += amp * 0.18 * sin(a1 * 0.5 + uv.y * 1.7) - x * x * 0.035 * uWind;   // the free end sags a little
  p.x -= abs(z) * 0.08;                                                      // folds take up length
  vec3 n = normalize(vec3(-dz, 0.0, 1.0));
  vShade = 0.62 + 0.38 * clamp(dot(n, normalize(vec3(-0.45, 0.35, 1.0))), 0.0, 1.0);
  vGlint = pow(clamp(dot(n, normalize(vec3(0.5, 0.2, 1.0))), 0.0, 1.0), 24.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;
const FS = `
uniform sampler2D uTex; uniform float uGlow;
varying vec2 vUv; varying float vShade; varying float vGlint;
void main(){
  vec4 c = texture2D(uTex, vUv);
  if (c.a < 0.5) discard;
  float gold = smoothstep(0.55, 0.9, c.r) * smoothstep(0.35, 0.7, c.g);       // the embroidered gold catches the light
  vec3 col = c.rgb * vShade + vGlint * (0.18 + 0.55 * gold) + uGlow * 0.06 * gold;
  gl_FragColor = vec4(col, 1.0);
}`;

function clothTexture(main, sub, eagle, scale) {
  const tw = 1600, th = Math.round(tw * H / W), c = document.createElement('canvas'); c.width = tw; c.height = th;
  const g = c.getContext('2d'), cut = th * 0.42;                             // the swallowtail's depth
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(tw, 0); g.lineTo(tw - cut, th / 2); g.lineTo(tw, th); g.lineTo(0, th); g.closePath(); g.clip();
  const base = g.createLinearGradient(0, 0, 0, th); base.addColorStop(0, '#b4281f'); base.addColorStop(.5, '#931d17'); base.addColorStop(1, '#6e130f');
  g.fillStyle = base; g.fillRect(0, 0, tw, th);
  // weave: fine threads and a little irregular light, so it reads as silk and not as paint
  g.globalAlpha = .07; for (let y = 0; y < th; y += 3) { g.fillStyle = y % 6 ? '#000' : '#fff'; g.fillRect(0, y, tw, 1); }
  g.globalAlpha = .05; for (let x = 0; x < tw; x += 4) { g.fillStyle = '#000'; g.fillRect(x, 0, 1, th); }
  g.globalAlpha = 1;
  // gold borders with a row of small crosses, as on the old banners
  const gold = g.createLinearGradient(0, 0, tw, 0); gold.addColorStop(0, '#b8913f'); gold.addColorStop(.5, '#f6dfa0'); gold.addColorStop(1, '#c9a24f');
  const band = th * .1;
  for (const y of [band * .55, th - band * 1.55]) {
    g.fillStyle = gold; g.fillRect(0, y, tw, band); g.fillStyle = '#6e130f'; g.fillRect(0, y + band * .38, tw, band * .24);
    g.fillStyle = '#f6dfa0'; for (let x = band * 2.5; x < tw - cut; x += band * 2.2) { g.fillRect(x - band * .09, y + band * .2, band * .18, band * .6); g.fillRect(x - band * .3, y + band * .41, band * .6, band * .18); }
  }
  g.restore();
  // gold edge along the cut and the hoist
  g.strokeStyle = '#e7c46a'; g.lineWidth = th * .025;
  g.beginPath(); g.moveTo(tw, 0); g.lineTo(tw - cut, th / 2); g.lineTo(tw, th); g.stroke();
  // the arms near the pole
  if (eagle) { const eh = th * .62, ew = eh; g.drawImage(eagle, th * .32, (th - eh) / 2, ew, eh); }
  // the words, embroidered in gold with a dark outline
  const x0 = th * 1.02, x1 = tw - cut * 1.25, cx = (x0 + x1) / 2, room = (x1 - x0) * .94;
  let mainSize = Math.round(th * (sub ? .36 : .44) * scale);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  const setMain = () => { g.font = `700 ${mainSize}px "Cormorant Garamond", Georgia, serif`; if ('letterSpacing' in g) g.letterSpacing = `${Math.round(mainSize * .06)}px`; };
  setMain(); const wide = g.measureText(main).width; if (wide > room) { mainSize = Math.floor(mainSize * room / wide); setMain(); }   // long English labels shrink to fit
  const my = sub ? th * .4 : th * .52;
  g.lineWidth = mainSize * .16; g.strokeStyle = '#3a0805'; g.strokeText(main, cx, my);
  const tg = g.createLinearGradient(0, my - mainSize / 2, 0, my + mainSize / 2); tg.addColorStop(0, '#fff3c8'); tg.addColorStop(.5, '#f3d58a'); tg.addColorStop(1, '#c99a3e');
  g.fillStyle = tg; g.fillText(main, cx, my);
  if (sub) { const ss = Math.round(th * .19 * scale); g.font = `italic 600 ${ss}px "Cormorant Garamond", Georgia, serif`; if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.lineWidth = ss * .14; g.strokeText(sub, cx, th * .7); g.fillStyle = '#f6dca8'; g.fillText(sub, cx, th * .7); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

function labelOf(el) {
  const small = el.querySelector('small'), sub = small ? small.textContent.trim() : '';
  let main = ''; for (const n of el.childNodes) if (n !== small && n.nodeType === 3) main += n.textContent;
  main = main.replace(/[→✦]/g, ' ').replace(/\s+/g, ' ').trim();
  return { main: main || el.textContent.replace(/[→✦]/g, '').trim(), sub };
}

export async function mountBanner(el) {
  const canvas = document.createElement('canvas'); canvas.className = 'flag3d'; canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, premultipliedAlpha: false }); } catch { return null; }
  renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.prepend(canvas); el.classList.add('has-flag');
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(24, 1, .1, 50);
  cam.position.set(.3, .07, 11); cam.lookAt(.06, .07, 0);
  const uni = { uTime: { value: 0 }, uWind: { value: 1 }, uSnap: { value: 0 }, uGlow: { value: 0 }, uTex: { value: null } };
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(W, H, 96, 10), new THREE.ShaderMaterial({ uniforms: uni, vertexShader: VS, fragmentShader: FS, side: THREE.DoubleSide }));
  cloth.position.x = .12; scene.add(cloth);
  // the pole: dark wood with a gilt apple and a small cross
  scene.add(new THREE.AmbientLight(0xffffff, .55)); const sun = new THREE.DirectionalLight(0xfff0d0, 1.6); sun.position.set(-2, 3, 5); scene.add(sun);
  const wood = new THREE.MeshStandardMaterial({ color: 0x3b2414, roughness: .55, metalness: .1 }), gilt = new THREE.MeshStandardMaterial({ color: 0xe0b860, roughness: .28, metalness: .85 });
  const px = cloth.position.x - W / 2 - .03, pole = new THREE.Mesh(new THREE.CylinderGeometry(.035, .04, H + .26, 16), wood); pole.position.set(px, -.04, 0); scene.add(pole);
  const apple = new THREE.Mesh(new THREE.SphereGeometry(.075, 24, 16), gilt); apple.position.set(px, H / 2 + .1, 0); scene.add(apple);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(.022, .17, .022), gilt); crossV.position.set(px, H / 2 + .22, 0); scene.add(crossV);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(.11, .022, .022), gilt); crossH.position.set(px, H / 2 + .24, 0); scene.add(crossH);
  for (const y of [H / 2 - .02, -H / 2 + .02]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(.05, .012, 8, 20), gilt); ring.position.set(px, y, 0); ring.rotation.y = Math.PI / 2; scene.add(ring); }

  const eagle = await new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = 'assets/eagle.svg'; });
  let label = '', want = true;
  const redraw = () => { want = false; const L = labelOf(el), key = L.main + '|' + L.sub; if (key === label && uni.uTex.value) return; label = key;
    uni.uTex.value?.dispose(); uni.uTex.value = clothTexture(L.main, L.sub, eagle, 1); };
  document.fonts?.load?.('700 40px "Cormorant Garamond"').then(() => { label = ''; want = true; });
  new MutationObserver(() => { want = true; }).observe(el, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  let hover = 0, last = performance.now(), w = 0, h = 0;
  el.addEventListener('pointerenter', () => hover = 1); el.addEventListener('pointerleave', () => hover = 0);
  el.addEventListener('focus', () => hover = 1); el.addEventListener('blur', () => hover = 0);
  el.addEventListener('pointerdown', () => uni.uSnap.value = 1);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(now) {
    requestAnimationFrame(frame);
    const shown = el.classList.contains('primary') && el.offsetParent !== null && !document.getElementById('menu')?.hidden;
    canvas.style.visibility = shown ? 'visible' : 'hidden'; el.classList.toggle('flag-on', shown);
    if (!shown) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (want) redraw();
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (cw !== w || ch !== h) { w = cw; h = ch; renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1)); renderer.setSize(w, h, false); cam.aspect = w / h;
      // fit the cloth and the pole into the canvas whatever its shape
      const t = Math.tan(cam.fov * Math.PI / 360), needW = (W + .5) / 2 / t / cam.aspect, needH = .56 / t;
      cam.position.set(.8, .14, Math.max(needW, needH) * 1.02); cam.lookAt(.1, .04, 0); cam.updateProjectionMatrix(); }
    uni.uTime.value += dt * (reduced ? .25 : 1);
    uni.uWind.value += ((hover ? 1.7 : 1) * (reduced ? .4 : 1) - uni.uWind.value) * Math.min(1, dt * 3);
    uni.uSnap.value = Math.max(0, uni.uSnap.value - dt * 2.2); uni.uGlow.value += (hover - uni.uGlow.value) * Math.min(1, dt * 6);
    renderer.render(scene, cam);
  }
  requestAnimationFrame(frame);
  return { canvas };
}
