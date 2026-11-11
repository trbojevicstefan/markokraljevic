// Three.js stage: composites the 2D game layer into a WebGL scene with depth, light and post effects.
// World units match the game (x right, y down); Three.js space uses (x, -y, z).
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// Painted layers are rendered at 80% brightness and restored after bloom, so only
// HDR effects (magic, sparks, glow layer) cross the bloom threshold.
const ART = 0.8;

// Per-chapter look: colour grade, sky, weather.
const LOOKS = [
  {gain: [1.06, 1.0, 0.93], lift: [0.02, 0.012, 0.03], sat: 1.1, contrast: 1.06, dusk: 0, rays: 1, magic: 0, leaves: 1, wind: 1, fireflies: .15, embers: 0, haze: [0.78, 0.72, 0.6]},
  {gain: [1.02, 0.98, 0.94], lift: [0.01, 0.015, 0.03], sat: 1.02, contrast: 1.08, dusk: .12, rays: .75, magic: 0, leaves: .8, wind: 1.2, fireflies: .1, embers: 0, haze: [0.7, 0.68, 0.6]},
  {gain: [0.95, 1.03, 1.06], lift: [0.0, 0.03, 0.045], sat: 1.12, contrast: 1.05, dusk: 0, rays: .9, magic: 1, leaves: .6, wind: .7, fireflies: 1, embers: 0, haze: [0.6, 0.78, 0.76]},
  {gain: [1.07, 1.03, 0.97], lift: [0.015, 0.01, 0.02], sat: 1.14, contrast: 1.08, dusk: 0, rays: 1.15, magic: 0, leaves: 1.25, wind: 2.2, fireflies: .1, embers: 0, haze: [0.8, 0.75, 0.62]},
  {gain: [1.1, 0.96, 0.85], lift: [0.03, 0.01, 0.0], sat: 1.06, contrast: 1.08, dusk: .38, rays: 1.25, magic: 0, leaves: .9, wind: 1.4, fireflies: 0, embers: .3, haze: [0.85, 0.66, 0.5]},
  {gain: [1.06, 0.84, 0.82], lift: [0.04, 0.0, 0.03], sat: .96, contrast: 1.14, dusk: 1, rays: .35, magic: 0, leaves: .35, wind: 1.6, fireflies: 0, embers: 1, haze: [0.55, 0.36, 0.38]},
];

// Winter pass (prevoj): cold grade, no leaves, snowfall.
LOOKS.push({gain: [0.94, 1.0, 1.1], lift: [0.03, 0.04, 0.06], sat: .82, contrast: 1.05, dusk: 0, rays: .7, magic: 0, leaves: 0, wind: 1.6, fireflies: 0, embers: 0, haze: [0.8, 0.86, 0.96], snow: 1});
// Second set of places: cave, cellar, swamp, mine, hilltop ruins, river before dawn.
LOOKS.push(
  {gain: [0.92, 1.02, 1.07], lift: [0.0, 0.03, 0.045], sat: 1.08, contrast: 1.07, dusk: 0, rays: .25, magic: .8, leaves: 0, wind: .3, fireflies: .7, embers: 0, haze: [0.3, 0.6, 0.62], grass: 0},
  {gain: [1.08, 0.95, 0.84], lift: [0.03, 0.015, 0.0], sat: 1.0, contrast: 1.1, dusk: .2, rays: .15, magic: 0, leaves: 0, wind: .2, fireflies: 0, embers: .5, haze: [0.46, 0.34, 0.26], grass: 0},
  {gain: [0.92, 1.0, 0.96], lift: [0.01, 0.03, 0.03], sat: .95, contrast: 1.06, dusk: 0, rays: .3, magic: .3, leaves: .3, wind: .6, fireflies: 1, embers: 0, haze: [0.42, 0.56, 0.48]},
  {gain: [1.05, 0.96, 0.88], lift: [0.02, 0.012, 0.0], sat: .9, contrast: 1.12, dusk: .1, rays: .2, magic: 0, leaves: 0, wind: .3, fireflies: 0, embers: .35, haze: [0.5, 0.42, 0.34], grass: 0},
  {gain: [1.08, 0.98, 0.9], lift: [0.02, 0.01, 0.02], sat: 1.06, contrast: 1.08, dusk: .25, rays: 1.2, magic: 0, leaves: .8, wind: 1.8, fireflies: 0, embers: 0, haze: [0.82, 0.7, 0.58]},
  {gain: [1.0, 0.97, 1.04], lift: [0.03, 0.02, 0.05], sat: 1.0, contrast: 1.04, dusk: .15, rays: .8, magic: 0, leaves: .5, wind: 1, fireflies: .3, embers: 0, haze: [0.72, 0.7, 0.8]},
);
for (const l of LOOKS) { l.snow ??= 0; l.grass ??= 1; l.rain = 0; l.night = 0; l.storm = 0; }

// Night and storm versions of any look: the painted layers are already dark, so the grade
// only cools things down; characters and props are tinted separately (see layerMat).
const weatherLooks = new Map();
function weatherLook(index, weather) {
  const base = LOOKS[index] || LOOKS[0];
  if (weather !== 'night' && weather !== 'storm') return base;
  const key = index + weather;
  if (weatherLooks.has(key)) return weatherLooks.get(key);
  const l = structuredClone(base), mul = (a, m) => a.map((v, i) => v * m[i]);
  if (weather === 'night') Object.assign(l, {gain: mul(l.gain, [.92, .95, 1.04]), lift: l.lift.map((v, i) => v + [0, .008, .025][i]), sat: l.sat * .86, rays: 0, dusk: 0, leaves: l.leaves * .3, fireflies: Math.max(l.fireflies, .8), magic: Math.max(l.magic, .3), embers: l.embers * .6, haze: mul(l.haze, [.42, .5, .72]), night: 1});
  else Object.assign(l, {gain: mul(l.gain, [.95, .97, 1.02]), sat: l.sat * .8, contrast: l.contrast * 1.06, rays: 0, dusk: 0, wind: 2.8, leaves: base.grass ? Math.min(1, l.leaves + .3) : 0, fireflies: 0, embers: l.embers * .3, snow: 0, haze: mul(l.haze, [.6, .65, .74]), rain: base.grass ? 1 : .3, night: .45, storm: 1});
  weatherLooks.set(key, l);
  return l;
}

const NOISE = /* glsl */`
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
#ifndef OCTAVES
#define OCTAVES 5
#endif
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<OCTAVES;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}
`;

