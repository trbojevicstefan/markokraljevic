# Dopuna 32 (od Claude-a): pozadina Podruma i kolci

## Podrum: bure u pozadini je preveliko

U prednjem sloju pozadine Podruma (`podrum-near`) je dole levo bure koje je veće od Marka, pa ništa nije u srazmeri. U igri je Marko visok oko 1/5 visine sloja (oko 145 px na slici 2172×724).

Pravilo za sve slojeve:
- u `near` sloju bure je najviše oko 80 px, a vrata i lukovi su viši od Marka;
- u `mid` sloju sve je oko 0,6 od toga, a u `far` oko 0,35.

Naslikaj ponovo `podrum-near` i `podrum-mid` u sve tri varijante: dan, noć i oluja (`podrum-near.png`, `podrum-near-night.png`, `podrum-near-storm.png` i isto za `mid`). Originali su u `art/world-pack-01/assets/`. Nove slike stavi na isto mesto pod istim imenom. Kompozicija, boje i providni delovi neka ostanu isti kao sada, a promeni samo preveliko burad i police da budu u srazmeri. Stare fajlove premesti u `art/world-pack-01/staro/`, da ne idu u igru, ali da se ne izgube.

Zatim pogledaj `near` i `mid` slojeve ostalih jedanaest pohoda po istom pravilu. **Ne slikaj ih**, nego samo upiši u `STATUS-ANIMACIJE.md` koji predmet je gde nesrazmeran.

## Kolci (pozadina, zverstva osmanske vojske)

Turska vojska je nabijala ljude na kolac i glave na koce, kao opomenu. Treba nam za daleku pozadinu, kao tamne siluete na brdu ili kraj druma, a ne krupni krvavi detalji. Slikano, mat, prigušeno, pod večernjim nebom. PNG 768×768, providno, oslonac je dole u sredini.

| Fajl | Opis |
|---|---|
| `prop-kolci-glave.png` | Pet-šest visokih zašiljenih kočeva nakrivo pobijenih u zemlju, a na vrhovima su odsečene glave. Silueta, ali se prepoznaje, i nad njima gavranovi. |
| `prop-kolac-nabijen.png` | Jedan visok kolac sa nabijenim čovekom, izdaleka kao tamna silueta, sa glavom klonulom na grudi. Bez krvi i rana u krupnom planu. |
| `prop-kolci-red.png` | Red od desetak kočeva na brdašcu (neki sa telom, a neki sa glavom), daleko, gotovo crna silueta. Široka slika 1536×512. |
