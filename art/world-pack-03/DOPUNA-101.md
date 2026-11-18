# Dopuna 101 (od Claude-a, 18. 11.): Šarac se okreće sa Markom u sedlu

Stefan (18. 11.): „Treba i animacija kako se Šarac okreće da bi udario protivnika koji je napred.”

Kad Marko jaše, Šarac sad može da se ritne zadnjim nogama (`mounted-ritne`). Ako je protivnik ispred, Šarac mora prvo da se **okrene u mestu**, zadnjicom ka njemu. Pravi se klip okreta: konj sa Markom u sedlu se okrene za pola kruga u mestu, od pogleda udesno do pogleda ulevo.

Status piši u `art/world-pack-03/STATUS-D101.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D101`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`.

## Uzori (`art/world-pack-03/uzori-d98/`, isti kao za ritanje)

- `mounted-idle-kadar0.png`: **Marko na Šarcu** iz igre, ćelija 512×512, gleda udesno, kopita na y=488, visok 463 px, širok 393 px. **Uzor lika, konja, mere i položaja u ćeliji.**
- `pokret-mounted-idle.png`, `pokret-sarac-propinje.png`, `pokret-mounted-jump.png`: isti u pokretu (rukopis grive, repa, nogu, ogrtača).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Kopita na y=488; konj se okreće **u mestu** (sredina konja ostaje na istom x u svim kadrovima).
- **Mera:** konj sa Markom je u svakom kadru iste veličine kao u uzoru (visina 463 px ±5 %). Kad je okrenut spreda, uži je, ali **ne** viši i ne krupniji: ne razvlači kadrove. Ako nešto ne staje, smanji CEO klip istom razmerom i upiši je u status (npr. `k=0,92`).
- Kadar 0 je **uređivanje `mounted-idle-kadar0.png`**, ostali kadrovi su uređivanje kadra 0. Marko je isti u svim kadrovima (lice, brkovi, crveni ogrtač, topuz u desnoj ruci).
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna101.py` i `verify-dopuna101.py`).
- Najviše tri pokušaja; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored uzora u istoj razmeri i pogledaj je.

## Klip

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `mounted-okret` | 6 | ne | 0: gleda udesno, kao uzor; 1: Šarac zabaci glavu i prebaci težinu na zadnje noge, prednje se odižu; 2: tri četvrtine, okreće se ka gledaocu; 3: **spreda** (vidi se grudi konja i Marko spreda), prednje noge u vazduhu; 4: tri četvrtine ulevo; 5: gleda **ulevo**, prednje noge na zemlji (kao uzor, preslikan). |
