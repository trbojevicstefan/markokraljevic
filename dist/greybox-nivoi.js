// ================= The Lost Crown-style levels as data (the engine is greybox.js) =================
// Each level: rooms on a grid of 1200×720 cells ([id, name, column, row, width, height, options]; row 0 is the main road,
// rows above are walls and towers, rows below are cellars and caves), the doors between neighbouring rooms ([left, right,
// row]), holes in floors ([room, from, to, {to: the room below, lip: the side whose edge cannot be caught}]), hills and
// hollows ([from, to, height] per room), and build(B), which sets down each room's own blocks, foes, traps, gates and
// secrets. `veze` are the passages that are not plain doors or holes, each with how the test walks it (greybox-test.mjs).
// Coordinates inside a room are world x and y; B.X(room, dx) and B.Y(room) help. A tall room has one node per row (`kula@-1`).
// Heights to remember: one jump and a ledge grab reach 266 px, the wing and a ledge grab 383; ledges for the wing stand
// 345–365 px apart. The abysses for the air dash are 500 px. Chimneys (two walls 150 px apart) are climbed wall to wall.
// Only the structure is taken in idea from The Lost Crown; every room is ours.

const F0=590,F1=1310,F2=2030,FM1=-130,FM2=-850;
// the boss of a level: Janičarski aga's beams, as in the pohodi arenas
const AGA_PLANKS=len=>[[len*.16,150,150],[len*.4,265,140],[len*.64,150,150],[len*.86,240,140]];

