# Dopuna 66 (od Claude-a, 18. 11.): Kosovsko selo — kuće, sitnice sela, kokoške, Marko daje dukate

Stefan (18. 11.) je tražio da se prvom nivou doda: više vrsta kuća i sitnice sela (bunar, tezge, kokoške, veš), i pokret kojim Marko daje dukate sirotinji.

Status piši u `art/world-pack-03/STATUS-D66.md` (napravi ga), red posle SVAKE slike ili klipa, sa oznakom `D66`.

Ne diraj ništa od sledećeg:
- `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, `sync-world.py`;
- druge `STATUS-*` fajlove, postojeće `prop-*.png` i tuđe foldere klipova;
- git (ne pravi commit).

Najviše tri `image_gen` pokušaja po slici ili klipu. Ako ni treći ne valja, NE izvozi; upiši šta ne valja i idi dalje.

## Uzori (`art/world-pack-03/uzori-d66/`)

| Fajl | Šta je |
|---|---|
| `stil-kuca.png` | postojeća kuća sela: uzor RUKOPISA, boja i mere detalja (bela okrečena kuća, tamno drvo, crven crep, kamen u temelju, cveće na prozoru) |
| `stil-bunar.png`, `stil-ambar.png`, `stil-kola.png`, `stil-taraba-ravna.png` | postojeći rekviziti sela: isti rukopis (topla svetlost s leva, slikano, mat, jasna tamna kontura, bez crnih senki) |
| `marko-idle-2-kadar0.png`, `pokret-marko-idle-2.png` | Marko kako stoji u igri: uzor lika i veličine za klip `marko-daje` (visok 383 px, stopala na y=488, gleda udesno) |
| `putnica-idle-kadar0.png` | seljanka iz igre: uzor rukopisa likova (za kokoške) |

## Deo 1: pet rekvizita sela (slike, ne animacije)

Svaki rekvizit je jedna slika **1536×1024, providna pozadina**, u `art/world-pack-03/<ime>.png`:
- predmet gledan sa strane, blago odozgo, kao `stil-kuca.png`;
- zauzima skoro ceo okvir (margina oko 20 px), **donja ivica predmeta je vodoravna i leži na dnu okvira** (igra ga stavlja na zemlju po najnižem pikselu);
- bez tla, trave ispod, senke na zemlji, ljudi, životinja i teksta;
- srpsko selo na Kosovu u 14. veku: drvo, kamen, kreč, crep ili šindra; ništa tursko;
- svetlo i toplo, isti rukopis kao uzori; crtaj kao uređivanje `stil-kuca.png` (`image_gen` sa uzorom kao ulazom) da rukopis ostane isti.

| Ime | Šta se vidi |
|---|---|
| `prop-kuca-brvnara` | Brvnara: prizemna kuća od tamnih tesanih brvana na niskom kamenom temelju, strm visok krov od drvene šindre, mali trem sa dva drvena stuba i klupom, niska vrata, jedan prozorčić sa kapkom, dimnjak od kamena. Šira nego viša. |
| `prop-vajat` | Vajat: mala drvena zgrada za mlade, na četiri kamena, krov od šindre na četiri vode sa drvenim šiljkom na vrhu, rezbarena vrata, dve stepenice. Uža i niža od kuće, približno kvadratna. |
| `prop-tezga` | Seoska tezga na vašaru: drveni sto pod platnenom nastrešnicom na četiri motke (platno belo sa crvenim prugama); na stolu bundeve, venci paprike i luka, krčazi, pogače, tkani ćilim prebačen preko ivice. Bez prodavca. |
| `prop-ves` | Veš na konopcu: dva drvena stuba i konopac između njih; na konopcu bele lanene košulje sa crvenim vezom, tkana pregača i peškir, lako podignuti vetrom. Vrlo široka, niska slika (predmet zauzima celu širinu, visina oko polovine okvira; donja ivica stubova na dnu). |
| `prop-djeram` | Bunar sa đermom: nizak okrugao kameni bunar i visoka drvena soha sa dugom kosom motkom (đeram), na čijem kraju visi vedro na lancu, a na drugom kraju kamen-teg. Visok, uzan predmet. |

Postupak izvoza rekvizita postoji u `art/world-pack-03/export-dopuna53-props.py` (skidanje pozadine, provera ivica). Posle izvoza proveri za svaku sliku: veličina 1536×1024, pozadina potpuno providna, nema zelenih ni belih ostataka uz ivice, predmet ceo u okviru, donja ivica na dnu.

## Deo 2: dva klipa (animacije)

Pravila ćelije i izvoza su ista kao u `DOPUNA-65.md` (ćelija 512×512, margina 24 px, providno, mreža na jarko zelenoj #00ff00, `art/animation-pack-04/assets/<klip>/` sa `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `preview.gif`, `qa.json`, `identity-size-comparison.png`; JSON bez BOM-a; radni fajlovi u `art/animation-pack-04/sources/<klip>/attempt-N/`). Postupak: `export-dopuna65.py` i `verify-dopuna65.py`, prilagođeni kao `export-dopuna66.py` i `verify-dopuna66.py`.

| Klip | Kadrova | Petlja | Uzor | Šta se vidi |
|---|---|---|---|---|
| `marko-daje` | 6 | ne | `marko-idle-2-kadar0.png` (uređivanje tog kadra) | Marko daje dukate. Isti Marko, ista veličina (383 px, ±5 %), stopala na y=488 i na istom mestu u svim kadrovima, gleda udesno. Topuz ostaje u desnoj ruci, spušten uz nogu (glava topuza dole). 0: stoji; 1: levom rukom poseže za kesom na pojasu; 2: vadi šaku punu dukata; 3: pruža levu ruku napred, dlan nagore, na dlanu se vide zlatnici; 4: malo se nakloni glavom, ruka i dalje pružena; 5: vraća ruku, uspravlja se. Blag, ne ratoboran. |
| `kokoska-kljuca` | 6 | da | nema uzora lika; rukopis kao `putnica-idle-kadar0.png` | Jedna seoska kokoška (riđa, crvena kresta), gleda udesno, **visoka oko 240 px**, noge na y=488, na istom mestu u svim kadrovima. 0: stoji; 1: spušta glavu; 2: kljucne zemlju; 3: diže glavu; 4: zakorači u mestu i trzne glavom; 5: stoji, kao kadar 0. Kadar 5 se pretapa u 0. Samo kokoška, bez zrnevlja i tla. |

Za `marko-daje` izmeri visinu kadra 0 i uporedi sa 383 px (sa ogrtačem 390). **Meri sam, ne procenjuj.**
