// ================= Dressing the greybox levels: realistic pictures over the grey rooms =================
// The contract with the "realisticne-pozadine" work is dist/assets/realisticno/manifest.json:
//   {version:1, biomes:{<biome>:{layers:[{id,file,speed,w,h}], interior:{layers:[...]},
//     materials:{ground,wall,platform,beam,ceiling}, props:[{id,file,w,h,anchor:'bottom',solid}]}}}
// with file paths relative to dist/assets/. The biomes are podgradje, urvina and klisura.
// Until the manifest (or one of its files) is there, the pictures the artist already painted for the game stand in
// (dist/assets/world: the backdrops of the pohodi, ground strips, masonry and rock, platforms and props); until those
// load too, the room stays grey. Rooms with `interior` use the biome's interior set (cellars, caves, the inside of a
// tower); a room's `set` picks another backdrop of the same level (a forest inside the mountain level, say).
// Backdrops are drawn with parallax inside the room; the ground strip is cut into narrow columns that follow every slope;
// walls, ledges and beams are filled with their materials exactly where their blocks stand, so what Marko stands on is what
// is painted. Gameplay marks (the wing's ledges, the dash's lips, doors, gates, switches) are drawn over it by greybox.js.

const BASE='assets/';
// the stand-ins from dist/assets/world, per biome and per backdrop set
const W=id=>`world/${id}.webp`,LAY=(set,sp=[.04,.16,.38,.72])=>['sky','far','mid','near'].map((k,i)=>({id:`${set}-${k}`,file:W(`${set}-${k}`),speed:sp[i]}));
const FALLBACK={
 podgradje:{layers:LAY('oranje'),interior:{layers:LAY('podrum')},look:0,lookIn:8,
  materials:{ground:W('tlo-rusevine'),groundIn:W('tlo-podrum'),wall:W('zid-kamen'),platform:'kamen',beam:'greda',ceiling:W('zid-stena')}},
 urvina:{layers:LAY('urvina'),interior:{layers:LAY('pecina')},sets:{suma:LAY('suma'),reka:LAY('reka')},look:11,lookIn:7,lookSets:{suma:2,reka:12},
  materials:{ground:W('tlo-rusevine'),groundIn:W('tlo-pecina'),wall:W('zid-stena'),platform:'mahovina',beam:'greda',ceiling:W('zid-stena')}},
 klisura:{layers:LAY('klisura'),interior:{layers:LAY('tvrdjava')},sets:{reka:LAY('reka')},look:3,lookIn:5,lookSets:{reka:12},
  materials:{ground:W('tlo-klisura'),groundIn:W('tlo-tvrdjava'),wall:W('zid-kamen'),platform:'kamen',beam:'greda',ceiling:W('zid-cigla')}}
};
// generic prop names the levels use, and the painted props that stand in for them
const PROPS={kamen:W('prop-stena-mala'),stena:W('prop-stena-visoka'),tezga:W('prop-sanduci'),bure:W('prop-bure'),drvo:W('prop-drvo-hrast'),bukva:W('prop-drvo-bukva'),jela:W('prop-drvo-jela'),
 kruska:W('prop-kruska'),kuca:W('prop-kuca'),svetiliste:W('prop-svetiliste'),putokaz:W('prop-kamen-putokaz'),krst:W('prop-krst-raskrsce'),zbun:W('prop-zbun'),paprat:W('prop-paprat'),
 korenje:W('prop-korenje'),kristal:W('prop-kristal'),baklja:W('prop-baklja-drzac'),stub:W('prop-stub-kameni'),luk:W('prop-luk-kameni'),vodopad:W('prop-vodopad'),trska:W('prop-trska'),
 most:W('prop-most-kameni'),sanduk:W('prop-sanduci'),bacva:W('prop-bure'),'kameni-blok':W('prop-stena-mala'),'rusevni-luk':W('prop-luk-kameni'),
 mangal:W('prop-baklja-drzac'),cup:W('prop-bure'),bunar:W('prop-svetiliste'),kolica:W('prop-sanduci'),most_drvo:W('prop-most-drveni'),palisada:W('prop-palisada'),kapija:W('prop-kapija-tvrdjava'),ograda:W('prop-ograda-kamen'),pecurke:W('prop-pecurke'),zvono:W('prop-svetiliste')};

