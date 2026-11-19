# Dopuna 115 (od Claude-a, 19. 11.): dve ispravke slika šestog pohoda (uređivanje gotovih slika)

Dve slike iz D113 trebaju po još jednu verziju, **napravljenu kao uređivanje gotove slike: isti položaj svakog dela, piksel u piksel, menja se samo ono što piše**.

Status piši u `art/world-pack-03/STATUS-D115.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D115`. **Uradi obe stavke do kraja.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike (nove imaju nova imena), tuđe foldere, git, fajlove `*dopuna41*`. Paralelno radi D114: ne diraj njegove fajlove. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d115/`)

- `prop-zelena-dolama.png`: krojački stalak sa zelenom dolamom i klupicom (1024×1024).
- `prop-markov-sator.png`: Markov šator sa sofrom i kupom (1536×1024).

## Pravila

- Ista veličina platna i isti položaj oblika kao u uzoru (stalak, klupica, stubovi šatora, sofra ostaju TAČNO gde jesu).
- Crta se na ravnoj jarko ljubičastoj #ff00ff, ključ skida ljubičastu, **posle toga skini i ljubičasti odsjaj**; pogledaj na plavoj i beloj podlozi. Bez tla, senke, ljudi i teksta.

## Stavke

| Ime | Veličina | Šta se menja |
|---|---|---|
| `prop-stalak-prazan` | 1024×1024 | Isti stalak i ista klupica sa makazama i klupkom, **ali BEZ dolame**: vidi se go drveni krst stalka (uspravna letva i prečka) na tronošcu. Ništa drugo se ne dodaje. |
| `prop-markov-sator-prazna-sofra` | 1536×1024 | Isti šator, mešina, sofra i koža, **ali na sofri NEMA kupe**: na njoj su samo pogača i grozd grožđa na bakarnoj tepsiji (nisko, do 60 px iznad sofre). Sve ostalo isto. |

Najviše tri pokušaja po slici. U status upiši veličinu, proveru odsjaja i da li se oblik poklapa sa uzorom (uporedi ivice stubova i stalka).
