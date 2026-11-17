# Dopuna 64 (od Claude-a, 16. 11.): zastava Srbije za barjake i strelac koji puca uvis

Stefan (16. 11.): „naruči checkpoint zastavu i animaciju za nju, neka bude neka zastava Srbije” i „još jednu animaciju strelca koji puca u vazduh strele”.

Status piši u `art/world-pack-03/STATUS-D64.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D64`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`;
- druge `STATUS-*` fajlove i tuđe foldere klipova;
- git (ne pravi commit).

## Uzori (`art/world-pack-03/uzori-d64/`)

- `zastava-srbije-ravna.png`: **izgled zastave**, ravna, 600×400. Trobojka odozgo nadole: crvena, plava, bela. Na njoj je crveni štit sa belim dvoglavim orlom i zlatnom krunom, pomeren ka koplju (levo).
- `stari-barjak-kadrovi.png`: 8 kadrova starog barjaka koji se sada vijori u igri. Uzor za **ritam vijorenja** i za mesto ivice uz koplje (x=40). Njegov izgled (crven barjak sa lastinim repom) se NE crta.
- `archer-uzor.png`: **strelac iz igre u meri igre** (žuto-plava odeća sa šarom, beli turban sa crvenim vrhom, tobolac na leđima, zakrivljen luk). Uzor lika I veličine: visok je 364 px (y=126 do y=490), stopala na y=490.
- `archer-rafal-kadar0.png`: isti strelac kako drži strelu na tetivi, krupnije. Samo uzor poze za kadar 0, NE veličine (u tom zumu luk uperen uvis ne staje u ćeliju).
- `pokret-archer-rafal.png` i `pokret-archer-shoot.png`: kako strelac poteže tetivu i odapinje.

## Zajednička pravila (kao u `DOPUNA-63.md`)

**Ćelija i izvoz:**
- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`. U folderu:
  - `atlas.png` (N ćelija u jednom redu);
  - `manifest.json` sa `frame_layout`;
  - `frames/motion/frame-N.png`, `preview.gif`, `qa.json`.
- JSON bez BOM-a, ASCII opisi.
- Radni fajlovi idu u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak izvoza i provere je u `art/world-pack-03/export-dopuna63.py` i `verify-dopuna63.py`. Prilagodi ih kao `export-dopuna64.py` i `verify-dopuna64.py`.

**Crtanje:**
- Svaki klip je **uređivanje uzora**: `image_gen` dobija uzor kao ulaznu sliku. Ne crta se iz opisa.
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova, 3×2 za 6) na ravnoj jarko zelenoj #00ff00. U svakom polju je samo jedan crtež.
- Polja se iseku, zelena se skine, a svaki kadar ide u svoju ćeliju.

**Najviše tri pokušaja po klipu.** Ako ni treći ne valja, NE izvozi. Upiši šta ne valja i idi dalje.

## Klip 1: `zastava-srbije-vijori` (8 kadrova, petlja)

Zastava Srbije iz `zastava-srbije-ravna.png` vijori se na umerenom vetru. Izgled je kao na uzoru: trobojka crvena–plava–bela odozgo nadole, a štit sa orlom i krunom je bliže koplju. Naslikana je kao svila, sa mekim senkama nabora, mat, bez sjaja. Isti slikani stil kao stari barjak.

- Crta se **samo tkanina, bez koplja** (koplje crta igra).
- Tkanina je uz koplje levo i vijori se udesno.
- **Ivica uz koplje** je u SVAKOM kadru ista nepomična uspravna linija: x=40, od y=156 do y=356 (200 px).
- Od koplja do slobodnog kraja tkanina je dugačka oko 300 px.
- Nabori putuju od koplja ka slobodnom kraju, kao u `stari-barjak-kadrovi.png`. Slobodni kraj se najviše pomera gore-dole (najviše ±40 px), ali tkanina ne pada.
- Kadar 7 se glatko pretapa u kadar 0.

**Izvoz:** svaki kadar umanji ili uvećaj tako da ivica uz koplje bude visoka 200 px. Zatim ga pomeri tako da ta ivica bude na x=40, a vrh na y=156.

