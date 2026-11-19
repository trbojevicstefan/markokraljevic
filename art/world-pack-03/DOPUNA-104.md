# Dopuna 104 (od Claude-a, 19. 11.): tamnica Varadina, krčma, Markova kula, zlatne karuce i probna kapija

Stefan (19. 11.): „Naslikaj tamnicu i sve što ti treba iz inventara” i „pokušaj da središ kapije”.

Pohod „Pod Varadinom” (pesma „Marko Kraljević i Vuča dženeral”) sada ide redom pesme. Četiri mesta su nacrtana kodom ili pozajmljenom slikom i treba im prava slika; peta stavka je **proba nove kapije** za celu igru.

Status piši u `art/world-pack-03/STATUS-D104.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D104`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade D105 i D106: ne diraj njihove fajlove; svoje skripte zovi `*-dopuna104.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d104/`)

- `prop-bedem-sredina.png`, `prop-bedem-kapija.png`, `prop-bedem-kula.png`: zidine Varadina iz igre. **Kamen, rukopis, svetlo (toplo sleva), bršljan i debljina konture** tamnice, kule i kapije moraju biti isti.
- `prop-kuca.png`, `prop-dok.png`, `prop-kola.png`: kuća, dok i kola iz igre (rukopis drveta, crepa i maltera).
- `sada-tamnica-u-igri.jpg`, `sada-krcma-u-igri.jpg`, `sada-kula-u-igri.jpg`, `sada-kapija-u-igri.jpg`: kako ta mesta izgledaju sada. Marko je visok oko 125 px na tim slikama.

## Pravila

- Crta se na ravnoj **jarko ljubičastoj #ff00ff** i ključ skida ljubičastu; **posle skidanja skini i ljubičasti odsjaj** (piksel gde su i crvena i plava jače od zelene vrati ka prirodnoj boji). Pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica.
- Oblik stoji na dnu slike (dno oblika = donja ivica platna), bez tla, trave ispod, neba i senke na tlu.
- Bez ljudi, životinja (osim konja u karucama), teksta, slova, grbova i krstova.

## Stavke

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-tamnica-varadin` | 1536×1024 | **Uređivanje `prop-bedem-sredina.png`**: isti zid sa zupcima, ali viši (zid visok oko 620 px) i **na sredini širok nizak luk-otvor tamnice**: širok oko 700 px, visok oko 420 px, dno otvora na dnu slike, luk od klesanih klinastih kamenova. **Kroz otvor se vidi unutrašnjost ćelije** (bez rešetke preko otvora, nju crta igra): mokar tamni kameni zid u dubini, na njemu gvozdene alke i dva lanca sa okovima, mali prozorčić sa rešetkom visoko desno iz koga pada kosi snop svetla; **levo uz zid gomila ljudskih lobanja i kostiju visoka skoro do ramena čoveka** (oko 260 px), kosti i po podu; **po celom dnu ćelije mutna zelenkasta voda duboka oko 70 px** (voda do kolena) sa odsjajem svetla. Sa strana otvora po jedna gvozdena baklja-držač bez plamena. Bez ljudi. |
| `prop-krcma-beograd` | 1536×1024 | Krčma pored druma kod Beograda, po rukopisu `prop-kuca.png`, ali druga kuća: prizemna, dugačka, beli malter i kamen, crveni crep, **širok drveni trem** sa stubovima preko cele prednje strane, pod tremom dve klupe i dugačak sto, uz vrata **tri vinska bureta** (jedno na nogarima sa slavinom), nad vratima **okačena drvena tabla sa naslikanim grozdom i krčagom** (bez slova), vinova loza uz trem, fenjer. Desno od kuće **jak drveni stub-direk sa gvozdenom alkom za vezivanje konja** i korito za vodu. Vrata otvorena, unutra toplo svetlo. |
| `prop-markova-kula` | **1024×1536** | Markova „tanka kula” u Prilepu: **visoka i vitka četvrtasta srednjovekovna kula** od svetlog tesanog kamena (drugačija od okruglih kula Varadina), široka oko 380 px, visoka oko 1400 px. Pri vrhu **drveni čardak (doksat) koji viri na sve strane**, pokriven šindrom, strm četvoroslivni krov; nekoliko uskih prozora na lučni svod; u prizemlju **okovana lučna vrata do kojih vodi pet kamenih stepenika**, a pored njih **niska široka vrata podruma** (konjušnica za Šarca) sa drvenom rampom. Bršljan uz jedan ugao. Bez barjaka (njega dodaje igra). |
| `prop-karuce-zlatne` | 1536×1024 | Vučine **zlatne karuce**: raskošna zatvorena kočija, pozlaćena rezbarija, crveni baldahin i zavese, veliki zadnji i manji prednji točkovi, fenjeri; **upregnuta četiri vranca** (crni konji, dva po dva, zlatni amovi, crvene kićanke), stoje mirno, okrenuti **udesno**. Bez kočijaša i putnika. Cela zaprega staje u širinu slike. |
| `kapija-34-kamen` | 1536×1024 | **Proba nove kapije.** Kapija-kula kroz koju prolazi drum, **gledana u tri četvrtine** (vidimo je spreda-sleva, kao u izometriji; drum ide sleva nadesno i ulazi u nju). **Leva trećina kule je čeono lice sa lukom**: okrenuto je ka nama ukoso, pa je luk uži nego što je visok (**otvor širok oko 230 px, visok oko 430 px**, dno otvora na dnu slike). **Desne dve trećine su bočni zid kule** koji ide udesno u dubinu, sa dve strelnice. Na vrhu zupci na oba lica. Kroz luk se vidi samo tamna unutrašnjost prolaza: **bez vrata, bez rešetke**. **Iznad luka čeono lice ima još najmanje 450 px ravnog zida** (tu se podiže rešetka); levo i desno od luka po jedan **uspravan kameni žleb-vođica** koji ide od dna slike do 450 px iznad luka; na vrhu vođica gvozden kotur sa lancem. Kula je visoka oko 980 px i široka oko 900 px, isti tesani kamen kao `prop-bedem-kapija.png`. |
| `kapija-34-resetka` | 1536×1024 | **Uređivanje gotove slike `kapija-34-kamen`** (isto platno, ista perspektiva, ništa se ne pomera): na slici ostaje **SAMO gvozdena rešetka (portkulis) koja visi spuštena u luku**, sve ostalo je ljubičasto. Rešetka je u ravni čeonog lica (ista kosina kao luk): kovan gvozden okvir, uspravne šipke sa šiljcima na dnu, tri vodoravne trake, zakivci na ukrštanjima. Malo je šira od otvora (ulazi u vođice levo i desno) i visoka je koliko i otvor luka. |

Najviše dva pokušaja po slici. U status upiši veličinu, proveru odsjaja i, za tamnicu i kapiju, **izmerene koordinate otvora luka** (levo, desno, vrh, dno u pikselima slike).
