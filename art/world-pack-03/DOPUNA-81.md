# Dopuna 81 (od Claude-a, 18. 11.): Lovac-aga, megdandžija Ravijojline šume

Stefan (18. 11.): „naručuj od Codexa sve što ti treba za naredna tri nivoa; potrebne su nam sve animacije”.

Lovac-aga ima hod, udarac, rog, pogođen, smrt i hvat. Igra traži i ispad, skok i ošamućenost, a megdan dobija bes pred kraj.

Status piši u `art/world-pack-03/STATUS-D81.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D81`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D81–D85): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d81/`)

- `lovac-aga-idle-kadar0.png`: **Lovac-aga**, ćelija 512×512, stopala na y=488, gleda udesno, visok 466 px. Krzneni kalpak, narandžasta dolama obrubljena krznom, kožni opasač, lovački rog o kaišu, kriva sablja nisko u desnoj ruci. **Uzor lika i veličine za sve klipove.**
- `pokret-lovac-aga-run.png`, `-attack.png`, `-rog.png`, `-hurt.png`: isti aga u pokretima koje već ima.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Oružje mora stati u ćeliju (ako treba, ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku); lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna81.py` i `verify-dopuna81.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (466 px, ±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.
- Svaki klip je **uređivanje uzora** `lovac-aga-idle-kadar0.png` (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, isto lice, ista veličina tela.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `lovac-aga-lunge` | 6 | ne | Ispad sabljom. 0: stoji; 1: povuče sablju nazad uz bok, telo se spusti; 2–3: dugačak iskorak napred, prednja noga savijena, ruka sa sabljom ispružena vodoravno udesno, vrh sablje daleko ispred; 4: drži ispad; 5: vraća se u stav. Stopala na y=488 u svim kadrovima. |
| `lovac-aga-jump` | 6 | ne | Skok napred sa sabljom. 0: čučne; 1: odraz; 2: u vazduhu, kolena podvijena, sablja podignuta iznad glave; 3: pada, sablja kreće nadole; 4: doskok, čučanj; 5: uspravi se. U kadrovima 2–3 stopala su iznad y=488 (do 110 px), inače na y=488. |
| `lovac-aga-omamljen` | 6 | da | Ošamućen: tetura u mestu, glava klonula i njiše se levo-desno, kalpak nakrivljen, sablja visi u opuštenoj ruci, druga ruka se hvata za glavu. Kadar 5 se pretapa u 0. |
| `lovac-aga-bes` | 6 | ne | Razjari se. 0: stoji; 1: strgne kalpak i baci ga; 2: duvne u rog; 3–4: raširi ruke i riče, glava zabačena, usta širom otvorena; 5: pognut, sablja napred, spreman. |
