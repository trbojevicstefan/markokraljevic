# Dopuna 94 (od Claude-a, 18. 11.): Vuča dženeral na bedeviji, megdandžija pohoda „Pod Varadinom”

Stefan (18. 11.): „ne vidi se dosta stvari koje su ispevane u pesmi … osmisli likove iz tog nivoa”.

U pesmi „Marko Kraljević i Vuča dženeral” stari **Vuča dženeral**, gospodar Varadina, „drmnu na gradu topove”, sastavi tri hiljade katana, „pa posjede svoju bedeviju” i izađe na Marka. Kad mu katane izginu, beži na „tankoj bedeviji”, a Marko baci topuz za njim: „udari ga sapom od topuza, pade Vuča u zelenu travu”. Na kraju pohoda Marko se sad bije sa **akindžijskim begom** (bori se s konja, pa ga Marko obori i bije se sa njim peške). Taj megdan ostaje isti, samo umesto bega jaše **Vuča dženeral**. Svi pokreti su isti kao begovi; menja se ko je.

Status piši u `art/world-pack-03/STATUS-D94.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D94`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, tuđe foldere klipova (begove klipove ne menjaš), git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D93, D95, D96): ne diraj njihove fajlove.

## Uzori (`art/world-pack-03/uzori-d94/`)

- `beg-idle-kadar0.png`: beg peške, ćelija 512×512, stopala na y=488, visok 463 px (sa kapom). **Uzor mere i položaja u ćeliji** za klipove peške.
- `beg-mounted-kadar0.png`: beg na konju, visok 342 px, širok 345 px, kopita na y=488. **Uzor mere** za klipove na konju.
- `pokret-beg-*.png`: begovi klipovi, kadar do kadra. **Uzor POKRETA** za klip istog imena: isti broj kadrova, isti tok pokreta, isti položaj u ćeliji, isti pravac (gleda udesno).
- `marko-kadar0-za-meru.png`: Marko (383 px). Vuča ne sme biti viši od begove mere.

## Kako izgleda Vuča dženeral

Star ugarski velikaš (ne Turčin!): sede, duge, nadole uvijene brkove, obrijana brada, oštro lice, malo pogrbljen ali jak. Na glavi **visoki krzneni kalpak** sa **čaprazom i belo-crnim perjem čaplje**. **Plava husarska dolama** sa zlatnim gajtanima preko grudi, preko ramena **kurtak (mente) postavljen krznom**, tamnocrvene uske čakšire, žute čizme, crveno-zlatni pojas, **kriva husarska sablja**, o pojasu buzdovan. Mora se izdaleka razlikovati od bega i od janičara: plavo-zlatno, krzno, perje.

**Bedevija** (arapska kobila): tanka, visoka, brza, **siva-bela** sa tamnom grivom i repom, crveno-zlatni čaprak pod sedlom, zlatna uzda. Tanja i lakša od begovog konja, ali iste veličine u ćeliji.

## Pravila (ista kao u `DOPUNA-76.md`)

- Ćelija 512×512, sigurna margina 24 px (kod `-run` i `-hurt` 8 px, kao kod bega), providna pozadina, bez teksta, tla, senke, zvezdica i efekata. Sablja, perje i rep konja moraju stati u ćeliju.
- Jedan `image_gen` poziv crta mrežu (3×2 za 6 kadrova, 4×2 za 8, 2×2 za 4) na ravnoj jarko zelenoj #00ff00; iseci polja, skini zelenu, svaki kadar u svoju ćeliju. U izvozu ne sme ostati okvir ćelije ni linije mreže, ni komad susednog kadra.
- Stopala (kopita) na y=488 (osim u padu sa konja); lik na istom mestu u ćeliji kao u uzoru pokreta.
- **Ne razvlači kadrove na istu visinu.** Pognut, pao ili sagnut kadar je niži, kao u uzoru pokreta. Proveri površinu lika po kadru: ne sme biti veća od površine istog kadra u uzoru pokreta za više od 15 %.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`. JSON bez BOM-a. Radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`.
- Postupak: `art/world-pack-03/export-dopuna76.py` i `verify-dopuna76.py`, prilagođeni (svoje kopije zovi `export-dopuna94.py` i `verify-dopuna94.py`).
- **Prvo** napravi `vuca-idle` kao uređivanje `beg-idle-kadar0.png` (presvuci ga u Vuču; telo, poza i mera iste). Posle toga je **njegov kadar 0 uzor lika** za sve klipove peške. **Drugo** napravi `vuca-mounted` kao uređivanje `beg-mounted-kadar0.png` (Vuča na bedeviji); njegov kadar 0 je uzor za sve klipove na konju.
- Visinu uspravnog kadra **izmeri** i uporedi sa uzorom (±5 %; kalpak sa perjem sme biti do 20 px viši). Najviše tri pokušaja po klipu; ako ni treći ne valja, NE izvozi. Pre izvoza napravi tablu kadrova pored uzora pokreta u istoj razmeri i pogledaj je.

## Klipovi (redom)

| Klip | Kadrova | Petlja | Uzor pokreta |
|---|---|---|---|
| `vuca-idle` | 6 | da | `pokret-beg-idle.png`: stoji, diše, pogladi brk |
| `vuca-mounted` | 8 | da | `pokret-beg-mounted.png`: na bedeviji u kasu/galopu |
| `vuca-mounted-strike` | 6 | ne | `pokret-beg-mounted-strike.png`: sa bedevije seče sabljom |
| `vuca-unhorsed` | 6 | ne | `pokret-beg-unhorsed.png`: pada sa bedevije u travu (bedevija pobegne iz kadra kao u uzoru) |
| `vuca-run` | 8 | da | `pokret-beg-run.png` |
| `vuca-attack` | 6 | ne | `pokret-beg-attack.png` (sablja) |
| `vuca-hvata` | 6 | ne | `pokret-beg-hvata.png` |
| `vuca-hurt` | 4 | ne | `pokret-beg-hurt.png` |
| `vuca-death` | 6 | ne | `pokret-beg-death.png`: ne umire, nego pada na kolena i diže ruke (predaje se; Marko ga veže živog) |
