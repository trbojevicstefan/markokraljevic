# Dopuna 98 (od Claude-a, 18. 11.): Šarac se ritne zadnjim kopitama

Stefan (18. 11.): „napravi i animaciju … za ritanje Šarcem kada ga jašemo. Dakle da udaramo zadnjim kopitama: okrene se Šarac i udari kopitama i odvali glavu protivniku.”

Kad Marko jaše Šarca, novi udarac: Šarac spusti glavu, digne sapi i **ritne se zadnjim nogama** unazad, iz sve snage. U igri se Šarac pre toga okrene zadnjicom ka protivniku, pa protivniku odleti glava (to igra već ima). Pravi se jedan klip: Marko na Šarcu, Šarac se rita.

Status piši u `art/world-pack-03/STATUS-D98.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D98`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D97, D99): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d98/`)

- `mounted-idle-kadar0.png`: **Marko na Šarcu** iz igre, ćelija 512×512, gleda udesno, kopita na y=488, visok 463 px, širok 393 px (od x=71 do x=464). **Uzor lika, konja, mere i položaja u ćeliji.**
- `pokret-mounted-idle.png`: isti u mirovanju (6 kadrova).
- `pokret-sarac-propinje.png`: Šarac sam kad se propinje: kako mu rade noge, griva i rep (uzor rukopisa pokreta konja).
- `pokret-mounted-jump.png`: Marko na Šarcu u skoku.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata (bez prašine i linija pokreta). Ceo konj i Marko moraju stati u ćeliju i kad su zadnje noge ispružene.
- Jedan `image_gen` poziv crta mrežu (4×2 za 8 kadrova) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Ako se ispruženi konj ne uklapa u ćeliju sa marginom, smanji CEO klip istom razmerom (svi kadrovi isto, i kadar 0) tako da najširi kadar stane, i upiši tu razmeru u status (npr. `k=0,92`); igra će vratiti veličinu. Ne seci noge i rep.
- Prednja kopita stoje na **y=488** u svim kadrovima i ne pomeraju se levo-desno (konj se ritne u mestu); sapi i zadnje noge idu gore i **unazad (ulevo)**.
- **Ne razvlači kadrove na istu visinu.** Kad konj spusti glavu, lik je niži; kad se ritne, širi. Proveri površinu po kadru: ne sme biti veća od površine kadra 0 za više od 20 %.
- Kadar 0 je **uređivanje `mounted-idle-kadar0.png`** (isti, mirno); svi ostali su uređivanje kadra 0.
- Marko ostaje u sedlu, nagne se napred i drži se, topuz u ruci, kosa i ogrtač lete.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna98.py` i `verify-dopuna98.py`).
- Najviše tri pokušaja; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored uzora u istoj razmeri i pogledaj je.

## Klip

| Klip | Kadrova | Petlja | Šta radi |
|---|---|---|---|
| `mounted-ritne` | 8 | ne | 0: stoji mirno (kao uzor); 1: Šarac prebaci težinu napred, spusti glavu; 2: savije zadnje noge (zalet); 3: sapi gore, zadnje noge se odbace; 4: **zadnje noge ispružene unazad i gore, skoro vodoravno** (udarac), rep leti; 5: još ispružene, malo niže; 6: spušta zadnje noge; 7: stoji, diže glavu, kao kadar 0. |
