# D57 - Sarac

Obrada redom. Uzori pregledani pre crtanja.

- D57 `sarac-pije`: IZVEZENO, 2 pokusaja (prvi odbijen jer njuska dodiruje liniju kopita). Drugi: 6 kadrova, petlja, njuska oko y466, kopita y488; identitet i velicina vizuelno provereni, providnost/zelena/ivice/atlas/GIF/manifest prosli. Poredjenje u assets/sarac-pije/identity-size-comparison.png.
- D57 `sarac-lupa`: IZVEZENO, 2 pokusaja (prvi odbijen zbog odsecenog repa u kadru3). Drugi: 6 kadrova, petlja, dizanje/kopanje/udar desnim prednjim kopitom i glava gore. Zajednicka skala0.98, pomeraj x+15, kopita y488; sve tehnicke i vizuelne provere prosle. Poredjenje uz klip.
- D57 `sarac-propinje`: IZVEZENO, 2 pokusaja (prvi: zadnje kopito izlazi iz izvorne celije u kadru5). Drugi: 6 kadrova, bez petlje i holdLastFrame=false; oba propinjanja i udar zadnjim nogama vidljivi, kopita oslonca y488. Stojeci kadar oko3% manji od uzora, u dozvoljenih5%; zadnji kadar koristi dozvoljenu manju levu marginu. Tehnicke i vizuelne provere prosle.
- D57 `sarac-boli`: IZVEZENO, 1 pokusaj. Cetiri kadra: stojanje, trzaj glave, ugnuce, pognuta glava; bez krvi/rane, bez petlje i zadrzavanja. Zajednicka skala0.94 i x+9; visina stojecih poza oko1% od uzora, kopita y488. Tehnicke i vizuelne provere prosle.
- D57 `sarac-pada`: IZVEZENO, 2 pokusaja (prvi odbijen: zavrsne poze ostaju na grudima, nisu na boku). Drugi: 6 kadrova, bez petlje, holdLastFrame=true; klecanje, klecanje na prednjim nogama, spustanje i bok sa opustenim nogama/obrazom dole. Zajednicka skala0.96, x+4; kopita/kontakt y488, bez krvi/rane. Identitet, mera i tehnicke provere prosli.
- D57 `sarac-hod`: IZVEZENO, 3 pokusaja. Prvi odbijen zbog uparenih podizanja nogu nalik kasu; drugi zbog ponavljanja iste prednje noge. Treci: odvojeni zamasi zadnjih i prednjih nogu, korak sa osloncem na tri noge, blago klimanje glave; 6 kadrova, petlja. Zajednicka skala0.92 i x+10; visina oko382px kao uzor, kopita oslonca y488. Tehnicke i vizuelne provere prosle.

## D57 - zavrsni pregled

Svih 6 klipova izvezeno u `art/animation-pack-04/assets/<klip>/`, ukupno34 kadra. Nema neizvezenih klipova. Ukupno12 image_gen poziva: pije2, lupa2, propinje2, boli1, pada2, hod3. Nijedan klip nije presao granicu od3 pokusaja.

Svaki poziv koristio je ugrađeni `image_gen` sa `uzori-d57/sarac-stoji-kadar0.png` kao ulazom. Konacni promptovi, izvorne zelene mreze, obradjeni kandidati, kontakt-trake, poredjenja, tehnicki QA i odluke o prihvatanju nalaze se u `art/animation-pack-04/sources/<klip>/attempt-N/`; tekst svakog prompta je u `prompt.txt`. Uklanjanje zelene, zajednicka korekcija razmere po klipu i izvoz: `art/world-pack-03/process-d57.py`. Nije korisceno zasebno menjanje razmere pojedinacnih poza.

Svaki izvoz sadrzi `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json` i `identity-size-comparison.png`. JSON bez BOM-a, opisi ASCII. Identitet/mera/pokret/cele noge/griva/rep provereni vizuelno na poređenjima i kontakt-trakama; tehnicki provereno svih34 kadra.

Zavrsna komanda `python art/world-pack-03/verify-d57.py` prosla za svih6 klipova: alfa, nula zelenih piksela, bez dodira ivica, kopita/kontakt y488, margine (dozvoljen izuzetak za propinjanje), atlas identican kadrovima, broj GIF kadrova i loop/hold opcije, raspored i JSON. U pije/lupa/hod petlja=true; propinje/boli/pada petlja=false; samo pada holdLastFrame=true.

Zabranjeni fajlovi i drugi klipovi/statusi nisu menjani. Git nije koriscen.
