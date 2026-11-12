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
1:{id:'podgradje',ime:'Podgrađe pod Markovim kulama',biom:'podgradje',daje:'krilo',daje2:['klizanje'],pocetne:[],cilj:'Nađi Sokolovo krilo i popni se na vrh kule',
 start:'livada',spawnDx:250,
 uvod:'Prilep. Marko je pod svojim kulama bez Sokolovog krila. Krilo čeka u Sokolovoj ćeliji, na dnu bunara ispod grada; do bunara se iz kovačnice ide niskim prolazom, a klizanje je u podrumu. Mapa je gore desno.',
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
  ['podrum','kovacnica',1],['kovacnica','bunar',1,{need:'klizanje',how:{slide:[4560,1310,4960]}}],['celija','bunar',2],['bunar','tamnica',2]],
 rupe:[['pijaca',550,750,{to:'podrum'}],['golubarnik',750,1050,{to:'varos'}],['bedem',1400,1700,{to:'dvoriste'}],['zvonik',500,800,{to:'bedem'}],['stepeniste',600,900,{to:'bunar@2'}],
  ['kovacnica',300,700],['oruzarnica',550,850]],
 brda:{livada:[[600,1000,50]],varos:[[600,950,-50],[1350,1800,90]],dvoriste:[[1500,2100,60]],tamnica:[[300,800,-40]]},
 build(B){const{X,Y}=B;
  // Livada: the start and the first checkpoint
  B.ckpt(X('livada',400),F0);B.prop('kamen',X('livada',800),F0,90);B.prop('kolica',X('livada',1080),F0);
  // Varoš: a janičar and a dog on the hill, a low block to learn the ledge grab, the wing's ledge under the Golubarnik
  B.prop('bunar',X('varos',320),F0);B.prop('bacva',X('varos',1270),F0);B.prop('sanduk',X('varos',2080),F0);B.prop('bacva',X('varos',2160),F0);
  B.block(X('varos',1050),F0-150,170,150);B.foe('sword',X('varos',1550),F0-110);B.foe('pas',X('varos',1900),F0);
  B.ledge(2140,F0-365,100,{gbGate:'krilo'});B.heart(1500,FM1);
  // Pijaca: a janičar and a dog among the stalls; a hole down into the cellar
  B.foe('sword',X('pijaca',300),F0);B.foe('pas',X('pijaca',1000),F0);B.prop('tezga',X('pijaca',250),F0,110);B.prop('tezga',X('pijaca',950),F0,110);B.prop('cup',X('pijaca',120),F0);B.prop('sanduk',X('pijaca',1120),F0);
  // Gradska kapija: two shieldmen; the gate opens only from the Stepenište
  B.prop('mangal',X('kapija',120),F0);B.foe('shield',X('kapija',300),F0);B.foe('shield',X('kapija',700),F0);B.gate('kapija-gate',4740,0,F0,{x:4880,y:F0});
  // Stepenište: a chimney up to the walls (climbed wall to wall), the walkway to the Bedem, the hole down the well
  B.chimney('ch-step',4900,FM1,F0-150);B.block(5130,FM1,620,40);
  // Dvorište: the second checkpoint, a rider and an armoured man
  B.prop('rusevni-luk',X('dvoriste',650),F0);B.prop('mangal',X('dvoriste',1250),F0);
  B.ckpt(X('dvoriste',300),F0);B.foe('akindzija',X('dvoriste',1000),F0);B.foe('oklopnik',X('dvoriste',2100),F0);
  // Kasarna: a janičar, an archer on a raised block, a shieldman
  B.prop('mangal',X('kasarna',140),F0);B.prop('bacva',X('kasarna',1080),F0);B.prop('sanduk',X('kasarna',1140),F0);
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
  B.prop('bacva',X('podrum',250),F1);B.prop('cup',X('podrum',330),F1);B.prop('bacva',X('vinski',350),F1);B.prop('bacva',X('vinski',430),F1);B.prop('cup',X('vinski',800),F1);
  // Podrum: Klizanje (in a run S + SHIFT) at the back of the cellar; the way on to the well is a low passage in the Kovačnica
  B.shrine('klizanje',X('podrum',470),F1);
  B.foe('pas',X('podrum',700),F1);B.foe('sword',X('podrum',950),F1);B.spikes(X('podrum',1000),F1,120);
  B.open(2400,F1-200,F1);B.fake('fake-vinski',2380,F1-200,60,200);B.heart(X('vinski',600),F1);
  // Kovačnica: planks that give way over a pit, stakes, a fire-raiser
  B.prop('mangal',X('kovacnica',140),F1);B.prop('kameni-blok',X('kovacnica',220),F1);
  B.crumble(X('kovacnica',300),F1,200);B.crumble(X('kovacnica',500),F1,200);B.pit('pit-kovacnica',X('kovacnica',300),X('kovacnica',700),F1+150);
  B.spikes(X('kovacnica',820),F1,140);B.foe('palikuca',X('kovacnica',1000),F1);B.nisko('nisko-bunar',X('kovacnica',1090),720,F1);
  // Bunar: the well, from the cellars down to the dungeon; the wing's ledges up and out through the Stepenište
  B.ledge(5550,F2-355,250,{gbGate:'krilo'});B.ledge(5250,F1,150,{gbGate:'krilo'});B.ledge(5590,F1-355,100,{gbGate:'krilo'});
  // Sokolova ćelija: the falcon's wing and the third checkpoint
  B.ckpt(X('celija',250),F2);B.shrine('krilo',X('celija',700),F2);
  // Tamnica: two janičari, stakes; a cracked wall to the Riznica
  B.prop('sanduk',X('tamnica',150),F2);B.prop('sanduk',X('riznica',250),F2);B.prop('cup',X('riznica',1050),F2);
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
  ['podrum','vinski',null,false,{walk:[2550,1310,1900],back:[1900,1310,2550]}]]},