export const GB_NIVOI={
// ---------------------------------------------------------------------------------------------------------------------
// 1 · Podgrađe pod Markovim kulama (Prilep): the town under the fortress, its walls and towers, the bell tower, the cellars
// and the dungeon under the town. Marko finds the falcon's wing (Sokolovo krilo) in the falcon's cell at the bottom of the well.
1:{id:'podgradje',ime:'Podgrađe pod Markovim kulama',biom:'podgradje',daje:'krilo',pocetne:[],cilj:'Nađi Sokolovo krilo i popni se na vrh kule',
 start:'livada',spawnDx:250,
 uvod:'Prilep. Marko je pod svojim kulama bez Sokolovog krila. Krilo čeka u Sokolovoj ćeliji, na dnu bunara ispod grada. Mapa je gore desno.',
 sobe:[
  ['livada','Livada pod gradom',-1,0,1,1],
  ['varos','Varoš',0,0,2,1],
  ['golubarnik','Golubarnik',1,-1,1,1,{secret:true,interior:true,lore:'Golubarnik. Odavde su leteli golubovi sa Markovim pismima kad god je Prilep zvao u pomoć.'}],
  ['pijaca','Pijaca',2,0,1,1],
  ['kapija','Gradska kapija',3,0,1,1],
  ['stepeniste','Stepenište',4,-1,1,2,{interior:true}],
  ['dvoriste','Dvorište',5,0,2,1],
  ['kasarna','Kasarna',7,0,1,1,{interior:true}],
  ['kula','Kula',8,-2,1,3,{interior:true}],
  ['vrh','Vrh kule',9,-2,1,1],
  ['bedem','Bedem',5,-1,3,1],
  ['zvonik','Zvonik',6,-2,1,1],
  ['zvonara','Zvonara',7,-2,1,1,{secret:true,interior:true,lore:'Zvonara. Zvono je liveno od turskih topova koje je Marko oteo; kad zvoni, čuje se do Pelagonije.'}],
  ['oruzarnica','Oružarnica',9,0,1,1,{interior:true}],
  ['podrum','Podrum',2,1,1,1,{interior:true}],
  ['vinski','Vinski podrum',1,1,1,1,{secret:true,interior:true,lore:'Vinski podrum. Kad je car zabranio vino, Marko ga je ovde krio, iza zida koji je sam zazidao.'}],
  ['kovacnica','Kovačnica',3,1,1,1,{interior:true}],
  ['bunar','Bunar',4,1,1,2,{interior:true}],
  ['celija','Sokolova ćelija',3,2,1,1,{interior:true}],
  ['tamnica','Tamnica',5,2,2,1,{interior:true}],
  ['riznica','Riznica',7,2,1,1,{secret:true,interior:true,lore:'Riznica. Tri kese dukata: jedna za crkvu, jedna za sirotinju, jedna za onoga ko Marka sahrani.'}]],
 vrata:[['livada','varos',0],['varos','pijaca',0],['pijaca','kapija',0],['kapija','stepeniste',0,{need:'posle:stepeniste@0'}],['stepeniste','dvoriste',0],
  ['dvoriste','kasarna',0],['kasarna','kula',0],['kula','oruzarnica',0],['stepeniste','bedem',-1],['bedem','kula',-1],['kula','vrh',-2,{oneway:true}],
  ['podrum','kovacnica',1],['kovacnica','bunar',1],['celija','bunar',2],['bunar','tamnica',2]],
 rupe:[['pijaca',550,750,{to:'podrum'}],['golubarnik',750,1050,{to:'varos'}],['bedem',1400,1700,{to:'dvoriste'}],['zvonik',500,800,{to:'bedem'}],['stepeniste',600,900,{to:'bunar@2'}],
  ['kovacnica',300,700],['oruzarnica',550,850]],
 brda:{livada:[[600,1000,50]],varos:[[600,950,-50],[1350,1800,90]],dvoriste:[[1500,2100,60]],tamnica:[[300,800,-40]]},
 build(B){const{X,Y}=B;
  // Livada: the start and the first checkpoint
  B.ckpt(X('livada',400),F0);B.prop('kamen',X('livada',800),F0,90);
  // Varoš: a janičar and a dog on the hill, a low block to learn the ledge grab, the wing's ledge under the Golubarnik
  B.block(X('varos',1050),F0-150,170,150);B.foe('sword',X('varos',1550),F0-110);B.foe('pas',X('varos',1900),F0);
  B.ledge(2140,F0-365,100,{gbGate:'krilo'});B.heart(1500,FM1);
  // Pijaca: a janičar and a dog among the stalls; a hole down into the cellar
  B.foe('sword',X('pijaca',300),F0);B.foe('pas',X('pijaca',1000),F0);B.prop('tezga',X('pijaca',250),F0,110);B.prop('tezga',X('pijaca',950),F0,110);
  // Gradska kapija: two shieldmen; the gate opens only from the Stepenište
  B.foe('shield',X('kapija',300),F0);B.foe('shield',X('kapija',700),F0);B.gate('kapija-gate',4740,0,F0,{x:4880,y:F0});
  // Stepenište: a chimney up to the walls (climbed wall to wall), the walkway to the Bedem, the hole down the well
  B.chimney('ch-step',4900,FM1,F0-150);B.block(5130,FM1,620,40);
  // Dvorište: the second checkpoint, a rider and an armoured man
  B.ckpt(X('dvoriste',300),F0);B.foe('akindzija',X('dvoriste',1000),F0);B.foe('oklopnik',X('dvoriste',2100),F0);
  // Kasarna: a janičar, an archer on a raised block, a shieldman
  B.block(X('kasarna',500),F0-120,200,120);B.foe('sword',X('kasarna',300),F0);B.foe('archer',X('kasarna',600),F0-120);B.foe('shield',X('kasarna',900),F0);
  // Kula: a chimney from the floor to the walls' level, then the wing's ledges to the top
  B.chimney('ch-kula',9860,FM1,F0-150);B.block(10090,FM1,60,40);B.ledge(10300,FM1-365,100,{gbGate:'krilo'});
  // Vrh kule: Janičarski aga
  {const a0=X('vrh',40),a1=X('vrh',1160);B.boss('sword',Math.round(a0+(a1-a0)*.68),FM2,{hp:700,maxHp:700,name:'Kapetan kule (Janičarski aga)',kit:'janicar',look:'janicarski-aga'},{x0:a0,x1:a1,y:FM2},AGA_PLANKS(a1-a0));}
  // Bedem: archers on the merlons, a janičar, an arrow slit in the tower's wall, the hole down to the Dvorište, the wing's ledge to the Zvonik
  B.block(6600,FM1-120,100,120);B.block(8700,FM1-120,100,120);B.foe('archer',6650,FM1-120);B.foe('archer',8750,FM1-120);B.foe('sword',8200,FM1);
  B.strelnica({x:9560,y:FM1-40,gy:FM1,dir:-1,every:2.8});B.ledge(7890,FM1-365,100,{gbGate:'krilo'});
  // Zvonik and Zvonara: a cracked wall to the bell-ringer's room
  B.open(8400,FM2-205,FM2);B.breakable('zid-zvonara',8400,FM2);B.foe('archer',X('zvonik',300),FM2);B.prop('zvono',X('zvonik',900),FM2,160);
  B.cudo(X('zvonara',600),FM2,'Prilepsko zvono');
  // Oružarnica: stakes, a beam that slides over a pit, an arrow slit; a piece of heart at the end
  B.spikes(X('oruzarnica',250),F0,200);{const q=B.plank(X('oruzarnica',550),F0,120);B.greda(q,{ax:X('oruzarnica',550),bx:X('oruzarnica',730),period:3.2});}
  B.pit('pit-oruzarnica',X('oruzarnica',550),X('oruzarnica',850),F0+150);B.strelnica({x:X('oruzarnica',1160),y:F0-40,gy:F0,dir:-1,every:2.4});B.heart(X('oruzarnica',1050),F0);
  // Podrum: a dog and a janičar, stakes; the wall to the left gives way (Vinski podrum)
  B.foe('pas',X('podrum',700),F1);B.foe('sword',X('podrum',950),F1);B.spikes(X('podrum',1000),F1,120);
  B.open(2400,F1-200,F1);B.fake('fake-vinski',2380,F1-200,60,200);B.heart(X('vinski',600),F1);
  // Kovačnica: planks that give way over a pit, stakes, a fire-raiser
  B.crumble(X('kovacnica',300),F1,200);B.crumble(X('kovacnica',500),F1,200);B.pit('pit-kovacnica',X('kovacnica',300),X('kovacnica',700),F1+150);
  B.spikes(X('kovacnica',820),F1,140);B.foe('palikuca',X('kovacnica',1050),F1);
  // Bunar: the well, from the cellars down to the dungeon; the wing's ledges up and out through the Stepenište
  B.ledge(5550,F2-355,250,{gbGate:'krilo'});B.ledge(5250,F1,150,{gbGate:'krilo'});B.ledge(5590,F1-355,100,{gbGate:'krilo'});
  // Sokolova ćelija: the falcon's wing and the third checkpoint
  B.ckpt(X('celija',250),F2);B.shrine('krilo',X('celija',700),F2);
  // Tamnica: two janičari, stakes; a cracked wall to the Riznica
  B.foe('sword',X('tamnica',900),F2);B.foe('sword',X('tamnica',1700),F2);B.spikes(X('tamnica',1150),F2,150);
  B.open(8400,F2-205,F2);B.breakable('zid-riznica',8400,F2);B.heart(X('riznica',450),F2);B.cudo(X('riznica',850),F2,'Markov pehar');},
 veze:[
  ['varos','golubarnik','krilo',true,{up:[['floor',590,1,[2190,225]],[[2190,225],[1500,-130],-1]]}],
  ['stepeniste@0','stepeniste@-1',null,true,{chimney:['ch-step',5400]}],
  ['stepeniste@-1','stepeniste@0',null,true,{walk:[5300,-130,4990],wait:150}],
  ['bunar@1','bunar@2',null,true,{walk:[4950,1310,5200],wait:150}],
  ['bunar@2','bunar@1','krilo',true,{up:[['floor',2030,1,[5675,1675]],[[5675,1675],[5325,1310],-1]]}],
  ['bunar@1','stepeniste@0','krilo',true,{up:[[[5325,1310],[5640,955],1],[[5640,955],[5100,590],-1]]}],
  ['kula@0','kula@-1',null,true,{chimney:['ch-kula',10120]}],
  ['kula@-1','kula@0',null,true,{walk:[10120,-130,9975],wait:150}],
  ['kula@-1','kula@-2','krilo',true,{up:[[[10120,-130],[10350,-495],1],[[10350,-495],[10675,-850],1]]}],
  ['kula@-2','kula@-1',null,true,{walk:[10650,-850,10360],wait:150}],
  ['bedem','zvonik','krilo',true,{up:[['floor',-130,-1,[7940,-495]],[[7940,-495],[7450,-850],-1]]}],
  ['zvonik','zvonara',null,false,{break:['zid-zvonara',8250,-850,8700]}],
  ['tamnica','riznica',null,false,{break:['zid-riznica',8250,2030,8900]}],
  ['podrum','vinski',null,false,{walk:[2550,1310,1900],back:[1900,1310,2550]}]]}
};
