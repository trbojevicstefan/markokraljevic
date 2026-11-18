# Dopuna 103 (od Claude-a, 18. 11.): prave merdevine i rekviziti Varadina

Stefan (18. 11.): „Napravi nove merdevine, obavezno da izgledaju pravo, ove su baš jadne što ih imamo trenutno” i „rekvizita … lepo ih raspodeli i poređaj”.

Merdevine u igri sad crta kod: dve tanke letve i prečke (`uzori-d103/sada-merdevine-u-igri.jpg`). Prave se **naslikane merdevine** od pločica koje igra slaže u visinu, i šest rekvizita za pohod „Pod Varadinom”.

Status piši u `art/world-pack-03/STATUS-D103.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D103`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno radi D102: ne diraj njegove fajlove; svoje skripte zovi `*-dopuna103.py`.

## Uzori (`art/world-pack-03/uzori-d103/`)

- `prop-bedem-kula.png`, `prop-koplje-u-ledini.png`, `prop-bure.png`, `prop-plast-sena.png`, `prop-dok.png`: rekviziti iz igre. **Rukopis, svetlo (toplo sleva), boje i debljina konture** novih slika moraju biti isti.
- `prop-merdevine.png`: stare naslikane merdevine (samo za rukopis drveta; mera i oblik NE).
- `sada-merdevine-u-igri.jpg`, `sada-varadin-u-igri.jpg`: kako izgleda igra sada.

## Pravila

- Crta se na ravnoj **jarko ljubičastoj #ff00ff** i ključ skida ljubičastu; **posle skidanja skini i ljubičasti odsjaj** (piksel gde su i crvena i plava jače od zelene vrati ka prirodnoj boji). Pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica.
- Bez ljudi, životinja, teksta, grbova i krstova.

## Merdevine

Igra ih slaže ovako: **telo** se ponavlja odozdo naviše koliko su merdevine visoke, a **vrh** se stavlja na gornji kraj. U igri su merdevine široke 56 px, a prečke su na svakih 28 px.

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `merdevine-telo` | **256×512**, providno levo i desno od letava | Prave seljačke merdevine od tesanog hrastovog drveta: dve debele letve (svaka ~40 px široka, sa vidljivim godovima, kvrgama i ivicom osvetljenom sleva), razmak između letava ~150 px; **tačno 4 prečke, na jednakom razmaku od 128 px** (prva na y=64, pa 192, 320, 448), svaka prečka uglavljena u letve i **vezana konopcem** (kanap omotan oko spoja). Pločica se **nastavlja gore-dole bez šava**: proveri tri kopije jednu iznad druge i sačuvaj kao `merdevine-telo-proba.png`. |
| `merdevine-vrh` | 256×256 | Gornji kraj istih merdevina: letve se završavaju zaobljeno, malo istrošeno, jedna prečka na y=192, gornjih ~60 px providno. Donja ivica se nastavlja na `merdevine-telo`. |

## Rekviziti (1536×1024, oblik stoji na dnu slike)

| Ime | Šta se vidi |
|---|---|
| `prop-skela-dunav` | Skela na obali Dunava: širok drveni splav od debelih greda sa ogradom, veliko veslo-krma, debeo konop preko vode do koca na obali, malo vode ispod (samo pruga). |
| `prop-top-varadin` | Bronzani top na drvenom lafetu sa dva točka, pored njega piramida đulada i bure baruta; bez barjaka. |
| `prop-barjak-varadin` | Visok jarbol sa žuto-crnim barjakom (vodoravne pruge, bez grba), zabijen u kameno postolje. Barjak blago povijen. |
| `prop-korpe-grozdja` | Tri pletene korpe pune crnog i belog grožđa, jedna prevrnuta, nekoliko grozdova u travi, drvena kaca za gnječenje. |
| `prop-mreza-ribarska` | Ribarska mreža razapeta da se suši na tri koca, ispod čamac izvučen na šljunak, vesla. |
| `prop-tulum-ledjen` | U travi: kožna mešina (tulum) sa vinom, veliki bakreni leđen sa drškom, hleb i komad sira na beloj krpi. Nisko i široko. |

Najviše dva pokušaja po slici. U status upiši veličinu i proveru odsjaja (i šava, za merdevine).