// the levels' generic prop names and the manifest's names for the same thing
const ALIAS={tezga:'kolica',kamen:'kameni-blok',bure:'bacva',luk:'rusevni-luk',baklja:'mangal'};
// a manifest material is one seamless 512×512 picture (repeated both ways), not a painted strip or a platform with caps
const isTex=f=>typeof f==='string'&&f.startsWith('realisticno/');

// ---------- loading: the manifest once, each picture once ----------
let manifest,manifestAsked=false;const pics={};
function askManifest(){if(manifestAsked||typeof fetch!=='function')return;manifestAsked=true;
 fetch(BASE+'realisticno/manifest.json').then(r=>r.ok?r.json():null).then(m=>{manifest=m&&m.version?m:null;}).catch(()=>{manifest=null;});}
function pic(file){if(!file)return null;let p=pics[file];if(!p){p=pics[file]={im:null,b:null,bad:false};if(typeof Image!=='function')return null;const im=new Image();im.onload=()=>{p.im=im;p.b=bounds(im);};im.onerror=()=>{p.bad=true;};im.src=BASE+file;}return p.im?p:null;}
const failed=file=>!file||pics[file]?.bad;
// the drawn part of a picture with transparent margins, found once on a small copy
function bounds(im){try{const s=Math.min(1,256/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*s)),h=Math.max(1,Math.round(im.height*s)),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0,w,h);const d=g.getImageData(0,0,w,h).data;
 let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 return x1<x0?{x:0,y:0,w:im.width,h:im.height}:{x:x0/s,y:y0/s,w:(x1-x0+1)/s,h:(y1-y0+1)/s};}catch{return{x:0,y:0,w:im.width,h:im.height};}}
// what a biome offers: the manifest's entry where it has one, the stand-ins where it does not; a manifest file that fails
// to load falls back to the stand-in of the same slot
function biome(L){askManifest();const fb=FALLBACK[L.biom]||FALLBACK.podgradje,mb=manifest?.biomes?.[L.biom];if(!mb)return fb;
 const pickLayers=(m,f)=>m?.length&&!m.some(l=>failed(l.file))?m:f;
 const mats=Object.fromEntries(Object.entries(fb.materials).map(([k,v])=>[k,mb.materials?.[k]&&!failed(mb.materials[k])?mb.materials[k]:v]));
 if(!mb.materials?.groundIn&&isTex(mats.ground))mats.groundIn=mats.ground;
 for(const k of['groundTop','groundFront'])if(mb.materials?.[k]&&!failed(mb.materials[k]))mats[k]=mb.materials[k];
 return{...fb,layers:pickLayers(mb.layers,fb.layers),interior:{layers:pickLayers(mb.interior?.layers,fb.interior.layers)},materials:mats,props:mb.props||[]};}
function layersFor(L,R){const b=biome(L);if(R.set&&b.sets?.[R.set])return b.sets[R.set];return R.interior?b.interior.layers:b.layers;}

export function artLook(L,R){const b=FALLBACK[L.biom]||FALLBACK.podgradje;if(!pic(layersFor(L,R)[0]?.file))return 10;return R.set&&b.lookSets?.[R.set]!=null?b.lookSets[R.set]:R.interior?b.lookIn:b.look;}
export function artName(L,R){return null;}

// ---------- the backdrop of a room: its layers with parallax, the first one covering the view ----------
export function artBack(G,L,R){if(!G.hasDom)return false;const lay=layersFor(L,R),g=G.ctx,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H,first=pic(lay[0]?.file);if(!first)return false;
 {const im=first.im,h=VH+140,w=Math.max(VW+200,im.width*h/im.height);g.drawImage(im,cam-100-(cam-R.x0)*(lay[0].speed||.03),cy-70,w,h);}
 for(const l of lay.slice(1)){const p=pic(l.file);if(!p)continue;const im=p.im,h=Math.min(VH*1.05,520+l.speed*120),w=im.width*h/im.height,x=cam-(cam-R.x0)*l.speed-100,y=R.floor+40+(cy-(R.floor-470))*(l.speed*.5)-h;
  for(let k=0;x+k*w<cam+VW+100;k++)g.drawImage(im,x+k*w,y,w,h);}
 return true;}

