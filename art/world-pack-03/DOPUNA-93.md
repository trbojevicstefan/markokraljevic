# Dopuna 93 (od Claude-a, 18. 11.): „Pod Varadinom": leto umesto zimskog prevoja

Stefan (18. 11.): „Moraš da popraviš zimski prevoj: tu pesma priča o zelenoj travi, a mi na zimskom tlu. I ne vidi se dosta stvari koje su ispevane u pesmi.”

Deveti pohod ide po pesmi **„Marko Kraljević i Vuča dženeral”** (Vuk II). U pesmi nema ni snega ni zime: Marko pregazi **Dunav** na Šarcu, jer skeledžija ne dođe, i dođe „pod Varadin, u polje zeleno”. Tu udari koplje u ledinu, veže Šarca i pije vino, a sa bedema ga gleda Velimirovica. **Varadin** je tvrd grad na steni nad Dunavom, a na gradu pucaju topovi. Sada je ceo nivo zaleđen: sneg, led, jele pod snegom (`uzori-d93/sada-u-igri-prevoj.jpg`). Pravi se **ceo nov, letnji teren** za taj nivo, isti raspored slojeva, ista mera.

Status piši u `art/world-pack-03/STATUS-D93.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D93`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike (nove slike imaju nova imena, vidi tabelu), tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade druge Codex sesije (D94–D96): ne diraj njihove fajlove; svoje skripte zovi `*-dopuna93.py`.

## Uzori (`art/world-pack-03/uzori-d93/`)

- `sada-prevoj-*.png` (+ `*-na-plavom.jpg`): sadašnji zimski slojevi. Od njih uzmi **samo meru i raspored**: veličinu slike, visinu horizonta, koliko je donji pojas visok, gde je providno. Boje, sneg i led NE.
- `stil-leto-*.png`: letnji slojevi drugih pohoda (Selo, Oranje, Klisura). **Rukopis, boje i svetlo** treba da budu kao kod njih: slikano, mat, topla svetlost, jasna kontura, bez crnih senki, zasićeno zelenilo.
- `sada-tlo-prevoj.png`, `sada-tlo-prevoj-kraj.png`: sadašnje tlo (sneg na steni); `stil-tlo-*.png`: tlo drugih pohoda.
- `sada-prelaz-prevoj-*.jpg`: sadašnje slike između delova pohoda (zimske); `stil-prelaz-oranje-*.jpg`: uzor rukopisa za te slike.

## Pravila

- Slojevi `-sky`, `-far`, `-mid`, `-near` i `-vista` su **2172×724** (osim `-sky`, vidi tabelu), providni iznad oblika (nebo se crta samo u `-sky`). Crta se na ravnoj **jarko ljubičastoj #ff00ff** pozadini i ključ skida ljubičastu. **Posle skidanja ključa skini i ljubičasti odsjaj**: svaki piksel u kome su i crvena i plava jače od zelene vrati ka prirodnoj boji (prošli put su daleke planine ispale roze). Pogledaj rezultat na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica u kamenu i lišću.
- `image_gen` ne daje 2172×724: nacrtaj u najvećoj vodoravnoj veličini sa istim rasporedom (donji pojas slike odgovara donjem pojasu uzora `sada-*`), pa iseci i razvuci.
- Slojevi se ponavljaju vodoravno: leva i desna ivica moraju da se nastave jedna u drugu (proveri: stavi dve kopije jednu do druge i pogledaj šav; sačuvaj kao `<ime>-proba-sava.jpg`). **Ne preslikavaj** sliku da bi dobio nastavak (ogledalo daje kaleidoskop); šav popravi tako što pomeriš sliku za pola širine i prekriješ šav.
- Kod `-mid` i `-near` levih i desnih ~260 px neka bude mirno (trava, nisko žbunje, stene), bez zgrade presečene ivicom.
- **Godišnje doba: rano leto, jutro** („Kad u jutru jutro osvanulo”). Zelena trava, puno lišće, ni pahulje snega, nigde leda.
- Bez ljudi, životinja, teksta i barjaka koji se vijore preko ivice.

