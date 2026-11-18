# Dopuna 75 (od Claude-a, 18. 11.): kapija gledana pod uglom

Stefan je poslao sliku kamene kapije sa gvozdenim vratima gledane u tri četvrtine i rekao: „želim kapiju pod ovakvim uglom… ne želim ovakvu kapiju, ali želim da bude pod ovim uglom”. Dakle: kapija nije presek zida gledan ravno sa strane, nego **trodimenzionalan predmet okrenut pod uglom**: vidi se lice kapije (ono kroz koje se prolazi), skraćeno u perspektivi, i bok zida.

Uz to ostaje ono što je ranije tražio: rešetka je široka kao otvor, a kad se digne ostaje vidljiva gore u svom ležištu („da se vidi gde je otišla”); ništa nije savršeno ravno.

Status piši u `art/world-pack-03/STATUS-D75.md` (napravi ga), red posle SVAKE slike, sa oznakom `D75`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, `sync-world.py`, druge `STATUS-*` fajlove, postojeće slike (ni `kapija-*.png` i `kapija2-*.png`), git. Svoje skripte zovi `export-dopuna75.py` i `verify-dopuna75.py`.

## Uzori (`art/world-pack-03/uzori-d75/`)

- `kapija3-mera.png` (832×2080): **mera kapije pod uglom**. Igra slaže delove po njoj piksel u piksel, pa nijedna ivica ne sme da se pomeri:
  - svetlo smeđe = **lice kapije** (okrenuto ulevo i ka nama; kroz njega se prolazi);
  - tamnije smeđe desno = **bok** zida (njegov kraj, okrenut ka nama);
  - najsvetlije gore = gornja ploča;
  - plavo = **otvor** sa lukom: na gotovoj slici **potpuno providno**;
  - tamni pravougaonik u otvoru = unutrašnja strana daljeg stuba (vidi se kroz otvor): kamen u senci;
  - tamno polje sa žutim okvirom iznad otvora = **ležište rešetke**: uvučeno u lice kapije, tamnije, sa okvirom od klesanog kamena ili okovane grede;
  - zeleno = providno;
  - crven pravougaonik = Marko u meri, samo za veličinu kamena.
- `kapija3-resetka-mera.png` (832×2080): rešetka na ISTOM platnu i u ISTOJ ravni kao otvor (zatvoren položaj): šipke prate perspektivu lica kapije.
- `rukopis-kapija2-zid-kamen.png`, `rukopis-kapija2-zid-drvo.png`, `rukopis-kapija2-resetka.png`, `rukopis-kapija2-resetka-drvo.png`: prethodne kapije. **Uzor rukopisa, boja i veličine kamena, brvana i šipki** (rukopis je dobar; menja se samo ugao gledanja).

Svaka slika se crta kao **uređivanje mere** (`image_gen` sa merom i slikom rukopisa kao ulazom): preko obojenih površina mere naslikaj kamen, brvna i gvožđe, a ivice ostavi gde jesu.

## Zajedničko

- Slikano, mat, toplo svetlo sleva (lice kapije je osvetljeno, bok u blagoj senci, gornja ploča najsvetlija), jasna tamna kontura, **bez crnih senki**.
- Ništa nije savršeno ravno: ivice kamena su okrnjene, kamenje različite veličine, malter, pukotine, mahovina; ali spoljni obris i otvor ostaju po meri (odstupanje najviše 6 px).
- Redovi kamena i brvana na licu prate perspektivu lica (padaju ka dalje ivici kao na meri), na boku su vodoravni.
- Zelena #00ff00 se skida: spolja, u otvoru i između šipki rešetke. Na kraju pogledaj sliku na plavoj podlozi: ne sme ostati ni zelena ni tamni oreol, ni rupice u kamenu.
- Slike idu u `art/world-pack-03/<ime>.png`, sve **832×2080**. Najviše tri `image_gen` pokušaja po slici; ako ni treći ne valja, NE izvozi.

## Slike (redom)

| Ime | Šta se vidi |
|---|---|
| `kapija3-kamen` | Kamena kapija po meri: lice od tesanog kamena sa lukom od klinastih kamenova oko otvora, unutrašnja strana daljeg stuba u senci, iznad luka ležište rešetke (uvučeno, tamniji kamen, okvir od klesanih blokova), bok od krupnih ugaonih kamenova, gornja ploča. Otvor providan. U ležištu se NE crta rešetka. |
| `kapija3-drvo` | Seoska kapija po istoj meri: stubovi i luk od kamena, a iznad luka masa od debelih brvana sa gvozdenim okovima (na boku se vide čela brvana i godovi); ležište rešetke uokvireno okovanim gredama, unutra brvna u senci. Otvor providan. |
| `kapija3-resetka` | Samo rešetka, na istom platnu i tačno na mestu sa `kapija3-resetka-mera.png`: gvozdene uspravne šipke i vodoravne trake sa zakivcima, šiljci na dnu, tamno gvožđe sa svetlim ivicama i malo rđe. Sve ostalo providno, i prostor između šipki. |
| `kapija3-resetka-drvo` | Ista rešetka od hrastovih greda okovanih gvožđem, na istom mestu. |

Provera: veličina 832×2080; kod kapije piksel (430, 1700) providan (otvor), piksel (300, 600) neprovidan (ležište), piksel (680, 1000) neprovidan (bok); kod rešetke bar 40 % površine otvora providno.
