# Dopuna 84 (od Claude-a, 18. 11.): Mladi Turčin sa očevom sabljom (Opsednuta tvrđava)

Stefan (18. 11.): „naručuj od Codexa sve što ti treba za naredna tri nivoa; potrebne su nam sve animacije”.

Mladi Turčin (Mustaf-aga iz pesme „Marko Kraljević poznaje očinu sablju”) nosi sablju kralja Vukašina. Ima stav, hod, udarac, pogođen i smrt. Igra ga stavlja da spava u taboru, a traži i buđenje, ispad i skok.

Status piši u `art/world-pack-03/STATUS-D84.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D84`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D81–D85): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d84/`)

- `mladi-turcin-idle-kadar0.png`: **mladi Turčin**, ćelija 512×512, stopala na y=488, gleda udesno, visok 426 px. Mlad, golobrad, beli turban sa belim perom, zelena dolama sa zlatnim vezom, crven pojas, za pojasom sablja u zlatnim koricama sa tri balčaka. **Uzor lika i veličine za sve klipove.**
- `pokret-mladi-turcin-run.png`, `-attack.png`, `-hurt.png`, `-death.png`: isti mladić u pokretima koje već ima.
- `pokret-sword-spava.png`, `pokret-sword-budi.png`: kako u igri spava i budi se janičar (uzor POKRETA, ne lika).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Oružje mora stati u ćeliju (ako treba, ukoso ili uspravno).
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku); lik na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna84.py` i `verify-dopuna84.py`).
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (426 px, ±5 %). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.
- Svaki klip je **uređivanje uzora** `mladi-turcin-idle-kadar0.png` (`image_gen` sa tim kadrom kao ulazom): isti čovek, ista odeća i oružje, isto lice, ista veličina tela.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `mladi-turcin-spava` | 6 | da | Spava kao janičar u `pokret-sword-spava.png`: pokret i položaj tela isti, ali lik je mladi Turčin; sablja u koricama uz njega. Diše polako, glava klonula. Kadar 5 se pretapa u 0. |
| `mladi-turcin-budi` | 6 | ne | Budi se kao janičar u `pokret-sword-budi.png`: trgne se, digne glavu, skoči na noge i hvata se za balčak sablje; kadar 5 je uspravan stav kao uzor. |
| `mladi-turcin-lunge` | 6 | ne | Ispad sabljom. 0: stoji; 1: izvuče sablju i povuče je uz bok; 2–3: dugačak iskorak napred, ruka sa sabljom ispružena vodoravno udesno; 4: drži; 5: vraća se u stav. Stopala na y=488. |
| `mladi-turcin-jump` | 6 | ne | Lak skok napred sa sabljom. 0: čučne; 1: odraz; 2: u vazduhu, sablja iznad glave; 3: pada; 4: doskok; 5: uspravi se. U kadrovima 2–3 stopala su iznad y=488 (do 110 px), inače na y=488. |