## Slike (u `art/world-pack-03/`)

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `varadin-sky` | 1774×887, puna slika | Jutarnje letnje nebo nad Dunavom: svetlo plavo gore, toplo zlatno-ružičasto pri dnu (sunce izlazi levo), nekoliko velikih belih kumulusa. Bez ptica. |
| `varadin-far` | 2172×724 | Daleko: široka **ravnica uz Dunav**, Dunav kao svetla traka preko cele širine u donjoj trećini, na drugoj obali niska plava brda (Fruška gora) sa šumom, po koja crkvica u daljini. Bleđe, plavičasto od daljine. |
| `varadin-mid` | 2172×724 | Srednje: zelena brda i vinogradi koji se spuštaju ka Dunavu, topole i vrbe uz vodu, na reci **skela** (drveni splav sa ogradom) privezana uz drugu obalu i prazna, poljski put. |
| `varadin-mid-b` | 2172×724 | Srednje, druga verzija (igra smenjuje A, B, A …): **tvrđava Varadin** na steni nad Dunavom: visoki kameni bedemi sa kulama i puškarnicama, nad bedemom žuto-crni barjak, sa dve kule **dim od topova** (šenluk), kapija sa drvenim mostom. Daleko i manja od bližeg sloja. |
| `varadin-near` | 2172×724 | Blizu: **zeleno polje pod Varadinom**: visoka trava i poljsko cveće (bulka, kamilica, različak), nekoliko starih hrastova i krušaka, niske stene obrasle mahovinom, plot od pruća. Toplo, sunčano. |
| `varadin-near-b` | 2172×724 | Blizu, druga verzija: **obala Dunava**: vrbe nad vodom, trska, čamac izvučen na obalu, drveni mol, stena sa travom. |
| `varadin-near-c` | 2172×724 | Blizu, treća verzija: **podnožje Varadina**: kameni temelji bedema obrasli bršljanom i travom, drvene stepenice uz zid, nekoliko topovskih đulada u travi, stari bunar. |
| `varadin-prednji` | 2172×724 | **Prednji sloj (ispred Marka)**: samo donja trećina je puna, gore providno. Tamnije i malo zamućeno: visoka trava, bulke, lišće žbunja, po koja vlat trske. Najviše trećina širine sme biti visoka (do pola slike), ostalo niska trava. |
| `varadin-vista` | 2172×724 | Jedna slika za daljinu kad nema slojeva: Varadin na steni nad Dunavom u jutro, ravnica, zelena brda. Puna slika (nebo uključeno). |
| `tlo-varadin` | 1024×384 | Tlo po kome se hoda (pločica koja se ponavlja vodoravno, levo-desno bez šava): gore **pojas zelene trave** (~70 px) sa po kojim cvetom i busenom, ispod **topla svetla stena / zemlja** sa slojevima i korenjem, do dna. Isti raspored kao `sada-tlo-prevoj.png` (gde je kod njega sneg, ovde je trava). Donjih ~120 px tamnije. |
| `tlo-varadin-kraj` | 192×384 | Kraj tla (desna ivica litice): ista trava i stena, ivica se lomi i zaobljava naniže, desno providno. Raspored kao `sada-tlo-prevoj-kraj.png`. |
| `prelaz-varadin-1` | 1024×1024 | Slika iz pesme: **tamnica Varadina**, voda do kolena, tri vojvode u lancima; Miloš od Pocerja kod rešetkastog prozora perom piše knjigu i pečati je svojom krvlju (kap krvi na hartiji, ne krvavo), kroz prozor svetlo. Rukopis kao `stil-prelaz-oranje-1.jpg`. |
| `prelaz-varadin-2` | 1024×1024 | Slika iz pesme: **Marko na Šarcu gazi Dunav** (Šarac je šaren konj, belo-riđi; Marko u kurjačkoj kapi i ćurku od kurjaka, koplje u ruci), voda do Šarčevih grudi, iza na drugoj obali prazna skela, u daljini Varadin na steni u jutarnjoj magli. |
| `prelaz-varadin-anim` | 9216×512 (12 kadrova 768×512 jedan do drugog) | Mala živa slika: **Varadin na steni nad Dunavom, na bedemu pucaju topovi** (šenluk): u kadrovima se iz dva topa diže pa razilazi beli dim i blesne plamen, barjak se vije, voda svetluca. Sve ostalo mirno i isto u svih 12 kadrova (isti crtež, menja se samo dim, plamen, barjak i odsjaj vode). Uzor formata: `stil-prelaz-oranje-anim.jpg`. |

Redosled rada: prvo `varadin-near`, pa `tlo-varadin` i `tlo-varadin-kraj` (da se vidi da se slažu), pa ostali slojevi, pa slike prelaza. Najviše tri pokušaja po slici. U status upiši veličinu, pokušaj koji je uzet, proveru šava i proveru roze odsjaja.
