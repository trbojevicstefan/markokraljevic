# Dopuna 125 (od Claude-a, 19. 11.): prazan čun vile brodarice (osmi pohod)

Kad se vila brodarica probudi i ode po jelena, na jezeru ostaje njen čun. Pravi se jedna slika, **kao uređivanje kadra iz D123**.

Status piši u `art/world-pack-03/STATUS-D125.md` (napravi ga), sa oznakom `D125`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike i klipove, git, fajlove `*dopuna41*`.

## Uzor (`art/world-pack-03/uzori-d125/`)

- `brodarica-spava-kadar0.png`: vila spava u čunu (ćelija 512×512, dno čuna na y=488).

## Stavka

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-cun-prazan` | 512×512, providna pozadina | **Isti čun, na istom mestu i iste veličine, ali PRAZAN**: nema vile, nema guje, nema kose preko ivice. Vidi se unutrašnjost čuna (izdubljeno stablo sa mahovinom), lokvanji i puzavica po boku ostaju. Dno čuna ostaje na y=488. |

Crta se na ravnoj jarko ljubičastoj #ff00ff, ključ skida ljubičastu, posle toga skini i ljubičasti odsjaj. Bez vode, senke i teksta. Slika ide u `art/world-pack-03/prop-cun-prazan.png`. Najviše dva pokušaja. U status upiši veličinu i širinu čuna u pikselima (i širinu čuna u uzoru, da se vidi da su iste).