// ---------- the materials on the blocks, and the props ----------
const patCache=new WeakMap();
function pattern(g,p,scale){let m=patCache.get(p.im);if(!m){m=g.createPattern(p.im,'repeat');patCache.set(p.im,m);}m.setTransform?.(new DOMMatrix([scale,0,0,scale,0,0]));return m;}
const walkLines={};
function walkLine(file,p){if(walkLines[file]!=null)return walkLines[file];let walk=60;try{const im=p.im,c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,im.width,im.height).data;
 for(let y=0;y<im.height;y++){let n=0;for(let x=0;x<im.width;x+=8)if(d[(y*im.width+x)*4+3]>200)n++;if(n>im.width/8*.85){walk=y;break;}}}catch{}return walkLines[file]=walk;}
const surfAt=(q,x)=>{if(!q.surf)return q.y;const S=q.surf,k=Math.max(0,Math.min(S.length-1,(x-q.x)/q.sx)),i=Math.floor(k);return i>=S.length-1?S[S.length-1]:S[i]+(S[i+1]-S[i])*(k-i);};
// the ground strip in 4 px columns, each set on the slope under it; below the strip the rock goes on, dark
function ground(g,G,R,q,file){const p=pic(file);if(!p)return false;const im=p.im,S=.55,walk=walkLine(file,p),cam=G.camera,a=Math.max(q.x,R.x0,Math.floor((cam-20)/4)*4),b=Math.min(q.x+q.w,R.x1,cam+G.VIEW_W+24),sh=im.height*S,col=4,bottom=q.y+q.h+4;if(b<=a)return true;
 g.fillStyle='#161d1d';g.beginPath();g.moveTo(a,bottom);for(let x=a;x<=b;x+=col)g.lineTo(x,Math.min(bottom,surfAt(q,x)+sh-walk*S-8));g.lineTo(b,bottom);g.closePath();g.fill();
 g.save();g.beginPath();g.rect(a,q.y-80,b-a,q.h+84);g.clip();for(let x=a;x<b;x+=col){const u=((x/S)%im.width+im.width)%im.width,top=surfAt(q,x+col/2)-walk*S;g.drawImage(im,u,0,Math.min(col/S,im.width-u),im.height,x,top,col+.6,sh);}g.restore();return true;}
// a floor from a seamless texture: the block filled along its slope, darker going down, a lit edge on top
function groundTex(g,G,R,q,file){const p=pic(file);if(!p)return false;const cam=G.camera,a=Math.max(q.x,R.x0,Math.floor((cam-20)/4)*4),b=Math.min(q.x+q.w,R.x1,cam+G.VIEW_W+24),bottom=q.y+q.h+4;if(b<=a)return true;
 const path=()=>{g.beginPath();g.moveTo(a,bottom);for(let x=a;x<=b;x+=8)g.lineTo(x,surfAt(q,x));g.lineTo(b,surfAt(q,b));g.lineTo(b,bottom);g.closePath();};
 path();g.fillStyle=pattern(g,p,.32);g.fill();const top=Math.min(surfAt(q,a),surfAt(q,b),q.y),s=g.createLinearGradient(0,top,0,bottom);s.addColorStop(0,'rgba(0,0,0,0)');s.addColorStop(.35,'rgba(8,10,12,.25)');s.addColorStop(1,'rgba(8,10,12,.7)');path();g.fillStyle=s;g.fill();
 g.beginPath();for(let x=a;x<=b;x+=8)x===a?g.moveTo(x,surfAt(q,x)):g.lineTo(x,surfAt(q,x));g.lineTo(b,surfAt(q,b));g.strokeStyle='rgba(255,236,190,.45)';g.lineWidth=3;g.stroke();
 g.strokeStyle='rgba(20,16,12,.55)';g.lineWidth=2;g.beginPath();for(let x=a;x<=b;x+=8)x===a?g.moveTo(x,surfAt(q,x)+5):g.lineTo(x,surfAt(q,x)+5);g.stroke();return true;}
