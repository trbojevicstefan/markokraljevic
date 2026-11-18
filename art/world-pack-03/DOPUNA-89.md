# Dopuna 89 (od Claude-a, 18. 11.): Manastirski vis, nove pozadine

Stefan (18. 11.): „sredi pozadine, paralaks … za svaki nivo mora to bolje”.

Pozadina Manastirskog visa ima četiri sloja (nebo, daleko, srednje, blizu) koji se ponavljaju vodoravno. Bliži sloj ima jedan zvonik sa kapijom, pa se kroz ceo nivo isti zvonik ponavlja na svakih nekoliko koraka (`uzori-d89/sada-u-igri-manastir.jpg`). Prave se **druge verzije** srednjeg i bližeg sloja (igra ih smenjuje: A, B, A, C …) i **prednji sloj** koji ide ispred Marka.

Status piši u `art/world-pack-03/STATUS-D89.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D89`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D87, D88, D90–D92): ne diraj njihove fajlove; svoje skripte zovi `*-dopuna89.py`.

## Uzori (`art/world-pack-03/uzori-d89/`)

- `sloj-manastir-sky.png`, `sloj-manastir-far-rucno.png`, `sloj-manastir-mid.png`, `sloj-manastir-near-rucno.png`: sadašnji slojevi (2172×724, nebo providno), uz svaki i `*-na-plavom.jpg` da se vidi ivica. **Nove verzije moraju imati isti rukopis, boje, svetlo (sunce gore levo), jesenje boje i istu visinu horizonta**, da se smenjuju bez skoka.
- `sada-u-igri-manastir.jpg`: kako to sada izgleda u igri (vidi se ponavljanje zvonika).

## Pravila

- Svaka slika je **2172×724**, providna iznad oblika (nebo se ne crta). Crta se na ravnoj **jarko ljubičastoj #ff00ff** pozadini i ključ skida ljubičastu; posle skidanja pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez rupica u kamenu i lišću.
- `image_gen` ne daje 2172×724: nacrtaj u najvećoj vodoravnoj veličini (npr. 1536×1024) sa istim rasporedom (donji pojas slike odgovara donjem pojasu uzora), pa iseci i razvuci na 2172×724.
- **Donja ivica:** kod `-mid` i `-near` donji pojas (stene, trava, ivica litice) mora biti iste visine i iste boje kao u uzoru, celom širinom, da se slojevi nastave jedan u drugi. Levih i desnih ~260 px neka bude mirno (niske stene, drveće), bez zgrade presečene ivicom.
- Bez ljudi, životinja, teksta i barjaka koji se vijore preko ivice.

## Slike (u `art/world-pack-03/`)

| Ime | Šta se vidi |
|---|---|
| `manastir-near-b` | Bliži sloj, druga verzija: **manastirski konak** na dva sprata (kamen dole, drvo i doksat gore, krov od ćeramide), ispred njega **česma** od kamena sa koritom, nekoliko košnica uz zid, dva čempresa i jesenje drveće. Bez zvonika. |
| `manastir-near-c` | Bliži sloj, treća verzija: **manastirsko groblje** sa kamenim krstovima, mala kapela-paraklis sa kupolom, stara kruška i čempresi, kameni zid ograde sa drvenom kapijicom. Bez zvonika. |
| `manastir-mid-b` | Srednji sloj, druga verzija: na grebenu u daljini **isposnica** (mala crkva u steni) i kamena staza ka njoj, vinograd na terasama, jesenje šume, reka u klancu. Manja i bleđa od bližeg sloja (dalje je). |
| `manastir-prednji` | **Prednji sloj (ispred Marka)**: samo donja trećina slike je puna, gore providno. Tamnije i malo zamućeno (blizu kamere): visoka trava, jesenje lišće grmlja, po neki čempres koji ulazi odozdo, kamen. **Najviše trećina širine sme imati nešto visoko** (do pola visine slike), ostalo niska trava, da ne zakloni borbu. Nastavlja se levo-desno bez šava. |

Najviše tri pokušaja po slici. U status upiši pokušaj koji je uzet i proveru donjeg pojasa (uporedi sa uzorom).
