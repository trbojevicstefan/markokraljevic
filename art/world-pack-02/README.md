# Paket 02 — tlo i predmeti za ciljeve

Gotovo: 12 traka tla `tlo-<ambijent>.png` (RGBA 1024×384), 12 desnih rubova `tlo-<ambijent>-kraj.png` (192×384) i svih 17 predmeta `cilj-*.png`. Hodna linija tla je y=64; donjih 12 redova ima RGB #0b0f10. Za levi rub ogledaj desni.

Tlo je nacrtano ugrađenim Imagegen generatorom u stilu paketa 01, pa tehnički poravnato i retuširano preko spoja uz pomak za pola širine. Rubovi litice izvedeni su iz istih tekstura, tako da im se leva kolona tačno poklapa sa trakom. Obe numeričke provere šava daju 0/255 (<6/255). `tlo-preview.png` ponavlja svaku traku tri puta; `tlo-offset-preview.png` ponavlja varijantu pomerenu za 512 px.

Predmeti su izvezeni na 1024×1024, odnosno 1024×768 za kapije, portal i vodenicu. Sadržaj je na dnu platna. Alfa ivice očišćene su alatom sprite-gen cutout; izvori ostaju u `sources/`, obrađene međufaze u `cleaned/`. Aktivne verzije imaju traženi sjaj unutar predmeta. Isti vilinski kamen koristi se u tri instance, a ista svetiljka u četiri instance u nivou.

`catalog.json` je objekat sa listom `images`: id, file, size, bounds (desna i donja koordinata isključive), kind; tlo ima walkY i seamCheck, rubovi joinToStripPassed, predmeti baseline. Katalog uključuje i tri pregledne slike. `prompts.json` i `variant-prompts.json` čuvaju tačne opise korišćene ugrađenim generatorom. `process-world.py` ponavlja tehnički izvoz.

Novi Akindžijin trk je u `../animation-pack-03/assets/akindzija-run-v2/`: atlas.png, manifest.json, frames/, preview.gif i contact-sheet.png. Ima osam kadrova 512×512 na 12 FPS, sa stopalima na y=487 kao u starom klipu. Kontakt/spuštanje/prolaz/odraz postoje za obe vodeće noge; tamnija noga razlikuje dalju stranu. Visina obrisa varira 354–362 px (raspon 8 px).

Neuspele stavke: nema. Integracija i provera u samoj igri nisu rađene. Kod igre, dist/ i prethodne slike nisu menjani ovim zadatkom.
