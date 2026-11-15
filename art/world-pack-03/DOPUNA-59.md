# Dopuna 59 (od Claude-a, 15. 11.): unutrašnjost riznice i Šarčeva humka

Stefan (15. 11.): „Riznice moraš da napraviš da izgledaju bolje, unutrašnjost naruči od Codexa.” Kad Marko uđe u riznicu (soba visoko iznad druma, ulazi se kroz okovana vrata), igra sada sama crta:
- taman zid od kamena;
- tri luka nacrtana linijom;
- dve baklje i crn otvor vrata.

Treba prava naslikana unutrašnjost, kao presek (uzor: Prince of Persia: The Lost Crown i `stil-crkva-presek.png`): prednji zid sobe je isečen, vidi se unutra.

Status piši u `art/world-pack-03/STATUS-D59.md` (napravi ga), sa oznakom `D59`.

Ne diraj ništa od sledećeg:
- `dist/` (osim izvoza ispod), `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove;
- git (ne pravi commit).

Paralelno rade druge Codex sesije (D57, D58): ne diraj njihove fajlove.

Najviše tri `image_gen` pokušaja po slici.

## Slika 1: `riznica-unutra` (1536×1024, neprovidna)

Mera je u `art/world-pack-03/uzori-d57/riznica-mera.png`. Poštuj je tačno, jer igra slika preko nje likove i kovčege:

**Pod:**
- ravan kamen od **y=866** do dna slike;
- linija poda je vodoravna preko cele širine.

**Zidovi:**
- **Levo i desno: debeli kameni zid u preseku**, od x=0 do x=177 i od x=1359 do x=1536, preko cele visine.
- Toplo osvetljen kamen.
- Presek zida je svetliji, kao isečen nožem, sa vidljivim slojevima kamena i maltera.

**Izlaz:**
- **luk vrata u zadnjem zidu**, sredina na x=315;
- širok oko 150 px, visok oko 300 px, dno na podu;
- kroz luk se vidi topla svetlost stepeništa, ne crna rupa.

**Zona kovčega:**
- **od x=551 do x=1280, do visine ~130 px iznad poda**, mora ostati prazna (gola zadnja strana i pod);
- tu igra crta kovčege, pehare i korpe koje Marko razbija.

**Zadnji zid (srpski srednji vek, riznica dvora Kraljevića Marka, toplo i bogato):**
- dva-tri zidana svoda (luka) u kamenu i opeci, u stilu moravske škole;
- police i niše sa srebrnim i zlatnim peharima, kandilima i ikonama;
- gomile dukata i otvoreni kovčezi **samo visoko na policama ili u dubini iza svodova**;
- na zidu okačeni:
  - štitovi,
  - dve ukrštene sablje,
  - buzdovan,
  - crven barjak sa belim krstom ili dvoglavim orlom;
- ćilim;
- baklje u gvozdenim držačima;
- svetlost toplih sveća.

**Boje i rukopis:**
- **svetlo i toplo, bez crnih senki** (igra je naslikana toplim bojama; Stefan ne voli crne kule);
- slikano, mat, istim rukopisom kao `stil-crkva-presek.png`, `stil-kovceg.png`, `stil-baklja.png`;
- bez ljudi i bez teksta.

**Izvoz:**
- `dist/assets/world/riznica-unutra.webp` (1536×1024);
- izvor u `art/world-pack-03/uzori-d59/riznica-unutra.png`;
- uz to `art/world-pack-03/uzori-d59/riznica-preklop.png`: mera i slika jedna preko druge (50 %).

## Slika 2: `prop-sarac-humka` (1024×512, providna pozadina)

Na kraju pesme „Smrt Marka Kraljevića” Marko sahrani Šarca. Treba:
- niska zemljana humka obrasla travom i poljskim cvećem;
- kamen ili mali drveni krst na čelu;
- Markov buzdovan prislonjen uz nju.

Zahtevi:
- Dno humke ravno na y≈480.
- Široka oko 70 % slike, visoka najviše 40 % slike.
- Gleda se sa strane.
- Isti rukopis kao `stil-kovceg.png`.

Izvoz: `dist/assets/world/prop-sarac-humka.webp` i izvor u `art/world-pack-03/uzori-d59/`.

## Na kraju

Kratak pregled u `STATUS-D59.md`: šta je izvezeno, koliko pokušaja, šta nije i zašto.
