# Dopuna 53 (od Claude-a, 15. 11.): unutrašnjost crkve Samodreže, kao presek

Za pesmu „Uroš i Mrnjavčevići”: kralj Vukašin goni Marka oko crkve, a glas iz crkve kaže „Bjež' u crkvu, Kraljeviću Marko!”. Kad Marko uđe, sada samo nestane iza vrata. Stefan hoće da se vidi unutrašnjost: kao presek zida (uzor: kapije u igri i Prince of Persia: The Lost Crown), prednji zid crkve nestane, a vidi se unutra; kralj ostaje napolju i udara handžarom u levi direk.

Status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (oznaka `D53`). `dist/` (osim izvoza ispod), `build-sprite-rig.py`, `sprite-rig.json`, `game.js` i git ne diraj. Najviše tri image_gen pokušaja. Ne izvozi ako se obris ne poklapa.

## Jedna slika: `prop-crkva-samodreza-presek`
- **Ulaz za uređivanje je postojeća fasada** `art/world-pack-03/uzori-d50/prop-crkva-samodreza.png` (1024×1024, providna pozadina). Nova slika mora imati **isti obris i istu meru**: isti krov od crvene ćeramide, isto kube na tamburu sa krstom, iste bočne zidove i ugaone stubove, isto dno na y≈1000. Proveri preklapanjem: neprovidni okvir nove slike sme da odstupa od fasade (141, 131, 882, 1001) najviše 8 px na svakoj strani.
- **Prednji zid je isečen** (presek): krov, kube, venac strehe i spoljna ivica zidova ostaju kao na fasadi, kao ram; u sredini se vidi unutrašnjost.
- **Dva hrastova direka i otvor vrata ostaju na istom mestu** (direci oko x≈413 i x≈608, vrh otvora oko y≈775, dno y≈1000); vrata otvorena unutra, tako da se kroz otvor vidi pod crkve.
- **Unutra** (srpski srednji vek, moravska škola, toplo osvetljeno svećama):
  - freske svetitelja u dva reda po zidovima, zlatni oreoli, plava i okerasta pozadina; na unutrašnjem zidu kraj vrata **arhanđel sa mačem**;
  - u dnu nisko **kameno-drveni ikonostas** sa ikonama Hrista i Bogorodice i carskim dverima u sredini;
  - **polijelej** (okrugli svećnjak) koji visi pod kubetom, **kandila** sa crvenim staklom, visoki **svećnjaci** sa upaljenim svećama;
  - **analogion (pult) sa otvorenom starom knjigom** („knjige starostavne” iz pesme);
  - kameni pod sa šarom, ravan, na dnu slike (y≈1000): na njemu će stajati Marko (u igri visok oko 24% visine crkve).
- Slikano, mat, istim rukopisom kao fasada i ostali predmeti igre; bez likova ljudi osim fresaka, bez teksta.
- Izvoz: `dist/assets/world/prop-crkva-samodreza-presek.webp` (1024×1024, providna pozadina) i izvor u `art/world-pack-03/uzori-d53/`. Uz to `art/world-pack-03/uzori-d53/preklop.png`: fasada i presek jedan preko drugog (50 %), da se vidi poklapanje.

Na kraju kratak pregled u status (D53).
