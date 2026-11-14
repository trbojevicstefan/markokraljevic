# Dopuna 48 (od Claude-a, noć 14/15. 11.): Miloš Obilić, vila Ravijojla i Marko za pesmu „Marko Kraljević i vila”

Stefan (14. 11.): „napravi sve animacije koje su nam potrebne od Miloša Obilića i vile Ravijojle… Moraš da napraviš sve modele Miloša da i on bude igriv lik… koristi postojeće asete a naručuj samo ono što ti fali.” Pesma je u `pesme/04-Марко-Краљевић-и-вила.txt`: Marko i Miloš jašu preko Miroča, Miloš peva, Marko zaspi na Šarcu, vila Ravijojla strelama pogodi Miloša u grlo i u srce, Marko je stigne na Šarcu, obori buzdovanom i bije, vila bere bilje i izleči Miloša.

Ova dopuna je **TURA A** (šest klipova). Tura B (ostali Miloševi klipovi) dolazi posle pregleda `milos-idle`.

Status piši u `art/world-pack-03/STATUS-ANIMACIJE-NOC.md` (novi redovi sa oznakom `D48`). `STATUS-ANIMACIJE.md`, `dist/`, `build-sprite-rig.py`, `sprite-rig.json` i tuđe foldere klipova ne diraj. Ne pravi commit.

## Uzori (OBAVEZNO ih pogledaj pre crtanja; sve je u `art/world-pack-03/uzori-d48/`)

- `marko-idle-2-kadar0.png`: Marko u igri (ćelija 512×512, telo visoko 383 px, stopala na y=488). Rukopis igre: slikano, mat, topla svetlost, srednjovekovni Balkan.
- `mounted-run-kadar0.png` i `marko-mounted-attack-kadar0.png`: Marko na Šarcu. `sarac-galop-kadar0.png`: Šarac sam (riđe-beli šarac, crven čaprak sa vezom i resama, zlatasta griva). Konj na tlu: kopita na y=488.
- `vila-let-kadar0.png`, `vila-isceljenje-kadar0.png`: vila Ravijojla (duga plava pletenica sa belim cvetovima, bela haljina do kolena sa crvenim vezom, crveni pojas i traka, providna zlatkasta krila, bosa, narukvice na članku). Telo oko 376 px.
- `kostac-hasan-kadar0.png`: kako izgledaju dva lika u jednoj ćeliji 512.
- `milos-konj-video.jpg`: Milošev konj (dorat: tamnosmeđ, crna griva i rep; crven čaprak sa belim dvoglavim orlom, smeđe sedlo, uzengije). Taj konj se crta u turi B; ovde je samo da znaš kako izgleda.

**Vila i Marko moraju biti ISTI likovi kao u uzorima** (lice, kosa, odeća, boje, srazmera). `image_gen` koristi kao **uređivanje slike** sa isečenim kadrom 0 iz uzora kao ulazom, ne kao crtež iz opisa. Posle svakog klipa napravi `identity-size-comparison.png` (tvoj kadar 0 pored uzora u istoj razmeri) i proveri lik i visinu; ako lik nije isti, ne izvozi.

## Miloš Obilić (novi lik, ovde se ustanovljava)

Vojvoda Miloš, oko 25 godina, iste visine kao Marko (telo oko 380 px u ćeliji 512, stopala na y=488) ali **vitkiji i mlađi**, da se na prvi pogled razlikuje od Marka:
- svetlosmeđa, skoro plava kosa do ramena, kratka svetla brada i brkovi (Marko ima crne brkove), lepo plemenito lice;
- srebrna verižnjača do kolena preko tamnoplave tunike, kožni prsluk sa srebrnim kopčama, širok kožni pojas;
- **tamnoplav ogrtač (kabanica) sa srebrnim obrubom** (Marko ima crven), visoke smeđe čizme;
- **pravi dvosekli mač** u desnoj ruci ili na pojasu (Marko nosi šestoper/buzdovan); bez štita.
Isti rukopis i svetlo kao Marko u `marko-idle-2-kadar0.png` (stavi ga kao ulaz radi rukopisa i visine, ali nacrtaj DRUGOG čoveka po opisu iznad).

