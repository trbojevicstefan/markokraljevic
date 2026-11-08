# Marko — paket animacija 03 (opisi i šabloni)

Sledeći korak ka osećaju *Prince of Persia: The Lost Crown*: pokret i borba. Ovde je **samo priprema**: za svaki klip postoji zahtev, prompt sa opisom kadar po kadar, šablon rasporeda i referentna slika lika. Ništa još nije nacrtano i igra nije menjana.

Otvori `index.html` za pregled svih klipova sa opisima na srpskom.

## Sadržaj — 32 klipa, 182 kadra

| Tema | Klipovi |
|---|---|
| 1 · Markovo mirovanje | `marko-idle` (8, petlja) |
| 2 · Niz od 3 laka udarca | `marko-combo-1`, `marko-combo-2`, `marko-combo-3` |
| 3 · Kolut za izmicanje | `marko-roll` |
| 4 · Marko: primljen udarac, pad, ustajanje | `marko-hurt`, `marko-knockdown`, `marko-getup` |
| 5 · Kontra posle savršenog odbijanja | `marko-counter` (8) |
| 6 · Udar topuzom nadole iz skoka | `marko-plunge` |
| 7 · Trzaj na udarac | `sword-hurt`, `shield-hurt`, `archer-hurt`, `akindzija-hurt`, `oklopnik-hurt`, `palikuca-hurt`, `musa-hurt` (po 4) |
| 8 · Hod/trk i smrt novih protivnika | `akindzija-run`, `akindzija-death`, `oklopnik-walk`, `oklopnik-death`, `palikuca-run`, `palikuca-death` |
| 9 · Mirovanje protivnika | `sword-idle`, `shield-idle`, `archer-idle`, `akindzija-idle`, `oklopnik-idle`, `palikuca-idle`, `musa-idle` (po 6, petlja) |
| 10 · Ivica i zid | `marko-ledge` (8), `marko-walljump` |

## Struktura klipa

```
sources/<id>/
  sprite-request.json                 broj kadrova, FPS, petlja, ćelija 512×512, zeleni ključ #00FF00
  prompts/motion.txt                  pravila sprite-gen-a + „Animation brief“ kadar po kadar
  references/layout-guides/motion.png šablon: polja, sigurna margina, centri
  base-source.png                     referenca identiteta lika
prompts.json                          svi kreativni briefovi na jednom mestu
references/requests/<id>.json         ulaz za `sprite-gen prepare`
```

## Postupak (isti kao paket 02)

1. Generator slika: priloži `base-source.png` i šablon, prompt iz `prompts/motion.txt` (ili `prompts.json`). Sačuvaj red kao `sources/<id>/raw/motion.png`.
2. `sprite-gen extract` → `compose-atlas` → `compose-gif` u istom folderu.
3. U igri: kopiraj atlas i manifest u `dist/assets/`, dodaj klip u `build-sprite-rig.py` sa razmerom po veličini glave (kao paket 02).

`python build-pack03.py` ponovo pravi sve fajlove ako se opisi promene.

## Napomene za igru

- Kadrovi sa „KONTAKT“ u opisu su trenutak pogotka; igra tu računa štetu.
- `marko-plunge` kadar 3 i `marko-knockdown` kadar 5 drže se dok traje pad/ležanje.
- `marko-ledge` i `marko-walljump` imaju slobodno vertikalno pomeranje (bez poravnanja na tlo); traže i nivo sa ivicama i zidovima.
- Smrti novih protivnika završavaju ležanjem celim telom na tlu, kao postojeće smrti; te poze koristi i odbacivanje tela.