**Provera:**
- nijedan neprovidan piksel ne dodiruje ivicu ćelije;
- nema zelenih piksela;
- ivica uz koplje je u svih 8 kadrova na istom mestu (±2 px);
- boje su odozgo nadole crvena, plava, bela, a orao je ceo i beo;
- `contact.png` pokazuje svih 8 kadrova jedan do drugog.

## Klip 2: `archer-uvis` (6 kadrova, jednom)

Strelac iz `archer-uzor.png` puca uvis: strele lete visoko i padaju kao kiša na Marka (strele u letu ne crtaj, njih crta igra). Profil, gleda udesno. Isti lik i ista veličina kao `archer-uzor.png` (visina tela 364 px ±5 %). Stopala su na y=490 u svim kadrovima i ne pomeraju se. Lik stoji levo od sredine ćelije (stopala oko x=200), da luk uperen uvis i udesno stane.

| Kadar | Šta se vidi |
|---|---|
| 0 | Poza kao `archer-rafal-kadar0.png` (strela na tetivi, luk dole napred), ali u veličini `archer-uzor.png`. |
| 1 | Diže luk koso uvis i zabacuje se malo unazad, težina prelazi na zadnju nogu. |
| 2 | Pun potez: luk je uperen visoko udesno, oko 60° iznad vodoravnog. Tetiva je kod obraza, a strela je na tetivi, uperena uvis. |
| 3 | Odapeo: tetiva je ispravljena, strele više nema, luk je još uperen uvis, a desna šaka je trgnuta unazad. |
| 4 | Luk se spušta, a desna ruka seže ka tobolcu. |
| 5 | Povratak u stav kao kadar 0 (da se pretopi u `archer-idle` i `archer-shoot`). |

**Provera** (kao `archer-rafal` u `DOPUNA-46.md`, deo „Ponavljanje (v2)”):
- **Lik.** `identity-size-comparison.png` pokazuje kadar 0 pored `archer-uzor.png`. Lice, turban, odeća, boje, luk i tobolac moraju biti isti.
- **Veličina.** `size-overlay.png` preklapa kadar 0 preko `archer-uzor.png`. Visina tela mora biti ista (±5 %), a stopala na y=490.
- **Ivice.** Ceo luk mora da stane u svakom kadru, i kad je uperen uvis. Do svake ivice ćelije ostaje bar 24 px. Ako ne staje, pomeri lik ulevo. Ako ni to nije dovoljno, smanji sve kadrove podjednako, najviše 10 %, i to upiši u status.
- Nema zelenih piksela. Luk ostaje u levoj ruci.

## Redosled

1. `zastava-srbije-vijori`
2. `archer-uvis`

---

## Ponavljanje (v2): oba klipa ponovo

Stefan (17. 11.): „popravi strelca i daj neku staru srpsku zastavu iz tog doba”. Zato su sklonjena **oba** izvoza iz pokušaja 1.

### `zastava-srbije-vijori` v2: stari srpski barjak iz Markovog doba

Današnja trobojka se NE crta. Novi uzor je `uzori-d64/barjak-carski-ravan.png`: carski barjak iz doba cara Dušana.
- Polja odozgo nadole: crveno, belo, crveno (barjak iz Hilandara, pripisuje se caru Dušanu).
- U belom polju je crveni dvoglavi orao sa zlatnim kljunovima, kandžama i krstićem nad glavama (kao orao nad Skopljem na Dulsertovoj karti iz 1339).
- Uz slobodni kraj je zlatna resa. Uz koplje je tamniji porub.
- Naslikan je kao stara svila, malo izbledele boje, mat, mekih nabora, u istom slikanom stilu kao stari barjak.

Sva pravila iz dela „Klip 1” ostaju ista (samo tkanina, bez koplja; ivica uz koplje x=40, y=156..356; oko 300 px dužine; 8 kadrova, petlja; ista provera), osim provere boja: odozgo nadole crveno, belo, crveno; orao je ceo, crven i u belom polju. Novi pokušaji su `attempt-2` i `attempt-3`.

### `archer-uvis` v2

