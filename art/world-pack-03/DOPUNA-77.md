# Dopuna 77 (od Claude-a, 18. 11.): vila Ravijojla u drugom nivou

Stefan (18. 11.): „naruči vilu Ravijojlu za drugi nivo, sve animacije koje fale kada je udaramo”.

U pesmi „Marko Kraljević i vila” Marko stiže vilu na Šarcu, pogodi je topuzom među pleći, ona padne, on je bije dok ga ne zakune Bogom i Svetim Jovanom, pa je pusti da nabere bilje. Sada vila za sve to ima samo let i pad. Treba joj pet klipova.

Status piši u `art/world-pack-03/STATUS-D77.md` (napravi ga), red posle SVAKOG klipa, sa oznakom `D77`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D76, D78–D80): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna77.py` i `verify-dopuna77.py`.

## Uzori (`art/world-pack-03/uzori-d77/`)

- `vila-let-kadar0.png`: **vila Ravijojla** u letu, ćelija 512×512, gleda udesno, visoka 377 px (od prstiju do vrha krila), najniža tačka na y=437. Duga zlatna kosa sa vencem od cveća, prozirna krila, bela košulja sa crvenim vezom i crven pojas, bosa. **Uzor lika i veličine.**
- `pokret-vila-let.png`, `pokret-vila-pada.png`, `pokret-vila-strela.png`: isti lik u letu, u padu i dok strelja.
- `vila-pada-kadar5.png`: vila kako leži na zemlji posle pada (dno na y=488).
- `marko-nad-vilom-kadar1.png`, `pokret-marko-nad-vilom.png`: postojeći crtež u kome vila kleči pred Markom. Samo da vidiš kako ona izgleda kad kleči; Marka NE crtaj.

Svaki klip je **uređivanje `vila-let-kadar0.png`** (`image_gen` sa tim kadrom kao ulazom): ista vila, ista odeća i krila, ista veličina tela (±5 %). U svakom klipu je SAMO vila.

## Pravila (ista kao u `DOPUNA-65.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, krvi i rana.
- Jedan `image_gen` poziv crta mrežu (2×2 za 4 kadra, 3×2 za 6) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu (pazi na prozirna krila: ne smeju ostati zelena), svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije.
- Kad je na zemlji, najniža tačka je na y=488; vila je na istom mestu u ćeliji u svim kadrovima.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni za D77.
- Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `vila-pogodjena` | 4 | ne | U letu je pogodi topuz među pleći (topuz se NE crta). 0: leti kao na uzoru; 1: trzaj, leđa se izviju, ruke i kosa polete napred, usta otvorena; 2: krila klonu, glava pada; 3: prevrće se u vazduhu, počinje da pada. Najniža tačka kao na uzoru (oko y=437). |
| `vila-udarena` | 4 | ne | Na zemlji je, kleči, i prima udarac (Marko i topuz se NE crtaju). 0: kleči, rukama se zaklanja iznad glave; 1: udarac je obori u stranu, na bok, kosa i krila polete; 2: leži na boku, pridiže se na lakat; 3: ponovo kleči, pognuta, ruke pred licem. Dno na y=488. |
| `vila-moli` | 6 | da | Kleči i moli za život: ruke sklopljene pred grudima, pa ih pruža ka nama desno, glava podignuta, suze, krila spuštena i drhte. Kadar 5 se pretapa u 0. Dno na y=488. |
| `vila-ustaje` | 6 | ne | Pušta je: 0 kleči; 1 oslanja se na ruku; 2 ustaje, krila se šire; 3 odraz sa zemlje; 4–5 leti kao na uzoru (najniža tačka se diže sa y=488 na oko y=437). |
| `vila-peva` | 6 | da | Lebdi u vazduhu i peva u inat: glava zabačena, usta otvorena, jedna ruka na grudima, druga ispružena, kosa i pojas lepršaju, krila trepere. Kadar 5 se pretapa u 0. Najniža tačka oko y=437. |
