# Dopuna 46 (od Claude-a): sve što Marku treba za lanac, kuke i nove junačke udare

Druga serija Lost Crown moći je u igri: Ravijojlin lanac (C), trk po zidu, Vilinsko oko (drži O), odmor na Ravijojlinom izvoru, Potres i Šarčev gaz (F/R). Marko u njima još pozajmljuje tuđe poze, a pet moći nema ikonu na traci. Ova dopuna to zatvara. Igra je već spremna: čim se klip pojavi u rig-u, koristi ga, sa međukadrovima.

Pravila su ista kao za ostale klipove:
- ćelije su 512×512, a oslonac je na y=487;
- klip ide u `art/animation-pack-04/assets/<klip>/`, sa atlasom, manifestom sa frame_layout, frames i preview.gif;
- klip koji se pušta jednom ima holdLastFrame=true;
- posle svake stavke upiši red u `STATUS-ANIMACIJE.md`.

Slikano, mat, bez krvi. Marko mora da liči na sebe iz `marko-idle-2`: isto lice, brkovi, crveni ogrtač, topuz, i bez turbana. Marko je iste veličine kao u `marko-idle-2` i okrenut je udesno. Kod igre i `dist/` ne diraj, i ne commit-uj (to radi Claude).

Lanac, kuku, sjaj, talas i prašinu crta igra. U klipovima ih ne crtaj dalje od Markove šake.

## Deo 1: Marko (najvažnije)

| Klip | Kadrova | Opis |
|---|---|---|
| `marko-lanac-trgne` | 5, jednom | Lanac je zakačio Turčina ili njegov štit: Marko se raskorači, nagne unazad i jednim snažnim trzajem obe ruke povuče lanac k sebi. 0–1: hvata zamah, 2: trzaj (ruke uz grudi), 3–4: stabilizuje se. |
| `marko-lanac-vuce` | 6, petlja | Vuče težak teret lancem: raskoračen, nisko, nagnut unazad, ruku preko ruke vuče lanac ka sebi. |
| `marko-potres` | 8, jednom | Potres: obema rukama digne topuz visoko iznad glave (0–2), malo poskoči (3) i tresne njim o zemlju ispred sebe. Kontakt je u kadru 4 (glava topuza na tlu, kolena savijena), 5–7 se diže. |
| `marko-zvizduk` | 6, jednom | Šarčev gaz: stavi dva prsta leve ruke u usta i zazviždi (1–3), desnom rukom sa topuzom pokaže napred (2–4), a 4–5 korakne unazad da propusti konja. |
| `marko-oko` | 6, petlja | Vilinsko oko: stoji mirno, levu šaku drži iznad očiju kao zaklon i gleda daleko napred, a topuz u desnoj ruci je spušten. Diše mirno, ogrtač se blago njiše. Sjaj očiju crta igra. |
| `marko-zid-trk-vodoravno` | 6, petlja | Trči vodoravno uz zid sa Ravijojlinim šarama, koji je iza njega: dugi koraci kao u trku, telo nagnuto napred, a leva šaka klizi po zidu iza njega (šaka i ruka malo tamnije, kao noga u pozadini). Zid ne crtaj. |
| `marko-launcher` | 6, jednom | Udarac koji Turčina diže u vazduh (W+K): iz čučnja, topuzom odozdo nagore, objema rukama, celim telom. Kontakt je u kadru 3, a 4–5 su ispraćaj sa topuzom visoko. (Isto kao u DOPUNA-45; ako je već nacrtan, preskoči.) |

## Deo 2: Šarac

| Klip | Kadrova | Opis |
|---|---|---|
| `sarac-galop` | 8, petlja | Šarac bez jahača u punom galopu: isti konj kao u `mounted-run` i `cast/sarac` (šaren, isto sedlo, uzda i kićanka), u istoj veličini kao u `mounted-run`. Griva i rep vijore. Kopita ostaju na y=487 u kadrovima kad dodiruje tlo. |

## Deo 3: ikone moći (po jedna slika, providna pozadina)

Ikone za traku veština, 128×128, u stilu postojećih `dist/assets/world/ikona-juris.webp` i `ikona-kolut.webp`. Sačuvaj ih kao `art/world-pack-03/ikona-<id>.png`.

| Slika | Opis |
|---|---|
| `ikona-trag` | svetli otisak dlana sa tri iskre (Vilin trag) |
| `ikona-lanac` | srebrni lanac u luku, sa kukom na kraju, tirkizan sjaj |
| `ikona-oko` | oko sa ljubičastim vilinskim sjajem |
| `ikona-potres` | topuz koji udara u zemlju, sa pukotinom |
| `ikona-gaz` | konjsko kopito u trku, sa prašinom |

## Deo 4: lanac i kuka za igru (po jedna slika, providna pozadina)

| Slika | Veličina | Opis |
|---|---|---|
| `lanac-karika` | 32×64 | Jedna karika Ravijojlinog lanca: srebrna, sa slabim tirkiznim sjajem. Ponavlja se, pa gornji i donji kraj moraju da se nastave. |
| `lanac-kuka` | 96×96 | Kuka na kraju lanca, srebrna, sa vilinskim šarama. |
| `kuka-alka` | 96×96 | Srebrna alka ukovana u kamen, za koju se lanac kači u svetu. |

## Redosled

Ako nestane kredita, ono što je gore važnije je.

1. `marko-lanac-trgne`, `marko-potres`, `marko-zvizduk`, `sarac-galop`
2. `marko-oko`, `marko-zid-trk-vodoravno`, `marko-lanac-vuce`, `marko-launcher`
3. Deo 3 (ikone)
4. Deo 4
