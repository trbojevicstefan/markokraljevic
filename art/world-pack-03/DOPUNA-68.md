# Dopuna 68 (od Claude-a, 18. 11.): strah i beg, druga grupa (štitonoša, palikuća, tufekdžija, pas)

Stefan (18. 11.): „naruči još animacija za neprijatelje… neka neki beže od nas kada se uplaše, treba da imamo taj momenat kroz celu igru”.

Kad Marko jednim udarcem smrvi njihovog druga ili obori starešinu, neki Turci se uplaše: trgnu se, pa okrenu leđa i beže, osvrćući se. Ratni pas podvije rep. Za to svaki tip dobija dva klipa.

Status piši u `art/world-pack-03/STATUS-D68.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D68`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D67, D69, D70): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna68.py` i `verify-dopuna68.py`.

## Uzori (`art/world-pack-03/uzori-d68/`)

Za svaki tip `<tip>` (`shield`, `palikuca`, `tufekdzija`, `pas`):
- `<tip>-idle-kadar0.png`: lik kako stoji u igri, ćelija 512×512, stopala na y=488, gleda udesno. **Uzor lika i veličine.** Visine: shield 454 px, palikuca 464 px (sa bakljom), tufekdzija 417 px, pas 192 px.
- `pokret-<tip>-run.png`: njegov trk (isti lik u pokretu).
- `pokret-<tip>-hurt.png`: kako izgleda kad primi udarac.

Svaki klip je **uređivanje kadra 0 tog lika** (`image_gen` sa `<tip>-idle-kadar0.png` kao ulazom), ne crtež iz opisa: isti lik, ista odeća, boje i oružje, ista veličina (±5 %).

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla i senke.
- Jedan `image_gen` poziv crta mrežu (2×2 za 4 kadra, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju.
- Stopala (šape) na y=488; lik na istom mestu u ćeliji u svim kadrovima (trči u mestu).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png` (N ćelija u redu), `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a, ASCII opisi. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D68.
- Provera svakog kadra: ništa ne dodiruje ivicu, nema zelenih piksela, ruke, noge i oružje celi, lik isti kao uzor. Visinu uspravnog kadra **izmeri** i uporedi sa brojem gore.
- Najviše tri pokušaja po klipu. Ako ni treći ne valja, NE izvozi; upiši šta ne valja i idi dalje.

## Klipovi (redom: oba klipa jednog tipa, pa sledeći tip)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `shield-uplasen`, `palikuca-uplasen`, `tufekdzija-uplasen` | 4 | ne | Uplaši se. 0: stoji kao na uzoru; 1: trgne se unazad, ramena uvuče, oči razrogačene, usta otvorena; 2: ustukne korak, kolena mu popuste (štitonoša se sakrije iza štita, palikuća spusti baklju, tufekdžija privuče pušku na grudi); 3: napola se okrene od nas (telo okrenuto ulevo, glava još gleda udesno), spreman da beži. |
| `shield-bezi`, `palikuca-bezi`, `tufekdzija-bezi` | 8 | da | Beži u panici, trči **udesno** (profil udesno, noge kao u `pokret-<tip>-run.png`), a glavu okreće unazad preko ramena (gleda ulevo, uplašen). Telo nagnuto napred. Štitonoša nosi štit na leđima ili ga vuče, sablja spuštena; palikuća drži baklju nisko (plamen se povija unazad); tufekdžija nosi pušku u jednoj ruci, cev dole. Kadar 7 se pretapa u 0. |
| `pas-uplasen` | 4 | ne | Pas se uplaši. 0: stoji kao na uzoru; 1: trgne se, uši zalepi unazad; 2: spusti se nisko na prednje šape, podvije rep, zacvili; 3: okrene glavu od nas, spreman da beži. |
| `pas-bezi` | 8 | da | Pas beži **udesno** podvijenog repa i zalepljenih ušiju, nisko uz zemlju (galop kao u `pokret-pas-run.png`), glava spuštena. Kadar 7 se pretapa u 0. |

Ukupno 8 klipova.
