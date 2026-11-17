# D64 - zastava Srbije i strelac koji puca uvis

- D64 | zastava-srbije-vijori | IZVEZENO | 1 pokusaj | prihvacen pokusaj 1; 8 kadrova, petlja; uredjen uzor zastave Srbije i stari barjak, tkanina bez koplja, ivica uz koplje fiksirana na x=40 od y=156 do y=356, bez zelenih piksela, provereni boje, stit i orao.
- D64 | archer-uvis | IZVEZENO | 1 pokusaj | prihvacen pokusaj 1; 6 kadrova, jednokratna animacija; uredjen uzor strelca sa identitetom, merom, lukom i tobolcem iz uzora, poze dizanja luka, punog poteza, odapinjanja i povratka; strele u letu nisu crtane. Zbog pravila margine 24 px ceo klip je pomeren 2 px naviše, pa je donja ivica tela na y=488 (D63 sigurnosni baseline), umesto y=490.

## D64 - zavrsni pregled

- D64 | Zavrsena oba klipa redom, ukupno 14 kadrova. Svaki izvezeni klip ima atlas.png, manifest.json, frames/motion/frame-N.png, preview.gif, qa.json, identity-size-comparison.png i contact.png.
- D64 | Koriscen ugradjeni image_gen kao uredjivanje uzora. Mreze su sacuvane u sources/<klip>/attempt-1/grid.png, uz prompt.txt, review.json i tehnicke QA podatke.
- D64 | Prilagodjeni postupci: export-dopuna64.py i verify-dopuna64.py. Zavrsna komanda `python art/world-pack-03/verify-dopuna64.py`: PASS za oba klipa; alpha, margine najmanje 24 px, baseline, nula zelenih piksela, atlas, GIF, frame_layout, loop i JSON provereni.
- D64 | Nije dirano: dist/, build-sprite-rig.py, sprite-rig.json, game.js, drugi STATUS fajlovi i git.

## D64 - ponavljanje v2 (17. 11.)

- D64 | zastava-srbije-vijori | PONOVO IZVEZENO | attempt-2, 1 novi pokusaj | attempt-1 odbijen i sklonjen iz assets/ jer je imao pogresnu modernu trobojku. Attempt-2 prihvacen: 8 kadrova, petlja; carski barjak iz doba cara Dusana, crveno-belo-crveno, ceo crveni dvoglavi orao u belom polju, tamni porub uz koplje i zlatna resa uz slobodni kraj. Ivica x=40, y=156..356, bez zelene i sa marginom 40 px.
- D64 | archer-uvis | PONOVO IZVEZENO | attempt-2, 1 novi pokusaj | attempt-1 odbijen i sklonjen iz assets/ jer su kadrovi 2 i 3 gadjali skoro vodoravno. Attempt-2 prihvacen: 6 kadrova, jednokratna animacija; kadar 2 i 3 jasno ciljaju strmo uvis, `aimDeg=60`, podignuta leva ruka/lakat, pogled i telo ka nebu, bez strela u letu. Identitet, velicina, luk, tobolac, baseline y=488 i margina najmanje 24 px provereni.
- D64 | v2 zavrsna provera | PASS | `python art/world-pack-03/verify-dopuna64.py` prosao za oba klipa: alpha, margine, nula zelenih piksela, aimDeg, atlas, GIF, frame_layout, loop i JSON. Attempt-3 nije bio potreban.

## D64 - ponavljanje v3 (17. 11.)

- D64 | zastava-srbije-vijori | PONOVO IZVEZENO | attempt-3, 1 novi pokusaj | attempt-2 odbijen i sklonjen iz assets/ jer nije odgovarao izgledu barjaka iz glavnog menija. Attempt-3 prihvacen: 8 kadrova, petlja; tamnocrvena prava svilena tkanina sa mekim naborima, svetlijim gornjim i tamnijim donjim delom, dve zlatne trake sa krsticima, zlatni vez uz koplje, ceo stit sa orlom i lastin rep sa dva kraka i zlatnim rubom. Ivica x=40, y=156..356, bez zelene, margina 40 px.
- D64 | archer-uvis | NEPROMENJEN | prihvacen attempt-2 ostavljen netaknut, prema zahtevu.
- D64 | v3 zavrsna provera | PASS | `python art/world-pack-03/verify-dopuna64.py` prosao za oba klipa: alpha, margine, nula zelenih piksela, aimDeg, atlas, GIF, frame_layout, loop i JSON. Attempt-4 nije bio potreban.
