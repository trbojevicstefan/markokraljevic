# Dopuna 83 (od Claude-a, 18. 11.): Hasan-aga Oklopnik, megdandžija Opsednute tvrđave

Stefan (18. 11.): „naručuj od Codexa sve što ti treba za naredna tri nivoa; potrebne su nam sve animacije”.

Hasan-aga ima hod, udarac, zalet, zaglavljen (posle zaleta u stub), pogođen, smrt i hvat. Igra traži i ispad i skok; megdan dobija tresak buzdovanom o zemlju, bes pred kraj i ošamućenost.

Status piši u `art/world-pack-03/STATUS-D83.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D83`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D81–D85): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d83/`)

- `hasan-aga-idle-kadar0.png`: **Hasan-aga**, ćelija 512×512, stopala na y=488, gleda udesno, visok 463 px. Šiljat šlem sa verižnim nadvratnikom, sede brade, ljuskast oklop preko crvene dolame, okrugao bronzani štit na levoj ruci, buzdovan sa perima u desnoj. **Uzor lika i veličine za sve klipove.**
- `pokret-hasan-aga-run.png`, `-attack.png`, `-zalet.png`, `-zaglavljen.png`, `-hurt.png`: isti aga u pokretima koje već ima.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Oružje mora stati u ćeliju (ako treba, ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku); lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna83.py` i `verify-dopuna83.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (463 px, ±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.
- Svaki klip je **uređivanje uzora** `hasan-aga-idle-kadar0.png` (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, isto lice, ista veličina tela.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `hasan-aga-lunge` | 6 | ne | Ispad buzdovanom iza štita. 0: stoji; 1: štit napred, buzdovan povučen nazad; 2–3: dugačak iskorak napred, buzdovan zamahne napred iznad ivice štita; 4: drži; 5: vraća se u stav. Stopala na y=488. |
| `hasan-aga-jump` | 6 | ne | Težak skok napred. 0: čučne; 1: odraz; 2: u vazduhu, štit ispred tela, buzdovan podignut; 3: pada; 4: doskok, duboko čučne od težine oklopa; 5: uspravi se. U kadrovima 2–3 stopala su iznad y=488 (do 110 px), inače na y=488. |
| `hasan-aga-tresak` | 6 | ne | Tresak o zemlju. 0: stoji; 1: podigne buzdovan visoko iznad glave, štit u stranu; 2: zamahne nadole; 3: buzdovan udari o zemlju ispred stopala, kolena savijena, pogrbljen; 4: drži; 5: podiže se. Bez prašine i talasa (to crta igra). |
| `hasan-aga-bes` | 6 | ne | Razjari se. 0: stoji; 1: tresne buzdovanom o štit; 2: još jednom; 3–4: digne buzdovan i štit u vis i riče, glava zabačena, usta širom otvorena; 5: pognut iza štita, spreman. |
| `hasan-aga-omamljen` | 6 | da | Ošamućen: tetura u mestu, šlem nakrivljen, glava klonula i njiše se, štit spušten do zemlje, buzdovan visi. Kadar 5 se pretapa u 0. |