## Zajednička pravila

- Ćelija **512×512**, sigurna margina 24 px, providna pozadina, bez teksta i okvira. Lik gleda **udesno**.
- Klip ide u `art/animation-pack-04/assets/<klip>/`: `atlas.png` (N ćelija u jednom redu), `manifest.json` sa `frame_layout` (kao `art/animation-pack-04/assets/vila-let/manifest.json`), `frames/motion/frame-0.png …`, `preview.gif`, `qa.json`. JSON bez BOM-a, opisi u manifestu ASCII.
- Postupak izvoza: `art/world-pack-03/export-dopuna44-*.py`, `art/animation-pack-04/README.md`; radni fajlovi u `art/animation-pack-04/sources/<klip>/`.
- Crtanje: jednim pozivom `image_gen` (uređivanje uzora) mreža 4×2 (ili 3×2 za 6 kadrova) na ravnoj jarko zelenoj pozadini #00ff00, JEDAN lik (ili jedan par) po polju; iseci, skini zelenu, postavi svaki kadar u svoju ćeliju tako da oslonac (stopala/kopita/telo na zemlji) stoji na **y=488** u svim kadrovima i lik ne šeta po ćeliji (osim gde pokret to traži, npr. pad).
- Provera pre izvoza, za svaki kadar: jedan lik (ne umanjeni ceo niz), nijedan neprovidan piksel ne dodiruje ivicu, nema zelenih piksela, oslonac na y=488 ±6. Upiši u `qa.json` (`bbox`, `touchesEdge`, `components`).
- **Najviše tri pokušaja po klipu.** Ako ni treći ne prođe, NE izvozi, upiši u status šta je pogrešno i idi dalje.

## Klipovi (redom; posle SVAKOG upiši red u status)

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `milos-idle` | 8 | da | Miloš stoji u mirnom stavu, mač u desnoj ruci uperen dole-napred, diše, ogrtač se lako njiše na vetru. Kadar 7 se pretapa u kadar 0. |
| `vila-strela` | 8 | ne (`holdLastFrame=false`) | Vila lebdi (kao `vila-let`), izvuče jednostavan drveni luk, zapne belu strelu, nategne, pusti (kadar 5: strela je otišla, tetiva vibrira), spusti luk. Kadar 7 je blizu stava kadra 0 iz `vila-let`. |
| `vila-pada` | 6 | ne (`holdLastFrame=true`) | Vila u letu pogođena među pleći: izvije se unazad, krila se savijaju, prevrće se i pada; poslednji kadar: leži na zemlji na boku (telo na y=488). Pad sme da ide od vrha ćelije ka dnu. |
| `vila-bere` | 8 | da | Vila kleči/lebdi nisko nad travom, saginje se, ubere stručak bilja i doda ga u snop u levoj ruci, opet se sagne. Kolena/stopala na y=488. Malo trave sme da bude u kadru samo ispod nje. |
| `marko-dremlje` | 8 | da | Marko na Šarcu, Šarac ide KORAKOM (ne galop), Marko spava naslonjen napred na sedlo (oblučje), glava klone i klati se, buzdovan visi o sedlu. Isti Marko i isti Šarac kao `mounted-run-kadar0.png`, iste veličine kao u `marko-mounted-attack-kadar0.png`; kopita na y=488. |
| `marko-bije-vilu` | 8 | da | Dva lika: vila leži na zemlji (kao poslednji kadar `vila-pada`), Marko stoji nad njom i udara je šestoperom (buzdovanom) odozgo; vila diže ruke, prevrne se s desne na levu, pa nazad. Dva udarca u 8 kadrova. Marko iste visine kao u `marko-idle-2-kadar0.png`, vila iste kao u uzoru. |

## Na kraju
Upiši u status kratak pregled ture A (šta je izvezeno, koliko pokušaja, šta nije). Za `milos-idle` posebno napiši gde je kadar 0 (`art/animation-pack-04/assets/milos-idle/frames/motion/frame-0.png`): on postaje uzor Miloša za turu B.

