# Animacije — paket 04

Gotovo: 43 klipova / 268 kadrova. Stvarni gotovi klipovi su navedeni ispod i u catalog.json. Spisak preostalog i stanje generatora: ../world-pack-03/STATUS.md i DELIVERY.json.

U assets/<klip>/ su atlas.png, manifest.json, frames/motion/, preview.gif, reference.png i qa.json. Ćelije su 512×512, a volovi koriste 1024×512. Donja linija sadržaja je y=487. Veličina se vezuje za postojeći idle istog lika, uz prostor za oružje. Preview.png poredi prve kadrove sa ranijim likovima. Nove baze kopljanika, psa, tufekdžije i volova su u odgovarajućim assets/<lik>/base-source.png.

Izvoz: sprite-gen extract → compose-atlas → compose-gif. Mreže se pre ekstrakcije preslažu u red. Penjanje Marka ima četiri dodatne poze za smenu ruku; trkovi kopljanika i tufekdžije su precrtani radi različitih faza nogu. Opisi su u plan-g*.json i *prompts.json. sources/ ne ide u git. GIF se ponavlja radi pregleda; u igri koristiti loop i fps iz manifesta. Marko-kick se isporučuje samo jednom.

| Klip | Kadrovi | FPS | Petlja |
|---|---:|---:|---|
| marko-climb | 8 | 12 | da |
| marko-wallslide | 4 | 12 | da |
| marko-throw | 8 | 12 | ne |
| sword-jump | 6 | 12 | ne |
| shield-jump | 6 | 12 | ne |
| archer-jump | 6 | 12 | ne |
| palikuca-jump | 6 | 12 | ne |
| oklopnik-jump | 6 | 12 | ne |
| archer-shoot-down | 6 | 12 | ne |
| volovi-plug | 8 | 10 | da |
| volovi-beg | 8 | 14 | da |
| kopljanik-idle | 6 | 12 | da |
| kopljanik-run | 8 | 14 | da |
| kopljanik-attack | 8 | 12 | ne |
| kopljanik-hurt | 4 | 12 | ne |
| kopljanik-death | 8 | 12 | ne |
| kopljanik-jump | 6 | 12 | ne |
| pas-idle | 4 | 12 | da |
| pas-run | 8 | 14 | da |
| pas-attack | 6 | 12 | ne |
| pas-hurt | 4 | 12 | ne |
| pas-death | 6 | 12 | ne |
| tufekdzija-idle | 6 | 12 | da |
| tufekdzija-run | 8 | 14 | da |
| tufekdzija-shoot | 8 | 12 | ne |
| tufekdzija-hurt | 4 | 12 | ne |
| tufekdzija-death | 8 | 12 | ne |
| tufekdzija-jump | 6 | 12 | ne |
| marko-kick | 6 | 12 | ne |
| marko-slide | 6 | 12 | ne |
| marko-hang | 6 | 12 | da |
| sword-climb | 6 | 12 | da |
| marko-combo-4 | 8 | 12 | ne |
| marko-air-1 | 5 | 12 | ne |
| marko-air-2 | 5 | 12 | ne |
| marko-uppercut | 6 | 12 | ne |
| marko-dash-strike | 6 | 12 | ne |
| marko-charge-hold | 4 | 12 | da |
| marko-push | 6 | 12 | da |
| marko-lever | 6 | 12 | ne |
| sword-launch | 6 | 12 | ne |
| shield-launch | 6 | 12 | ne |
| archer-launch | 6 | 12 | ne |
