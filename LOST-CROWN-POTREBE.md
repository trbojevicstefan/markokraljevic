# Šta treba za igru u stilu *The Lost Crown*

Ovde su samo ideje mehanika i strukture iz te igre. Iz nje ne uzimamo grafiku, kod, imena moći ni raspored soba. Svaka stavka dobija Markov ekvivalent i jedan od tri statusa:
- **postoji**: radi u igri; naveden je klip iz `dist/assets/` (broj kadrova) ili funkcija iz `dist/game.js`;
- **dorada**: postoji osnova, ali fali deo, najčešće sopstveni crtež ili kod;
- **treba nacrtati**: nema ničeg; treba crtež, a obično i kod.

Probni prostor je greybox: `index.html?greybox` (`dist/greybox.js`). Ima osam sivih soba, tri moći koje se skupljaju i kapije koje te moći otvaraju. Opis je na kraju.

## 1. Pokreti

| Lost Crown (ideja) | Marko | Status | Gde |
|---|---|---|---|
| Trk, kretanje i okret | trk, hod, polazak, kočenje, okret | **postoji** | `marko-run` 6, `marko-walk` 8, `marko-run-start` 4, `marko-run-stop` 4, `marko-turn` 4 |
| Skok, pad, doskok | skok, skok iz trka, pad, doskok, kolut pri doskoku | **postoji** | `marko-jump` 6, `marko-jump-rise` 4, `marko-run-jump` 8, `marko-fall` 4, `marko-land` 4, `marko-roll-land` 6 |
| Dupli skok | Sokolovo krilo | **dorada**: radi (`sokolovoKrilo()`), ali krila i perje crta kod preko `marko-jump-rise`; sopstveni klip ne postoji | treba `marko-krilo` |
| Zid: klizanje i odskok | odskok od zida (veština „zid“) | **postoji** (u greybox-u isključen, da se zidovi ne bi preskakali) | `marko-wallslide` 4, `marko-walljump` 6, `wallCheckLevel()` |
| Ivica: hvat, visenje, penjanje | hvat ivice, visi, W se penje | **postoji** | `marko-hang` 6, `marko-ledge` 8, `marko-climb` 8, `ledgeCheckLevel()` |
| Klizanje ispod prepreke | klizanje (`p.slide`), čučanj i hod u čučnju | **postoji**; **dorada**: nivoi nemaju niske prolaze kroz koje se mora kliziti | `marko-slide` 6, `marko-crouch` 6, `marko-crouch-walk` 8 |
| Juriš na zemlji (izmicanje) | kolut, neranjiv | **postoji** | `marko-roll` 6 |
| Juriš u vazduhu | Juriš u vazduhu (Shift u skoku) | **dorada**: radi (`startNalet()`, `naletTick()`), a poza je pozajmljena iz `pack3Pose` | treba `marko-nalet` |
| Kombo na zemlji | Junački niz J J J (+ četvrti) | **postoji** | `marko-combo-1` 6, `-2` 6, `-3` 6, `-4` 8, `marko-combo-recover` 4 |
| Vazdušni kombo | udarci u skoku | **dorada**: dva udarca, a treći, zakucavanje, nema svoj crtež | `marko-air-1` 5, `marko-air-2` 5; treba `marko-air-3` |
| Launcher (udarac uvis, pa skok za njim) | aperkat S+K, „ZA NJIM!“ | **postoji** | `marko-uppercut` 6, `*-launch` 6 za svakog Turčina |
| Udar nadole | S + J u skoku, tresak | **postoji** | `marko-plunge` 6 |
| Parry i kontra, znak napada | L u pravom trenutku, kontra; zlatni „!“ se odbija, crveni „✕“ ne | **postoji** | `marko-block` 6, `marko-block-hit` 4, `marko-counter` 8 |
| Specijali (traka koja se puni) | bes: Junački udar (R), Vihor (F), pun zamah | **postoji** | `marko-super` 6, `marko-vihor` 8, `marko-charged` 6, `marko-charge-hold` 4 |
| Luk ili bacanje | bačeni topuz koji se vraća, nisko bacanje | **postoji** | `marko-throw` 8, `marko-crouch-throw` 6 |
| Teleport (ostavi senku, vrati se na nju) | Vilin trag (V) | **dorada**: radi (`vilinTrag()`); duh je Markova poza obojena kodom, a ikonica `ikona-trag.webp` ne postoji (404) | treba `marko-trag-ostavi`, `marko-trag-povratak`, `ikona-trag` |
| Kuka: privlačenje do tačke ili predmeta | nema | **treba nacrtati**, plus kod (kuka, tačke za kačenje) | `marko-kuka-baci`, `marko-kuka-let`, `kuka-lanac` |
| Otkrivanje skrivenih platformi (vid) | nema; najbliži je Ravijojlin bljesak (E) | **treba**: kod i efekat; crtež samo za ploče koje se pojave | `ploca-vilinska` |
| Odmor na čekpointu | nema poze | **treba nacrtati** | `marko-odmor`, `marko-odmor-ustaje` |

