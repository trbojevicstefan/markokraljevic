// Zamke za uspon kroz kulu: strelnice u zidu, grede koje se kreću i jama sa kocima.
// Svaka zamka nosi svoje ponašanje: tick(dt, igra) na svaki korak igre i draw(slika) posle likova.
// world.js ih postavlja u nivo, a game.js ih samo poziva (updateTraps i drawTrapsFront), bez znanja šta su.
//   igra:  {p, arrows, sfx, toast}   Marko, strele u letu, zvuk, poruka na dnu ekrana
//   slika: {ctx, gctx, time, rig, rigDraw}   platno sveta, sloj sjaja, vreme, crteži likova i njihovo crtanje
// Trajanje zamke (t.t) vodi game.js: setupTraps ga postavlja na 0, updateTraps ga uvećava pre poziva tick.
const TAU=Math.PI*2;

// Strelnica: prorez u licu zida iz kog na takt izleće strela, vodoravno, ka onome ko prilazi zidu.
// Visoka strela (u grudi) se izbegava čučnjem (S) ili kolutom (Shift); niska (u gležanj) skokom ili kolutom.
// Odbijanje (L) je vraća u zid. Pre hica prorez zasija i škljocne, da se vidi koja ide. Puca samo dok je Marko
// ispred zida, na visini hodnika; na vrhu zida ga ne dira.
export function strelnica(o){
 // greybox pohodi (greybox-nivoi-pohodi.js) predaju sopstvenu zamku kroz B.strelnica({zamka}) dok greybox.js ne dobije B.zamka
 if(o.zamka)return o.zamka;
 const{x,y,gy,dir=-1,every=2.6,phase=0,warn=.7,speed=540,range=1100,reach=170}=o;
 return{kind:'strelnica',x,y,gy,dir,every,warn,speed,range,reach,low:gy-y<50,clock:warn+every*phase,glow:0,armed:false,
  tick(dt,{p,arrows,sfx}){
   this.glow=Math.max(0,this.glow-dt*3);
   const ahead=(p.x-this.x)*this.dir;
   if(!(ahead>0&&ahead<this.range&&Math.abs(p.y-this.gy)<this.reach)){this.armed=false;return;}
   this.clock-=dt;
   if(this.clock<=this.warn&&!this.armed){this.armed=true;sfx('ring',{gain:.2,rate:this.low?1.45:1.9,x:this.x});}
   if(this.clock>0)return;
   this.clock+=this.every;this.armed=false;this.glow=1;
   arrows.push({x:this.x+this.dir*10,y:this.y,vx:this.dir*this.speed,life:(this.range+80)/this.speed,enemy:true});
   sfx('bow',{gain:.6,x:this.x});},
  draw({ctx,gctx}){
   const d=this.dir,x0=d<0?this.x:this.x-30,y=this.y;
   ctx.fillStyle='rgba(206,190,158,.6)';ctx.fillRect(x0-2,y-10,34,3);ctx.fillRect(x0-2,y+7,34,3);
   ctx.fillStyle='#120c08';ctx.fillRect(x0,y-7,30,14);
   // the arrowhead shows in the slit and brightens until it flies
   const k=this.armed?Math.min(1,1-this.clock/this.warn):0,shine=Math.max(k,this.glow);
   if(this.armed){const tip=this.x+d*(2+6*k);ctx.fillStyle=`rgba(231,227,205,${.5+.5*k})`;ctx.beginPath();ctx.moveTo(tip+d*8,y);ctx.lineTo(tip-d*2,y-4);ctx.lineTo(tip-d*2,y+4);ctx.closePath();ctx.fill();}
   if(shine>0)for(const g of[ctx,gctx]){if(!g)continue;g.save();g.globalAlpha=shine*(g===ctx?.5:.35);g.fillStyle=this.low?'#ffb070':'#ffe2a0';g.beginPath();g.arc(this.x+d*6,y,9+10*shine,0,TAU);g.fill();g.restore();}}};
}