// ---------- depth: the walkable top seen a little from above ----------
// The walk line (what Marko stands on, unchanged) is the near edge of a band DEPTH px high; its far edge is higher and pulled in
// at the true ends of the block, like the top of a path or a beam seen at 25–35°. The band is a foreshortened texture: the
// manifest's groundTop when it has one (a picture seen from above), else the floor's own material squashed, with a haze
// toward the far edge. Under the line the front face goes on darker. Only pictures change; the bodies and the line do not.
const DEPTH=30,NEAR=6;
function bandPath(g,q,a,b,depth,near,inset){const x0=a<=q.x+.5?a+inset:a,x1=b>=q.x+q.w-.5?b-inset:b;g.beginPath();g.moveTo(a,surfAt(q,a)+near);for(let x=a+8;x<b;x+=8)g.lineTo(x,surfAt(q,x)+near);g.lineTo(b,surfAt(q,b)+near);
 g.lineTo(x1,surfAt(q,x1)-depth);for(let x=Math.floor(x1/8)*8;x>x0;x-=8)g.lineTo(x,surfAt(q,x)-depth);g.lineTo(x0,surfAt(q,x0)-depth);g.closePath();}
function band(g,q,a,b,{file,top,depth=DEPTH,near=NEAR,inset=depth*.7,scale=.5}){const p=pic(top||file);if(!p)return false;
 bandPath(g,q,a,b,depth,near,inset);g.save();g.clip();
 if(top){const im=p.im,h=depth+near,w=im.width*h/im.height;for(let x=Math.floor(a/w)*w;x<b;x+=w-1){const y=Math.min(surfAt(q,Math.max(a,x)),surfAt(q,Math.min(b,x+w)))-depth;g.drawImage(im,x,y,w,h+Math.abs(surfAt(q,Math.max(a,x))-surfAt(q,Math.min(b,x+w))));}}
 else{const m=pattern(g,p,scale);m.setTransform?.(new DOMMatrix([scale,0,0,scale*.4,0,0]));g.fillStyle=m;g.fillRect(a-2,q.y-depth-120,b-a+4,q.h+depth+260);}
 const yTop=Math.min(surfAt(q,a),surfAt(q,b),q.y)-depth,yBot=Math.max(surfAt(q,a),surfAt(q,b),q.y)+near,haze=g.createLinearGradient(0,yTop,0,yBot);
 haze.addColorStop(0,'rgba(60,66,80,.28)');haze.addColorStop(.5,'rgba(255,236,200,.06)');haze.addColorStop(1,'rgba(255,238,200,.2)');g.fillStyle=haze;g.fillRect(a-2,yTop-140,b-a+4,yBot-yTop+280);g.restore();
 // the far edge (a soft dark line) and the near lip (light) give the band its tilt
 g.lineWidth=2;g.strokeStyle='rgba(15,18,22,.35)';g.beginPath();const x0=a<=q.x+.5?a+inset:a,x1=b>=q.x+q.w-.5?b-inset:b;for(let x=x0;x<=x1;x+=8)x===x0?g.moveTo(x,surfAt(q,x)-depth):g.lineTo(x,surfAt(q,x)-depth);g.stroke();
 g.lineWidth=2.5;g.strokeStyle='rgba(255,236,190,.5)';g.beginPath();for(let x=a;x<=b;x+=8)x===a?g.moveTo(x,surfAt(q,x)+near):g.lineTo(x,surfAt(q,x)+near);g.stroke();return true;}
// the floor's front face from a seamless texture (groundFront, else the ground material darkened), from the near lip down
function front(g,G,R,q,file,a,b){const p=pic(file);if(!p)return false;const bottom=q.y+q.h+4;g.beginPath();g.moveTo(a,bottom);for(let x=a;x<=b;x+=8)g.lineTo(x,surfAt(q,x)+NEAR-1);g.lineTo(b,surfAt(q,b)+NEAR-1);g.lineTo(b,bottom);g.closePath();
 g.save();g.clip();g.fillStyle=pattern(g,p,.3);g.fillRect(a,q.y-40,b-a,q.h+90);const s=g.createLinearGradient(0,q.y,0,bottom);s.addColorStop(0,'rgba(8,10,12,.3)');s.addColorStop(1,'rgba(8,10,12,.72)');g.fillStyle=s;g.fillRect(a,q.y-40,b-a,q.h+90);g.restore();return true;}
// the whole floor block: the front face, then the walkable top over it
function deepGround(g,G,R,q,M,gf){const cam=G.camera,a=Math.max(q.x,R.x0,Math.floor((cam-20)/8)*8),b=Math.min(q.x+q.w,R.x1,cam+G.VIEW_W+24);if(b<=a)return true;
 const fr=M.groundFront||(isTex(M.wall)?M.wall:isTex(gf)?gf:null);if(fr){if(!front(g,G,R,q,fr,a,b))return false;}else if(!ground(g,G,R,q,gf))return false;
 return band(g,q,a,b,{file:isTex(gf)?gf:M.wall,top:M.groundTop})||true;}