---

# TURA B (posle pregleda, 14. 11. kasno uveče)

Pregled ture A: **prihvaćeni** `milos-idle`, `vila-strela`, `vila-pada`, `vila-bere`, `marko-dremlje` (odlični: lik, mera i oslonac tačni). `marko-bije-vilu` je odbila moderacija zbog prikaza tuče, pa se ne traži ponovo; umesto njega je blaži `marko-nad-vilom` (ispod).

**Uzor Miloša je sada `uzori-d48/milos-idle-kadar0.png`** (kopija `art/animation-pack-04/assets/milos-idle/frames/motion/frame-0.png`): svaki Milošev klip je uređivanje te slike, isti čovek, ista odeća i boje, ista visina (380 px, oslonac y=487/488). Za klipove sa konjem uzor konja je `uzori-d48/milos-konj-video.jpg` (dorat, crna griva i rep, crven čaprak sa belim dvoglavim orlom), a mera konja kao Šarac u `marko-mounted-attack-kadar0.png`. Za vilu na zemlji uzor je `uzori-d48/vila-lezi-kadar5.png`.

Sva pravila iz ture A važe (ćelija 512, zelena mreža, isecanje, provera, najviše 3 pokušaja, status posle svakog klipa sa oznakom `D48B`).

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `milos-run` | 8 | da | Miloš trči udesno, mač u desnoj ruci uz telo, ogrtač leprša; dva dodira tla i dve faze leta, kao `marko-run`. |
| `milos-jump` | 6 | ne (`holdLastFrame=true`) | Skok: čučanj, odraz, uspon, vrh skoka (kolena gore), pad, doskok u stav. Oslonac y=488 u kadrovima 0 i 5, u vazduhu stopala više. |
| `milos-attack` | 6 | ne | Zamah mačem: zamah unazad, vodoravan rez napred (kadar 3 je udarac, mač potpuno ispružen), propratni pokret, povratak u stav iz `milos-idle`. Ceo mač u ćeliji u svakom kadru. |
| `milos-hurt` | 4 | ne | Pogođen spreda: trgne se unazad, pogne glavu, pa se vrati u stav. |
| `milos-ranjen` | 6 | da | Leži na leđima na zemlji (telo na y=488), dve bele strele mu štrče iz grla i iz grudi, diše teško, ruka se diže ka grlu i pada. Mač leži pored. |
| `milos-ustaje` | 6 | ne (`holdLastFrame=true`) | Izlečen (BEZ strela): sa leđa se pridiže na lakat, na koleno, ustaje, poslednji kadar je stav iz `milos-idle`. |
| `milos-jase` | 8 | da | Miloš jaše svog konja KORAKOM udesno i peva: glava podignuta, usta otvorena, leva ruka na grudima, desna drži uzde. Konj dorat iz uzora; kopita y=488. |
| `milos-galop` | 8 | da | Isti jahač i konj u galopu (kao `mounted-run`): Miloš nagnut napred, mač podignut. |
| `milos-strela` | 6 | ne (`holdLastFrame=true`) | Miloš na konju (konj stoji): kadar 1 strela ga pogodi u grlo, kadar 3 druga u grudi (bele strele ostaju u njemu), hvata se za grlo, klone i sklizne sa konja; poslednji kadar: konj stoji, Miloš je pao pored konja na zemlju. |
| `marko-nad-vilom` | 8 | da | Dva lika, BEZ udaranja i bez krvi: vila Ravijojla leži/kleči na zemlji (uzor `vila-lezi-kadar5.png`), podigla ruke i moli; Marko (uzor `marko-idle-2-kadar0.png`) stoji nad njom, preteći diže šestoper visoko i grdi je, pa ga spusti, pa opet digne. Marko iste visine kao uzor. |

Redosled: `milos-run`, `milos-attack`, `milos-jump`, `milos-hurt`, `milos-jase`, `milos-galop`, `milos-strela`, `milos-ranjen`, `milos-ustaje`, `marko-nad-vilom`. Na kraju pregled ture B u statusu.