// ---------------------------------------------------------------------------------------------------------------------
// 2 · Urvina planina: cliffs over a waterfall, the eagle's nest high on the rock, Ravijojla's forest with its spring, and
// caves deep inside the mountain. Marko comes with the falcon's wing and finds the air dash (Juriš u vazduhu) in the eagle's
// nest; the gorge to the forest, the cave's abyss and the eagle's rock cannot be crossed without it.
2:{id:'urvina',ime:'Urvina planina',biom:'urvina',daje:'nalet',daje2:['zidotrk'],pocetne:['krilo','klizanje'],cilj:'Nađi juriš u vazduhu i pređi klanac do Vilinog izvora',
 start:'zaseok',spawnDx:300,
 uvod:'Urvina planina. Marko ima Sokolovo krilo. Juriš u vazduhu čeka u Orlovom gnezdu, visoko na litici iznad vodopada; pred gnezdom je ponor koji se prelazi samo trkom po zidu sa Ravijojlinim šarama (u starom kamenolomu). Bez juriša se klanac ka Ravijojlinoj šumi ne prelazi.',
 sobe:[
  ['zaseok','Pastirski zaseok',-1,0,1,1],
  ['podnozje','Podnožje Urvine',0,0,2,1],
  ['osmatracnica','Osmatračnica',0,-1,2,1],
  ['staza','Planinska staza',2,0,2,1],
  ['kamenolom','Stari kamenolom',2,-1,2,1],
  ['vodopad','Vodopad',4,-1,1,2,{set:'reka'}],
  ['klanac','Klanac',5,0,2,1],
  ['litica','Litica',5,-1,2,1],
  ['stene','Stenovita greda',5,-2,2,1],
  ['gnezdo','Orlovo gnezdo',7,-2,1,1],
  ['orlova','Orlova stena',8,-2,1,1,{secret:true,lore:'Orlova stena. Orao je ovde savio gnezdo kad mu je Marko spasao orliće iz požara; pero je ostavio kao zalog.'}],
  ['jele','Jelova padina',7,-1,2,1,{set:'suma'}],
  ['suma','Ravijojlina šuma',7,0,2,1,{set:'suma'}],
  ['izvor','Vilin izvor',9,0,1,1,{set:'suma'}],
  ['skriveni','Skriveni izvor',9,-1,1,1,{secret:true,set:'suma',lore:'Skriveni izvor. Ravijojla se ovde kupa kad niko ne gleda; ko popije te vode, rane mu brže zaceljuju.'}],
  ['pecina','Pećina',2,1,2,1,{interior:true}],
  ['kristali','Kristalna dvorana',1,1,1,1,{secret:true,interior:true,lore:'Kristalna dvorana. Čobani kažu da je kristale posadila vila, da joj noću osvetle put kroz planinu.'}],
  ['ponor','Podzemni ponor',4,1,2,1,{interior:true}],
  ['jezero','Podzemno jezero',6,1,1,1,{interior:true}],
  ['dubina','Duboka pećina',2,2,2,1,{interior:true}],
  ['koren','Korenje',4,2,1,1,{interior:true}],
  ['jazbina','Vučja jazbina',5,2,1,1,{secret:true,interior:true,lore:'Vučja jazbina. Vukovi su je ostavili kad je Marko prošao planinom; na kamenu je ostalo samo vilino pero.'}]],
 delovi:{'stene>':{room:'stene',x0:7900},'klanac>':{room:'klanac',x0:7300},'gnezdo>':{room:'gnezdo',x0:9500},'ponor>':{room:'ponor',x0:6800},'litica>':{room:'litica',x0:8100}},
 vrata:[['zaseok','podnozje',0],['podnozje','staza',0],['staza','vodopad',0],['vodopad','klanac',0],['klanac','suma',0,{na:'klanac>',sa:100}],['suma','izvor',0,{oneway:true}],
  ['kamenolom','vodopad',-1],['vodopad','litica',-1],['litica','jele',-1,{na:'litica>'}],['stene','gnezdo',-2,{na:'stene>'}],['gnezdo','orlova',-2,{na:'gnezdo>',sa:60}],
  ['pecina','ponor',1],['ponor','jezero',1,{na:'ponor>'}],['dubina','koren',2]],
 rupe:[['osmatracnica',1600,1900,{to:'podnozje'}],['staza',800,1000,{to:'pecina'}],['stene',300,600,{to:'litica'}],['gnezdo',600,1100,{to:'jele',lip:'R',need:'nalet'}],['litica',1600,2100,{lip:'R'}],['jele',800,1100,{to:'suma'}],
  ['klanac',800,1300,{lip:'R'}],['klanac',1950,2250,{to:'jezero',from:'klanac>'}],['kamenolom',800,1200],['stene',1200,1900],['pecina',1600,1830],['ponor',1500,2000,{lip:'R'}]],
 brda:{podnozje:[[300,800,60]],staza:[[200,600,-40],[1400,2000,90]],suma:[[150,600,50],[1400,2000,-60]],zaseok:[[500,900,40]]},
 build(B){const{X}=B;
  // Pastirski zaseok and Podnožje: the start, a janičar and a dog; the ledge up to the Osmatračnica
  B.ckpt(X('zaseok',300),F0);B.foe('sword',X('podnozje',1000),F0);B.foe('pas',X('podnozje',2150),F0);B.ledge(1790,F0-365,100);B.prop('drvo',X('zaseok',950),F0,320);
  // Osmatračnica: two archers on the lookout, a piece of heart
  B.foe('archer',800,FM1);B.foe('archer',1300,FM1);B.heart(400,FM1);
  // Planinska staza: a janičar in the hollow, an archer on a rock; a hole down into the cave
  B.foe('sword',X('staza',450),F0-20);B.block(X('staza',1100),F0-120,200,120);B.foe('archer',X('staza',1200),F0-120);B.prop('stena',X('staza',1300),F0,220);
  // Stari kamenolom: planks that give way over a pit, a janičar, an archer on a block
  // Stari kamenolom: Trk po zidu, past the crumbling planks
  B.shrine('zidotrk',X('kamenolom',1500),FM1);
  B.crumble(X('kamenolom',800),FM1,200);B.crumble(X('kamenolom',1000),FM1,200);B.pit('pit-kamenolom',X('kamenolom',800),X('kamenolom',1200),FM1+150);
  B.foe('sword',X('kamenolom',300),FM1);B.block(X('kamenolom',1900),FM1-120,200,120);B.foe('archer',X('kamenolom',2000),FM1-120);
  // Vodopad: a chimney beside the falling water, from the path to the cliffs
  B.chimney('ch-vodopad',5300,FM1,F0-150);B.block(5050,FM1,250,40);B.block(5530,FM1,220,40);B.prop('vodopad',5900,F0,520);
  // Klanac: the abyss only the dash crosses, the hole down to the underground lake on its far side
  B.pit('pit-klanac',6800,7300,F0+150);B.foe('akindzija',X('klanac',300),F0);B.ledge(8140,F1-365,100);
  // Litica and Stenovita greda: archers on the rocks, the ledge up through the Stene's floor; stakes and crumbling rock above
  B.block(6250,FM1-120,100,120);B.block(6750,FM1-120,100,120);B.foe('archer',6300,FM1-120);B.foe('archer',6800,FM1-120);B.foe('sword',7200,FM1);B.ledge(6490,FM1-365,100);B.pit('pit-litica',7600,8100,FM1+150);
  // the Stene's abyss (700 px: more than the wing and the dash) under a wall with Ravijojla's runes: only the wall run crosses it
  B.spikes(6620,FM2,150);B.pit('pit-stene',7200,7900,FM2+150);B.zid('zid-stene',7240,FM2-240,620,150);B.foe('oklopnik',8150,FM2);
  // Orlovo gnezdo: the checkpoint, the air dash, the eagle's rock across the gap (a miss drops Marko onto the Jelova padina)
  B.ckpt(8500,FM2);B.shrine('nalet',8700,FM2);B.gap('gap-gnezdo',9000,9500,FM2);B.cudo(10200,FM2,'Orlovo pero');
  // Jelova padina and Ravijojlina šuma: the ledge up from the forest, a fake wall to the hidden spring
  B.ledge(9390,F0-365,100);B.foe('sword',X('jele',600),FM1);B.foe('archer',X('jele',1700),FM1);B.open(10800,FM1-200,FM1);B.fake('fake-skriveni',10780,FM1-200,60,200);B.heart(11400,FM1);
  B.ckpt(X('suma',1200),F0);B.foe('sword',X('suma',400),F0-80);B.foe('palikuca',X('suma',1700),F0-20);B.prop('bukva',X('suma',700),F0,340);B.prop('paprat',X('suma',1100),F0,90);
  // Vilin izvor: Lovac-aga, who calls his dogs
  {const a0=X('izvor',40),a1=X('izvor',1160);B.boss('sword',Math.round(a0+(a1-a0)*.68),F0,{hp:700,maxHp:700,name:'Lovac-aga',kit:'lovac',look:'lovac-aga'},{x0:a0,x1:a1,y:F0},[[(a1-a0)*.35,150,150],[(a1-a0)*.65,150,150]]);}
  // Pećina, Kristalna dvorana: dogs and stakes, the chimney down to the deep cave, a cracked wall to the crystals
  B.foe('pas',X('pecina',500),F1);B.foe('pas',X('pecina',900),F1);B.spikes(X('pecina',1100),F1,150);B.chimney('ch-dubina',4000,F1,F2-150);
  B.open(2400,F1-205,F1);B.breakable('zid-kristali',2400,F1);B.heart(X('kristali',600),F1);B.prop('kristal',X('kristali',300),F1,120);B.prop('kristal',X('kristali',900),F1,150);
  // Podzemni ponor and jezero: a shieldman, the cave's abyss (the dash), the lake and the ledge up into the Klanac
  B.foe('shield',X('ponor',400),F1);B.pit('pit-ponor',6300,6800,F1+150);B.heart(7500,F1);
  // Duboka pećina, Korenje, Vučja jazbina: a janičar and a shieldman, stakes, a fake wall among the roots
  B.foe('sword',X('dubina',600),F2);B.foe('shield',X('dubina',1300),F2);B.spikes(X('dubina',300),F2,150);B.foe('sword',X('koren',500),F2);
  B.open(6000,F2-200,F2);B.fake('fake-jazbina',5980,F2-200,60,200);B.cudo(6600,F2,'Vilino pero');},
 veze:[
  ['podnozje','osmatracnica',null,true,{up:[['floor',590,1,[1840,225]],[[1840,225],[1400,-130],-1]]}],
  ['vodopad@0','vodopad@-1',null,true,{chimney:['ch-vodopad',5650]}],
  ['vodopad@-1','vodopad@0',null,true,{walk:[5650,-130,5415],wait:150}],
  ['litica','stene',null,true,{up:[['floor',-130,1,[6540,-495]],[[6540,-495],[6150,-850],-1]]}],
  ['suma','jele',null,true,{up:[['floor',590,1,[9440,225]],[[9440,225],[9000,-130],-1]]}],
  ['jezero','klanac>',null,true,{up:[['floor',1310,1,[8190,945]],[[8190,945],[7600,590],-1]]}],
  ['dubina','pecina',null,true,{chimney:['ch-dubina',3800]}],
  ['pecina','dubina',null,true,{walk:[3900,1310,4115],wait:300}],
  ['klanac','klanac>','nalet',false,{leap:['pit-klanac',1,590,7500,6600]}],
  ['litica','litica>','nalet',false,{leap:['pit-litica',1,-130,8300,7400]}],
  ['stene','stene>','zidotrk',false,{zid:[6850,-850,7170,7960,0],back:[8330,-850,7930,7140,0],pit:'pit-stene'}],
  ['gnezdo','gnezdo>','nalet',false,{leap:['gap-gnezdo',1,-850,9550,8800]}],
  ['ponor','ponor>','nalet',false,{leap:['pit-ponor',1,1310,7000,6100]}],
  ['jele','skriveni',null,false,{walk:[10600,-130,11200],back:[11200,-130,10600]}],
  ['koren','jazbina',null,false,{walk:[5800,2030,6400],back:[6400,2030,5800]}],
  ['pecina','kristali',null,false,{break:['zid-kristali',2550,1310,1900]}]]},