// a ledge, a beam, a platform: its top seen from above, a thin band over its slab
const topOf=(g,q,file,depth=12)=>band(g,q,q.x,q.x+q.w,{file,depth,near:0,inset:depth*.6,scale:.22});

// a ledge or a beam from a seamless texture: a slab a little thicker than the block, lit on top, shaded below
function slab(g,q,file,scale=.22){const p=pic(file);if(!p)return false;const y=q.y-4,h=Math.max(q.h+10,22);g.fillStyle=pattern(g,p,scale);g.fillRect(q.x,y,q.w,h);
 const s=g.createLinearGradient(0,y,0,y+h);s.addColorStop(0,'rgba(255,240,200,.3)');s.addColorStop(.2,'rgba(0,0,0,0)');s.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=s;g.fillRect(q.x,y,q.w,h);
 g.strokeStyle='rgba(25,18,12,.8)';g.lineWidth=2;g.strokeRect(q.x+1,y+1,q.w-2,h-2);return true;}
function fill(g,q,file,scale,shade=0){const p=pic(file);if(!p)return false;g.fillStyle=pattern(g,p,scale);g.fillRect(q.x,q.y,q.w,q.h);
 if(shade){const s=g.createLinearGradient(q.x,0,q.x+q.w,0);s.addColorStop(0,`rgba(255,236,190,${shade*.4})`);s.addColorStop(.6,'rgba(0,0,0,0)');s.addColorStop(1,`rgba(10,20,25,${shade})`);g.fillStyle=s;g.fillRect(q.x,q.y,q.w,q.h);}
 g.strokeStyle='rgba(30,25,20,.6)';g.lineWidth=2;g.strokeRect(q.x+1,q.y+1,q.w-2,q.h-2);return true;}
// a ledge or a beam: the painted platform's left cap, middle and right cap along its length
function tiles(g,q,kind,file){const parts=file?[file,file,file]:['levo','sredina','desno'].map(s=>W(`plat-${kind}-${s}`)),ps=parts.map(pic);if(ps.some(x=>!x))return false;
 const h=Math.max(q.h+30,64),k=h/ps[1].im.height,capL=ps[0].im.width*k,capR=ps[2].im.width*k,mid=ps[1].im.width*k,y=q.y-12;
 g.save();g.beginPath();g.rect(q.x-capL*.25,y-10,q.w+capL*.25+capR*.25,h+20);g.clip();
 g.drawImage(ps[0].im,q.x-capL*.25,y,capL,h);for(let x=q.x+capL*.75;x<q.x+q.w-capR*.75;x+=mid-1)g.drawImage(ps[1].im,x,y,Math.min(mid,q.x+q.w-capR*.75-x+1),h);g.drawImage(ps[2].im,q.x+q.w-capR*.75,y,capR,h);g.restore();return true;}
function prop(g,file,x,y,h,flip){const p=pic(file);if(!p)return;const b=p.b,k=h/b.h,w=b.w*k;g.save();g.translate(x,y+4);if(flip)g.scale(-1,1);g.drawImage(p.im,b.x,b.y,b.w,b.h,-w/2,-h,w,h);g.restore();}