// Greda: daska koja klizi tamo-amo ili se diže i spušta. Nosi Marka dok stoji na njoj, a i dok visi o njenu ivicu.
// q je obična daska iz world.js (crta je game.js kao i svaku dasku); ovde dobija samo putanju.
export function greda(q,{ax=q.x,bx=q.x,ay=q.y,by=q.y,period=5,phase=0}){
 const at=t=>{const k=(1-Math.cos(TAU*(t/period+phase)))/2;return[ax+(bx-ax)*k,ay+(by-ay)*k];};
 [q.x,q.y]=at(0);q.move={ax,bx,ay,by,period,phase};
 return{kind:'greda',x:Math.round((ax+bx)/2+q.w/2),y:Math.max(ay,by),q,
  tick(dt,{p}){
   const [nx,ny]=at(this.t||0),dx=nx-q.x,dy=ny-q.y,L=p.ledge;
   const hung=L&&Math.abs(L.y1-q.y)<2&&L.x1>q.x-30&&L.x1<q.x+q.w+30;
   q.x=nx;q.y=ny;
   if(p.on===q&&p.grounded){p.x+=dx;p.y=q.y;}
   if(hung){L.x0+=dx;L.x1+=dx;L.y0+=dy;L.y1+=dy;}}};
}

// Soko glasnik: na vrhu kule kruži kraj barjaka; kad Marko priđe, uzme knjigu i odleti ka Solunu (crtež `soko-let`).
export function sokoGlasnik({x,y,text}){
 return{kind:'soko-glasnik',x,y,text,state:'ceka',fx:x,fy:y-170,k:0,
  tick(dt,{p,sfx,toast}){
   if(this.state==='ceka'){this.fy=this.y-170+Math.sin((this.t||0)*2.2)*10;if(Math.abs(p.x-this.x)<620&&Math.abs(p.y-this.y)<220){this.state='leti';sfx('whoosh',{gain:.55,x:this.x});toast(this.text,3.2);}return;}
   if(this.state==='leti'){this.k+=dt;this.fx+=dt*(260+this.k*120);this.fy-=dt*(150+this.k*60);if(this.k>5)this.state='otisao';}},
  draw({rig,rigDraw,time}){
   const n=rig?.['soko-let']?'soko-let':null;if(!n||this.state==='otisao')return;
   rigDraw(n,Math.floor(time*(this.state==='leti'?14:9))%rig[n].frames.length,this.fx,this.fy,this.state==='leti'?1:-1);}};
}

// Jama: dno sa kocima ispod greda. Koci bodu kao svuda u igri (jednom, pri padu); ko upadne, Ravijojla ga posle
// trenutka vrati tamo odakle je krenuo. Kraj lestvi (prvih `safe` piksela) nema kolja: odatle se izlazi i sam.
export function jama({x0,x1,y,back,safe=150}){
 return{kind:'jama',x:Math.round((x0+x1)/2),x0,x1,y,back,safe,down:0,
  tick(dt,{p,toast}){
   const inPit=!p.climb&&p.y>this.y-150&&p.x>this.x0+this.safe&&p.x<this.x1;
   this.down=inPit?this.down+dt:0;if(this.down<.75)return;
   this.down=0;Object.assign(p,{x:this.back.x,y:this.back.y,vx:0,vy:0,grounded:true,climb:null,wall:0,invuln:Math.max(p.invuln||0,1)});
   toast('Ravijojla te izvukla iz jame. Pokušaj ponovo.',2.2);}};
}

// Lik iz pesme: stoji na svom mestu (ili radi svoj posao, crtež `clip`), okrene se ka Marku i kad on priđe kaže svoje
// jednom (poruka na dnu ekrana). Ništa ne traži i ništa ne brani; greybox pohodi ga stavljaju po sobama.
export function lik({x,y,clip,text,face=-1,near=280,scale=1}){
 return{kind:'lik',x,y,clip,text,face,near,scale,said:false,
  tick(dt,{p,toast}){
   if(Math.abs(p.y-this.y)<300)this.face=p.x<this.x?-1:1;
   if(this.said||Math.abs(p.x-this.x)>this.near||Math.abs(p.y-this.y)>160)return;
   this.said=true;toast(this.text,3.6);},
  draw({rig,rigDraw,time}){
   const r=rig?.[this.clip];if(!r)return;
   rigDraw(this.clip,Math.floor(time*8)%r.frames.length,this.x,this.y,this.face,{scale:this.scale});}};
}
