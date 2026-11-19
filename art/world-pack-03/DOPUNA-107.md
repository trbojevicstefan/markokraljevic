# Dopuna 107 (od Claude-a, 19. 11.): slike za pesmu „Marko Kraljević poznaje očinu sablju” (peti pohod)

Stefan (19. 11.): „kreni na nivo 5 sve do najsitnijeg detalja”.

Peti pohod („Opsednuta tvrđava”) ide po pesmi: Turkinja devojka beli platno na Marici, voda „udari mutna i krvava” i nanese ranjenog junaka (kralja Vukašina); njen brat Mustaf-aga mu zbog sablje sa tri zlatna balčaka odseče glavu; sablja u carevoj vojsci ide „od ruke do ruke” dok se u Markovoj ruci sama ne izvadi; Marko poseče Mustaf-agu i ode caru pod čador, „u čizmama sjede na serdžadu”, a car se odmiče „do duvara” i daje mu sto dukata. Trebaju četiri slike mesta iz pesme.

Status piši u `art/world-pack-03/STATUS-D107.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D107`. **Uradi sve stavke do kraja, ne staj i ne pitaj posle prve.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade D108 i D109: ne diraj njihove fajlove; svoje skripte zovi `*-dopuna107.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d107/`)

- `prop-markova-kula.png`, `prop-krcma-beograd.png`, `prop-tamnica-varadin.png`: slike iz igre. **Rukopis, svetlo (toplo sleva), debljina konture i količina detalja** novih slika moraju biti isti.
- `prop-turski-sator.png`: turski šator iz igre (boje i platno carevog čadora treba da budu iz iste vojske, ali bogatije).
- `sada-u-igri.jpg`: kako igra izgleda; Marko je visok oko 125 px.

## Pravila

- Crta se na ravnoj **jarko ljubičastoj #ff00ff** i ključ skida ljubičastu; **posle skidanja skini i ljubičasti odsjaj**. Pogledaj na plavoj I na beloj podlozi: bez ljubičastog ruba, bez roze senke, bez rupica.
- Oblik stoji na dnu slike (dno oblika = donja ivica platna), bez tla, trave ispod, neba i senke na tlu.
- Bez ljudi, životinja, teksta i slova.

## Stavke

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-bela-kula-mustafa` | **1024×1536** | Mustaf-agina „bijela kula”: **visoka četvrtasta turska kula od belo okrečenog kamena**, široka oko 420 px, visoka oko 1450 px. **Na dve trećine visine otvoren drveni balkon (doksat) sa ogradom, okrenut ka nama, dovoljno širok da na njemu stoji čovek** (pod balkona ravan, vidljiv). Iznad balkona sprat sa prozorima sa drvenim rešetkama (mušebak) i širok krov od crvenog crepa sa dubokom strehom. U prizemlju teška drvena vrata sa gvozdenim okovom, bez stepenica. Uz kulu čempres ne treba; samo kula. |
| `prop-platno-marica` | 1536×1024 | Mesto gde devojka beli platno na reci: **tri duge trake belog platna prostrte preko oblutaka da se suše**, drvena klupica za pranje, drveno korito sa mokrim platnom, pratljača (drvena lopatica), dva bakrena ibrika. Nisko i široko (visina oblika oko 300 px, širina cele slike). Platno na jednom kraju umrljano tamnocrvenom vodom. |
| `prop-grob-junaka` | 1536×1024 | Svež grob neznanog junaka pored reke: **humka od zemlje i rečnog kamena**, na čelu **prost drveni krst od dve grede vezane likom**, o krst okačen **ulubljen kalpak sa perjanicom** i komad zlatom vezenog plašta; u humku zabodeno slomljeno koplje; nekoliko poljskih cvetova. Visina oko 520 px, širina oko 700 px. |
| `prop-carev-cador` | 1536×1024 | **Carev čador gledan spreda-sa strane, sa prednjim krilom podignutim tako da se vidi unutra** (kao presek): veliki okrugao šator od crvenog i zelenog platna sa zlatnim vezom, na vrhu zlatna jabuka sa polumesecom, pred ulazom **dva tuga (koplja sa konjskim repom)**. Unutra: ćilimi po podu, **na sredini nizak podijum sa serdžadom (molitvenim ćilimom) i jastucima**, bakarna tepsija sa ibrikom, viseći fenjeri; **desni kraj šatora je zatvoren zid od platna** (do njega car uzmiče). Unutrašnjost je svetla i čitka. Šator visok oko 760 px, širok skoro celu sliku; pod šatora je na dnu slike. |

Najviše dva pokušaja po slici. U status upiši veličinu i proveru odsjaja, a za kulu **izmerenu visinu poda balkona** (y u pikselima slike) i levu i desnu ivicu balkona.
