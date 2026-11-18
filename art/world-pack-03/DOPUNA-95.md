# Dopuna 95 (od Claude-a, 18. 11.): katane Vuče dženerala

Stefan (18. 11.): „ne vidi se dosta stvari koje su ispevane u pesmi … osmisli likove iz tog nivoa”.

U pesmi „Marko Kraljević i Vuča dženeral” na Marka idu **katane**: ugarski konjanici iz Varadina („Velimire, uzmi, sine, za trista katana”, a posle „tri hiljade sastavi katana”). Marko udari u njih „kako soko među golubove”. U pohodu „Pod Varadinom” sad se bije sa janičarima, a tu su Turci pogrešni. Pravi se **katana**: isti pokreti i ista mera kao sabljaš (janičar sa sabljom), ali ugarski vojnik.

Status piši u `art/world-pack-03/STATUS-D95.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D95`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D93, D94, D96): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d95/`)

- `sword-idle-kadar0.png`: **janičar sabljaš** iz igre, ćelija 512×512, stopala na y=488, visok 426 px, gleda udesno, sablja u ruci. **Uzor mere, tela i držanja.** Odeću ne preuzimaj.
- `pokret-sword-run.png`, `-attack`, `-lunge`, `-hurt`, `-death`, `-jump`, `-omamljen`, `-idle`: isti čovek u svim pokretima (svečano obučen, ali pokret je isti). **Uzor POKRETA** za klip istog imena (isti broj kadrova, isti tok pokreta, isti položaj u ćeliji).

## Kako izgleda katana

Mlad ugarski konjanik-pešak (husar), mršav i hitar: obrijan, **crni brkovi**, kosa u kratke pletenice kod slepoočnica. Na glavi **visoka crvena filcana kapa (čako bez šilta) sa malim perom**. **Zelena** kratka dolama sa **žutim gajtanima** preko grudi, preko levog ramena **crveni kurtak** (mente) sa tankim krznom, **plave** uske čakšire, crne čizme, žuto-crni pojas, **kriva husarska sablja**, na leđima mali okrugli štit (ne u ruci). Mora se izdaleka razlikovati od janičara (zeleno-crveno-žuto, visoka kapa bez belog börka).

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px, providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Sablja mora stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala na y=488 (osim u skoku i padu); lik na istom mestu u ćeliji kao u uzoru pokreta.
- **Ne razvlači kadrove na istu visinu.** Pognut, pao ili sagnut kadar je niži, kao u uzoru pokreta. Proveri površinu lika po kadru: ne sme biti veća od površine istog kadra u uzoru pokreta za više od 15 %.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna95.py` i `verify-dopuna95.py`).
- **Prvo** napravi `katana-idle` kao uređivanje `sword-idle-kadar0.png` (presvuci ga, telo i poza isti). Posle toga je **njegov kadar 0 uzor lika** za sve ostale klipove (uređivanje tog kadra, pokret po uzoru pokreta).
- Visinu uspravnog kadra **izmeri** i uporedi sa 426 px (±5 %; kapa sme biti do 15 px viša). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored uzora u istoj razmeri i pogledaj je.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor pokreta |
|---|---|---|---|
| `katana-idle` | 6 | da | `pokret-sword-idle.png`: stoji, diše, zavrne brk |
| `katana-run` | 6 | da | `pokret-sword-run.png` |
| `katana-attack` | 6 | ne | `pokret-sword-attack.png` |
| `katana-lunge` | 6 | ne | `pokret-sword-lunge.png` |
| `katana-hurt` | 4 | ne | `pokret-sword-hurt.png` |
| `katana-death` | 6 | ne | `pokret-sword-death.png` (kapa spadne) |
| `katana-jump` | 6 | ne | `pokret-sword-jump.png` |
| `katana-omamljen` | 6 | da | `pokret-sword-omamljen.png` |
