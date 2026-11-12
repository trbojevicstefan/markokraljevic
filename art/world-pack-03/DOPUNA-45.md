# Dopuna 45 (od Claude-a): Markove moći, međupoze udaraca i klipovi koje međukadrovi ne mogu da poprave

Igra sada računa međukadrove optičkim tokom (`smooth-anims.py`). To radi za trk, hod, mirovanje i oporavak, ali ne za veliki zamah, kolut ni nagli pad: tamo igra drži nacrtani kadar i pokret seče. Novim Lost Crown moćima Marko još pozajmljuje tuđe poze. Ova dopuna rešava oba problema.

Pravila su ista kao za ostale klipove:
- ćelije su 512×512, a oslonac je na y=487;
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif;
- klip koji se pušta jednom ima holdLastFrame=true;
- posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.

Slikano, mat, bez krvi. Marko mora da liči na sebe iz `marko-idle-2`: isto lice, brkovi, crveni ogrtač, topuz, i bez turbana. Svaki drugi lik mora da liči na svoj postojeći crtež. Kod igre i `dist/` ne diraj, i ne commit-uj (to radi Claude).

## Veličina

Marko je u svakom novom klipu iste veličine kao u `marko-idle-2`, a oslonac je na y=487 i kad je u vazduhu. Visinu skoka dodaje igra. Lik je okrenut udesno.

## Deo 1: Markove nove moći (najvažnije)

