# D58 status

D58: Rad zapocet. Klipovi se obradjuju redom prema DOPUNA-58.md.
D58 | vrac-stap | IZVEZENO | 1 pokusaj | 6 kadrova; identitet i visina uzora ocuvani; ceo stap, zamah, udar i mala iskra; alfa, margine i zelena provereni.
D58 | vrac-smrt | pokusaj 1 odbijen | Nema obaveznog sivog dima u kadru 5; nije izvezen. Sledi pokusaj 2.
D58 | vrac-smrt | IZVEZENO | 2 pokusaja | Prvi bez dima odbijen; drugi ima pad na kolena, ispustanje stapa, pad napred i siv dim. 6 kadrova, holdLastFrame=true; provere prosle.
D58 | vukasin-stoji | IZVEZENO | 1 pokusaj | 6 kadrova, petlja; isti kralj i visina, disanje, ruka na balcku, pomeranje ogrtaca i glave; provere prosle.
D58 | kosovka-poji | IZVEZENO | 1 pokusaj | 6 kadrova, petlja; kleci na jednom kolenu, visina 231px (70% od 330px), bardak obema rukama i vidljiv mlaz; ranjenik nije crtan; provere prosle.
D58 | djemo-omamljen | IZVEZENO | 1 pokusaj | 6 kadrova, petlja; ista odeca, kapa i topuz, visina 420px; klonula glava, teturanje, hvatanje za glavu i labavo drzanje topuza; provere prosle.
D58 | milos-pada-s-konja | pokusaj 1 odbijen | Konj menja polozaj u zavrsnim kadrovima; nije izvezen. Sledi pokusaj 2.
D58 | milos-pada-s-konja | pokusaj 2 odbijen | Konj se podigne u kadrovima 4-5; ruka u kadru 1 nije na grudima. Nije izvezen. Sledi poslednji, treci pokusaj.
D58 | milos-pada-s-konja | NIJE IZVEZENO | 3 pokusaja | Treci je ispravio ruku na grudima, ali pri poravnanju oslonca na y488 konj u kadrovima 4-5 i dalje odskoci navise oko 13px. Zahtev da konj ostane na istom mestu nije ispunjen. Sva tri pokusaja, poredjenja i razlozi sacuvani u sources/milos-pada-s-konja/.

## D58 zavrsni pregled

| D58 klip | Pokusaja | Ishod |
|---|---:|---|
| vrac-stap | 1 | Izvezeno, 6 kadrova, bez petlje |
| vrac-smrt | 2 | Izvezeno, 6 kadrova, holdLastFrame=true |
| vukasin-stoji | 1 | Izvezeno, 6 kadrova, petlja |
| kosovka-poji | 1 | Izvezeno, 6 kadrova, petlja |
| djemo-omamljen | 1 | Izvezeno, 6 kadrova, petlja |
| milos-pada-s-konja | 3 | Nije izvezeno: pomeranje konja u zavrsnim kadrovima |

D58: Ukupno 5 izvezenih klipova / 30 kadrova; 9 imagegen pokusaja. Redosled iz DOPUNA-58.md ispostovan.
D58: Izvozi su u art/animation-pack-04/assets/<klip>/: atlas.png, manifest.json sa frame_layout, frames/motion/frame-N.png, preview.gif, qa.json i identity-size-comparison.png. Dodat je contact.png za pregled i reference.png po obrascu postojecih klipova.
D58: Koriscen je ugradjeni image_gen za uredjivanje stvarnih uzora lika. Pune zadate instrukcije su u art/animation-pack-04/sources/<klip>/attempt-N/prompt.txt, uz grid.png, izdvojene kadrove, qa.json i review.json. Svaki pokusaj ima vizuelni pregled identiteta i razmere.
D58: python art/world-pack-03/verify-dopuna58.py: PASS za svih pet izvezenih klipova; NOT EXPORTED za Milosa uz tri odbijena pokusaja. Provereni alfa, margine, oslonac, odsustvo zelene, podudaranje atlasa i kadrova, broj GIF kadrova, petlje/hold, frame_layout i JSON bez BOM-a sa ASCII opisima.
D58: D58 izvoz/provera prilagodjeni su u export-dopuna58.py i verify-dopuna58.py prema export-dopuna56-claude.py, izvoznom postupku D54 i verify-dopuna51.py. Zabranjeni fajlovi, drugi statusi i drugi klipovi nisu menjani; git nije koriscen.
