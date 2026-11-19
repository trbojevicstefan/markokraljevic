# Dopuna 136 (od Claude-a, 19. 11.): Arapov šator, avlija sa kolcima i groblje đuvegija (jedanaesti pohod)

Pesma „Marko Kraljević ukida svadbarinu”: „Nisu dvori, već šatori pusti … gdi se onaj svilen barjak vije, onde j’ šator crnog Arapina, oko njega zelena avlija, sva avlija glavam’ nakićena: … isekao sedamdeset i sedam junaka, Kosovaca tužnih đuvegija … Sve s avlije poskidao glave, pa je glave sahranio lepo, da j’ ne kljuju orli i gavrani, pa avliju pustu nakitio, nakiti je arapskim glavama.” Treba pet slika mesta gledanih **tačno s boka**.

Status piši u `art/world-pack-03/STATUS-D136.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D136`. **Uradi svih pet stavki do kraja, ne staj i ne pitaj.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade D129, D132 i D134: ne diraj njihove fajlove; svoje skripte zovi `*-dopuna136.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d136/`)

- `prop-cador-bok.png`: carev čador iz igre gledan **tačno s boka, kao presek** (prednja strana otvorena, vidi se unutrašnjost): **uzor ugla gledanja, rukopisa, konture i količine detalja** za šator. Sve stoji na jednoj vodoravnoj liniji (dno slike), pod se ne vidi, ništa ne ide u dubinu.
- `prop-perilo-marica.png`, `prop-ograda-pleter.png`: predmeti iz igre gledani s boka: uzor za ogradu.
- `kolci-vitezovi-glave.png`: kolci sa glavama iz igre: **uzor kako se glave na kolcima crtaju u ovoj igri** (mračno, bez krvi koja teče, kao stara freska). Ugao te slike NIJE uzor: tvoje slike su ravne, s boka, bez brežuljka.
- `prop-grob-junaka.png`: grob iz igre: uzor rukopisa za groblje.

## Pravila

- **Pravi bočni pogled (elevacija), bez perspektive**: nema poda u dubinu, nema brežuljka; sve stoji na ISTOJ vodoravnoj liniji = donja ivica slike.
- Crta se na ravnoj **jarko ljubičastoj #ff00ff**, ključ skida ljubičastu, **posle toga skini i ljubičasti odsjaj**; pogledaj na plavoj i beloj podlozi.
- Bez tla, neba, senke, ljudi (osim glava na kolcima), životinja i teksta.

## Stavke

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-arapov-sator-bok` | 1536×1024 | **Arapov šator gledan s boka, kao presek** (po `prop-cador-bok.png`, ali drugi šator): **crno platno od kostreti sa zlatnim resama i crvenim obrubom**, unutra zid od tamnocrvene tkanine sa zlatnim vezom, tri viseća fenjera, na podu **nizak divan sa crvenim i ljubičastim jastucima** (na desnoj trećini), pred divanom nizak okrugli sto sa bakarnim ibrikom i zlatnom čašom, uz zadnji zid kovčeg i naslagane vreće. Levo je ulaz: zavesa podignuta i vezana. Na vrhu šatora kratak zlatan šiljak (barjak se dodaje u igri, ne crtaj ga). Širina oko 1480 px, visina oko 960 px. **Bez ljudi.** |
| `prop-avlija-kolci` | 1536×1024 | **Deo ograde avlije gledan s boka**: niska ograda od pruća (pleter) visoka oko 230 px, preko cele širine slike; iz nje viri **sedam visokih zašiljenih kolaca** različite visine (od 560 do 900 px), razmaknutih, malo nakrivljenih; **na vrhu svakog kolca glava mladog ženika sa svatovskom kapom okićenom cvetom**, crtana kao u `kolci-vitezovi-glave.png` (mračno, sitno, bez krvi koja teče). Na dva kolca visi izbledeo svatovski peškir. |
| `prop-avlija-kolci-prazni` | 1536×1024 | **Ista ograda i istih sedam kolaca na istim mestima, ali prazni**: vrhovi kolaca goli, peškiri i dalje vise. Napravi je kao uređivanje prethodne slike, da se kolci poklope. |
| `prop-avlija-kolci-arapi` | 1536×1024 | **Ista ograda i istih sedam kolaca na istim mestima, a na njima arapske glave u belim čalmama oko crvenog fesa**, crtane isto mračno i sitno. Napravi je kao uređivanje prve slike, da se kolci poklope. |
| `prop-groblje-djuvegija` | 1536×1024 | **Sveže groblje gledano s boka**: red od **sedam svežih humki od crne zemlje** (visokih oko 120 px), na svakoj **drveni krst** (visok oko 300 px od zemlje) sa vencem poljskog cveća i belim svatovskim peškirom vezanim oko krsta; uz prvu humku zaboden ašov. Širina oko 1450 px, visina oko 330 px. |

Najviše tri pokušaja po slici. Ako alat odbije glave na kolcima, nacrtaj umesto glava **samo kape** (svatovske kape sa cvetom, odnosno čalme) nataknute na kolce i to upiši u status. U status upiši veličinu, proveru odsjaja, visinu ograde i visine kolaca u pikselima.
