# Paket 03 — svet

Spremno je 91 elemenata sveta i 43 animacionih klipova / 268 kadrova u susednom animation-pack-04. Katalog sadrži 458 PNG slika, uključujući kadrove i preglede. Za najnoviji tok rada i odluke vidi STATUS.md; za tačan spisak nedostajućeg DELIVERY.json.

- Prioritet 1: complete.
- Prioritet 2: complete.
- Prioritet 3: complete.
- Prioritet 4: complete.
- Prioritet 5: complete.
- Prioritet 6: complete.
- Prioritet 7: pending.
- Hitna DOPUNA-3: pending.
- Hitna DOPUNA-4 launch: pending.

Predmeti su providni PNG sa osnovom pri dnu platna. Lestve: 256×1024, stranice x=56/200, prečke 64+128n. Zidovi: 512×512, neprovidni, ponovljivi u oba smera. Stražarnica: deckY=341, deckX0=270, deckX1=684. Ispravljeno tlo Oranje: 1024×384, hodni rub y=64, sve iznad providno; završetak 192×384. Nema kuća, zidova ni ograda u traci tla. Dnevne pozadine nisu prepisivane pri pravljenju noćnih/olujnih varijanti.

catalog.json sadrži images: id, file (relativna putanja), size, bounds (desno/dole isključivo), kind i group, uz seamCheck / walkY / deck podatke gde treba. Pregledi: cuda-preview.png, razbi-preview.png, oranje-tlo-preview.png i oranje-varijante-preview.png.

Slike su nacrtane ugrađenim Imagegen generatorom. Tačni zahtevi su u plan-g*.json i *prompts.json. Plan nije dokaz da je slika gotova: samo postojeći fajlovi u katalogu su isporučeni. sources/ i cleaned/ su ignorisani za git. Izvoz priprema dimenzije, alfa kanal i spojeve; provera proverava stvarne fajlove i broj kadrova. Nema prijavljene aktivne blokade generatora.

Kod igre i dist/ nisu deo ove isporuke. Ranije slike nisu menjane osim izričito tražene ispravke dva komada tla. Međaš je obrađena kopija ranijeg putokaza; original ostaje netaknut.
