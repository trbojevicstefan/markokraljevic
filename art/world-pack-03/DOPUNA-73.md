# Dopuna 73 (od Claude-a, 18. 11.): kapije, drugi put, po Stefanovom crtežu

Stefan je pogledao slike iz DOPUNA-70 i rekao: „nije dobra kapija, nacrtao sam ti kako želim: mora da kapija ide do gore kada se podiže, da se vidi gde je otišla” i „prolaz treba da bude širi”. Na crtežu je rešetka široka kao ceo prolaz, a iznad svoda je u zidu mesto u koje se rešetka podigne i u kom se vidi.

Rukopis prvog pokušaja (kamen, brvna, okovi) je dobar i ostaje. Menja se mera: širi prolaz, široka rešetka, ležište iznad svoda.

Status piši u `art/world-pack-03/STATUS-D73.md` (napravi ga), red posle SVAKE slike, sa oznakom `D73`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, `sync-world.py`, druge `STATUS-*` fajlove, postojeće slike (ni `kapija-*.png` iz D70), git. Paralelno rade druge Codex sesije (D71, D72): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna73.py` i `verify-dopuna73.py`.

## Uzori (`art/world-pack-03/uzori-d73/`)

- `kapija-zid-mera.png` (1152×2048): **nova mera zida**. Poštuj je tačno:
  - plavo = prolaz, 880 px širok i 840 px visok, sa plitkim lukom (bokovi luka na y=1304, teme na oko y=1160): **potpuno providno**;
  - tamno polje sa žutim okvirom iznad prolaza (x od 136 do 1016, y od 280 do 1304) = **ležište rešetke**: polje uvučeno u lice zida oko pola metra, tamnije od zida (zadnja strana ležišta je isti kamen ili brvna u senci), sa jasnim okvirom od klesanog kamena ili okovane grede sa strane i odozgo; u dnu se ležište otvara u prolaz. Luk prolaza je na PREDNJEM licu, ispod ležišta, od klinastih kamenova;
  - smeđe levo i desno od prolaza = stubovi kapije, po 136 px, do dna slike;
  - crven okvir (gornjih 256 px) = samo zid, bez ičeg posebnog: igra taj deo ponavlja naviše;
  - crven pravougaonik dole = Marko u meri (512 px).
- `kapija-resetka-mera.png` (880×920): **mera rešetke**: široka kao prolaz, gledana skoro spreda, blago iskošena (leva, bliža ivica malo viša od desne), sa šiljcima na dnu.
- `prvi-pokusaj-kapija-zid-kamen.png`, `prvi-pokusaj-kapija-zid-drvo.png`, `prvi-pokusaj-kapija-resetka.png`, `prvi-pokusaj-kapija-resetka-drvo.png`: slike iz prvog pokušaja. **Uzor rukopisa, boja i veličine kamena, brvana i šipki.** Nove slike crtaj kao uređivanje ovih (`image_gen` sa slikom prvog pokušaja i novom merom kao ulazom).

## Zajedničko

- Slikano, mat, toplo svetlo sleva, **bez crnih senki**, isti rukopis kao prvi pokušaj.
- Ništa nije savršeno ravno: spoljne ivice stubova su neravne, kamenje različite veličine, malter, pukotine, mahovina.
- Crta se na ravnoj jarko zelenoj #00ff00, pa se zelena skida (i u prolazu, i između šipki rešetke). Na kraju pogledaj sliku na plavoj podlozi: ne sme ostati ni zelena ni tamni oreol.
- Slike idu u `art/world-pack-03/<ime>.png`. Najviše tri `image_gen` pokušaja po slici; ako ni treći ne valja, NE izvozi.

## Slike (redom)

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `kapija2-zid-kamen` | 1152×2048, providno oko zida i u prolazu | Kameni zid po novoj meri: dva stuba, svod od klinastih kamenova nad prolazom, iznad svoda ležište rešetke (uvučeno, tamnije, uokvireno klesanim kamenom), iznad ležišta zid do gornje ivice slike (zid se nastavlja, nema krova). U ležištu se NE crta rešetka. |
| `kapija2-zid-drvo` | 1152×2048, isto | Seoska kapija po istoj meri: stubovi i svod od kamena, a iznad svoda masa od debelih vodoravnih brvana sa gvozdenim okovima; ležište rešetke uokvireno okovanim gredama, unutra brvna u senci. |
| `kapija2-resetka` | 880×920, providno između šipki | Gvozdena rešetka po `kapija-resetka-mera.png`: devet-deset uspravnih šipki i pet-šest vodoravnih traka sa zakivcima, šiljci na dnu; tamno gvožđe sa svetlim ivicama i malo rđe (ne zlatno ni narandžasto). Između šipki providno. |
| `kapija2-resetka-drvo` | 880×920, providno između greda | Ista rešetka od hrastovih greda okovanih gvožđem, gvozdeni šiljci na dnu. |

Provera: tačna veličina; kod zida prolaz providan po meri (ivice na x=136 i x=1016, bokovi luka na y=1304, teme oko y=1160), ležište neprovidno; kod rešetke bar 40 % površine providno (prostor između šipki).