// ---------------------------------------------------------------------------------------------------------------------
// 3 · Kačanička klisura i Musina kula: the river in the gorge, a broken stone bridge, a mill on the rapids, the hermit's
// cell up on the canyon wall where Ravijojla leaves the fairy's trace (Vilin trag), and Musa's tower, climbed from its
// gate to its top through doors and trapdoors that only the trace gets Marko through. Musa Kesedžija waits on the roof.
3:{id:'klisura',ime:'Kačanička klisura i Musina kula',biom:'klisura',daje:'trag',daje2:['lanac','oko'],pocetne:['krilo','nalet','klizanje','zidotrk'],cilj:'Nađi Vilin trag, uđi u Musinu kulu i popni se do Muse',
 start:'ulaz',spawnDx:300,
 uvod:'Kačanička klisura. Marko ima krilo i juriš. Musina kula je zaključana vratima koja daleki prekidač otvara na tren; Vilin trag ostavlja Ravijojla u isposnici gore na zidu kanjona. Na vrh kule se ide Ravijojlinim lancem, a on čeka u oružani.',
 sobe:[
  ['ulaz','Ulaz u klisuru',-1,0,1,1],
  ['obala','Obala Lepenca',0,0,2,1,{set:'reka'}],
  ['most','Srušeni kameni most',2,0,2,1,{set:'reka'}],
  ['vodenica','Vodenica',4,0,1,1,{interior:true}],
  ['skela','Skela',5,0,2,1,{set:'reka'}],
  ['podnozje','Podnožje Musine kule',7,0,1,1],
  ['kula','Musina kula',8,-3,2,4,{interior:true}],
  ['vrh','Krov Musine kule',10,-3,1,1],
  ['oruzana','Oružana',10,-1,1,1,{interior:true}],
  ['strazara','Stražara',7,-2,1,1,{interior:true}],
  ['riznica','Musina riznica',10,-2,1,1,{secret:true,interior:true,lore:'Musina riznica. Plen sa drumova koje je Musa zatvorio: dukati putnika, krstovi iz crkava, i jedna sablja koju niko nije umeo da podigne.'}],
  ['staza','Staza kroz kanjon',2,-1,3,1],
  ['isposnica','Isposnica',5,-1,1,1,{interior:true}],
  ['kapela','Kapela u steni',6,-1,1,1,{secret:true,interior:true,lore:'Kapela u steni. Isposnik je ovde pisao letopis klisure; poslednja strana kaže da će doći junak na Šarcu.'}],
  ['pecina','Pećina pod obalom',0,1,2,1,{interior:true,set:'pecina'}],
  ['skrivena','Skrivena pećina',-1,1,1,1,{secret:true,interior:true,set:'pecina',lore:'Skrivena pećina. Ovde su se putnici krili od Musinih ljudi; na zidu su urezali imena onih koji su prešli klisuru.'}],
  ['ispodmosta','Ispod mosta',2,1,1,1,{secret:true,interior:true,set:'pecina',lore:'Ispod mosta. Stari guslar je ovde sakrio gusle kad su Musini ljudi zatvorili drum; kažu da same zasviraju kad Marko prođe.'}],
  ['izvor','Podzemni izvor',3,1,1,1,{interior:true,set:'pecina'}],
  ['mlin','Mlinski točak',4,1,1,1,{interior:true}],
  ['brzaci','Brzaci',5,1,2,1,{set:'reka'}],
  ['tamnica','Musina tamnica',8,1,2,1,{interior:true}]],
 delovi:{'most|':{room:'most',x0:2900,x1:4050},'most>':{room:'most',x0:4350},'skela>':{room:'skela',x0:7200}},
 vrata:[['ulaz','obala',0],['obala','most',0,{sb:100}],['most','vodenica',0,{na:'most>'}],['vodenica','skela',0],['skela','podnozje',0,{na:'skela>'}],
  ['kula','oruzana',-1],['strazara','kula',-2],['kula','vrh',-3,{oneway:true}],['staza','isposnica',-1],
  ['izvor','mlin',1],['mlin','brzaci',1]],
 rupe:[['obala',1500,1800,{to:'pecina'}],['most',200,500],['most',1650,1950],['most',700,1000],['kula',1500,1800],['skela',700,1200,{to:'brzaci',lip:'R'}],
  ['staza',2700,2930],['pecina',60,700],['vodenica',800,1030],['brzaci',1300,1700]],
 brda:{ulaz:[[500,900,40]],obala:[[300,800,50],[1950,2300,-40]]},
 build(B){const{X}=B;
  // Ulaz and Obala Lepenca: the start, a janičar and a dog on the bank, the hole down into the cave
  B.ckpt(X('ulaz',300),F0);B.prop('krst',X('ulaz',900),F0,170);B.foe('sword',X('obala',1000),F0);B.foe('pas',X('obala',2150),F0);B.ledge(1690,F1-365,100);
  // Srušeni kameni most: two breaks in the bridge (the wing jumps them), a trapdoor whose switch stands on the bridge
  B.pit('pit-most1',2600,2900,F0+150);B.pit('pit-most2',4050,4350,F0+150);B.foe('shield',X('most',2200),F0);
  B.trapdoor('trap-most',3100,F0,300,{x:3980,y:F0});B.ledge(3290,F1-365,100);
  // Vodenica and Mlinski točak: a fire-raiser, a chimney up to the canyon path, a chimney down to the mill wheel
  B.foe('palikuca',X('vodenica',900),F0);B.chimney('ch-vodenica',5100,FM1,F0-150);B.chimney('ch-mlin',5600,F0,F1-150);B.foe('sword',X('mlin',300),F1);
  // Staza kroz kanjon: archers on the rocks, a janičar, stakes, an arrow slit by the hermit's door
  B.block(2900,FM1-120,100,120);B.block(3800,FM1-120,100,120);B.foe('archer',2950,FM1-120);B.foe('archer',3850,FM1-120);B.foe('sword',4400,FM1);B.spikes(4000,FM1,150);
  B.strelnica({x:5960,y:FM1-40,gy:FM1,dir:-1,every:2.6});
  // Isposnica: the fairy's trace, a checkpoint; the door to the chapel opens from a far switch
  B.ckpt(X('isposnica',600),FM1);B.shrine('trag',X('isposnica',900),FM1);B.open(7200,FM1-260,FM1);B.door('door-kapela',7140,FM1-260,FM1,{x:6100,y:FM1});
  B.heart(X('kapela',600),FM1);
  // Skela and Brzaci: a rider by the ferry, the river (a miss drops Marko into the rapids), stakes and crumbling planks below
  B.gap('gap-skela',6700,7200,F0);B.foe('akindzija',X('skela',300),F0);B.foe('sword',X('brzaci',600),F1);B.spikes(7900,F1,200);
  B.crumble(7300,F1,200);B.crumble(7500,F1,200);B.pit('pit-brzaci',7300,7700,F1+150);
  // Podnožje Musine kule: the second checkpoint, an armoured man, the tower's door on a far switch
  B.ckpt(X('podnozje',250),F0);B.foe('oklopnik',X('podnozje',700),F0);B.open(9600,F0-260,F0);B.door('door-kula',9540,F0-260,F0,{x:8500,y:F0});
  // Musina kula: a chimney to the mezzanine, the wing's ledge to the gallery, a chimney to the top walk; a trapdoor to the dungeon
  B.chimney('ch-kula1',10000,FM1,F0-150);B.block(10230,FM1,1260,40);B.ledge(11640,FM1-365,100);
  B.block(9600,FM2,1850,40);B.block(11750,FM2,250,40);B.kuka('kuka-kula1',9800,FM2-470);B.kuka('kuka-kula2',10050,FM2-830);B.block(10230,-1570,1520,40);
  B.trapdoor('trap-kula',11100,F0,300,{x:9800,y:F0});B.ledge(11290,F1-365,100);
  B.foe('sword',10700,FM1);B.foe('archer',9900,FM2);B.strelnica({x:11980,y:FM2-40,gy:FM2,dir:-1,every:2.8});
  B.open(12000,FM2-200,FM2);B.iluzija('varka-riznica',11980,FM2-200,60,200);B.cudo(X('riznica',600),FM2,'Musina sablja');
  // Oružana and Stražara: armoured men and archers
  B.shrine('lanac',X('oruzana',300),FM1);B.foe('oklopnik',X('oruzana',500),FM1);B.foe('shield',X('oruzana',900),FM1);B.heart(X('oruzana',1050),FM1);
  B.foe('archer',X('strazara',400),FM2);B.foe('archer',X('strazara',800),FM2);
  // Krov Musine kule: Musa Kesedžija, leaping from beam to beam
  {const a0=X('vrh',40),a1=X('vrh',1160);B.boss('sword',Math.round(a0+(a1-a0)*.68),-1570,{hp:900,maxHp:900,name:'Musa Kesedžija',kit:'janicar',look:'musa'},{x0:a0,x1:a1,y:-1570},AGA_PLANKS(a1-a0));}
  // Pećina pod obalom, Skrivena pećina, Ispod mosta, Podzemni izvor, Musina tamnica
  // Pećina pod obalom: an abyss before the hidden cave; the bridge over it is seen and firm only through Vilinsko oko
  B.foe('pas',X('pecina',1000),F1);B.foe('sword',X('pecina',1500),F1);B.open(0,F1-205,F1);B.pit('pit-pecina',60,700,F1+150);B.oko(70,F1,620);B.heart(X('skrivena',600),F1);
  B.cudo(X('ispodmosta',300),F1,'Guslareve gusle');B.heart(X('izvor',600),F1);B.shrine('oko',X('izvor',300),F1);
  B.foe('sword',X('tamnica',500),F1);B.foe('sword',X('tamnica',1900),F1);B.spikes(X('tamnica',900),F1,150);B.heart(X('tamnica',2200),F1);},
 veze:[
  ['pecina','obala',null,true,{up:[['floor',1310,1,[1740,945]],[[1740,945],[1300,590],-1]]}],
  ['most','most|',null,false,{hop:[2450,2600,3000],back:[3000,2900,2450]}],
  ['most|','most>',null,false,{hop:[3850,4050,4550],back:[4550,4350,3850]}],
  ['most|','ispodmosta','trag',true,{trace:['trap-most',[3250,590]]}],
  ['ispodmosta','most|',null,true,{open:'trap-most',up:[['floor',1310,1,[3340,945]],[[3340,945],[3000,590],-1]]}],
  ['vodenica','staza',null,true,{chimney:['ch-vodenica',5600]}],
  ['staza','vodenica',null,true,{walk:[5000,-130,5215],wait:250}],
  ['mlin','vodenica',null,true,{chimney:['ch-mlin',5300]}],
  ['vodenica','mlin',null,true,{walk:[5450,590,5715],wait:250}],
  ['isposnica','kapela','trag',true,{trace:['door-kapela',[7070,-130]]}],
  ['kapela','isposnica',null,true,{open:'door-kapela',walk:[7500,-130,6800]}],
  ['skela','skela>',null,false,{leap:['gap-skela',1,590,7400,6500]}],
  ['podnozje','kula@0','trag',true,{trace:['door-kula',[9470,590]]}],
  ['kula@0','podnozje',null,true,{open:'door-kula',walk:[9800,590,9000]}],
  ['kula@0','tamnica','trag',true,{trace:['trap-kula',[11250,590]]}],
  ['tamnica','kula@0',null,true,{open:'trap-kula',up:[['floor',1310,1,[11340,945]],[[11340,945],[10900,590],-1]]}],
  ['kula@0','kula@-1',null,true,{chimney:['ch-kula1',10500]}],
  ['kula@-1','kula@0',null,true,{walk:[10400,-130,10115],wait:150}],
  ['kula@-1','kula@-2',null,true,{up:[[[11300,-130],[11690,-495],1],[[11690,-495],[11000,-850],-1]]}],
  ['kula@-2','kula@-1',null,true,{walk:[11300,-850,11470],wait:150}],
  ['kula@-2','kula@-3','lanac',true,{kuka:{from:[9900,-850],hooks:[['kuka-kula1',0],['kuka-kula2',60,1]],to:10400}}],
  ['kula@-3','kula@-2',null,true,{walk:[10400,-1570,10115],wait:250}],
  ['kula@-2','riznica',null,false,{walk:[11850,-850,12500],back:[12500,-850,11850]}],
  ['pecina','skrivena','oko',false,{oko:[780,1310,-300,[]],back:[-300,1310,780,[]],pit:'pit-pecina'}]]}
};