Danas ove moći rade, ali Marko u njima pozajmljuje tuđe poze. Krila, perje, svetlo, lanac i senku crta igra: ne crtaj ih.

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-krilo` | 6, jednom | Sokolovo krilo, drugi skok u vazduhu. 0–1: skupi se, kolena gore. 2–3: odrazi se o vazduh, ogrtač se raširi kao dva krila, topuz je uz telo. 4–5: ispruži se nagore. |
| `marko-nalet` | 4, petlja | Juriš u vazduhu. Telo je skoro vodoravno, glava napred, topuz u desnoj ruci zabačen nazad, a ogrtač i kosa vijore pravo unazad. Bez tla. |
| `marko-nalet-kraj` | 3, jednom | Iz vodoravnog položaja se uspravi i počne da pada. Poslednji kadar je kao prvi kadar `marko-fall`. |
| `marko-trag-ostavi` | 6, jednom | Vilin trag. Klekne na jedno koleno, spusti levi dlan na tlo, pa ustane. |
| `marko-trag-povratak` | 6, jednom | Pojavi se iz svetla. 0–2: čučanj, ogrtač se spušta kao da je doleteo. 3–5: ustaje u stav kao u `marko-idle-2`. |
| `marko-air-3` | 5, jednom | Treći udarac u vazduhu: topuzom odozgo, preko glave, nadole, kao da zakucava Turčina u zemlju. Ista visina kao `marko-air-1`. |
| `marko-kuka-baci` | 6, jednom | Baci gvozdenu kuku na lancu napred i nagore. Lanac ne crtaj dalje od šake. |
| `marko-kuka-let` | 4, petlja | Visi i vuče se za lancem, ruke iznad glave, noge skupljene. |
| `marko-odmor` | 6, jednom | Sedne na zemlju, leđima uz kamen (kamen ne crtaj), topuz preko kolena. |
| `marko-odmor-ustaje` | 4, jednom | Ustaje iz poslednjeg kadra `marko-odmor` u stav kao `marko-idle-2`. |
| `marko-klizanje` | 6, petlja | Klizi niz strmu kosinu: polučučanj, jedna noga napred, telo nagnuto unazad, levom rukom balansira, ogrtač vijori. Kosinu ne crtaj; oslonac pete ostaje na y=487. |
| `marko-zid-trk` | 6, petlja | Trči uz zid naviše: telo uspravno, uz zid desno od njega, noge naizmenično gaze zid (stopala su na desnoj strani ćelije), topuz u levoj ruci, ogrtač visi nadole. |
| `marko-launcher` | 6, jednom | Udarac koji Turčina diže u vazduh: iz čučnja topuzom odozdo nagore, dva rukama, celim telom. Kontakt je u kadru 3, a 4–5 su ispraćaj sa topuzom visoko. |

## Deo 2: međupoze Markovih udaraca

Udarci imaju po 6 kadrova (vazdušni po 5). Između pripreme i kontakta topuz preleti pola ekrana u jednom koraku, pa udarac seče. Za svaki klip nacrtaj nov klip `<klip>-v2` sa **2n−1 kadrova**:
- **parni kadrovi (0, 2, 4, …) su postojeći kadrovi tog klipa, prepisani tačno, piksel po piksel**, na istom mestu u ćeliji;
- **neparni kadrovi su nove međupoze**: telo, ruke, topuz i ogrtač na pola puta između dva susedna kadra.

Međupoza je prava poza, a ne pretapanje dve slike. Topuz je na pola luka zamaha, a ne dva poluprovidna topuza. Bez zamućenja i bez duplih udova. Tako igra zadržava isti tajming i isti hitbox, a zamah dobija faze između.

| Klip | Postojećih kadrova | `-v2` kadrova |
|---|---|---|
| `marko-combo-1` | 6 | 11 |
| `marko-combo-2` | 6 | 11 |
| `marko-combo-3` | 6 | 11 |
| `marko-combo-4` | 8 | 15 |
| `marko-super` | 6 | 11 |
| `marko-run-attack` | 6 | 11 |
| `marko-air-1` | 5 | 9 |
| `marko-air-2` | 5 | 9 |
| `marko-uppercut` | 6 | 11 |
| `marko-attack` | 6 | 11 |

Najvažnija je međupoza između pripreme i kontakta (zamah). Kod lakih udaraca (combo-1 do 3, run-attack, air-1, attack) to je kadar 3 u `-v2` (između starih 1 i 2). Kod `marko-combo-4` i `marko-uppercut` to je kadar 5 (između starih 2 i 3).

## Deo 3: klipovi kojima međukadrovi ne pomažu

Isti postupak kao u delu 2: `<klip>-v2` sa 2n−1 kadrova, parni kadrovi prepisani tačno, a neparni su nove međupoze. Lik i veličina su kao u postojećem klipu.

| Klip | Postojećih | `-v2` | Šta je teško |
|---|---|---|---|
| `marko-charged` | 6 | 11 | teški udarac odozgo u zemlju |
| `marko-counter` | 8 | 15 | kontra: dva udarca zaredom |
| `marko-roll` | 6 | 11 | kolut: telo se okreće, ogrtač se obavija |
| `marko-roll-land` | 6 | 11 | doskok kolutom posle dugog pada |
| `marko-plunge` | 6 | 11 | zakucavanje iz vazduha |
| `archer-death` | 6 | 11 | strelac pada |
| `akindzija-hurt` | 4 | 7 | akindžija pogođen |
| `akindzija-jump` | 6 | 11 | akindžija skače |
| `akindzija-launch` | 6 | 11 | akindžija odbačen uvis |
| `akindzija-charge` | 6 | 11 | akindžija nasrće |
| `beg-unhorsed` | 6 | 11 | beg pada sa konja |
| `bajraktar-hurt` | 4 | 7 | bajraktar pogođen |

`magija-zrak` se ne crta: ostaje svetlosni efekat igre.

## Deo 4: novi protivnici

Zum je kao `sword-idle`, a lik je okrenut udesno.

| Lik | Klipovi | Opis |
|---|---|---|
| `soko` | `soko-pogodjen` (4), `soko-pad` (6, jednom) | Isti soko kao `soko-let`. Pogođen se zatrese i izgubi perje, a u padu se strmoglavi. |
| `kostur` | `kostur-napad` (6, jednom), `kostur-hurt` (4) | Isti kostur kao `kostur-stoji`, sa zarđalom sabljom. Napad je kos udarac. |
| `vrac` | `-idle` (6, petlja), `-carolija` (8, jednom), `-nestaje` (6, jednom), `-pojavljuje` (6, jednom), `-hurt` (4), `-death` (6, jednom) | Vrač iz narodnog predanja: mršav starac u crnom vunenom ogrtaču, sa štapom od kosti i ogrlicom od zuba. Bez turbana i krsta. Čini su ljubičast dim iz šake. U `-nestaje` se rasprši u dim, a u `-pojavljuje` se iz dima sastavi. Visina je 0,95 Marka. |
| `sarka` | `-puzi` (8, petlja), `-napad` (6, jednom), `-death` (6, jednom) | Velika zmija šarka, debela kao ruka, šarena (cik-cak po leđima). Gleda se sa strane, a dugačka je koliko je Marko visok. |
| `ala` | `-let` (8, petlja), `-obrusavanje` (6, jednom), `-oluja` (8, jednom), `-hurt` (4), `-pad` (8, jednom) | Ala, neman oluje iz predanja: telo kao krilata guja sa ženskom glavom raščupane kose, a krila su od olujnih oblaka. Visina je 2 Marka; lebdi. Grad oko nje crta igra. |

## Redosled

Ako nestane kredita, ono što je gore važnije je.

1. Deo 1, redom iz tabele (13 klipova)
2. Deo 2: prvo `marko-combo-1`, `-2`, `-3`, pa ostali
3. Deo 3
4. Deo 4: `soko`, `kostur`, `vrac`, `sarka`, `ala`

## Stanje i nastavak (12. novembar, 02:50)

- **Deo 1 je gotov**, osim `marko-launcher`: 12 klipova je u igri ili u rig-u (`STATUS-ANIMACIJE.md`). Codex je stao kad je nalog ostao bez kredita. Podizač dok ne dobije svoj crtež koristi `marko-uppercut` (alias u `build-sprite-rig.py`), uz proceduralni sloj: skupi se pred udarac i istegne se nagore kad udari.
- **Nastavak:** posle dopune kredita pokreni `art/world-pack-03/codex-nastavak.cmd`. On pokreće Codex neinteraktivno sa `codex-nastavak-prompt.txt`, od dela 2. Dnevnik je u `art/world-pack-03/codex-nastavak.log`.
- **Posle Codex-a (Claude):** `python sync-anims.py`, `python build-sprite-rig.py`, `python smooth-anims.py` za nove klipove i za one koji su dobili `-v2`. Nacrtane međupoze iz `-v2` ulaze u igru kao polovine koraka, a priprema i kontakt udarca ostaju na svom vremenu. Novi protivnici (deo 4) idu u rig, a u igru ih uvodi sesija koja pravi te protivnike.