## 2. Neprijatelji

| Tip (ideja) | Marko | Status | Gde |
|---|---|---|---|
| Osnovni mačevalac | janičar | **postoji** | `sword-*`: idle 6, run 6, attack 6, lunge 6, hurt 4, death 6, jump 6, launch 6 |
| Štit spreda, mora se obići ili slomiti | štitonoša | **postoji** | `shield-*`, `shield-guardbreak` 4, `shield-bash` 6 |
| Daljinski strelac | strelac, tufekdžija | **postoji** | `archer-shoot` 6, `archer-shoot-down` 6, `tufekdzija-shoot` 8 |
| Brz skakač | akindžija | **postoji** | `akindzija-charge` 6, `akindzija-jump` 6, `akindzija-spin` 6, `akindzija-backstep` 4 |
| Težak oklopnik čiji se udarci ne odbijaju | oklopnik | **postoji** | `oklopnik-slam` 6, `oklopnik-rush` 6, `oklopnik-grab` 6, `oklopnik-armorbreak` 4 |
| Vatra i zona na tlu | palikuća | **postoji** | `palikuca-torch` 6, `palikuca-fire` 6, `palikuca-bomb` 6 |
| Dugi domet, kosi po nogama | kopljanik | **postoji** | `kopljanik-*`, `kopljanik-sweep` 6 |
| Životinja koja napada u čoporu | pas | **postoji** | `pas-*` (run 8, attack 6), `kostac-pas` 8 |
| Leteći napadač koji se obrušava | soko (sad samo u priči i loveu) | **dorada**: let i napad postoje, a protivnik u vazduhu nema kod, trzaj ni pad | `soko-let` 8, `soko-napad` 6; treba `soko-pogodjen`, `soko-pad` |
| Čarobnjak koji nestaje i pojavljuje se | nema | **treba nacrtati**, plus kod | `vrac-*` |
| Puzavac po zidu i tavanici | nema | **treba nacrtati**, plus kod | `sarka-*` |
| Mrtvac koji ustaje | kosturi su samo ukras | **dorada**: ustajanje postoji, napad ne | `kostur-stoji` 6, `kostur-pada` 8; treba `kostur-napad`, `kostur-hurt` |
| Elitna varijanta | elitni Turci (`makeElites()`), jači i obojeni | **postoji** | kod |

## 3. Bosovi

| Tip (ideja) | Marko | Status | Gde |
|---|---|---|---|
| Dvoboj sa čovekom: gard, kontra, faze | Musa, Janičarski aga, Đemo | **postoji** | `musa-*`, `janicarski-aga-*`, `djemo-*`, `champMegdanTick()` |
| Jahač koga treba oboriti sa konja | Akindžijski beg | **postoji** | `beg-mounted` 8, `beg-mounted-strike` 6, `beg-unhorsed` 6 |
| Džin koji udara u tlo i zaleće se u zid | Hasan-aga, Musa (tresak) | **postoji** | `hasan-aga-zalet` 6, `hasan-aga-zaglavljen` 4, `musa-stomp` 6 |
| Velika zver | Aždaja | **postoji** | `azdaja-fire` 8, `azdaja-bite` 6 |
| Arena koja se menja u borbi | Dželat (cepa grede), Ognjeni aga (pali pod) | **postoji** | `dzelat-*`, `ognjeni-aga-ulje` 6 |
| Bos do kog se stiže pokretom (kula, greda) | Arapin, Tufekdžija-baša | **postoji**; **dorada**: da traže krilo, juriš ili trag | `arapin-throw` 6 |
| Potera | potera za vilom na Šarcu | **postoji** | `updatePotera()` |
| Leteći bos | nema | **treba nacrtati**, plus kod | `ala-*` |
| Čarobnjak sa klonovima i teleportom | nema | **treba nacrtati** (isti lik kao vrač, veći), plus kod | `vrac-*` + `vrac-klon` |
| Mini-bos u sobi (čuvar prolaza) | čuvar arene u greybox-u (Janičarski aga, 700 snage) | **postoji** | `greybox.js`, arena `X.arena0`–`X.arena1` |

