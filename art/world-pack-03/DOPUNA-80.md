# Dopuna 80 (od Claude-a, 18. 11.): Ravijojlina šuma, novi aseti

Stefan (18. 11.): „dodaj još novih aseta šta nedostaje” (za drugi nivo, Miroč-planina).

Jahanje preko Miroča je produženo, pa uz drum treba života i predmeta: srne koje pasu i pobegnu pred konjima, sveti hrast sa urezanim krstom (zapis), izvor sa koritom na kom konji mogu da piju, lovačka koliba, i pravih pet trava koje vila bere (sada su obojeni krugovi).

Status piši u `art/world-pack-03/STATUS-D80.md` (napravi ga), red posle SVAKE stavke, sa oznakom `D80`.

Ne diraj: `dist/`, `build-sprite-rig.py`, `sprite-rig.json`, `game.js`, `sync-world.py`, druge `STATUS-*` fajlove, postojeće slike, tuđe foldere klipova, git. Paralelno rade druge Codex sesije (D76–D79): ne diraj njihove fajlove; svoje skripte zovi `export-dopuna80.py` i `verify-dopuna80.py`.

## Uzori (`art/world-pack-03/uzori-d80/`)

- `stil-prop-drvo-hrast.png`, `stil-prop-svetiliste.png`, `stil-prop-run-kamen.png`, `stil-prop-panj.png`, `stil-prop-pecurke.png`, `stil-prop-paprat.png`: rekviziti šume iz igre. **Uzor rukopisa, boja i svetla** (topla svetlost sleva, slikano, mat, jasna tamna kontura, bez crnih senki).
- `pas-idle-kadar0.png`: ratni pas iz igre (ćelija 512×512, šape na y=488, visok 192 px): uzor rukopisa i mere za životinju. `sarac-stoji-kadar0.png`: konj u istoj meri (382 px), da srna ne ispadne veća od konja.

## VAŽNO: pozadina je LJUBIČASTA, ne zelena

Sve u ovoj dopuni je zeleno ili ima zelenog (lišće, trave, mahovina), pa se crta na ravnoj **jarko ljubičastoj #ff00ff** pozadini i ključ skida ljubičastu. Posle skidanja pogledaj sliku na plavoj I na beloj podlozi: ne sme ostati ljubičast rub, a u predmetu ne sme biti rupica.

## Deo 1: rekviziti (slike 1536×1024, providna pozadina, u `art/world-pack-03/<ime>.png`)

Predmet gledan sa strane, blago odozgo, zauzima skoro ceo okvir, **donja ivica predmeta leži na dnu okvira**; bez tla, senke na zemlji, ljudi i teksta. Najviše tri pokušaja po slici.

| Ime | Šta se vidi |
|---|---|
| `prop-zapis-hrast` | Zapis: star, debeo hrast sa krstom urezanim u koru u visini grudi, oko stabla vezan crven tkani peškir, u podnožju kamen sa voštanicom i nekoliko poljskih cvetova. Krošnja široka, jesenje zlatna i zelena. |
| `prop-izvor` | Planinski izvor: iz kamena obraslog mahovinom ističe voda kroz drveni žleb u izdubljeno drveno korito (dovoljno dugo da iz njega piju dva konja), oko njega paprat i oblutci. Širok, nizak predmet. |
| `prop-koliba` | Lovačka koliba od brvana i kore, nizak krov od šindre i mahovine, na zidu okačeni rogovi i luk, pred vratima panj sa zabodenom sekirom. |

## Deo 2: trave koje vila bere (jedna traka)

`bilje-miroc`: klip od **5 ćelija 512×512 u jednom redu, bez animacije** (svaka ćelija druga biljka), u `art/animation-pack-04/assets/bilje-miroc/` (isti raspored fajlova kao kod klipova: `atlas.png`, `manifest.json` sa `frame_layout`, `frames/motion/frame-N.png`, `qa.json`). Svaka biljka je na sredini ćelije, visoka oko 300 px, koren na y=488, sa busenom zemlje i lišćem; lepa, jasna, da se razlikuje izdaleka:
0. žalfija (sivozeleni listovi, ljubičasti cvetići u klasu);
1. ranilist (ružičasti cvetovi u pršljenovima, nazubljeni listovi);
2. hajdučka trava (beli štitasti cvat, perasti listovi);
3. kantarion (žuti cvetovi sa pet latica);
4. srdačica (tamnoružičasti cvetići uz visoku stabljiku, režnjeviti listovi).

## Deo 3: srna (dva klipa)

Pravila ćelije i izvoza kao u `DOPUNA-65.md` (ćelija 512×512, margina 24 px, mreža u jednom `image_gen` pozivu, ali na LJUBIČASTOJ pozadini), u `art/animation-pack-04/assets/<klip>/`. Srna gleda udesno, papci na y=488, na istom mestu u ćeliji; visina u grebenu oko 210 px (sa glavom oko 280 px). Prvo napravi `srna-pase`, pa njen kadar 0 koristi kao uzor lika za `srna-bezi`.

| Klip | Kadrova | Petlja | Šta se vidi |
|---|---|---|---|
| `srna-pase` | 6 | da | Srna pase: glava dole u travi, žvaće, trgne uhom, digne glavu i osluškuje, pa opet spusti. Kadar 5 se pretapa u 0. |
| `srna-bezi` | 8 | da | Ista srna beži u skokovima udesno: odraz, let sa skupljenim nogama, doskok, beli rep podignut. Kadar 7 se pretapa u 0. |
