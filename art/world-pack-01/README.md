# Markov svet — paket 01

Paket sadrži **300 izvornih PNG slika**: 144 parallax sloja (12 ambijenata × 3 osvetljenja × 4 dubine), 36 celih panorama i 120 objekata i delova terena. Izaberi Dan, Noć ili Oluju u pregledu. Planovi nivoa i njihovi ciljevi su priprema za integraciju; nisu nova igriva kampanja.

Otvori `index.html` za pregled parallax slojeva i biblioteku pojedinačnih PNG resursa. Kamera može da se zaustavi i pomera ručno. Svaki crtež ima svoj link za preuzimanje.

Ambijenti: Kosovsko selo, Klisura Ibra, Ravijojlina šuma, Manastirski vis, Opsednuta tvrđava, Zimski prevoj, Vilinska pećina, Zaboravljeni podrum, Noćna močvara, Stari rudnik, Ruševine na brdu i Obala pred zoru. Svaki komplet predviđa duboku pozadinu, daljinu, srednji i bliski plan, uz panoramu ambijenta. Delimično završeni kompleti prikazuju broj dostupnih slojeva.

`levels.json` sadrži 12 planova terena dužine 6240 px, početak/cilj, raspored dekoracije i brzine slojeva. Ovo su rasporedi ambijenata za dalje povezivanje sa kampanjom; borba i zadaci nisu implementirani u ovom pregledu.

Objekti uključuju tarabe, pletene ograde, palisade, zidove, kapije, mostove, platforme, rastinje, kuće, bunar, kola, burad, sanduke i barjake. Providne slike imaju izvorni alpha kanal generatora. Slojevi su namenjeni horizontalnom pomeranju; njihove spojeve treba proveriti pri konačnom slaganju nivoa jer nisu garantovano bešavne teksture.

Izvori su nacrtani ugrađenim Imagegen generatorom, uz `reference/style-reference.png`. Tačni opisi i očekivana providnost nalaze se u `plan.json` i `extra-plan*.json`. `catalog.json` sadrži stvarno sačuvane slike sa veličinama i granicama sadržaja. `summary.json` prikazuje kompletnost setova, a `qa.json` prijavljuje eventualno neprovidne slike koje su tražene kao providne. Pre konačnog postavljanja proveri spojeve slojeva i rubove alpha kanala na svojoj podlozi.

Pokreni `build-catalog.py` da obnoviš katalog posle dodavanja slika. Originalni kod i postojeći resursi igre nisu menjani.
