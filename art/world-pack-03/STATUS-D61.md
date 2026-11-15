# D61 — Marko na vrhu Urvine
- D61 | marko-nad-bunarom | IZVEZENO | 1 pokusaj | 6 kadrova, bez petlje, holdLastFrame=true; vizuelno provereni lik, poze i celi ekstremiteti; alpha, zelena, margine i mera provereni.
- D61 | marko-oprasta | IZVEZENO | 1 pokusaj | 6 kadrova, petlja; podignuta ruka miluje nevidljivog Sarca, pognuta glava i blag pokret ogrtaca; vizuelna i tehnicka provera prosle.
- D61 | marko-kopa | IZVEZENO | 1 pokusaj | 6 kadrova, petlja; lopata, nagazivanje, podizanje i bacanje zemlje iza sebe; topuz o pojasu; svi kadrovi vizuelno i tehnicki provereni.
- D61 | marko-lomi-sablju | IZVEZENO | 1 pokusaj | 6 kadrova, holdLastFrame=true; cela sablja, koleno, lom, polovine, kratki delovi i prazne ruke sa cetiri padajuca komada; provere prosle.
- D61 | marko-lomi-koplje | IZVEZENO | 1 pokusaj | 6 kadrova, holdLastFrame=true; uspravno koplje, lom preko kolena, kratki komadi, bacanje gore-desno i prazne ruke; puna silueta sa kopljem 434 px, telo u meri uzora; provere prosle.
- D61 | marko-baca-topuz | IZVEZENO | 3 pokusaja | prihvacen pokusaj 3; 6 kadrova, holdLastFrame=true; ceo topuz u zamahu, ispustanje gore-desno, kadrovi 4-5 bez topuza. Pokusaj 1: sakrivena glava topuza; pokusaj 2: oblik nalik topuzu na grudima u kadru 4; nisu izvezeni.
- D61 | marko-lezi | IZVEZENO | 1 pokusaj | 8 kadrova, holdLastFrame=true; skidanje i prostiranje ogrtaca, krstenje, klecanje, sedenje i lezanje na ledjima; glava levo, oci sklopljene i sake preko grudi; ceo lik u celiji; provere prosle.

## D61 — zavrsni pregled

- D61 | Zavrseno redom svih 7 klipova, ukupno 44 kadra. Svi su izvezeni u `art/animation-pack-04/assets/<klip>/` sa atlas.png, manifest.json, frames/motion/frame-N.png, preview.gif, qa.json i identity-size-comparison.png. Dodat je contact.png radi pregleda svih kadrova.
- D61 | Ukupno 9 image_gen poziva: po 1 za sest klipova, 3 za marko-baca-topuz. Nema neizvezenih klipova; dva odbijena pokusaja topuza sacuvana su samo u sources, sa razlozima u review.json.
- D61 | Koriscen ugradjeni image_gen, svaki put sa `uzori-d61/marko-idle-2-kadar0.png` kao ulazom. Tacni promptovi i radne mreze su u `art/animation-pack-04/sources/<klip>/attempt-N/prompt.txt` i `grid.png`; izvoz koristi prihvaceni review.json.
- D61 | Prilagodjeni postupci: `art/world-pack-03/export-dopuna61.py` i `verify-dopuna61.py`. Zavrsna komanda `python art/world-pack-03/verify-dopuna61.py`: PASS za svih 7 klipova, 44 kadra; providnost, nula zelenih piksela, margine najmanje 24 px, atlas jednak kadrovima, broj GIF kadrova, frame_layout, loop/hold i JSON bez BOM-a sa ASCII opisima.
- D61 | Poravnanje prati izvoz D58: donja granica alpha bbox je y=488 (poslednji neprovidni red y=487), tako da ostaje 24 px providne margine do dna celije. Jedinstvena skala po klipu; za kopanje prva povijena poza ima 350 px, za koplje puna silueta sa vrhom 434 px, dok je stojeci Marko u meri uzora.