## 4. Struktura sveta

| Stavka (ideja) | Marko | Status | Gde |
|---|---|---|---|
| Povezana mapa (sobe, prelazi, povratak) | pohodi su linearni putevi; greybox ima prvi povezani svet | **dorada** | `GB_ROOMS`, `gbRoomAt()`, `gbCamera()` |
| Zaključani prolazi koji traže moć | veštine u pohodima (`SKILLS`, `has()`); u greybox-u kapije za krilo, juriš i trag | **postoji** u greybox-u; **dorada** za pohode | `GB_LINKS`, `gbGate`, `moc()` |
| Čekpointi koji leče | barjaci u pohodima (`ckptTick()`); u greybox-u kamen koji leči | **postoji**; **dorada**: sopstveni crtež (može vilinski kamen) | `vilinski-kamen-spava` 6, `-budi` 6, `-budan` 6 |
| Amajlije sa ograničenim mestima | čuda (`CUDA`, 14) su pasivna i sva rade odjednom; amajlija sv. Đorđa se kupuje | **dorada**: mesta za opremanje i izbor | `applyPerks()`, `perks` |
| Valuta | dukati | **postoji** | `addCoins()`, `bank()` |
| Trgovac | trgovac pred megdanom | **postoji** | `trgovac-tezga-idle` 6, `renderDucan()` |
| Kovač i nadogradnje | Novak kovač (zdravlje, čutura, zadužbina) | **postoji** | `novak-kuje` 8 |
| Mapa sa oznakama (pinovi, prikaz soba) | mapa pohoda u meniju; u greybox-u mala mapa soba, ali bez pinova | **dorada**: pinovi i ikone | `gbMap()`; treba `mapa-ikone` |
| Tajne sobe i lomljivi zidovi | zid koji se ruši, riznice sa ključem | **postoji** | `drawCrackWall()`, `vaults` |
| Brzo putovanje između tačaka | nema | **treba**: kod; crtež može da bude budan vilinski kamen | — |
| Nadogradnja zdravlja iz delova | srca (4 dela daju +20) | **postoji** | `takeHeart()`, `applyHearts()` |
| Lekovi (punjenja) | čutura sa vinom | **postoji** | `marko-drink` 6, `marko-drink-walk` 8 |
| Sporedni zadaci i likovi | putnici, guslari, sirotinja, svatovi | **postoji** | `updateGuslari()`, `updateKavezi()` |
| Zapisi i predmeti priče | zapisi, slova MARKO, čuda | **postoji** | `takeZapis()`, `collectLetter()` |

## 5. Animacije koje treba nacrtati

Pravila su ista kao u DOPUNA briefovima: ćelija 512×512, oslonac na y=487, a klip koji se pušta jednom ima holdLastFrame. Nacrt za crtača je u `art/world-pack-03/DOPUNA-POKRETI-NACRT.md`.

**Marko (prioritet 1: greybox moći)**
| Klip | Kadrova | Petlja | Šta |
|---|---|---|---|
| `marko-krilo` | 6 | jednom | dupli skok: u vazduhu se odrazi, ogrtač se raširi kao krila, kolena gore |
| `marko-nalet` | 4 | petlja | juriš u vazduhu: telo skoro vodoravno, topuz nazad, ogrtač vijori |
| `marko-nalet-kraj` | 3 | jednom | izlazak iz naleta u pad |
| `marko-trag-ostavi` | 6 | jednom | dlan na tlo, svetli trag ostaje |
| `marko-trag-povratak` | 6 | jednom | pojavi se iz svetla, spusti se na noge |
| `marko-air-3` | 5 | jednom | treći udarac u vazduhu, nadole |
| `marko-kuka-baci` | 6 | jednom | baci kuku sa lancem napred i nagore |
| `marko-kuka-let` | 4 | petlja | vuče se za lancem |
| `marko-odmor` | 6 | jednom | sedne kraj kamena |
| `marko-odmor-ustaje` | 4 | jednom | ustane |

