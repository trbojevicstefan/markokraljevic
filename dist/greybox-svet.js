// ================= the greybox rooms dressed in the game's own painted art =================
// Room 1 (Predvorje) is the foot of Marko's towers above Prilep, built only from pictures the artist already painted for
// the game (dist/assets/world): the "oranje" set is the Prilep country (the Pelagonia plain in summer, a granite hill with
// a fortress on it), so it is the backdrop; the "rusevine" ground strip (granite under grass) is cut into narrow columns
// that follow the hills and hollows; the masonry and granite textures fill the fortress wall and the boulder exactly
// where their blocks stand; the oak is the zapis (the village's sacred oak) at the checkpoint, the stone shrine with its
// spring greets Marko at the start, and the signpost stone with its sun rosette points out of the room.
// Nothing is drawn as vector shapes; until a picture has loaded the room stays grey.
// greybox.js calls GB_ART[room.id].back() before the blocks and .front() after them, both clipped to the room.

const F=590,BOT=840,CY0=118;
const pics={};
function pic(id){let p=pics[id];if(!p){p=pics[id]={im:null,b:null};if(typeof Image!=='function')return null;const im=new Image();im.onload=()=>{p.im=im;p.b=bounds(im);};im.src=`assets/world/${id}.webp`;}return p.im?p:null;}
// the drawn part of a picture with transparent margins, found once on a small copy
function bounds(im){try{const s=Math.min(1,256/Math.max(im.width,im.height)),w=Math.max(1,Math.round(im.width*s)),h=Math.max(1,Math.round(im.height*s)),c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.drawImage(im,0,0,w,h);const d=g.getImageData(0,0,w,h).data;
 let x0=w,y0=h,x1=0,y1=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<x0)return{x:0,y:0,w:im.width,h:im.height};return{x:x0/s,y:y0/s,w:(x1-x0+1)/s,h:(y1-y0+1)/s};}catch{return{x:0,y:0,w:im.width,h:im.height};}}
// a prop standing with the bottom of its drawn part on (x,y), `h` tall
function prop(g,id,x,y,h,o={}){const p=pic(id);if(!p)return;const b=p.b,k=h/b.h,w=b.w*k;g.save();g.globalAlpha=o.alpha??1;g.translate(x,y+(o.sink||0));if(o.flip)g.scale(-1,1);g.drawImage(p.im,b.x,b.y,b.w,b.h,-w/2,-h,w,h);g.restore();}
// a backdrop layer: `h` tall with its bottom at baseY, sliding with the camera at `speed`
function layer(g,G,R,id,speed,baseY,h){const p=pic(id);if(!p)return;const im=p.im,w=im.width*h/im.height,cam=G.camera,x=cam-(cam-R.x0)*speed-80,y=baseY+(G.camY-CY0)*(1-speed*.5)-h;
 for(let k=0;x+k*w<cam+G.VIEW_W+80;k++)g.drawImage(im,x+k*w,y,w,h);}
// a painted texture filling a path, scaled down to world size
function texture(g,id,scale){const p=pic(id);if(!p)return null;const pat=g.createPattern(p.im,'repeat');pat.setTransform?.(new DOMMatrix([scale,0,0,scale,0,0]));return pat;}

// the ground strip, cut into columns that follow the slope: its grass line sits on the slope at every x
const strip={id:'tlo-rusevine',S:.55,walk:null};
function walkLine(p){if(strip.walk!=null)return strip.walk;try{const im=p.im,c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,im.width,im.height).data;
 for(let y=0;y<im.height;y++){let n=0;for(let x=0;x<im.width;x+=8)if(d[(y*im.width+x)*4+3]>200)n++;if(n>im.width/8*.85){strip.walk=y;break;}}}catch{}return strip.walk??=60;}
function ground(g,G,R,surf){const p=pic(strip.id);if(!p)return;const im=p.im,S=strip.S,walk=walkLine(p),cam=G.camera,a=Math.max(R.x0,Math.floor((cam-20)/4)*4),b=Math.min(R.x1,cam+G.VIEW_W+24),sh=im.height*S,col=4;
 // under the strip the granite goes on, dark, down to the bottom of the world
 g.fillStyle='#16201f';g.beginPath();g.moveTo(a,BOT+40);for(let x=a;x<=b;x+=col)g.lineTo(x,surf(x)+sh-walk*S-6);g.lineTo(b,BOT+40);g.closePath();g.fill();
 for(let x=a;x<b;x+=col){const u=((x*1/S)%im.width+im.width)%im.width,top=surf(x+col/2)-walk*S;g.drawImage(im,u,0,Math.min(col/S,im.width-u),im.height,x,top,col+.6,sh);}}
