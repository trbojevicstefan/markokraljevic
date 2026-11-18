# Dopuna 79 (od Claude-a, 18. 11.): novi Markov udarac i potezi za meni nadogradnje

Stefan (18. 11.): „vidi još neki kombo za Marka, smisli i uradi animaciju” i „doradi još animacije za Upgrade meni”.

Novi kombo je **povratni udarac**: posle teškog zamaha (K) topuz je nisko; na J Marko ga ne diže polako, nego ga istim zamahom vrati unazad i naviše, i protivnik poleti. Za meni nadogradnje Marko dobija dve kratke poze: kako odmerava novo oružje i kako se raduje kupljenom.

Status piši u `art/world-pack-03/STATUS-D79.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D79`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D76–D78, D80): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna79.py` i `verify-dopuna79.py`.

## Uzori (`art/world-pack-03/uzori-d79/`)

- `marko-idle-2-kadar0.png`, `pokret-marko-idle-2.png`: **Marko** kako stoji u igri, ćelija 512×512, stopala na y=488, gleda udesno, visok 383 px (sa ogrtačem 390). Crna kosa i brada, crven ogrtač sa zlatnim vezom, ljuskast oklop, bela košulja sa crvenim vezom, topuz šestoperac u desnoj ruci. **Uzor lika i veličine.**
- `pokret-marko-charged.png`: postojeći teški zamah (K): poslednji kadrovi pokazuju gde je topuz kad povratni udarac počinje (nisko, ispred Marka).
- `pokret-marko-uppercut.png`, `pokret-marko-combo-3.png`: postojeći udarac naviše i treći udarac niza, za rukopis zamaha.

Svaki klip je **uređivanje `marko-idle-2-kadar0.png`** (`image_gen` sa tim kadrom kao ulazom): isti Marko, ista veličina (±5 %), stopala na y=488.

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px (topuz u zamahu mora stati u ćeliju), providna pozadina, bez teksta, tla, senke i crtanih tragova zamaha.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije.
- Marko je na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D79.
- Visinu kadra 0 **izmeri**. Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `marko-povratni` | 6 | ne | Povratni udarac naviše, jednom rukom, hrbatom zamaha. 0: pognut posle teškog zamaha, topuz nisko ispred njega desno, skoro do zemlje; 1: zavrće kukove unazad, topuz kreće naviše; 2: topuz u visini pojasa, ruka se ispruža; 3: **udarac**: topuz ukoso gore desno iznad ramena, telo ispruženo, ogrtač leti; 4: topuz prošao iza glave, Marko se uspravlja; 5: staje u stav, topuz spušta. |
| `marko-odmerava` | 6 | da | Za meni: Marko drži topuz obema rukama pred sobom i odmerava ga, okrene ga u šakama, pogleda niz dršku, klimne zadovoljno. Miran. Kadar 5 se pretapa u 0. |
| `marko-raduje` | 6 | ne | Za meni, kad nešto kupi: 0 stoji; 1–2 digne topuz visoko iznad glave jednom rukom; 3 udari se pesnicom u grudi; 4 nasmeje se; 5 spusti topuz na rame. |
