# Paket 03 — predmeti, čuda i Oranje

**Spremno:** prioritet 1 u celosti (27 elemenata), prioritet 2 u celosti (9 klipova / 56 kadrova u susednom `animation-pack-04`) i deo prioriteta 3 (10 elemenata sveta i referenca volova). Trenutni katalog ima 37 finalnih elemenata sveta, preglede i dostupne atlase/kadrove animacija. Detaljan spisak i blokade su u `STATUS.md`.

Predmeti su providni PNG sa osnovom pri dnu platna. Lestve su 256×1024, stranice x=56/200, prečke na 64+128n. Zidovi su 512×512 neprovidni i ponavljaju se u oba smera. Stražarnica: deckY=341, deckX0=270, deckX1=684. Oranje ima pet dnevnih pozadina u traženim dimenzijama, ponovljivo tlo 1024×384 (walkY=64), rub 192×384, plast sena, kola sa senom i kamen međaš. Međaš je nova obrađena kopija ranije generisanog resursa iz paketa 01; stari fajl nije menjan.

`catalog.json` je objekat sa listom `images`: id, file (relativno ovom folderu), size, bounds (desno/dole isključivo), kind i group, uz seamCheck / walkY / deckY / deckX0 / deckX1 gde treba. Katalog uključuje i finalne PNG-ove iz `../animation-pack-04/`. `cuda-preview.png`, `razbi-preview.png` i `oranje-tlo-preview.png` služe pregledu. Numerički spojevi zidova, lestvi, tla i pozadina daju 0/255.

Izvori su dobijeni ugrađenim Imagegen generatorom. `plan-g*.json` i `revision-prompts.json` čuvaju opise, uključujući nedovršene zahteve; nisu dokaz da je slika gotova. Samo fajlovi u katalogu su isporučeni. Tehnički izvoz radi `process-assets.py`: alpha/cutout, poravnanje dimenzija i retuš spojeva. Musina sablja zadržava izvorni alfa kanal uz uklanjanje niskog alfa šuma, jer je automatski matte kvario oštricu. Sirove slike su u ignorisanom `sources/`; obrađene međufaze u ignorisanom `cleaned/`.

**Blokada:** generator je prijavio `usage_limit_reached`. Prema njegovom odgovoru, obnova limita je oko **8. novembra 2026. u 22:01 po Beogradu**. Nijedan drugi servis ni API nije korišćen. Nedostajući predmeti, novi protivnici i prioritet 5 nisu predstavljeni kao gotovi. Kod igre, dist/ i prethodni paketi nisu menjani.
