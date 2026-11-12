# Dopuna (nacrt, od Claude-a): moći kretanja, kuka, novi protivnici

**NACRT.** Broj dopune i redosled određuje korisnik pre slanja. Spisak potreba je u `LOST-CROWN-POTREBE.md`, a moći se mogu isprobati u `index.html?greybox`.

Ideje su iz igara tipa metroidvania. Ne prepisuj izgled, likove ni predmete ni iz jedne igre: sve je Markovo, iz naših pesama i našeg sveta.

Pravila su ista kao za ostale klipove:
- ćelije su 512×512, a oslonac je na y=487;
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif;
- klip koji se pušta jednom ima holdLastFrame=true;
- posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.

Slikano, mat, bez krvi. Marko mora da liči na sebe iz `marko-idle-2`: isto lice, brkovi, crveni ogrtač, topuz, i bez turbana. Kod igre i `dist/` ne diraj.

## Veličina

Marko je u svakom novom klipu iste veličine kao u `marko-idle-2`, a oslonac je na y=487 i kad je u vazduhu. Visinu skoka dodaje igra, kao i za `marko-jump`. Lik je okrenut udesno.

## Deo 1: tri moći (najvažnije)

Danas ove moći rade, ali Marko u njima pozajmljuje tuđe poze. Krila i senku crta igra.

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-krilo` | 6, jednom | Sokolovo krilo, drugi skok u vazduhu. 0–1: skupi se, kolena gore. 2–3: odrazi se o vazduh, ogrtač se raširi kao dva krila, topuz je uz telo. 4–5: ispruži se nagore. Perje ne crtaj, crta ga igra. |
| `marko-nalet` | 4, petlja | Juriš u vazduhu. Telo je skoro vodoravno, glava napred, topuz u desnoj ruci zabačen nazad, a ogrtač i kosa vijore pravo unazad. Bez tla. |
| `marko-nalet-kraj` | 3, jednom | Iz vodoravnog položaja se uspravi i počne da pada. Poslednji kadar je kao prvi kadar `marko-fall`. |
| `marko-trag-ostavi` | 6, jednom | Vilin trag. Klekne na jedno koleno, spusti levi dlan na tlo, pa ustane. Svetlo pod dlanom ne crtaj, crta ga igra. |
| `marko-trag-povratak` | 6, jednom | Pojavi se iz svetla. 0–2: čučanj, ogrtač se spušta kao da je doleteo. 3–5: ustaje u stav kao u `marko-idle-2`. |
| `marko-air-3` | 5, jednom | Treći udarac u vazduhu. Topuzom odozgo, preko glave, nadole, kao da zakucava Turčina u zemlju. Ista visina kao `marko-air-1`. |

## Deo 2: ikone i predmeti (po jedna slika, providna pozadina)

| Slika | Veličina | Opis |
|---|---|---|
| `ikona-trag` | 128×128 | Ikona Vilinog traga za traku veština: svetli otisak dlana sa tri iskre. Stil kao postojeće `ikona-kolut` i `ikona-juris`. Igra je već traži, ali je nema. |
| `ikona-krilo` | 128×128 | Sokolovo krilo, jedno pero u luku. |
| `ikona-nalet` | 128×128 | Topuz sa tri vodoravne crte brzine. |
| `prekidac-ploca` | 160×40 | Kamena ploča u podu sa urezanom zvezdom. |
| `prekidac-ploca-stisnuta` | 160×40 | Ista ploča, utisnuta, a zvezda svetli tirkizno. |
| `zid-sokolov` | 140×400 | Visok kameni zid sa urezanim sokolovim perom na vrhu. Igrač vidi da tu treba krilo. |
| `ploca-vilinska` | 200×40 | Ploča od svetla koja se pojavi kad je Ravijojla otkrije. |
| `mapa-ikone` | 8 × 64×64 | Ikone za mapu, u jednom redu: soba, čekpoint, trgovac, tajna, kapija krila, kapija juriša, kapija traga, bos. |

## Deo 3: kuka i odmor

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-kuka-baci` | 6, jednom | Baci gvozdenu kuku na lancu napred i nagore. Lanac ne crtaj dalje od šake, crta ga igra. |
| `marko-kuka-let` | 4, petlja | Visi i vuče se za lancem, ruke iznad glave, noge skupljene. |
| `kuka-glava` | 1 slika, 96×96 | Kovana kuka sa tri kraka. |
| `kuka-lanac` | 1 slika, 32×64 | Jedna karika koja se ponavlja. |
| `marko-odmor` | 6, jednom | Sedne na zemlju, leđima uz kamen, topuz preko kolena. |
| `marko-odmor-ustaje` | 4, jednom | Ustaje iz `marko-odmor` u stav kao `marko-idle-2`. |

## Deo 4: novi protivnici

Zum je kao `sword-idle`, a lik je okrenut udesno.

| Lik | Klipovi | Opis |
|---|---|---|
| `vrac` | `-idle` (6, petlja), `-carolija` (8, jednom), `-nestaje` (6, jednom), `-pojavljuje` (6, jednom), `-hurt` (4), `-death` (6, jednom) | Vrač iz narodnog predanja: mršav starac u crnom vunenom ogrtaču, sa štapom od kosti i ogrlicom od zuba. Bez turbana i krsta. Čini su ljubičast dim iz šake. U `-nestaje` se rasprši u dim, a u `-pojavljuje` se iz dima sastavi. Visina je 0,95 Marka. |
| `sarka` | `-puzi` (8, petlja), `-napad` (6, jednom), `-death` (6, jednom) | Velika zmija šarka, debela kao ruka, šarena (cik-cak po leđima). Gleda se sa strane, a dugačka je koliko je Marko visok. Igra je okreće da puzi po zidu. |
| `kostur` | `kostur-napad` (6, jednom), `kostur-hurt` (4) | Isti kostur kao `kostur-stoji`, sa zarđalom sabljom. Napad je kos udarac. |
| `soko` | `soko-pogodjen` (4), `soko-pad` (6, jednom) | Isti soko kao `soko-let`. Pogođen se zatrese i izgubi perje, a u padu se strmoglavi. |

## Deo 5: leteći bos

| Klip | Kadrova | Opis |
|---|---|---|
| `ala-let` | 8, petlja | Ala, neman oluje iz predanja. Telo kao krilata guja sa ženskom glavom raščupane kose, a krila su od olujnih oblaka. Visina je 2 Marka. Lebdi. |
| `ala-obrusavanje` | 6, jednom | Skupi krila i obruši se nadole, ustima napred. |
| `ala-oluja` | 8, jednom | Raširi krila i zavitla kosu, a oko nje kovitla grad. Grad crta igra. |
| `ala-hurt` | 4 | Trzaj. |
| `ala-pad` | 8, jednom | Pada i smiri se na tlu. |

## Redosled

Ako nestane kredita, ono što je gore važnije je.

1. Deo 1 (6 klipova, 30 kadrova)
2. `ikona-trag`, pa ostatak dela 2
3. Deo 3
4. Deo 4: `soko`, `kostur`, `vrac`, `sarka`
5. Deo 5
