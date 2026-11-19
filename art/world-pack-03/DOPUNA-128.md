# Dopuna 128 (od Claude-a, 19. 11.): sofra, vešala, riba od Orida i slika slave (deseti pohod)

Pesma „Marko Kraljević i Đemo Brđanin”: „Slavu slavi Kraljeviću Marko … svemu dosta piva i jestiva … još da imaš ribe od Orida! … Kod Orida načini vješala, i objesi Đema Brđanina; pa on uze ribe od Orida, ode pravo bijelu Prilipu, te on slavi svoga svetitelja.” Trebaju tri slike mesta gledane **tačno s boka** i jedna slika iz pesme.

Status piši u `art/world-pack-03/STATUS-D128.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D128`. **Uradi sve četiri stavke do kraja, ne staj i ne pitaj.**

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere, git, fajlove `*dopuna41*`. Paralelno rade D126 i D127: ne diraj njihove fajlove; svoje skripte zovi `*-dopuna128.py`. Slike idu u `art/world-pack-03/<ime>.png`.

## Uzori (`art/world-pack-03/uzori-d128/`)

- `prop-cador-bok.png`, `prop-perilo-marica.png`, `prop-sablje-okovane.png`: slike iz igre gledane **tačno s boka**. **Uzor ugla gledanja, rukopisa, konture i količine detalja**: sve stoji na jednoj vodoravnoj liniji (dno slike), pod se ne vidi, ništa ne ide u dubinu.
- `stil-prelaz-mocvara-lov-3.jpg`, `stil-prelaz-podrum-2.jpg`: slike između delova pohoda (minijatura / freska, zlatno nebo, okvir): uzor za četvrtu stavku. Marko izgleda kao na njima.

## Pravila za prve tri stavke

- **Pravi bočni pogled (elevacija), bez perspektive**: nema ploče stola koja se vidi odozgo, nema poda u dubinu; sve stoji na ISTOJ vodoravnoj liniji = donja ivica slike.
- Crta se na ravnoj **jarko ljubičastoj #ff00ff**, ključ skida ljubičastu, **posle toga skini i ljubičasti odsjaj**; pogledaj na plavoj i beloj podlozi.
- Bez tla, neba, senke, ljudi, životinja i teksta.

## Stavke

| Ime | Veličina | Šta se vidi |
|---|---|---|
| `prop-slava-sofra` | 1536×1024 | **Slavska sofra gledana s boka**: dug nizak sto (visok oko 230 px, širok oko 1450 px) prekriven belim vezenim stolnjakom koji visi do pola nogu; **na stolu, u jednom redu: slavski kolač sa svećom koja gori, žito u činiji, pečeno prase na ovalu, pogače, zdele, bokali vina i srebrne čaše**; iznad stola ništa. Vidi se samo prednja strana stola (stolnjak kao ravna površina) i ono što je na njemu, gledano sa strane. Ljudi će sedeti IZA stola, zato iza stola ništa ne crtaj. |
| `prop-vjesala` | 1024×1024 | **Vešala gledana s boka**: dva visoka uspravna stuba od grubo tesanih greda sa prečkom na vrhu i kosnicima, sa prečke visi **prazna omča od debelog užeta**; ispod nje nizak drveni panj. Visina oko 900 px, širina oko 520 px. Mračno, grubo drvo; bez čoveka. |
| `prop-ribe-orid` | 1024×1024 | **Riba od Orida**: pletena korpa od pruća puna **ohridskih pastrmki (srebrne ribe sa crvenim i crnim pegama)**, pored nje još tri ribe nanizane na vrbov prut okačen o nizak kolac, mokra ribarska mreža prebačena preko kolca. Visina oko 430 px, širina oko 560 px. |
| `prelaz-klisura-slava` | 1024×1024, puna slika | **Marko se vraća na slavu sa ribom od Orida** (u rukopisu `stil-prelaz-*.jpg`, sa zlatnim nebom i okvirom): u dvoru u Prilepu, za dugom sofrom sede patrijarsi, vladike, popovi i kaluđeri; **Marko ulazi sa korpom pastrmki u ruci**, stara majka u crnoj marami mu ide u susret raširenih ruku, sluga toči vino; na stolu slavski kolač sa svećom. Bez teksta. |

Najviše tri pokušaja po slici. Ako pokušaj za sofru pokazuje ploču stola odozgo, odbij ga. U status upiši veličinu, proveru odsjaja i za sofru: **visinu stola (od dna do ploče) i visinu najvišeg predmeta na stolu u pikselima**.
