# Dopuna 90 (od Claude-a, 18. 11.): Oranje drumova, nove pozadine

Stefan (18. 11.): „sredi pozadine, paralaks … za svaki nivo mora to bolje”.

Pozadina Oranja ima slojeve (nebo sa selom i tvrđavom, daleko, srednje, blizu) koji se ponavljaju vodoravno; bliži sloj je skoro prazan (dve kruške i njive), pa nivo izgleda pusto i isto (`uzori-d90/sada-u-igri-oranje.jpg`). Prave se **druge verzije** srednjeg i bližeg sloja (igra ih smenjuje: A, B, A, C …) i **prednji sloj** koji ide ispred Marka.

Status piši u `art/world-pack-03/STATUS-D90.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D90`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D87–D89, D91, D92): ne diraj njihove fajlove; svoje skripte zovi `*-dopuna90.py`.

## Uzori (`art/world-pack-03/uzori-d90/`)

- `sloj-oranje-sky`, `sloj-oranje-far`, `sloj-oranje-mid`, `sloj-oranje-near-rucno` (`.png` i `-na-plavom.jpg`): sadašnji slojevi. **Isti rukopis, boje, svetlo (sunce gore levo), letnje zlatna žita, ista visina horizonta.**
- `sada-u-igri-oranje.jpg`: kako to sada izgleda u igri.

## Pravila

- Svaka slika je **2172×724**, providna iznad oblika (nebo se ne crta). Crta se na ravnoj **jarko ljubičastoj #ff00ff** pozadini i ključ skida ljubičastu; posle skidanja pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez rupica u lišću i žitu.
- `image_gen` ne daje 2172×724: nacrtaj u najvećoj vodoravnoj veličini (npr. 1536×1024) sa istim rasporedom, pa iseci i razvuci na 2172×724.
- **Donja ivica:** kod `-mid` i `-near` donji pojas (njive, put, žito) mora biti iste visine i iste boje kao u uzoru, celom širinom, da se slojevi nastave jedan u drugi. Levih i desnih ~260 px neka bude mirno (njiva, žito, nisko drveće), bez zgrade presečene ivicom.
- Bez ljudi, životinja i teksta (ljudi u njivama dolaze posebno, kao animacije).

## Slike (u `art/world-pack-03/`)

| Ime | Šta se vidi |
|---|---|
| `oranje-near-b` | Bliži sloj, druga verzija: **vodenica** na potoku (kamena, drveni točak, mali brvnasti most), vrbe uz potok, plastovi sena sa motkom u sredini, njive iza. |
| `oranje-near-c` | Bliži sloj, treća verzija: **gumno** (okrugao utaban krug sa stožerom u sredini i snopljem oko njega), **bunar sa đermom**, drvena ambarina na direcima, šljivik, pleter-ograda. |
| `oranje-mid-b` | Srednji sloj, druga verzija: na brežuljku u daljini **selo** sa crkvicom i kućama pod ćeramidom, polja u trakama (žito, kukuruz, uzorano), drvoredi, put koji vijuga. Manje i bleđe od bližeg sloja. |
| `oranje-prednji` | **Prednji sloj (ispred Marka)**: samo donja trećina slike je puna, gore providno. Tamnije i malo zamućeno (blizu kamere): klasje pšenice, bulke, različak, čičak, po koji kamen i kolac pletera. **Najviše trećina širine sme imati nešto visoko** (do pola visine slike), ostalo nisko klasje, da ne zakloni borbu. Nastavlja se levo-desno bez šava. |

Najviše tri pokušaja po slici. U status upiši pokušaj koji je uzet i proveru donjeg pojasa (uporedi sa uzorom).
