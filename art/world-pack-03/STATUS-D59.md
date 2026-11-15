# D59 — završeno

Izvezeno:
- `dist/assets/world/riznica-unutra.webp` — 1536×1024, neprovidna, lossless WebP.
- `art/world-pack-03/uzori-d59/riznica-unutra.png` — poravnati PNG izvor.
- `art/world-pack-03/uzori-d59/riznica-preklop.png` — tačno 50% slika + 50% `uzori-d57/riznica-mera.png`.
- `dist/assets/world/prop-sarac-humka.webp` — 1024×512, stvarna alfa providnost, lossless WebP.
- `art/world-pack-03/uzori-d59/prop-sarac-humka.png` — PNG izvor sa alfom.

Korišćen ugrađeni `image_gen`: **riznica 3 pokušaja, humka 1 pokušaj**. Svi upotrebljeni promptovi sačuvani su u `uzori-d59/prompts-d59.json`; treća generacija riznice pre poravnanja u `uzori-d59/riznica-unutra-generisano.png`.

Riznica: topla slikana unutrašnjost, dva kameno-opečna svoda, pehari i dukati na visokim policama, ikone, kandila, štitovi, dve ukrštene sablje, buzdovan, crveni barjak sa belim krstom, zidni ćilim i baklje. Nema likova ni teksta; prikazi svetaca ostaju unutar traženih ikona. Zona x=551–1280, y=736–865 i prednji pod ostali su prazni.

Generisanje nije samo pogodilo tačne koordinate. Zato je pri izvozu treća slika geometrijski poravnata po segmentima: granice bočnih preseka na x=178 i x=1359, otvor stepeništa približno x=240–390 (sredina x=315), vrh luka y=566, dno i vodoravna linija poda y=866. Pod zauzima y=866–1023 preko cele širine. Vizuelno pregledani završni PNG i preklop sa merom.

Humka: pogled sa strane, trava i poljsko cveće, mali neispisani kamen i naslonjen buzdovan. Odsečene nevidljive margine generacije, zatim proporcionalno prilagođena i postavljena na providno platno. Alfa granice su x=154–869, y=341–480: širina 716 px (69,92%), visina 140 px (27,34%), ravno dno na y=480. Prostor ispod je potpuno providan.

Provere: tražene dimenzije i RGB/RGBA režimi; PNG i odgovarajući lossless WebP imaju identične dekodirane piksele; alfa humke 0–255; preklop odgovara mešanju 50/50. Pregledana i završna humka.

Neizvezeno: ništa od traženih slika. Povezivanje sa igrom nije rađeno jer D59 zabranjuje izmene `game.js`. U `dist/` upisana su samo dva navedena WebP izvoza; drugi statusi, D57/D58 fajlovi, skripte za rig i git nisu dirani.