**Protivnici i bosovi (prioritet 2)**
| Klip | Kadrova | Šta |
|---|---|---|
| `soko-pogodjen` | 4 | leteći soko pogođen |
| `soko-pad` | 6 | soko pada, jednom |
| `vrac-idle` | 6 | vrač (narodni čarobnjak, ogrtač, štap od kosti) |
| `vrac-carolija` | 8 | baca čini |
| `vrac-nestaje` | 6 | nestaje u dimu, jednom |
| `vrac-pojavljuje` | 6 | pojavljuje se iz dima, jednom |
| `vrac-hurt` | 4 | trzaj |
| `vrac-death` | 6 | pad, jednom |
| `sarka-puzi` | 8 | velika zmija šarka puzi (radi i po zidu: isti klip se okreće u kodu) |
| `sarka-napad` | 6 | ujed |
| `sarka-death` | 6 | jednom |
| `kostur-napad` | 6 | kostur ratnik seče zarđalom sabljom |
| `kostur-hurt` | 4 | trzaj |
| `ala-let` | 8 | Ala, leteća neman oluje, petlja |
| `ala-obrusavanje` | 6 | obrušavanje |
| `ala-oluja` | 8 | priziva oluju (grad i vetar) |
| `ala-hurt` | 4 | trzaj |
| `ala-pad` | 8 | pada, jednom |

**Predmeti i ikone (prioritet 1, jedna slika svaki)**: `ikona-trag` (danas 404), `ikona-krilo`, `ikona-nalet`, `kuka-lanac` (segment), `kuka-glava`, `prekidac-ploca` i `prekidac-ploca-stisnuta`, `vrata-trag` i `vrata-trag-otvorena` (ili postojeći `vrata-zakljucana`/`otkljucana`), `zid-sokolov` (perje urezano u kamen visokog zida), `ploca-vilinska`, `mapa-ikone` (8 ikona po 64×64: soba, čekpoint, trgovac, tajna, kapija krila, kapija juriša, kapija traga, bos).

**Ukupno:** 10 Markovih klipova (50 kadrova), 18 klipova protivnika i bosova (110 kadrova) i 12 pojedinačnih slika.

## Greybox: kako je napravljen

`index.html?greybox` (lokalno `npm start`, pa http://127.0.0.1:4173/index.html?greybox).

| Soba | Šta je unutra |
|---|---|
| Skrivena riznica | tajna iza prvog zida (+20 zdravlja); do nje se stiže tek sa krilom |
| Predvorje | početak, čekpoint, visok zid prema tajni, nizak blok za vežbu hvata ivice |
| Stražarnica | susret 1: janičar, strelac na bloku, štitonoša |
| Sokolova odaja | Sokolovo krilo, pa zid od 345 px (bez krila se dohvata 266, sa krilom 383) |
| Ponor | susret 2: akindžija i štitonoša; Juriš u vazduhu; ponor od 500 px (bez juriša najviše 469, sa jurišem i običnim zaletom 553) |
| Vilina odaja | prekidač kraj ulaza, Vilin trag, vrata 1300 px dalje koja ostaju otvorena 1 s |
| Predsoblje | čekpoint 2, susret 3: oklopnik i palikuća |
| Arena čuvara | mini-bos Janičarski aga, sa gredama po kojima skače |

U greybox-u nema zid-skoka ni Vilinskog uzleta (E u skoku), jer bi preskočili kapije. Ništa se ne upisuje u sačuvanu igru: ni pohod, ni megdan, ni veština. Jedino dukati sa palih Turaka i dalje idu u kesu.

`node greybox-test.mjs` (46 provera, deo je `npm test`) radi stvarnim ulazima:
- svaka soba je dostižna kad se skupe moći;
- svaka kapija ostaje zatvorena bez svoje moći: 40 pokušaja kod svakog zida i 234 pokušaja kod ponora;
- kroz vrata se bez traga ne stiže;
- prolazi ceo greybox od početka do čuvara, sa tajnom i povratkom na čekpoint posle pada.
