# Dopuna 69 (od Claude-a, 18. 11.): megdan u Kosovskom selu — novi potezi Kopljanik-baše i roj pčela

Stefan (18. 11.): „za boss fight smisli da bude bolji u prvom nivou i isto mu dodaj još animacija i da bude zanimljiviji od čistog udaranja i blokiranja. Neka bude nešto interaktivno što možemo da iskoristimo.”

Megdan sela dobija arenu koja se koristi: kola sa senom u koja baša zabije koplje kad promaši juriš, i košnice koje Marko razbije da pčele napadnu bašu. Za to baši treba pet novih klipova, a igri roj pčela.

Status piši u `art/world-pack-03/STATUS-D69.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D69`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D67, D68, D70): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna69.py` i `verify-dopuna69.py`.

## Uzori (`art/world-pack-03/uzori-d69/`)

- `kopljanik-basa-idle-kadar0.png`: **Kopljanik-baša**, ćelija 512×512, stopala na y=488, gleda udesno, visok 410 px. Šlem sa belim turbanom, crveno-zlatna dolama, ljuskast oklop, okrugao bronzani štit na levoj ruci, dugo koplje sa crvenim barjačićem. **Uzor lika i veličine za svih pet klipova.**
- `pokret-kopljanik-basa-run.png`, `-attack.png`, `-hurt.png`, `-jump.png`: isti baša u pokretu.
- `stil-razbi-kosnica.png` (košnica iz igre) i `stil-prop-kola-seno.png` (kola sa senom): samo da znaš kako izgledaju stvari u areni. NE crtaj ih u klipovima.

Svaki bašin klip je **uređivanje `kopljanik-basa-idle-kadar0.png`** (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, ista veličina (±5 %).

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla i senke. Koplje i barjačić moraju biti celi u ćeliji (ako treba, baša drži koplje malo kraće ili ukoso).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju.
- Stopala na y=488; baša na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a, ASCII opisi. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D69.
- Visinu uspravnog kadra **izmeri** (410 px). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `kopljanik-basa-juris` | 8 | da | Juriš: trči udesno sa kopljem oborenim vodoravno ispred sebe u visini kuka (vrh udesno), štit pred grudima, telo jako nagnuto napred, zubi stisnuti, barjačić leprša unazad. Noge kao u `pokret-kopljanik-basa-run.png`. Kadar 7 se pretapa u 0. |
| `kopljanik-basa-zaglavljen` | 6 | da | Koplje mu se zabilo u nešto desno od njega (to nešto se NE crta; vrh koplja izlazi do desne ivice ćelije, vodoravno, u visini grudi). Obema rukama vuče koplje k sebi, upro se nogom, naginje se unazad, pa napred, besan; koplje se ne pomera. Kadar 5 se pretapa u 0. |
| `kopljanik-basa-pcele` | 6 | da | Napale su ga pčele (pčele se NE crtaju). Mlatara slobodnom rukom oko glave, digne štit iznad glave, poskakuje s noge na nogu, zgrčen, žmuri. Koplje drži nisko u jednoj ruci. Kadar 5 se pretapa u 0. |
| `kopljanik-basa-poziv` | 6 | ne | Doziva pomoć. 0: stoji; 1: zabode koplje uspravno u zemlju pored sebe; 2: skine rog sa pojasa; 3–4: duva u rog, glava zabačena, obrazi naduveni; 5: spušta rog, hvata koplje. |
| `kopljanik-basa-omamljen` | 6 | da | Ošamućen: tetura se u mestu, oslonjen na koplje kao na štap, glava mu klati, kolena meka, štit visi. Kadar 5 se pretapa u 0. |
| `fx-pcele` | 6 | da | Roj pčela, BEZ lika: tridesetak sitnih pčela (žuto-crne, sa belim krilcima) u oblaku širokom oko 300 px i visokom oko 220 px, na sredini ćelije; u svakom kadru pčele su na drugom mestu u oblaku, da roj vri. Providna pozadina. Kadar 5 se pretapa u 0. Nema uzora lika; rukopis kao `stil-razbi-kosnica.png`. |
