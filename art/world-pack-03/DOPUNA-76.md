# Dopuna 76 (od Claude-a, 18. 11.): megdandžija Kosovskog sela, nove faze

Stefan (18. 11.): „naruči bosa za prvi nivo da ima više animacija i faza, da ne bude lak za ubiti, a da bude zanimljiv”.

Kopljanik-baša već baca koplje, preskače Marka, juriša (koplje mu se zabije u kola sa senom), brani se od pčela i duva u rog. Dobija tri faze sa novim potezima: vitlanje kopljem ukrug, skok sa ubodom odozgo (koplje se zabode u zemlju), napredovanje iza štita i bes pred kraj.

Status piši u `art/world-pack-03/STATUS-D76.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D76`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D77–D80): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna76.py` i `verify-dopuna76.py`.

## Uzori (`art/world-pack-03/uzori-d76/`)

- `kopljanik-basa-idle-kadar0.png`: **Kopljanik-baša**, ćelija 512×512, stopala na y=488, gleda udesno, visok 410 px. Šlem sa belim turbanom, crveno-zlatna dolama, ljuskast oklop, okrugao bronzani štit na levoj ruci, dugo koplje sa crvenim barjačićem. **Uzor lika i veličine za sve klipove.**
- `pokret-kopljanik-basa-run.png`, `-attack.png`, `-jump.png`, `-juris.png`, `-zaglavljen.png`, `-omamljen.png`: isti baša u pokretima koje već ima.

Svaki klip je **uređivanje `kopljanik-basa-idle-kadar0.png`** (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, ista veličina tela (±5 %).

## Pravila (ista kao u `DOPUNA-69.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke i zvezdica. Koplje i barjačić moraju stati u ćeliju (ako treba, koplje ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže.
- Stopala na y=488 (osim u skoku); baša na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna69.py` i `verify-dopuna69.py`, prilagođeni za D76.
- Visinu uspravnog kadra **izmeri** (410 px). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `kopljanik-basa-vitlo` | 8 | da | Vitla kopljem ukrug oko sebe u visini pojasa: koplje drži za sredinu obema rukama i okreće ga kao krilo vetrenjače (u kadrovima vrh koplja ide udesno, ka nama, ulevo, od nas), telo se uvija za kopljem, barjačić ostavlja luk. Stoji raskoračen u mestu. Kadar 7 se pretapa u 0. |
| `kopljanik-basa-ubod-odozgo` | 6 | ne | Skok sa ubodom nadole. 0: čučne, koplje uspravno uz telo; 1: odraz; 2: u vazduhu, obe ruke dižu koplje iznad glave, vrh nadole; 3: pada, koplje ispred sebe vrhom ka zemlji; 4: doskok, koplje se zabija u zemlju ispred stopala; 5: stoji pogrbljen nad kopljem zabodenim u zemlju. U kadrovima 2–3 stopala su iznad y=488 (do 100 px), inače na y=488. |
| `kopljanik-basa-u-zemlji` | 6 | da | Koplje mu je zabodeno uspravno u zemlju ispred njega; obema rukama ga cima naviše, upire se nogama, naginje se unazad pa napred, besan; koplje se ne pomera. Kadar 5 se pretapa u 0. |
| `kopljanik-basa-stit` | 6 | da | Napreduje iza štita: štit podignut ispred lica i grudi (vidi se samo šlem iznad ivice), koplje viri pored štita vodoravno udesno, sitnim koracima ide napred u mestu. Kadar 5 se pretapa u 0. |
| `kopljanik-basa-bes` | 6 | ne | Razjari se. 0: stoji; 1: strgne turban sa šlema i baci ga; 2: zabode koplje u zemlju pored sebe; 3–4: raširi ruke i riče u nebo, glava zabačena, usta širom otvorena; 5: zgrabi koplje, pognut, spreman. |
