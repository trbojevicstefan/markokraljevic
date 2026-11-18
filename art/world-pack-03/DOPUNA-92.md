# Dopuna 92 (od Claude-a, 18. 11.): zlatni janičari, megdan Oranja

Stefan (18. 11.): „pojačaj animacije … neprijatelje … za svaki nivo”.

Na kraju Oranja Marko se bije sa trojicom carevih janičara koji nose zlato (iz pesme „Marko Kraljević i Alil-aga” / „Oranje Marka Kraljevića”: Marko ore drumove, a janičari sa tri tovara blaga hoće preko njegovih brazdi). Sada su to obični janičari, isti kao na putu. Prave se **zlatni janičari**: isti čovek i ista mera, ali svečano obučeni carski janičari koji prate blago.

Status piši u `art/world-pack-03/STATUS-D92.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D92`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D87–D91): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d92/`)

- `sword-idle-kadar0.png`: **janičar** iz igre, ćelija 512×512, stopala na y=488, visok 426 px, gleda udesno, sablja u ruci. **Uzor mere, tela i držanja.**
- `pokret-sword-run.png`, `-attack`, `-lunge`, `-hurt`, `-death`, `-jump`, `-omamljen`: isti janičar u svim pokretima. **Uzor POKRETA** za klip istog imena (isti broj kadrova, isti tok pokreta, isti položaj u ćeliji).

## Kako izgleda zlatni janičar

Isti čovek (lice, brkovi, telo, visina) kao `sword-idle-kadar0.png`, ali u svečanoj opremi carske garde: visok beo börk (janičarska kapa) sa **zlatnom pločom na čelu i belim perjem**, dolama **tamnocrvena sa bogatim zlatnim vezom** i zlatnim dugmadima, širok **zlatno-plavi** pojas sa kamom, žute čizme, **jatagan sa zlatnim balčakom**, preko ramena mala kožna kesa sa zlatnicima. Mora se izdaleka razlikovati od običnog janičara (crveno-zlatno umesto njegovih boja).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Sablja mora stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku i padu); lik na istom mestu u ćeliji kao u uzoru pokreta.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna92.py` i `verify-dopuna92.py`).
- **Prvo** napravi `zlatni-janicar-idle` kao uređivanje `sword-idle-kadar0.png` (presvuci ga, telo i poza isti). Posle toga je **njegov kadar 0 uzor lika** za sve ostale klipove (uređivanje tog kadra, pokret po uzoru pokreta).
- Visinu uspravnog kadra **izmeri** i uporedi sa 426 px (±5 %; börk sa perjem sme biti do 20 px viši). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored uzora u istoj razmeri i pogledaj je.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor pokreta |
|---|---|---|---|
| `zlatni-janicar-idle` | 6 | da | stoji kao `sword-idle`, diše, prebaci težinu, palcem pomiluje balčak |
| `zlatni-janicar-run` | 6 | da | `pokret-sword-run.png` |
| `zlatni-janicar-attack` | 6 | ne | `pokret-sword-attack.png` |
| `zlatni-janicar-lunge` | 6 | ne | `pokret-sword-lunge.png` |
| `zlatni-janicar-hurt` | 4 | ne | `pokret-sword-hurt.png` |
| `zlatni-janicar-death` | 6 | ne | `pokret-sword-death.png` (pri padu ispadnu dva-tri zlatnika iz kese) |
| `zlatni-janicar-jump` | 6 | ne | `pokret-sword-jump.png` |
| `zlatni-janicar-omamljen` | 6 | da | `pokret-sword-omamljen.png` |
