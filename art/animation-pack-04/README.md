# Animacije — paket 04

**Gotovo: 9 klipova / 56 kadrova, prioritet 2.** `marko-climb` 8, `marko-wallslide` 4, `marko-throw` 8; `sword-jump`, `shield-jump`, `archer-jump`, `palikuca-jump`, `oklopnik-jump`, `archer-shoot-down` po 6. U svakom `assets/<klip>/` su atlas.png, manifest.json, frames/, preview.gif, reference.png i qa.json. Ćelije su 512×512; stopala su y=487. Veličina se vezuje za postojeći idle istog lika, uz prostor za podignutu ruku/topuz. Preview.png poredi prvi kadar sa likom iz paketa 03.

Izvoz ide kroz sprite-gen extract → compose-atlas → compose-gif. Ulazne slike su raspoređene u mrežu; `export-clips.py` ih pre ekstrakcije preslaže u red. Penjanje ima četiri dodatno nacrtane poze za drugu ruku. `plan-g*.json` i `climb-revision-prompts.json` čuvaju tačne opise za ugrađeni Imagegen. Sirovi izvori u `sources/` ne idu u git. GIF-ovi ponavljaju klip radi pregleda; za igru koristi loop i fps iz manifesta.

`assets/volovi/base-source.png` je samo gotova referenca dva vola, pluga i orača, **nije gotov animacioni klip**. `volovi-plug` i `volovi-beg` blokirani su limitom generatora. Isto važi za sva tri nova protivnika i `marko-kick`. Planovi za njih su pripremljeni, ali atlas ili kadrovi nisu izmišljeni niti zamenjeni statičnom slikom. Za kompletnu predaju i listu nedovršenog vidi `../world-pack-03/STATUS.md`.