export function artFront(G,L,R,{S,platforms,traps}){if(!G.hasDom)return;const g=G.ctx,b=biome(L),M=b.materials,cam=G.camera,cy=G.camY,VW=G.VIEW_W,VH=G.VIEW_H;
 const vis=q=>q.x+q.w>Math.max(R.x0,cam-60)&&q.x<Math.min(R.x1,cam+VW+60)&&q.y+q.h>Math.max(R.y0-160,cy-60)&&q.y<Math.min(R.y1,cy+VH+60);
 // props stand behind the path
 for(const pr of S.props){if(pr.x<R.x0||pr.x>R.x1||pr.y<R.y0||pr.y>R.y1)continue;const m=b.props?.find(o=>o.id===pr.id||o.id===ALIAS[pr.id]);prop(g,m?.file||PROPS[pr.id],pr.x,pr.y,pr.h||m?.h||120,pr.flip);}
 for(const q of platforms){if(q.off||q.oko||q.iluzija||q.kind==='crate'||q.gbDoor||q.gbTrap||q.gbOneWay||!vis(q))continue;
  if(q.ground&&q.kind!=='step'){const gf=R.interior?M.groundIn||M.ground:M.ground;if(!deepGround(g,G,R,q,M,gf))fill(g,q,M.wall,.36,.4);continue;}
  if(q.kind==='plank'&&isTex(M.beam)&&!q.crumble){slab(g,q,M.beam,.2);topOf(g,q,M.beam,10);continue;}
  if(q.kind==='plank'){if(q.crumble){tiles(g,q,'greda')&&(g.strokeStyle='rgba(40,25,15,.8)',g.lineWidth=2,[.3,.6].forEach(f=>{g.beginPath();g.moveTo(q.x+q.w*f,q.y);g.lineTo(q.x+q.w*f+8,q.y+q.h);g.stroke();}));continue;}tiles(g,q,M.beam==='greda'||!M.beam?'greda':null,M.beam!=='greda'?M.beam:null);continue;}
  if(q.gbRoof){fill(g,q,M.ceiling,.32,.5);continue;}
  if(q.h<=60&&isTex(M.platform)){slab(g,q,M.platform,.22);topOf(g,q,M.platform,12);continue;}
  if(q.h<=60){tiles(g,q,M.platform==='kamen'||M.platform==='mahovina'?M.platform:null,M.platform!=='kamen'&&M.platform!=='mahovina'?M.platform:null);continue;}
  fill(g,q,M.wall,q.gbChimney?.3:.36,q.gbChimney?.55:.35);}
 for(const t of traps)if(t.kind==='spikes'&&t.x+t.w>R.x0&&t.x<R.x1){const p=pic(R.interior?W('siljci'):W('kolje'));if(!p)continue;const h=46,w=p.im.width*h/p.im.height;g.save();g.beginPath();g.rect(t.x-4,t.y-h-4,t.w+8,h+8);g.clip();for(let x=t.x-4;x<t.x+t.w+4;x+=w-1)g.drawImage(p.im,x,t.y-h+6,w,h);g.restore();}}

// ---------- the foreground: tufts, stones and roots in front of Marko, over the bottom edge of the view ----------
// The manifest's props with "layer":"foreground" when the biome has them, else the painted stand-ins. They stand on the
// floor's front face (their tops at most a little over the walk line), move a little faster than the world (they are
// nearer), and are darker. Placed by a fixed hash per room, never over a hole.
const FORE_OUT=['prop-zbun','prop-paprat','prop-stena-mala','prop-zbun','prop-paprat'].map(W),FORE_IN=['prop-stena-mala','prop-korenje','prop-stena-mala'].map(W);
const hash=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;};
export function artFore(G,L,R,platforms){if(!G.hasDom)return;const g=G.ctx,b=biome(L),cam=G.camera,VW=G.VIEW_W,mid=cam+VW/2;
 const own=(b.props||[]).filter(o=>o.layer==='foreground'),pool=own.length?own.map(o=>({file:o.file,h:o.h})):(R.interior?FORE_IN:FORE_OUT).map(file=>({file}));
 const solidAt=x=>platforms.some(q=>q.ground&&!q.off&&x>=q.x&&x<=q.x+q.w&&Math.abs(surfAt(q,x)-R.floor)<140);
 g.save();g.filter='brightness(0.5) saturate(0.8)';
 for(let i=0,x=R.x0+120;x<R.x1-60;i++,x+=260+hash(R.gx*31+i,R.gy*17)*320){const k=hash(i*7+R.gx,R.gy*13+3);if(k<.35||!solidAt(x))continue;
  const it=pool[Math.floor(hash(i+R.gx*5,R.gy+9)*pool.length)],p=pic(it.file);if(!p)continue;const h=it.h?it.h*1.25:70+k*70,sx=x+(x-mid)*.18,y=(platforms.find(q=>q.ground&&x>=q.x&&x<=q.x+q.w)?surfAt(platforms.find(q=>q.ground&&x>=q.x&&x<=q.x+q.w),x):R.floor)+h*.72;
  if(sx<cam-200||sx>cam+VW+200)continue;prop(g,it.file,sx,y,h,k>.7);}
 g.restore();}
