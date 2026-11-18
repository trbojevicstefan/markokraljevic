# Dopuna 74 (od Claude-a, 18. 11.): Kosovsko selo — Marko kod bunara i tezge, seljak koji kliče

Stefan (18. 11.): „naruči svih aseta što nam fali, da lepo izgledaju, da su proporcionalni i da može da se interaktuje sa njima”.

U selu Marko sada može da se napije vode na bunaru sa đermom i da uzme pogaču sa tezge, a kad megdandžija padne seljani izlaze i kliču. Za to trebaju četiri klipa.

Status piši u `art/world-pack-03/STATUS-D74.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D74`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D71, D72, D73): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna74.py` i `verify-dopuna74.py`.

## Uzori (`art/world-pack-03/uzori-d74/`)

- `marko-idle-2-kadar0.png`, `pokret-marko-idle-2.png`: **Marko** kako stoji u igri, ćelija 512×512, stopala na y=488, gleda udesno, visok 383 px (sa ogrtačem 390). Uzor lika i veličine za Markove klipove.
- `putnik-starac-idle-kadar0.png`, `putnica-idle-kadar0.png`: starac i seljanka iz igre. **Uzor rukopisa i mere** za seljaka (seljak je novi lik, ali iz istog sela: ista vrsta odeće, isti rukopis). Starac je visok 314 px (pognut), seljanka 342 px.

Markovi klipovi su **uređivanje `marko-idle-2-kadar0.png`** (`image_gen` sa tim kadrom kao ulazom): isti Marko, ista veličina (±5 %).

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla i senke.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju.
- Stopala na y=488; lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a, ASCII opisi. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D74.
- Visinu uspravnog kadra **izmeri**. Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor | Šta se vidi |
|---|---|---|---|---|
| `marko-pije-vodu` | 6 | ne | `marko-idle-2-kadar0.png` | Marko pije vodu iz drvenog vedra. Topuz je spušten na zemlju uz njegovu nogu (glava topuza dole, drška naslonjena na butinu). 0: stoji; 1: obema rukama prihvata malo drveno vedro (vedro se pojavljuje u rukama u visini grudi); 2: podiže ga ka ustima; 3–4: pije, glava zabačena, voda mu curi niz bradu; 5: spušta vedro i briše usta nadlanicom. Bunar se NE crta. |
| `marko-uzima` | 6 | ne | `marko-idle-2-kadar0.png` | Marko uzima pogaču sa tezge. Topuz ostaje u desnoj ruci, spušten. 0: stoji; 1: pruža levu ruku napred u visini struka; 2: hvata okruglu pogaču (pogača se pojavljuje u šaci); 3: prinosi je sebi; 4: odgrize zalogaj, zadovoljan; 5: strpa pogaču u torbu o pojasu i uspravi se. Tezga se NE crta. |
| `seljak-idle` | 6 | da | rukopis kao `putnik-starac-idle-kadar0.png` (novi lik) | **Seljak**, novi lik: krupan čovek srednjih godina, smeđa brada i brkovi, bela lanena košulja, smeđ gunj bez rukava, crven tkani pojas, široke čakšire, opanci, šubara. Bez oružja. Stoji i gleda udesno, ruke uz telo, diše. **Visok 350 px**, stopala na y=488. Kadar 5 se pretapa u 0. Prvo napravi ovaj klip, pa njegov kadar 0 koristi kao uzor lika za sledeći. |
| `seljak-klice` | 6 | da | kadar 0 gotovog `seljak-idle` | Isti seljak kliče od radosti: skine šubaru i maše njom iznad glave, drugu ruku stegne u pesnicu i digne, usta otvorena u poklič, poskoči u kadrovima 2–3. Kadar 5 se pretapa u 0. |