Izvoz `archer-uvis` iz pokušaja 1 je sklonjen iz `assets/`. Lik je pravi i veličina je dobra, ali **strelac ne puca uvis**. U kadrovima 2 i 3 luk i strela su skoro vodoravni, oko 12° iznad vodoravnog (crvena linija na `uzori-d64/archer-uvis-ugao.png`). Treba oko 60° (zelena linija na istoj slici). U igri strele idu visoko u nebo i padaju kao kiša, pa se mora jasno videti da gađa nebo.

Za kadrove 1–4 važi:
- Leva ruka sa lukom je ispružena **koso uvis, ka gornjem desnom uglu ćelije**, duž zelene linije. Šaka sa lukom je iznad visine turbana.
- Luk je nagnut, a strela u kadru 2 pokazuje uvis i udesno, pod oko 60°.
- Desna ruka vuče tetivu do obraza, pa je i lakat podignut.
- Telo je zabačeno unazad, grudi su okrenute nebu, a glava gleda gore duž strele.
- Kadar 3 (odapinjanje) ima isti ugao kao kadar 2.
- Kadar 4: luk se spušta. Kadar 5 je stav kao kadar 0.

Kadar 0 i 5 ostaju kao u pokušaju 1. Mera ostaje ista: visina tela i stopala na y=488.

Ceo luk mora da stane u ćeliju, sa bar 24 px do svake ivice, i kad je uperen uvis. Zato stopala mogu da budu levije (oko x=170). Ako ni tako ne staje, umanji sve kadrove podjednako, najviše 10 %, i to upiši u status.

Isti postupak za oba klipa: `image_gen` kao uređivanje uzora (za strelca je kadar 0 iz pokušaja 1 dobar ulaz), najviše dva nova pokušaja po klipu (`attempt-2`, `attempt-3`), status u `STATUS-D64.md`.

**Provera pre izvoza:** na `contact.png` izmeri ugao strele u kadru 2 (od šake koja vuče tetivu do vrha strele). Ugao mora biti između 45° i 70° iznad vodoravnog. Upiši ga u `qa.json` kao `aimDeg`.

---

## Ponavljanje (v3): samo zastava, kao barjak iz glavnog menija

`archer-uvis` iz `attempt-2` je prihvaćen; njega ne diraj.

Stefan (17. 11.): „nije dobra zastava, neka bude kao ona 3D, ali da je nacrtamo i animiramo”. „Ona 3D” je barjak na dugmetu glavnog menija. Carski barjak iz v2 je sklonjen iz `assets/`.

Novi uzor je `uzori-d64/barjak-meni-ravan.png`. To je taj barjak, nacrtan istim kodom kao u meniju, bez natpisa, u razmeri 3:2:
- tamnocrvena svila, svetlija gore, tamnija dole;
- gore i dole zlatna traka sa tamnocrvenom crtom po sredini i nizom zlatnih krstića;
- lastin rep na slobodnom kraju, sa zlatnim rubom duž reza;
- uz koplje zlatni porub i štit sa svetlim dvoglavim orlom.

Naslikaj ga kao **pravu tkaninu**: svila sa zlatnim vezom, mekim naborima i senkama, mat, u istom slikanom stilu kao stari barjak. Orao je na štitu jasan i ceo, a trake i krstići su zlatni vez. Ništa ne izgleda ravno, kao vektorska slika.

Sva pravila iz dela „Klip 1” ostaju ista:
- samo tkanina, bez koplja;
- ivica uz koplje na x=40, od y=156 do y=356;
- dužina oko 300 px;
- 8 kadrova, petlja, glatko pretapanje.

Pokret je kao u `stari-barjak-kadrovi.png`: nabori putuju od koplja ka lastinom repu, a krajevi repa se najviše njišu.

Provera:
- obe zlatne trake sa krstićima i štit sa orlom vide se u svakom kadru;
- lastin rep ima dva kraka;
- nema zelenih piksela;
- ivica uz koplje je na istom mestu (±2 px).

Za ovaj novi izgled imaš najviše dva pokušaja: `attempt-3` i `attempt-4` (u skripti dozvoli pokušaj 4 samo za zastavu). Status dopiši u `STATUS-D64.md`.
