# Dopuna 110 (od Claude-a, 19. 11.): carev čador i perilo na Marici, gledano S BOKA (peti pohod)

Stefan (19. 11.): „Moraš da poradiš na carevom šatoru, i ona devojka što pere veš: nekako je loša perspektiva, iskrivljeno deluju ti modeli.”

Igra je gledana **tačno s boka** (kao pozornica): likovi stoje na jednoj vodoravnoj liniji tla. Dve slike iz D107 su nacrtane u perspektivi odozgo (vidi se pod koji ide u dubinu), pa likovi koji stoje na liniji tla izgledaju kao da lebde ili su iskrivljeni (`uzori-d110/sada-cador-u-igri.jpg`, `sada-platno-u-igri.jpg`). Prave se iznova, **bez ikakvog poda u dubinu**.

Status piši u `art/world-pack-03/STATUS-D110.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D110`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike (nove imaju nova imena), tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade D111 i D112: ne diraj njihove fajlove; svoje skripte zovi `*-dopuna110.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d110/`)

- `stari-carev-cador.png`, `staro-platno-marica.png`: stare slike. **Boje, platno, vez, fenjeri, tugovi, ibrici i rukopis su dobri i ostaju isti; menja se samo ugao gledanja.**
- `sada-cador-u-igri.jpg`, `sada-platno-u-igri.jpg`: kako to sada izgleda u igri (loše). Marko je u igri visok oko 150 px.
- `prop-tamnica-varadin.png`, `prop-krcma-beograd.png`: slike iz igre gledane s boka, **uzor ugla gledanja**: zid stoji uspravno, dno je ravna linija, pod se ne vidi.
- `car-sedi-kadar.png`, `turkinja-beli-kadar.png`: likovi koji će stajati u tim slikama (gledani s boka).

## Pravila

- **Pravi bočni pogled (elevacija), bez perspektive**: nema poda koji se vidi odozgo, nema ćilima koji ide u dubinu, sve što stoji na zemlji stoji na ISTOJ vodoravnoj liniji = donja ivica slike. Ćilim se vidi samo kao tanka traka (rub) na dnu, najviše 24 px visoka.
- Crta se na ravnoj **jarko ljubičastoj #ff00ff** i ključ skida ljubičastu; **posle skidanja skini i ljubičasti odsjaj**. Pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica.
- Oblik stoji na dnu slike (dno oblika = donja ivica platna), bez tla, trave, neba i senke na tlu.
- Bez ljudi, životinja, teksta i slova.

## Stavke

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-cador-bok` | 1536×1024 | **Carev čador kao presek gledan s boka** (kao kućica za lutke bez prednjeg zida): gore širok krov od crvenog i zelenog platna sa zlatnim vezom i resama, na vrhu zlatna jabuka sa polumesecom; **zadnji zid čadora je ravna zavesa od platna i ćilima koja ispunjava celu unutrašnjost od dna slike do krova** (tamnija od likova, da se oni vide na njoj), na njoj vise tri fenjera. **Leva strana je otvorena** (krilo podignuto i vezano gajtanom uz levi stub), **desna strana je zatvoren uspravan zid od platna**. Uz desni zid, na dnu: **nizak minder (sećija) sa jastucima, gledan s boka, visok oko 110 px**, pored njega bakarna tepsija sa ibrikom na niskoj stolici. Na sredini dna samo **rub serdžade: tanka šarena traka sa resama, do 24 px visoka** (nikakav pod). Unutrašnja visina (od dna do donje ivice krovnih resa) **najmanje 520 px**, da čovek visok 300 px stane sa mnogo vazduha iznad glave. Ceo čador visok oko 900 px, širok oko 1480 px. Levo ispred ulaza jedan tug (koplje sa konjskim repom) zaboden uspravno. |
| `prop-cador-bok-prednji` | 1536×1024 | **Ista slika, ali samo ono što je ISPRED likova**, sve ostalo providno: dva prednja stuba čadora (levi kod ulaza i desni kod zida) sa gajtanima i kićankama, donja ivica krovnih resa (pojas od ~70 px ispod krova) i tug pred ulazom. **Uradi je kao uređivanje gotove `prop-cador-bok.png`: isti položaj svakog dela, piksel u piksel**, obriši zadnji zid, minder, tepsiju, serdžadu i krov iznad resa. |
| `prop-perilo-marica` | 1536×1024 | **Perilo na obali Marice gledano s boka**: dve račvaste motke zabodene uspravno i preko njih prečka (visoka oko 560 px), **na prečki vise tri bela platna da se suše, kao zavese, do pred zemlju; donji kraj jednog je umrljan tamnocrvenom vodom**. Levo od motki **drveno korito na niskim nogarima gledano s boka** (visoko oko 170 px) sa mokrim platnom prebačenim preko ivice i pratljačom (drvenom lopaticom) naslonjenom na njega; pored korita dva bakrena ibrika i nizak tronožac. Desno nekoliko krupnih rečnih oblutaka i jedan ravan kamen za pranje (nizak, do 60 px). Sve stoji na dnu slike, jedno pored drugog; ništa ne leži „po podu u dubinu”. Širina oblika oko 1350 px. |

Najviše tri pokušaja po slici. Ako pokušaj i dalje pokazuje pod odozgo ili ćilim u dubinu, ODBIJ ga i crtaj ponovo (to je jedini razlog narudžbine). U status upiši: veličinu, proveru odsjaja, **unutrašnju visinu čadora (od dna do resa) u pikselima, x levog i desnog unutrašnjeg zida, x i visinu mindera**, i da li se prednja slika poklapa sa zadnjom.