function graniteBlock(g,q){const pat=texture(g,'zid-stena',.42);if(!pat)return;const x0=q.x,x1=q.x+q.w,t=q.y;g.save();
 g.beginPath();g.moveTo(x0+2,F+8);g.bezierCurveTo(x0-10,F-40,x0-8,t+40,x0+8,t+10);g.quadraticCurveTo(x0+12,t,x0+26,t);g.lineTo(x1-24,t);g.quadraticCurveTo(x1-8,t,x1-6,t+14);g.bezierCurveTo(x1+10,t+50,x1+8,F-30,x1-2,F+8);g.closePath();
 g.fillStyle=pat;g.fill();g.clip();
 // light from the left, shade on the right and underneath, as on the painted rocks of the backdrop
 const sh=g.createLinearGradient(x0,t,x1,F);sh.addColorStop(0,'rgba(255,236,190,.18)');sh.addColorStop(.55,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(20,40,45,.45)');g.fillStyle=sh;g.fillRect(x0-20,t-10,q.w+40,F-t+30);
 g.restore();g.save();g.globalAlpha=.55;g.strokeStyle='#2e2a24';g.lineWidth=2.5;g.stroke();g.restore();}
function fortressWall(g,q){const pat=texture(g,'zid-kamen',.36);if(!pat)return;const x=q.x,top=q.y,w=q.w;g.save();
 g.fillStyle=pat;g.fillRect(x,top,w,BOT-top);
 // merlons on the far edge, a cap of the same stone, and shade down the sides
 g.fillRect(x-6,top-4,w+12,16);
 const sh=g.createLinearGradient(x,0,x+w,0);sh.addColorStop(0,'rgba(255,236,190,.16)');sh.addColorStop(.6,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(20,35,40,.5)');g.fillStyle=sh;g.fillRect(x,top,w,BOT-top);
 const lo=g.createLinearGradient(0,F-160,0,F);lo.addColorStop(0,'rgba(0,0,0,0)');lo.addColorStop(1,'rgba(30,40,30,.35)');g.fillStyle=lo;g.fillRect(x,F-160,w,160);
 // the walled-up postern: an arch of the cracked masonry, a shade darker
 const cr=texture(g,'zid-napukao',.3);if(cr){const cx=x+w/2,y0=F-128,aw=74;g.beginPath();g.moveTo(cx-aw/2,F);g.lineTo(cx-aw/2,y0+aw/2);g.arc(cx,y0+aw/2,aw/2,Math.PI,0);g.lineTo(cx+aw/2,F);g.closePath();g.fillStyle=cr;g.fill();g.fillStyle='rgba(30,25,20,.25)';g.fill();g.globalAlpha=.6;g.strokeStyle='#2e2a24';g.lineWidth=3;g.stroke();g.globalAlpha=1;}
 g.globalAlpha=.6;g.strokeStyle='#2e2a24';g.lineWidth=2;g.strokeRect(x,top-4,w,BOT-top+4);g.restore();}

export const GB_ART={
 predvorje:{name:'Podgrađe pod Markovim kulama',look:0,
  back(G,R){if(!G.hasDom)return;const g=G.ctx,sky=pic('oranje-sky');
   if(sky){const im=sky.im,h=G.VIEW_H+120,w=Math.max(G.VIEW_W+160,im.width*h/im.height);g.drawImage(im,G.camera-80-(G.camera-R.x0)*.03,G.camY-60,w,h);}
   layer(g,G,R,'oranje-far',.12,560,470);layer(g,G,R,'oranje-mid',.3,610,520);layer(g,G,R,'oranje-near-rucno',.55,650,360);},
  front(G,R,{S,ground:surf,platforms}){if(!G.hasDom)return;const g=G.ctx;
   // behind the path: the shrine with its spring at the start, blackberries in the hollow, a pear tree on the hill
   prop(g,'prop-svetiliste',1640,surf(1640),190,{sink:6});prop(g,'prop-zbun',2260,surf(2260),70,{sink:10});prop(g,'prop-stena-mala',2350,surf(2350),60,{sink:12});prop(g,'prop-kruska',2840,surf(2840),300,{sink:8});
   const c=S.ckpts.find(c=>c.x>R.x0&&c.x<R.x1);if(c){prop(g,'prop-drvo-hrast',c.x+20,c.y,400,{sink:6});if(S.ckpt===c.id)G.halo(c.x+12,c.y-150,70,'#a6ffe1',.55+.2*Math.sin(G.time*3));}
   ground(g,G,R,surf);
   for(const q of platforms){if(q.x+q.w<R.x0||q.x>R.x1)continue;if(q.gbGate)fortressWall(g,q);else if(q.solid&&!q.surf&&q.kind==='stone'&&q.y>F-200&&q.h>100)graniteBlock(g,q);}
   prop(g,'prop-kamen-putokaz',R.x1-60,surf(R.x1-60),110,{sink:8});}}
};
