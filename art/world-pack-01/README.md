# Markov svet — paket 01

Otvori `index.html` za pregled parallax slojeva i biblioteku pojedinačnih PNG resursa. Kamera može da se zaustavi i pomera ručno. Svaki crtež ima svoj link za preuzimanje.

Šest ambijenata: Kosovsko selo, Klisura Ibra, Ravijojlina šuma, Manastirski vis, Opsednuta tvrđava i Zimski prevoj. Svaki komplet predviđa nebo, daljinu, srednji i bliski plan, uz panoramu ambijenta. Delimično završeni kompleti prikazuju broj dostupnih slojeva.

`levels.json` sadrži šest planova terena dužine 6240 px, početak/cilj, raspored dekoracije i brzine slojeva. Ovo su rasporedi ambijenata za dalje povezivanje sa kampanjom; borba i zadaci nisu implementirani u ovom pregledu.

Objekti uključuju tarabe, pletene ograde, palisade, zidove, kapije, mostove, platforme, rastinje, kuće, bunar, kola, burad, sanduke i barjake. Providne slike imaju izvorni alpha kanal generatora. Slojevi su namenjeni horizontalnom pomeranju; njihove spojeve treba proveriti pri konačnom slaganju nivoa jer nisu garantovano bešavne teksture.

Izvori su nacrtani ugrađenim Imagegen generatorom. Tačni opisi i očekivana providnost nalaze se u `plan.json` i `extra-plan.json`. `catalog.json` sadrži samo stvarno sačuvane slike sa veličinama i granicama sadržaja. `qa.json` prijavljuje eventualno neprovidne slike koje su tražene kao providne.

Pokreni `build-catalog.py` da obnoviš katalog posle dodavanja slika. Originalni kod i postojeći resursi igre nisu menjani.