const SCREEN_VERT = /* glsl */`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;

function canvasEl(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// Four autumn oak leaves in one strip.
function leafAtlas() {
  const c = canvasEl(512, 128), g = c.getContext('2d');
  const palettes = [['#f2c14e', '#c9821f'], ['#e2742c', '#9e3a17'], ['#b8342a', '#6e1d18'], ['#c99a45', '#6f5428']];
  palettes.forEach(([light, dark], i) => {
    g.save();
    g.translate(i * 128 + 64, 64);
    g.rotate(-0.6);
    g.beginPath();
    for (let k = 0; k <= 64; k++) {
      const a = k / 64 * Math.PI * 2;
      const lobes = 1 + 0.2 * Math.max(0, Math.sin(a * 7)) - 0.08;
      const rx = 52 * lobes, ry = 26 * lobes;
      const x = Math.cos(a) * rx, y = Math.sin(a) * ry;
      k ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.closePath();
    const grad = g.createLinearGradient(-50, -20, 50, 20);
    grad.addColorStop(0, light); grad.addColorStop(1, dark);
    g.fillStyle = grad;
    g.fill();
    g.strokeStyle = dark; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-58, 0); g.lineTo(48, 0); g.stroke();
    g.lineWidth = 1.5;
    for (let v = -30; v < 40; v += 16) {
      g.beginPath(); g.moveTo(v, 0); g.lineTo(v + 12, -17); g.moveTo(v, 0); g.lineTo(v + 12, 17); g.stroke();
    }
    g.restore();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Dark grass and fern silhouettes for the foreground.
function grassTexture() {
  const c = canvasEl(512, 256), g = c.getContext('2d');
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    const x = 20 + rnd() * 472, h = 90 + rnd() * 150, lean = (rnd() - .5) * 120, w = 3 + rnd() * 6;
    const shade = 10 + rnd() * 18;
    g.fillStyle = `rgb(${shade + 6},${shade + 16},${shade + 8})`;
    g.beginPath();
    g.moveTo(x - w, 256);
    g.quadraticCurveTo(x + lean * .3, 256 - h * .6, x + lean, 256 - h);
    g.quadraticCurveTo(x + lean * .3 + w * .5, 256 - h * .55, x + w, 256);
    g.fill();
    if (rnd() < .18) { g.beginPath(); g.ellipse(x + lean, 256 - h, 4, 9, lean * .01, 0, Math.PI * 2); g.fill(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function createStage({canvas, layer, glow, gorge, W, H, zoom, settings}) {
  const renderer = new THREE.WebGLRenderer({canvas, antialias: false, alpha: false, powerPreference: 'high-performance'});
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x0b1a1a, 1);
  renderer.setPixelRatio(1);

  const viewW = W / zoom, viewH = H / zoom;
  const FOV = 32, tanHalf = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const D = (viewH / 2) / tanHalf; // camera distance where z=0 shows exactly the game view
  const camera = new THREE.PerspectiveCamera(FOV, W / H, 20, 6000);
  const scene = new THREE.Scene();
  const clock = {time: 0};
  let look = structuredClone(LOOKS[0]);
  let lastTarget = null;

  // ---------- background painting with sky, sun rays and valley mist ----------
  const gorgeTex = new THREE.Texture(gorge);
  gorgeTex.colorSpace = THREE.SRGBColorSpace;
  gorgeTex.needsUpdate = true;
  const bgMat = new THREE.ShaderMaterial({
    uniforms: {
      uTex: {value: gorgeTex}, uPan: {value: 0}, uPanY: {value: 0}, uTime: {value: 0},
      uDusk: {value: 0}, uRays: {value: 1}, uMagic: {value: 0}, uLightning: {value: 0},
      uHaze: {value: new THREE.Color(...LOOKS[0].haze)},
    },
    vertexShader: SCREEN_VERT,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform float uPan,uPanY,uTime,uDusk,uRays,uMagic,uLightning; uniform vec3 uHaze;
      varying vec2 vUv;
      ${NOISE}
      void main(){
        vec2 s=vec2(vUv.x,1.-vUv.y)*vec2(1280.,720.);
        float drawW=1700.,drawH=drawW*1024./1536.;
        vec2 iuv=vec2((s.x+170.+uPan)/drawW,(s.y+110.+uPanY)/drawH);
        vec3 col=texture2D(uTex,vec2(iuv.x,1.-iuv.y)).rgb;
        float v=iuv.y;
        // atmospheric separation so characters read in front of the painting
        float l=dot(col,vec3(.2126,.7152,.0722));
        col=mix(vec3(l),col,.86);
        col=mix(col,uHaze,.03+.09*smoothstep(.3,.8,v));
        float m=fbm(vec2(iuv.x*3.2+uTime*.012,iuv.y*8.-uTime*.005));
        float band=smoothstep(.4,.6,v)*(1.-smoothstep(.8,.98,v));
        col=mix(col,uHaze*1.02,band*smoothstep(.4,.88,m)*.34);
        // god rays from the sun in the upper left
        vec2 d=vec2(vUv.x,1.-vUv.y)-vec2(.04,.02);d.x*=1.777;
        float ang=atan(d.y,d.x),dist=length(d);
        float rays=noise(vec2(ang*10.+uTime*.04,1.))*noise(vec2(ang*27.-uTime*.06,7.));
        rays=smoothstep(.12,.6,rays)*exp(-dist*1.5);
        col+=vec3(1.,.8,.52)*rays*uRays*.26;
        col+=vec3(1.,.86,.62)*exp(-dist*7.)*.12*uRays;
        // dusk and storm clouds for the final duel
        vec3 dusk=col*vec3(1.05,.6,.56)+vec3(.12,.02,.05)*(1.-v);
        dusk=mix(dusk,dusk*vec3(.5,.46,.66),smoothstep(.45,1.,v));
        float cl=fbm(vec2(iuv.x*2.4+uTime*.025,iuv.y*4.+uTime*.01));
        dusk=mix(dusk,vec3(.09,.035,.07),smoothstep(.45,.72,cl)*(1.-smoothstep(.05,.5,v))*.75);
        col=mix(col,dusk,uDusk);
        col=mix(col,col*vec3(.86,1.02,1.08)+vec3(0.,.025,.035),uMagic*.7);
        col+=vec3(.62,.7,1.)*uLightning*(1.15-v*.7);
        gl_FragColor=vec4(col*${ART.toFixed(2)},1.);
      }`,
    depthTest: false, depthWrite: false,
  });
  const fullQuad = new THREE.PlaneGeometry(2, 2);
  const bg = new THREE.Mesh(fullQuad, bgMat);
  bg.frustumCulled = false; bg.renderOrder = -100;
  scene.add(bg);

  // ---------- the chasm: layered forest silhouettes far below the road ----------
  const valleyMat = new THREE.ShaderMaterial({
    uniforms: {uCamX: {value: 0}, uCamY: {value: 0}, uTime: {value: 0}, uHaze: bgMat.uniforms.uHaze, uDusk: bgMat.uniforms.uDusk},
    vertexShader: SCREEN_VERT,
    fragmentShader: /* glsl */`
      uniform float uCamX,uCamY,uTime,uDusk; uniform vec3 uHaze; varying vec2 vUv;
      ${NOISE}
      void main(){
        vec2 s=vec2(vUv.x,1.-vUv.y)*vec2(${viewW.toFixed(1)},${viewH.toFixed(1)});
        float wy=uCamY+s.y;           // world y of this pixel at the road plane
        if(wy<596.) discard;
        float depth=clamp((wy-596.)/75.,0.,1.);
        vec3 deep=mix(vec3(.012,.032,.036),vec3(.035,.012,.028),uDusk);
        vec3 col=mix(uHaze*.5,deep,smoothstep(0.,.8,depth));
        for(int i=0;i<3;i++){
          float fi=float(i),par=.3+.18*fi;
          float x=uCamX*par+s.x;
          float crowns=fbm(vec2(x*.035+fi*13.,fi*3.))*16.+abs(sin(x*.11+fi*2.))*5.;
          float ridge=604.+fi*19.-crowns;
          vec3 tone=mix(uHaze*.42,deep,.2+.32*fi);
          tone=mix(tone,tone*vec3(1.35,.95,.62),.55*(1.-fi*.35));
          col=mix(col,tone,smoothstep(ridge,ridge+1.5,wy));
        }
        float mist=fbm(vec2((uCamX*.4+s.x)*.008+uTime*.04,wy*.03-uTime*.08));
        col=mix(col,uHaze*.8,smoothstep(.5,.9,mist)*.45*(1.-depth*.6));
        gl_FragColor=vec4(col*${ART.toFixed(2)},1.);
      }`,
    depthTest: false, depthWrite: false,
  });
  const valley = new THREE.Mesh(fullQuad, valleyMat);
  valley.frustumCulled = false; valley.renderOrder = -90;
  scene.add(valley);

  // ---------- mid-air haze between the painting and the road ----------
  const hazeMat = new THREE.ShaderMaterial({
    uniforms: {uCamX: {value: 0}, uTime: {value: 0}, uHaze: bgMat.uniforms.uHaze, uRays: bgMat.uniforms.uRays},
    vertexShader: SCREEN_VERT,
    fragmentShader: /* glsl */`
      uniform float uCamX,uTime,uRays; uniform vec3 uHaze; varying vec2 vUv;
      ${NOISE}
      void main(){
        float y=1.-vUv.y;
        float n=fbm(vec2(vUv.x*2.2+uCamX*.00045+uTime*.01,y*3.5));
        float a=smoothstep(.4,.85,n)*smoothstep(.3,.62,y)*(1.-smoothstep(.8,.9,y))*.22;
        // slanted light shafts
        float shaft=noise(vec2((vUv.x+y*.45)*7.+uCamX*.0003,uTime*.05));
        float b=smoothstep(.55,.95,shaft)*(1.-y)*.16*uRays;
        gl_FragColor=vec4(uHaze*${ART.toFixed(2)}+vec3(.05,.04,.02)*b,a+b);
      }`,
    transparent: true, depthTest: false, depthWrite: false,
  });
  const haze = new THREE.Mesh(fullQuad, hazeMat);
  haze.frustumCulled = false; haze.renderOrder = -50;
  scene.add(haze);

  // ---------- drifting leaves, motes, fireflies and embers (all GPU-animated) ----------
  const leafTex = leafAtlas();
  function leaves(count, z0, z1, spanX, spanY, size, order) {
    const base = new THREE.PlaneGeometry(1, 1);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute('position', base.attributes.position);
    geo.setAttribute('uv', base.attributes.uv);
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
    geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4));
    geo.instanceCount = count;
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTex: {value: leafTex}, uTime: clockUniform, uCam: camUniform, uZ: {value: new THREE.Vector2(z0, z1)},
        uSpan: {value: new THREE.Vector2(spanX, spanY)}, uWind: {value: 40}, uSize: {value: size},
        uFog: bgMat.uniforms.uHaze, uOpacity: {value: 1},
      },
      vertexShader: /* glsl */`
        attribute vec4 aSeed;
        uniform float uTime,uWind,uSize; uniform vec3 uCam; uniform vec2 uZ,uSpan;
        varying vec2 vUv; varying float vShade,vDepth,vVariant;
        mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1,0,0,0,c,s,0,-s,c);}
        mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0,-s,0,1,0,s,0,c);}
        mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0,-s,c,0,0,0,1);}
        void main(){
          float z=mix(uZ.x,uZ.y,aSeed.z);
          float x=aSeed.x*uSpan.x+uTime*uWind*(.6+.8*aSeed.w)+sin(uTime*.9+aSeed.y*40.)*28.;
          x=uCam.x+mod(x-uCam.x,uSpan.x)-uSpan.x*.5;
          float y=aSeed.y*uSpan.y-uTime*(38.+46.*fract(aSeed.w*13.1));
          y=uCam.y+mod(y-uCam.y,uSpan.y)-uSpan.y*.5;
          mat3 R=ry(uTime*(1.3+aSeed.w*1.8)+aSeed.x*30.)*rx(uTime*(.7+aSeed.z)+aSeed.y*20.)*rz(aSeed.w*6.28);
          vec3 lp=R*(position*uSize*(.65+.7*fract(aSeed.w*7.7)));
          vec3 n=R*vec3(0,0,1);
          vShade=.5+.4*abs(n.z)+.25*n.y;
          vUv=uv; vVariant=floor(fract(aSeed.w*3.7)*4.); vDepth=z;
          gl_Position=projectionMatrix*viewMatrix*vec4(vec3(x,y,z)+lp,1.);
        }`,
      fragmentShader: /* glsl */`
        uniform sampler2D uTex; uniform vec3 uFog; uniform float uOpacity;
        varying vec2 vUv; varying float vShade,vDepth,vVariant;
        void main(){
          vec4 c=texture2D(uTex,vec2((vUv.x+vVariant)*.25,vUv.y));
          if(c.a<.45) discard;
          vec3 col=mix(c.rgb*vShade,uFog,clamp(-vDepth/900.,0.,.7));
          gl_FragColor=vec4(col*${ART.toFixed(2)},uOpacity);
        }`,
      side: THREE.DoubleSide, transparent: true, depthTest: false, depthWrite: false,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = order;
    mesh.userData.max = count;
    scene.add(mesh);
    return mesh;
  }

  function sparks(count, z0, z1, spanX, spanY, size, color, rise, wander, order) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    const seed = new Float32Array(count * 4);
    for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: clockUniform, uCam: camUniform, uZ: {value: new THREE.Vector2(z0, z1)}, uSpan: {value: new THREE.Vector2(spanX, spanY)},
        uRise: {value: rise}, uWander: {value: wander}, uSize: {value: size}, uScale: pointScale,
        uIntensity: {value: 0}, uColor: {value: new THREE.Color(...color)},
      },
      vertexShader: /* glsl */`
        attribute vec4 aSeed;
        uniform float uTime,uRise,uWander,uSize,uScale,uIntensity; uniform vec3 uCam; uniform vec2 uZ,uSpan;
        varying float vA;
        void main(){
          float z=mix(uZ.x,uZ.y,aSeed.z);
          float x=aSeed.x*uSpan.x+sin(uTime*.45+aSeed.w*50.)*uWander+uTime*6.;
          x=uCam.x+mod(x-uCam.x,uSpan.x)-uSpan.x*.5;
          float y=aSeed.y*uSpan.y+uTime*uRise*(.55+.9*aSeed.w)+cos(uTime*.6+aSeed.x*40.)*uWander*.6;
          float fy=mod(y-uCam.y,uSpan.y)/uSpan.y;
          y=uCam.y+fy*uSpan.y-uSpan.y*.5;
          vec4 mv=viewMatrix*vec4(x,y,z,1.);
          gl_Position=projectionMatrix*mv;
          float tw=.5+.5*sin(uTime*(1.4+aSeed.w*3.)+aSeed.x*90.);
          vA=uIntensity*mix(.25,1.,tw)*smoothstep(0.,.12,fy)*smoothstep(1.,.88,fy);
          gl_PointSize=uSize*(.45+aSeed.w)*uScale/(-mv.z);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uColor; varying float vA;
        void main(){float d=length(gl_PointCoord-.5)*2.;float a=exp(-d*d*3.5)*(1.-smoothstep(.85,1.,d));
          gl_FragColor=vec4(uColor*a*vA,a*vA);}`,
      transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false; pts.renderOrder = order;
    scene.add(pts);
    return pts;
  }

  const clockUniform = {value: 0};
  const camUniform = {value: new THREE.Vector3()};
  const pointScale = {value: 1};

  const leavesBack = leaves(90, -700, -60, 2000, 1150, 13, -40);
  const motes = sparks(260, -500, 120, 1700, 1000, 5, [2.2, 1.7, 1.0], 6, 30, -30);
  const fireflies = sparks(140, -350, 160, 1500, 760, 9, [0.7, 2.6, 1.8], 10, 60, 15);
  const embers = sparks(220, -450, 200, 1600, 900, 7, [3.2, 1.2, 0.25], 70, 40, 16);

  // ---------- the 2D game layer and its additive glow layer ----------
  function canvasTexture(source) {
    const t = new THREE.CanvasTexture(source);
    t.colorSpace = THREE.SRGBColorSpace;
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    return t;
  }
  let layerTex = canvasTexture(layer), glowTex = canvasTexture(glow);
  const tintUniform = {value: new THREE.Vector3(1, 1, 1)};
  const layerMat = new THREE.ShaderMaterial({
    uniforms: {uTex: {value: layerTex}, uTint: tintUniform, uLight: {value: new THREE.Vector3(.5, .3, .5)}, uLightAmt: {value: 0}},
    vertexShader: SCREEN_VERT,
    fragmentShader: `uniform sampler2D uTex;uniform vec3 uTint,uLight;uniform float uLightAmt;varying vec2 vUv;void main(){vec4 c=texture2D(uTex,vUv);
      vec2 d=(vUv-uLight.xy)*vec2(${(W / H).toFixed(3)},1.);float pool=uLightAmt*(1.-smoothstep(0.,uLight.z,length(d)));
      gl_FragColor=vec4(c.rgb*mix(uTint,vec3(1.04,1.,.92),pool*.8)*${ART.toFixed(2)},c.a);}`,
    transparent: true, depthTest: false, depthWrite: false,
  });
  const layerMesh = new THREE.Mesh(fullQuad, layerMat);
  layerMesh.frustumCulled = false; layerMesh.renderOrder = 0;
  scene.add(layerMesh);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: {uTex: {value: glowTex}, uGain: {value: 1.05}},
    vertexShader: SCREEN_VERT,
    fragmentShader: `uniform sampler2D uTex;uniform float uGain;varying vec2 vUv;void main(){vec4 c=texture2D(uTex,vUv);gl_FragColor=vec4(c.rgb*uGain,c.a);}`,
    transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(fullQuad, glowMat);
  glowMesh.frustumCulled = false; glowMesh.renderOrder = 5;
  scene.add(glowMesh);

  // ---------- burst particles (sparks, magic) in a GPU ring buffer ----------
  const CAP = 5000;
  const burstGeo = new THREE.BufferGeometry();
  const aStart = new Float32Array(CAP * 3), aVel = new Float32Array(CAP * 3), aColor = new Float32Array(CAP * 3), aParams = new Float32Array(CAP * 4);
  for (let i = 0; i < CAP; i++) aParams[i * 4 + 1] = -1;
  burstGeo.setAttribute('position', new THREE.BufferAttribute(aStart, 3));
  burstGeo.setAttribute('aVel', new THREE.BufferAttribute(aVel, 3));
  burstGeo.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
  burstGeo.setAttribute('aParams', new THREE.BufferAttribute(aParams, 4));
  const burstMat = new THREE.ShaderMaterial({
    uniforms: {uTime: clockUniform, uScale: pointScale},
    vertexShader: /* glsl */`
      attribute vec3 aVel,aColor; attribute vec4 aParams; // birth, life, size, gravity
      uniform float uTime,uScale; varying vec3 vColor; varying float vK;
      void main(){
        float age=uTime-aParams.x;
        if(aParams.y<=0.||age<0.||age>aParams.y){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
        float drag=1.-exp(-age*2.2);
        vec3 p=position+aVel*drag/2.2-vec3(0.,aParams.w*age*age*.5,0.);
        vec4 mv=modelViewMatrix*vec4(p,1.);
        gl_Position=projectionMatrix*mv;
        vK=1.-age/aParams.y;
        vColor=aColor;
        gl_PointSize=aParams.z*uScale/(-mv.z)*(.35+.65*vK);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vColor; varying float vK;
      void main(){float d=length(gl_PointCoord-.5)*2.;float a=exp(-d*d*4.)*(1.-smoothstep(.8,1.,d))*vK;
        gl_FragColor=vec4(vColor*a,a);}`,
    transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
  });
  const burstPoints = new THREE.Points(burstGeo, burstMat);
  burstPoints.frustumCulled = false; burstPoints.renderOrder = 20;
  scene.add(burstPoints);
  let head = 0, dirtyFrom = CAP, dirtyTo = 0;
  function spawn(x, y, z, vx, vy, vz, color, life, size, gravity) {
    const i = head; head = (head + 1) % CAP;
    aStart.set([x, -y, z], i * 3);
    aVel.set([vx, -vy, vz], i * 3);
    aColor.set(color, i * 3);
    aParams.set([clock.time, life, size, gravity], i * 4);
    dirtyFrom = Math.min(dirtyFrom, i); dirtyTo = Math.max(dirtyTo, i + 1);
  }
  function flushParticles() {
    if (dirtyTo <= dirtyFrom) return;
    for (const name of ['position', 'aVel', 'aColor', 'aParams']) {
      const attr = burstGeo.attributes[name];
      attr.clearUpdateRanges();
      attr.addUpdateRange(dirtyFrom * attr.itemSize, (dirtyTo - dirtyFrom) * attr.itemSize);
      attr.needsUpdate = true;
    }
    dirtyFrom = CAP; dirtyTo = 0;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  function hdr(hex, power) {
    const c = new THREE.Color(hex);
    return [c.r * power, c.g * power, c.b * power];
  }

  // Front layer: leaves and grass that pass in front of the action.
  const leavesFront = leaves(26, 60, 330, 1150, 700, 17, 30);
  const grassTex = grassTexture();
  const grassGeo = new THREE.InstancedBufferGeometry();
  {
    const base = new THREE.PlaneGeometry(1, 1);
    base.translate(0, .5, 0);
    grassGeo.index = base.index;
    grassGeo.setAttribute('position', base.attributes.position);
    grassGeo.setAttribute('uv', base.attributes.uv);
    const n = 12, seed = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) seed.set([i / n + Math.random() * .04, Math.random(), Math.random(), Math.random()], i * 4);
    grassGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4));
    grassGeo.instanceCount = n;
  }
  const grassMat = new THREE.ShaderMaterial({
    uniforms: {uTex: {value: grassTex}, uTime: clockUniform, uCam: camUniform, uTan: {value: tanHalf}, uDusk: bgMat.uniforms.uDusk, uTint: tintUniform},
    vertexShader: /* glsl */`
      attribute vec4 aSeed; uniform float uTime,uTan; uniform vec3 uCam; varying vec2 vUv; varying float vSeed;
      void main(){
        float z=170.+aSeed.z*140.;
        float halfH=(uCam.z-z)*uTan;
        float span=halfH*1.777*2.+500.;
        float x=uCam.x+mod(aSeed.x*span-uCam.x,span)-span*.5;
        float h=13.+aSeed.y*22.;
        vec3 p=vec3(x+position.x*h*3.2,uCam.y-halfH-6.+position.y*h,z);
        p.x+=position.y*position.y*sin(uTime*1.6+aSeed.w*20.)*7.;
        vUv=vec2(fract(uv.x*.5+aSeed.w),uv.y);vSeed=aSeed.w;
        gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
      }`,
    fragmentShader: /* glsl */`
      uniform sampler2D uTex; uniform float uDusk; uniform vec3 uTint; varying vec2 vUv; varying float vSeed;
      void main(){vec4 c=texture2D(uTex,vUv);if(c.a<.5)discard;
        vec3 rim=mix(vec3(.16,.12,.05),vec3(.18,.05,.06),uDusk)*smoothstep(.5,1.,vUv.y);
        gl_FragColor=vec4((c.rgb+rim)*uTint*${ART.toFixed(2)},.96);}`,
    transparent: true, depthTest: false, depthWrite: false,
  });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.frustumCulled = false; grass.renderOrder = 40;
  scene.add(grass);

  // ---------- rain: slanted streaks in three depths over the world ----------
  const rainMat = new THREE.ShaderMaterial({
    uniforms: {uTime: clockUniform, uCam: {value: new THREE.Vector2()}, uRain: {value: 0}, uBolt: {value: 0}},
    vertexShader: SCREEN_VERT,
    fragmentShader: /* glsl */`
      uniform float uTime,uRain,uBolt; uniform vec2 uCam; varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float streaks(vec2 s,float cw,float period,float speed,float len,float par,float density){
        vec2 p=s+uCam*par;
        float x=(p.x+p.y*.24)/cw,col=floor(x),r=h(vec2(col,cw));
        float v=(p.y-uTime*speed)/period+r*7.,cell=floor(v),fy=fract(v);
        if(h(vec2(col,cell))>density) return 0.;
        float lf=len/period,head=.15+.7*h(vec2(cell,col));
        float y=smoothstep(head-lf,head,fy)*step(fy,head);
        return y*(1.-smoothstep(.05,.22,abs(fract(x)-.5)));
      }
      void main(){
        vec2 s=vec2(vUv.x,1.-vUv.y)*vec2(${W.toFixed(1)},${H.toFixed(1)});
        float a=streaks(s,7.,240.,1150.,24.,.3,.55)*.16+streaks(s,13.,360.,1600.,44.,.6,.5)*.24+streaks(s,24.,560.,2300.,80.,1.,.45)*.3;
        gl_FragColor=vec4(vec3(.6,.68,.8)*a*uRain*(1.+uBolt*2.),1.);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false,
  });
  const rain = new THREE.Mesh(fullQuad, rainMat);
  rain.frustumCulled = false; rain.renderOrder = 30;
  scene.add(rain);

  // ---------- post processing ----------
  const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, {type: THREE.HalfFloatType}));
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), .85, .55, ART + .04);
  composer.addPass(bloom);
  const grade = new ShaderPass({
    uniforms: {
      tDiffuse: {value: null}, uTime: {value: 0}, uRes: {value: new THREE.Vector2(W, H)},
      uShake: {value: new THREE.Vector2()}, uPunch: {value: 0}, uPunchAt: {value: new THREE.Vector2(.5, .5)},
      uWaves: {value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, 0, 0))},
      uAberr: {value: 0}, uHurt: {value: 0}, uFlash: {value: 0}, uFlashColor: {value: new THREE.Color(1, 1, 1)},
      uGain: {value: new THREE.Vector3(1, 1, 1)}, uLift: {value: new THREE.Vector3()}, uSat: {value: 1}, uContrast: {value: 1},
      uVignette: {value: .38}, uGrain: {value: .035}, uLow: {value: 0},
    },
    vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */`
      uniform sampler2D tDiffuse; uniform float uTime,uPunch,uAberr,uHurt,uFlash,uSat,uContrast,uVignette,uGrain,uLow;
      uniform vec2 uRes,uShake,uPunchAt; uniform vec4 uWaves[4]; uniform vec3 uFlashColor,uGain,uLift;
      varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){
        vec2 uv=(vUv-uPunchAt)*(1.-uPunch)+uPunchAt+uShake;
        float aspect=uRes.x/uRes.y;
        for(int i=0;i<4;i++){
          vec4 w=uWaves[i];
          if(w.w<=0.) continue;
          vec2 d=(uv-w.xy)*vec2(aspect,1.);
          float dist=length(d),r=w.z*.85;
          float ring=exp(-pow((dist-r)*16.,2.))*w.w*(1.-smoothstep(.2,.65,w.z));
          uv-=normalize(d+1e-5)/vec2(aspect,1.)*ring*.03;
        }
        vec2 dir=uv-.5;
        float ca=.0012+uAberr*.007;
        vec3 c=vec3(texture2D(tDiffuse,uv+dir*ca).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-dir*ca).b);
        c/=${ART.toFixed(2)};
        c=max(c,0.);
        float l=dot(c,vec3(.2126,.7152,.0722));
        c=mix(vec3(l),c,uSat);
        c=(c-.18)*uContrast+.18;
        c=c*uGain+uLift*(1.-c);
        // cool shadows, warm highlights
        c+=mix(vec3(-.012,0.,.018),vec3(.02,.008,-.015),smoothstep(.15,.7,l));
        float vig=smoothstep(.95,.3,length((vUv-.5)*vec2(1.,.82)));
        c*=mix(1.-uVignette,1.,vig);
        float edge=1.-vig;
        c*=mix(.84,1.,smoothstep(0.,.22,1.-vUv.y));
        c=mix(c,vec3(.55,.02,.03),clamp(uHurt*edge*.9+uLow*edge*(.25+.15*sin(uTime*5.)),0.,.85));
        c+=uFlashColor*uFlash;
        c+=(hash(vUv*uRes+fract(uTime)*100.)-.5)*uGrain;
        gl_FragColor=vec4(c,1.);
      }`,
  });
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  // ---------- sizing ----------
  let width = 0, height = 0;
  // Three quality tiers. They change only how big the picture is drawn and how much glow it gets, never the game itself.
  //   0: full, 1: lighter (smaller buffers, same effects), 2: fast ('Brže': no bloom, simpler sky).
  const TIERS = [
    {dpr: 2, maxW: 2560, layerW: 1920},
    {dpr: 1.5, maxW: 1600, layerW: 1280},
    {dpr: 1.25, maxW: 1280, layerW: 1152},
  ];
  // 'auto' starts from the device: phones, weak CPUs and software rendering get the fast tier, integrated graphics the lighter one.
  const gpuName = (() => {
    try {
      const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
      return String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || '');
    } catch { return ''; }
  })();
  const softwareGpu = /swiftshader|llvmpipe|softpipe|basic render|software/i.test(gpuName);
  const integratedGpu = /intel|radeon\(tm\) graphics|radeon graphics|vega \d+ graphics|mali|adreno|powervr|videocore/i.test(gpuName) && !/arc\(tm\) [ab]\d/i.test(gpuName);
  const deviceTier = softwareGpu || matchMedia('(pointer:coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4 ? 2 : integratedGpu ? 1 : 0;
  // A step down measured on this GPU in an earlier session is kept, so the game does not stutter again before it adapts.
  const PERF_KEY = 'marko-perf-v1';
  let autoTier = deviceTier;
  try {
    const saved = JSON.parse(localStorage.getItem(PERF_KEY) || 'null');
    if (saved && saved.gpu === gpuName) autoTier = Math.max(autoTier, Math.min(2, saved.tier | 0));
  } catch {}
  const currentTier = () => settings.quality === 'low' ? 2 : settings.quality === 'high' ? 0 : autoTier;
  let lastTier = null, lastLow = null;
  function applyQuality() {
    const tier = currentTier();
    if (tier === lastTier) return;
    lastTier = tier;
    const low = tier === 2;
    if (low !== lastLow) {
      lastLow = low;
      for (const m of [bgMat, valleyMat, hazeMat]) { m.defines = {...(m.defines || {}), OCTAVES: low ? 3 : 5}; m.needsUpdate = true; }
      bloom.enabled = !low;
    }
    width = 0;
  }
  // The canvas box is measured only when it really changes. Reading it every frame forced the browser
  // to lay out the page each frame, because the HUD is rewritten between frames.
  let box = null;
  function measure() { box = canvas.getBoundingClientRect(); }
  function resize() {
    applyQuality();
    if (!box) measure();
    const T = TIERS[lastTier];
    const dpr = Math.min(window.devicePixelRatio || 1, T.dpr);
    const cssW = Math.min(box.width || W, (box.height || H) * W / H);
    const w = Math.round(Math.max(640, Math.min(T.maxW, cssW * dpr)));
    const h = Math.round(w * H / W);
    if (w === width && h === height) return;
    width = w; height = h;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    grade.uniforms.uRes.value.set(w, h);
    pointScale.value = h / (2 * tanHalf); // screen px per world unit at distance 1
    const lw = Math.min(w, T.layerW), lh = Math.round(lw * H / W);
    layer.width = lw; layer.height = lh;
    glow.width = Math.round(lw / 2); glow.height = Math.round(lh / 2);
    layerTex.dispose(); glowTex.dispose();
    layerTex = canvasTexture(layer); glowTex = canvasTexture(glow);
    layerMat.uniforms.uTex.value = layerTex; glowMat.uniforms.uTex.value = glowTex;
  }
  resize();
  const remeasure = () => { measure(); resize(); };
  window.addEventListener('resize', remeasure);
  if (typeof ResizeObserver === 'function') new ResizeObserver(remeasure).observe(canvas);

  // Frame pacing watch for 'auto': when most frames over a few seconds of play come slower than ~48 fps,
  // drop one tier. It never steps back up by itself; choosing 'Visok kvalitet' in the settings always wins.
  const pace = {last: 0, gaps: [], span: 0, hold: 0};
  function watchPace(mode) {
    const now = performance.now(), gap = now - pace.last;
    pace.last = now;
    if (mode !== 'play' || settings.quality !== 'auto' || autoTier >= 2 || document.hidden || !(gap > 0 && gap < 250)) return;
    if (pace.hold > 0) { pace.hold -= gap; return; }
    pace.gaps.push(gap); pace.span += gap;
    if (pace.span < 3000) return;
    const gaps = pace.gaps.sort((a, b) => a - b), median = gaps[gaps.length >> 1];
    pace.gaps = []; pace.span = 0;
    if (median <= 20.5) return;
    autoTier++;
    pace.hold = 2000; // the resize itself costs a frame or two; do not count it
    try { localStorage.setItem(PERF_KEY, JSON.stringify({gpu: gpuName, tier: autoTier})); } catch {}
  }

  // ---------- effects state ----------
  const waves = [];
  let shakeAmt = 0, punch = 0, flash = 0, aberr = 0, lightning = 0, nextBolt = 4, camState = {x: 0, y: 0};
  const flashColor = new THREE.Color(1, 1, 1);
  const emitAcc = {};
  const reduced = () => !!settings.reduced;

  function toScreen(x, y) {
    return [(x - camState.x) / viewW, 1 - (y - camState.y) / viewH];
  }
  function shockwave(x, y, strength = 1) {
    if (reduced()) return;
    const [u, v] = toScreen(x, y);
    waves.push({u, v, age: 0, strength});
    if (waves.length > 4) waves.shift();
  }
  function burst(x, y, color, count = 14, speed = 150, o = {}) {
    const col = hdr(color, o.power ?? 2.4);
    const n = Math.round(count * (reduced() ? .5 : 1) * (o.mult ?? 1.4));
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = speed * (.3 + Math.random() * 1.1) * 1.6;
      spawn(x + rand(-6, 6), y + rand(-6, 6), rand(-30, 30), Math.cos(a) * v, Math.sin(a) * v - (o.lift ?? 40), rand(-60, 60),
        col, rand(.35, .8) * (o.life ?? 1), rand(7, 13) * (o.size ?? 1), o.gravity ?? 420);
    }
  }

  const snow = sparks(340, -520, 260, 1700, 1000, 8, [1.5, 1.6, 1.8], -55, 45, 14);
  // Level backgrounds: the artist's layers, each scaled to screen height and tiled horizontally.
  // The layers are not drawn to tile: the last SEAM of each tile crossfades into its start, so no hard seam (sky changing colour) shows.
  // When the road climbs a layer slides down and its top row would show as a ruled edge: the sky mirrors there, the others fade in.
  const SEAM = .12;
  let levelLayers = [];
  function setLevel(layers) {
    for (const l of levelLayers) { scene.remove(l.mesh); l.mat.dispose(); l.tex.dispose(); }
    levelLayers = [];
    bg.visible = !(layers && layers.length);
    (layers || []).forEach((L, i) => {
      const tex = new THREE.Texture(L.image);
      tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
      const w = L.image.width, h = L.image.height, k = Math.max(H / h, i === 0 ? W / w : 0);
      const mat = new THREE.ShaderMaterial({
        uniforms: {uTex: {value: tex}, uOff: {value: 0}, uOffY: {value: 0}, uK: {value: k}, uSize: {value: new THREE.Vector2(w, h)}, uFog: {value: (1 - L.speed) * .26}, uHaze: bgMat.uniforms.uHaze, uDusk: bgMat.uniforms.uDusk, uLightning: bgMat.uniforms.uLightning},
        vertexShader: SCREEN_VERT,
        fragmentShader: `uniform sampler2D uTex;uniform float uOff,uOffY,uK,uFog,uDusk,uLightning;uniform vec2 uSize;uniform vec3 uHaze;varying vec2 vUv;
          void main(){vec2 s=vec2(vUv.x,1.-vUv.y)*vec2(${W.toFixed(1)},${H.toFixed(1)});float th=uSize.y*uK;float ty=(s.y-(${H.toFixed(1)}-th)+uOffY)/th;
            ${i === 0 ? 'ty=min(abs(ty),1.);' : 'if(ty<0.||ty>1.){gl_FragColor=vec4(0.);return;}'}float raw=(s.x/uK+uOff)/uSize.x,P=${(1-SEAM).toFixed(3)},u=fract(raw/P)*P;vec4 c=texture2D(uTex,vec2(u,1.-ty));if(u<${SEAM.toFixed(3)}){vec4 c2=texture2D(uTex,vec2(u+P,1.-ty));c=mix(c2,c,smoothstep(0.,${SEAM.toFixed(3)},u));}
            vec3 col=mix(c.rgb,uHaze,uFog);col=mix(col,col*vec3(1.05,.62,.58),uDusk*.55);col+=vec3(.6,.7,1.)*uLightning*.6;
            gl_FragColor=vec4(col*${ART.toFixed(2)},c.a*mix(1.,smoothstep(0.,.16,ty),clamp(-uOffY/(th*.16),0.,1.)));}`,
        transparent: i > 0, depthTest: false, depthWrite: false,
      });
      const mesh = new THREE.Mesh(fullQuad, mat);
      mesh.frustumCulled = false; mesh.renderOrder = -100 + i * .5;
      scene.add(mesh);
      levelLayers.push({mesh, mat, tex, speed: L.speed, k});
    });
  }

  const api = {
    setLevel,
    viewW, viewH,
    burst,
    hit(x, y, heavy) {
      burst(x, y, '#ffcf8a', heavy ? 26 : 16, heavy ? 260 : 190, {power: 3, gravity: 700});
      burst(x, y, '#fff3d6', heavy ? 5 : 3, 90, {power: 2.6, size: 1.3, life: .35, gravity: 0});
      if (heavy) { shockwave(x, y, .7); punch = Math.max(punch, .018); aberr = Math.max(aberr, .5); }
      else punch = Math.max(punch, .007);
    },
    parry(x, y) {
      burst(x, y, '#d8fff0', 34, 280, {power: 3.6, gravity: 200});
      shockwave(x, y, 1.1);
      flash = Math.max(flash, reduced() ? .05 : .14); flashColor.set(.85, 1, .95);
      aberr = Math.max(aberr, .9); punch = Math.max(punch, .02);
    },
    kill(x, y) {
      burst(x, y - 40, '#ffd27a', 12, 200, {power: 1.7, gravity: 300});
      for (let i = 0; i < 6; i++) spawn(x + rand(-25, 25), y - rand(10, 90), rand(-20, 20), rand(-15, 15), -rand(40, 110), 0, hdr('#ffe7b0', 1.2), rand(1, 1.8), rand(5, 8), -20);
    },
    spell(x, y) {
      burst(x, y, '#9dffd6', 46, 220, {power: 3, gravity: -60, life: 1.4});
      shockwave(x, y, .6);
    },
    pillar(x, y) {
      for (let i = 0; i < 90; i++) spawn(x + rand(-30, 30), y - rand(0, 40), rand(-30, 30), rand(-20, 20), -rand(150, 520), 0, hdr(i % 3 ? '#8fffd2' : '#fff6c8', 3), rand(.8, 1.7), rand(8, 15), -60);
      shockwave(x, y - 60, .8);
      flash = Math.max(flash, .08); flashColor.set(.6, 1, .85);
    },
    roar(x, y) {
      burst(x, y - 70, '#ff7a5a', 70, 330, {power: 3.2, gravity: 250});
      shockwave(x, y - 60, 1.6);
      flash = Math.max(flash, .2); flashColor.set(1, .3, .25);
      lightning = 1; aberr = 1; settings.onThunder?.();
    },
    flash(hex, amount) { flashColor.set(hex); flash = Math.max(flash, amount); },
    shake(amount) { shakeAmt = Math.max(shakeAmt, amount); },

    perf() {
      return {gpu: gpuName, tier: lastTier, auto: settings.quality === 'auto', size: [width, height], layer: [layer.width, layer.height]};
    },

    render(state) {
      const dt = Math.min(.05, state.dt);
      clock.time += dt;
      clockUniform.value = clock.time;
      watchPace(state.mode);
      resize();
      camState = {x: state.camX, y: state.camY};

      // blend toward the chapter's look
      const target = weatherLook(state.look ?? state.zone, state.weather);
      // a campaign level's painted layers appear at once, so its grade must not lag behind
      if (state.weather && target !== lastTarget) look = structuredClone(target);
      lastTarget = target;
      const k = Math.min(1, dt * .9);
      for (const key of Object.keys(look)) {
        if (Array.isArray(look[key])) look[key] = look[key].map((v, i) => v + (target[key][i] - v) * k);
        else look[key] += (target[key] - look[key]) * k;
      }
      const menu = state.mode === 'menu';

      camera.position.set(state.camX + viewW / 2, -(state.camY + viewH / 2), D);
      camera.updateMatrixWorld();
      camUniform.value.set(camera.position.x, camera.position.y, D);

      // background
      const u = bgMat.uniforms;
      u.uTime.value = clock.time;
      u.uPan.value = Math.min(1, state.camX / 29900) * 200 + (menu ? Math.sin(clock.time * .05) * 12 : 0);
      u.uPanY.value = Math.max(-30, Math.min(30, (state.camY - 58) * .25));
      u.uDusk.value = look.dusk; u.uRays.value = look.rays; u.uMagic.value = look.magic;
      u.uHaze.value.setRGB(...look.haze);
      if ((state.zone === 5 || target.storm) && !menu && !reduced()) {
        nextBolt -= dt;
        if (nextBolt <= 0) { lightning = .55 + Math.random() * .4; nextBolt = 5 + Math.random() * 7; settings.onThunder?.(); }
      }
      lightning = Math.max(0, lightning - dt * 3.2);
      u.uLightning.value = lightning > .02 ? lightning * (.6 + .4 * Math.sin(clock.time * 60)) : 0;
      valleyMat.uniforms.uCamX.value = state.camX; valleyMat.uniforms.uCamY.value = state.camY; valleyMat.uniforms.uTime.value = clock.time;
      hazeMat.uniforms.uCamX.value = state.camX; hazeMat.uniforms.uTime.value = clock.time;

      // ambient particles
      const r = reduced() ? .45 : 1;
      const q = lastLow ? .45 : 1;
      leavesBack.geometry.instanceCount = Math.round(leavesBack.userData.max * Math.min(1, look.leaves) * r * q);
      leavesFront.geometry.instanceCount = Math.round(leavesFront.userData.max * Math.min(1, look.leaves) * r);
      leavesBack.material.uniforms.uWind.value = leavesFront.material.uniforms.uWind.value = 30 * look.wind;
      motes.material.uniforms.uIntensity.value = .55 * look.rays;
      fireflies.material.uniforms.uIntensity.value = look.fireflies;
      embers.material.uniforms.uIntensity.value = look.embers * 1.2;
      snow.material.uniforms.uIntensity.value = look.snow * .85;
      grass.visible = target.grass > .5;
      rain.visible = look.rain > .02;
      rainMat.uniforms.uRain.value = look.rain * (reduced() ? .5 : 1);
      rainMat.uniforms.uBolt.value = u.uLightning.value;
      rainMat.uniforms.uCam.value.set(state.camX * zoom, state.camY * zoom);
      const nightTint = [.27, .31, .52]; // linear light: about half the brightness on screen
      tintUniform.value.set(...nightTint.map(v => 1 + (v - 1) * look.night + u.uLightning.value * .5 * look.storm));
      layerMat.uniforms.uLightAmt.value = look.night;
      if (state.player) { const [lu, lv] = toScreen(state.player.x, state.player.y - 70); layerMat.uniforms.uLight.value.set(lu, lv, .55); }
      for (const l of levelLayers) { l.mat.uniforms.uOff.value = state.camX * zoom * l.speed / l.k; l.mat.uniforms.uOffY.value = (state.camY - 58) * zoom * l.speed * .35; }

      // continuous emitters requested by the game (fairy trail, wine aura, runes, bridges)
      for (const e of state.emitters || []) {
        const rate = e.rate * r;
        emitAcc[e.id] = (emitAcc[e.id] || 0) + rate * dt;
        while (emitAcc[e.id] >= 1) {
          emitAcc[e.id] -= 1;
          if (e.kind === 'fairy') spawn(e.x + rand(-14, 14), e.y + rand(-30, 6), rand(-10, 10), rand(-25, 25), rand(-10, 30), 0, hdr(Math.random() < .3 ? '#fff4c4' : '#9dffd8', 2.6), rand(.5, 1.1), rand(5, 9), -30);
          else if (e.kind === 'buff') spawn(e.x + rand(-26, 26), e.y - rand(5, 120), rand(-15, 25), rand(-15, 15), -rand(50, 130), 0, hdr(Math.random() < .5 ? '#ffb44a' : '#ffdf7a', 3), rand(.4, .9), rand(6, 11), -40);
          else if (e.kind === 'rune') spawn(e.x + rand(-18, 18), e.y - rand(10, 60), rand(-10, 10), rand(-8, 8), -rand(30, 80), 0, hdr('#8fffd2', 2.4), rand(.9, 1.6), rand(6, 10), -10);
          else if (e.kind === 'bridge') spawn(e.x + rand(0, e.w), e.y + rand(-4, 8), rand(-15, 15), rand(-6, 6), -rand(20, 70), 0, hdr(Math.random() < .3 ? '#ffffff' : '#9dffd8', 2.2), rand(.7, 1.4), rand(5, 9), -10);
          else if (e.kind === 'fire') spawn(e.x + rand(-(e.w || 20) / 2, (e.w || 20) / 2), e.y - rand(0, 25), rand(-20, 20), rand(-18, 18), -rand(70, 190), 0, hdr(Math.random() < .5 ? '#ff6a14' : Math.random() < .5 ? '#ffb030' : '#ffe080', 3.2), rand(.4, 1), rand(6, 13), -60);
          else if (e.kind === 'item') { if (Math.random() < .5) spawn(e.x + rand(-10, 10), e.y + rand(-12, 12), 0, rand(-8, 8), -rand(15, 40), 0, hdr('#f0d49a', 1.3), rand(.5, 1), rand(3, 6), 0); }
          else if (e.kind === 'boss') spawn(e.x + rand(-40, 40), e.y - rand(10, 150), rand(-20, 20), rand(-20, 20), -rand(40, 110), 0, hdr(e.color || '#ff6a4a', 2.6), rand(.4, .8), rand(6, 11), -30);
        }
      }
      flushParticles();

      // post state
      shakeAmt = Math.max(shakeAmt, reduced() ? 0 : state.shake || 0);
      const sh = shakeAmt / viewH;
      grade.uniforms.uShake.value.set((Math.random() - .5) * sh * .6, (Math.random() - .5) * sh * .6);
      shakeAmt = Math.max(0, shakeAmt - dt * 30);
      punch = Math.max(0, punch - dt * .12);
      grade.uniforms.uPunch.value = reduced() ? 0 : punch;
      if (state.player) {
        const [pu, pv] = toScreen(state.player.x, state.player.y - 60);
        grade.uniforms.uPunchAt.value.set(pu, pv);
      }
      for (const w of waves) w.age += dt;
      while (waves.length && waves[0].age > .7) waves.shift();
      grade.uniforms.uWaves.value.forEach((v, i) => {
        const w = waves[i];
        if (w) v.set(w.u, w.v, w.age, w.strength); else v.set(0, 0, 0, 0);
      });
      aberr = Math.max(0, aberr - dt * 2.5);
      grade.uniforms.uAberr.value = reduced() ? 0 : aberr;
      flash = Math.max(0, flash - dt * 1.6);
      grade.uniforms.uFlash.value = flash;
      grade.uniforms.uFlashColor.value.copy(flashColor);
      grade.uniforms.uHurt.value = state.hurt || 0;
      grade.uniforms.uLow.value = state.lowHealth || 0;
      grade.uniforms.uTime.value = clock.time;
      grade.uniforms.uGain.value.set(...look.gain);
      grade.uniforms.uLift.value.set(...look.lift);
      grade.uniforms.uSat.value = look.sat;
      grade.uniforms.uContrast.value = look.contrast;
      grade.uniforms.uGrain.value = reduced() ? .015 : .03;
      bloom.strength = reduced() ? .3 : .48;

      layerTex.needsUpdate = true;
      glowTex.needsUpdate = true;
      composer.render(dt);
    },
  };
  return api;
}
