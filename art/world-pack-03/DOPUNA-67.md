# Dopuna 67 (od Claude-a, 18. 11.): strah i beg, prva grupa (sabljaš, strelac, akindžija, kopljanik)

Stefan (18. 11.): „naruči još animacija za neprijatelje… neka neki beže od nas kada se uplaše, treba da imamo taj momenat kroz celu igru”.

Kad Marko jednim udarcem smrvi njihovog druga ili obori starešinu, neki Turci se uplaše: trgnu se, pa okrenu leđa i beže, osvrćući se. Za to svaki tip dobija dva klipa.

Status piši u `art/world-pack-03/STATUS-D67.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D67`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D68, D69, D70): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna67.py` i `verify-dopuna67.py`.

## Uzori (`art/world-pack-03/uzori-d67/`)

Za svaki tip `<tip>` (`sword`, `archer`, `akindzija`, `kopljanik`):
- `<tip>-idle-kadar0.png`: lik kako stoji u igri, ćelija 512×512, stopala na y=488, gleda udesno. **Uzor lika i veličine.** Visine: sword 426 px, archer 456 px, akindzija 370 px, kopljanik 410 px.
- `pokret-<tip>-run.png`: njegov trk (isti lik u pokretu, uzor za noge i odeću u trku).
- `pokret-<tip>-hurt.png`: kako izgleda kad primi udarac (uzor za trzaj).

Svaki klip je **uređivanje kadra 0 tog lika** (`image_gen` sa `<tip>-idle-kadar0.png` kao ulazom), ne crtež iz opisa: isti čovek, ista odeća, boje i oružje, ista veličina (±5 %).

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla i senke.
- Jedan `image_gen` poziv crta mrežu (2×2 za 4 kadra, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju.
- Stopala na y=488; lik na istom mestu u ćeliji u svim kadrovima (trči u mestu).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png` (N ćelija u redu), `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a, ASCII opisi. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D67.
- Provera svakog kadra: ništa ne dodiruje ivicu, nema zelenih piksela, ruke, noge i oružje celi, lik isti kao uzor. Visinu uspravnog kadra **izmeri** i uporedi sa brojem gore.
- Najviše tri pokušaja po klipu. Ako ni treći ne valja, NE izvozi; upiši šta ne valja i idi dalje.

## Klipovi (redom: oba klipa jednog tipa, pa sledeći tip)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `<tip>-uplasen` | 4 | ne | Uplaši se. 0: stoji kao na uzoru; 1: trgne se unazad, ramena uvuče, oči razrogačene, usta otvorena; 2: ustukne korak, slobodnu ruku digne pred lice, kolena mu popuste, oružje spušteno; 3: napola se okrene od nas (telo već okrenuto ulevo, glava još gleda udesno), spreman da beži. |
| `<tip>-bezi` | 8 | da | Beži u panici, trči **udesno** (profil udesno, noge kao u `pokret-<tip>-run.png`), a glavu okreće unazad preko ramena (gleda ulevo, uplašen). Telo nagnuto napred, oružje nisko: sablja spuštena uz nogu, luk u spuštenoj ruci, koplje vuče za sobom. Kadar 7 se pretapa u 0. |

Ukupno 8 klipova: `sword-uplasen`, `sword-bezi`, `archer-uplasen`, `archer-bezi`, `akindzija-uplasen`, `akindzija-bezi`, `kopljanik-uplasen`, `kopljanik-bezi`.
